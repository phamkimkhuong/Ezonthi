import React, { Suspense, useEffect, useState } from 'react';
import { ArrowRight, Moon, Sun, Menu, X, Sparkles, ShieldCheck, BookOpen, Compass } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSpotlightCards } from '@/hooks/useSpotlightCards';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  const savedTheme = window.localStorage.getItem('otv10_theme');
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const PublicLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Linear-Style Magnetic Spotlight Border Beam tracking
  useSpotlightCards();

  // Smart Scroll-Triggered Reveal & Staggered Cascade
  useScrollReveal();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('otv10_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Ôn thi vào 10', href: '/on-thi-vao-10/' },
    { label: 'Học lớp 10', href: '/lop-10/' },
    { label: 'Học lớp 11', href: '/lop-11/' },
    { label: 'Giới thiệu', href: '/about/' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary relative">
      {/* Floating Island Capsule Navbar */}
      <div className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <header className="mx-auto max-w-5xl h-14 sm:h-16 px-3.5 sm:px-6 rounded-full island-nav flex items-center justify-between gap-3 pointer-events-auto transition-all shadow-lg shadow-black/[0.03] dark:shadow-black/40">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2 group" aria-label="Về trang chủ ezonthi">
              <img
                src="/logo.webp"
                alt="ezonthi"
                width="240"
                height="131"
                className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
                fetchPriority="high"
              />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={10} /> GDPT 2018
            </span>
          </div>

          {/* Desktop Navigation Pills */}
          <nav className="hidden items-center gap-1 text-xs sm:text-sm font-bold md:flex" aria-label="Điều hướng chính">
            {navLinks.map(link => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    isActive
                      ? 'text-primary bg-primary/10 font-black shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setDarkMode(current => !current)}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-all hover:bg-secondary hover:scale-105 cursor-pointer shadow-2xs"
              aria-label={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
            </button>

            {/* CTA Button */}
            <Link
              to="/dashboard/"
              className="btn-shimmer inline-flex items-center gap-1.5 rounded-full bg-primary px-4 sm:px-5 py-2 text-xs font-black text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              <span>Vào lớp học</span>
              <ArrowRight size={13} />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu Capsule */}
        {mobileMenuOpen && (
          <div className="mx-auto max-w-md mt-2 p-3 rounded-2xl island-nav pointer-events-auto space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200 md:hidden">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center justify-between px-4 py-2 rounded-xl text-sm font-bold text-foreground hover:bg-secondary transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-1">
              <Link
                to="/dashboard/"
                className="btn-shimmer flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-xs font-black text-primary-foreground"
              >
                <span>Vào lớp học ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-7xl px-6 py-16 text-sm font-bold text-muted-foreground flex items-center justify-center">Đang tải nội dung ezonthi…</div>}>
          <Outlet />
        </Suspense>
      </div>

      {/* Enterprise Multi-tier Footer */}
      <footer className="border-t border-border bg-card text-foreground mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            
            {/* Col 1: Brand & Commitment (2 cols wide) */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <img
                  src="/logo.webp"
                  alt="ezonthi"
                  width="240"
                  height="131"
                  className="h-10 w-auto"
                  loading="lazy"
                />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                ezonthi là nền tảng học tập và luyện thi thông minh theo từng dạng bài, 
                tích hợp sổ tay lỗi sai và gia sư AI giúp học sinh tối ưu điểm số nhanh nhất.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-bold text-muted-foreground">
                <ShieldCheck size={15} className="text-emerald-500" />
                <span>Bám sát ma trận thi & chương trình GDPT 2018</span>
              </div>
            </div>

            {/* Col 2: Ôn thi vào 10 */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Compass size={14} className="text-primary" /> Lộ trình vào 10
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                <li>
                  <Link to="/on-thi-vao-10/toan/" className="hover:text-primary transition-colors">Toán thi vào 10</Link>
                </li>
                <li>
                  <Link to="/on-thi-vao-10/tieng-anh/" className="hover:text-primary transition-colors">Tiếng Anh thi vào 10</Link>
                </li>
                <li>
                  <Link to="/on-thi-vao-10/" className="hover:text-primary transition-colors">Lộ trình tổng thể lớp 9</Link>
                </li>
                <li>
                  <Link to="/exam/" className="hover:text-primary transition-colors">Đề thi thử bấm giờ</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Ôn tập THPT */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <BookOpen size={14} className="text-primary" /> Học tốt THPT
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                <li>
                  <Link to="/lop-10/toan/" className="hover:text-primary transition-colors">Toán học 10</Link>
                </li>
                <li>
                  <Link to="/lop-10/tieng-anh/" className="hover:text-primary transition-colors">Tiếng Anh 10</Link>
                </li>
                <li>
                  <Link to="/lop-10/vat-ly/" className="hover:text-primary transition-colors">Vật lý 10</Link>
                </li>
                <li>
                  <Link to="/lop-10/hoa-hoc/" className="hover:text-primary transition-colors">Hóa học 10</Link>
                </li>
                <li>
                  <Link to="/lop-11/" className="hover:text-primary transition-colors">Chương trình Lớp 11</Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Nền tảng & Pháp lý */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-3">Về ezonthi</p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                <li>
                  <Link to="/about/" className="hover:text-primary transition-colors">Giới thiệu phương pháp</Link>
                </li>
                <li>
                  <Link to="/dashboard/" className="hover:text-primary transition-colors">Vào bảng điều khiển</Link>
                </li>
                <li>
                  <Link to="/roadmap/" className="hover:text-primary transition-colors">Cây tri thức</Link>
                </li>
                <li>
                  <span className="text-xs text-muted-foreground/70">Học đúng trọng tâm, luyện đúng dạng</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <p>© 2026 ezonthi. Nền tảng luyện thi chuẩn hóa GDPT 2018.</p>
            <div className="flex items-center gap-5">
              <span>Bản quyền nội dung thuộc về ezonthi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

