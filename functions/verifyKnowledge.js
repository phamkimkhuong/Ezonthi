import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const directory = path.dirname(fileURLToPath(import.meta.url));
const projectId = process.env.GCLOUD_PROJECT || 'on-thi-vao-10-7d87c';
const version = process.env.RAG_CONTENT_VERSION || '2026.09';
const serviceAccountPath = path.join(directory, 'service-account.json');

if (process.env.FIRESTORE_EMULATOR_HOST) {
  admin.initializeApp({ projectId });
} else if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))), projectId });
} else {
  admin.initializeApp({ projectId });
}

const snapshot = await admin.firestore().collection('knowledge_base').get();
const scopes = new Map();
const scopeSamples = new Map();
const invalid = [];
for (const document of snapshot.docs) {
  const data = document.data();
  const valid = /^grade(?:9|10|11)$/.test(data.gradeId) &&
    ['math', 'english', 'physics', 'chemistry', 'biology', 'history'].includes(data.subjectId) &&
    data.contentVersion === version && data.status === 'published' &&
    typeof data.sourceId === 'string' && data.sourceId.length > 0 &&
    typeof data.sourceTitle === 'string' && data.sourceTitle.length > 0 &&
    typeof data.sourceLocator === 'string' && data.sourceLocator.length > 0 &&
    typeof data.content === 'string' && data.content.length > 0 && data.content.length <= 12_000 &&
    data.embedding && typeof data.embedding.toArray === 'function';
  if (!valid) {
    invalid.push(document.id);
    continue;
  }
  const key = `${data.gradeId}/${data.subjectId}/${data.contentVersion}`;
  scopes.set(key, (scopes.get(key) || 0) + 1);
  if (!scopeSamples.has(key) && Array.isArray(data.keywords) && data.keywords.length > 0) {
    scopeSamples.set(key, { data, vector: data.embedding.toArray(), keyword: data.keywords[0] });
  }
}

if (snapshot.empty || invalid.length > 0) {
  console.log(JSON.stringify({ total: snapshot.size, valid: snapshot.size - invalid.length, invalid: invalid.length, scopes: Object.fromEntries([...scopes].sort()) }, null, 2));
  console.error(`Knowledge V2 verification failed. Invalid document samples: ${invalid.slice(0, 20).join(', ') || '(empty collection)'}`);
  process.exitCode = 1;
} else {
  const indexChecks = {};
  for (const [scope, sample] of scopeSamples) {
    const [gradeId, subjectId] = scope.split('/');
    const base = admin.firestore().collection('knowledge_base')
      .where('gradeId', '==', gradeId)
      .where('subjectId', '==', subjectId)
      .where('contentVersion', '==', version)
      .where('status', '==', 'published');
    const [vectorResult, keywordResult] = await Promise.all([
      base.findNearest({ vectorField: 'embedding', queryVector: sample.vector, distanceMeasure: 'COSINE', limit: 1 }).get(),
      base.where('keywords', 'array-contains-any', [sample.keyword]).limit(1).get(),
    ]);
    indexChecks[scope] = { vector: vectorResult.size, keyword: keywordResult.size };
    if (vectorResult.empty || keywordResult.empty) process.exitCode = 1;
  }
  console.log(JSON.stringify({
    total: snapshot.size,
    valid: snapshot.size,
    invalid: 0,
    scopes: Object.fromEntries([...scopes].sort()),
    indexChecks: Object.fromEntries(Object.entries(indexChecks).sort()),
  }, null, 2));
}
