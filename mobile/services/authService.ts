import { GoogleAuthProvider, signInWithCredential, signOut as fbSignOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebase';
import { UserProfile, useUserStore } from '../stores';
import { CloudSyncService } from './cloudSyncService';

export const MobileAuthService = {
  /**
   * Đăng nhập chuẩn bằng Google Credential (idToken / accessToken)
   * Đồng bộ tài khoản 1:1 với website ezonthi.com
   */
  async signInWithGoogleCredential(idToken: string, accessToken?: string): Promise<UserProfile> {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Học sinh',
      photoURL: user.photoURL,
      isAnonymous: false,
    };

    useUserStore.getState().setUser(profile);

    // Kéo và gộp dữ liệu học tập từ Firestore về máy
    await CloudSyncService.pullAndMergeFromCloud(profile);

    return profile;
  },

  /**
   * Đăng xuất tài khoản
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Bỏ qua nếu chưa đăng nhập qua Google
    }
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Lỗi đăng xuất Firebase:', e);
    }
    useUserStore.getState().setUser(null);
  }
};
