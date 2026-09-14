import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

// Phân tích tham số dòng lệnh: --grade=10, --grade=11, --subject=math, v.v.
const args = process.argv.slice(2);
const gradeFilter = args.find(a => a.startsWith('--grade='))?.split('=')[1];
const subjectFilter = args.find(a => a.startsWith('--subject='))?.split('=')[1]?.toLowerCase();

const suites = [
  // Lớp 10
  {
    id: 'math10',
    grade: '10',
    subject: 'math',
    name: 'Lớp 10: Toán học (Cơ bản & Nâng cao)',
    scripts: [
      'scripts/validators/grade10/validateMath10.mjs',
      'scripts/validators/grade10/validateMath10Advanced.mjs'
    ]
  },
  {
    id: 'english10',
    grade: '10',
    subject: 'english',
    name: 'Lớp 10: Tiếng Anh',
    scripts: ['scripts/validators/grade10/validateEnglish10.mjs']
  },
  {
    id: 'physics10',
    grade: '10',
    subject: 'physics',
    name: 'Lớp 10: Vật lý (Cơ bản & Nâng cao)',
    scripts: [
      'scripts/validators/grade10/validatePhysics10.mjs',
      'scripts/validators/grade10/validatePhysics10Advanced.mjs'
    ]
  },
  {
    id: 'chemistry10',
    grade: '10',
    subject: 'chemistry',
    name: 'Lớp 10: Hóa học (Cơ bản & Nâng cao)',
    scripts: [
      'scripts/validators/grade10/validateChemistry10.mjs',
      'scripts/validators/grade10/validateChemistry10Advanced.mjs'
    ]
  },
  {
    id: 'biology10',
    grade: '10',
    subject: 'biology',
    name: 'Lớp 10: Sinh học (Cơ bản & Nâng cao)',
    scripts: [
      'scripts/validators/grade10/validateBiology10.mjs',
      'scripts/validators/grade10/validateBiology10Advanced.mjs'
    ]
  },
  {
    id: 'history10',
    grade: '10',
    subject: 'history',
    name: 'Lớp 10: Lịch sử',
    scripts: ['scripts/validators/grade10/validateHistory10.mjs']
  },

  // Lớp 11 (Chuẩn V4)
  {
    id: 'math11',
    grade: '11',
    subject: 'math',
    name: 'Lớp 11: Toán học (Chuẩn V4)',
    scripts: ['scripts/validators/grade11/validateMath11.mjs']
  },
  {
    id: 'english11',
    grade: '11',
    subject: 'english',
    name: 'Lớp 11: Tiếng Anh (Chuẩn V4)',
    scripts: ['scripts/validators/grade11/validateEnglish11.mjs']
  },
  {
    id: 'physics11',
    grade: '11',
    subject: 'physics',
    name: 'Lớp 11: Vật lý (Chuẩn V4)',
    scripts: ['scripts/validators/grade11/validatePhysics11.mjs']
  },
  {
    id: 'chemistry11',
    grade: '11',
    subject: 'chemistry',
    name: 'Lớp 11: Hóa học (Chuẩn V4)',
    scripts: ['scripts/validators/grade11/validateChemistry11.mjs']
  },
  {
    id: 'biology11',
    grade: '11',
    subject: 'biology',
    name: 'Lớp 11: Sinh học (Chuẩn V4)',
    scripts: ['scripts/validators/grade11/validateBiology11.mjs']
  },

  // Quy chuẩn kỹ thuật (Rules)
  {
    id: 'latex',
    grade: 'all',
    subject: 'all',
    name: 'Kiểm tra cú pháp LaTeX (Toàn dự án)',
    scripts: ['scripts/validators/rules/validateLatex.mjs']
  },
  {
    id: 'numeric',
    grade: 'all',
    subject: 'all',
    name: 'Hàm kiểm định đáp án số (Numeric Validators)',
    scripts: ['scripts/validators/rules/auditNumericValidators.mjs']
  },
  {
    id: 'physics-runtime',
    grade: '10',
    subject: 'physics',
    name: 'Runtime kiểm định bài tập Vật lý',
    scripts: ['scripts/validators/rules/validatePhysicsPracticeRuntime.mjs']
  }
];

// Lọc các suite theo điều kiện tham số
const filteredSuites = suites.filter(suite => {
  if (gradeFilter && suite.grade !== 'all' && suite.grade !== gradeFilter) return false;
  if (subjectFilter && suite.subject !== 'all' && suite.subject !== subjectFilter) return false;
  return true;
});

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.resolve(root, scriptPath)], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => { stdout += data.toString(); });
    child.stderr.on('data', data => { stderr += data.toString(); });

    child.on('close', code => {
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🛡️  MASTER CONTENT VALIDATOR RUNNER — EZONTHI');
  if (gradeFilter || subjectFilter) {
    console.log(`   Bộ lọc: ${gradeFilter ? `Khối lớp = ${gradeFilter} ` : ''}${subjectFilter ? `Môn học = ${subjectFilter}` : ''}`);
  }
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const results = [];
  let hasFailure = false;

  for (const suite of filteredSuites) {
    process.stdout.write(`⏳ Đang kiểm định: ${suite.name}... `);
    const startTime = Date.now();

    let suitePassed = true;
    let failedScript = null;
    let errorOutput = '';

    for (const script of suite.scripts) {
      const res = await runScript(script);
      if (res.code !== 0) {
        suitePassed = false;
        failedScript = script;
        errorOutput = res.stderr || res.stdout;
        break;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (suitePassed) {
      console.log(`\x1b[32m[PASS]\x1b[0m (${duration}s)`);
      results.push({ name: suite.name, status: 'PASS', duration: `${duration}s` });
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m (${duration}s)`);
      console.error(`\n❌ Lỗi tại script: ${failedScript}`);
      console.error(errorOutput.slice(0, 1000));
      console.error('───────────────────────────────────────────────────────────────────────────\n');
      results.push({ name: suite.name, status: 'FAIL', duration: `${duration}s` });
      hasFailure = true;
    }
  }

  // In bảng tổng kết
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('📊 BẢNG TỔNG KẾT KIỂM ĐỊNH NỘI DUNG DỮ LIỆU:');
  console.log('═══════════════════════════════════════════════════════════════════════════');

  const padName = 48;
  const padDuration = 12;

  console.log(`┌${'─'.repeat(padName + 2)}┬${'─'.repeat(padDuration + 2)}┬────────────┐`);
  console.log(`│ ${'Bộ Kiểm Định (Validator Suite)'.padEnd(padName)} │ ${'Thời gian'.padEnd(padDuration)} │ Trạng thái │`);
  console.log(`├${'─'.repeat(padName + 2)}┼${'─'.repeat(padDuration + 2)}┼────────────┤`);

  for (const r of results) {
    const statusStr = r.status === 'PASS' ? '\x1b[32m✅ PASS\x1b[0m   ' : '\x1b[31m❌ FAIL\x1b[0m   ';
    console.log(`│ ${r.name.padEnd(padName)} │ ${r.duration.padEnd(padDuration)} │ ${statusStr} │`);
  }

  console.log(`└${'─'.repeat(padName + 2)}┴${'─'.repeat(padDuration + 2)}┴────────────┘`);

  const totalPassed = results.filter(r => r.status === 'PASS').length;
  console.log(`\nKết quả: ${totalPassed}/${results.length} bộ dữ liệu hợp lệ.`);

  if (hasFailure) {
    console.error('❌ PHÁT HIỆN LỖI TRONG DỮ LIỆU! Vui lòng sửa các lỗi trên trước khi tiếp tục.');
    process.exit(1);
  } else {
    console.log('🎉 TẤT CẢ DỮ LIỆU NỘI DUNG ĐÃ ĐẠT CHUẨN CHẤT LƯỢNG 100%!\n');
  }
}

main().catch(err => {
  console.error('Lỗi thực thi runner:', err);
  process.exit(1);
});
