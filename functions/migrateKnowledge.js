import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const directory = path.dirname(fileURLToPath(import.meta.url));
const projectId = process.env.GCLOUD_PROJECT || 'on-thi-vao-10-7d87c';
const contentVersion = process.env.RAG_CONTENT_VERSION || '2026.09';
const apply = process.argv.includes('--apply');
const serviceAccountPath = path.join(directory, 'service-account.json');

if (process.env.FIRESTORE_EMULATOR_HOST) {
  admin.initializeApp({ projectId });
} else if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))), projectId });
} else {
  admin.initializeApp({ projectId });
}

const subjectNames = {
  math: 'Toán học', english: 'Tiếng Anh', physics: 'Vật lý',
  chemistry: 'Hóa học', biology: 'Sinh học', history: 'Lịch sử',
};
const gradeNames = { grade9: 'Lớp 9', grade10: 'Lớp 10', grade11: 'Lớp 11' };
// Sáu chunk thủ công từ phiên bản ôn thi vào 10 ban đầu không lưu trường grade.
// ID được khóa rõ ràng để không tự suy diễn lớp cho tài liệu mới trong tương lai.
const legacyGrade9Ids = new Set([
  'english_c_u__i_u_ki_n_lo_i_1_v__lo_i_2__conditional_sentences_',
  'english_m_nh____quan_h___relative_clauses____who__whom__which__that__whose',
  'english_th__hi_n_t_i_ho_n_th_nh__present_perfect_tense_',
  'math___nh_l__vi__t_cho_ph__ng_tr_nh_b_c_2',
  'math_g_c_n_i_ti_p_v__g_c___t_m____ng_tr_n',
  'math_h__th_c_l__ng_trong_tam_gi_c_vu_ng',
]);
const db = admin.firestore();
const snapshot = await db.collection('knowledge_base').get();
const eligible = [];
const invalid = [];

for (const document of snapshot.docs) {
  const data = document.data();
  const gradeId = data.gradeId || data.grade || (legacyGrade9Ids.has(document.id) ? 'grade9' : undefined);
  const subjectId = data.subjectId;
  if (!/^grade(?:9|10|11)$/.test(gradeId) || !subjectNames[subjectId] ||
      typeof data.content !== 'string' || data.content.length === 0 || data.content.length > 12_000 ||
      typeof data.title !== 'string' || !data.title || !data.embedding) {
    invalid.push({
      id: document.id,
      hasGrade: /^grade(?:9|10|11)$/.test(gradeId),
      hasSubject: Boolean(subjectNames[subjectId]),
      contentChars: typeof data.content === 'string' ? data.content.length : -1,
      hasTitle: typeof data.title === 'string' && data.title.length > 0,
      hasEmbedding: Boolean(data.embedding),
    });
    continue;
  }
  eligible.push({
    ref: document.ref,
    patch: {
      gradeId,
      contentVersion,
      status: 'published',
      sourceId: `course:${gradeId}:${subjectId}`,
      sourceTitle: `${subjectNames[subjectId]} ${gradeNames[gradeId]} — dữ liệu khóa học nội bộ`,
      sourceLocator: `${data.parentId || document.id}/${data.chunkType || 'overview'}`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  });
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', total: snapshot.size, eligible: eligible.length, invalid: invalid.length, invalidSamples: invalid.slice(0, 20) }, null, 2));
if (invalid.length > 0) {
  console.error('Migration stopped: one or more documents cannot be upgraded without regeneration.');
  process.exitCode = 1;
} else if (!apply) {
  console.log('Dry-run complete. Re-run with --apply to write metadata.');
} else {
  for (let index = 0; index < eligible.length; index += 400) {
    const batch = db.batch();
    for (const item of eligible.slice(index, index + 400)) batch.set(item.ref, item.patch, { merge: true });
    await batch.commit();
    console.log(`Migrated ${Math.min(index + 400, eligible.length)}/${eligible.length} documents.`);
  }
  console.log('Knowledge V2 metadata migration completed. Run verify:knowledge next.');
}
