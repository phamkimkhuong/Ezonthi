import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const violations = [];

// 1. Kiểm tra thư mục gốc (Root)
const forbiddenRootDirs = ['tests', '__tests__', 'test'];
for (const dir of forbiddenRootDirs) {
  const fullPath = path.join(root, dir);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    violations.push(`Thư mục test mồ côi ngoài root: '${dir}/' (Tất cả test phải nằm trong 'scripts/tests/')`);
  }
}

// Kiểm tra file log hoặc file temp rác ở root
try {
  const rootFiles = fs.readdirSync(root);
  for (const file of rootFiles) {
    if (file.endsWith('.log') && !file.startsWith('.')) {
      violations.push(`File log thừa ở thư mục gốc: '${file}'`);
    }
    if (file.startsWith('temp_') || file.endsWith('_temp.js') || file.endsWith('_temp.ts')) {
      violations.push(`File nháp tạm ở thư mục gốc: '${file}'`);
    }
  }
} catch (e) {
  // ignore
}

// 2. Kiểm tra thư mục functions/
const functionsDir = path.join(root, 'functions');
if (fs.existsSync(functionsDir)) {
  try {
    const fnFiles = fs.readdirSync(functionsDir);
    for (const file of fnFiles) {
      if (file.startsWith('temp_') || file.startsWith('test_')) {
        violations.push(`File nháp tạm trong functions/: 'functions/${file}'`);
      }
      if (file === 'testClientCallable.js' || file === 'testRagEvaluation.js') {
        violations.push(`File scratch test mồ côi trong functions/: 'functions/${file}'`);
      }
    }
  } catch (e) {
    // ignore
  }
}

// 3. Kiểm tra thư mục src/
const srcDir = path.join(root, 'src');
if (fs.existsSync(srcDir)) {
  try {
    const srcFiles = fs.readdirSync(srcDir, { recursive: true });
    for (const file of srcFiles) {
      const fileName = path.basename(file);
      if (fileName.startsWith('temp_') || fileName.endsWith('.tmp')) {
        violations.push(`File tạm trong src/: 'src/${file}'`);
      }
    }
  } catch (e) {
    // ignore
  }
}

// Kết luận
if (violations.length > 0) {
  console.error('\n🚨 PHÁT HIỆN VI PHẠM QUY CHUẨN VỆ SINH DỰ ÁN (WORKSPACE HYGIENE):');
  for (const v of violations) {
    console.error(`  ❌ ${v}`);
  }
  console.error('\n💡 Hướng xử lý: Hãy xóa các file/thư mục rác trên hoặc di chuyển script nháp vào thư mục \'.scratch/\'.\n');
  process.exit(1);
} else {
  console.log('🧹 Vệ sinh dự án: Đạt chuẩn (Không có file rác/nháp).');
  process.exit(0);
}
