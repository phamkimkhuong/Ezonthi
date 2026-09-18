import fs from 'node:fs';
import path from 'node:path';
import { loadSeoCatalog } from '../validators/lib/loadSeoCatalog.mjs';

const DOMAIN = 'https://ezonthi.com';
const DIST_DIR = path.join(process.cwd(), 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Không tìm thấy dist/index.html. Hãy chạy vite build trước!');
  process.exit(1);
}

const htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const { questionTypes, landingPages } = await loadSeoCatalog();

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeJson = value => JSON.stringify(value).replaceAll('<', '\\u003c');

function normalizeRoute(route) {
  if (route === '/') return '/';
  return `/${route.replace(/^\/+|\/+$/g, '')}/`;
}

function canonical(route) {
  return `${DOMAIN}${normalizeRoute(route)}`;
}

function staticShell({ h1, intro, sections = [], links = [] }) {
  const sectionHtml = sections.map(section => `
      <section>
        <h2>${escapeHtml(section.heading)}</h2>
        ${(section.paragraphs || []).map(text => `<p>${escapeHtml(text)}</p>`).join('')}
        ${section.bullets?.length ? `<ul>${section.bullets.map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul>` : ''}
      </section>`).join('');
  const linksHtml = links.length ? `
      <nav aria-label="Nội dung liên quan">
        <h2>Học tiếp trên ezonthi</h2>
        <ul>${links.map(link => `<li><a href="${escapeHtml(normalizeRoute(link.href))}">${escapeHtml(link.label)}</a><span>${escapeHtml(link.description || '')}</span></li>`).join('')}</ul>
      </nav>` : '';

  return `<main data-seo-static>
      <p class="seo-eyebrow">ezonthi · Học đúng trọng tâm</p>
      <h1>${escapeHtml(h1)}</h1>
      <p class="seo-intro">${escapeHtml(intro)}</p>
      ${sectionHtml}
      ${linksHtml}
    </main>`;
}

const staticStyle = `<style id="seo-static-style">
  [data-seo-static]{max-width:960px;margin:0 auto;padding:48px 24px 80px;font-family:"Be Vietnam Pro",Arial,sans-serif;color:#1f2a30;line-height:1.7}
  [data-seo-static] h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.12;margin:12px 0 20px;letter-spacing:-.035em}
  [data-seo-static] h2{font-size:1.35rem;margin:32px 0 10px}
  [data-seo-static] section,[data-seo-static] nav{padding:20px 0;border-top:1px solid #e5e7eb}
  [data-seo-static] p,[data-seo-static] li{font-size:1rem}
  [data-seo-static] .seo-eyebrow{color:#a64216;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.8rem}
  [data-seo-static] .seo-intro{font-size:1.15rem;color:#5e6662;max-width:760px}
  [data-seo-static] ul{padding-left:22px}
  [data-seo-static] nav li{margin:10px 0}
  [data-seo-static] nav a{font-weight:800;color:#174a5b;margin-right:10px}
  [data-seo-static] nav span{color:#5e6662}
</style>`;

function injectSeo(html, { title, description, canonicalUrl, robots = 'index, follow', jsonLd, body }) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonicalUrl);
  let result = html
    .replace(/<title>.*?<\/title>/s, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${escapedDescription}" />`)
    .replace(/<meta name="robots"[\s\S]*?>/i, `<meta name="robots" content="${escapeHtml(robots)}" />`)
    .replace(/<link rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${escapedCanonical}" />`)
    .replace(/<meta property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
    .replace(/<meta property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
    .replace(/<meta property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${escapedCanonical}" />`)
    .replace(/<meta name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${escapedTitle}" />`)
    .replace(/<meta name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${escapedDescription}" />`);

  if (jsonLd) {
    const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const tags = schemas.map(schema => `<script type="application/ld+json">${safeJson(schema)}</script>`).join('\n');
    result = result.replace('</head>', `${tags}\n${staticStyle}\n</head>`);
  } else {
    result = result.replace('</head>', `${staticStyle}\n</head>`);
  }

  const initialLoader = `<div id="app-initial-loader" style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fafaf9;color:#0f172a;font-family:'Be Vietnam Pro',sans-serif;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <img src="/favicon.svg" alt="ezonthi" width="40" height="40" style="border-radius:12px;" />
      <span style="font-size:24px;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">ezonthi</span>
    </div>
    <div style="width:36px;height:36px;border:3px solid rgba(37,99,235,0.15);border-top-color:#2563EB;border-radius:50%;animation:ez-spin 0.8s linear infinite;"></div>
    <style>
      @keyframes ez-spin{to{transform:rotate(360deg)}}
      @media (prefers-color-scheme: dark){
        #app-initial-loader{background:#0b0f17!important;color:#f8fafc!important}
        #app-initial-loader span{color:#f8fafc!important}
      }
    </style>
  </div>`;

  return result.replace(/<div id="root">[\s\S]*?<\/div>(?=\s*<\/body>)/i, `<div id="root"><noscript><style>#app-initial-loader{display:none!important}</style>${body}</noscript>${initialLoader}</div>`);
}

function writePage(route, html) {
  const relative = normalizeRoute(route).replace(/^\/+|\/+$/g, '');
  const targetDir = relative ? path.join(DIST_DIR, ...relative.split('/')) : DIST_DIR;
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonical(item.route)
    }))
  };
}

const publicPages = [
  ...landingPages,
  {
    route: '/about/',
    title: 'Giới thiệu nền tảng học tập ezonthi',
    description: 'Tìm hiểu cách ezonthi tổ chức lý thuyết, dạng bài, luyện tập, sổ lỗi sai và lộ trình học cho học sinh lớp 9 đến lớp 11.',
    h1: 'Giới thiệu nền tảng ezonthi',
    intro: 'ezonthi giúp học sinh học kiến thức và luyện tập theo từng dạng bài trong cùng một trải nghiệm.',
    sections: [{ heading: 'Học theo tiến độ của chính em', paragraphs: ['Dữ liệu học tập được tổ chức theo lớp, môn, chương và dạng bài để học sinh biết mình cần học gì tiếp theo.'] }],
    links: [
      { label: 'Ôn thi vào 10', href: '/on-thi-vao-10/', description: 'Xem lộ trình dành cho học sinh lớp 9.' },
      { label: 'Ôn tập lớp 10', href: '/lop-10/', description: 'Xem các môn học lớp 10.' },
      { label: 'Ôn tập lớp 11', href: '/lop-11/', description: 'Xem các môn học lớp 11.' }
    ]
  },
  {
    route: '/premium/',
    title: 'Gói học tập Premium | ezonthi',
    description: 'Tìm hiểu quyền lợi gói Premium trên ezonthi dành cho học sinh muốn mở rộng lộ trình và nội dung luyện tập.',
    h1: 'Gói học tập Premium trên ezonthi',
    intro: 'So sánh quyền lợi trước khi lựa chọn gói học phù hợp với nhu cầu.',
    sections: [{ heading: 'Chỉ nâng cấp khi em cần', paragraphs: ['Học sinh vẫn có thể tìm hiểu lộ trình và nội dung nền tảng trước khi quyết định nâng cấp.'] }],
    links: [{ label: 'Xem lộ trình', href: '/roadmap/', description: 'Kiểm tra nội dung học hiện có.' }]
  },
  {
    route: '/support/',
    title: 'Hỗ trợ và góp ý | ezonthi',
    description: 'Liên hệ hỗ trợ, báo lỗi nội dung hoặc gửi góp ý cải thiện nền tảng học tập ezonthi.',
    h1: 'Hỗ trợ và góp ý cho ezonthi',
    intro: 'Gửi thông tin rõ ràng về môn, lớp và câu hỏi để đội ngũ có thể kiểm tra nhanh hơn.',
    sections: [{ heading: 'Khi báo lỗi nội dung', paragraphs: ['Hãy cho biết tên dạng bài, nội dung câu hỏi và điểm em thấy chưa hợp lý.'] }],
    links: [{ label: 'Về trang chủ', href: '/', description: 'Quay lại chọn lộ trình học.' }]
  }
];

for (const page of publicPages) {
  const route = normalizeRoute(page.route);
  const body = staticShell({ h1: page.h1, intro: page.intro, sections: page.sections, links: page.links });
  writePage(route, injectSeo(htmlTemplate, {
    title: page.title,
    description: page.description,
    canonicalUrl: canonical(route),
    body,
    jsonLd: breadcrumb([
      { name: 'Trang chủ', route: '/' },
      ...(route === '/' ? [] : [{ name: page.h1, route }])
    ])
  }));
}

const subjectLanding = key => {
  const map = {
    'g9-math': '/on-thi-vao-10/toan/',
    'g9-english': '/on-thi-vao-10/tieng-anh/',
    'g10-math': '/lop-10/toan/',
    'g10-english': '/lop-10/tieng-anh/',
    'g10-physics': '/lop-10/vat-ly/',
    'g10-chemistry': '/lop-10/hoa-hoc/',
    'g10-biology': '/lop-10/sinh-hoc/',
    'g10-history': '/lop-10/lich-su/',
    'g11-math': '/lop-11/toan/',
    'g11-english': '/lop-11/tieng-anh/',
    'g11-physics': '/lop-11/vat-ly/',
    'g11-chemistry': '/lop-11/hoa-hoc/',
    'g11-biology': '/lop-11/sinh-hoc/'
  };
  return map[key] || '/roadmap/';
};

for (const item of questionTypes) {
  const route = `/question-types/${item.id}/`;
  const title = `${item.name} – ${item.subject} ${item.grade} | ezonthi`;
  const description = `${item.description} Xem kiến thức cần nhớ, dấu hiệu nhận biết, lỗi thường gặp và luyện tập dạng ${item.name} trên ezonthi.`.slice(0, 300);
  const sections = [
    ...(item.theory.length ? [{ heading: 'Kiến thức cần nhớ', paragraphs: item.theory.slice(0, 8) }] : []),
    ...(item.recognitionSigns.length ? [{ heading: 'Dấu hiệu nhận biết', paragraphs: [], bullets: item.recognitionSigns.slice(0, 8) }] : []),
    ...(item.solvingSteps.length ? [{ heading: 'Các bước làm bài', paragraphs: [], bullets: item.solvingSteps.slice(0, 8) }] : []),
    ...(item.commonMistakes.length ? [{ heading: 'Lỗi thường gặp', paragraphs: [], bullets: item.commonMistakes.slice(0, 8) }] : [])
  ];
  const body = staticShell({
    h1: item.name,
    intro: `${item.subject} ${item.grade}. ${item.description}`,
    sections,
    links: [
      { label: `Xem nội dung ${item.subject} ${item.grade}`, href: subjectLanding(item.subjectKey), description: 'Quay lại trang môn học.' },
      { label: 'Luyện dạng bài này', href: `/practice/${item.id}/`, description: 'Làm câu hỏi sau khi đã đọc lý thuyết.' }
    ]
  });
  const schemas = [
    breadcrumb([
      { name: 'Trang chủ', route: '/' },
      { name: `${item.subject} ${item.grade}`, route: subjectLanding(item.subjectKey) },
      { name: item.name, route }
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: item.name,
      description: item.description,
      educationalLevel: item.grade,
      teaches: item.name,
      inLanguage: 'vi',
      url: canonical(route)
    }
  ];
  writePage(route, injectSeo(htmlTemplate, { title, description, canonicalUrl: canonical(route), body, jsonLd: schemas }));

  const practiceRoute = `/practice/${item.id}/`;
  const practiceBody = staticShell({
    h1: `Luyện tập: ${item.name}`,
    intro: `Phần làm bài tương tác cho dạng ${item.name}. Hãy đọc kiến thức và phương pháp trước khi luyện tập.`,
    links: [{ label: 'Đọc lý thuyết dạng bài', href: route, description: 'Xem phần cần nhớ và lỗi thường gặp.' }]
  });
  writePage(practiceRoute, injectSeo(htmlTemplate, {
    title: `Luyện tập ${item.name} | ezonthi`,
    description: `Luyện tập dạng ${item.name} ${item.subject} ${item.grade} trên ezonthi.`,
    canonicalUrl: canonical(route),
    robots: 'noindex, follow',
    body: practiceBody
  }));
}

const noIndexPages = [
  ['/dashboard/', 'Bảng điều khiển học tập'],
  ['/roadmap/', 'Lộ trình học cá nhân'],
  ['/practice/', 'Luyện tập'],
  ['/exam/', 'Thi thử và kiểm tra'],
  ['/ai-tutor/', 'Gia sư học tập'],
  ['/mistakes/', 'Sổ lỗi sai'],
  ['/teacher/', 'Góc giáo viên'],
  ['/affiliate/', 'Góc đối tác'],
  ['/vocabulary/', 'Luyện từ vựng'],
  ['/grammar/', 'Cẩm nang ngữ pháp'],
  ['/news/', 'Bảng tin']
];

for (const [route, h1] of noIndexPages) {
  writePage(route, injectSeo(htmlTemplate, {
    title: `${h1} | ezonthi`,
    description: `${h1} dành cho người dùng ezonthi.`,
    canonicalUrl: canonical(route),
    robots: 'noindex, follow',
    body: staticShell({ h1, intro: 'Nội dung tương tác được tải khi em mở trang.', links: [{ label: 'Về trang chủ', href: '/', description: '' }] })
  }));
}

const notFound = injectSeo(htmlTemplate, {
  title: 'Không tìm thấy trang | ezonthi',
  description: 'Địa chỉ này không tồn tại trên ezonthi.',
  canonicalUrl: `${DOMAIN}/404/`,
  robots: 'noindex, nofollow',
  body: staticShell({ h1: 'Không tìm thấy trang', intro: 'Đường dẫn có thể đã thay đổi hoặc không tồn tại.', links: [{ label: 'Về trang chủ', href: '/', description: 'Chọn lại nội dung cần học.' }] })
}).replace(/<script type="module"[\s\S]*?<\/script>/, '');
fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFound, 'utf8');

console.log(`✅ Prerender: ${publicPages.length} trang công khai, ${questionTypes.length} dạng bài, ${questionTypes.length} trang luyện tập noindex và ${noIndexPages.length} trang ứng dụng.`);
