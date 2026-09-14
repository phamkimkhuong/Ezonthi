import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

// ──────────────────────────────────────────────────────────────────────────────
// Danh sách TOÀN BỘ lệnh LaTeX/KaTeX đang được sử dụng trong dự án.
// Phải đồng bộ với validateLatex.mjs
// ──────────────────────────────────────────────────────────────────────────────

const katexKeywords = [
  // Chữ cái Hy Lạp viết thường
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
  'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
  // Chữ cái Hy Lạp viết hoa
  'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
  // Hàm lượng giác, logarit, min/max
  'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'min', 'max',
  // Dấu quan hệ & toán tử
  'times', 'pm', 'cdot', 'approx', 'equiv', 'ne', 'neq', 'le', 'ge',
  'not', 'ngtr', 'mid', 'in', 'notin', 'cap', 'cup', 'subset', 'setminus',
  'forall', 'exists',
  // Mũi tên
  'leftarrow', 'rightarrow', 'Rightarrow', 'Leftrightarrow',
  'longleftrightarrow', 'uparrow', 'downarrow', 'to',
  'rightleftharpoons',
  // Dấu trang trí trên ký tự
  'vec', 'bar', 'hat', 'tilde', 'overline', 'widehat', 'prime',
  // Phân số, căn thức, tổng
  'frac', 'dfrac', 'sqrt', 'sum',
  // Định dạng văn bản & khoảng trắng
  'text', 'mathbb', 'quad',
  // Dấu ngoặc và ký hiệu đặc biệt
  'left', 'right', 'lfloor', 'rfloor', 'begin', 'end', 'backslash',
  // Ký hiệu đặc biệt
  'infty', 'ldots', 'angle', 'perp', 'circ', 'varnothing',
];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      callback(filePath);
    }
  }
}

// Xây dựng regex: tìm dấu \ đơn (không phải \\) theo sau là từ khóa LaTeX
// hoặc dấu phẩy LaTeX (\,)
const keywordsPattern = katexKeywords
  .sort((a, b) => b.length - a.length) // Sắp xếp từ dài nhất trước để tránh khớp sai
  .join('|');
const regex = new RegExp(`(?<!\\\\)\\\\(?!\\\\)(${keywordsPattern}|,)`, 'g');

let fixedCount = 0;

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(regex, '\\\\$1');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    const relPath = path.relative(root, filePath);
    console.log(`✅ Fixed LaTeX escaping in ${relPath}`);
    fixedCount++;
  }
}

console.log('🔨 LaTeX Auto-Fix v2.0');
console.log(`   Scanning: ${path.relative(root, dataDir)}`);
console.log(`   Keywords: ${katexKeywords.length} LaTeX commands tracked`);
console.log('─'.repeat(60));

walkDir(dataDir, fixFile);

console.log('─'.repeat(60));
console.log(`🎉 Finished. Modified ${fixedCount} file(s).`);
