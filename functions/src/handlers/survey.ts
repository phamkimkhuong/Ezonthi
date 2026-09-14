import { onCall } from 'firebase-functions/v2/https';
import { db } from '../config.js';
import { requireTeacher } from '../services/access.js';

export const getSurveySummary = onCall({ cors: true }, async request => {
  await requireTeacher(request);
  const responses = await db.collection('survey_responses').get();
  const grades: Record<string, number> = {};
  const uiRatings: Record<string, number> = {};
  const devices: Record<string, number> = {};
  const increment = (map: Record<string, number>, key: unknown) => {
    if (typeof key === 'string' || typeof key === 'number') {
      const safeKey = String(key).slice(0, 100);
      Object.defineProperty(map, safeKey, { value: (Object.hasOwn(map, safeKey) ? map[safeKey] : 0) + 1, enumerable: true, configurable: true });
    }
  };
  const latestFeedbacks = responses.docs.map(doc => {
    const data = doc.data();
    const s = data.survey || {};
    increment(grades, s.grade);
    increment(uiRatings, typeof s.uiRating === 'number' ? s.uiRating : s.uiRating?.rating);
    increment(devices, typeof s.primaryDevice === 'string' && s.primaryDevice.startsWith('other:') ? 'other' : s.primaryDevice);
    return {
      userId: doc.id, userEmail: data.userEmail || 'Học sinh', grade: s.grade || null,
      goal: s.goal || null, preferredSubject: s.preferredSubject || null,
      primaryDevice: s.primaryDevice || null, uiRating: s.uiRating || null,
      wishedFeatures: s.wishedFeatures || [], studyHurdles: s.studyHurdles || null,
      npsScore: s.npsScore ?? null, comments: s.additionalComments || s.uiRating?.reason || null,
      submittedAt: typeof s.completedAt === 'string' ? s.completedAt : '', fullSurvey: s,
    };
  }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 200);
  return { totalResponses: responses.size, grades, uiRatings, devices, latestFeedbacks, updatedAt: new Date().toISOString() };
});
