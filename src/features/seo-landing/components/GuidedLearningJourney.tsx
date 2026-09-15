import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  RotateCw, 
  ArrowRight, 
  Bot, 
  Timer, 
  Trophy, 
  Compass, 
  HelpCircle,
  Brain,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface KnowledgeNode {
  id: string;
  name: string;
  scoreWeight: string;
  mastery: number;
  status: 'mastered' | 'learning' | 'locked';
  color: string;
}

const KNOWLEDGE_NODES: KnowledgeNode[] = [
  { id: 'n1', name: 'Rút gọn căn thức', scoreWeight: '1.5 - 2.0đ', mastery: 100, status: 'mastered', color: 'emerald' },
  { id: 'n2', name: 'Hệ phương trình bậc nhất', scoreWeight: '1.0đ', mastery: 100, status: 'mastered', color: 'emerald' },
  { id: 'n3', name: 'Hàm số & Parabol y = ax²', scoreWeight: '1.5đ', mastery: 82, status: 'learning', color: 'blue' },
  { id: 'n4', name: 'Hệ thức Vi-ét có tham số', scoreWeight: '1.5đ', mastery: 75, status: 'learning', color: 'blue' },
  { id: 'n5', name: 'Bài toán thực tế liên môn', scoreWeight: '1.0 - 1.5đ', mastery: 68, status: 'learning', color: 'amber' },
  { id: 'n6', name: 'Tứ giác nội tiếp & Tiếp tuyến', scoreWeight: '2.5 - 3.0đ', mastery: 70, status: 'learning', color: 'blue' },
  { id: 'n7', name: 'Bất đẳng thức Min/Max 9+', scoreWeight: '0.5 - 1.0đ', mastery: 35, status: 'locked', color: 'purple' },
];

export const GuidedLearningJourney: React.FC = () => {
  // Stage 1: Active level tab
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(2);
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(KNOWLEDGE_NODES[3]);

  // Stage 2: Mistake Flashcard Flip
  const [isFlipped, setIsFlipped] = useState(false);

  // Stage 3: AI Socratic Chat Index
  const [aiChatIdx, setAiChatIdx] = useState(0);

  // Stage 3: Live Exam Timer
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
      q: 'Thưa thầy, bài hình này nên vẽ thêm đường phụ nào để chứng minh 4 điểm cùng thuộc đường tròn ạ?',
      a: '💡 Hãy thử nối bán kính OM và quan sát góc nội tiếp chắn nửa đường tròn xem nhé! Em sẽ nhận ra ngay hai góc đối diện cùng nhìn cạnh dưới góc 90°.'
    },
    {
      q: 'Dấu hiệu nhận biết rõ nhất khi nào cần đặt ẩn phụ cho phương trình chứa căn bậc hai ạ?',
      a: '💡 Khi em phát hiện một cụm biểu thức phức tạp lặp lại từ 2 lần trở lên (như √(x + 1)), hãy đặt ẩn phụ t ngay để đưa về phương trình bậc hai cơ bản quen thuộc.'
    }
  ];

  return (
    <section className="w-full py-12 md:py-20 space-y-20 md:space-y-32" aria-labelledby="journey-heading">
      
      {/* Section Global Header */}
      <div className="max-w-3xl text-left reveal-on-scroll">
        <div className="badge-capsule mb-3.5">
          <Compass size={14} className="text-primary animate-pulse" />
          <span>The Guided Learning Journey • Độc Quyền</span>
        </div>
        <h2 id="journey-heading" className="text-2xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-foreground leading-[1.18]">
          Hành trình 3 chặng biến kiến thức thành <span className="gradient-text">phản xạ điểm 9+</span>
        </h2>
        <p className="mt-3.5 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl">
          Không học vẹt, không làm đề vô định. ezonthi mở ra không gian học tập liền mạch dẫn dắt học sinh 
          từ định vị lỗ hổng, sửa triệt để câu sai đến rèn bản lĩnh tự tin bước vào phòng thi thật.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* CHẶNG 01: ĐỊNH VỊ LỖ HỔNG TRÊN CÂY TRI THỨC (SPLIT-SCREEN BORDERLESS) */}
      {/* ========================================================================= */}
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Narrative Story & Level Selector (6 cols) */}
        <div className="lg:col-span-6 space-y-6 text-left reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-2xs">
            <Brain size={13} className="text-blue-600 dark:text-blue-400" /> Chặng 01 • Bản Đồ Kiến Thức
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-black text-foreground tracking-tight leading-tight">
            Không học lan man. Định vị chính xác từng mắt xích kiến thức.
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Thay vì làm hàng trăm câu đề ngẫu nhiên gây kiệt sức, ezonthi chia nhỏ toàn bộ chương trình thi vào 10 thành 
            <strong className="font-extrabold text-foreground"> 14 chuyên đề và 128 dạng bài mắt xích</strong>. 
            Học sinh luôn biết chính xác mình đang vững phần nào và hổng ở đâu.
          </p>

          {/* Interactive Level Selector */}
          <div className="space-y-3 pt-2">
            {[
              {
                lvl: 1 as const,
                tag: 'GIAI ĐOẠN 1 (NỀN TẢNG)',
                title: 'Làm chủ 100% kiến thức cơ bản (5.0 - 6.5đ)',
                desc: 'Rút gọn biểu thức chứa căn, giải hệ phương trình, đồ thị bậc nhất.',
                icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              },
              {
                lvl: 2 as const,
                tag: 'GIAI ĐOẠN 2 (TRỌNG TÂM)',
                title: 'Dạng bài quyết định điểm số NV1 (7.0 - 8.5đ)',
                desc: 'Hàm số Parabol & tương giao, hệ thức Vi-ét, bài toán thực tế, tứ giác nội tiếp.',
                icon: <Flame size={16} className="text-amber-500 shrink-0" />
              },
              {
                lvl: 3 as const,
                tag: 'GIAI ĐOẠN 3 (PHÂN HÓA 9+)',
                title: 'Chinh phục Thủ khoa & Trường Chuyên (9.0 - 10đ)',
                desc: 'Bất đẳng thức Min/Max, phương trình vô tỉ nâng cao, hình học cực trị.',
                icon: <Sparkles size={16} className="text-indigo-500 shrink-0" />
              }
            ].map(item => {
              const isActive = activeLevel === item.lvl;
              return (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => setActiveLevel(item.lvl)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25 scale-[1.01]'
                      : 'border-border/80 bg-card/60 hover:bg-card'
                  }`}
                >
                  <div className="mt-0.5">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{item.tag}</span>
                      {isActive && (
                        <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
                          Đang xem <ArrowRight size={11} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-black text-foreground mt-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/roadmap/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-primary hover:underline"
            >
              <span>Khám phá toàn bộ Cây Tri Thức Toán & Tiếng Anh</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive Knowledge Matrix Visualizer (6 cols) */}
        <div className="lg:col-span-6 reveal-on-scroll">
          <div className="p-6 sm:p-8 rounded-3xl island-nav border border-primary/20 shadow-2xl relative overflow-hidden">
            
            {/* Top Bar info */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Bản Đồ Mạng Lưới Dạng Bài Tuyển Sinh
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-0.5 rounded-full bg-secondary">
                Rê chuột để xem dạng bài
              </span>
            </div>

            {/* Interactive Node Graph Flow */}
            <div className="space-y-3 relative">
              {KNOWLEDGE_NODES.map((node, index) => {
                const isSelected = hoveredNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/30 translate-x-1.5'
                        : 'border-border/70 bg-card/70 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black shrink-0 ${
                        node.status === 'mastered'
                          ? 'bg-primary/15 text-primary'
                          : node.status === 'learning'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-black text-foreground truncate">{node.name}</p>
                        <p className="text-[11px] text-muted-foreground font-semibold">Tỷ trọng trong đề: {node.scoreWeight}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-muted-foreground">Mức độ làm chủ</p>
                        <p className="text-xs font-black text-foreground">{node.mastery}%</p>
                      </div>
                      <div className="w-12 sm:w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${node.mastery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hovered Node Preview Box */}
            {hoveredNode && (
              <div className="mt-5 p-4 rounded-2xl bg-secondary/80 border border-border flex items-center justify-between text-xs animate-in fade-in duration-200">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-foreground flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    Chuyên đề: {hoveredNode.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Chiếm {hoveredNode.scoreWeight} tổng điểm • 100% câu hỏi có video & lời giải từng bước.
                  </p>
                </div>
                <Link to="/roadmap/" className="text-[11px] font-black text-primary hover:underline shrink-0 ml-3">
                  Luyện ngay →
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CHẶNG 02: SỔ TAY LỖI SAI & SPACED REPETITION (ZIGZAG FLOW) */}
      {/* ========================================================================= */}
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: 3D Spaced Repetition Engine & Interactive Flashcard (6 cols) */}
        <div className="lg:col-span-6 order-2 lg:order-1 reveal-on-scroll">
          <div className="space-y-5">
            
            {/* Spaced Timeline Box */}
            <div className="p-5 sm:p-6 rounded-3xl island-nav border border-border/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-foreground">
                <span className="flex items-center gap-1.5">
                  <RotateCw size={13} className="text-primary animate-spin [animation-duration:8s]" />
                  Chu Kỳ Ôn Lặp Spaced Repetition
                </span>
                <span className="text-muted-foreground">Thuật toán thông minh</span>
              </div>

              {/* 4-Step Memory Retention Progress */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { step: '01', title: 'Làm sai', time: 'Phút 0', bg: 'bg-secondary/70 text-foreground border-border/70' },
                  { step: '02', title: 'Nhắc lại', time: 'Sau 24h', bg: 'bg-secondary/70 text-foreground border-border/70' },
                  { step: '03', title: 'Kiểm tra', time: 'Sau 3 ngày', bg: 'bg-secondary/70 text-foreground border-border/70' },
                  { step: '04', title: 'Làm chủ', time: 'Vĩnh viễn', bg: 'bg-primary/10 text-primary border-primary/30' },
                ].map(item => (
                  <div key={item.step} className={`p-2.5 rounded-xl border ${item.bg}`}>
                    <span className="text-[10px] font-black opacity-75">{item.step}</span>
                    <p className="text-[11px] font-black mt-0.5 truncate">{item.title}</p>
                    <p className="text-[9px] font-bold opacity-80 mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Flip Flashcard */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsFlipped(prev => !prev)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(prev => !prev); } }}
              className="p-6 sm:p-7 rounded-3xl border border-border bg-card hover:border-primary/50 shadow-xl transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between text-xs pb-3 border-b border-border/80">
                <span className="font-black text-foreground flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  {isFlipped ? '💡 Mẹo Khắc Phục Triệt Để' : '⚠️ Ghi Chú Lỗi Sai Điển Hình #104'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  isFlipped ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {isFlipped ? 'ĐÃ HIỂU BẢN CHẤT' : 'BẪY HỆ SỐ a ≠ 0'}
                </span>
              </div>

              {/* Flashcard Body */}
              <div className="py-4 text-xs sm:text-sm leading-relaxed">
                {!isFlipped ? (
                  <>
                    <p className="font-extrabold text-foreground">
                      "Cho phương trình (m - 1)x² - 2mx + m + 1 = 0 có 2 nghiệm phân biệt."
                    </p>
                    <p className="text-muted-foreground font-semibold mt-2">
                      ⚠️ Bẫy đề thi: 85% học sinh chỉ nhớ tính Δ &gt; 0 mà quên bẵng điều kiện tiên quyết a = m - 1 ≠ 0 để phương trình thực sự là bậc hai!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-black text-primary">
                      💡 Bí quyết ghi nhớ từ Chuyên gia Toán học:
                    </p>
                    <p className="text-foreground font-medium mt-2">
                      Trước khi tính delta (Δ), luôn tự hỏi: <em>"Hệ số a trước x² có chứa tham số m không?"</em>. Nếu có, bắt buộc phải chia trường hợp hoặc đặt điều kiện a ≠ 0 trước tiên!
                    </p>
                  </>
                )}
              </div>

              {/* Bottom Flip Action */}
              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Chạm bất kỳ đâu để {isFlipped ? 'xem lại đề bài' : 'xem mẹo giải'}</span>
                <span className="text-primary font-black flex items-center gap-1">
                  {isFlipped ? '← Xem đề' : 'Lật xem mẹo →'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Narrative Story (6 cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-2xs">
            <RotateCw size={13} className="text-amber-600 dark:text-amber-400" /> Chặng 02 • Khắc Phục Triệt Để
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-black text-foreground tracking-tight leading-tight">
            Biến từng câu làm sai hôm nay thành điểm số chắc chắn trong kỳ thi thật.
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            <em>"Sai không đáng sợ. Đáng sợ là lặp lại đúng lỗi sai đó khi ngồi trong phòng thi chính thức."</em>
          </p>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            <p>
              Mọi câu hỏi làm sai trên ezonthi đều được tự động lưu trữ vào <strong>Sổ Tay Thông Minh</strong>. 
              Hệ thống không bắt học sinh chép phạt vô nghĩa, mà phân loại chính xác nguyên nhân: 
              <em> hiểu sai lý thuyết, nhầm lẫn công thức hay thiếu điều kiện ràng buộc</em>.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              'Tự động kích hoạt chu kỳ nhắc lại 24h - 3 ngày - 7 ngày trước khi não bộ quên lãng.',
              'Gợi ý câu hỏi biến thể tương đương để kiểm tra xem học sinh đã hiểu bản chất hay chưa.',
              '98.4% học sinh khắc phục hoàn toàn các lỗi sai ngớ ngẩn sau 2 tuần luyện tập cùng Sổ tay.'
            ].map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/notebook/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Tìm hiểu thêm về Sổ Tay Lỗi Sai Thông Minh</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CHẶNG 03: GIA SƯ AI SOCRATIC & PHÒNG THI THỬ BẤM GIỜ (PANORAMIC SHOWCASE) */}
      {/* ========================================================================= */}
      <div className="space-y-10 text-left">
        
        {/* Header Chặng 3 */}
        <div className="max-w-2xl reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-2xs mb-3">
            <Bot size={13} className="text-indigo-600 dark:text-indigo-400" /> Chặng 03 • Rèn Luyện Bản Lĩnh
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-black text-foreground tracking-tight leading-tight">
            Tư duy độc lập cùng Gia sư AI. Tự tin vững vàng trong phòng thi thật.
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            AI đồng hành không giải hộ mà dẫn dắt phương pháp, kết hợp phòng thi bấm giờ chuẩn ma trận 
            giúp học sinh tôi luyện tâm lý thi cử vững vàng nhất.
          </p>
        </div>

        {/* 2 Showcase Cards Side by Side */}
        <div className="grid md:grid-cols-2 gap-7 reveal-group">
          
          {/* Sub-card A: Gia Sư Trợ Lý AI 24/7 */}
          <div className="p-6 sm:p-8 rounded-3xl island-nav border border-indigo-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Bot size={22} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  AI Socratic 1-1
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-black text-foreground mt-4">
                Gia Sư Trợ Lý AI: Khơi gợi từng bước, không giải hộ
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground font-medium leading-relaxed">
                Đóng vai người thầy định hướng, đưa ra các câu hỏi gợi mở để học sinh tự mình nhận diện mấu chốt:
              </p>
            </div>

            {/* Chat Interaction Simulation */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl rounded-tr-sm bg-card border border-border text-foreground font-medium max-w-[90%] ml-auto shadow-2xs">
                <p className="text-[10px] font-black text-muted-foreground mb-1">Học sinh hỏi:</p>
                {aiConversations[aiChatIdx].q}
              </div>

              <div className="p-3.5 rounded-2xl rounded-tl-sm bg-indigo-500/10 border border-indigo-500/20 text-foreground font-medium max-w-[92%]">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                  <Sparkles size={11} /> AI Tutor phản hồi:
                </p>
                <p className="leading-relaxed">
                  {aiConversations[aiChatIdx].a}
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-1 animate-pulse" aria-hidden="true" />
                </p>
              </div>

              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={() => setAiChatIdx(prev => (prev === 0 ? 1 : 0))}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <HelpCircle size={12} /> Đổi câu hỏi tình huống khác
                </button>
              </div>
            </div>
          </div>

          {/* Sub-card B: Phòng Thi Thử Bấm Giờ */}
          <div className="p-6 sm:p-8 rounded-3xl island-nav border border-emerald-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Timer size={22} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Countdown
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-black text-foreground mt-4">
                Phòng Thi Thử Bấm Giờ: Đối soát phổ điểm chuẩn Sở GD&ĐT
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground font-medium leading-relaxed">
                Đề thi chuẩn cấu trúc tuyển sinh, rèn luyện tốc độ canh thời gian và bản lĩnh tâm lý phòng thi thật:
              </p>
            </div>

            {/* Exam Simulation Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/70 border border-border space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Trophy size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">Đề thi thử Tuyển sinh Lớp 10 — Mã 101</p>
                    <p className="text-[11px] text-muted-foreground">32/40 câu đã làm • 1,420 bạn đang cùng thi</p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-card border border-border font-mono text-sm font-black text-primary flex items-center gap-1 shrink-0">
                  <Timer size={14} className="text-amber-500" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/60">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full" style={{ width: '80%' }} />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Phổ điểm dự kiến: 8.5 - 9.0đ</span>
                <Link
                  to="/exam/"
                  className="btn-shimmer inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-sm"
                >
                  Vào thi thử <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

