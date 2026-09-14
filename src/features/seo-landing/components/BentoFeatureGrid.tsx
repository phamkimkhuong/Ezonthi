import React, { useState, useEffect } from 'react';
import { Network, Sparkles, BookMarked, Timer, ArrowUpRight, CheckCircle2, Bot, Trophy, Flame, Lock, RotateCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BentoFeatureGrid: React.FC = () => {
  // 1. Skill tree stage interactive selection
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(2);

  // 2. Mistake flashcard flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // 3. AI Socratic chat switch state
  const [aiChatIdx, setAiChatIdx] = useState(0);

  // 4. Live Exam countdown timer (45 minutes simulation)
  const [timeLeft, setTimeLeft] = useState(44 * 60 + 58);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 1 ? prev - 1 : 45 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const aiConversations = [
    {
      q: 'Thưa thầy, bài hình này nên vẽ thêm đường phụ nào để chứng minh 4 điểm thuộc đường tròn ạ?',
      a: '💡 Hãy thử nối bán kính OM và để ý góc nội tiếp chắn nửa đường tròn xem nhé! Em sẽ thấy ngay hai góc vuông đối diện.'
    },
    {
      q: 'Dấu hiệu nhận biết rõ nhất khi nào cần đặt ẩn phụ cho bài toán đại số vào 10 ạ?',
      a: '💡 Khi em nhận thấy một biểu thức phức tạp lặp lại từ 2 lần trở lên (như căn bậc hai x + 1), hãy đặt t ngay để đưa về phương trình bậc hai cơ bản.'
    }
  ];

  return (
    <section className="w-full py-12 md:py-16" aria-labelledby="features-heading">
      {/* Section Header */}
      <div className="max-w-3xl mb-10 md:mb-14 text-left reveal-on-scroll">
        <div className="badge-capsule mb-3">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span>Công Nghệ Học Tập Đột Phá 2.0</span>
        </div>
        <h2 id="features-heading" className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight text-foreground leading-tight">
          Phương pháp học thông minh giúp <span className="gradient-text">tối ưu từng phút học</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
          Không học vẹt, không làm đề ngẫu nhiên. ezonthi xây dựng hệ thống khép kín từ chẩn đoán lỗ hổng, 
          luyện tập tăng tiến độ khó đến khắc phục triệt để lỗi sai.
        </p>
      </div>

      {/* Bento Grid 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5 reveal-group">
        
        {/* CARD 1: CÂY TRI THỨC TƯƠNG TÁC (Chiếm 7 cột) */}
        <div className="md:col-span-3 lg:col-span-7 bento-card p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
                <Network size={22} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                Skill Tree • Chạm để thử
              </span>
            </div>

            <h3 className="mt-5 text-xl sm:text-2xl font-black text-foreground">
              Lộ trình Cây Tri Thức: Nắm chắc từ gốc đến ngọn
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Mỗi môn học được chia nhỏ thành mạng lưới các dạng bài liên kết logic. Học sinh chạm vào từng giai đoạn để xem chi tiết dạng bài:
            </p>
          </div>

          {/* Interactive Skill Tree Node Stages */}
          <div className="mt-6 pt-5 border-t border-border/80">
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Stage 1 Node */}
              <button
                type="button"
                onClick={() => setActiveStage(1)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeStage === 1
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-border bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">GIAI ĐOẠN 1</span>
                  <CheckCircle2 size={13} className="text-emerald-500" />
                </div>
                <p className="text-xs font-black text-foreground mt-1 truncate">Kiến thức nền</p>
                <p className="text-[10px] font-extrabold text-emerald-600 mt-1">100% Làm chủ</p>
              </button>

              {/* Stage 2 Node (Active by default) */}
              <button
                type="button"
                onClick={() => setActiveStage(2)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeStage === 2
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                    : 'border-border bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary">GIAI ĐOẠN 2</span>
                  <Flame size={13} className="text-amber-500" />
                </div>
                <p className="text-xs font-black text-foreground mt-1 truncate">Dạng bài trọng tâm</p>
                <p className="text-[10px] font-extrabold text-primary mt-1">Đang luyện 78%</p>
              </button>

              {/* Stage 3 Node */}
              <button
                type="button"
                onClick={() => setActiveStage(3)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeStage === 3
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30'
                    : 'border-border bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground">GIAI ĐOẠN 3</span>
                  <Lock size={12} className="text-muted-foreground" />
                </div>
                <p className="text-xs font-black text-foreground mt-1 truncate">Phân hóa 9+</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1">Mở khi đạt 80%</p>
              </button>

            </div>

            {/* Dynamic Stage Details Preview */}
            <div className="mt-3 p-3 rounded-xl bg-secondary/70 border border-border/80 flex items-center justify-between text-xs animate-in fade-in duration-200">
              {activeStage === 1 && (
                <div className="space-y-0.5">
                  <p className="font-extrabold text-foreground">🟢 Rút gọn căn thức & Hệ phương trình bậc nhất</p>
                  <p className="text-[11px] text-muted-foreground">Đã đạt 12/12 dạng bài cơ bản • Nền tảng vững chắc</p>
                </div>
              )}
              {activeStage === 2 && (
                <div className="space-y-0.5">
                  <p className="font-extrabold text-primary">⚡ Hàm số bậc nhất, Parabol & Bài toán thực tế</p>
                  <p className="text-[11px] text-muted-foreground">Chiếm 6.5 - 7.5 điểm cấu trúc đề thi tuyển sinh vào 10</p>
                </div>
              )}
              {activeStage === 3 && (
                <div className="space-y-0.5">
                  <p className="font-extrabold text-amber-600 dark:text-amber-400">🏆 Bất đẳng thức Min/Max & Hình học cực trị</p>
                  <p className="text-[11px] text-muted-foreground">Dành cho học sinh chinh phục điểm 9.5+ và trường Chuyên</p>
                </div>
              )}
              <Link to="/roadmap/" className="font-black text-primary hover:underline text-[11px] shrink-0 ml-2">
                Xem cây tri thức →
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: SỔ TAY LỖI SAI INTERACTIVE FLASHCARD (Chiếm 5 cột) */}
        <div className="md:col-span-3 lg:col-span-5 bento-card p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BookMarked size={22} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                Spaced Repetition
              </span>
            </div>

            <h3 className="mt-5 text-xl sm:text-2xl font-black text-foreground">
              Sổ Tay Câu Sai: Không mất điểm oan
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Mọi câu làm sai đều được lưu trữ tự động kèm nguyên nhân sai sót. Chạm vào thẻ bên dưới để xem mẹo khắc phục:
            </p>
          </div>

          {/* Interactive Flip Flashcard */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsFlipped(prev => !prev)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(prev => !prev); } }}
            className="mt-6 p-4 rounded-2xl border transition-all cursor-pointer shadow-sm relative overflow-hidden bg-card hover:border-amber-500/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/80">
              <span className="font-extrabold text-foreground flex items-center gap-1.5">
                <RotateCw size={13} className="text-amber-500 animate-spin [animation-duration:8s]" />
                {isFlipped ? 'Mẹo khắc phục triệt để' : 'Ghi chú lỗi sai #104'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isFlipped ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
              }`}>
                {isFlipped ? 'ĐÃ KHẮC PHỤC' : 'NHẦM ĐIỀU KIỆN'}
              </span>
            </div>

            {/* Flashcard Content */}
            <div className="py-3 text-xs leading-relaxed">
              {!isFlipped ? (
                <>
                  <p className="font-bold text-foreground">
                    "Cho pt (m - 1)x² - 2mx + m + 1 = 0 có 2 nghiệm phân biệt."
                  </p>
                  <p className="text-destructive font-semibold mt-1">
                    ⚠️ Lỗi sai: Thường chỉ tính Δ &gt; 0 mà quên đặt điều kiện a = m - 1 ≠ 0!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    💡 Mẹo vàng từ chuyên gia:
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    Luôn kiểm tra hệ số chứa tham số trước x². Nếu hệ số a chứa m, bắt buộc phải có điều kiện a ≠ 0 thì mới là phương trình bậc hai!
                  </p>
                </>
              )}
            </div>

            {/* Spaced Repetition Timeline */}
            <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
              <span>⏰ Lặp lại sau: 24h • 3 ngày</span>
              <span className="text-primary font-black flex items-center gap-0.5">
                {isFlipped ? '← Xem đề bài' : 'Chạm để lật →'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: GIA SƯ AI SOCRATIC 24/7 (Chiếm 5 cột) */}
        <div className="md:col-span-3 lg:col-span-5 bento-card p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Bot size={22} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                AI Socratic 24/7
              </span>
            </div>

            <h3 className="mt-5 text-xl sm:text-2xl font-black text-foreground">
              Gia Sư Trợ Lý AI: Gợi ý từng bước
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Không giải hộ, không đưa đáp án vẹt. AI đóng vai trò gia sư 1-1 khơi gợi tư duy logic để học sinh tự tìm ra cách giải:
            </p>
          </div>

          {/* Interactive Chat Bubble */}
          <div className="mt-6 space-y-2.5 text-xs">
            {/* Student Message */}
            <div className="p-3 rounded-2xl rounded-tr-sm bg-card border border-border text-foreground font-medium max-w-[88%] ml-auto shadow-2xs">
              <p className="text-[10px] font-black text-muted-foreground mb-1">Học sinh hỏi:</p>
              {aiConversations[aiChatIdx].q}
            </div>

            {/* AI Socratic Response with Typing Cursor */}
            <div className="p-3 rounded-2xl rounded-tl-sm bg-purple-500/10 border border-purple-500/20 text-foreground font-medium max-w-[92%]">
              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                <Sparkles size={11} /> AI Tutor phản hồi:
              </p>
              <p className="leading-relaxed">
                {aiConversations[aiChatIdx].a}
                <span className="inline-block w-1.5 h-3.5 bg-purple-500 ml-1 animate-pulse" aria-hidden="true" />
              </p>
            </div>

            {/* Switch question button */}
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={() => setAiChatIdx(prev => (prev === 0 ? 1 : 0))}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <HelpCircle size={12} /> Thử câu hỏi khác của học sinh
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: PHÒNG THI THỬ LIVE COUNTDOWN TIMER (Chiếm 7 cột) */}
        <div className="md:col-span-3 lg:col-span-7 bento-card p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Timer size={22} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Countdown
              </span>
            </div>

            <h3 className="mt-5 text-xl sm:text-2xl font-black text-foreground">
              Phòng Thi Thử Bấm Giờ: Rèn luyện tâm lý phòng thi
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Bộ đề chuẩn ma trận thi tuyển sinh với đồng hồ đếm ngược thời gian thực. 
              Sau khi nộp bài, hệ thống tự động đối soát phổ điểm và xếp hạng thi đua:
            </p>
          </div>

          {/* Live Exam Simulator Box */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-secondary/80 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Exam info + Progress */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-black">
                  <Trophy size={15} />
                </span>
                <div>
                  <p className="text-xs font-black text-foreground">Đề thi thử Tuyển sinh Lớp 10 — Mã đề 101</p>
                  <p className="text-[11px] text-muted-foreground">32/40 câu đã hoàn thành • 1,420 bạn đang cùng thi</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/60">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Live Clock & Action */}
            <div className="flex items-center sm:flex-col items-end gap-2.5 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-card border border-border font-mono text-sm sm:text-base font-black text-primary flex items-center gap-1.5 shadow-2xs">
                <Timer size={15} className="text-amber-500" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <Link
                to="/exam/"
                className="btn-shimmer inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-sm"
              >
                Vào thi thử <ArrowUpRight size={13} />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
