/**
 * Bảng màu và Design Tokens chuẩn cho Mobile (Dark Theme First)
 */
export const THEME_COLORS = {
  // Backgrounds
  background: '#0f172a', // slate-950
  card: '#1e293b',       // slate-800
  cardLight: '#334155',  // slate-700
  border: '#1e293b',
  borderLight: '#334155',

  // Primary Brands
  primary: '#6366f1',    // indigo-500
  primaryHover: '#4f46e5', // indigo-600
  primaryLight: '#818cf8', // indigo-400

  // Status & Feedback
  success: '#10b981',    // emerald-500
  successLight: '#34d399',
  warning: '#f59e0b',    // amber-500
  warningLight: '#fbbf24',
  danger: '#f43f5e',     // rose-500
  dangerLight: '#fb7185',
  info: '#0ea5e9',       // sky-500

  // Texts
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8', // slate-400
  textMuted: '#64748b',     // slate-500

  // Subject Branding Colors
  subjects: {
    math: '#6366f1',      // Toán: Indigo
    english: '#10b981',   // Tiếng Anh: Emerald
    chemistry: '#f59e0b', // Hóa: Amber
    physics: '#0ea5e9',   // Lý: Sky
    biology: '#ec4899',   // Sinh: Pink
  },
} as const;
