import { execSync } from 'node:child_process';

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

const currentBranch = getCurrentBranch();
const isForce = process.argv.includes('--force');

if (currentBranch !== 'main' && !isForce) {
  console.error('\n' + '='.repeat(70));
  console.error(' CẢNH BÁO: CHẶN DEPLOY LÊN PRODUCTION TRỰC TIẾP TỪ NHÁNH KHÁC!');
  console.error('='.repeat(70));
  console.error(`\n Nhánh hiện tại của bạn: [ ${currentBranch} ]`);
  console.error('\n Quy chuẩn môi trường ezonthi:');
  console.error('  1. Deploy Production (ezonthi.com) CHỈ được thực hiện trên nhánh "main".');
  console.error('  2. Để deploy kiểm thử an toàn trên môi trường Staging (không ảnh hưởng người dùng):');
  console.error('     Chạy lệnh: npm run deploy:staging');
  console.error('\n  3. Sau khi test thành công trên Staging và muốn đưa lên Production:');
  console.error('     Bước 1: Merge nhánh "staging" vào "main"');
  console.error('     Bước 2: git checkout main');
  console.error('     Bước 3: npm run deploy');
  console.error('\n' + '='.repeat(70) + '\n');
  process.exit(1);
}

console.log(`\n[Branch Guard] Xác thực nhánh "${currentBranch}": Hợp lệ để deploy Production.\n`);
