import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { functions } from '../../services/firebase';
import { trackProductEvent } from '../../services/productAnalytics';
import { httpsCallable } from 'firebase/functions';
import { authService } from '../../services/authService';
import { AffiliateValidationResult } from '../../types';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Tag,
  X,
  Clock
} from 'lucide-react';

export const PremiumPricing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPremium, user, userData, trialActivated, premiumUntil } = useAppStore();

  const [selectedPlanId, setSelectedPlanId] = useState<'plan_3m' | 'plan_12m'>('plan_12m');
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackProductEvent('paywall_viewed');
  }, []);

  // Toast thông báo tùy chỉnh
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Trạng thái cho mã giảm giá / Affiliate
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<AffiliateValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateCouponCode = async (codeStr: string, targetPlanId: 'plan_3m' | 'plan_12m') => {
    if (!codeStr.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const validateFn = httpsCallable<{ code: string; planId: string }, AffiliateValidationResult>(
        functions,
        'validateAffiliateCode'
      );
      const res = await validateFn({ code: codeStr.trim(), planId: targetPlanId });

      if (res.data && res.data.valid) {
        setAppliedDiscount(res.data);
        setCouponError(null);
      } else {
        setAppliedDiscount(null);
        setCouponError(res.data?.message || 'Mã giảm giá không hợp lệ.');
      }
    } catch (err: any) {
      console.error('Lỗi kiểm tra mã giảm giá:', err);
      setAppliedDiscount(null);
      setCouponError(err?.message || 'Không thể kiểm tra mã giảm giá lúc này.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Tự động kiểm tra mã giảm giá nếu có trong URL (?code=THAYNAM10) và reset loading khi quay lại trang
  useEffect(() => {
    setLoading(false);
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && codeFromUrl.trim()) {
      const cleanCode = codeFromUrl.trim().toUpperCase();
      setCouponInput(cleanCode);
      validateCouponCode(cleanCode, selectedPlanId);
    }
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'cancelled') {
      showToast('Giao dịch thanh toán đã bị hủy.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Xử lý BFCache khi người dùng nhấn Back trên trình duyệt
  useEffect(() => {
    const handlePageShow = () => {
      setLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (!user) {
      try {
        await authService.signInWithGoogle();
      } catch (err: any) {
        alert(err.message || 'Lỗi đăng nhập bằng Google.');
        return;
      }
    }
    await validateCouponCode(couponInput, selectedPlanId);
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleUpgrade = async (planToUpgrade: 'plan_3m' | 'plan_12m') => {
    if (!user) {
      try {
        await authService.signInWithGoogle();
      } catch (err: any) {
        alert(err.message || 'Lỗi đăng nhập bằng Google.');
      }
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedPlanId(planToUpgrade);

    try {
      trackProductEvent('checkout_started', {
        plan_id: planToUpgrade,
        price_vnd: getPriceForPlan(planToUpgrade).final,
      });
      const createPaymentLinkFn = httpsCallable<{ returnUrl: string; cancelUrl: string; affiliateCode?: string; planId: string }, { checkoutUrl: string; orderCode: number }>(
        functions,
        'createPaymentLink'
      );

      const returnUrl = `${window.location.origin}/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/premium?payment=cancelled`;

      const result = await createPaymentLinkFn({
        returnUrl,
        cancelUrl,
        affiliateCode: appliedDiscount?.valid ? appliedDiscount.code : undefined,
        planId: planToUpgrade
      });

      if (result.data?.checkoutUrl) {
        window.location.assign(result.data.checkoutUrl);
      } else {
        throw new Error('Không nhận được liên kết thanh toán từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Lỗi khi thanh toán:', err);
      setError(err?.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleActivateTrial = async () => {
    if (!user) {
      try {
        await authService.signInWithGoogle();
      } catch (err: any) {
        alert(err.message || 'Lỗi đăng nhập bằng Google.');
      }
      return;
    }

    setTrialLoading(true);
    setError(null);

    try {
      await httpsCallable(functions, 'activatePremiumTrial')({});
      trackProductEvent('trial_activated');

      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      });

      showToast('Kích hoạt dùng thử Premium 30 ngày thành công! Chúc bạn học tập bứt phá.', 'success');
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt dùng thử:', err);
      setError(err?.message || 'Có lỗi xảy ra khi kích hoạt dùng thử. Vui lòng thử lại sau.');
    } finally {
      setTrialLoading(false);
    }
  };

  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    if (premiumUntil) {
      const diffTime = new Date(premiumUntil).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRemainingDays(diffDays > 0 ? diffDays : 0);
    }
  }, [premiumUntil]);

  const trialBenefits = [
    'Mở khóa hoàn toàn Chặng 3 (Mục tiêu điểm 9-10)',
    'Hỏi đáp Gia sư AI Socratic thông minh (100 câu/ngày)',
    'Sổ lỗi sai tự động & đề xuất lộ trình khắc phục',
    'Trải nghiệm 100% tài nguyên Lớp 9 - 12 trong 30 ngày'
  ];

  const plan3mBenefits = [
    'Mở khóa trọn bộ 5 môn học (Toán, Anh, Hóa, Lý, Sinh)',
    'Mở khóa Chặng 3 nâng cao (Mục tiêu 9-10 điểm)',
    'Hỏi đáp Gia sư AI Socratic (50 câu/ngày)',
    'Sổ Lỗi Sai tự động gom nhóm bài sai',
    'Thời hạn sử dụng 3 Tháng (90 Ngày)'
  ];

  const plan12mBenefits = [
    'Mở khóa trọn bộ 5 môn học (Toán, Anh, Hóa, Lý, Sinh) Lớp 9 - 12',
    'Mở khóa toàn bộ Chặng 3 nâng cao (Mục tiêu 9-10 điểm & Bài tập khó)',
    'Không giới hạn hỏi đáp Gia sư AI Socratic (100 câu/ngày)',
    'Phân tích chi tiết lỗi sai và tự động gom nhóm trong Sổ Lỗi Sai',
    'Ngân hàng đề thi thử & kiểm tra liên tục cập nhật theo chuẩn GDPT 2018',
    'Thời hạn 12 Tháng (1 Năm) - Tự động nâng khối Lớp 9 ➔ 12'
  ];

  // Tính toán số tiền thực trả cho 2 gói
  const getPriceForPlan = (planId: 'plan_3m' | 'plan_12m') => {
    const base = planId === 'plan_3m' ? 89000 : 129000;
    if (appliedDiscount && appliedDiscount.valid && selectedPlanId === planId) {
      return {
        base,
        final: appliedDiscount.finalAmount || Math.round(base * 0.8),
        discountAmount: appliedDiscount.discountAmount || Math.round(base * 0.2),
        percent: appliedDiscount.discountPercent || 20
      };
    }
    return {
      base,
      final: base,
      discountAmount: 0,
      percent: 0
    };
  };

  const price3m = getPriceForPlan('plan_3m');
  const price12m = getPriceForPlan('plan_12m');

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-bold text-white ${
            toast.type === 'success' ? 'bg-emerald-600/95 border-emerald-400/40 shadow-emerald-600/20' : 'bg-rose-600/95 border-rose-400/40 shadow-rose-600/20'
          }`}>
            {toast.type === 'success' ? <ShieldCheck size={18} className="text-white" /> : <Sparkles size={18} className="text-white" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Quay lại */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Quay lại Bảng điều khiển
      </button>

      {/* Header giới thiệu */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
          <Sparkles size={12} /> NÂNG CẤP HỘI VIÊN BỨT PHÁ (LỚP 9 - 12)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent mb-4">
          Chọn Gói Học Tập Phù Hợp
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Mở khóa toàn bộ tài nguyên bài giảng, đề thi bứt phá chặng 9-10 điểm từ Lớp 9 đến Lớp 12 và học tập không giới hạn cùng trợ lý Gia sư AI thông minh.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold text-center">
          {error}
        </div>
      )}

      {/* Ô nhập Mã giảm giá / Affiliate toàn cục */}
      {(!isPremium || trialActivated) && (
        <div className="max-w-md mx-auto mb-10">
          <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Tag size={14} className="text-amber-500" /> Bạn có mã giới thiệu / Giảm giá?
            </label>
            {appliedDiscount && appliedDiscount.valid ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {appliedDiscount.code}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      (Bởi {appliedDiscount.sellerName})
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                    Đã áp dụng giảm -{appliedDiscount.discountPercent}% cho tất cả các gói!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Gỡ mã giảm giá"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: THAYNAM10)"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-xl font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Áp dụng'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-xs font-bold text-rose-500 mt-1.5">{couponError}</p>
            )}
          </div>
        </div>
      )}

      {/* Danh sách 3 Gói Bán */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">

        {/* Gói 1: Dùng thử 30 ngày */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Trải Nghiệm</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Dành cho học sinh dùng thử</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black rounded-lg uppercase">30 Ngày Free</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-primary bg-clip-text text-transparent">0đ</span>
              <span className="text-xs text-muted-foreground ml-1">/ 30 ngày dùng thử</span>
            </div>

            <hr className="border-border mb-6" />

            <ul className="space-y-3 mb-8">
              {trialBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Check size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-foreground/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {isPremium && trialActivated ? (
            <div className="w-full py-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs rounded-xl text-center flex items-center justify-center gap-1.5 border border-indigo-500/20">
              <ShieldCheck size={16} /> ĐANG DÙNG THỬ (CÒN {remainingDays} NGÀY)
            </div>
          ) : isPremium ? (
            <button
              disabled={true}
              className="w-full py-3 bg-secondary text-muted-foreground font-bold text-xs rounded-xl cursor-not-allowed text-center"
            >
              Đã nâng cấp Premium
            </button>
          ) : (trialActivated || userData?.trialConsumed === true) ? (
            <button
              disabled={true}
              className="w-full py-3 bg-secondary text-muted-foreground font-bold text-xs rounded-xl cursor-not-allowed text-center"
            >
              Hạn dùng thử đã kết thúc
            </button>
          ) : (
            <button
              onClick={handleActivateTrial}
              disabled={trialLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {trialLoading ? <Loader2 className="animate-spin" size={16} /> : 'Dùng Thử 30 Ngày'}
            </button>
          )}
        </div>

        {/* Gói 2: Gói 3 Tháng (89.000đ) */}
        <div className={`bg-card rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${selectedPlanId === 'plan_3m' ? 'border-amber-500 shadow-lg' : 'border-border shadow-sm hover:border-amber-500/50'}`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-1">
                  Gói Cấp Tốc <Clock size={14} className="text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ôn luyện thi cấp tốc 3 tháng</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-lg uppercase">3 Tháng</span>
            </div>

            <div className="mb-6 flex items-baseline gap-2 flex-wrap">
              {appliedDiscount && appliedDiscount.valid ? (
                <>
                  <span className="text-3xl font-black text-amber-500">
                    {(price3m.base * (100 - price3m.percent) / 100).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-muted-foreground">/ 3 tháng</span>
                  <span className="text-xs line-through text-slate-400 font-semibold">89.000đ</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded">
                    -{price3m.percent}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-amber-500">89.000đ</span>
                  <span className="text-xs text-muted-foreground">/ 3 tháng</span>
                </>
              )}
            </div>

            <hr className="border-border mb-6" />

            <ul className="space-y-3 mb-8">
              {plan3mBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <Check size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-semibold">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setSelectedPlanId('plan_3m');
              handleUpgrade('plan_3m');
            }}
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && selectedPlanId === 'plan_3m' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : appliedDiscount?.valid ? (
              `Nâng Cấp 3M Chỉ ${(price3m.base * (100 - price3m.percent) / 100).toLocaleString('vi-VN')}đ`
            ) : (
              'Nâng Cấp Gói 3 Tháng'
            )}
          </button>
        </div>

        {/* Gói 3: Gói 12 Tháng / 1 Năm (120.000đ) - KHUYÊN DÙNG ⭐ */}
        <div className="bg-card rounded-3xl p-6 border-2 border-orange-500 shadow-xl shadow-orange-500/10 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
          {/* Tag nổi bật */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-2xl uppercase shadow-sm">
            TIẾT KIỆM BỨT PHÁ ⭐
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                  Gói Bứt Phá VIP <Zap size={16} className="text-orange-500 fill-orange-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Trọn gói 1 năm học Lớp 9 - 12</p>
              </div>
            </div>

            <div className="mb-6 flex items-baseline gap-2 flex-wrap">
              {appliedDiscount && appliedDiscount.valid ? (
                <>
                  <span className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {(price12m.base * (100 - price12m.percent) / 100).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-muted-foreground">/ 1 năm (12 tháng)</span>
                  <span className="text-xs line-through text-slate-400 font-semibold">129.000đ</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded">
                    -{price12m.percent}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">129.000đ</span>
                  <span className="text-xs text-muted-foreground">/ 1 năm (12 tháng)</span>
                  <span className="text-xs line-through text-slate-400 ml-1">356.000đ</span>
                </>
              )}
            </div>

            <hr className="border-border mb-6" />

            <ul className="space-y-3 mb-8">
              {plan12mBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-semibold">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setSelectedPlanId('plan_12m');
              handleUpgrade('plan_12m');
            }}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && selectedPlanId === 'plan_12m' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : appliedDiscount?.valid ? (
              `Nâng Cấp VIP Chỉ ${(price12m.base * (100 - price12m.percent) / 100).toLocaleString('vi-VN')}đ / Năm`
            ) : (
              'Nâng Cấp VIP 12 Tháng Ngay'
            )}
          </button>
        </div>

      </div>

      {/* Cam kết bảo mật */}
      <div className="mt-12 text-center text-xs text-muted-foreground max-w-md mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
          <ShieldCheck size={14} className="text-primary" /> Hệ thống thanh toán bảo mật VietQR qua PayOS
        </div>
        <p>Giao dịch của bạn được xử lý tự động và mã hóa hoàn toàn. Quyền lợi Premium sẽ được kích hoạt ngay lập tức sau khi giao dịch chuyển khoản thành công.</p>
      </div>
    </div>
  );
};

export default PremiumPricing;
