import React, { useState } from 'react';
import { ArrowRight, BookOpen, Calculator, Globe, Atom, FlaskConical, Dna, ScrollText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  badge: string;
  sgkBadge: string;
  curriculumDepth: string;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
}

interface GradeTabConfig {
  id: string;
  label: string;
  badge: string;
  subjects: SubjectItem[];
}

const GRADE_DATA: GradeTabConfig[] = [
  {
    id: 'grade-9',
    label: 'Ôn thi vào 10',
    badge: 'Mục tiêu đỗ NV1',
    subjects: [
      {
        id: 'math-9',
        name: 'Toán thi vào 10',
        slug: 'toan',
        href: '/on-thi-vao-10/toan/',
        badge: 'Trọng tâm tuyển sinh',
        sgkBadge: 'Chuẩn ma trận đề Sở GD&ĐT',
        curriculumDepth: '14 Chuyên đề • 128 Dạng bài • 2,400+ Câu',
        icon: <Calculator size={22} />,
        description: 'Đại số, phương trình, hàm số bậc nhất - bậc hai, bài toán thực tế và hình học phẳng.',
        colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      },
      {
        id: 'english-9',
        name: 'Tiếng Anh thi vào 10',
        slug: 'tieng-anh',
        href: '/on-thi-vao-10/tieng-anh/',
        badge: 'Phân hóa điểm 9+',
        sgkBadge: 'Global Success & Friends Plus',
        curriculumDepth: '12 Chủ điểm • 96 Dạng câu • 1,800+ Câu',
        icon: <Globe size={22} />,
        description: 'Ngữ pháp, từ vựng theo chủ đề, phát âm - trọng âm, đọc hiểu và dạng bài viết gián tiếp.',
        colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      },
      {
        id: 'mock-exam-9',
        name: 'Đề thi thử Tuyển sinh 63 Tỉnh',
        slug: 'de-thi-thu',
        href: '/exam/',
        badge: 'Có lời giải chi tiết',
        sgkBadge: 'Chuẩn cấu trúc đề Sở GD&ĐT',
        curriculumDepth: '120+ Bộ đề • Bấm giờ & Phổ điểm tức thì',
        icon: <GraduationCap size={22} />,
        description: 'Tổng hợp đề thi thử chính thức mới nhất từ các Sở GD&ĐT và trường Chuyên, rèn luyện tốc độ làm bài.',
        colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      }
    ]
  },
  {
    id: 'grade-10',
    label: 'Học tốt Lớp 10',
    badge: 'Chuẩn GDPT 2018',
    subjects: [
      {
        id: 'math-10',
        name: 'Toán học 10',
        slug: 'toan',
        href: '/lop-10/toan/',
        badge: 'Đại số & Hình học',
        sgkBadge: 'Kết Nối Tri Thức & Cánh Diều',
        curriculumDepth: '9 Chương • 74 Dạng bài • 1,600+ Câu',
        icon: <Calculator size={22} />,
        description: 'Mệnh đề - tập hợp, bất phương trình bậc hai, hàm số, vectơ và thống kê xác suất.',
        colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      },
      {
        id: 'english-10',
        name: 'Tiếng Anh 10',
        slug: 'tieng-anh',
        href: '/lop-10/tieng-anh/',
        badge: 'Global Success & Friends',
        sgkBadge: 'Chương trình GDPT mới',
        curriculumDepth: '10 Units • 80 Dạng bài • 1,500+ Câu',
        icon: <Globe size={22} />,
        description: 'Hệ thống ngữ pháp nâng cao, từ vựng chuyên sâu theo chủ điểm đời sống và xã hội.',
        colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      },
      {
        id: 'physics-10',
        name: 'Vật lý 10',
        slug: 'vat-ly',
        href: '/lop-10/vat-ly/',
        badge: 'Cơ học & Năng lượng',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '8 Chương • 62 Dạng bài • 1,200+ Câu',
        icon: <Atom size={22} />,
        description: 'Động học chất điểm, các định luật Newton, công - công suất và định luật bảo toàn.',
        colorClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
      },
      {
        id: 'chemistry-10',
        name: 'Hóa học 10',
        slug: 'hoa-hoc',
        href: '/lop-10/hoa-hoc/',
        badge: 'Cấu tạo & Phản ứng',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '7 Chương • 58 Dạng bài • 1,100+ Câu',
        icon: <FlaskConical size={22} />,
        description: 'Nguyên tử, bảng tuần hoàn, liên kết hóa học, phản ứng oxi hóa - khử và năng lượng hóa học.',
        colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      },
      {
        id: 'biology-10',
        name: 'Sinh học 10',
        slug: 'sinh-hoc',
        href: '/lop-10/sinh-hoc/',
        badge: 'Sinh học tế bào',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '6 Phần • 45 Dạng bài • 900+ Câu',
        icon: <Dna size={22} />,
        description: 'Thành phần hóa học của tế bào, cấu trúc tế bào, trao đổi chất và chu kỳ tế bào.',
        colorClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
      },
      {
        id: 'history-10',
        name: 'Lịch sử 10',
        slug: 'lich-su',
        href: '/lop-10/lich-su/',
        badge: 'Văn minh nhân loại',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '6 Chủ đề • 40 Dạng câu • 850+ Câu',
        icon: <ScrollText size={22} />,
        description: 'Lịch sử và sử học, các nền văn minh phương Đông, phương Tây và văn minh Đại Việt.',
        colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      }
    ]
  },
  {
    id: 'grade-11',
    label: 'Học tốt Lớp 11',
    badge: 'Tăng tốc kiến thức',
    subjects: [
      {
        id: 'math-11',
        name: 'Toán học 11',
        slug: 'toan',
        href: '/lop-11/toan/',
        badge: 'Lượng giác & Không gian',
        sgkBadge: 'Kết Nối & Cánh Diều',
        curriculumDepth: '9 Chương • 76 Dạng bài • 1,700+ Câu',
        icon: <Calculator size={22} />,
        description: 'Hàm số lượng giác, dãy số - cấp số cộng/nhân, giới hạn, đạo hàm và hình học không gian.',
        colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      },
      {
        id: 'english-11',
        name: 'Tiếng Anh 11',
        slug: 'tieng-anh',
        href: '/lop-11/tieng-anh/',
        badge: 'Đọc hiểu & Viết học thuật',
        sgkBadge: 'Global Success & Friends',
        curriculumDepth: '10 Units • 82 Dạng bài • 1,500+ Câu',
        icon: <Globe size={22} />,
        description: 'Mệnh đề phân từ, câu chẻ, câu điều kiện hỗn hợp và đọc hiểu văn bản nâng cao.',
        colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      },
      {
        id: 'physics-11',
        name: 'Vật lý 11',
        slug: 'vat-ly',
        href: '/lop-11/vat-ly/',
        badge: 'Dao động & Sóng',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '4 Phần • 54 Dạng bài • 1,150+ Câu',
        icon: <Atom size={22} />,
        description: 'Dao động điều hòa, sóng cơ, sóng điện từ, điện trường và dòng điện không đổi.',
        colorClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
      },
      {
        id: 'chemistry-11',
        name: 'Hóa học 11',
        slug: 'hoa-hoc',
        href: '/lop-11/hoa-hoc/',
        badge: 'Hóa hữu cơ & Cân bằng',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '6 Chương • 52 Dạng bài • 1,050+ Câu',
        icon: <FlaskConical size={22} />,
        description: 'Cân bằng hóa học, nitrogen - sulfur, đại cương hóa hữu cơ và hydrocarbon.',
        colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      },
      {
        id: 'biology-11',
        name: 'Sinh học 11',
        slug: 'sinh-hoc',
        href: '/lop-11/sinh-hoc/',
        badge: 'Sinh học cơ thể',
        sgkBadge: 'Bám sát SGK mới 2018',
        curriculumDepth: '4 Chương • 42 Dạng bài • 850+ Câu',
        icon: <Dna size={22} />,
        description: 'Trao đổi chất và chuyển hóa năng lượng, cảm ứng, sinh trưởng và sinh sản ở sinh vật.',
        colorClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
      }
    ]
  }
];

export const GradeSubjectTabs: React.FC = () => {
  const [activeGradeId, setActiveGradeId] = useState('grade-9');

  const currentGrade = GRADE_DATA.find(g => g.id === activeGradeId) || GRADE_DATA[0];

  return (
    <section className="w-full py-10 md:py-16" aria-labelledby="subjects-explorer-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-left reveal-on-scroll">
        <div>
          <div className="badge-capsule mb-2.5">
            <BookOpen size={14} />
            <span>Học Liệu Chuẩn Hóa 2.0</span>
          </div>
          <h2 id="subjects-explorer-heading" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Khám phá theo <span className="gradient-text">mục tiêu học tập của bạn</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
            Chọn khối lớp để xem danh mục chuyên đề, chuẩn SGK mới và ngân hàng câu hỏi có lời giải.
          </p>
        </div>

        {/* Grade Tabs Nav */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full island-nav shrink-0 self-start md:self-auto overflow-x-auto max-w-full shadow-sm">
          {GRADE_DATA.map(grade => {
            const isActive = grade.id === activeGradeId;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => setActiveGradeId(grade.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{grade.label}</span>
                {isActive && (
                  <span className="hidden sm:inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {grade.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Cards Grid (Course Cards 2.0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal-group">
        {currentGrade.subjects.map(sub => (
          <Link
            key={sub.id}
            to={sub.href}
            className="bento-card p-6 flex flex-col justify-between group hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div>
              {/* Top Icons & Badges */}
              <div className="flex items-center justify-between gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${sub.colorClass} shadow-2xs group-hover:scale-105 transition-transform`}>
                  {sub.icon}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border/80">
                  {sub.badge}
                </span>
              </div>

              {/* Title & SGK Tag */}
              <h3 className="mt-5 text-lg sm:text-xl font-black text-foreground group-hover:text-primary transition-colors">
                {sub.name}
              </h3>
              <p className="text-[11px] font-extrabold text-primary/90 mt-0.5">
                ✦ {sub.sgkBadge}
              </p>

              {/* Description */}
              <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">
                {sub.description}
              </p>
            </div>

            {/* Bottom: Curriculum Depth & Action */}
            <div className="mt-6 pt-4 border-t border-border/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                <span className="truncate">{sub.curriculumDepth}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-black text-primary pt-0.5">
                <span>Vào học chuyên đề</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
