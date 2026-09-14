import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { db } from '../config.js';

export const BOOTSTRAP_TEACHER_UID = 'hzSKwkaroTR1LKcXp09E5wL7F6f1';

export function requireUser(request: Pick<CallableRequest, 'auth'>): string {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Yêu cầu đăng nhập.');
  return request.auth.uid;
}

export async function requireTeacher(request: Pick<CallableRequest, 'auth'>): Promise<string> {
  const uid = requireUser(request);
  if (uid === BOOTSTRAP_TEACHER_UID) return uid;
  const teacher = await db.collection('teachers').doc(uid).get();
  if (!teacher.exists || teacher.data()?.active !== true || teacher.data()?.role !== 'teacher') {
    throw new HttpsError('permission-denied', 'Chỉ giáo viên được phép thực hiện tác vụ này.');
  }
  return uid;
}
