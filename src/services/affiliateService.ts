import { db, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where, 
  orderBy
} from 'firebase/firestore';
import { AffiliateCode, AffiliateWallet } from '../types';

export interface PayoutRequestItem {
  id?: string;
  sellerUid: string;
  amount: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const affiliateService = {
  /**
   * Lấy thông tin ví hoa hồng của Seller
   */
  async getWallet(sellerUid: string): Promise<AffiliateWallet> {
    const ref = doc(db, 'affiliateWallets', sellerUid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data() as AffiliateWallet;
    }

    const defaultWallet: AffiliateWallet = {
      sellerUid,
      totalEarned: 0,
      balance: 0,
      pendingBalance: 0
    };

    await setDoc(ref, defaultWallet, { merge: true });
    return defaultWallet;
  },

  /**
   * Cập nhật thông tin tài khoản ngân hàng nhận tiền
   */
  async updateBankDetails(sellerUid: string, bankAccount: NonNullable<AffiliateWallet['bankAccount']>): Promise<void> {
    const ref = doc(db, 'affiliateWallets', sellerUid);
    await setDoc(ref, { bankAccount }, { merge: true });
  },

  /**
   * Lấy danh sách các mã giảm giá do Seller này sở hữu
   */
  async getMyCodes(sellerUid: string): Promise<AffiliateCode[]> {
    const ref = collection(db, 'affiliateCodes');
    const q = query(ref, where('sellerUid', '==', sellerUid));
    const snap = await getDocs(q);

    const codes: AffiliateCode[] = [];
    snap.forEach((d) => {
      codes.push(d.data() as AffiliateCode);
    });

    return codes;
  },

  /**
   * Tạo mã giảm giá mới cho Seller
   */
  async createMyCode(sellerUid: string, sellerName: string, rawCode: string, requestedDiscount: number = 20): Promise<AffiliateCode> {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      throw new Error('Mã giảm giá phải có ít nhất 3 ký tự.');
    }

    const discountPercent = Math.max(0, Math.min(75, Math.round(requestedDiscount)));
    const commissionPercent = 75 - discountPercent;

    const ref = doc(db, 'affiliateCodes', cleanCode);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      throw new Error(`Mã "${cleanCode}" đã tồn tại. Vui lòng chọn một tên mã khác.`);
    }

    const newCode: AffiliateCode = {
      code: cleanCode,
      sellerUid,
      sellerName: sellerName || 'Đối tác',
      discountPercent,
      commissionPercent,
      isActive: true,
      usageCount: 0
    };

    await setDoc(ref, newCode);
    return newCode;
  },

  /**
   * Cập nhật lại tỷ lệ chia của mã (Tổng ngân sách = 75%)
   */
  async updateMyCodeRates(code: string, requestedDiscount: number): Promise<{ discountPercent: number; commissionPercent: number }> {
    const discountPercent = Math.max(0, Math.min(75, Math.round(requestedDiscount)));
    const commissionPercent = 75 - discountPercent;

    const ref = doc(db, 'affiliateCodes', code);
    await updateDoc(ref, {
      discountPercent,
      commissionPercent
    });

    return { discountPercent, commissionPercent };
  },

  /**
   * Bật hoặc Tạm dừng hoạt động của mã giảm giá
   */
  async toggleCodeActive(code: string, isActive: boolean): Promise<void> {
    const ref = doc(db, 'affiliateCodes', code);
    await updateDoc(ref, { isActive });
  },

  /**
   * Lấy danh sách lịch sử giao dịch phát sinh từ mã của Seller
   */
  async getMyTransactions(sellerUid: string): Promise<any[]> {
    try {
      const ref = collection(db, 'transactions');
      const q = query(
        ref, 
        where('sellerUid', '==', sellerUid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      return list;
    } catch (err) {
      console.warn('Query giao dịch yêu cầu index composite, đang fall-back query không sort:', err);
      const ref = collection(db, 'transactions');
      const q = query(ref, where('sellerUid', '==', sellerUid));
      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return list;
    }
  },

  /**
   * Gửi yêu cầu rút tiền hoa hồng về ngân hàng (Gửi qua Cloud Function với Atomic Transaction)
   */
  async requestPayout(_sellerUid: string, amount: number, bankAccount: NonNullable<AffiliateWallet['bankAccount']>): Promise<void> {
    const requestPayoutFn = httpsCallable<
      { amount: number; bankAccount: NonNullable<AffiliateWallet['bankAccount']> },
      { success: boolean; message: string }
    >(functions, 'requestPayout');

    await requestPayoutFn({
      amount,
      bankAccount
    });
  },

  /**
   * [ADMIN/TEACHER] Duyệt hoặc Từ chối đơn rút tiền của Seller qua Cloud Function
   */
  async processPayoutRequest(requestId: string, action: 'approve' | 'reject', rejectReason?: string): Promise<void> {
    const processFn = httpsCallable<
      { requestId: string; action: 'approve' | 'reject'; rejectReason?: string },
      { success: boolean; message: string }
    >(functions, 'processPayoutRequest');

    await processFn({
      requestId,
      action,
      rejectReason
    });
  },

  /**
   * Lấy danh sách yêu cầu rút tiền của Seller
   */
  async getPayoutRequests(sellerUid: string): Promise<PayoutRequestItem[]> {
    const ref = collection(db, 'payoutRequests');
    const q = query(ref, where('sellerUid', '==', sellerUid));
    const snap = await getDocs(q);

    const list: PayoutRequestItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as PayoutRequestItem);
    });

    return list;
  },

  /**
   * [ADMIN/TEACHER] Lấy toàn bộ danh sách mã giới thiệu trên toàn hệ thống
   */
  async getAllCodesForAdmin(): Promise<AffiliateCode[]> {
    const ref = collection(db, 'affiliateCodes');
    const snap = await getDocs(ref);
    const list: AffiliateCode[] = [];
    snap.forEach((d) => {
      list.push(d.data() as AffiliateCode);
    });
    return list;
  },

  /**
   * [ADMIN/TEACHER] Lấy toàn bộ danh sách giao dịch affiliate trên toàn hệ thống
   */
  async getAllTransactionsForAdmin(): Promise<any[]> {
    const ref = collection(db, 'transactions');
    const snap = await getDocs(ref);
    const list: any[] = [];
    snap.forEach((d) => {
      if (d.data().affiliateCode || d.data().sellerUid) {
        list.push({ id: d.id, ...d.data() });
      }
    });
    list.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return list;
  },

  /**
   * [ADMIN/TEACHER] Lấy toàn bộ danh sách yêu cầu rút tiền
   */
  async getAllPayoutRequestsForAdmin(): Promise<PayoutRequestItem[]> {
    const ref = collection(db, 'payoutRequests');
    const snap = await getDocs(ref);
    const list: PayoutRequestItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as PayoutRequestItem);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  },

  /**
   * [ADMIN/TEACHER] Duyệt hoặc Từ chối yêu cầu rút tiền của Seller
   */
  async updatePayoutRequestStatus(requestId: string, newStatus: 'approved' | 'rejected'): Promise<void> {
    await this.processPayoutRequest(requestId, newStatus === 'approved' ? 'approve' : 'reject');
  }
};
