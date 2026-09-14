# AGENT.md — Tài Liệu Nội Bộ Dự Án "Ôn Thi Vào 10"

> **Mục đích**: Cung cấp 100% ngữ cảnh cần thiết cho bất kỳ AI Agent nào tiếp nhận dự án từ phiên hội thoại mới. Đọc file này **trước khi làm bất kỳ thay đổi nào**.

---

## 1. Tổng Quan Dự Án

| Thuộc tính | Giá trị |
|---|---|
| **Tên dự án** | Ôn Thi Vào 10 (`on-thi-vao-10`) |
| **Mô tả** | Hệ thống ôn luyện trực tuyến cho học sinh từ lớp 9 (ôn thi vào lớp 10) đến lớp 10 (THPT), hỗ trợ nhiều môn học. Kiến trúc **Local-first** với đồng bộ đám mây Firebase. |
| **Framework** | React 19 + Vite 8 + TypeScript 6 |
| **Styling** | Tailwind CSS 4 (qua `@tailwindcss/vite` plugin) |
| **State Management** | Zustand (client state) + LocalStorage (persistence) |
| **Backend** | Firebase (Authentication, Firestore, Cloud Functions, Hosting, Storage, Analytics) |
| **AI Engine** | Google Gemini (qua Firebase Cloud Function `callGeminiProxy`) |
| **Routing** | React Router DOM v7 (createBrowserRouter) |
| **Math Rendering** | KaTeX |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Hosting** | Firebase Hosting |
| **Deploy** | `npm run deploy` = `tsc -b && vite build && firebase deploy --only hosting` |

---

## 2. Kiến Trúc Thư Mục

```
on-thi-vao-10/
├── src/                          # Mã nguồn frontend chính
│   ├── App.tsx                   # Root component, Router config, Auth listener
│   ├── main.tsx                  # Entry point (ReactDOM.createRoot)
│   ├── index.css                 # Global CSS (Tailwind imports + custom tokens)
│   ├── App.css                   # App-level styles
│   │
│   ├── types/
│   │   └── index.ts              # ⭐ MỌI TypeScript interface/type của toàn app
│   │
│   ├── data/                     # ⭐ Ngân hàng dữ liệu tĩnh (Source of Truth cho nội dung)
│   │   ├── index.ts              # Bộ nạp trung tâm (dynamic loader theo grade + subject)
│   │   ├── mathData.ts           # Legacy wrapper (redirect tới grade9/math)
│   │   ├── englishData.ts        # Legacy wrapper (redirect tới grade9/english)
│   │   ├── mockExamsData.ts      # Legacy wrapper
│   │   │
│   │   ├── grade9/               # ═══ DỮ LIỆU LỚP 9 (JSON) ═══
│   │   │   ├── math/
│   │   │   │   ├── topics.json           # Chương/Chặng học tập
│   │   │   │   ├── questionTypes.json    # Dạng bài (có theory, solvingSteps, commonMistakes)
│   │   │   │   ├── questions.json        # Ngân hàng câu hỏi
│   │   │   │   └── solutions.json        # Lời giải chi tiết
│   │   │   ├── english/
│   │   │   │   ├── topics.json
│   │   │   │   ├── questionTypes.json
│   │   │   │   ├── questions.json
│   │   │   │   └── solutions.json
│   │   │   ├── mockExamsList.json
│   │   │   ├── mockSolutionsList.json
│   │   │   ├── mathMockQuestions.json
│   │   │   └── englishMockQuestions.json
│   │   │
│   │   ├── grade10/              # ═══ DỮ LIỆU LỚP 10 (TypeScript) ═══
│   │   │   ├── math/
│   │   │   │   ├── topics.ts
│   │   │   │   ├── questionTypes.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── solutions.ts
│   │   │   ├── english/
│   │   │   │   ├── topics.ts
│   │   │   │   ├── questionTypes.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── solutions.ts
│   │   │   ├── chemistry/        # 🆕 Hóa học 10 (đang phát triển)
│   │   │   │   ├── topics.ts             # 9 chương (Module 0-8)
│   │   │   │   ├── questionTypes.ts      # 11 dạng bài (4 Module0 + 7 Module1)
│   │   │   │   ├── questions.ts          # 11 câu hỏi chẩn đoán
│   │   │   │   └── solutions.ts          # 11 lời giải phân tích ngộ nhận
│   │   │   └── mockExams.ts
│   │   │
│   │   └── english/              # Legacy data (redirect)
│   │
│   ├── services/                 # ⭐ Lớp dịch vụ nghiệp vụ
│   │   ├── firebase.ts           # Khởi tạo Firebase SDK (auth, db, functions, storage, analytics)
│   │   ├── storage.ts            # LocalStorage wrapper (CRUD cho attempts, mistakes, progress, exams)
│   │   ├── progressService.ts    # ⭐ Core Engine: XP, Level, Streak, Cloud Sync, Merge Guest↔Auth
│   │   ├── store.ts              # Zustand store (selectedSubject, selectedGrade, auth, darkMode)
│   │   ├── aiService.ts          # Client-side AI wrapper (gọi Cloud Function callGeminiProxy)
│   │   ├── proofImageService.ts  # Upload ảnh bài giải lên Firebase Storage
│   │   └── teacherAccessService.ts # Kiểm tra quyền giáo viên từ Firestore
│   │
│   ├── components/               # UI Components dùng chung
│   │   ├── ui/                   # Primitives (Button, Card, Progress, Tabs) - theo chuẩn shadcn/ui
│   │   ├── common/
│   │   │   ├── LatexRenderer.tsx         # Render công thức LaTeX bằng KaTeX
│   │   │   ├── AiTutorPanel.tsx          # Panel chat AI gia sư (nhúng trong PracticeEngine)
│   │   │   ├── AnswerFormRenderer.tsx    # Render form trả lời đa dạng (number, fraction, choice...)
│   │   │   ├── ProofImageUploader.tsx    # Upload ảnh bài giải tay
│   │   │   └── MathLoginRequired.tsx     # Guard yêu cầu đăng nhập
│   │   ├── layout/
│   │   │   └── AppLayout.tsx     # ⭐ Shell chính: Sidebar + Header + Context Dropdown (Lớp/Môn)
│   │   └── mistakes/
│   │       └── MistakeNotebook.tsx # Sổ lỗi sai 2 tầng (gom nhóm → chi tiết)
│   │
│   ├── features/                 # Các màn hình tính năng chính
│   │   ├── auth/
│   │   │   └── AuthPage.tsx              # Đăng nhập/Đăng ký (Firebase Auth)
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx             # Bảng điều khiển: XP, Level, tiến độ, dạng yếu nhất
│   │   ├── roadmap/
│   │   │   └── Roadmap.tsx               # Bản đồ lộ trình học (Tier 1→2→3, mở khóa dần)
│   │   ├── question-type/
│   │   │   └── QuestionTypeDetail.tsx    # Chi tiết dạng bài (Lý thuyết + Ví dụ mẫu + Hướng dẫn)
│   │   ├── practice-engine/
│   │   │   └── PracticeEngine.tsx        # ⭐ Bộ máy luyện tập (chỉ hiện dạng bài đã unlock)
│   │   ├── exam-engine/
│   │   │   └── ExamEngine.tsx            # Thi thử (timer + chấm điểm tự động)
│   │   ├── ai-tutor/
│   │   │   └── GeneralAiTutor.tsx        # Chat AI gia sư tổng quát (không gắn câu hỏi cụ thể)
│   │   ├── premium/
│   │   │   └── PremiumPricing.tsx        # Trang nâng cấp Premium
│   │   └── teacher/
│   │       └── TeacherDashboard.tsx       # Dashboard giáo viên (chấm bài, xem tiến độ học sinh)
│   │
│   └── utils/
│       ├── theme.ts              # ⭐ Hàm tính mastery score, XP→stars, subject theme colors
│       ├── answerValidator.ts    # Validate đáp án (exact, numeric, expression, choice...)
│       ├── greetingHelper.ts     # Lời chào thông minh theo thời gian trong ngày
│       ├── subject.ts            # Helper map SubjectCode → tên tiếng Việt
│       ├── cn.ts                 # clsx + tailwind-merge
│       └── proofImages.ts        # Helper xử lý ảnh proof
│
├── functions/                    # ═══ FIREBASE CLOUD FUNCTIONS (Backend) ═══
│   ├── src/
│   │   ├── index.ts              # Entry point (export các Cloud Function)
│   │   ├── config.ts             # Cấu hình Firebase Admin + Gemini API key
│   │   ├── types.ts              # Types cho Cloud Functions
│   │   ├── handlers/
│   │   │   ├── callGeminiProxy.ts    # ⭐ Main handler: gọi Gemini AI (RAG, tutor, eval)
│   │   │   ├── diagnose.ts           # Chẩn đoán học lực đầu vào
│   │   │   └── payment.ts            # Xử lý thanh toán Premium
│   │   └── services/
│   │       ├── gemini.ts             # Gemini SDK client
│   │       ├── aiProviders.ts        # Abstraction layer cho nhiều AI provider
│   │       ├── profile.ts            # Quản lý hồ sơ học sinh trên Firestore
│   │       ├── relevance.ts          # Đánh giá mức độ liên quan của câu hỏi
│   │       └── scaffolding.ts        # Chiến lược hỗ trợ từng bước (scaffolding)
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules               # Quy tắc bảo mật Firestore (owner-based + teacher role)
├── storage.rules                 # Quy tắc bảo mật Firebase Storage
├── firebase.json                 # Cấu hình Firebase project
├── firestore.indexes.json        # Firestore composite indexes
├── vite.config.ts                # Vite config (react plugin + tailwind plugin + @/ alias)
├── tsconfig.json                 # TypeScript config root
├── tsconfig.app.json             # TS config cho src/
├── tsconfig.node.json            # TS config cho vite.config
├── eslint.config.js              # ESLint flat config
├── index.html                    # HTML entry point
│
├── docs/                         # Tài liệu hướng dẫn
│   ├── content-guidelines.md     # Quy cách soạn nội dung câu hỏi
│   ├── question-authoring-guide.md # Hướng dẫn tạo câu hỏi mới
│   ├── learning-roadmap.md       # Lộ trình học tập tổng quan
│   ├── student-learning-flow.md  # Luồng trải nghiệm học sinh
│   ├── ai/                       # Tài liệu về AI integration
│   └── math/                     # Tài liệu chuyên môn Toán
│
└── public/                       # Tài nguyên tĩnh (favicon, manifest)
```

---

## 3. Mô Hình Dữ Liệu (Data Model)

### 3.1 Cấu trúc phân cấp nội dung

```
Grade (grade9 | grade10)
  └── Subject (SubjectCode: 'math' | 'english' | 'chemistry' | 'physics' | 'biology')
        └── Topic (Chương/Chặng)
              ├── tier: 1 | 2 | 3          ← Chặng học tập (1 = cơ bản, 2 = nâng cao, 3 = chuyên sâu)
              └── QuestionType (Dạng bài)
                    ├── difficulty: 'easy' | 'medium' | 'hard'
                    ├── examFrequency: 'low' | 'medium' | 'high'
                    ├── recognitionSigns: string[]     ← Dấu hiệu nhận dạng
                    ├── solvingSteps: string[]          ← Các bước giải
                    ├── commonMistakes: string[]        ← Lỗi sai thường gặp
                    ├── theory?: string[]               ← Lý thuyết
                    ├── subTypes?: SubType[]             ← Phân dạng con
                    └── Question (Câu hỏi)
                          ├── content: string (hỗ trợ LaTeX \\( ... \\))
                          ├── options?: string[]         ← Trắc nghiệm
                          ├── correctAnswer: string
                          ├── answerSchema?: AnswerSchema ← Form trả lời phức tạp
                          └── Solution (Lời giải)
                                ├── recognition: string
                                ├── detailedSteps: SolutionStep[]
                                ├── finalAnswer: string
                                ├── commonMistakes: string[]
                                └── reviewSuggestions: string[]  ← ⚠️ BẮT BUỘC
```

### 3.2 Các interface TypeScript quan trọng (src/types/index.ts)

| Interface | Mô tả | Trường bắt buộc đặc biệt |
|---|---|---|
| `SubjectCode` | Union type cho mã môn học | `'math' \| 'english' \| 'physics' \| 'chemistry' \| 'biology'` |
| `Topic` | Chương học | `tier: 1\|2\|3` |
| `QuestionType` | Dạng bài | `difficulty`, `examFrequency` — **THIẾU SẼ LỖI COMPILE** |
| `Question` | Câu hỏi | `subjectId: SubjectCode` (không phải string!) |
| `Solution` | Lời giải | `reviewSuggestions: string[]` — **BẮT BUỘC** |
| `UserProgress` | Tiến trình | `masteryLevels: Record<string, number>` (0-100, map qua `getStarsFromScore` thành 0-3 sao) |
| `UserAttempt` | Lần làm bài | `isCorrect`, `timeSpent` (giây), `createdAt` (ISO String) |
| `UserMistake` | Lỗi sai | `reviewStatus: 'new'\|'reviewing'\|'fixed'`, `nextReviewAt` |
| `AnswerSchema` | Schema form trả lời | `autoCheckMode: 'exact'\|'numeric'\|'unordered-numeric'\|...` |

### 3.3 Hệ thống Mastery Score (src/utils/theme.ts)

```
Công thức tính điểm mastery (0-100):
  - Chỉ lấy kết quả đã chấm mới nhất của từng questionId khác nhau
  - Bỏ qua bài manual còn pending
  - accuracy = correctCount / evidenceCount → 0-100
  - Cần đủ 5 câu có bằng chứng, hoặc toàn bộ câu nếu dạng có ít hơn 5
  - XP và streak không tham gia mastery

Chuyển đổi sang sao (getStarsFromScore):
  - 0-39 → 0 sao
  - 40-59 → 1 sao  
  - 60-79 → 2 sao
  - 80-100 → 3 sao (Mastered)
```

---

## 4. Bộ Nạp Dữ Liệu Trung Tâm (src/data/index.ts)

Đây là **điểm duy nhất** mà tất cả components lấy dữ liệu nội dung. Để tránh làm phình kích thước bundle khởi động (lên đến 5.3+ MB), dữ liệu môn học được nạp không đồng bộ và được lưu cache.

```typescript
// 1. Hàm nạp động không đồng bộ (nạp file khi người dùng chọn môn):
loadSubjectData(grade: 'grade9' | 'grade10', subject: SubjectCode): Promise<SubjectDataCache>

// 2. Các hàm getter đồng bộ (chỉ lấy dữ liệu khi cache đã được nạp sẵn):
getTopics(grade, subject): Topic[]
getQuestionTypes(grade, subject): QuestionType[]
getQuestions(grade, subject): Question[]
getSolutions(grade, subject): Solution[]
getMockExams(grade, subject): MockExam[]
getLearningOutcomes(grade, subject): any[]
getLearningMisconceptions(grade, subject): any[]
```

### Quy trình thêm môn học mới:

1. Tạo thư mục `src/data/grade{X}/{subject}/` với 4 file: `topics.ts`, `questionTypes.ts`, `questions.ts`, `solutions.ts`
2. Export named arrays (convention: `g{X}{Subject}Topics`, `g{X}{Subject}QuestionTypes`, ...)
3. Khai báo import động trong `loadSubjectData` tại `src/data/index.ts` và đưa dữ liệu nạp được vào cache.
4. Cập nhật `courseGroups` trong `src/components/layout/AppLayout.tsx` để hiển thị trong dropdown chọn môn.
5. Chạy `npm run type-check` và `npm run lint` để xác minh.

---

## 5. Kiến Trúc UI & Điều Hướng

### 5.1 Router (src/App.tsx)

| Path | Component | Mô tả |
|---|---|---|
| `/auth` | `AuthPage` | Đăng nhập / Đăng ký |
| `/app/:grade/:subject/dashboard` | `Dashboard` | Trang chủ (XP, tiến độ, dạng yếu) |
| `/app/:grade/:subject/roadmap` | `Roadmap` | Bản đồ lộ trình học (Tier 1→2→3) |
| `/app/:grade/:subject/question-types/:id` | `QuestionTypeDetail` | Chi tiết dạng bài (lý thuyết + ví dụ) |
| `/app/:grade/:subject/practice` | `PracticeEngine` | Luyện tập tự do |
| `/app/:grade/:subject/practice/:questionTypeId` | `PracticeEngine` | Luyện tập dạng bài cụ thể |
| `/app/:grade/:subject/mistakes` | `MistakeNotebook` | Sổ lỗi sai |
| `/app/:grade/:subject/exam` | `ExamEngine` | Thi thử |
| `/teacher` | `TeacherDashboard` | Dashboard giáo viên |
| `/premium` | `PremiumPricing` | Nâng cấp Premium |
| `/app/:grade/:subject/ai-tutor` | `GeneralAiTutor` | Chat AI gia sư |

### 5.2 Context Dropdown (Lớp + Môn)

AppLayout chứa **Context Dropdown** cho phép chọn tổ hợp Lớp + Môn học. Cấu trúc `courseGroups`:

```typescript
courseGroups = [
  {
    grade: 'grade9',
    gradeTitle: 'Lớp 9 Ôn vào 10',
    courses: [
      { code: 'math', name: 'Toán học', icon: '📐', isLocked: false },
      { code: 'english', name: 'Tiếng Anh', icon: '🗣️', isLocked: false },
    ]
  },
  {
    grade: 'grade10',
    gradeTitle: 'Lớp 10',
    courses: [
      { code: 'math', name: 'Toán học', icon: '📐', isLocked: false },
      { code: 'english', name: 'Tiếng Anh', icon: '🗣️', isLocked: false },
      { code: 'chemistry', name: 'Hóa học', icon: '⚗️', isLocked: false },
    ]
  },
  {
    grade: 'future',
    gradeTitle: 'Lớp 11 & 12 (Sắp ra mắt)',
    courses: [
      { code: 'physics', name: 'Vật lý', icon: '🧪', isLocked: true },
      { code: 'biology', name: 'Sinh học', icon: '🧬', isLocked: true },
    ]
  }
]
```

### 5.3 Cơ chế khóa/mở khóa nội dung

- **Tier-based locking**: Roadmap chia nội dung thành 3 tier. Học sinh phải đạt đủ mastery ở tier hiện tại mới mở khóa tier sau.
- **Practice Engine sync**: Chỉ hiển thị dạng bài thuộc tier đã mở khóa. Dạng bài ở tier bị khóa hoàn toàn ẩn.

---

## 6. Gamification & Progress System

### 6.1 XP & Level

- Mỗi câu trả lời đúng → nhận XP (dựa trên `difficulty`)
- Level tính từ tổng XP tích lũy
- Hiển thị trong Header của AppLayout

### 6.2 Streak

- Đếm số ngày học liên tục
- Hiển thị hiệu ứng ngọn lửa 🔥 trong Header
- Mất streak nếu nghỉ 1 ngày

### 6.3 LocalStorage → Cloud Sync

```
Luồng dữ liệu:
  1. Mọi action → ghi vào LocalStorage TỨC THÌ (zero latency)
  2. Nếu user đã đăng nhập + có mạng → tự động sync lên Firestore
  3. Khi đăng nhập mới → merge Guest data ↔ Cloud data (dedup by ID + timestamp)
  4. Zustand store.refreshProgress() → trigger UI re-render
```

### 6.4 Các key trong LocalStorage

| Key | Nội dung | Cấu trúc |
|---|---|---|
| `otv10_attempts` | Lịch sử làm bài | `Record<userId, UserAttempt[]>` |
| `otv10_mistakes` | Sổ lỗi sai | `Record<userId, UserMistake[]>` |
| `otv10_progress` | Tiến trình mastery | `Record<userId, UserProgress>` |
| `otv10_exam_results` | Kết quả thi thử | `Record<userId, ExamResult[]>` |
| `otv10_selected_grade` | Lớp đang chọn | `'grade9' \| 'grade10'` |
| `otv10_sidebar_collapsed` | Trạng thái sidebar | `'true' \| 'false'` |

---

## 7. Firebase Backend

### 7.1 Firestore Collections

```
users/{userId}                    # Hồ sơ: isPremium, role, displayName, completedCount (phi chuẩn hóa tiến độ)
teachers/{teacherUid}             # active: boolean, role: "teacher"
manual_attempts/{attemptId}       # Hàng đợi bài làm tự luận cần chấm (chứa attempt và userId)
users/{userId}/progress/{doc}     # UserProgress (cloud copy)
users/{userId}/attempts/{doc}     # UserAttempt (cloud copy)
users/{userId}/mistakes/{doc}     # UserMistake (cloud copy)
users/{userId}/examResults/{doc}  # ExamResult (cloud copy)
```

### 7.2 Cloud Functions

| Function | Handler | Mô tả |
|---|---|---|
| `callGeminiProxy` | `handlers/callGeminiProxy.ts` | Gọi Gemini AI (RAG, tutor chat, auto-evaluate bài giải) |
| `diagnose` | `handlers/diagnose.ts` | Chẩn đoán học lực đầu vào |
| `payment` | `handlers/payment.ts` | Xử lý thanh toán Premium |

### 7.3 Security Rules (firestore.rules)

- **Owner-based**: User chỉ đọc/ghi dữ liệu của chính mình.
- **Teacher role**: Giáo viên được quyền đọc bài làm học sinh, tạo/sửa mistakes, và xóa bài trong hàng đợi `/manual_attempts` sau khi chấm xong.
- **Teacher Write on User**: Giáo viên chỉ được phép update trường `completedCount` trên tài liệu `/users/{userId}` của học sinh khi chấm điểm bài tập tự luận.
- **Queue Protection**: Học sinh được phép `create` bài làm tự luận của chính mình lên `/manual_attempts`, cấm cập nhật. Giáo viên được quyền `read` và `delete`.
- **Bootstrap teacher**: Hardcoded UID cho admin ban đầu.

---

## 8. AI Integration (aiService.ts)

### Các tính năng AI:

1. **AI Tutor Panel** (`AiTutorPanel.tsx`): Chat hỏi đáp nhúng trong PracticeEngine, có ngữ cảnh câu hỏi đang làm
2. **General AI Tutor** (`GeneralAiTutor.tsx`): Chat AI tổng quát không gắn câu hỏi
3. **Auto Evaluation**: AI chấm bài giải tay (ảnh upload) bằng `AiEvaluation` schema
4. **RAG**: Tìm kiếm kiến thức liên quan từ cơ sở dữ liệu nội bộ

### Luồng gọi AI:

```
Client (aiService.ts)
  → Firebase Cloud Function (callGeminiProxy)
    → Gemini API (với systemInstruction + RAG context)
      → Trả response text về client
```

---

## 9. Khóa Học Hóa Học 10 — Trạng Thái Phát Triển

### 9.1 Triết lý thiết kế

- **Nguồn gốc**: Chuẩn đầu ra Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT)
- **SGK chính**: Hóa học 10 – Kết nối tri thức với cuộc sống (thống nhất toàn quốc từ 2026-2027)
- **Phương pháp**: Xây theo cây kiến thức, không bám máy móc SGK; tích hợp 3 tầng biểu diễn (Vĩ mô ↔ Vi mô ↔ Kí hiệu)
- **Đánh giá**: Theo Thông tư 22/2021 với 4 tầng (Chẩn đoán → Exit quiz → Kiểm tra chương → Spaced Retrieval)

### 9.2 Phân luồng học sinh

| Nhóm | Đặc điểm | Lộ trình |
|---|---|---|
| **Nhóm 1**: Mất gốc | Sợ Hóa, yếu tính toán, thiếu nền THCS | Module 0 (Cầu nối) → Module 1→... |
| **Nhóm 2**: Trung bình - Khá | Muốn 7-9 điểm, cần hệ thống rõ ràng | Module 1 → 7 (bám sát SGK) |
| **Nhóm 3**: B00/HSG | Cần hiểu bản chất lượng tử, nhiệt động | Tất cả + Chuyên đề nâng cao |

### 9.3 Cấu trúc 9 Module (src/data/grade10/chemistry/topics.ts)

| ID | Module | Tên | Tier |
|---|---|---|---|
| `chem10-t0` | Module 0 | Nhập môn Hóa học & Cầu nối THCS | 1 |
| `chem10-t1` | Module 1 | Cấu tạo nguyên tử | 1 |
| `chem10-t2` | Module 2 | Bảng tuần hoàn & Định luật tuần hoàn | 1 |
| `chem10-t3` | Module 3 | Liên kết hóa học | 1 |
| `chem10-t4` | Module 4 | Phản ứng oxi hóa – khử | 2 |
| `chem10-t5` | Module 5 | Năng lượng hóa học | 2 |
| `chem10-t6` | Module 6 | Tốc độ phản ứng hóa học | 2 |
| `chem10-t7` | Module 7 | Nguyên tố nhóm VIIA (Halogen) | 3 |
| `chem10-t8` | Module 8 | Tổng hợp và Đánh giá năng lực | 3 |

### 9.4 Trạng thái triển khai hiện tại

| Thành phần | Trạng thái | Chi tiết |
|---|---|---|
| Module 0: Nhập môn & Cầu nối THCS | ✅ MVP | 2 bài nhập môn + 4 dạng cầu nối; 8 câu hỏi và 8 lời giải |
| Module 1: Cấu tạo nguyên tử | ✅ MVP mở rộng | 7 dạng bài (H10-A01→A07) + 14 câu hỏi + 14 lời giải; giới hạn cốt lõi trong 20 nguyên tố đầu |
| Module 2: Bảng tuần hoàn | ✅ MVP | 5 outcome, 5 dạng bài, 10 câu hỏi và 10 lời giải theo quan hệ cấu tạo–vị trí–tính chất |
| Module 3: Liên kết hóa học | ✅ MVP | 5 outcome, 5 dạng bài, 10 câu hỏi và 10 lời giải; không trộn VSEPR/lai hóa vào cốt lõi |
| Module 4: Phản ứng oxi hóa–khử | ✅ MVP | 4 outcome, 4 dạng bài, 8 câu hỏi và 8 lời giải; có remediation về cân bằng phương trình |
| Module 5: Năng lượng hóa học | ✅ MVP | 4 outcome, 4 dạng bài, 8 câu hỏi và 8 lời giải; ưu tiên hiểu sơ đồ và dấu ΔH trước công thức |
| Module 6: Tốc độ phản ứng | ✅ MVP | 4 outcome, 4 dạng bài, 8 câu hỏi và 8 lời giải; tích hợp đồ thị, va chạm và thiết kế thí nghiệm |
| Module 7: Halogen | ✅ MVP | 5 outcome, 5 dạng bài, 10 câu hỏi và 10 lời giải; tích hợp tuần hoàn, liên kết và redox |
| Module 8: Tổng hợp | ❌ Chưa bắt đầu | Cần thiết kế đánh giá tích lũy theo outcome thay vì thêm dạng bài rời rạc |
| Đặc tả sản phẩm | ✅ Hoàn thành | Ma trận Module 1, phân nhóm HS, tiêu chuẩn mastery |
| UI Integration | ✅ Hoàn thành | Hóa học hiện trong dropdown, Roadmap, PracticeEngine |

### 9.4.1 Lớp domain lộ trình Hóa học

- `src/data/grade10/chemistry/learningPath.ts`: chuẩn đầu ra, quan hệ tiền đề và ngộ nhận.
- `src/utils/learningPath.ts`: suy ra trạng thái `ready/in_progress/mastered/blocked` từ mastery hiện có.
- `src/features/roadmap/ChemistryLearningPath.tsx`: lộ trình riêng cho Hóa 10, tách nội dung cốt lõi với kho cầu nối THCS.
- `docs/chemistry-learning-path.md`: quy tắc mở rộng Module 2-7.

`LearningOutcome` là đơn vị mastery; `QuestionType` chỉ là lớp luyện tập. Không dùng `tier` để thay thế dependency graph.

### 9.5 Lưu ý quan trọng về GDPT 2018

- **Thể tích chất khí đo ở điều kiện chuẩn (đkc)**: Sử dụng **24,79 lít/mol** (25°C, 1 bar). Hằng số cũ 22,4 lít/mol (đktc, 0°C) KHÔNG còn dùng trong chương trình mới.
- **Cấu hình electron**: Chỉ tập trung 20 nguyên tố đầu cho chương trình cốt lõi (không dạy kim loại chuyển tiếp ở mức cốt lõi).

---

## 10. Quy Ước Code & Lưu Ý Kỹ Thuật

### 10.1 Convention đặt ID

```
Lớp 9 Toán:     math-t{N}, math-qt{N}, math-q{N}, math-s{N}
Lớp 9 Anh:      eng-t{N}, eng-qt{N}, eng-q{N}, eng-s{N}
Lớp 10 Toán:    math10-t{N}, math10-qt{N}, math10-q{N}, math10-s{N}
Lớp 10 Anh:     eng10-t{N}, eng10-qt{N}, eng10-q{N}, eng10-s{N}
Lớp 10 Hóa:     chem10-t{N}, chem10-qt{NN}, chem10-q{NN}, chem10-s{NN}
```

### 10.2 Import alias

- `@/` = `src/` (cấu hình trong `vite.config.ts` và `tsconfig.app.json`)

### 10.3 Lỗi thường gặp khi sửa code

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| Type error trên `subjectId` | Truyền `string` thay vì `SubjectCode` | Cast hoặc dùng đúng union type |
| QuestionType thiếu field | Quên `difficulty` hoặc `examFrequency` | Thêm cả 2 field bắt buộc |
| Solution thiếu field | Quên `reviewSuggestions` | Thêm `reviewSuggestions: string[]` |
| Dữ liệu mới không hiện trên UI | Chưa cập nhật `src/data/index.ts` | Import + thêm vào cả 5 getter functions |
| Môn học mới không hiện dropdown | Chưa cập nhật `courseGroups` trong AppLayout | Thêm entry mới vào mảng courses |

### 10.4 Scripts

```bash
npm run dev        # Khởi chạy dev server (Vite)
npm run build      # tsc -b && vite build
npm run lint       # ESLint check
npm run type-check # TypeScript type check (tsc -b --noEmit)
npm run deploy     # Build + Firebase deploy hosting
```

---

## 11. Lộ Trình Phát Triển Tiếp Theo

### Ưu tiên 1 (Hóa học 10):
1. Lập ma trận chuẩn đầu ra cho Chương 2 (Bảng tuần hoàn) → Chương 7 (Halogen)
2. Tạo dữ liệu `questionTypes.ts`, `questions.ts`, `solutions.ts` cho từng chương
3. Mở rộng ngân hàng câu hỏi Module 0 và Module 1

### Ưu tiên 2 (Platform):
- Thêm môn Vật lý 10, Sinh học 10
- Mở rộng hỗ trợ Lớp 11, Lớp 12
- Nâng cấp hệ thống thi thử với đề thi thực tế

### Ưu tiên 3 (Features):
- Spaced Retrieval tự động
- Hệ thống chẩn đoán đầu vào thông minh
- Báo cáo phân tích cho phụ huynh/giáo viên

---

## 12. Các Tính Năng Cao Cấp và Tối Ưu Hóa Gần Đây

### 12.1 Hệ Thống Bàn Phím Toán Học Tự Chọn (Custom Math Keyboards)
- **Mục đích:** Cung cấp trải nghiệm nhập liệu chuyên biệt cho từng dạng toán, loại bỏ các ký tự thừa thãi và bổ sung ký tự đặc trưng mà bàn phím hệ thống không gõ được.
- **Tập hợp phím chuyên dụng:**
  - *Dạng Parabol & Giá trị lớn nhất/nhỏ nhất:* Có sẵn các phím biến số (`x`, `y`, `a`, `b`, `c`), số mũ bình phương (`²`), dấu bằng (`=`), dấu phẩy (`,`) để nhập hệ số hoặc tọa độ đỉnh.
  - *Hệ thức lượng & Giải tam giác:* Tích hợp phím độ (`°`), căn bậc hai (`√`), số Pi (`π`), và các ký hiệu góc lượng giác (`sin`, `cos`, `tan`).
  - *Phân tích vectơ & Chứng minh thẳng hàng:* Bổ sung các phím biểu diễn ký hiệu vectơ (`\vec{}`), ký hiệu ba điểm thẳng hàng, các phép toán vectơ.
  - *Tích vô hướng của hai vectơ:* Tập trung phím bình phương (`²`), tích vô hướng (`.`), nhân phân phối và dấu góc.
- **Kiến trúc nhập liệu 2 ô (Multi-input / Two-input Answers):**
  - Đối với các dạng toán yêu cầu hai đáp án riêng biệt (ví dụ: tọa độ đỉnh Parabol \\(I(x_I; y_I)\\), hoặc khoảng giá trị \\(m\\)), giao diện tự động sinh ra **2 ô nhập dữ liệu độc lập** thay vì bắt học sinh viết chung một chuỗi.
  - Bộ kiểm tra đáp án (`answerValidator.ts`) tự động ghép nối và đối sánh đúng cấu trúc của cả hai giá trị.

### 12.2 Tính Năng Xem Video Bài Giảng Hóa Học 10
- **Tập tin dữ liệu nguồn:** [videos.ts](file:///c:/on-thi-vao-10/src/data/grade10/chemistry/videos.ts) — nơi duy nhất dùng để quản lý 7 video tương ứng 7 chương của môn Hóa.
- **Bộ phân tích URL YouTube:** Tích hợp bộ lọc trích xuất ID YouTube tự động thông minh. Admin chỉ cần copy-paste link YouTube dưới bất kỳ định dạng nào (watch, share link `youtu.be`, embed link, v.v.), trình phát sẽ tự động bóc tách ID và chuyển thành link xem không chứa quảng cáo dạng `youtube-nocookie.com`.
- **Giao diện điều hướng:** Tab **Video bài giảng (7 Chương)** được đẩy lên đầu tiên trong lộ trình học môn Hóa học 10 để kích hoạt xem đầu tiên.

### 12.3 Thiết Kế Tương Thích Di Động (Mobile Responsive Overhaul) - Gia Sư AI
- **Chiều cao cố định (Sticky Chat Box):** Khung chat Gia sư AI có chiều cao vừa khít màn hình `h-[calc(100vh-110px)]` với `overflow-hidden` để giữ thanh nhập tin nhắn và đính kèm ảnh luôn dính sát đáy màn hình điện thoại (messenger-like experience).
- **Lịch sử hội thoại (Drawer Overlay):** Ẩn mặc định trên mobile. Khi mở, trượt ra từ bên trái dưới dạng absolute drawer đè lên khung chat kèm lớp nền mờ (`backdrop bg-black/45`), tự động khép lại khi tạo chat mới hoặc chọn chat cũ.
- **Hồ sơ năng lực (Bottom Sheet):** Thay vì hiển thị kéo dài dưới chân trang, trên di động nó sẽ được ẩn đi và mở ra dưới dạng một Bottom Sheet trượt từ dưới đáy màn hình lên khi bấm vào nút "Hồ sơ".

### 12.4 Kiến Trúc Thư Mục Module Tự Động Nạp (Modular Subdirectory Architecture)
- **Mục tiêu:** Thống nhất dữ liệu ngân hàng câu hỏi cho cả **Hóa học 10** và **Tiếng Anh 10**.
- **Nguyên lý hoạt động:**
  - Mỗi chương/chuyên đề được đóng gói biệt lập trong một thư mục con tại `modules/module[N]_[tên]/` (Ví dụ: `module1_family/`).
  - Thư mục con chứa đầy đủ: `topics.ts`, `questionTypes.ts`, `questions.ts`, `solutions.ts` và tệp re-export `index.ts`.
  - Các tệp nạp gốc của môn học chỉ khai báo shell và tự động quét/gộp dữ liệu bằng API của Vite:
    `const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });`
  - **Lợi ích Senior:** Cô lập triệt để rủi ro xung đột git (merge conflict), tối đa hóa tính đóng gói (encapsulation), triệt tiêu hoàn toàn thao tác import thủ công.
  - **Kiểm soát Didactic tự động:** Tệp kiểm tra chất lượng `validateEnglish10.mjs` quét động toàn bộ các thư mục con trong `modules/`, giải mã AST để kiểm tra tính toàn vẹn khóa ngoại và chỉ tiêu phân phối độ khó.

### 12.5 Tối Ưu Hóa Hiệu Năng & Dung Lượng Bundle (Dynamic Import & Code Splitting)
- **Vị trí áp dụng:** [src/data/index.ts](file:///c:/on-thi-vao-10/src/data/index.ts) và [src/App.tsx](file:///c:/on-thi-vao-10/src/App.tsx).
- **Mục đích:** Khử tĩnh toàn bộ dữ liệu câu hỏi khổng lồ ra khỏi main bundle, giúp giảm dung lượng tải trang.
- **Kỹ thuật:**
  - Thay đổi bộ nạp dữ liệu môn học thành không đồng bộ qua `import(...)` của Vite.
  - Lưu trữ kết quả tải môn học vào `dataCache` để tối ưu RAM.
  - Bọc tất cả Page Components qua `React.lazy` và thiết lập `React.Suspense` tại [AppLayout.tsx](file:///c:/on-thi-vao-10/src/components/layout/AppLayout.tsx) để hiển thị Spinner khi chuyển trang bất đồng bộ.
  - **Hiệu năng thực tế:** Giảm kích thước bundle chính từ **5.31 MB** xuống còn **353.71 KB** minified (giảm **93.3%**).

### 12.6 Khử Lỗi N+1 Reads & Phi Chuẩn Hóa Tiến Độ (Teacher Dashboard Optimization)
- **Vị trí áp dụng:** [progressService.ts](file:///c:/on-thi-vao-10/src/services/progressService.ts) và [firestore.rules](file:///c:/on-thi-vao-10/firestore.rules).
- **Mục đích:** Loại bỏ độ trễ và chi phí truy vấn $O(N)$ tăng tuyến tính theo số lượng học sinh trong trang quản lý của giáo viên.
- **Kỹ thuật:**
  - **Phi chuẩn hóa tiến độ:** Thêm trường `completedCount` trực tiếp vào tài liệu User tại `/users/{userId}`. Tự động đồng bộ số lượng bài học hoàn thành mỗi khi học sinh nộp bài tập, nộp bài thi thử, merge tiến độ, hoặc giáo viên chấm điểm.
  - **Hàng đợi bài tự luận:** Sử dụng collection root phẳng `/manual_attempts/{attemptId}` làm hàng đợi trung gian cho các bài làm tự luận cần chấm.
  - **Kết quả:** Giảm tải kết nối mạng từ **$1 + 2N$ reads** xuống cố định chỉ còn **2 connection reads** ($O(1)$ complexity) giúp trang Dashboard tải tức thì.

### 12.7 Hệ Thống Thông Báo Email Hàng Loạt (Resend API & Firebase Cloud Functions)
- **Mục đích:** Cho phép giáo viên phát bản tin email thông báo tính năng mới, sự kiện hoặc bài giảng mới đến toàn bộ học sinh trong hệ thống.
- **Tên miền gửi chính chủ:** Đã xác minh thành công tên miền `ezonthi.com` trên Resend (đủ bản ghi DKIM `resend._domainkey`, SPF `send`, DMARC `_dmarc`). Người gửi mặc định: `Ban Giáo Dục ezonthi <thongbao@ezonthi.com>`.
- **Bảo mật & Tránh rào cản CORS:** 
  - Toàn bộ lệnh gửi mail được xử lý qua Firebase Cloud Function proxy `sendResendEmail` trên Serverless Backend (Node 22 Gen 2).
  - API Key được bảo vệ tuyệt đối trên Server (`process.env.RESEND_API_KEY`), không hề lộ diện trên trình duyệt Web App.

### 12.8 Kiến Trúc Danh Bạ Email 1-Read & Cơ Chế Phân Đợt Gửi (95 mail/ngày)
- **Tệp tin giao diện:** [EmailBroadcastManager.tsx](file:///d:/a_duan/on-thi-vao-10/src/features/teacher/components/EmailBroadcastManager.tsx).
- **Tệp tin Cloud Function:** [email.ts](file:///d:/a_duan/on-thi-vao-10/functions/src/handlers/email.ts).
- **Mô hình Danh Bạ Tập Trung (`system/email_directory`):**
  - Lưu toàn bộ email học sinh vào 1 document duy nhất `/system/email_directory` trong Firestore.
  - Hàm `getEmailDirectory` đọc thông tin danh bạ chỉ tốn **đúng 1 READ** cho toàn hệ thống.
  - Hàm `syncEmailDirectory` cho phép quét lại và Re-index toàn bộ dữ liệu khi cần bảo trì.
- **Cơ chế Phân Đợt (Batching 95 mail/ngày):**
  - Tự động chia tổng số học sinh thành các đợt 95 email/ngày (vừa vặn hạn mức 100/ngày của Resend Free).
  - Giao diện cung cấp thanh chọn đợt gửi (Đợt 1 [1-95], Đợt 2 [96-190],...) giúp giáo viên chủ động gửi mỗi ngày mà không bao giờ vượt hạn mức free.

### 12.9 Định Tuyến URL Tab & Tối Ưu Firestore Reads (Teacher Dashboard URL Routing)
- **Tệp tin:** [TeacherDashboard.tsx](file:///d:/a_duan/on-thi-vao-10/src/features/teacher/TeacherDashboard.tsx).
- **URL SearchParams:** Quản lý tab active qua URL query param `/teacher?tab=email_broadcast`, `/teacher?tab=students`,... Nhấn `F5` / `Reload` giữ nguyên tab hiện tại.
- **Tải dữ liệu lười (Lazy Loading):** Tải danh sách 20 học sinh chỉ khi đang ở tab `students` hoặc `grading`. Ngăn chặn hoàn toàn 20 lượt Read dư thừa khi reload ở các tab khác.
- **Đếm tổng số học sinh tối ưu (Aggregation Query):** Sử dụng `getCountFromServer(collection(db, 'users'))` để hiển thị chính xác tổng số học sinh toàn hệ thống với chi phí **chỉ 1 READ**.

### 12.10 Tách Bootstrap Public SEO Khỏi Ứng Dụng Firebase

- **Public shell:** `src/components/layout/PublicLayout.tsx` phục vụ trang chủ, các landing SEO và trang giới thiệu mà không import Firebase/Auth.
- **Private shell:** `src/components/layout/PrivateAppShell.tsx` chỉ được lazy-load khi người dùng mở Dashboard, Roadmap, Practice, Exam hoặc các màn hình ứng dụng.
- **Không chặn landing bằng Auth:** `authLoading` chỉ điều khiển nhánh ứng dụng; nội dung SEO hiển thị ngay và không còn đi qua màn hình “Đang thiết lập phòng học trực tuyến”.
- **Telemetry trì hoãn:** Firebase Analytics, Firebase Performance và Sentry chỉ khởi tạo sau khi nhánh ứng dụng đã tải xong và trình duyệt rảnh. Trang public không tải các SDK này.
- **Tài nguyên theo nhu cầu:** KaTeX CSS chỉ tải cùng `LatexRenderer`; Source Serif 4 chỉ tải ở trang lý thuyết; Be Vietnam Pro được tự lưu trữ qua Fontsource thay vì Google Fonts.
- **Module preload:** Vite chỉ preload dependency của HTML entry, không nhúng bản đồ dependency của toàn bộ route lazy vào đường tải đầu.

### 12.11 Chuyên Đề Nâng Cao Vật Lí 10

- **Route chuẩn:** `/app/grade10/physics/advanced`, chỉ hiện trong sidebar khi ngữ cảnh là `grade10/physics`.
- **Dữ liệu riêng:** `src/data/grade10/physics/advanced/` chứa 7 mảng, 168 câu A–D độc lập và 168 lời giải trọn bài (24 câu/mảng). Không đưa câu nâng cao vào ngân hàng Luyện tập nền tảng.
- **Mức thử thách:** `hard | very_hard | extreme`; trường `difficulty` lõi vẫn là `hard` để tương thích kiểu `Question` hiện có.
- **Nguyên tắc nội dung:** không chia một bài thành chuỗi câu dẫn dắt; không dùng input tự luận; không lưu nguồn, năm hoặc đơn vị ra đề trong dữ liệu phát hành.
- **Bài dài:** 28 bài cuối gồm 14 `extended` và 14 `olympiad`, lời giải tối thiểu 4 bước; ít nhất 12 bài có sơ đồ hoặc bảng và được render qua `QuestionStimulusRenderer`.
- **Cân bằng đáp án:** vị trí đáp án hiển thị được xáo trộn ổn định theo mã câu, bảo đảm A/B/C/D cùng 42 câu trong ngân hàng 168 câu; lời giải dùng cùng quy tắc để luôn khớp.
- **Tiến độ riêng:** lưu theo người dùng/khách tại key `ezonthi_phy10_advanced_progress_{userId}` và không tác động mastery của lộ trình nền tảng.
- **Kiểm định:** `npm run validate:physics10-advanced`; lệnh `npm run validate:physics10` cũng tự chạy kiểm định ngân hàng nâng cao.

### 12.12 Chuyên Đề Nâng Cao Toán 10

- **Route chuẩn:** `/app/grade10/math/advanced`, chỉ hiện trong sidebar khi ngữ cảnh là `grade10/math`.
- **Dữ liệu riêng:** `src/data/grade10/math/advanced/authored/` chứa 8 mảng, 192 câu A–D được biên soạn theo từng cấu trúc độc lập và 192 lời giải trọn bài (24 câu/mảng). Ngân hàng này tách hoàn toàn khỏi Luyện tập nền tảng; không dùng một khuôn rồi nhân bản bằng cách thay số.
- **Phân tầng:** 48 câu Khó, 80 câu Rất khó và 64 câu Cực khó; đồng thời gồm 96 bài cô đọng, 64 bài tổng hợp dài và 32 bài Olympic.
- **Phạm vi:** đại số–đa thức; hàm số–tham số; bất đẳng thức; số học; tổ hợp; hình học Euclid; vectơ–tọa độ–lượng giác; xác suất–mô hình hóa.
- **Nguyên tắc nội dung:** mỗi câu là một bài độc lập, không chia thành chuỗi dẫn dắt; chỉ chọn A/B/C/D; lời giải chỉ mở sau khi nộp và nêu mấu chốt, tối thiểu 3 bước cùng các bẫy sai thường gặp.
- **Học liệu trực quan:** có 46 câu dùng sơ đồ hoặc bảng dữ kiện, render qua `QuestionStimulusRenderer`; tất cả hình đều có văn bản thay thế.
- **Cân bằng đáp án:** A/B/C/D cùng 48 câu; vị trí đáp án và lời giải luôn khớp sau khi sắp phương án.
- **Tiến độ riêng:** lưu tại `ezonthi_math10_advanced_progress_{userId}` và Firestore `advancedProgress/math10`, không tác động mastery nền tảng.
- **Engine dùng chung:** `AdvancedPracticePage` nhận cấu hình môn học; các wrapper Toán và Vật lí cung cấp dữ liệu, nhãn, route và khóa tiến độ riêng.
- **Kiểm định:** `npm run validate:math10-advanced`; validator chuẩn hóa đề bằng cách loại tham số số học và bắt buộc đạt 192/192 cấu trúc độc lập. Lệnh `npm run validate:math10` cũng tự chạy cả ngân hàng nền tảng và nâng cao.

### 12.13 Chuyên Đề Nâng Cao Sinh học 10

- **Route chuẩn:** `/app/grade10/biology/advanced`, chỉ hiện trong sidebar khi ngữ cảnh là `grade10/biology`.
- **Dữ liệu riêng:** `src/data/grade10/biology/advanced/` chứa 8 mảng, 144 câu A–D độc lập và 144 lời giải theo bằng chứng–cơ chế–loại phương án nhiễu; không đưa câu nâng cao vào ngân hàng Luyện tập nền tảng.
- **Phân tầng:** 48 câu Khó, 64 câu Rất khó và 32 câu Cực khó; đồng thời gồm 48 bài cô đọng, 64 bài tổng hợp và 32 bài kiểu Olympic.
- **Phạm vi:** phương pháp nghiên cứu; phân tử sinh học; tế bào–kính hiển vi; vận chuyển–truyền tin; enzyme–chuyển hóa; phân bào–công nghệ tế bào; vi sinh; virus.
- **Nguyên tắc nội dung:** câu hỏi được biên soạn mới theo cấu trúc dữ liệu/thí nghiệm/cơ chế, không sao chép hoặc gắn nhãn “câu của Bộ”; không nhân bản bằng cách đổi số; không chia bài thành chuỗi dẫn dắt; chỉ chọn A/B/C/D.
- **Học liệu trực quan:** 36 câu có bảng dữ liệu, hiển thị bằng `QuestionStimulusRenderer`; mọi bảng nằm ngay trong câu nên học sinh không cần mở tài liệu ngoài.
- **Cân bằng đáp án:** A/B/C/D cùng 36 câu; vị trí đáp án và lời giải luôn khớp sau khi sắp phương án.
- **Tiến độ riêng:** lưu tại `ezonthi_bio10_advanced_progress_{userId}` và Firestore `advancedProgress/bio10`, không tác động mastery nền tảng.
- **Kiểm định:** `npm run validate:biology10-advanced`; validator kiểm tra đủ 144 câu, cấu trúc chuẩn, dấu vân tay chuyên môn, đáp án, lời giải, bảng dữ liệu và LaTeX. `npm run validate:biology10` chạy cả nền tảng và nâng cao.

---

## 13. Checklist Trước Khi Commit

- [ ] `npm run type-check` — Không lỗi TypeScript
- [ ] `npm run lint` — Không lỗi ESLint
- [ ] Cập nhật `src/data/index.ts` nếu thêm dữ liệu mới
- [ ] Cập nhật `AppLayout.tsx courseGroups` nếu thêm môn/lớp mới
- [ ] Cập nhật `AGENT.md` nếu thay đổi kiến trúc hoặc data model
- [ ] Cập nhật `README.md` nếu thay đổi hướng dẫn sử dụng hoặc deploy

### Đợt bảo mật 1 (12/09/2026)

- Client chỉ sửa trường hồ sơ/dấu đọc cá nhân trong `users/{uid}`; quyền Premium/trial và stats/mastery/completed do backend quản lý.
- Các callable `activatePremiumTrial`, `refreshLearningSummary`, `getSurveySummary` là đường tương thích mới. `teacher_reviews` chỉ giáo viên ghi, tách khỏi bài làm học sinh.
- `scripts/buildServerLearningCatalog.mjs` sinh catalog đáp án và validator/hàm Premium dùng chung trước mỗi build Functions; không sửa file generated.
- Email dùng quyền giáo viên thống nhất, Firebase Auth directory, quota transaction và idempotency. PayOS và rút tiền cập nhật tài chính trong transaction.
- Public leaderboard chuyển sang `system_stats/leaderboard_public`, không xuất email và chỉ sử dụng stats do server kiểm tra.
- Kiểm thử/ràng buộc chuyển đổi dữ liệu: `docs/security-phase1.md`; lệnh `npm run test:security`.

### Đợt mở rộng có số liệu 4 (13/09/2026)

- Attempt có `historyBucket` và API đọc theo con trỏ; chat/message và notification chuyển sang document độc lập có giới hạn thay vì mảng tăng vô hạn.
- Quota AI được giữ bằng transaction trước khi gọi provider. Mọi tác vụ AI có giới hạn payload/timeout và log token, chi phí ước tính theo `taskType`.
- RAG V2 bắt buộc lớp, môn, `contentVersion`, trạng thái published và provenance. Seed tri thức trước khi deploy function RAG; kiểm chứng bằng `npm --prefix functions run verify:knowledge`.
- Schema khóa học V4 có profile bằng chứng riêng cho sáu môn nhưng giữ `studentDataVersion: 2` và ID cũ qua adapter.
- Metric backend đo retention D1/D7, kết quả học, conversion PayOS và chi phí AI. `expansionGate phase4-v1` là điều kiện kỹ thuật trước khi mở lớp 12 hoặc thêm chức năng ngoài trọng tâm.
- Thiết kế, ngưỡng và thứ tự phát hành: `docs/phase4-scale-and-metrics.md`.
