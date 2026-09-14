import { execSync } from 'node:child_process';
import process from 'node:process';

// Đọc payload từ Antigravity qua stdin (an toàn, không treo khi TTY)
async function readStdin() {
  if (process.stdin.isTTY) {
    return {};
  }
  return new Promise((resolve) => {
    let data = '';
    const fallbackTimer = setTimeout(() => {
      resolve({});
    }, 250);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(fallbackTimer);
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

async function main() {
  const payload = await readStdin();
  const isStopHook = Boolean(payload.terminationReason || payload.executionNum);

  const errors = [];

  // 1. Kiểm tra TypeScript
  try {
    execSync('npm run type-check', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      timeout: 35000
    });
  } catch (err) {
    const output = (err.stdout || '') + '\n' + (err.stderr || '') || err.message;
    errors.push(`[Lỗi TypeScript (tsc)]:\n${output.trim().substring(0, 1200)}`);
  }

  // 2. Kiểm tra ESLint
  try {
    execSync('npm run lint', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      timeout: 35000
    });
  } catch (err) {
    const output = (err.stdout || '') + '\n' + (err.stderr || '') || err.message;
    errors.push(`[Lỗi Linter (eslint)]:\n${output.trim().substring(0, 1200)}`);
  }

  // Đánh giá kết quả
  if (errors.length === 0) {
    // Thành công: cả type-check và lint đều sạch
    if (isStopHook) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
    } else {
      process.stdout.write(JSON.stringify({}));
    }
  } else {
    // Thất bại: có lỗi TypeScript hoặc Lint
    const combinedErrors = errors.join('\n\n');
    if (isStopHook) {
      process.stdout.write(JSON.stringify({
        decision: 'continue',
        reason: `[Quality Gate] Phát hiện lỗi kiểm định mã nguồn (TypeScript / ESLint). Bạn cần tự động sửa các lỗi sau trước khi hoàn tất nhiệm vụ:\n\n${combinedErrors}`
      }));
    } else {
      process.stdout.write(JSON.stringify({}));
    }
  }
  process.exit(0);
}

main();
