#!/usr/bin/env bun
/**
 * Print about/briefing.html to assets/briefing/andrew-sheerin-portfolio-briefing.pdf
 */

import { mkdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';
import { SITE_ORIGIN } from './public-pages.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = join(ROOT, 'assets/briefing');
const OUT_PDF = join(OUT_DIR, 'andrew-sheerin-portfolio-briefing.pdf');
const BRIEFING_HTML = join(ROOT, 'about/briefing.html');
const BRIEFING_PAGE_URL = `${SITE_ORIGIN}/about/briefing.html`;

async function rewriteLinksForPdf(page) {
  await page.evaluate((pageUrl) => {
    const base = new URL(pageUrl);
    document.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return;
      anchor.setAttribute('href', new URL(href, base).href);
    });
  }, BRIEFING_PAGE_URL);
}

export async function buildBriefingPdf() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(BRIEFING_HTML).href, { waitUntil: 'networkidle' });
    await rewriteLinksForPdf(page);
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: OUT_PDF,
      format: 'A4',
      printBackground: false,
      margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
    });
    console.log('Wrote assets/briefing/andrew-sheerin-portfolio-briefing.pdf');
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  buildBriefingPdf().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
