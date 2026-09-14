import React from 'react';
import { ArrowRight, ArrowUpRight, BookOpenCheck, CheckCircle2, Sparkles, Trophy, Flame, Layers, Compass, HelpCircle } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { SeoHead } from '@/components/common/SeoHead';
import { createBreadcrumbSchema } from '@/utils/seoSchemas';
import { getSeoLandingPage } from '@/seo/landingPages';
import { InteractiveQuizHero } from './components/InteractiveQuizHero';
import { BentoFeatureGrid } from './components/BentoFeatureGrid';
import { GradeSubjectTabs } from './components/GradeSubjectTabs';
import { LiveActivityTicker } from './components/LiveActivityTicker';
import { TargetScoreCalculator } from './components/TargetScoreCalculator';
import { HallOfFameWall } from './components/HallOfFameWall';
import { cn } from '@/utils/cn';

const SeoLandingPage: React.FC = () => {
  const location = useLocation();
  const page = getSeoLandingPage(location.pathname);

  if (!page) return <Navigate to="/" replace />;

  const isHomePage = page.route === '/';

  const breadcrumb = createBreadcrumbSchema([
    { name: 'Trang chủ', item: '/' },
    ...(isHomePage ? [] : [{ name: page.h1, item: page.route }])
  ]);

  return (
    <div className="w-full aurora-bg min-h-screen overflow-x-clip">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-16 md:space-y-24">
        <SeoHead
          title={page.title}
          description={page.description}
          canonicalUrl={page.route}
          jsonLd={breadcrumb}
        />

        {/* HERO SECTION WITH AURORA ATMOSPHERE (Không dùng overflow-hidden để bảo toàn 100% thẻ nổi) */}
        <section className="relative pt-4 pb-6 md:py-12">
          <div className="grid lg:grid-cols-[1.15fr_1.05fr] gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Value Proposition & Tactile CTAs */}
            <div className="space-y-6 text-left">
              <div className="badge-capsule">
                <Sparkles size={13} className="text-primary animate-pulse" />
                <span>{page.eyebrow}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-black tracking-[-0.04em] text-foreground leading-[1.12] max-w-2xl">
                {isHomePage ? (
                  <>
                    Làm chủ từng dạng bài,{' '}
                    <span className="gradient-text whitespace-nowrap">bứt phá điểm thi</span>{' '}
                    cùng ezonthi
                  </>
                ) : (
                  page.h1
                )}
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-medium max-w-2xl">
                {page.intro}
              </p>

              {/* Tactile Shimmer Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to={page.links[0]?.href || '/dashboard/'}
                  className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm sm:text-base font-black text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-all"
                >
                  <span>Bắt đầu học ngay</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about/"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md px-6 py-3.5 text-sm sm:text-base font-bold text-foreground hover:bg-secondary/80 transition-all shadow-2xs"
                >
                  <span>Cách ezonthi hoạt động</span>
                </Link>
              </div>

              {/* Social Proof & Trust Metrics Ticker */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-extrabold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Flame size={16} className="text-amber-500" />
                  <span>13,000+ Câu hỏi có giải thích</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={16} className="text-emerald-500" />
                  <span>98.4% Đỗ đúng nguyện vọng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-black">★ 4.9/5</span>
                  <span>Học sinh yêu thích</span>
                </div>
              </div>
            </div>

            {/* Right Column: Studio Learning Stage with Floating Satellites */}
            <div className="w-full">
              <InteractiveQuizHero />
            </div>
          </div>
        </section>

        {/* METRICS & PROOF BAR (ISLAND CAPSULE) */}
        <section className="w-full reveal-on-scroll" aria-label="Thống kê hệ thống">
          <div className="island-nav grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-9 rounded-3xl shadow-xl">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text">13,000+</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold">Câu hỏi chuẩn ma trận</p>
            </div>
            <div className="text-center sm:text-left space-y-1 border-l border-border/80 pl-4 sm:pl-6">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text">500+</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold">Dạng bài trọng tâm GDPT</p>
            </div>
            <div className="text-center sm:text-left space-y-1 border-l border-border/80 pl-4 sm:pl-6">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold">Lời giải chi tiết từng bước</p>
            </div>
            <div className="text-center sm:text-left space-y-1 border-l border-border/80 pl-4 sm:pl-6">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-500">24/7</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold">Gia sư AI đồng hành</p>
            </div>
          </div>
          {/* Live Activity Community Pulse */}
          <LiveActivityTicker />
        </section>

      {/* BENTO GRID (Chỉ hiển thị trên Trang Chủ hoặc Trang Cấp Lớn) */}
      <BentoFeatureGrid />

      {/* GRADE & SUBJECT EXPLORER */}
      <GradeSubjectTabs />

      {/* INTERACTIVE TARGET SCORE CALCULATOR */}
      <TargetScoreCalculator />

      {/* THE 3-STEP MASTERY METHOD */}
      <section className="w-full py-10 md:py-14" aria-labelledby="workflow-heading">
        <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
          <div className="badge-capsule mb-3">
            <Layers size={14} />
            <span>Phương Pháp Độc Quyền</span>
          </div>
          <h2 id="workflow-heading" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Một buổi học gọn gàng <span className="gradient-text">trong 3 bước</span>
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-muted-foreground font-medium">
            Rút ngắn thời gian ngồi bàn học, tăng gấp đôi hiệu quả ghi nhớ và tư duy giải bài.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-group">
          <div className="bento-card p-6 sm:p-7 relative group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mb-4">
              01
            </span>
            <h3 className="text-lg font-black text-foreground">Đọc kiến thức cốt lõi</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Tóm tắt súc tích công thức, dấu hiệu nhận biết và các mẹo giải nhanh, không dài dòng lan man.
            </p>
          </div>

          <div className="bento-card p-6 sm:p-7 relative group border-primary/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mb-4">
              02
            </span>
            <h3 className="text-lg font-black text-foreground">Kiểm tra mức độ làm chủ</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Làm nhóm câu hỏi nền tảng có bấm giờ để đánh giá độ thấu hiểu trước khi chuyển cấp độ.
            </p>
          </div>

          <div className="bento-card p-6 sm:p-7 relative group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mb-4">
              03
            </span>
            <h3 className="text-lg font-black text-foreground">Luyện bài tập & Sửa lỗi</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Thực hành các dạng câu phân hóa, đối soát lời giải chi tiết và tự động lưu lỗi vào sổ tay thông minh.
            </p>
          </div>
        </div>
      </section>

      {/* WALL OF TRUST & HALL OF FAME */}
      <HallOfFameWall />

      {/* SEO SECTIONS: HỌC THUẬT & MA TRẬN KIẾN THỨC (Bảo toàn 100% nội dung SEO) */}
      <section className="w-full space-y-6" aria-labelledby="academic-details-heading">
        <div className="max-w-2xl reveal-on-scroll">
          <div className="badge-capsule mb-2">
            <Compass size={14} />
            <span>Nội Dung Trọng Tâm</span>
          </div>
          <h2 id="academic-details-heading" className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Thông tin chi tiết chương trình học
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 reveal-group">
          {page.sections.map(section => (
            <div key={section.heading} className="bento-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpenCheck size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">{section.heading}</h3>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {section.bullets && (
                  <ul className="mt-4 space-y-2 pt-3 border-t border-border/70">
                    {section.bullets.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY EXPLORER LINKS */}
      <section className="w-full" aria-labelledby="seo-next-heading">
        <div className="flex items-center justify-between gap-4 mb-6 reveal-on-scroll">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">Đường Dẫn Nhanh</p>
            <h2 id="seo-next-heading" className="mt-1 text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Khám phá các lộ trình liên quan
            </h2>
          </div>
        </div>

        <div className={cn(
          "grid sm:grid-cols-2 gap-4 reveal-group",
          page.links.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        )}>
          {page.links.map((link, index) => (
            <Link
              key={link.href + link.label}
              to={link.href}
              className="bento-card p-5 group flex flex-col justify-between hover:border-primary/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black tracking-widest text-primary px-2 py-0.5 rounded-md bg-primary/10">
                    MỤC {String(index + 1).padStart(2, '0')}
                  </span>
                  <ArrowUpRight size={17} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h3 className="mt-3 text-base font-black text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                  {link.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 text-[11px] font-extrabold text-primary flex items-center gap-1">
                <span>Khám phá ngay</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="w-full pt-4 pb-8 reveal-on-scroll" aria-label="Đăng ký học ngay">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Subtle pattern overlay */}
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/15 text-white backdrop-blur-md">
              <Sparkles size={14} /> Sẵn sàng cho kỳ thi quan trọng
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Bắt đầu hành trình chinh phục điểm 9+ cùng ezonthi ngay hôm nay
            </h2>

            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed max-w-2xl">
              Học thử miễn phí các dạng bài trọng tâm, trải nghiệm gia sư AI và phòng thi thử bấm giờ. 
              Không cần cam kết, học mọi lúc mọi nơi trên mọi thiết bị.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard/"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-900 px-7 py-3.5 text-sm sm:text-base font-black hover:bg-white/95 hover:shadow-xl transition-all active:scale-95 shadow-lg"
              >
                <span>Vào lớp học miễn phí</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/about/"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 text-sm sm:text-base font-bold transition-all"
              >
                <HelpCircle size={17} />
                <span>Tìm hiểu thêm</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      </main>
    </div>
  );
};

export default SeoLandingPage;

