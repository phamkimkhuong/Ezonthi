/**
 * ROADMAP SERVICE (MOBILE)
 *
 * Quản lý nạp và đồng bộ lộ trình học (Chủ đề, Dạng bài, Lý thuyết, Phương pháp giải)
 * từ Cloudflare R2 CDN với cơ chế Cache-First SWR (Stale-While-Revalidate) và AsyncStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  RoadmapSubjectBundle,
  RoadmapTopic,
  RoadmapQuestionType,
  RoadmapCatalogIndex,
  RoadmapCatalogGrade,
  RoadmapCatalogSubject,
} from './roadmapTypes';
import type { GradeCode, SubjectCode } from '../../src/types';

const R2_PUBLIC_BASE = (process.env.EXPO_PUBLIC_R2_PUBLIC_URL).replace(/\/$/, '');
const CATALOG_STORAGE_KEY = 'mobile_roadmap_catalog_v1';
const BUNDLE_STORAGE_PREFIX = 'mobile_roadmap_bundle_v1_';

class MobileRoadmapServiceClass {
  private memoryBundles = new Map<string, RoadmapSubjectBundle>();
  private memoryCatalog: RoadmapCatalogIndex | null = null;
  private inFlightCatalog: Promise<RoadmapCatalogIndex | null> | null = null;
  private inFlightBundles = new Map<string, Promise<RoadmapSubjectBundle | null>>();
  private listeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try { fn(); } catch (e) { console.error('Lỗi listener MobileRoadmapService:', e); }
    });
  }

  private getResourceUrl(relativePath: string): string {
    const cleanPath = relativePath.replace(/^\//, '');
    return `${R2_PUBLIC_BASE}/${cleanPath}`;
  }

  /**
   * Lấy Mục lục lộ trình học toàn hệ thống (Catalog Index)
   */
  public async getCatalog(forceRefresh = false): Promise<RoadmapCatalogIndex | null> {
    if (!forceRefresh && this.memoryCatalog) {
      return this.memoryCatalog;
    }

    // 1. Đọc nhanh từ AsyncStorage (0 - 5ms)
    if (!forceRefresh) {
      try {
        const raw = await AsyncStorage.getItem(CATALOG_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as RoadmapCatalogIndex;
          if (parsed && parsed.schemaVersion === '1.0.0') {
            this.memoryCatalog = parsed;
            // Tải ngầm bản mới nhất từ CDN R2
            void this.revalidateCatalog();
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Lỗi đọc catalog từ AsyncStorage:', err);
      }
    }

    // 2. Fetch từ mạng nếu chưa có cache
    return this.revalidateCatalog();
  }

  /**
   * Tải và làm mới Mục lục từ CDN R2
   */
  private async revalidateCatalog(): Promise<RoadmapCatalogIndex | null> {
    if (this.inFlightCatalog) return this.inFlightCatalog;

    this.inFlightCatalog = (async () => {
      const url = this.getResourceUrl('roadmap/index.json');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status} fetching catalog: ${url}`);
        const data = (await res.json()) as RoadmapCatalogIndex;

        if (data && data.schemaVersion === '1.0.0') {
          const isNewer = !this.memoryCatalog || data.updatedAt !== this.memoryCatalog.updatedAt;
          this.memoryCatalog = data;
          await AsyncStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data)).catch((e) => {
            console.warn('Không ghi được catalog vào AsyncStorage:', e);
          });
          if (isNewer) this.notify();
          return data;
        }
        return this.memoryCatalog;
      } catch (error) {
        console.warn('Không tải được catalog từ R2, giữ cache hiện tại:', error);
        return this.memoryCatalog;
      } finally {
        this.inFlightCatalog = null;
      }
    })();

    return this.inFlightCatalog;
  }

  /**
   * Lấy gói dữ liệu lý thuyết và lộ trình của một môn học (Subject Bundle)
   */
  public async getBundle(
    grade: GradeCode,
    subject: SubjectCode,
    forceRefresh = false
  ): Promise<RoadmapSubjectBundle | null> {
    const key = `${grade}:${subject}`;

    // 1. Kiểm tra RAM cache
    if (!forceRefresh && this.memoryBundles.has(key)) {
      return this.memoryBundles.get(key)!;
    }

    const storageKey = `${BUNDLE_STORAGE_PREFIX}${key}`;

    // 2. Kiểm tra AsyncStorage (offline first)
    if (!forceRefresh) {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as RoadmapSubjectBundle;
          if (parsed && parsed.schemaVersion === '1.0.0') {
            this.memoryBundles.set(key, parsed);
            // SWR: Kiểm tra ngầm xem R2 có bản mới hơn không
            void this.checkAndRevalidateBundle(grade, subject, parsed.contentVersion);
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`Lỗi đọc bundle ${key} từ AsyncStorage:`, err);
      }
    }

    // 3. Tải từ mạng nếu chưa có cache
    return this.fetchBundleFromNetwork(grade, subject);
  }

  /**
   * So sánh contentVersion để revalidate ngầm
   */
  private async checkAndRevalidateBundle(
    grade: GradeCode,
    subject: SubjectCode,
    currentVersion: string
  ): Promise<void> {
    try {
      const catalog = await this.getCatalog();
      if (!catalog) return;
      const gradeData = catalog.grades.find((g) => g.id === grade);
      const subjectMeta = gradeData?.subjects.find((s) => s.id === subject);

      if (subjectMeta && subjectMeta.contentVersion !== currentVersion) {
        await this.fetchBundleFromNetwork(grade, subject);
      }
    } catch (err) {
      console.debug(`Bỏ qua kiểm tra version mobile [${grade}:${subject}]:`, err);
    }
  }

  /**
   * Tải trực tiếp bundle JSON từ CDN R2
   */
  private async fetchBundleFromNetwork(
    grade: GradeCode,
    subject: SubjectCode
  ): Promise<RoadmapSubjectBundle | null> {
    const key = `${grade}:${subject}`;
    if (this.inFlightBundles.has(key)) {
      return this.inFlightBundles.get(key)!;
    }

    const fetchPromise = (async () => {
      const relativePath = `roadmap/${grade}/${subject}.json`;
      const url = this.getResourceUrl(relativePath);
      const storageKey = `${BUNDLE_STORAGE_PREFIX}${key}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status} fetching bundle: ${url}`);
        const bundle = (await res.json()) as RoadmapSubjectBundle;

        if (bundle && bundle.schemaVersion === '1.0.0') {
          this.memoryBundles.set(key, bundle);
          await AsyncStorage.setItem(storageKey, JSON.stringify(bundle)).catch((e) => {
            console.warn(`Không lưu được bundle ${key} vào AsyncStorage:`, e);
          });
          this.notify();
          return bundle;
        }
        return this.memoryBundles.get(key) || null;
      } catch (err) {
        console.warn(`Không tải được bundle [${grade}:${subject}] từ R2:`, err);
        return this.memoryBundles.get(key) || null;
      } finally {
        this.inFlightBundles.delete(key);
      }
    })();

    this.inFlightBundles.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Tra cứu một chủ đề theo ID
   */
  public async getTopic(
    grade: GradeCode,
    subject: SubjectCode,
    topicId: string
  ): Promise<RoadmapTopic | null> {
    const bundle = await this.getBundle(grade, subject);
    if (!bundle) return null;
    return bundle.topics.find((t) => t.id === topicId) || null;
  }

  /**
   * Tra cứu chi tiết lý thuyết và phương pháp giải của một dạng bài theo ID
   */
  public async getQuestionType(
    grade: GradeCode,
    subject: SubjectCode,
    questionTypeId: string
  ): Promise<RoadmapQuestionType | null> {
    const bundle = await this.getBundle(grade, subject);
    if (!bundle) return null;
    return bundle.questionTypes.find((qt) => qt.id === questionTypeId) || null;
  }

  /**
   * Xóa bộ nhớ cache
   */
  public async clearCache(): Promise<void> {
    this.memoryBundles.clear();
    this.memoryCatalog = null;
    try {
      await AsyncStorage.removeItem(CATALOG_STORAGE_KEY);
      const allKeys = await AsyncStorage.getAllKeys();
      const bundleKeys = allKeys.filter((k) => k.startsWith(BUNDLE_STORAGE_PREFIX));
      if (bundleKeys.length > 0) {
        await AsyncStorage.multiRemove(bundleKeys);
      }
    } catch {
      // bỏ qua
    }
    this.notify();
  }
}

export const MobileRoadmapService = new MobileRoadmapServiceClass();

/**
 * React Hook: Lấy lộ trình học trên Mobile kèm SWR
 */
export function useMobileRoadmap(grade: GradeCode, subject: SubjectCode) {
  const [bundle, setBundle] = useState<RoadmapSubjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await MobileRoadmapService.getBundle(grade, subject, true);
      setBundle(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [grade, subject]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    MobileRoadmapService.getBundle(grade, subject)
      .then((data) => {
        if (isMounted) {
          setBundle(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      });

    const unsubscribe = MobileRoadmapService.subscribe(() => {
      if (isMounted) {
        void MobileRoadmapService.getBundle(grade, subject).then((d) => setBundle(d));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [grade, subject]);

  return { bundle, loading, error, refresh };
}

/**
 * React Hook: Lấy Mục lục lộ trình học trên Mobile kèm SWR
 */
export function useMobileRoadmapCatalog() {
  const [catalog, setCatalog] = useState<RoadmapCatalogIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await MobileRoadmapService.getCatalog(true);
      setCatalog(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    MobileRoadmapService.getCatalog()
      .then((data) => {
        if (isMounted) {
          setCatalog(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      });

    const unsubscribe = MobileRoadmapService.subscribe(() => {
      if (isMounted) {
        void MobileRoadmapService.getCatalog().then((d) => setCatalog(d));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { catalog, loading, error, refresh };
}

export type {
  RoadmapSubjectBundle,
  RoadmapTopic,
  RoadmapQuestionType,
  RoadmapCatalogIndex,
  RoadmapCatalogGrade,
  RoadmapCatalogSubject,
};
