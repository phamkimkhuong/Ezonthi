import { Tabs } from 'expo-router';
import { Home, BookOpen, BookMarked, Trophy, Settings } from 'lucide-react-native';
import { useUserStore } from '../../services/storageService';

export default function TabLayout() {
  const { mistakes } = useUserStore();
  const pendingMistakesCount = mistakes.filter(m => m.reviewStatus !== 'fixed').length;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
          borderBottomColor: '#1e293b',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang Chủ',
          headerTitle: 'EZ Ôn Thi - Luyện Thi Vào 10',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Môn Học',
          headerTitle: 'Kho Tàng Đề Thi & Dạng Bài',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mistakes"
        options={{
          title: 'Sổ Lỗi',
          headerTitle: 'Sổ Lỗi Sai & Ôn Tập',
          tabBarBadge: pendingMistakesCount > 0 ? pendingMistakesCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#f43f5e', fontSize: 10, fontWeight: 'bold' },
          tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rank"
        options={{
          title: 'Xếp Hạng',
          headerTitle: 'Bảng Vàng Thi Đua Toàn Quốc',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài Đặt',
          headerTitle: 'Cài Đặt & Nhắc Nhở Học Tập',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
