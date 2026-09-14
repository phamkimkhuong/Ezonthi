import { getAuth } from 'firebase-admin/auth';
import { randomInt } from 'node:crypto';
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { db, payOS } from "../config.js";
import { FieldValue } from "firebase-admin/firestore";
import { requireTeacher } from "../services/access.js";
import { premiumPatch, trialPatch } from "../services/entitlements.js";
import { settleVerifiedPayment } from "../services/paymentSettlement.js";

export const validateAffiliateCode = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Yêu cầu đăng nhập để sử dụng mã giảm giá.");
  }

  const codeInput = request.data?.code;
  if (!codeInput || typeof codeInput !== "string") {
    throw new HttpsError("invalid-argument", "Thiếu mã giảm giá.");
  }

  const planId = request.data?.planId === "plan_3m" ? "plan_3m" : "plan_12m";
  const baseAmount = planId === "plan_3m" ? 89000 : 129000;

  const cleanCode = codeInput.trim().toUpperCase();
  const codeDoc = await db.collection("affiliateCodes").doc(cleanCode).get();

  if (!codeDoc.exists) {
    return {
      valid: false,
      message: "Mã giảm giá không tồn tại.",
    };
  }

  const codeData = codeDoc.data() || {};
  if (codeData.isActive === false) {
    return {
      valid: false,
      message: "Mã giảm giá này đã tạm dừng hoạt động.",
    };
  }

  if (codeData.expiresAt && new Date(codeData.expiresAt) < new Date()) {
    return {
      valid: false,
      message: "Mã giảm giá này đã hết hạn sử dụng.",
    };
  }

  if (
    typeof codeData.maxUsage === "number" &&
    codeData.maxUsage > 0 &&
    (codeData.usageCount || 0) >= codeData.maxUsage
  ) {
    return {
      valid: false,
      message: "Mã giảm giá này đã hết lượt sử dụng.",
    };
  }

  const discountPercent = typeof codeData.discountPercent === "number" ? codeData.discountPercent : 20;
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  return {
    valid: true,
    code: cleanCode,
    sellerName: codeData.sellerName || "Đối tác",
    discountPercent,
    originalAmount: baseAmount,
    discountAmount,
    finalAmount,
    message: `Áp dụng mã thành công! Giảm ${discountPercent}% (-${discountAmount.toLocaleString("vi-VN")}đ)`,
  };
});

export const createPaymentLink = onCall({
  cors: true,
}, async (request) => {
  if (!payOS) {
    throw new HttpsError("failed-precondition", "Cổng thanh toán PayOS chưa được cấu hình trên máy chủ.");
  }

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Yêu cầu đăng nhập để mua gói Premium.");
  }

  const uid = request.auth.uid;
  const email = request.auth.token?.email || "";

  const { returnUrl, cancelUrl, affiliateCode: rawAffiliateCode, planId: rawPlanId } = request.data;
  if (!returnUrl || !cancelUrl) {
    throw new HttpsError("invalid-argument", "Thiếu tham số returnUrl hoặc cancelUrl.");
  }

  const planId = rawPlanId === "plan_3m" ? "plan_3m" : "plan_12m";
  const durationMonths = planId === "plan_3m" ? 3 : 12;
  const baseAmount = planId === "plan_3m" ? 89000 : 129000;
  let finalAmount = baseAmount;
  let discountAmount = 0;
  let discountPercent = 0;
  let commissionAmount = 0;
  let sellerUid: string | null = null;
  let affiliateCode: string | null = null;

  const description = planId === "plan_3m" ? "Premium ezonthi 3M" : "Premium ezonthi 12M";
  const orderCode = Date.now() * 1000 + randomInt(1000);

  // Tra cứu và kiểm tra mã giảm giá nếu người dùng nhập
  if (rawAffiliateCode && typeof rawAffiliateCode === "string") {
    const cleanCode = rawAffiliateCode.trim().toUpperCase();
    const codeDoc = await db.collection("affiliateCodes").doc(cleanCode).get();

    if (codeDoc.exists) {
      const codeData = codeDoc.data() || {};
      const isExpired = codeData.expiresAt && new Date(codeData.expiresAt) < new Date();
      const isMaxed = typeof codeData.maxUsage === "number" && codeData.maxUsage > 0 && (codeData.usageCount || 0) >= codeData.maxUsage;

      if (codeData.isActive !== false && !isExpired && !isMaxed) {
        affiliateCode = cleanCode;
        sellerUid = codeData.sellerUid || null;
        discountPercent = typeof codeData.discountPercent === "number" ? codeData.discountPercent : 20;
        discountAmount = Math.round((baseAmount * discountPercent) / 100);
        finalAmount = Math.max(1000, baseAmount - discountAmount);

        const commissionPercent = typeof codeData.commissionPercent === "number" ? codeData.commissionPercent : (75 - discountPercent);
        commissionAmount = Math.round((baseAmount * commissionPercent) / 100);
      }
    }
  }

  const paymentData = {
    orderCode,
    amount: finalAmount,
    description: description.slice(0, 25),
    cancelUrl,
    returnUrl,
    items: [
      {
        name: affiliateCode ? `Premium ${durationMonths}M (-${discountPercent}%)` : `Premium Account ${durationMonths}M`,
        quantity: 1,
        price: finalAmount,
      },
    ],
  };

  try {
    const response = await payOS.paymentRequests.create(paymentData);

    await db.collection("transactions").doc(String(orderCode)).create({
      orderCode,
      userId: uid,
      email,
      planId,
      durationMonths,
      originalAmount: baseAmount,
      discountAmount,
      discountPercent,
      amount: finalAmount,
      affiliateCode,
      sellerUid,
      commissionAmount,
      commissionStatus: sellerUid ? "pending" : null,
      status: "pending",
      paymentLinkId: response.paymentLinkId,
      checkoutUrl: response.checkoutUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      checkoutUrl: response.checkoutUrl,
      orderCode,
    };
  } catch (error: any) {
    console.error("Lỗi tạo link thanh toán PayOS:", error);
    throw new HttpsError("internal", `Không thể tạo liên kết thanh toán: ${error.message}`);
  }
});

export const payosWebhook = onRequest({ cors: false }, async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }
  if (!payOS) { res.status(503).json({ success: false }); return; }
  let payment;
  try {
    payment = await payOS.webhooks.verify(req.body);
  } catch {
    res.status(400).json({ success: false, message: 'Invalid webhook signature or payload' });
    return;
  }
  try {
    const status = await settleVerifiedPayment(db, payment);
    res.status(200).json({ success: true, status });
  } catch (error) {
    console.error('Payment settlement failed', error);
    res.status(500).json({ success: false, message: 'Payment could not be settled' });
  }
});

export const grantPremiumByEmail = onCall({
  cors: true,
}, async (request) => {
  const callerUid = await requireTeacher(request);

  const { studentEmail, packageType = "plan_12m" } = request.data;
  if (!studentEmail || typeof studentEmail !== "string") {
    throw new HttpsError("invalid-argument", "Thiếu hoặc sai định dạng email học sinh.");
  }

  const targetEmail = studentEmail.trim().toLowerCase();

  // Firebase Auth owns identity; profile email is never used as grant authority.
  const identity = await getAuth().getUserByEmail(targetEmail).catch(() => null);
  if (!identity || identity.disabled) throw new HttpsError('not-found', 'Không tìm thấy tài khoản đang hoạt động với email này.');
  const userRef = db.collection('users').doc(identity.uid);
  const userData = (await userRef.get()).data() || {};

  // Xác định thời hạn & tên gói dựa vào packageType
  let durationMs: number;
  let planName: string;
  let isTrial: boolean;

  if (packageType === "trial_1m") {
    durationMs = 30 * 24 * 60 * 60 * 1000;
    planName = "Gói Dùng Thử (Trial 30 ngày)";
    isTrial = true;
  } else if (packageType === "plan_3m") {
    durationMs = 90 * 24 * 60 * 60 * 1000;
    planName = "Gói 3 Tháng";
    isTrial = false;
  } else if (packageType === "permanent") {
    durationMs = 100 * 365 * 24 * 60 * 60 * 1000; // 100 năm
    planName = "Gói VIP Trọn Đời";
    isTrial = false;
  } else {
    // plan_12m
    durationMs = 365 * 24 * 60 * 60 * 1000;
    planName = "Gói 12 Tháng (VIP 1 Năm)";
    isTrial = false;
  }

  await db.runTransaction(async transaction => {
    const current = (await transaction.get(userRef)).data();
    const now = Date.now();
    const entitlement = isTrial
      ? trialPatch(current, now)
      : packageType === 'permanent'
        ? { isPremium: true, premiumPermanent: true, premiumUntil: null }
        : premiumPatch(current, durationMs / 86_400_000, now);
    transaction.set(userRef, {
      ...entitlement,
      trialConsumed: isTrial || current?.trialConsumed === true || current?.trialActivated === true || Boolean(current?.trialStartDate),
      trialActivated: isTrial,
      premiumPlan: planName,
      planName,
      premiumUpdatedAt: new Date(now),
      grantedByTeacher: callerUid,
    }, { merge: true });
  });

  return {
    success: true,
    message: `Đã cấp quyền Premium thành công cho học sinh ${userData.name || ""} (${targetEmail})!`,
    studentName: userData.name || "Học sinh",
  };
});

/**
 * 💸 Yêu cầu rút tiền hoa hồng (Khóa & trừ balance khả dụng, chuyển sang pendingBalance qua Transaction)
 */
export const requestPayout = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Bạn cần đăng nhập để thực hiện yêu cầu rút tiền.");
  }

  const sellerUid = request.auth.uid;
  const amount = Number(request.data?.amount);
  const bankAccount = request.data?.bankAccount;

  if (!Number.isSafeInteger(amount) || amount < 100000) {
    throw new HttpsError("invalid-argument", "Số tiền rút tối thiểu là 100.000 VNĐ.");
  }

  if (
    !bankAccount ||
    typeof bankAccount.bankName !== "string" ||
    typeof bankAccount.accountNumber !== "string" ||
    typeof bankAccount.accountHolder !== "string" ||
    !bankAccount.bankName.trim() ||
    !bankAccount.accountNumber.trim() ||
    !bankAccount.accountHolder.trim()
  ) {
    throw new HttpsError("invalid-argument", "Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng.");
  }

  const walletRef = db.collection("affiliateWallets").doc(sellerUid);
  const payoutRef = db.collection("payoutRequests").doc();

  return await db.runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);
    if (!walletDoc.exists) {
      throw new HttpsError("not-found", "Ví hoa hồng của bạn chưa được khởi tạo.");
    }

    const walletData = walletDoc.data() || {};
    const currentBalance = Number(walletData.balance || 0);
    const currentPending = Number(walletData.pendingBalance || 0);

    if (currentBalance < amount) {
      throw new HttpsError("failed-precondition", "Số dư khả dụng không đủ để thực hiện yêu cầu rút tiền.");
    }

    const newBalance = currentBalance - amount;
    const newPendingBalance = currentPending + amount;

    // Tạm giữ tiền: trừ balance khả dụng, tăng pendingBalance
    transaction.update(walletRef, {
      balance: newBalance,
      pendingBalance: newPendingBalance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Tạo đơn yêu cầu rút tiền với trạng thái 'pending'
    transaction.set(payoutRef, {
      sellerUid,
      amount,
      bankAccount: {
        bankName: bankAccount.bankName.trim(),
        accountNumber: bankAccount.accountNumber.trim(),
        accountHolder: bankAccount.accountHolder.trim(),
      },
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      payoutRequestId: payoutRef.id,
      newBalance,
      newPendingBalance,
      message: "Yêu cầu rút tiền đã được gửi thành công và đang chờ xét duyệt.",
    };
  });
});

/**
 * 🏦 Xử lý đơn rút tiền (Admin/Giáo viên Duyệt hoặc Từ chối qua Transaction)
 */
export const processPayoutRequest = onCall({
  cors: true,
}, async (request) => {
  const callerUid = await requireTeacher(request);

  const { requestId, action, rejectReason } = request.data || {};
  if (!requestId || (action !== "approve" && action !== "reject")) {
    throw new HttpsError("invalid-argument", "Thiếu ID yêu cầu hoặc hành động không hợp lệ.");
  }

  const payoutRef = db.collection("payoutRequests").doc(requestId);

  return await db.runTransaction(async (transaction) => {
    const payoutDoc = await transaction.get(payoutRef);
    if (!payoutDoc.exists) {
      throw new HttpsError("not-found", "Không tìm thấy yêu cầu rút tiền.");
    }

    const payoutData = payoutDoc.data() || {};
    if (payoutData.status !== "pending") {
      throw new HttpsError("failed-precondition", `Yêu cầu này đã được xử lý trước đó (Trạng thái: ${payoutData.status}).`);
    }

    const sellerUid = payoutData.sellerUid;
    const amount = Number(payoutData.amount || 0);
    const walletRef = db.collection("affiliateWallets").doc(sellerUid);
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists) {
      throw new HttpsError("not-found", "Ví hoa hồng của đối tác không tồn tại.");
    }

    const walletData = walletDoc.data() || {};
    const currentPending = Number(walletData.pendingBalance || 0);
    const currentBalance = Number(walletData.balance || 0);

    if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(currentPending) || currentPending < amount ||
        !Number.isSafeInteger(currentBalance) || currentBalance < 0 || !Number.isSafeInteger(currentBalance + amount)) {
      throw new HttpsError('failed-precondition', 'Số dư hoặc yêu cầu rút tiền không hợp lệ; cần đối soát.');
    }
    const newPendingBalance = currentPending - amount;

    if (action === "approve") {
      // Admin đã chuyển khoản thành công -> Trừ pendingBalance
      transaction.update(walletRef, {
        pendingBalance: newPendingBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.update(payoutRef, {
        status: "approved",
        processedBy: callerUid,
        processedAt: FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Đã duyệt yêu cầu rút tiền thành công." };
    } else {
      // Admin từ chối -> Hoàn tiền lại số dư khả dụng (balance) cho User
      const newBalance = currentBalance + amount;

      transaction.update(walletRef, {
        balance: newBalance,
        pendingBalance: newPendingBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.update(payoutRef, {
        status: "rejected",
        rejectReason: rejectReason || "Thông tin rút tiền không hợp lệ.",
        processedBy: callerUid,
        processedAt: FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Đã từ chối và hoàn tiền lại ví đối tác." };
    }
  });
});
