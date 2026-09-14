import React, { useState, useEffect, useCallback } from 'react';
import { affiliateService, PayoutRequestItem } from '../../services/affiliateService';
import { AffiliateCode } from '../../types';
import {
  Wallet,
  TrendingUp,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Building,
  DollarSign,
  Power,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export const TeacherAffiliateManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<AffiliateCode[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllAffiliateData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, p] = await Promise.all([
        affiliateService.getAllCodesForAdmin(),
        affiliateService.getAllTransactionsForAdmin(),
        affiliateService.getAllPayoutRequestsForAdmin()
      ]);
      setCodes(c);
      setTransactions(t);
      setPayoutRequests(p);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu Affiliate cho Admin:', err);
      showToast('Có lỗi xảy ra khi tải dữ liệu quản trị Affiliate.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAffiliateData();
  }, [loadAllAffiliateData]);

  const handleToggleCodeActive = async (codeItem: AffiliateCode) => {
    setActionLoadingId(codeItem.code);
    const newStatus = codeItem.isActive === false;
    try {
      await affiliateService.toggleCodeActive(codeItem.code, newStatus);
      setCodes(prev => prev.map(c => c.code === codeItem.code ? { ...c, isActive: newStatus } : c));
      showToast(newStatus ? `Đã kích hoạt lại mã "${codeItem.code}"` : `Đã tạm dừng mã "${codeItem.code}"`, newStatus ? 'success' : 'error');
    } catch {
      showToast('Không thể đổi trạng thái mã.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProcessPayout = async (req: PayoutRequestItem, status: 'approved' | 'rejected') => {
    if (!req.id) return;
    setActionLoadingId(req.id);
    try {
      await affiliateService.updatePayoutRequestStatus(req.id, status);
      setPayoutRequests(prev => prev.map(p => p.id === req.id ? { ...p, status } : p));
      showToast(status === 'approved' ? `Đã duyệt yêu cầu rút ${req.amount.toLocaleString('vi-VN')}đ thành công!` : 'Đã từ chối và hoàn lại tiền vào ví Seller.', status === 'approved' ? 'success' : 'error');
    } catch (err: any) {
      console.error('Lỗi khi xử lý rút tiền:', err);
      showToast(err.message || 'Lỗi khi xử lý rút tiền.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
  const pendingRequests = payoutRequests.filter(p => p.status === 'pending');

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-sm font-bold text-muted-foreground">Đang tải dữ liệu quản trị Affiliate...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-bold text-white ${
            toastMessage.type === 'success' ? 'bg-emerald-600/95 border-emerald-400/40 shadow-emerald-600/20' : 'bg-rose-600/95 border-rose-400/40 shadow-rose-600/20'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header & Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Wallet className="text-amber-500" size={22} /> Quản Lý Hệ Thống Affiliate (Giáo Viên / Admin)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đối soát hoa hồng, kiểm duyệt rút tiền và quản lý mã giới thiệu trên toàn hệ thống
          </p>
        </div>
        <button
          onClick={loadAllAffiliateData}
          className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} /> Làm Mới
        </button>
      </div>

      {/* Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold mb-2">
            <span>Tổng Mã Giới Thiệu</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Tag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{codes.length} <span className="text-xs font-semibold text-muted-foreground">mã</span></div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold mb-2">
            <span>Doanh Thu Affiliate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalRevenue.toLocaleString('vi-VN')}đ</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold mb-2">
            <span>Tổng Hoa Hồng Đã Ghi Nhận</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalCommission.toLocaleString('vi-VN')}đ</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold mb-2">
            <span>Yêu Cầu Rút Tiền Chờ Duyệt</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Building size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{pendingRequests.length} <span className="text-xs font-semibold text-muted-foreground">yêu cầu</span></div>
        </div>
      </div>

      {/* 1. Danh sách Yêu Cầu Rút Tiền (Payout Requests) */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Building size={18} className="text-amber-500" /> Danh Sách Yêu Cầu Rút Tiền Ngân Hàng ({payoutRequests.length})
        </h3>

        {payoutRequests.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Chưa có yêu cầu rút tiền nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-black">
                <tr>
                  <th className="p-3 rounded-l-xl">Seller UID</th>
                  <th className="p-3">Ngân Hàng</th>
                  <th className="p-3">Số Tài Khoản</th>
                  <th className="p-3">Chủ Tài Khoản</th>
                  <th className="p-3">Số Tiền Rút</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right rounded-r-xl">Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payoutRequests.map((req) => (
                  <tr key={req.id || req.createdAt} className="hover:bg-secondary/20 font-semibold">
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{req.sellerUid.slice(0, 10)}...</td>
                    <td className="p-3 font-bold text-foreground">{req.bankAccount?.bankName}</td>
                    <td className="p-3 font-mono text-foreground font-bold">{req.bankAccount?.accountNumber}</td>
                    <td className="p-3 uppercase font-black text-amber-600 dark:text-amber-400">{req.bankAccount?.accountHolder}</td>
                    <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">{req.amount.toLocaleString('vi-VN')}đ</td>
                    <td className="p-3">
                      {req.status === 'approved' ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-md">Đã Chuyển Khoản</span>
                      ) : req.status === 'rejected' ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/10 text-rose-600 rounded-md">Đã Từ Chối</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/10 text-amber-600 rounded-md animate-pulse">Chờ Chuyển Tiền</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleProcessPayout(req, 'approved')}
                            disabled={actionLoadingId === req.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {actionLoadingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => handleProcessPayout(req, 'rejected')}
                            disabled={actionLoadingId === req.id}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X size={12} />
                            <span>Từ Chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">Đã Xử Lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Tất Cả Mã Giới Thiệu Trên Hệ Thống */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Tag size={18} className="text-amber-500" /> Tất Cả Mã Giới Thiệu Toàn Hệ Thống ({codes.length})
        </h3>

        {codes.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Chưa có mã giới thiệu nào được tạo.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((c) => (
              <div key={c.code} className="p-4 bg-secondary/20 border border-border rounded-2xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{c.code}</span>
                    {c.isActive !== false ? (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded">Hoạt Động</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-slate-500/10 text-slate-500 rounded">Đã Tạm Dừng</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Seller: <strong className="text-foreground">{c.sellerName}</strong></p>
                  <p className="text-xs text-muted-foreground font-medium">Đã dùng: <strong className="text-foreground">{c.usageCount || 0} lượt</strong></p>
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold">Giảm {c.discountPercent || 20}% | HH {c.commissionPercent || 20}%</span>
                  <button
                    onClick={() => handleToggleCodeActive(c)}
                    disabled={actionLoadingId === c.code}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                      c.isActive !== false
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                  >
                    {actionLoadingId === c.code ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : c.isActive !== false ? (
                      <>
                        <Power size={12} /> Tạm Dừng
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} /> Bật Lại
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Lịch Sử Giao Dịch Affiliate Toàn Hệ Thống */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-500" /> Tất Cả Đơn Hàng Qua Affiliate ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Chưa có giao dịch Affiliate nào phát sinh.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-black">
                <tr>
                  <th className="p-3 rounded-l-xl">Mã Đơn</th>
                  <th className="p-3">Học Sinh</th>
                  <th className="p-3">Mã Đã Nhập</th>
                  <th className="p-3">Thực Trả</th>
                  <th className="p-3">Hoa Hồng Seller</th>
                  <th className="p-3 text-right rounded-r-xl">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.map((tx) => (
                  <tr key={tx.id || tx.orderCode} className="hover:bg-secondary/20 font-semibold">
                    <td className="p-3 font-mono text-[11px] text-amber-600 dark:text-amber-400">#{tx.orderCode}</td>
                    <td className="p-3 text-foreground">{tx.email || tx.userId?.slice(0, 10)}</td>
                    <td className="p-3 font-bold uppercase text-indigo-600 dark:text-indigo-400">{tx.affiliateCode || 'N/A'}</td>
                    <td className="p-3 font-black text-foreground">{(tx.amount || 0).toLocaleString('vi-VN')}đ</td>
                    <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">{(tx.commissionAmount || 0).toLocaleString('vi-VN')}đ</td>
                    <td className="p-3 text-right">
                      {tx.status === 'completed' ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded">Thành Công</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/10 text-amber-600 rounded">Chờ Thanh Toán</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
