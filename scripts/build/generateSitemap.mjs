import fs from 'node:fs';
import path from 'node:path';
import { loadSeoCatalog } from '../validators/lib/loadSeoCatalog.mjs';

const DOMAIN = 'https://ezonthi.com';
const monetizationEnabled = /export\s+const\s+MONETIZATION_ENABLED\s*=\s*true\b/.test(
  fs.readFileSync(path.join(process.cwd(), 'src', 'utils', 'premium.ts'), 'utf8')
);
const PUBLIC_ROUTES = monetizationEnabled ? ['/about/', '/premium/', '/support/'] : ['/about/', '/support/'];

const xmlEscape = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

console.log('🌐 Đang tạo sitemap từ registry dữ liệu thật...');

const { questionTypes, landingPages } = await loadSeoCatalog();
const routes = new Set([
  ...landingPages.map(page => page.route),
  ...PUBLIC_ROUTES,
  ...questionTypes.map(item => `/question-types/${item.id}/`)
]);

const urls = [...routes].sort((a, b) => {
  if (a === '/') return -1;
  if (b === '/') return 1;
  return a.localeCompare(b);
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.flatMap(route => [
    '  <url>',
    `    <loc>${xmlEscape(`${DOMAIN}${route}`)}</loc>`,
    '  </url>'
  ]),
  '</urlset>',
  ''
].join('\n');

const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`✅ sitemap.xml: ${urls.length} URL indexable (${questionTypes.length} dạng bài hợp lệ).`);
