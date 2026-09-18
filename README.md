# 🎓 EZ Ôn Thi (ezonthi.com) — Nền Tảng Ôn Luyện Trực Tuyến Đa Môn Học

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.15-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Sentry](https://img.shields.io/badge/Sentry-Monitored-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

Nền tảng công nghệ giáo dục (EdTech) học tập và ôn luyện cá nhân hóa dành cho học sinh từ **Lớp 9 (Ôn thi tuyển sinh vào 10)** đến **Lớp 10 & Lớp 11 THPT** theo chuẩn **Chương trình GDPT 2018**. Hệ thống tích hợp AI Gia Sư thông minh, ngân hàng đề bài chuẩn hóa đồ sộ, các chuyên đề nâng cao/Olympic, cùng kiến trúc **Local-First** cho trải nghiệm siêu mượt.

🔗 **Website chính thức**: [ezonthi.com](https://ezonthi.com)  

Runtime chuẩn của dự án là **Node.js 22 + npm 10.9**. Cài đặt bằng `npm ci` ở root và `npm --prefix functions ci`; xem [hướng dẫn phát triển và phát hành](docs/development-and-release.md). Route học chuẩn mang đủ lớp và môn, ví dụ `/app/grade11/english/roadmap`.

---

## I. Điểm Nổi Bật

| Tính năng | Chi tiết |
|---|---|
|  **AI Gia Sư (Google Gemini)** | Chat trực tiếp với AI để giải đáp thắc mắc, phân tích bài giải từng bước với kỹ thuật sư phạm (scaffolding: gợi mở tư duy, không mớm đáp án). |
|  **Đa Môn Học Toàn Diện** | Bao phủ 6 môn học cốt lõi: **Toán học, Tiếng Anh, Vật lý, Hóa học, Sinh học, Lịch sử** cho cả 3 khối lớp (9, 10, 11). |
|  **Chuyên Đề Nâng Cao & Olympic** | 4 kho chuyên đề độc lập cho Toán 10, Vật lý 10, Hóa học 10, Sinh học 10 với 3 mức độ Khó/Rất khó/Cực khó; chống xem trước lời giải trước khi nộp. |
|  **Lộ Trình Học 3 Chặng** | Phân cấp theo Mastery Score: **Tier 1 (5-6 điểm)** → **Tier 2 (7-8 điểm)** → **Tier 3 (9-10 điểm)**; mở khóa dần tránh quá tải. |
|  **Kiến Trúc Local-First** | Lưu trữ tức thì vào `LocalStorage`, học và làm bài offline mượt mà; tự động đồng bộ lên Firebase Cloud khi có kết nối mạng. |
|  **Sổ Lỗi Sai (Mistake Notebook)** | Tự động gom nhóm câu làm sai theo từng dạng bài, hỗ trợ cơ chế Spaced Retrieval để làm lại đến khi thành thạo và xóa lỗi. |
|  **Bàn Phím Toán Học Chuyên Dụng** | Bàn phím ảo tự động đổi layout theo từng dạng toán (Parabol, Vectơ, Lượng giác, Căn thức, Phân số) tối ưu riêng cho điện thoại & tablet. |
|  **Từ Vựng & Ngữ Pháp Tiếng Anh** | Tra cứu từ điển tích hợp, luyện thẻ ghi nhớ Flashcard từ vựng theo chủ đề (`/vocabulary`) và hệ thống lý thuyết ngữ pháp bài bản (`/grammar`). |
|  **Dashboard Giáo Viên & Lớp Học** | Giáo viên duyệt bài tự luận qua ảnh chụp bài giải (`proof-upload`), chấm điểm, nhận xét và gửi thông báo cho học sinh. |
|  **Phát Bản Tin Email (Broadcast)** | Tích hợp gửi email thông báo qua Resend API từ domain `ezonthi.com`, tối ưu 1-Read directory & chia đợt gửi tránh vượt quota. |
|  **Thanh Toán PayOS & Affiliate** | Hỗ trợ đăng ký nâng cấp Premium tự động qua cổng thanh toán PayOS và quản lý mạng lưới tiếp thị liên kết (Affiliate). |
|  **Gamification Kích Thích Học Tập** | Điểm kinh nghiệm XP, Thăng cấp (Level), Chuỗi học tập (Streak), Tặng sao (0-3⭐) và hiệu ứng Confetti rực rỡ khi hoàn thành bài học. |
|  **Siêu Hiệu Năng & SEO Tĩnh** | Code-splitting giảm 93.3% kích thước bundle khởi động (từ 5.3MB xuống ~350KB); tự động tạo Static SEO Pages và Sitemap khi build. |

---

## II. Ngân Hàng Dữ Liệu & Khóa Học Hiện Có

Hệ thống được biên soạn bám sát **Chương trình GDPT 2018** (các bộ SGK: *Kết nối tri thức với cuộc sống*, *Cánh diều*, *Chân trời sáng tạo*).

### 1. Khối Lớp 9 — Ôn Thi Tuyển Sinh Vào 10
- **Toán học 9**: 3 chặng học tập: Đại số căn bậc hai & Hàm số bậc nhất → Hệ phương trình & Phương trình bậc hai → Hình học đường tròn & Nâng cao (Bất đẳng thức, Cực trị).
- **Tiếng Anh 9**: Ngữ âm, Ngữ pháp trọng tâm vào 10, Từ vựng theo chủ điểm, Đọc hiểu và Viết lại câu.
- **Đề thi thử (Mock Exams)**: Đề thi thử tổng hợp có tính giờ và chấm điểm tự động.

### 2. Khối Lớp 10 — Nền Tảng & Chuyên Đề Nâng Cao
- **Toán học 10**: Mệnh đề, Tập hợp, Bất phương trình, Lượng giác, Vectơ, Thống kê, Bất đẳng thức.
  - ⭐ **Chuyên đề Toán 10 Nâng cao** (`/app/grade10/math/advanced`): 192 bài tập nâng cao phân hóa, bao gồm 32 bài mức độ Olympic.
- **Tiếng Anh 10**: Từ vựng & Ngữ pháp nâng cao, Kỹ năng đọc hiểu theo chủ điểm GDPT 2018.
- **Hóa học 10**: 9 Module toàn diện từ Cầu nối THCS đến Cấu tạo nguyên tử, Bảng tuần hoàn, Liên kết hóa học, Phản ứng Oxi hóa - Khử, Tốc độ phản ứng, Năng lượng hóa học và Nhóm Halogen.
  - ⭐ **Chuyên đề Hóa 10 Nâng cao** (`/app/grade10/chemistry/advanced`): Chuyên đề nâng cao chuyên sâu.
- **Vật lý 10**: Động học chất điểm, Lực và chuyển động, Năng lượng, Động lượng, Chuyển động tròn.
  - ⭐ **Chuyên đề Vật lý 10 Nâng cao** (`/app/grade10/physics/advanced`): 168 bài tập chuyên sâu phân hóa, bao gồm 28 bài Olympic.
- **Sinh học 10**: Sinh học tế bào, Vi sinh vật và Virus, Cấu tạo & Chức năng bào quan.
  - ⭐ **Chuyên đề Sinh 10 Nâng cao** (`/app/grade10/biology/advanced`): Các chuyên đề sinh học nâng cao.
- **Lịch sử 10**: Lịch sử thế giới và Lịch sử Việt Nam theo định hướng phát triển năng lực.

### 3. Khối Lớp 11 — Toàn Diện 5 Môn Học Cốt Lõi
- **Toán học 11**: Hàm số lượng giác, Dãy số, Cấp số cộng/nhân, Giới hạn, Đạo hàm, Hình học không gian.
- **Tiếng Anh 11**: Các chủ đề ngữ pháp chuyên sâu, từ vựng học thuật, đọc hiểu nâng cao.
- **Vật lý 11**: Dao động cơ, Sóng cơ & Sóng điện từ, Điện trường, Dòng điện không đổi.
- **Hóa học 11**: Cân bằng hóa học, Cân bằng trong dung dịch nước, Hóa học hữu cơ đại cương, Hydrocarbon, Dẫn xuất halogen - Alcohol - Phenol.
- **Sinh học 11**: Sinh học cơ thể (Trao đổi chất & Chuyển hóa năng lượng ở thực vật và động vật, Cảm ứng, Sinh trưởng và Sinh sản).

---

## III. Kiến Trúc Hệ Thống

### 1. Mô Hình Dữ Liệu 5 Tầng Phân Cấp

```
Grade (grade9 | grade10 | grade11)
  └── Subject (math | english | physics | chemistry | biology | history)
        └── Topic (Chương học, Tier: 1 | 2 | 3)
              └── QuestionType (Dạng bài: lý thuyết, các bước giải, lỗi sai thường gặp)
                    └── Question (Câu hỏi: đề bài, LaTeX, dạng trả lời, đáp án)
                          └── Solution (Lời giải: phân tích chi tiết, gợi ý ôn tập)
```

### 2. Cơ Chế Local-First & Đồng Bộ Cloud

```
┌────────────────────────────────────────────────────────────────────────┐
│  BROWSER (React 19 SPA)                                                │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────────────────────┐  │
│  │ Zustand   │  │ storage   │  │ progressService                     │  │
│  │ Store     │←→│ Service   │←→│ (XP, Mastery Score, Streak,        │  │
│  │           │  │ (LS CRUD) │  │  Merge Guest ↔ Authenticated User) │  │
│  └──────────┘  └───────────┘  └──────────────────┬──────────────────┘  │
│                                                  │ sync (online)       │
└──────────────────────────────────────────────────┼─────────────────────┘
                                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  FIREBASE SUITE & EXTERNAL SERVICES                                    │
│  ┌───────────────────────────┐   ┌──────────────────────────────────┐  │
│  │ Firebase Authentication   │   │ Cloud Firestore                  │  │
│  │ (Google OAuth, Email/Pass)│   │ (users, progress, mistakes, logs)│  │
│  └───────────────────────────┘   └──────────────────────────────────┘  │
│  ┌───────────────────────────┐   ┌──────────────────────────────────┐  │
│  │ Firebase Storage          │   │ Firebase Hosting                 │  │
│  │ (bài giải ảnh tự luận)    │   │ (SPA + Pre-rendered SEO Pages)   │  │
│  └───────────────────────────┘   └──────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Firebase Cloud Functions (TypeScript Backend)                    │  │
│  │  ├── callGeminiProxy : Proxy an toàn tới Google Gemini AI        │  │
│  │  ├── diagnose        : Chẩn đoán năng lực học tập đầu vào        │  │
│  │  ├── payment         : Cổng thanh toán trực tuyến PayOS          │  │
│  │  ├── email           : Gửi mail Resend API (ezonthi.com)         │  │
│  │  └── leaderboard     : Tính điểm bảng xếp hạng thi đua           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Công Thức Đánh Giá Năng Lực (Gamification)

- **Mastery Score (0 - 100)**: tỷ lệ đúng trên kết quả đã chấm mới nhất của từng câu khác nhau. Cần đủ 5 câu có bằng chứng (hoặc toàn bộ câu nếu dạng bài có ít hơn 5); XP và streak không tham gia mastery.
- **Xếp hạng Sao**: `0-39` → 0⭐ | `40-59` → 1⭐ | `60-79` → 2⭐ | `80-100` → 3⭐.
- **Hệ thống XP & Cấp độ**: Cộng XP tức thì khi làm đúng theo độ khó câu hỏi, tự động thăng cấp (Level) và duy trì chuỗi ngày học liên tục (Streak).

---

## 🛠️ Technology Stack

| Tầng | Công nghệ / Thư viện | Phiên bản | Mô tả |
|---|---|---|---|
| **Frontend Core** | React | `^19.2.7` | UI Framework hiện đại |
| **Ngôn ngữ** | TypeScript | `^5.9.3` | Định kiểu tĩnh an toàn |
| **Công cụ đóng gói** | Vite | `^8.0.0` | Build tool siêu tốc kèm OXC/React plugin |
| **Giao diện (CSS)** | Tailwind CSS | `^4.0.0` | Styling qua `@tailwindcss/vite` |
| **Quản lý trạng thái** | Zustand | `^5.0.3` | Lightweight Global State kết hợp LocalStorage |
| **Điều hướng** | React Router DOM | `^7.18.1` | Router v7 hỗ trợ Data API & Code Splitting |
| **Hiển thị Toán học** | KaTeX | `^0.18.0` | Render công thức Toán/Lý/Hóa LaTeX tốc độ cao |
| **Biểu đồ & Đồ thị** | Recharts | `^3.9.2` | Biểu đồ tiến độ học tập, radar năng lực |
| **Biểu tượng** | Lucide React | `^1.23.0` | Bộ icon giao diện hiện đại |
| **Giám sát lỗi** | Sentry React | `^10.69.0` | Bắt và cảnh báo lỗi runtime frontend |
| **Backend / Cloud** | Firebase Platform | `^12.15.0` | Auth, Firestore, Cloud Functions, Storage, Hosting |
| **Trí tuệ nhân tạo** | Google Gemini API | — | AI Gia Sư thông minh qua Cloud Functions Proxy |
| **Dịch vụ Email** | Resend API | — | Gửi email thông báo & tin tức với tên miền `ezonthi.com` |
| **Cổng thanh toán** | PayOS | — | Thanh toán gói cước Premium qua mã QR tự động |

---

## IV. Cấu Trúc Thư Mục Dự Án

```text
on-thi-vao-10/
├── src/
│   ├── types/index.ts            # ⭐ Toàn bộ TypeScript interfaces & types của hệ thống
│   ├── data/                     # ⭐ Ngân hàng nội dung câu hỏi & lời giải
│   │   ├── allDataRegistry.ts    # Bộ đăng ký tập trung toàn bộ QuestionTypes & Questions
│   │   ├── courseRegistry.ts     # Trình nạp bundle dữ liệu theo khóa học
│   │   ├── grade9/               # Dữ liệu Lớp 9: math/, english/
│   │   ├── grade10/              # Dữ liệu Lớp 10: math/, english/, chemistry/, physics/, biology/, history/
│   │   └── grade11/              # Dữ liệu Lớp 11: math/, english/, chemistry/, physics/, biology/
│   ├── services/                 # Tầng nghiệp vụ (Business Services)
│   │   ├── firebase.ts           # Khởi tạo Firebase SDK
│   │   ├── storage.ts            # LocalStorage wrapper (attempts, mistakes, progress)
│   │   ├── progressService.ts    # Core Engine: XP, Level, Streak, Cloud Sync
│   │   ├── store.ts              # Zustand store chính (khối lớp, môn học, auth, theme)
│   │   ├── aiService.ts          # Client wrapper gọi Cloud Functions AI Proxy
│   │   ├── proofImageService.ts  # Xử lý tải ảnh bài giải lên Cloud Storage
│   │   ├── teacherService.ts     # Nghiệp vụ quản lý lớp học & chấm bài của giáo viên
│   │   ├── affiliateService.ts   # Quản lý tiếp thị liên kết (Affiliate)
│   │   ├── dictionaryService.ts  # Dịch vụ tra cứu từ điển tiếng Anh
│   │   └── notificationService.ts# Quản lý thông báo hệ thống
│   ├── components/               # Giao diện dùng chung
│   │   ├── ui/                   # Button, Card, Progress, Tabs, Dialog...
│   │   ├── common/               # LatexRenderer, AnswerFormRenderer, ProofImageUploader...
│   │   ├── layout/               # AppLayout, PrivateAppShell, PublicLayout, Sidebar, Header...
│   │   └── mistakes/             # MistakeNotebook (Sổ lỗi sai 2 tầng)
│   ├── features/                 # Các phân hệ tính năng người dùng
│   │   ├── dashboard/            # Bảng điều khiển tổng quan tiến độ & năng lực
│   │   ├── roadmap/              # Bản đồ học tập 3 chặng (Tier 1-2-3)
│   │   ├── practice-engine/      # Bộ máy luyện tập thích ứng theo dạng bài
│   │   ├── exam-engine/          # Bộ máy thi thử tính giờ & tự động chấm điểm
│   │   ├── advanced-math/        # Chuyên đề Toán 10 Nâng cao
│   │   ├── advanced-physics/     # Chuyên đề Vật lý 10 Nâng cao
│   │   ├── advanced-chemistry/   # Chuyên đề Hóa học 10 Nâng cao
│   │   ├── advanced-biology/     # Chuyên đề Sinh học 10 Nâng cao
│   │   ├── ai-tutor/             # AI Gia Sư thông minh (Google Gemini)
│   │   ├── vocabulary/           # Học từ vựng Flashcard & tra từ điển
│   │   ├── grammar/              # Chuyên đề ngữ pháp tiếng Anh
│   │   ├── teacher/              # Dashboard Giáo viên chấm bài & phát bản tin
│   │   ├── premium/              # Bảng giá & thanh toán gói cước PayOS
│   │   ├── affiliate/            # Trang quản trị đối tác tiếp thị liên kết
│   │   ├── news/                 # Bảng tin giáo dục & thông báo
│   │   ├── support/              # Hỗ trợ người dùng & giải đáp thắc mắc
│   │   └── seo-landing/          # Trang Landing Page tối ưu SEO
│   ├── utils/                    # Bộ công cụ trợ giúp: answerValidator, theme, subject, logger...
│   └── constants/routes.ts       # Định nghĩa tập trung toàn bộ đường dẫn URL
│
├── functions/                    # ═══ FIREBASE CLOUD FUNCTIONS (Backend) ═══
│   ├── src/handlers/
│   │   ├── callGeminiProxy.ts    # Proxy gọi Gemini AI (hỗ trợ scaffolding sư phạm)
│   │   ├── diagnose.ts           # Chẩn đoán trình độ học tập ban đầu
│   │   ├── payment.ts            # Xử lý webhook & thanh toán PayOS
│   │   ├── email.ts              # Xử lý gửi email qua Resend API
│   │   └── leaderboard.ts        # Xử lý bảng xếp hạng
│   └── src/services/             # aiProviders, gemini, profile, scaffolding, relevance...
│
├── scripts/                      # ═══ BỘ TOOL VALIDATION & BUILD TỰ ĐỘNG ═══
│   ├── validateLatex.mjs         # Kiểm tra tính toàn vẹn cú pháp KaTeX/LaTeX
│   ├── validate[Subject][Grade]  # Bộ kiểm tra tính hợp lệ dữ liệu câu hỏi từng môn
│   ├── generateMath*Choices.mjs  # Tự động sinh phương án trắc nghiệm nhiễu
│   ├── generateSeoPages.mjs      # Sinh trang HTML tĩnh cho SEO
│   └── generateSitemap.mjs       # Tự động tạo sitemap.xml
│
├── firestore.rules               # Quy tắc bảo mật Firestore (Role-based & Owner-based)
└── storage.rules                 # Quy tắc bảo mật Firebase Storage
```

---

## V. Hướng Dẫn Cài Đặt & Phát Triển

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 22.x
- **npm**: Phiên bản 10.9.x

### Các Lệnh Phát Triển Thường Dùng

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm ci

# 2. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# 3. Kiểm tra lỗi kiểu dữ liệu TypeScript (không sinh file)
npm run type-check

# 4. Kiểm tra mã nguồn với ESLint
npm run lint

# 5. Xem trước bản build production tại local
npm run preview

# 6. Chạy toàn bộ cổng phát hành
npm run validate:release
```

---

## VI. Hệ Thống Scripts Kiểm Tra Dữ Liệu (QA & Validation)

Dự án sở hữu bộ scripts tự động hóa Master Validator giúp kiểm định toàn diện chất lượng mã nguồn và tính toàn vẹn dữ liệu:

```bash
# 1. Kiểm tra chất lượng mã (type-check + lint)
npm run check

# 2. Kiểm định toàn bộ 14 bộ dữ liệu môn học & quy tắc (Dashboard Runner)
npm run validate:content

# Lọc nhanh theo khối lớp hoặc môn học:
npm run validate:grade10              # Kiểm định toàn bộ môn Lớp 10
npm run validate:grade11              # Kiểm định toàn bộ môn Lớp 11
npm run validate:content -- --subject=math   # Kiểm định riêng môn Toán

# 3. Kiểm thử logic hệ thống (Routes, đồng bộ tiến độ, thanh toán)
npm run test

# 4. Kiểm tra trước khi phát hành (Gatekeeper: Check + Test + Content + Build)
npm run validate:release
```

---

## VII. Quy Trình Phân Nhánh & Triển Khai (Branching & Deployment)

Hệ thống áp dụng mô hình **2 tầng môi trường (Staging -> Production)** nhằm bảo vệ website chính thức (`ezonthi.com`) tuyệt đối không bị gián đoạn hay lỗi giao diện trong quá trình phát triển tính năng mới.

### 1. Phân Định Nhánh & Môi Trường

| Nhánh Git | Môi trường | Lệnh Deploy | URL Truy Cập | Mục đích |
| :--- | :--- | :--- | :--- | :--- |
| **`staging`** | **Staging (Kiểm thử)** | `npm run deploy:staging` | `https://on-thi-vao-10-7d87c--staging.web.app` | Thử nghiệm tính năng, kiểm thử giao diện, test thiết bị thực tế |
| **`main`** | **Production (Chính thức)** | `npm run deploy` / `npm run deploy:prod` | `https://ezonthi.com` | Bản phát hành chính thức cho toàn bộ học sinh |

> [!TIP]
> **Khóa an toàn Branch Guard (`checkDeployBranch.mjs`)**: Nếu bạn đang đứng ở nhánh `staging` mà lỡ tay gõ lệnh `npm run deploy`, hệ thống sẽ **tự động chặn lại** và nhắc nhở dùng `npm run deploy:staging`, ngăn chặn 100% việc đẩy nhầm code thử nghiệm lên website production.

---

### 2. Quy Trình Chuẩn Cho Lập Trình Viên (SOP)

#### Bước 1: Phát triển & Thử nghiệm trên nhánh `staging`
Mọi thay đổi tính năng, sửa lỗi hoặc thêm dữ liệu môn học đều thực hiện trên nhánh `staging`:
```bash
# Đảm bảo đang đứng ở nhánh staging
git checkout staging

# Khởi chạy dev server cục bộ
npm run dev
```

#### Bước 2: Deploy lên môi trường Staging để kiểm tra thực tế
Sau khi code xong và muốn kiểm thử trên web hoặc mobile:
```bash
# Tự động build và deploy lên Firebase Hosting Channel "staging"
npm run deploy:staging
```
*Firebase sẽ sinh đường link kiểm thử riêng biệt (không ảnh hưởng tới `ezonthi.com`). Hãy mở link này bằng chế độ Ẩn danh hoặc nhấn `Ctrl + F5` để test.*

#### Bước 3: Nghiệm thu & Phát hành lên Production (`main`)
Khi tính năng trên Staging đã hoạt động hoàn hảo và vượt qua toàn bộ bài test:
```bash
# 1. Commit và đẩy nhánh staging lên remote
git add .
git commit -m "feat: hoàn tất tính năng XYZ và kiểm thử trên staging"
git push origin staging

# 2. Chuyển sang nhánh main và merge staging vào
git checkout main
git merge staging
git push origin main

# 3. Deploy lên website chính thức ezonthi.com
npm run deploy
```

---

### 3. Các Lệnh Triển Khai Khác

```bash
# 1. Build hoàn chỉnh (sinh sitemap + tsc + vite build + sinh trang SEO tĩnh)
npm run build

# 2. Deploy các quy tắc bảo mật Firestore Rules & Storage Rules
npm run deploy-rules

# 3. Nạp dữ liệu tri thức tĩnh vào Cloud Functions (nếu cần)
npm run seed:knowledge
npm run seed:grammar
```

---

## VIII. Quy Chuẩn Mở Rộng & Thêm Dữ Liệu Mới

### 1. Thư Mục Dữ Liệu Chuẩn
Khi bổ sung một môn học mới tại `src/data/grade{X}/{subject}/`, cần có 4 thành phần chính:
- `topics.ts`: Danh sách chương bài học (phân loại theo `tier: 1 | 2 | 3`).
- `questionTypes.ts`: Danh sách dạng bài (bắt buộc có `difficulty` và `examFrequency`).
- `questions.ts`: Ngân hàng câu hỏi (định nghĩa rõ `answerSchema` và `autoCheckMode`).
- `solutions.ts`: Lời giải chi tiết (bắt buộc có `reviewSuggestions: string[]`).

### 2. Quy Ước Đặt ID
- **Lớp 9**: `math-t{N}`, `math-qt{N}`, `math-q{N}`, `math-s{N}`
- **Lớp 10**: `math10-t{N}`, `chem10-qt{NN}`, `phys10-q{N}`, `bio10-s{N}`, `hist10-qt{N}`...
- **Lớp 11**: `math11-t{N}`, `chem11-qt{N}`, `phys11-q{N}`, `bio11-s{N}`, `eng11-qt{N}`...

---

## 📁 Tài Liệu Bổ Sung Trong Thư Mục `docs/`

- [AGENT.md]: Tài liệu kỹ thuật chi tiết dành cho các AI Agent phát triển dự án.
- [content-guidelines.md](docs/content-guidelines.md): Quy cách chuẩn hóa nội dung câu hỏi và phân phối kiến thức.
- [question-authoring-guide.md](docs/question-authoring-guide.md): Cẩm nang soạn thảo câu hỏi trắc nghiệm và tự luận.
- [learning-roadmap.md](docs/learning-roadmap.md): Khung lộ trình học tập 3 chặng.
- [student-learning-flow.md](docs/student-learning-flow.md): Sơ đồ luồng trải nghiệm người học.

---

> [!NOTE]
> Mọi thay đổi logic chấm điểm hoặc mô hình dữ liệu cần được cập nhật đồng bộ tại [src/types/index.ts](src/types/index.ts) để đảm bảo an toàn kiểu dữ liệu (Type Safety) cho toàn bộ ứng dụng.

> [!IMPORTANT]
> Khi soạn thảo nội dung môn **Hóa học** theo chuẩn **GDPT 2018**: Thể tích mol của chất khí ở điều kiện chuẩn (đkc: 25°C, 1 bar) là **$24,79\text{ lít/mol}$**, tuyệt đối không dùng hằng số cũ $22,4\text{ lít/mol}$.

### Kiểm thử và phát hành bảo mật

- `npm run validate:release`: kiểm tra toàn diện quy chuẩn repo, test cases, nội dung dữ liệu và build production bundle.
- `npm run type-check` và `npm run lint`: kiểm tra TypeScript/ESLint.
- `npm run build`: build giao diện, sitemap và trang SEO.
- `npm --prefix functions run build`: sinh catalog đáp án từ dữ liệu dự án và biên dịch backend. Cần cài dependency ở cả thư mục gốc lẫn `functions`.
- Phát hành backend trước: `firebase deploy --only functions --project on-thi-vao-10-7d87c`.
- Sau đó phát hành rules/indexes và giao diện: `firebase deploy --only firestore,storage,hosting --project on-thi-vao-10-7d87c`.

Không đưa API key Resend/PayOS vào frontend. Backend nhận cấu hình qua môi trường Functions. Không khôi phục rules cũ để xử lý lỗi tương thích; xem hướng dẫn dữ liệu cũ trong tài liệu bảo mật.
