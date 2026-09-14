import { db } from './firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppNotification, NotificationType, TargetGrade } from '../types/notificationTypes';
import { logger } from '../utils/logger';

class NotificationService {
  private getStorageKey(userId: string): string {
    return `otv10_read_notifs_${userId}`;
  }

  /**
   * Đọc danh sách ID thông báo đã đọc từ LocalStorage
   */
  public getReadIds(userId: string): string[] {
    if (typeof localStorage === 'undefined' || !userId) return [];
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  public markAsRead(userId: string, notificationId: string): string[] {
    if (!userId || !notificationId) return [];
    const current = this.getReadIds(userId);
    if (!current.includes(notificationId)) {
      const updated = [...current, notificationId].slice(-500);
      try {
        localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
      } catch (err) {
        logger.error('Lỗi khi ghi read_notifications:', err);
      }
      return updated;
    }
    return current;
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  public markAllAsRead(userId: string, allIds: string[]): string[] {
    if (!userId || !allIds.length) return [];
    const current = this.getReadIds(userId);
    const updated = Array.from(new Set([...current, ...allIds])).slice(-500);
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
    } catch (err) {
      logger.error('Lỗi khi ghi tất cả read_notifications:', err);
    }
    return updated;
  }

  /**
   * Tải trang thông báo gần nhất và đọc thêm danh sách cũ trong thời gian chuyển đổi.
   */
  public async fetchNotifications(userId: string, userGrade?: string): Promise<AppNotification[]> {
    try {
      const [snapshot, legacySnapshot] = await Promise.all([
        getDocs(query(collection(db, 'system_notifications'), orderBy('createdAt', 'desc'), limit(100))),
        getDoc(doc(db, 'system_metrics', 'notification_directory')),
      ]);
      const rawList: any[] = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      if (legacySnapshot.exists() && Array.isArray(legacySnapshot.data().notificationsList)) {
        rawList.push(...legacySnapshot.data().notificationsList.slice(-100));
      }
      const readIds = new Set(this.getReadIds(userId));

      const list: AppNotification[] = [];

      // Sắp xếp thông báo mới nhất lên đầu
      const uniqueRaw = [...new Map(rawList.filter(item => item?.id).map(item => [item.id, item])).values()];
      const sortedRaw = uniqueRaw.slice().sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      sortedRaw.forEach((item) => {
        // Lọc theo khối lớp (nếu có chỉ định)
        if (!item.targetGrade || item.targetGrade === 'all' || (userGrade && item.targetGrade === userGrade)) {
          list.push({
            id: item.id || `notif_${Math.random().toString(36).substring(2, 9)}`,
            title: item.title || 'Thông báo mới',
            body: item.body || '',
            type: (item.type as NotificationType) || 'system',
            targetGrade: item.targetGrade as TargetGrade,
            actionUrl: item.actionUrl || null,
            createdAt: item.createdAt || new Date().toISOString(),
            read: readIds.has(item.id),
            createdByEmail: item.createdByEmail || null,
          });
        }
      });

      return list;
    } catch (err) {
      logger.error('Lỗi khi nạp thông báo từ Firestore:', err);
      return [];
    }
  }

  /**
   * Gửi thông báo thành một tài liệu độc lập để không tăng vô hạn một tài liệu chung.
   */
  public async sendBroadcastNotification(payload: {
    title: string;
    body: string;
    type: NotificationType;
    targetGrade?: TargetGrade;
    actionUrl?: string;
    createdByEmail?: string;
  }): Promise<boolean> {
    try {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newNotifItem = {
        id: notifId,
        title: payload.title.trim(),
        body: payload.body.trim(),
        type: payload.type || 'system',
        targetGrade: payload.targetGrade || 'all',
        actionUrl: payload.actionUrl?.trim() || null,
        createdByEmail: payload.createdByEmail || 'Ezonthi',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'system_notifications', notifId), {
        ...newNotifItem,
        updatedAt: serverTimestamp(),
      });

      logger.info('Đã phát hành thông báo hệ thống thành công');
      return true;
    } catch (err) {
      logger.error('Không thể phát hành thông báo:', err);
      return false;
    }
  }

  /**
   * Xóa 1 thông báo hệ thống khỏi danh sách (Admin / Giáo viên)
   */
  public async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'system_notifications', notificationId));

      logger.info('Đã xóa thông báo hệ thống thành công:', notificationId);
      return true;
    } catch (err) {
      logger.error('Lỗi khi xóa thông báo hệ thống:', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
