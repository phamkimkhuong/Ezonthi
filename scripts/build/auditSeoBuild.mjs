import fs from 'node:fs';
import path from 'node:path';
import { loadSeoCatalog } from '../validators/lib/loadSeoCatalog.mjs';

const DOMAIN = 'https://ezonthi.com';
const DIST_DIR = path.join(process.cwd(), 'dist');
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

if (!fs.existsSync(SITEMAP_PATH) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  throw new Error('Cần chạy npm run build trước khi audit SEO.');
}

const { questionTypes, landingPages } = await loadSeoCatalog();
const normalize = route => route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}/`;
const expectedRoutes = new Set([
  ...landingPages.map(page => normalize(page.route)),
  '/about/',
  '/premium/',
  '/support/',
  ...questionTypes.map(item => `/question-types/${item.id}/`)
]);

const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
const locations = sitemap.split('<loc>').slice(1).map(chunk => chunk.split('</loc>')[0]);
const sitemapRoutes = locations.map(location => new URL(location).pathname);
const actualRoutes = new Set(sitemapRoutes);
const errors = [];

if (locations.length !== actualRoutes.size) errors.push('Sitemap có URL trùng lặp.');
if (locations.some(location => !location.startsWith(DOMAIN))) errors.push('Sitemap có URL ngoài domain chính.');
if (sitemapRoutes.some(route => route.includes('/practice/') || route.startsWith('/dashboard/'))) {
  errors.push('Sitemap chứa trang ứng dụng/noindex.');
}

const omitted = [...expectedRoutes].filter(route => !actualRoutes.has(route));
const invalid = [...actualRoutes].filter(route => !expectedRoutes.has(route));
if (omitted.length) errors.push(`Thiếu ${omitted.length} URL hợp lệ trong sitemap.`);
if (invalid.length) errors.push(`Có ${invalid.length} URL không thuộc registry trong sitemap.`);

function fileForRoute(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, ...route.replace(/^\/+|\/+$/g, '').split('/'), 'index.html');
}

for (const route of expectedRoutes) {
  const file = fileForRoute(route);
  if (!fs.existsSync(file)) {
    errors.push(`Thiếu HTML: ${route}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<h1')) errors.push(`Trang không có H1: ${route}`);
  if (!html.includes('data-seo-static')) errors.push(`Trang không có nội dung prerender: ${route}`);
  if (!html.includes(`<link rel="canonical" href="${DOMAIN}${route}"`)) errors.push(`Sai canonical: ${route}`);
  if (!html.includes('<meta name="robots" content="index, follow"')) errors.push(`Trang indexable thiếu robots index: ${route}`);
}

for (const item of questionTypes) {
  const practiceRoute = `/practice/${item.id}/`;
  const html = fs.readFileSync(fileForRoute(practiceRoute), 'utf8');
  if (!html.includes('<meta name="robots" content="noindex, follow"')) errors.push(`Practice chưa noindex: ${item.id}`);
  if (!html.includes(`<link rel="canonical" href="${DOMAIN}/question-types/${item.id}/"`)) errors.push(`Practice sai canonical: ${item.id}`);
}

const notFound = path.join(DIST_DIR, '404.html');
if (!fs.existsSync(notFound) || !fs.readFileSync(notFound, 'utf8').includes('noindex, nofollow')) {
  errors.push('Thiếu trang 404 noindex.');
}

if (errors.length) {
  console.error(errors.slice(0, 30).join('\n'));
  if (errors.length > 30) console.error(`... và ${errors.length - 30} lỗi khác.`);
  process.exit(1);
}

console.log(`✅ SEO audit đạt: ${expectedRoutes.size} URL indexable, ${questionTypes.length} practice noindex, 0 URL thiếu/sai.`);
