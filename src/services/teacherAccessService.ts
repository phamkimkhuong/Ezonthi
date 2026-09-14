import type { User } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';

const BOOTSTRAP_TEACHER_UIDS = new Set([
  'hzSKwkaroTR1LKcXp09E5wL7F6f1'
]);


export const teacherAccessService = {
  isBootstrapTeacherUid(user: User | null): boolean {
    return Boolean(user?.uid && BOOTSTRAP_TEACHER_UIDS.has(user.uid));
  },


  isBootstrapTeacher(user: User | null): boolean {
    return this.isBootstrapTeacherUid(user);
  },

  async isTeacher(user: User | null): Promise<boolean> {
    if (!user) return false;
    if (this.isBootstrapTeacher(user)) return true;

    try {
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDocFromServer(teacherRef);
      const data = teacherSnap.data();

      return teacherSnap.exists()
        && data?.active === true
        && data?.role === 'teacher';
    } catch (e) {
      console.error('Lỗi khi kiểm tra quyền giáo viên:', e);
      return false;
    }
  }
};
