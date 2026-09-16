import { GoogleAuthProvider, signInWithCredential, signOut as fbSignOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebase';
import { UserProfile, useUserStore } from '../stores';
import { flushLearningStorage, waitForLearningHydration } from '../stores/useUserStore';
import { VocabularyService } from './vocabularyService';

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

    await waitForLearningHydration();
    await VocabularyService.migrateLegacyProgress();
    if (auth.currentUser?.uid !== profile.uid) throw new Error('Tài khoản đã thay đổi.');
    useUserStore.getState().setUser(profile);
    await flushLearningStorage();

    return profile;
  },

  /**
   * Đăng xuất tài khoản
   */
  async signOut(): Promise<void> {
    await flushLearningStorage();
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Bỏ qua nếu chưa đăng nhập qua Google
    }
    await fbSignOut(auth);
    useUserStore.getState().setUser(null);
  }
};
