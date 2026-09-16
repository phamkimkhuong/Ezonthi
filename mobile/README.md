# EZ Ôn Thi - Ứng Dụng Di Động (React Native + Expo)

Ứng dụng di động luyện thi vào 10 và THPT với trải nghiệm Gamification (Streak, XP, Haptic Feedback) và hệ thống thông báo đẩy thông minh (Push Notification) hẹn giờ nhắc học hàng ngày.

---

## 🚀 Hướng Dẫn Khởi Chạy & Thử Nghiệm

### 1. Cài đặt Dependencies
```bash
cd mobile
npm install
```

### 2. Khởi chạy Expo Dev Server
```bash
npm start
# Hoặc:
npx expo start
```

### 3. Thử nghiệm trên điện thoại thật (Không cần cáp)
1. Tải ứng dụng **Expo Go** trên **App Store (iOS)** hoặc **CH Play (Android)**.
2. Mở camera điện thoại quét mã QR hiển thị trên Terminal.
3. Ứng dụng sẽ nạp trực tiếp vào điện thoại với đầy đủ tính năng:
   - **Nhắc nhở học tập (Push Notifications)** lúc 19:30 & 20:30 mỗi tối.
   - **Rung phản hồi (Haptics)** khi chọn đáp án đúng/sai.
   - **Streak & XP**: Tự động tích lũy ngọn lửa học tập hàng ngày.
   - **Render công thức Toán/Lý/Hóa** siêu mượt mà không cần mạng.

---

## 📦 Build File Cài Đặt (APK Android / iOS)

Sử dụng dịch vụ đám mây miễn phí **Expo EAS Build** (không cần cài Android Studio hay cần máy Mac):

```bash
# Đăng nhập tài khoản Expo
npx eas login

# Build file APK cài trực tiếp trên mọi máy Android
npx eas build -p android --profile preview

# Build bản iOS lên TestFlight / App Store (trên cloud)
npx eas build -p ios --profile preview
```
