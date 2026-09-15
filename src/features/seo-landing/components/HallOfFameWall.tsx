import React from 'react';
import { Trophy, Star, Quote, Award, Sparkles } from 'lucide-react';

interface StudentSuccessStory {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  school: string;
  score: string;
  badge: string;
  badgeColor: string;
  quote: string;
  examYear: string;
}

const SUCCESS_STORIES: StudentSuccessStory[] = [
  {
    id: 'long',
    name: 'Nguyễn Hoàng Long',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'HL',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    score: 'Toán: 9.75 • Tiếng Anh: 9.5',
    badge: 'Trúng Tuyển NV1',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    quote: 'Nhờ tính năng Sổ tay lỗi sai, em phát hiện ra mình hay bị nhầm dấu ở bài toán rút gọn có chứa tham số. Sau 2 tuần luyện lại theo chu kỳ lặp, em đạt điểm trọn vẹn phần này!',
    examYear: 'Khóa 2025'
  },
  {
    id: 'vy',
    name: 'Lê Thảo Vy',
    avatarColor: 'from-amber-500 to-rose-500',
    initials: 'TV',
    school: 'THPT Chu Văn An (Hà Nội)',
    score: 'Toán: 9.25 • Tiếng Anh: 9.75',
    badge: 'Top 10 Toàn Trường',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    quote: 'Phòng thi thử có đồng hồ đếm ngược giúp em rèn phản xạ canh thời gian chuẩn xác từng phút. Bước vào phòng thi thật em làm bài cực kỳ tự tin và còn dư 15 phút rà soát lại.',
    examYear: 'Khóa 2025'
  },
  {
    id: 'bao',
    name: 'Trần Quốc Bảo',
    avatarColor: 'from-emerald-500 to-teal-600',
    initials: 'QB',
    school: 'THPT Chuyên Lê Hồng Phong (TP.HCM)',
    score: 'Toán Chuyên: 9.0 • Toán Chung: 9.5',
    badge: 'Trúng Tuyển Chuyên',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    quote: 'Cây tri thức phân chia lộ trình từ nền tảng 7+ lên vận dụng 9+ rất mạch lạc. Em không cần phải mua bừa bãi hàng chục cuốn sách tham khảo dày cộp nữa.',
    examYear: 'Khóa 2025'
  }
];

export const HallOfFameWall: React.FC = () => {
  return (
    <section className="w-full py-12 md:py-16" aria-labelledby="hall-of-fame-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left reveal-on-scroll">
        <div>
          <div className="badge-capsule mb-2.5">
            <Trophy size={14} className="text-amber-500" />
            <span>Bảng Vàng Vinh Danh</span>
          </div>
          <h2 id="hall-of-fame-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Học sinh ezonthi đã <span className="gradient-text">đỗ đúng nguyện vọng 1 như thế nào?</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
            Câu chuyện người thật, điểm số thật từ những bạn học sinh đã kiên trì đồng hành cùng phương pháp học chủ động của ezonthi.
          </p>
        </div>

        {/* Aggregate Trust Badge */}
        <div className="inline-flex items-center gap-3 p-3 px-4 rounded-2xl island-nav self-start md:self-auto shrink-0 shadow-sm">
          <div className="flex -space-x-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-black ring-2 ring-background shadow-2xs">
              A
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black ring-2 ring-background shadow-2xs">
              K
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-black ring-2 ring-background shadow-2xs">
              V
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
              <span className="font-black text-foreground ml-1">4.9/5</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold">Từ 3,800+ đánh giá xác thực</p>
          </div>
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-group">
        {SUCCESS_STORIES.map(item => (
          <div
            key={item.id}
            className="bento-card p-6 sm:p-7 flex flex-col justify-between group hover:border-primary/50 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
          >
            {/* Top decorative quote mark */}
            <div className="absolute -top-2 right-4 text-primary/10 group-hover:text-primary/20 transition-colors pointer-events-none">
              <Quote size={60} />
            </div>

            <div>
              {/* Student Header */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.avatarColor} text-white font-black text-base shadow-sm shrink-0`}>
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-foreground truncate">{item.name}</h3>
                  <p className="text-[11px] font-extrabold text-primary truncate flex items-center gap-1">
                    <Award size={12} className="shrink-0" />
                    {item.school}
                  </p>
                </div>
              </div>

              {/* Score pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-[11px] font-black text-foreground mb-4">
                <Sparkles size={12} className="text-amber-500 shrink-0" />
                <span>{item.score}</span>
              </div>

              {/* Quote text */}
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed italic">
                "{item.quote}"
              </p>
            </div>

            {/* Bottom: Badge & Cohort */}
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-[11px]">
              <span className={`font-black px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                {item.badge}
              </span>
              <span className="font-bold text-muted-foreground">{item.examYear}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
