import React, { useState } from 'react';
import { Target, CheckCircle2, ArrowRight, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type SchoolTarget = 'top-public' | 'standard-public' | 'gifted';
type ScoreTarget = '8.0' | '8.5' | '9.0' | '9.5';
type SubjectTarget = 'math' | 'english';

interface CalcResult {
  topicsCount: number;
  totalTopics: number;
  studyMinutes: number;
  weeksDuration: number;
  successRate: string;
  focusTopics: string[];
  riskNote: string;
}

const CALC_DATABASE: Record<SchoolTarget, Record<ScoreTarget, Record<SubjectTarget, CalcResult>>> = {
  'top-public': {
    '8.0': {
      math: {
        topicsCount: 28,
        totalTopics: 42,
        studyMinutes: 35,
        weeksDuration: 6,
        successRate: '98.1%',
        focusTopics: ['Rút gọn căn thức', 'Hệ phương trình bậc nhất', 'Hàm số y = ax²', 'Góc nội tiếp'],
        riskNote: 'Cần tránh trừ điểm trình bày ở bài toán điều kiện xác định và kết luận nghiệm.'
      },
      english: {
        topicsCount: 24,
        totalTopics: 38,
        studyMinutes: 30,
        weeksDuration: 6,
        successRate: '97.8%',
        focusTopics: ['Thì của động từ', 'Câu bị động', 'Câu điều kiện loại 1, 2', 'Phát âm đuôi -ed/-s'],
        riskNote: 'Lưu ý các trường hợp bất quy tắc của động từ và giới từ đi kèm tính từ.'
      }
    },
    '8.5': {
      math: {
        topicsCount: 34,
        totalTopics: 42,
        studyMinutes: 45,
        weeksDuration: 8,
        successRate: '96.4%',
        focusTopics: ['Bài toán thực tế', 'Hệ thức Vi-ét ứng dụng', 'Phương trình chứa tham số m', 'Tứ giác nội tiếp'],
        riskNote: 'Dễ mất 0.5 điểm ở bài toán thực tế nếu không đặt đúng đơn vị và điều kiện ẩn.'
      },
      english: {
        topicsCount: 30,
        totalTopics: 38,
        studyMinutes: 40,
        weeksDuration: 8,
        successRate: '96.2%',
        focusTopics: ['Mệnh đề quan hệ', 'Câu gián tiếp nâng cao', 'Cụm động từ (Phrasal Verbs)', 'Đọc hiểu suy luận'],
        riskNote: 'Phần điền từ vào đoạn văn cần phân biệt kỹ từ loại danh từ/tính từ.'
      }
    },
    '9.0': {
      math: {
        topicsCount: 38,
        totalTopics: 42,
        studyMinutes: 55,
        weeksDuration: 10,
        successRate: '94.2%',
        focusTopics: ['Vi-ét nâng cao', 'Hình học tiếp tuyến & cát tuyến', 'Hình học không gian nón - trụ - cầu', 'Bất đẳng thức phụ'],
        riskNote: 'Cần rèn luyện phản xạ vẽ thêm đường phụ trong bài hình câu c.'
      },
      english: {
        topicsCount: 35,
        totalTopics: 38,
        studyMinutes: 45,
        weeksDuration: 10,
        successRate: '94.6%',
        focusTopics: ['Cụm từ cố định (Collocations)', 'Đảo ngữ', 'Tìm lỗi sai ngữ nghĩa', 'Thành ngữ thông dụng'],
        riskNote: 'Các câu phân hóa 9+ thường đánh đố vào sắc thái nghĩa của từ đồng nghĩa.'
      }
    },
    '9.5': {
      math: {
        topicsCount: 42,
        totalTopics: 42,
        studyMinutes: 65,
        weeksDuration: 12,
        successRate: '91.8%',
        focusTopics: ['Bất đẳng thức Cauchy/Schwarz', 'Tìm Min/Max biểu thức đối xứng', 'Cực trị hình học', 'Phương trình vô tỉ'],
        riskNote: 'Câu 0.5 điểm cuối đòi hỏi kỹ năng biến đổi đại số tinh tế và đánh giá chặn miền giá trị.'
      },
      english: {
        topicsCount: 38,
        totalTopics: 38,
        studyMinutes: 60,
        weeksDuration: 12,
        successRate: '92.5%',
        focusTopics: ['Ngữ pháp nâng cao toàn diện', 'Đọc hiểu chuyên sâu học thuật', 'Viết câu chuyển đổi đa dạng'],
        riskNote: 'Cần đạt độ chính xác tuyệt đối (không sai bất kỳ câu ngữ pháp cơ bản nào).'
      }
    }
  },
  'standard-public': {
    '8.0': {
      math: {
        topicsCount: 24,
        totalTopics: 42,
        studyMinutes: 30,
        weeksDuration: 5,
        successRate: '98.7%',
        focusTopics: ['Rút gọn căn thức', 'Giải hệ phương trình', 'Đồ thị hàm số', 'Góc và đường tròn'],
        riskNote: 'Nắm chắc 7 điểm cơ bản, không để mất điểm ở các câu tính toán số học.'
      },
      english: {
        topicsCount: 22,
        totalTopics: 38,
        studyMinutes: 25,
        weeksDuration: 5,
        successRate: '98.5%',
        focusTopics: ['Các thì cơ bản', 'Từ vựng SGK', 'Ngữ âm cơ bản', 'Đọc hiểu thông tin trực tiếp'],
        riskNote: 'Luyện tập đều đặn từ vựng trong sách giáo khoa là đạt 8 điểm.'
      }
    },
    '8.5': {
      math: {
        topicsCount: 30,
        totalTopics: 42,
        studyMinutes: 40,
        weeksDuration: 7,
        successRate: '97.2%',
        focusTopics: ['Bài toán thực tế', 'Hệ thức Vi-ét cơ bản', 'Chứng minh tứ giác nội tiếp'],
        riskNote: 'Tập trung luyện dạng toán thực tế phương trình bậc nhất/bậc hai.'
      },
      english: {
        topicsCount: 26,
        totalTopics: 38,
        studyMinutes: 35,
        weeksDuration: 7,
        successRate: '97.0%',
        focusTopics: ['Liên từ kết nối', 'Giới từ chỉ thời gian & nơi chốn', 'Câu so sánh hơn/nhất'],
        riskNote: 'Tránh nhầm lẫn dạng so sánh của tính từ dài và ngắn.'
      }
    },
    '9.0': {
      math: {
        topicsCount: 36,
        totalTopics: 42,
        studyMinutes: 50,
        weeksDuration: 9,
        successRate: '95.3%',
        focusTopics: ['Tương giao Parabol & Đường thẳng', 'Vi-ét phân thức', 'Hình học câu b, c'],
        riskNote: 'Cần làm chủ phương pháp giải hệ phương trình chứa căn.'
      },
      english: {
        topicsCount: 32,
        totalTopics: 38,
        studyMinutes: 45,
        weeksDuration: 9,
        successRate: '95.8%',
        focusTopics: ['Đọc hiểu nâng cao', 'Cấu trúc used to / be used to', 'Từ đồng nghĩa & trái nghĩa'],
        riskNote: 'Chú ý các bẫy từ trái nghĩa trong bài thi trắc nghiệm.'
      }
    },
    '9.5': {
      math: {
        topicsCount: 40,
        totalTopics: 42,
        studyMinutes: 60,
        weeksDuration: 11,
        successRate: '93.1%',
        focusTopics: ['Bất đẳng thức Min/Max', 'Hình học cực trị', 'Phương trình vô tỉ'],
        riskNote: 'Dành 15 phút cuối cùng để rà soát lại toàn bộ bài làm trước khi nộp.'
      },
      english: {
        topicsCount: 36,
        totalTopics: 38,
        studyMinutes: 50,
        weeksDuration: 11,
        successRate: '93.8%',
        focusTopics: ['Đảo ngữ với No sooner/Hardly', 'Mệnh đề danh từ', 'Từ vựng chủ đề nâng cao'],
        riskNote: 'Cần luyện tốc độ làm đề trắc nghiệm dưới 40 phút.'
      }
    }
  },
  'gifted': {
    '8.0': {
      math: {
        topicsCount: 32,
        totalTopics: 42,
        studyMinutes: 45,
        weeksDuration: 8,
        successRate: '95.5%',
        focusTopics: ['Đại số chuyên sâu', 'Phương trình nghiệm nguyên', 'Đồng dư thức'],
        riskNote: 'Đề thi Chuyên yêu cầu chứng minh chặt chẽ từng bước suy luận.'
      },
      english: {
        topicsCount: 30,
        totalTopics: 38,
        studyMinutes: 45,
        weeksDuration: 8,
        successRate: '95.2%',
        focusTopics: ['Word Formation chuyên sâu', 'C2 Proficiency Vocab', 'Cloze Test nâng cao'],
        riskNote: 'Cần nắm chắc bảng biến đổi từ loại (Word Formation gia đình từ).'
      }
    },
    '8.5': {
      math: {
        topicsCount: 36,
        totalTopics: 42,
        studyMinutes: 55,
        weeksDuration: 10,
        successRate: '93.7%',
        focusTopics: ['Số học & Đồng dư', 'Bất đẳng thức AM-GM, Cauchy', 'Hình học Menelaus/Ceva'],
        riskNote: 'Bài số học và bất đẳng thức là hai câu phân loại thí sinh rõ rệt.'
      },
      english: {
        topicsCount: 34,
        totalTopics: 38,
        studyMinutes: 50,
        weeksDuration: 10,
        successRate: '94.0%',
        focusTopics: ['Idiomatic Expressions', 'Inversion & Subjunctive', 'Advanced Sentence Transformation'],
        riskNote: 'Viết lại câu không đổi nghĩa không được sai sót lỗi chính tả dù là 1 chữ.'
      }
    },
    '9.0': {
      math: {
        topicsCount: 40,
        totalTopics: 42,
        studyMinutes: 70,
        weeksDuration: 12,
        successRate: '91.2%',
        focusTopics: ['Tổ hợp & Nguyên lý Dirichlet', 'Bất đẳng thức Schur/SOS', 'Tứ giác toàn phần & Trục đẳng phương'],
        riskNote: 'Cần làm chủ nguyên lý Dirichlet và các bài toán phân hoạch rời rạc.'
      },
      english: {
        topicsCount: 37,
        totalTopics: 38,
        studyMinutes: 60,
        weeksDuration: 12,
        successRate: '92.1%',
        focusTopics: ['C1/C2 Vocabulary Mastery', 'Error Identification khó', 'Đọc hiểu học thuật SAT/IELTS'],
        riskNote: 'Đòi hỏi vốn từ vựng học thuật phong phú và tư duy phản biện sắc sảo.'
      }
    },
    '9.5': {
      math: {
        topicsCount: 42,
        totalTopics: 42,
        studyMinutes: 85,
        weeksDuration: 14,
        successRate: '88.9%',
        focusTopics: ['Toàn bộ chuyên đề Olympic & Chuyên', 'Cực trị tổ hợp', 'Đa thức & Phương trình hàm'],
        riskNote: 'Mục tiêu Thủ khoa/Á khoa trường Chuyên. Đòi hỏi sự bền bỉ và tình yêu toán học thực thụ.'
      },
      english: {
        topicsCount: 38,
        totalTopics: 38,
        studyMinutes: 75,
        weeksDuration: 14,
        successRate: '89.5%',
        focusTopics: ['Hoàn thiện 100% ngữ pháp & từ vựng Anh ngữ', 'Chinh phục bài thi chuyên toàn diện'],
        riskNote: 'Đạt điểm tuyệt đối trong đề thi vào Chuyên Anh là thành tích xuất sắc hàng đầu.'
      }
    }
  }
};

export const TargetScoreCalculator: React.FC = () => {
  const [school, setSchool] = useState<SchoolTarget>('top-public');
  const [score, setScore] = useState<ScoreTarget>('9.0');
  const [subject, setSubject] = useState<SubjectTarget>('math');

  const result = CALC_DATABASE[school][score][subject];

  return (
    <section className="w-full py-12 md:py-16 reveal-on-scroll" aria-labelledby="target-calc-heading">
      <div className="bento-card p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-card/90">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-10 text-left">
          <div className="badge-capsule mb-3">
            <Target size={14} className="text-primary animate-pulse" />
            <span>Cá Nhân Hóa Lộ Trình</span>
          </div>
          <h2 id="target-calc-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Tính toán khối lượng ôn tập <span className="gradient-text">theo mục tiêu điểm số</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            Chọn mục tiêu trường thi và điểm số bạn mong muốn để hệ thống phân tích khối lượng dạng bài, 
            thời gian cam kết và các điểm bẫy cần lưu ý.
          </p>
        </div>

        {/* Interactive Control & Dynamic Result Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTROLS (7 columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Control 1: Trường mục tiêu */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                1. Mục tiêu trường THPT dự thi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'top-public' as SchoolTarget, title: 'THPT Top 1 Công Lập', desc: 'Chu Văn An, Kim Liên, Bùi Thị Xuân...' },
                  { id: 'standard-public' as SchoolTarget, title: 'THPT Chuẩn / Đại Trà', desc: 'Điểm chuẩn 32 - 38 điểm' },
                  { id: 'gifted' as SchoolTarget, title: 'Khối THPT Chuyên', desc: 'KHTN, Sư Phạm, Ams, LHP...' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSchool(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      school === item.id
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                        : 'border-border bg-secondary/40 hover:bg-secondary/70'
                    }`}
                  >
                    <p className="text-xs font-black text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Điểm số mục tiêu */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                2. Điểm số mục tiêu mong muốn
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {(['8.0', '8.5', '9.0', '9.5'] as ScoreTarget[]).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScore(val)}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      score === val
                        ? 'border-primary bg-primary text-primary-foreground font-black shadow-md'
                        : 'border-border bg-secondary/40 hover:bg-secondary/70 text-foreground font-extrabold'
                    }`}
                  >
                    <span className="text-base sm:text-lg block">{val}+</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80 block mt-0.5">
                      {val === '8.0' ? 'NV1 Chuẩn' : val === '8.5' ? 'An Toàn' : val === '9.0' ? 'Xuất Sắc' : 'Thủ Khoa'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Môn học */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                3. Môn học phân tích trọng tâm
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubject('math')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    subject === 'math'
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black ring-1 ring-blue-500/30'
                      : 'border-border bg-secondary/40 hover:bg-secondary/70 text-foreground font-bold'
                  }`}
                >
                  📐 Toán thi vào 10
                </button>
                <button
                  type="button"
                  onClick={() => setSubject('english')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    subject === 'english'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black ring-1 ring-amber-500/30'
                      : 'border-border bg-secondary/40 hover:bg-secondary/70 text-foreground font-bold'
                  }`}
                >
                  🌐 Tiếng Anh thi vào 10
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: DYNAMIC RESULT CARD (5 columns) */}
          <div className="lg:col-span-5 spotlight-card island-nav p-6 sm:p-7 rounded-3xl shadow-xl border border-primary/20 space-y-5 text-left animate-in fade-in duration-300">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles size={14} /> Lộ Trình Khuyến Nghị
              </span>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {result.successRate} Đỗ Mục Tiêu
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-card border border-border">
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                  <BookOpen size={12} className="text-primary" /> Khối lượng
                </p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-1">
                  {result.topicsCount}<span className="text-sm font-semibold text-muted-foreground">/{result.totalTopics}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">Dạng bài trọng tâm</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border">
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                  <Clock size={12} className="text-amber-500" /> Cam kết học
                </p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-1">
                  {result.studyMinutes}<span className="text-sm font-semibold text-muted-foreground">p/ngày</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">Trong {result.weeksDuration} tuần ôn tập</p>
              </div>
            </div>

            {/* Focus Topics List */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-black text-foreground uppercase tracking-wider">
                Chuyên đề quyết định điểm số:
              </p>
              <div className="space-y-1.5">
                {result.focusTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk / Caveat Note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-foreground">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="font-extrabold text-amber-700 dark:text-amber-300">Bẫy điểm thi: </strong>
                {result.riskNote}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Link
                to="/roadmap/"
                className="btn-shimmer w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-all"
              >
                <span>Bắt đầu lộ trình này ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
