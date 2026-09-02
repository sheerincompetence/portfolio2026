#!/usr/bin/env bun
/**
 * Build llms/*.md mirrors, llms.txt, and sitemap.xml from public HTML pages.
 *
 * Usage:
 *   bun run build:llms
 *   bun scripts/build-llms.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { parseHTML } from 'linkedom';
import { PUBLIC_PAGES, PUBLIC_ASSETS, SITE_ORIGIN } from './public-pages.mjs';
import { buildBriefingPdf } from './build-briefing-pdf.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const LLMS_DIR = join(ROOT, 'llms');
const BRIEFING_ASSETS_DIR = join(ROOT, 'assets/briefing');
const BRIEFING_MD = join(BRIEFING_ASSETS_DIR, 'andrew-sheerin-portfolio-briefing.md');
const CHROME_SELECTORS = [
  'script',
  'style',
  'svg',
  'nav',
  'button',
  'input',
  'dialog',
  'iframe',
  '.skip-link',
  '.case-interior-jumps',
  '.depth-jumps',
  '.section--rule',
  '.case-back-top',
  '.cx-ai-ticker',
  '.cx-slider',
  '.cx-hero__venn',
  '.cx-hero__bg',
  '.cx-complex-only',
  '.cx-hero__title-complex',
  '#rest-panel',
  '.chaos-cookie',
  '.cx-judgement',
  '.play-ribbon',
  '.case-interior-hero__index',
  '.story-sec',
  '.story-threshold',
  '.case-intro__threshold',
  '.work-card__image',
  '.work-card__number',
  '.work-depth__image',
  '.work-depth__mark',
  '.work-depth__whisper-arrow',
  '[aria-hidden="true"]',
  '[hidden]',
].join(',');

function cleanText(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeDash(text) {
  return text.replace(/\u2014/g, '-').replace(/\u2013/g, '-');
}

function readMeta(document) {
  const title = document.querySelector('title')?.textContent?.trim() || 'Untitled';
  const description =
    document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  return { title: normalizeDash(title), description: normalizeDash(description) };
}

function stripChrome(root) {
  root.querySelectorAll(CHROME_SELECTORS).forEach((node) => node.remove());
}

function prepareWorkMain(main) {
  const grid = main.querySelector('.work-grid');
  if (grid) {
    const ul = main.ownerDocument.createElement('ul');
    grid.querySelectorAll('.work-card').forEach((card) => {
      const li = main.ownerDocument.createElement('li');
      const title = card.querySelector('.work-card__title')?.textContent?.trim();
      const thesis = card.querySelector('.work-card__thesis')?.textContent?.trim();
      if (title) {
        const h2 = main.ownerDocument.createElement('h2');
        h2.textContent = title;
        li.appendChild(h2);
      }
      if (thesis) {
        const p = main.ownerDocument.createElement('p');
        p.textContent = thesis;
        li.appendChild(p);
      }
      ul.appendChild(li);
    });
    grid.replaceWith(ul);
  }

  const depthLink = main.querySelector('.work-depth__link');
  if (depthLink) {
    const section = main.ownerDocument.createElement('section');
    const eyebrow = depthLink.querySelector('.work-depth__eyebrow')?.textContent?.replace(/\s+/g, ' ').trim();
    const lead = depthLink.querySelector('.work-depth__lead')?.textContent?.trim();
    const hinge = depthLink.querySelector('.work-depth__hinge')?.textContent?.trim();
    const whisper = depthLink.querySelector('.work-depth__whisper')?.textContent?.replace(/→\s*/, '').trim();
    if (eyebrow) {
      const p = main.ownerDocument.createElement('p');
      p.textContent = eyebrow;
      section.appendChild(p);
    }
    if (lead) {
      const h2 = main.ownerDocument.createElement('h2');
      h2.textContent = lead;
      section.appendChild(h2);
    }
    for (const text of [hinge, whisper]) {
      if (!text) continue;
      const p = main.ownerDocument.createElement('p');
      p.textContent = text;
      section.appendChild(p);
    }
    depthLink.closest('.work-depth')?.replaceWith(section);
  }
}

function prepareBriefingMain(main) {
  stripChrome(main);
  main.querySelector('.about-mast__media')?.remove();
  main.querySelector('.briefing-meta')?.remove();
  main.querySelector('.about-rail-bar')?.remove();
}

function prepareHomeMain(main, meta) {
  stripChrome(main);
  const hero = main.querySelector('.cx-hero');
  if (hero) {
    hero.innerHTML = '';
    const h1 = main.ownerDocument.createElement('h1');
    h1.textContent = meta.description || 'I translate ideas into understanding';
    hero.appendChild(h1);
    const desc = main.ownerDocument.createElement('p');
    desc.textContent =
      'Product design leader working across editorial AI systems, behavioural design, and clarity from complexity.';
    hero.appendChild(desc);
  }
  main.querySelectorAll('.cx-hero-rule, .cx-hero ~ :not(.cx-work-rest)').forEach((node) => {
    if (!node.classList?.contains('cx-work-rest')) node.remove();
  });
}

function resolveHref(href, page) {
  if (!href) return '';
  if (/^(https?:|mailto:)/.test(href)) return href;
  const base = new URL(page.url, `${SITE_ORIGIN}/`);
  return new URL(href, base).href;
}

function nodeToMarkdown(node, ctx = { block: true, inList: false, page: null }) {
  if (node.nodeType === 3) {
    return normalizeDash(node.textContent.replace(/\s+/g, ' '));
  }
  if (node.nodeType !== 1) return '';

  const tag = node.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG' || tag === 'NOSCRIPT') return '';

  const childText = () =>
    cleanText(
      Array.from(node.childNodes)
        .map((child) => nodeToMarkdown(child, { ...ctx, block: false }))
        .join('')
    );

  const heading = (level, text) => {
    if (ctx.inList) return `**${text}**`;
    const marks = '#'.repeat(level);
    return `\n\n${marks} ${text}\n\n`;
  };

  switch (tag) {
    case 'H1':
      return heading(1, childText());
    case 'H2':
      return heading(2, childText());
    case 'H3':
      return heading(3, childText());
    case 'H4':
      return heading(4, childText());
    case 'P': {
      const text = childText();
      if (node.classList?.contains('briefing-evidence-label')) {
        return `\n\n**${text}**\n\n`;
      }
      return `\n\n${text}\n\n`;
    }
    case 'BLOCKQUOTE': {
      const text = cleanText(node.textContent.replace(/\s+/g, ' '));
      return text ? `\n\n> ${text}\n\n` : '';
    }
    case 'LI': {
      const text = childText();
      return text ? `\n- ${text}` : '';
    }
    case 'UL':
    case 'OL':
      return `\n${Array.from(node.children)
        .map((child) => nodeToMarkdown(child, { ...ctx, inList: true }))
        .join('')}\n`;
    case 'FIGCAPTION':
    case 'CAPTION':
      return `\n\n*${childText()}*\n\n`;
    case 'IMG': {
      const alt = node.getAttribute('alt')?.trim();
      return alt ? `\n\n[Image: ${normalizeDash(alt)}]\n\n` : '';
    }
    case 'A': {
      const href = node.getAttribute('href') || '';
      const text = childText();
      if (!text) return '';
      if (/^(https?:|mailto:)/.test(href)) {
        return `[${text}](${href})`;
      }
      if (ctx.page) {
        return `[${text}](${resolveHref(href, ctx.page)})`;
      }
      return text;
    }
    case 'STRONG':
    case 'B':
      return `**${childText()}**`;
    case 'EM':
    case 'I':
      return `*${childText()}*`;
    case 'BR':
      return '\n';
    case 'HR':
      return '\n\n---\n\n';
    case 'DT':
      return `\n\n**${childText()}**`;
    case 'DD':
      return `\n${childText()}\n`;
    case 'DL':
    case 'DIV':
    case 'SECTION':
    case 'ARTICLE':
    case 'FIGURE':
    case 'HEADER':
    case 'FOOTER':
    case 'MAIN':
    case 'SPAN':
    case 'TABLE':
    case 'TBODY':
    case 'TR':
    case 'TD':
    case 'TH':
    case 'LABEL':
    case 'SUP':
    case 'SUB':
    case 'SMALL':
      return Array.from(node.childNodes)
        .map((child) => nodeToMarkdown(child, ctx))
        .join('');
    default:
      return childText();
  }
}

function htmlToMarkdown(html, page) {
  const { document } = parseHTML(html);
  const meta = readMeta(document);
  const main = document.querySelector('main#main, main');
  if (!main) {
    throw new Error(`No <main> found in ${page.file}`);
  }

  if (page.slug === 'home') {
    prepareHomeMain(main, meta);
  } else if (page.slug === 'work') {
    prepareWorkMain(main);
    stripChrome(main);
  } else if (page.slug === 'about-briefing') {
    prepareBriefingMain(main);
  } else {
    stripChrome(main);
  }

  const body = cleanText(nodeToMarkdown(main, { page }));
  const canonical = `${SITE_ORIGIN}${page.url}`;
  const lines = [
    `# ${page.label}`,
    '',
    `Source: ${canonical}`,
  ];
  if (meta.description) lines.push(`Description: ${meta.description}`);
  lines.push('', '---', '', body || meta.description || page.summary);
  return { markdown: `${lines.join('\n').trim()}\n`, meta };
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...PUBLIC_PAGES.map((page) => page.url),
    ...PUBLIC_ASSETS.map((asset) => asset.url),
  ];
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${SITE_ORIGIN}${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function buildLlmsTxt(pageResults) {
  const briefing = pageResults.find((page) => page.agentBriefing);
  const pages = pageResults.filter((page) => !page.agentBriefing);

  const lines = [
    '# Andrew Sheerin',
    '',
    '> Product Design Leader. I translate ideas into understanding.',
    '',
    'Plain-text mirrors of the public portfolio for crawlers, ATS tools, and AI agents.',
    'Start with the briefing doc for role-fit assessment; use page mirrors for deeper evidence.',
    '',
  ];

  if (briefing) {
    lines.push('## Briefing (start here)', '');
    lines.push(`- [${briefing.label}](${SITE_ORIGIN}/llms/${briefing.slug}.md): ${briefing.summary}`);
    lines.push(`- [${briefing.label} (HTML)](${SITE_ORIGIN}${briefing.url})`, '');
    lines.push(`- [${briefing.label} (PDF)](${SITE_ORIGIN}/assets/briefing/andrew-sheerin-portfolio-briefing.pdf)`, '');
    lines.push(`- [${briefing.label} (Markdown download)](${SITE_ORIGIN}/assets/briefing/andrew-sheerin-portfolio-briefing.md)`, '');
  }

  lines.push('## Pages', '');

  for (const page of pages) {
    lines.push(
      `- [${page.label}](${SITE_ORIGIN}/llms/${page.slug}.md): ${page.summary}`
    );
  }

  lines.push('', '## CV', '');
  for (const asset of PUBLIC_ASSETS) {
    lines.push(`- [${asset.label}](${SITE_ORIGIN}${asset.url}): ${asset.summary}`);
  }

  lines.push('', '## Optional', '', `- [Sitemap](${SITE_ORIGIN}/sitemap.xml)`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  rmSync(LLMS_DIR, { recursive: true, force: true });
  mkdirSync(LLMS_DIR, { recursive: true });
  mkdirSync(BRIEFING_ASSETS_DIR, { recursive: true });

  const pageResults = PUBLIC_PAGES.map((page) => {
    const htmlPath = join(ROOT, page.file);
    const html = readFileSync(htmlPath, 'utf8');
    const { markdown } = htmlToMarkdown(html, page);
    const outPath = join(LLMS_DIR, `${page.slug}.md`);
    writeFileSync(outPath, markdown);
    if (page.slug === 'about-briefing') {
      writeFileSync(BRIEFING_MD, markdown);
    }
    return page;
  });

  writeFileSync(join(ROOT, 'llms.txt'), buildLlmsTxt(pageResults));
  writeFileSync(join(ROOT, 'sitemap.xml'), buildSitemap());

  console.log(`Wrote ${pageResults.length} files to llms/`);
  console.log('Wrote llms.txt and sitemap.xml');
  console.log('Wrote assets/briefing/andrew-sheerin-portfolio-briefing.md');

  await buildBriefingPdf();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
