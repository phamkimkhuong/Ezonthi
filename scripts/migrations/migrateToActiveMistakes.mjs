import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  try {
    const functionsAdminPath = path.resolve(__dirname, '../../functions/node_modules/firebase-admin');
    admin = require(functionsAdminPath);
  } catch (err) {
    console.error('❌ LỖI: Không thể nạp thư viện "firebase-admin".');
    process.exit(1);
  }
}

let keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  keyPath = path.resolve(__dirname, '../../functions/service-account.json');
}

if (!fs.existsSync(keyPath)) {
  console.error('❌ LỖI: Không tìm thấy file serviceAccountKey.json hoặc functions/service-account.json!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrate() {
  console.log('🚀 Bắt đầu migration: Gom câu sai chưa fixed thành active_mistakes/current...');
  
  const usersSnap = await db.collection('users').get();
  console.log(`📋 Đã tìm thấy ${usersSnap.size} người dùng.`);

  let totalMistakesGrouped = 0;

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const mistakesSnap = await db.collection(`users/${userId}/mistakes`).get();

    if (mistakesSnap.empty) {
      console.log(` - User ${userId}: Không có mistake nào.`);
      continue;
    }

    const activeMistakes = [];
    mistakesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.reviewStatus !== 'fixed') {
        activeMistakes.push(data);
      }
    });

    const activeRef = db.collection(`users/${userId}/active_mistakes`).doc('current');
    await activeRef.set({
      updatedAt: new Date().toISOString(),
      mistakes: activeMistakes
    }, { merge: true });

    totalMistakesGrouped += activeMistakes.length;
    console.log(`   ✅ Đã gom ${activeMistakes.length} câu sai chưa fixed (từ tổng số ${mistakesSnap.size} câu sai) vào active_mistakes/current cho user ${userId}.`);
  }

  console.log('\n========================================================');
  console.log(`🎉 HOÀN THÀNH MIGRATION SỔ LỖI SAI:`);
  console.log(` - Tổng số active mistakes đã gom: ${totalMistakesGrouped}`);
  console.log('========================================================\n');
}

migrate().catch(console.error);
