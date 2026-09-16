# EZ Ôn Thi - Ứng Dụng Di Động (React Native + Expo)

Ứng dụng di động luyện thi vào 10 và THPT với trải nghiệm Gamification (Streak, XP, Haptic Feedback) và hệ thống thông báo đẩy thông minh (Push Notification) hẹn giờ nhắc học hàng ngày.

---

## Nội dung hiện có và kiểm tra

- Lớp 9: 21 câu; lớp 10: 45 câu. Số câu từng môn/chủ đề lấy từ bank trên thiết bị.
- Các chủ đề lớp 11 hiện chưa có câu riêng nên hiển thị “Đang bổ sung”, chưa cho luyện tập.
- Hai đề lớp 11 giữ trạng thái `draft`; chỉ mở khi chuyển sang `ready` và có câu đúng lớp/môn. Không thay bằng đề lớp khác.
- Từ vựng hiện dùng kho English 10; shortcut chỉ hiển thị trong lớp 10.
- ID chủ đề sai hoặc thiếu nội dung trả danh sách rỗng, kể cả khi mở deep link.

Chạy kiểm tra trước khi cập nhật nội dung:

```bash
cd mobile
npm run types-check
npm run test:content
```

Kiểm thử bao gồm số câu thực, scope lớp/môn, đề chưa mở, dữ liệu đặt nhầm bucket và đáp án D (30 giờ) của `math9-t3-q2`. Khi bổ sung bank mới, cập nhật các mốc số lượng trong test và tài liệu cùng lúc.

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
