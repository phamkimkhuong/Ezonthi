import { getStarsFromScore } from './theme';
import { storageService } from '../services/storage';
import { auth } from '../services/firebase';
import { getQuestionTypes } from '../data';
import { useAppStore } from '../services/store';
import type { SubjectCode } from '../types';

export interface SubjectProfile {
  strengths?: string[];
  weaknesses?: string[];
  learningSummary?: string;
  lastUpdated?: any;
}

export interface StudentProfile {
  math?: SubjectProfile;
  english?: SubjectProfile;
  chemistry?: SubjectProfile;
  physics?: SubjectProfile;
  biology?: SubjectProfile;
  [key: string]: any;
}

export function removeAccents(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

export function isRelevantToTopic(item: string, topicName: string): boolean {
  if (!topicName) return true;
  
  const cleanStr = (s: string) => {
    return removeAccents(s.toLowerCase())
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 2);
  };

  const topicWords = cleanStr(topicName);
  const itemWords = cleanStr(item);

  // 1. Check direct overlap
  const hasDirectOverlap = itemWords.some(w => topicWords.includes(w));
  if (hasDirectOverlap) return true;

  // 2. Cross reference synonyms/related terms
  const topicNormalized = removeAccents(topicName.toLowerCase()).replace(/[^\w\s]/g, " ");
  const relatedMap: { [key: string]: string[] } = {
    "vi et": ["vi et", "viét", "delta", "nghiem", "he thuc", "bac hai"],
    "can thuc": ["can", "rut gon", "bieu thuc", "mau thuc", "hang dang thuc"],
    "dai so": ["can", "rut gon", "bieu thuc"],
    "he phuong trinh": ["he", "thuc te", "chuyen dong", "nang suat", "cong viec"],
    "toan thuc te": ["he", "thuc te", "chuyen dong", "nang suat", "cong viec", "phan tram"],
    "ham so": ["ham", "parabol", "duong thang", "cat", "giao diem", "toa do", "tiep xuc"],
    "do thi": ["ham", "parabol", "duong thang", "cat", "giao diem", "toa do", "tiep xuc"],
    "duong tron": ["tron", "tiep tuyen", "noi tiep", "goc", "cung", "day", "tam giac"],
    "hinh hoc": ["tron", "tiep tuyen", "noi tiep", "goc", "cung", "day", "tam giac"],
    "tu vung": ["tu vung", "vocabulary", "word", "nghia"],
    "ngu phap": ["ngu phap", "grammar", "thi", "tense", "verb", "dong tu", "tu loai"],
    "viet": ["viet", "bien doi", "rewrite", "dong", "indirect", "gian tiep", "conditional", "dieu kien", "wish", "although", "despite"]
  };

  for (const [key, relatedWords] of Object.entries(relatedMap)) {
    if (topicNormalized.includes(key)) {
      const itemNormalized = removeAccents(item.toLowerCase());
      const hasRelated = relatedWords.some(word => itemNormalized.includes(word));
      if (hasRelated) return true;
    }
  }

  return false;
}

export function getPersonalizedGreeting(
  displayName: string | null | undefined,
  profile: StudentProfile | null | undefined,
  subject: SubjectCode
): string {
  // Extract student's first name
  let name = 'em';
  if (displayName) {
    const trimmed = displayName.trim();
    const parts = trimmed.split(' ');
    name = parts[parts.length - 1] || trimmed;
  }

  const subProfile = profile?.[subject] as SubjectProfile | undefined;
  let strengths: string[] = subProfile?.strengths || [];
  let weaknesses: string[] = subProfile?.weaknesses || [];

  // Backward compatibility for flat math profile
  if (subject === 'math' && !subProfile) {
    if (profile?.strengths) strengths = profile.strengths;
    if (profile?.weaknesses) weaknesses = profile.weaknesses;
  }

  // Clean empty values
  strengths = strengths.filter(Boolean);
  weaknesses = weaknesses.filter(Boolean);

  // General Chat (GeneralAiTutor)
  // Find recommended topic based on student's actual progress
  const grade = useAppStore.getState().selectedGrade;
  const gradeText = grade === 'grade9' ? 'ôn thi vào 10' : 'học tốt Lớp 10';
  let recommendedTopicName = '';
  const currentUserId = auth.currentUser?.uid || 'guest';
  const progress = storageService.getProgress(currentUserId);
  const qTypes = getQuestionTypes(grade, subject);
  
  // Find first unmastered topic/questionType (stars < 3)
  const nextUnmastered = qTypes.find(qt => {
    const score = progress.masteryLevels[qt.id] ?? 0;
    return getStarsFromScore(score) < 3;
  });
  
  if (nextUnmastered) {
    recommendedTopicName = nextUnmastered.name;
  } else if (qTypes.length > 0) {
    recommendedTopicName = qTypes[qTypes.length - 1].name;
  }

  // 2a. Student has strengths
  if (strengths.length > 0) {
    const str = strengths[0];
    return `Chào ${name}! Thầy thấy phần ${str.toLowerCase()} em đã làm rất tốt. Hôm nay chúng ta cùng chinh phục chuyên đề ${recommendedTopicName} nhé. Em đã sẵn sàng chưa?`;
  }

  // 2b. Student has weaknesses
  if (weaknesses.length > 0) {
    const weak = weaknesses[0];
    return `Chào ${name}! Thầy thấy phần ${weak.toLowerCase()} em còn hay gặp chút khó khăn. Hôm nay chúng ta cùng tập trung chinh phục chuyên đề ${recommendedTopicName} để vượt qua nhé. Em đã sẵn sàng chưa?`;
  }

  // 2c. General fallback
  let subjectText = 'Học tốt';
  if (subject === 'math') subjectText = 'Toán';
  else if (subject === 'english') subjectText = 'Tiếng Anh';
  else if (subject === 'chemistry') subjectText = 'Hóa học';
  else if (subject === 'physics') subjectText = 'Vật lý';
  else if (subject === 'biology') subjectText = 'Sinh học';

  return `Chào ${name}! Thầy là Gia sư AI môn ${subjectText} ${gradeText}. Hôm nay chúng ta cùng chinh phục chuyên đề ${recommendedTopicName} nhé. Em đã sẵn sàng chưa?`;
}
