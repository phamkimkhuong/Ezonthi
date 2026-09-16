import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, ShieldCheck, Target, Trophy, BookOpen } from 'lucide-react-native';
import * as Google from 'expo-auth-session/providers/google';
import { MobileAuthService } from '../services/authService';
import { HapticService } from '../services/hapticService';
import Svg, { Path } from 'react-native-svg';

// Logo Google SVG sắc nét
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Hook xác thực Google qua expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '326319018998-dummy.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      if (id_token || access_token) {
        handleGoogleSuccess(id_token, access_token);
      }
    } else if (response?.type === 'error') {
      setLoading(false);
      Alert.alert('Đăng nhập gián đoạn', 'Không thể kết nối đến tài khoản Google. Vui lòng thử lại.');
    }
  }, [response]);

  const handleGoogleSuccess = async (idToken: string, accessToken?: string) => {
    setLoading(true);
    try {
      await MobileAuthService.signInWithGoogleCredential(idToken, accessToken);
      HapticService.success();
      Alert.alert('Thành công! 🎉', 'Đăng nhập thành công. Chúc bạn học tập hiệu quả!', [
        { text: 'Bắt đầu học', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      HapticService.warning();
      Alert.alert('Lỗi đăng nhập', 'Không thể xác thực với Firebase. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginPress = async () => {
    HapticService.selection();
    setLoading(true);
    try {
      if (request) {
        await promptAsync();
      } else {
        Alert.alert(
          'Đăng Nhập Bằng Google',
          'Đang khởi tạo kết nối Google OAuth. Vui lòng thử lại sau giây lát.'
        );
        setLoading(false);
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Thông báo', 'Đã hủy thao tác đăng nhập Google.');
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View className="px-5 pt-12 pb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center"
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-white">Đăng Nhập</Text>
          <View className="w-10" />
        </View>

        {/* Brand Banner */}
        <View className="items-center px-6 mt-6 mb-8">
          <View className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 items-center justify-center mb-4 shadow-xl">
            <Sparkles size={40} color="#818cf8" />
          </View>
          <Text className="text-2xl font-black text-white text-center">
            EZ Ôn Thi Vào 10
          </Text>
          <Text className="text-xs text-indigo-300 text-center mt-1.5 font-medium">
            Nền tảng luyện thi & Bứt phá điểm số vào lớp 10
          </Text>
        </View>

        {/* Benefits Card */}
        <View className="mx-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 mb-8 space-y-3.5 gap-3.5">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Trải nghiệm học tập trọn vẹn
          </Text>

          <View className="flex-row items-center space-x-3 gap-3">
            <View className="w-8 h-8 rounded-xl bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
              <Target size={16} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">Lộ trình ôn luyện cá nhân hóa</Text>
              <Text className="text-[11px] text-slate-400">
                Phân tích điểm mạnh - yếu, đề xuất bài tập trúng đích vào 10.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-3 gap-3">
            <View className="w-8 h-8 rounded-xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
              <Trophy size={16} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">Duy trì Kỷ luật & Đua top toàn quốc</Text>
              <Text className="text-[11px] text-slate-400">
                Tích lũy kinh nghiệm (XP), giữ chuỗi ngày học liên tục (Streak).
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-3 gap-3">
            <View className="w-8 h-8 rounded-xl bg-indigo-500/20 items-center justify-center border border-indigo-500/30">
              <BookOpen size={16} color="#818cf8" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">Sổ Lỗi Sai & Ôn tập thông minh</Text>
              <Text className="text-[11px] text-slate-400">
                Tự động lưu câu sai, giải chi tiết và nhắc nhở ôn lại đúng lúc.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-6 space-y-3 gap-3 mb-8">
          {/* Primary Action: Sign in with Google */}
          <TouchableOpacity
            onPress={handleGoogleLoginPress}
            disabled={loading}
            activeOpacity={0.85}
            className="w-full bg-white active:bg-slate-100 py-4 px-6 rounded-2xl flex-row items-center justify-center space-x-3 gap-3 shadow-xl"
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <GoogleIcon />
                <Text className="text-slate-900 font-bold text-sm">
                  Tiếp Tục Với Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Footer Note */}
        <View className="mx-6 mb-8 flex-row items-center justify-center space-x-1.5 gap-1.5 opacity-70">
          <ShieldCheck size={14} color="#94a3b8" />
          <Text className="text-[11px] text-slate-400 text-center">
            Bảo mật thông tin qua Google • An toàn & Nhanh chóng
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
