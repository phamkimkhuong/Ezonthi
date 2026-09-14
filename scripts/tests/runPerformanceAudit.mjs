import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const baseUrl = (process.env.PERF_BASE_URL || 'https://ezonthi.com').replace(/\/$/, '');
const runs = Math.max(1, Number(process.env.PERF_RUNS || 3));
const outputDirectory = path.join(process.cwd(), 'docs', 'performance');
const targets = [
  {
    id: 'landing',
    label: 'Trang đầu',
    url: `${baseUrl}/`,
    budgets: { performance: 0.75, lcpMs: 3500, tbtMs: 300, transferBytes: 1_200_000 }
  },
  {
    id: 'lesson',
    label: 'Bài học Anh 11',
    url: `${baseUrl}/app/grade11/english/question-types/eng11-qt-u5-reading`,
    budgets: { performance: 0.65, lcpMs: 4500, tbtMs: 500, transferBytes: 3_000_000 }
  }
];

const chromePaths = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);
const chromePath = chromePaths.find(candidate => {
  try {
    return candidate && requireFile(candidate);
  } catch {
    return false;
  }
});

function requireFile(candidate) {
  try {
    return Boolean(process.getBuiltinModule('fs').statSync(candidate).isFile());
  } catch {
    return false;
  }
}

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const auditValue = (lhr, id) => Number(lhr.audits[id]?.numericValue || 0);
const chrome = await launch({
  chromePath,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
});

const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    formFactor: 'mobile',
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      requestLatencyMs: 562.5,
      downloadThroughputKbps: 1474.56,
      uploadThroughputKbps: 675,
      cpuSlowdownMultiplier: 4
    },
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }
  }
};

const results = [];
try {
  for (const target of targets) {
    const samples = [];
    for (let run = 1; run <= runs; run += 1) {
      console.log(`[${target.id}] Lighthouse ${run}/${runs}: ${target.url}`);
      const result = await lighthouse(target.url, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error'
      }, config);
      if (!result) throw new Error(`Lighthouse không trả kết quả cho ${target.url}`);
      const lhr = result.lhr;
      samples.push({
        performance: lhr.categories.performance.score ?? 0,
        fcpMs: auditValue(lhr, 'first-contentful-paint'),
        lcpMs: auditValue(lhr, 'largest-contentful-paint'),
        speedIndexMs: auditValue(lhr, 'speed-index'),
        tbtMs: auditValue(lhr, 'total-blocking-time'),
        cls: auditValue(lhr, 'cumulative-layout-shift'),
        transferBytes: auditValue(lhr, 'total-byte-weight'),
        finalUrl: lhr.finalDisplayedUrl
      });
    }
    const metrics = Object.fromEntries(
      ['performance', 'fcpMs', 'lcpMs', 'speedIndexMs', 'tbtMs', 'cls', 'transferBytes']
        .map(key => [key, median(samples.map(sample => sample[key]))])
    );
    const passed = metrics.performance >= target.budgets.performance
      && metrics.lcpMs <= target.budgets.lcpMs
      && metrics.tbtMs <= target.budgets.tbtMs
      && metrics.transferBytes <= target.budgets.transferBytes;
    results.push({ ...target, samples, median: metrics, passed });
  }
} finally {
  await chrome.kill();
}

const report = {
  measuredAt: new Date().toISOString(),
  baseUrl,
  targetProfile: {
    device: 'Android tầm trung, viewport 412×823 @1.75x',
    network: 'Slow 4G simulated: RTT 150 ms, download 1.6 Mbps, upload 675 Kbps',
    cpu: '4x slowdown',
    runs
  },
  results
};
await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(path.join(outputDirectory, 'phase3-baseline.json'), `${JSON.stringify(report, null, 2)}\n`);

const formatMs = value => `${Math.round(value)} ms`;
const formatBytes = value => `${(value / 1024 / 1024).toFixed(2)} MB`;
const rows = results.map(result =>
  `| ${result.label} | ${Math.round(result.median.performance * 100)} | ${formatMs(result.median.fcpMs)} | ${formatMs(result.median.lcpMs)} | ${formatMs(result.median.tbtMs)} | ${result.median.cls.toFixed(3)} | ${formatBytes(result.median.transferBytes)} | ${result.passed ? 'Đạt' : 'Chưa đạt'} |`
).join('\n');
const markdown = `# Baseline hiệu năng Đợt 3\n\n- Đo lúc: ${report.measuredAt}\n- Host: ${baseUrl}\n- Thiết bị: ${report.targetProfile.device}, ${report.targetProfile.cpu}\n- Mạng: ${report.targetProfile.network}\n- Mẫu: median của ${runs} lần đo độc lập mỗi trang\n\n| Trang | Performance | FCP | LCP | TBT | CLS | Tải xuống | Ngân sách |\n|---|---:|---:|---:|---:|---:|---:|---|\n${rows}\n\nNgân sách trang đầu: score ≥75, LCP ≤3.5s, TBT ≤300ms, tải xuống ≤1.2MB. Ngân sách bài học: score ≥65, LCP ≤4.5s, TBT ≤500ms, tải xuống ≤3MB.\n`;
await fs.writeFile(path.join(outputDirectory, 'phase3-baseline.md'), markdown);
console.log(markdown);

if (process.env.PERF_ENFORCE === '1' && results.some(result => !result.passed)) process.exitCode = 1;
