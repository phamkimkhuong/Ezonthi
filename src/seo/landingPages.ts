export interface SeoLandingLink {
  label: string;
  href: string;
  description: string;
}

export interface SeoLandingSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface SeoLandingPageConfig {
  route: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: SeoLandingSection[];
  links: SeoLandingLink[];
}

export const seoLandingPages: SeoLandingPageConfig[] = [
  {
    route: '/',
    title: 'ezonthi | Học tốt lớp 10, ôn thi vào 10 và lớp 11',
    description: 'Nền tảng học tốt lớp 10 đủ 6 môn, kèm lộ trình ôn thi vào lớp 10 và lớp 11 theo từng dạng bài, có lý thuyết, luyện tập tự động và lời giải chi tiết.',
    eyebrow: 'Học đúng trọng tâm, luyện đúng dạng',
    h1: 'Học tốt lớp 10, ôn thi vào 10 và lớp 11 cùng ezonthi',
    intro: 'Chọn đúng khối lớp và môn học của em để học lý thuyết, nhận dạng bài và luyện câu hỏi chấm tự động theo mức độ tăng dần ngay trên một nền tảng.',
    sections: [
      {
        heading: 'Ba lộ trình, ba mục tiêu rõ ràng',
        paragraphs: [
          'Lộ trình lớp 10 trọng tâm dành cho học sinh THPT, ôn theo chương, dạng bài và kỳ kiểm tra đủ 6 môn Toán, Tiếng Anh, Vật lý, Hóa học, Sinh học, Lịch sử.',
          'Lộ trình ôn thi vào 10 dành cho học sinh lớp 9 đang chuẩn bị kỳ thi tuyển sinh, tập trung vào Toán và Tiếng Anh.',
          'Lộ trình lớp 11 bám sát chương trình GDPT các môn Toán, Tiếng Anh, Vật lý, Hóa học, Sinh học giúp học sinh làm chủ kiến thức và dạng bài vận dụng.'
        ]
      },
      {
        heading: 'Không cần rời trang để tìm lại lý thuyết',
        paragraphs: ['Mỗi dạng bài được nối từ phần kiến thức cần nhớ đến dấu hiệu nhận biết, lỗi thường gặp và bộ câu hỏi luyện tập có lời giải.']
      }
    ],
    links: [
      { label: 'Ôn tập lớp 10', href: '/lop-10/', description: 'Học theo môn và dạng bài trong chương trình lớp 10.' },
      { label: 'Ôn thi vào 10', href: '/on-thi-vao-10/', description: 'Lộ trình tuyển sinh lớp 10 môn Toán và Tiếng Anh.' },
      { label: 'Ôn tập lớp 11', href: '/lop-11/', description: 'Học theo môn và dạng bài trong chương trình lớp 11.' },
      { label: 'Tìm hiểu ezonthi', href: '/about/', description: 'Cách nền tảng tổ chức lộ trình và dữ liệu học tập.' }
    ]
  },
  {
    route: '/on-thi-vao-10/',
    title: 'Ôn thi vào 10: lộ trình Toán và Tiếng Anh | ezonthi',
    description: 'Ôn thi vào 10 môn Toán và Tiếng Anh theo dạng bài: học kiến thức trọng tâm, luyện câu hỏi từ cơ bản đến nâng cao và xem lời giải.',
    eyebrow: 'Dành cho học sinh lớp 9',
    h1: 'Ôn thi vào 10 theo lộ trình và dạng bài',
    intro: 'Bắt đầu từ phần còn yếu, ôn lại kiến thức cốt lõi rồi luyện câu hỏi theo mức độ. Nội dung hiện có cho hai môn Toán và Tiếng Anh.',
    sections: [
      {
        heading: 'Cách ôn thi vào 10 hiệu quả trên ezonthi',
        paragraphs: ['Mỗi buổi học nên đi theo ba bước: đọc phần cần nhớ, làm nhóm câu cơ bản để kiểm tra nền tảng, sau đó mới chuyển sang câu vận dụng.'],
        bullets: ['Ôn theo từng dạng thay vì làm đề ngẫu nhiên ngay từ đầu.', 'Ghi lại lỗi sai và quay lại đúng dạng còn yếu.', 'Làm đề có giới hạn thời gian khi đã nắm phần lớn kiến thức.']
      },
      {
        heading: 'Nội dung được cập nhật theo dữ liệu thật',
        paragraphs: ['Trang chỉ giới thiệu những môn đã có học liệu trong hệ thống. ezonthi không tuyên bố có đủ môn Ngữ văn khi dữ liệu môn này chưa được xây dựng.']
      }
    ],
    links: [
      { label: 'Ôn thi vào 10 môn Toán', href: '/on-thi-vao-10/toan/', description: 'Các nhóm kiến thức và dạng bài Toán tuyển sinh lớp 10.' },
      { label: 'Ôn thi vào 10 môn Tiếng Anh', href: '/on-thi-vao-10/tieng-anh/', description: 'Ngữ pháp, từ vựng, đọc hiểu và dạng bài thi vào 10.' },
      { label: 'Vào lộ trình học', href: '/roadmap/', description: 'Chọn môn và bắt đầu học theo tiến độ cá nhân.' }
    ]
  },
  {
    route: '/on-thi-vao-10/toan/',
    title: 'Ôn thi vào 10 môn Toán theo dạng bài | ezonthi',
    description: 'Ôn thi vào 10 môn Toán với lý thuyết trọng tâm, dạng bài đại số và hình học, câu hỏi tăng dần độ khó cùng lời giải chi tiết.',
    eyebrow: 'Toán tuyển sinh lớp 10',
    h1: 'Ôn thi vào 10 môn Toán theo từng dạng bài',
    intro: 'Hệ thống giúp em ôn lại công thức, nhận biết phương pháp và luyện từng nhóm câu trước khi chuyển sang đề tổng hợp.',
    sections: [
      {
        heading: 'Nội dung ôn tập chính',
        paragraphs: ['Dữ liệu được chia theo các mạch đại số, hàm số, phương trình, bài toán thực tế và hình học để học sinh dễ tìm đúng phần còn yếu.'],
        bullets: ['Kiến thức và công thức cần nhớ.', 'Dấu hiệu nhận biết từng dạng toán.', 'Bài tập cơ bản, vận dụng và câu phân hóa.', 'Lời giải trình bày các bước, không chỉ đưa đáp án.']
      },
      {
        heading: 'Khi nào nên bắt đầu làm đề?',
        paragraphs: ['Em nên làm đề tổng hợp sau khi đã hoàn thành các dạng nền tảng và xử lý được phần lớn câu cơ bản. Kết quả đề thi thử lúc đó mới phản ánh đúng phần cần bù.']
      }
    ],
    links: [
      { label: 'Mở lộ trình Toán', href: '/roadmap/', description: 'Chọn lớp 9 và môn Toán để xem toàn bộ dạng bài.' },
      { label: 'Luyện tập Toán', href: '/practice/', description: 'Luyện các dạng đã mở khóa trong lộ trình.' },
      { label: 'Thi thử và kiểm tra', href: '/exam/', description: 'Làm bài có giới hạn thời gian khi đã sẵn sàng.' }
    ]
  },
  {
    route: '/on-thi-vao-10/tieng-anh/',
    title: 'Ôn thi vào 10 môn Tiếng Anh theo dạng bài | ezonthi',
    description: 'Ôn thi vào 10 môn Tiếng Anh theo ngữ pháp, từ vựng, đọc hiểu và viết gián tiếp, có câu hỏi đa dạng cùng lời giải dễ hiểu.',
    eyebrow: 'Tiếng Anh tuyển sinh lớp 10',
    h1: 'Ôn thi vào 10 môn Tiếng Anh có giải thích dễ hiểu',
    intro: 'Ôn từng điểm ngữ pháp và dạng câu hỏi, hiểu vì sao đáp án đúng và vì sao các lựa chọn còn lại chưa phù hợp.',
    sections: [
      {
        heading: 'Các mảng cần luyện',
        paragraphs: ['Lộ trình kết hợp kiến thức ngôn ngữ với kỹ năng làm bài để học sinh không phải học thuộc đáp án.'],
        bullets: ['Phát âm, trọng âm, từ vựng và ngữ pháp.', 'Giao tiếp, tìm lỗi sai và biến đổi câu.', 'Điền từ và đọc hiểu theo ngữ cảnh.', 'Sắp xếp câu và các dạng viết gián tiếp phù hợp hình thức chấm trên web.']
      },
      {
        heading: 'Lời giải dành riêng cho môn Tiếng Anh',
        paragraphs: ['Phần giải thích ưu tiên tiếng Việt tự nhiên, chỉ ra từ khóa hoặc quy tắc ngay trong câu và dịch phần cần thiết, tránh những nhận xét chung chung.']
      }
    ],
    links: [
      { label: 'Mở lộ trình Tiếng Anh', href: '/roadmap/', description: 'Chọn lớp 9 và môn Tiếng Anh để bắt đầu.' },
      { label: 'Cẩm nang ngữ pháp', href: '/grammar/', description: 'Ôn nhanh những chủ điểm ngữ pháp quan trọng.' },
      { label: 'Luyện từ vựng', href: '/vocabulary/', description: 'Củng cố vốn từ dùng trong bài thi.' }
    ]
  },
  {
    route: '/lop-10/',
    title: 'Ôn thi lớp 10 và học tốt các môn lớp 10 | ezonthi',
    description: 'Ôn tập lớp 10 theo chương và dạng bài các môn Toán, Tiếng Anh, Vật lý, Hóa học, Sinh học, Lịch sử với lý thuyết và bài tập.',
    eyebrow: 'Dành cho học sinh đang học lớp 10',
    h1: 'Ôn thi lớp 10 và học tốt từng môn',
    intro: 'Đây là lộ trình ôn kiểm tra trong năm học lớp 10, khác với lộ trình thi tuyển sinh vào lớp 10 dành cho học sinh lớp 9.',
    sections: [
      {
        heading: 'Ôn theo chương, không học dàn trải',
        paragraphs: ['Chọn môn, mở đúng chương đang học rồi hoàn thành lần lượt phần lý thuyết, kiểm tra làm chủ và luyện tập.']
      },
      {
        heading: 'Các môn hiện có',
        paragraphs: ['Hệ thống hiện có dữ liệu lớp 10 cho Toán, Tiếng Anh, Vật lý, Hóa học, Sinh học và Lịch sử. Mỗi môn được tổ chức theo đặc thù kiến thức và cách giải thích riêng.']
      }
    ],
    links: [
      { label: 'Toán lớp 10', href: '/lop-10/toan/', description: 'Đại số, hình học và xác suất theo từng dạng.' },
      { label: 'Tiếng Anh lớp 10', href: '/lop-10/tieng-anh/', description: 'Ngôn ngữ và kỹ năng đọc, viết gián tiếp.' },
      { label: 'Vật lý lớp 10', href: '/lop-10/vat-ly/', description: 'Khái niệm, công thức và bài tập vật lý.' },
      { label: 'Hóa học lớp 10', href: '/lop-10/hoa-hoc/', description: 'Cấu tạo chất, bảng tuần hoàn và phản ứng.' },
      { label: 'Sinh học lớp 10', href: '/lop-10/sinh-hoc/', description: 'Kiến thức tế bào và sinh học cơ bản.' },
      { label: 'Lịch sử lớp 10', href: '/lop-10/lich-su/', description: 'Hệ thống sự kiện, khái niệm và câu hỏi ghi nhớ.' }
    ]
  },
  ...[
    ['toan', 'Toán', 'công thức, định nghĩa, dạng toán và bài tập từ cơ bản đến nâng cao'],
    ['tieng-anh', 'Tiếng Anh', 'từ vựng, ngữ pháp, đọc hiểu và các dạng viết gián tiếp'],
    ['vat-ly', 'Vật lý', 'khái niệm, công thức, đơn vị và bài tập vận dụng'],
    ['hoa-hoc', 'Hóa học', 'lý thuyết trọng tâm, nhận biết dạng và bài tập tính toán'],
    ['sinh-hoc', 'Sinh học', 'khái niệm, quá trình sinh học và câu hỏi theo ngữ liệu'],
    ['lich-su', 'Lịch sử', 'mốc sự kiện, khái niệm, ý nghĩa và câu hỏi đa dạng theo sách giáo khoa']
  ].map(([slug, subject, focus]) => ({
    route: `/lop-10/${slug}/`,
    title: `Ôn tập ${subject} lớp 10 theo chương và dạng bài | ezonthi`,
    description: `Học và ôn tập ${subject} lớp 10 với ${focus}; có lộ trình, luyện tập và lời giải ngay trên ezonthi.`,
    eyebrow: `${subject} lớp 10`,
    h1: `Học tốt và ôn tập ${subject} lớp 10`,
    intro: `Nội dung ${subject} lớp 10 được chia theo chương và dạng bài để em đọc phần cần nhớ trước khi luyện câu hỏi.`,
    sections: [
      {
        heading: `Cách học ${subject} lớp 10 trên ezonthi`,
        paragraphs: [`Mỗi dạng bài kết nối phần ${focus} với câu hỏi luyện tập. Học sinh có thể quay lại đúng phần còn yếu thay vì làm lại toàn bộ chương.`],
        bullets: ['Đọc phần kiến thức nền tảng.', 'Hoàn thành câu kiểm tra làm chủ.', 'Luyện câu hỏi theo mức độ tăng dần.', 'Xem lời giải và lưu lỗi cần ôn lại.']
      },
      {
        heading: 'Dùng lộ trình để theo dõi tiến độ',
        paragraphs: ['Trang môn học giúp Google và học sinh hiểu phạm vi nội dung; phần học tương tác và tiến độ cá nhân được thực hiện trong lộ trình.']
      }
    ],
    links: [
      { label: `Mở lộ trình ${subject}`, href: '/roadmap/', description: `Chọn lớp 10 và môn ${subject} để xem các chương.` },
      { label: `Luyện tập ${subject}`, href: '/practice/', description: 'Luyện những dạng bài đã học và kiểm tra mức độ làm chủ.' },
      { label: 'Thi thử và kiểm tra', href: '/exam/', description: 'Làm bài kiểm tra theo thời gian khi đã ôn đủ kiến thức.' }
    ]
  } satisfies SeoLandingPageConfig)),
  {
    route: '/lop-11/',
    title: 'Ôn thi lớp 11 và học tốt các môn lớp 11 | ezonthi',
    description: 'Ôn tập lớp 11 theo chương và dạng bài các môn Toán, Tiếng Anh, Vật lý, Hóa học, Sinh học với lý thuyết và bài tập.',
    eyebrow: 'Dành cho học sinh đang học lớp 11',
    h1: 'Ôn thi lớp 11 và học tốt từng môn',
    intro: 'Lộ trình ôn tập và luyện dạng bài các môn THPT lớp 11 bám sát chương trình GDPT 2018, giúp học sinh nắm chắc kiến thức trọng tâm.',
    sections: [
      {
        heading: 'Học đúng trọng tâm chương trình lớp 11',
        paragraphs: ['Mỗi môn học được tổ chức theo chương và dạng bài chuẩn mực, từ lý thuyết cốt lõi, phương pháp nhận biết đến bài tập có lời giải từng bước.']
      },
      {
        heading: 'Các môn hiện có',
        paragraphs: ['Hệ thống hiện có dữ liệu lớp 11 cho Toán, Tiếng Anh, Vật lý, Hóa học và Sinh học. Mỗi môn được tổ chức theo đặc thù kiến thức và phương pháp giải chi tiết.']
      }
    ],
    links: [
      { label: 'Toán lớp 11', href: '/lop-11/toan/', description: 'Hàm số lượng giác, dãy số, giới hạn và hình học không gian.' },
      { label: 'Tiếng Anh lớp 11', href: '/lop-11/tieng-anh/', description: 'Ngữ pháp chuyên sâu, từ vựng theo chủ đề và đọc hiểu.' },
      { label: 'Vật lý lớp 11', href: '/lop-11/vat-ly/', description: 'Dao động điều hòa, sóng cơ, điện trường và dòng điện.' },
      { label: 'Hóa học lớp 11', href: '/lop-11/hoa-hoc/', description: 'Cân bằng hóa học, nitrogen - sulfur và hóa học hữu cơ.' },
      { label: 'Sinh học lớp 11', href: '/lop-11/sinh-hoc/', description: 'Trao đổi chất, chuyển hóa năng lượng, cảm ứng và sinh sản.' }
    ]
  },
  ...[
    ['toan', 'Toán', 'công thức lượng giác, dãy số, giới hạn, quan hệ vuông góc và bài tập từ cơ bản đến nâng cao'],
    ['tieng-anh', 'Tiếng Anh', 'từ vựng theo chủ điểm, ngữ pháp nâng cao, đọc hiểu và kỹ năng làm bài thi'],
    ['vat-ly', 'Vật lý', 'dao động, sóng, điện trường, từ trường và các bài tập tính toán vận dụng'],
    ['hoa-hoc', 'Hóa học', 'cân bằng hóa học, hợp chất vô cơ, dẫn xuất hydrocarbon và phương pháp giải'],
    ['sinh-hoc', 'Sinh học', 'trao đổi chất và năng lượng, cảm ứng, sinh trưởng và phát triển ở sinh vật']
  ].map(([slug, subject, focus]) => ({
    route: `/lop-11/${slug}/`,
    title: `Ôn tập ${subject} lớp 11 theo chương và dạng bài | ezonthi`,
    description: `Học và ôn tập ${subject} lớp 11 với ${focus}; có lộ trình, luyện tập và lời giải ngay trên ezonthi.`,
    eyebrow: `${subject} lớp 11`,
    h1: `Học tốt và ôn tập ${subject} lớp 11`,
    intro: `Nội dung ${subject} lớp 11 được chia theo chương và dạng bài để em đọc phần cần nhớ trước khi luyện câu hỏi.`,
    sections: [
      {
        heading: `Cách học ${subject} lớp 11 trên ezonthi`,
        paragraphs: [`Mỗi dạng bài kết nối phần ${focus} với câu hỏi luyện tập. Học sinh có thể quay lại đúng phần còn yếu thay vì làm lại toàn bộ chương.`],
        bullets: ['Đọc phần kiến thức nền tảng.', 'Hoàn thành câu kiểm tra làm chủ.', 'Luyện câu hỏi theo mức độ tăng dần.', 'Xem lời giải và lưu lỗi cần ôn lại.']
      },
      {
        heading: 'Dùng lộ trình để theo dõi tiến độ',
        paragraphs: ['Trang môn học giúp Google và học sinh hiểu phạm vi nội dung; phần học tương tác và tiến độ cá nhân được thực hiện trong lộ trình.']
      }
    ],
    links: [
      { label: `Mở lộ trình ${subject}`, href: '/roadmap/', description: `Chọn lớp 11 và môn ${subject} để xem các chương.` },
      { label: `Luyện tập ${subject}`, href: '/practice/', description: 'Luyện những dạng bài đã học và kiểm tra mức độ làm chủ.' },
      { label: 'Thi thử và kiểm tra', href: '/exam/', description: 'Làm bài kiểm tra theo thời gian khi đã ôn đủ kiến thức.' }
    ]
  } satisfies SeoLandingPageConfig))
];

export function normalizeSeoPath(pathname: string): string {
  if (pathname === '/') return '/';
  return `${pathname.replace(/\/+$/, '')}/`;
}

export function getSeoLandingPage(pathname: string): SeoLandingPageConfig | undefined {
  const normalized = normalizeSeoPath(pathname);
  return seoLandingPages.find(page => page.route === normalized);
}
