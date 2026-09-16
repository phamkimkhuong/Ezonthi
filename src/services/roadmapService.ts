/**
 * ROADMAP SERVICE (WEB)
 *
 * Quản lý nạp và đồng bộ lộ trình học (Chủ đề, Dạng bài, Lý thuyết, Phương pháp giải)
 * từ Cloudflare R2 CDN với cơ chế Cache-First SWR (Stale-While-Revalidate).
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  RoadmapSubjectBundle,
  RoadmapTopic,
  RoadmapQuestionType,
  RoadmapCatalogIndex,
  RoadmapCatalogGrade,
  RoadmapCatalogSubject,
} from '@/types/roadmapContract';
import type { GradeCode, SubjectCode } from '@/types';

const R2_PUBLIC_BASE = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');
const CATALOG_STORAGE_KEY = 'ez_roadmap_catalog_v1';
const BUNDLE_STORAGE_PREFIX = 'ez_roadmap_bundle_v1_';

class RoadmapServiceClass {
  private memoryBundles = new Map<string, RoadmapSubjectBundle>();
  private memoryCatalog: RoadmapCatalogIndex | null = null;
  private inFlightCatalog: Promise<RoadmapCatalogIndex> | null = null;
  private inFlightBundles = new Map<string, Promise<RoadmapSubjectBundle | null>>();
  private listeners = new Set<() => void>();

  /** Đăng ký lắng nghe sự kiện khi dữ liệu cache được cập nhật ngầm */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try { fn(); } catch (e) { console.error('Lỗi listener RoadmapService:', e); }
    });
  }

  /**
   * Tạo URL đầy đủ cho tài nguyên roadmap (ưu tiên CDN R2, fallback local public)
   */
  private getResourceUrl(relativePath: string): string {
    const cleanPath = relativePath.replace(/^\//, '');
    if (R2_PUBLIC_BASE) {
      return `${R2_PUBLIC_BASE}/${cleanPath}`;
    }
    // Fallback về thư mục public cục bộ trong môi trường dev/local
    return `/${cleanPath}`;
  }

  /**
   * Lấy Mục lục lộ trình học toàn hệ thống (Catalog Index)
   */
  public async getCatalog(forceRefresh = false): Promise<RoadmapCatalogIndex> {
    if (!forceRefresh && this.memoryCatalog) {
      return this.memoryCatalog;
    }

    // 1. Đọc từ LocalStorage (0ms)
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
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
        console.warn('Lỗi đọc catalog từ localStorage:', err);
      }
    }

    // 2. Fetch từ mạng nếu chưa có cache
    return this.revalidateCatalog();
  }

  /**
   * Tải và làm mới Mục lục từ CDN R2
   */
  private async revalidateCatalog(): Promise<RoadmapCatalogIndex> {
    if (this.inFlightCatalog) return this.inFlightCatalog;

    this.inFlightCatalog = (async () => {
      const url = this.getResourceUrl('roadmap/index.json');
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status} when fetching catalog: ${url}`);
        const data = (await res.json()) as RoadmapCatalogIndex;

        if (data && data.schemaVersion === '1.0.0') {
          const isNewer = !this.memoryCatalog || data.updatedAt !== this.memoryCatalog.updatedAt;
          this.memoryCatalog = data;
          try {
            localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));
          } catch (e) {
            console.warn('Không ghi được catalog vào localStorage:', e);
          }
          if (isNewer) this.notify();
          return data;
        }
        throw new Error('Dữ liệu catalog nhận được không đúng cấu trúc');
      } catch (error) {
        // Fallback về local public nếu gọi R2 gặp lỗi
        if (R2_PUBLIC_BASE) {
          try {
            const fallbackRes = await fetch('/roadmap/index.json');
            if (fallbackRes.ok) {
              const fallbackData = (await fallbackRes.json()) as RoadmapCatalogIndex;
              this.memoryCatalog = fallbackData;
              return fallbackData;
            }
          } catch {
            // bỏ qua lỗi fallback
          }
        }
        if (this.memoryCatalog) return this.memoryCatalog;
        throw error;
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

    // 2. Kiểm tra LocalStorage (0ms)
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as RoadmapSubjectBundle;
          if (parsed && parsed.schemaVersion === '1.0.0') {
            this.memoryBundles.set(key, parsed);
            // SWR: Kiểm tra ngầm xem R2 có phiên bản mới hơn không
            void this.checkAndRevalidateBundle(grade, subject, parsed.contentVersion);
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`Lỗi đọc bundle ${key} từ localStorage:`, err);
      }
    }

    // 3. Tải từ mạng nếu chưa có cache
    return this.fetchBundleFromNetwork(grade, subject);
  }

  /**
   * So sánh contentVersion trong catalog để quyết định có cần tải bundle mới hay không
   */
  private async checkAndRevalidateBundle(
    grade: GradeCode,
    subject: SubjectCode,
    currentVersion: string
  ): Promise<void> {
    try {
      const catalog = await this.getCatalog();
      const gradeData = catalog.grades.find((g) => g.id === grade);
      const subjectMeta = gradeData?.subjects.find((s) => s.id === subject);

      if (subjectMeta && subjectMeta.contentVersion !== currentVersion) {
        await this.fetchBundleFromNetwork(grade, subject);
      }
    } catch (err) {
      console.debug(`Bỏ qua kiểm tra version [${grade}:${subject}]:`, err);
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
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching bundle: ${url}`);
        const bundle = (await res.json()) as RoadmapSubjectBundle;

        if (bundle && bundle.schemaVersion === '1.0.0') {
          this.memoryBundles.set(key, bundle);
          try {
            localStorage.setItem(storageKey, JSON.stringify(bundle));
          } catch (e) {
            console.warn(`Không lưu được bundle ${key} vào localStorage:`, e);
          }
          this.notify();
          return bundle;
        }
        return null;
      } catch (err) {
        // Fallback về local public
        if (R2_PUBLIC_BASE) {
          try {
            const fallbackRes = await fetch(`/${relativePath}`);
            if (fallbackRes.ok) {
              const fallbackBundle = (await fallbackRes.json()) as RoadmapSubjectBundle;
              this.memoryBundles.set(key, fallbackBundle);
              return fallbackBundle;
            }
          } catch {
            // bỏ qua
          }
        }
        // Nếu đã có bản cũ trong memory thì giữ nguyên
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
   * Đọc tức thì từ memory cache hoặc localStorage (đồng bộ, 0ms)
   */
  public getSyncBundle(grade: GradeCode, subject: SubjectCode): RoadmapSubjectBundle | null {
    const key = `${grade}:${subject}`;
    if (this.memoryBundles.has(key)) {
      return this.memoryBundles.get(key)!;
    }
    try {
      const raw = localStorage.getItem(`${BUNDLE_STORAGE_PREFIX}${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as RoadmapSubjectBundle;
        if (parsed && parsed.schemaVersion === '1.0.0') {
          this.memoryBundles.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // bỏ qua
    }
    return null;
  }

  /**
   * Xóa bộ nhớ cache để buộc tải lại toàn bộ
   */
  public clearCache(): void {
    this.memoryBundles.clear();
    this.memoryCatalog = null;
    try {
      localStorage.removeItem(CATALOG_STORAGE_KEY);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(BUNDLE_STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // bỏ qua
    }
    this.notify();
  }
}

export const RoadmapService = new RoadmapServiceClass();

/**
 * React Hook: Theo dõi mục lục lộ trình học với tự động SWR update
 */
export function useRoadmapCatalog() {
  const [catalog, setCatalog] = useState<RoadmapCatalogIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RoadmapService.getCatalog(true);
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
    RoadmapService.getCatalog()
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

    const unsubscribe = RoadmapService.subscribe(() => {
      if (isMounted) {
        void RoadmapService.getCatalog().then((d) => setCatalog(d));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { catalog, loading, error, refresh };
}

/**
 * React Hook: Lấy gói lộ trình học chi tiết của 1 môn học kèm SWR
 */
export function useRoadmapBundle(grade: GradeCode, subject: SubjectCode) {
  const [bundle, setBundle] = useState<RoadmapSubjectBundle | null>(() =>
    RoadmapService.getSyncBundle(grade, subject)
  );
  const [loading, setLoading] = useState(() => !RoadmapService.getSyncBundle(grade, subject));
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RoadmapService.getBundle(grade, subject, true);
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
    const cached = RoadmapService.getSyncBundle(grade, subject);
    if (cached) {
      setBundle(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    RoadmapService.getBundle(grade, subject)
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

    const unsubscribe = RoadmapService.subscribe(() => {
      if (isMounted) {
        void RoadmapService.getBundle(grade, subject).then((d) => setBundle(d));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [grade, subject]);

  return { bundle, loading, error, refresh };
}

export type {
  RoadmapSubjectBundle,
  RoadmapTopic,
  RoadmapQuestionType,
  RoadmapCatalogIndex,
  RoadmapCatalogGrade,
  RoadmapCatalogSubject,
};
