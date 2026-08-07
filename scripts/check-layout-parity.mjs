#!/usr/bin/env node
/**
 * Compare layout metrics and console errors: main (:8765) vs play (:8766).
 *
 * Usage (both dev servers must be running):
 *   npm run check:layout-parity
 *   node scripts/check-layout-parity.mjs
 *
 * Exit 0 when all metric deltas are within tolerance and play has no
 * unexpected console errors beyond main.
 */

import { chromium } from 'playwright';

const MAIN = process.env.LAYOUT_MAIN_URL || 'http://127.0.0.1:8765';
const PLAY = process.env.LAYOUT_PLAY_URL || 'http://127.0.0.1:8766';
const TOLERANCE_PX = Number(process.env.LAYOUT_TOLERANCE_PX || 1);

const CASES = [
  { label: 'home', path: '/' },
  { label: 'home resting', path: '/?resting=1' },
  { label: 'education', path: '/work/education.html' },
  { label: 'origins', path: '/about/origins.html' },
];

const VIEWPORTS = [
  { label: '1370', width: 1370, height: 900 },
  { label: '390', width: 390, height: 844 },
];

const METRIC_ROWS = [
  { id: 'header.height', label: 'header height' },
  { id: 'header.top', label: 'header top' },
  { id: 'hero.top', label: 'hero top' },
  { id: 'hero.height', label: 'hero height' },
  { id: 'main.top', label: 'main top' },
  { id: 'footer.top', label: 'footer top' },
  { id: 'scrollHeight', label: 'scroll height' },
];

const EXPECTED_NOISE = [
  /_vercel\//i,
  /speed-insights/i,
  /vercel speed insights/i,
  /vercel web analytics/i,
  /Failed to load resource/i,
  /net::ERR_/i,
];

function isExpectedNoise(message) {
  return EXPECTED_NOISE.some((re) => re.test(message));
}

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function formatNum(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(1);
}

function formatDelta(delta) {
  if (delta == null || Number.isNaN(delta)) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}`;
}

async function probe(baseUrl, path, viewport) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  const errors = [];

  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    function rect(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10,
      };
    }

    return {
      header: rect('.cx-header.site-header'),
      hero: rect('.cx-hero'),
      main: rect('main'),
      footer: rect('footer.site-footer, .site-footer, .cx-footer.site-footer'),
      scrollHeight: document.documentElement.scrollHeight,
      mainChildCount: document.querySelector('main')?.childElementCount ?? null,
    };
  });

  await browser.close();

  return {
    metrics,
    errors: errors.filter((e) => !isExpectedNoise(e)),
  };
}

async function ensureServer(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(`Cannot reach ${url} (${err.message}). Start dev servers first.`);
  }
}

function pad(str, width) {
  const s = String(str);
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

async function main() {
  await ensureServer(MAIN);
  await ensureServer(PLAY);

  const rows = [];
  const consoleIssues = [];
  let failures = 0;

  for (const vp of VIEWPORTS) {
    for (const testCase of CASES) {
      const [main, play] = await Promise.all([
        probe(MAIN, testCase.path, vp),
        probe(PLAY, testCase.path, vp),
      ]);

      const playOnlyErrors = play.errors.filter((e) => !main.errors.includes(e));
      if (playOnlyErrors.length) {
        consoleIssues.push({
          case: testCase.label,
          viewport: vp.label,
          errors: playOnlyErrors,
        });
      }

      for (const metric of METRIC_ROWS) {
        const mainVal = getNested(main.metrics, metric.id);
        const playVal = getNested(play.metrics, metric.id);
        let delta = null;
        let status = 'OK';

        if (mainVal == null && playVal == null) {
          status = 'skip';
        } else if (mainVal == null || playVal == null) {
          status = 'FAIL';
          failures += 1;
        } else {
          delta = playVal - mainVal;
          if (Math.abs(delta) > TOLERANCE_PX) {
            status = 'FAIL';
            failures += 1;
          }
        }

        rows.push({
          case: testCase.label,
          viewport: vp.label,
          metric: metric.label,
          main: mainVal,
          play: playVal,
          delta,
          status,
        });
      }

      const mainCount = main.metrics.mainChildCount;
      const playCount = play.metrics.mainChildCount;
      if (mainCount != null && playCount != null && mainCount !== playCount) {
        rows.push({
          case: testCase.label,
          viewport: vp.label,
          metric: 'main children',
          main: mainCount,
          play: playCount,
          delta: playCount - mainCount,
          status: 'FAIL',
        });
        failures += 1;
      }
    }
  }

  console.log(`Layout parity: main (${MAIN}) vs play (${PLAY})`);
  console.log(`Tolerance: ±${TOLERANCE_PX}px (metrics); console: play-only unexpected errors fail\n`);

  const header =
    `${pad('Page', 16)} ${pad('Vp', 5)} ${pad('Metric', 16)} ` +
    `${pad('Main', 8)} ${pad('Play', 8)} ${pad('Δ', 8)} Status`;
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const row of rows) {
    if (row.status === 'skip') continue;
    console.log(
      `${pad(row.case, 16)} ${pad(row.viewport, 5)} ${pad(row.metric, 16)} ` +
        `${pad(formatNum(row.main), 8)} ${pad(formatNum(row.play), 8)} ` +
        `${pad(formatDelta(row.delta), 8)} ${row.status}`
    );
  }

  if (consoleIssues.length) {
    failures += consoleIssues.length;
    console.log('\nConsole errors (play only, after filtering Vercel 404 noise):');
    for (const issue of consoleIssues) {
      for (const err of issue.errors) {
        console.log(`  • ${issue.case} @ ${issue.viewport}px: ${err}`);
      }
    }
  } else {
    console.log('\nConsole: no play-only unexpected errors');
  }

  console.log(`\nResult: ${failures === 0 ? 'PASS' : `FAIL (${failures} issue(s))`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
