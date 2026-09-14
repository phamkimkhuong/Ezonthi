import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

// ──────────────────────────────────────────────────────────────────────────────
// Danh sách TOÀN BỘ lệnh LaTeX/KaTeX đang được sử dụng trong dự án.
// Được chia nhóm theo chủ đề để dễ bảo trì.
// ──────────────────────────────────────────────────────────────────────────────

// Nhóm 1: Chữ cái Hy Lạp viết thường (Toán, Lý, Hoá đều dùng rất nhiều)
const greekLower = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
  'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
];

// Nhóm 2: Chữ cái Hy Lạp viết hoa
const greekUpper = [
  'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
];

// Nhóm 3: Hàm lượng giác, logarit, min/max (Toán, Lý)
const functions = [
  'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'min', 'max',
];

// Nhóm 4: Dấu quan hệ & toán tử (Toán, Lý, Hoá)
const operators = [
  'times', 'pm', 'cdot', 'approx', 'equiv', 'ne', 'neq', 'le', 'ge',
  'not', 'ngtr', 'mid', 'in', 'notin', 'cap', 'cup', 'subset', 'setminus',
  'forall', 'exists',
];

// Nhóm 5: Mũi tên (Hoá – phản ứng thuận nghịch, Toán – suy ra)
const arrows = [
  'leftarrow', 'rightarrow', 'Rightarrow', 'Leftrightarrow',
  'longleftrightarrow', 'uparrow', 'downarrow', 'to',
  'rightleftharpoons',
];

// Nhóm 6: Dấu trang trí trên ký tự (Lý – vectơ, giá trị trung bình)
const accents = [
  'vec', 'bar', 'hat', 'tilde', 'overline', 'widehat', 'prime',
];

// Nhóm 7: Phân số, căn thức, tổng, tích phân (Toán, Lý, Hoá)
const structures = [
  'frac', 'dfrac', 'sqrt', 'sum',
];

// Nhóm 8: Định dạng văn bản & khoảng trắng
const formatting = [
  'text', 'mathbb', 'quad',
];

// Nhóm 9: Dấu ngoặc và ký hiệu đặc biệt
const delimiters = [
  'left', 'right', 'lfloor', 'rfloor', 'begin', 'end', 'backslash',
];

// Nhóm 10: Ký hiệu đặc biệt (vô cực, dấu ba chấm, góc, vuông góc, vòng tròn)
const symbols = [
  'infty', 'ldots', 'angle', 'perp', 'circ', 'varnothing',
];

const katexKeywords = [
  ...greekLower, ...greekUpper, ...functions, ...operators, ...arrows,
  ...accents, ...structures, ...formatting, ...delimiters, ...symbols,
];

// ──────────────────────────────────────────────────────────────────────────────
// Bản đồ mã điều khiển JS ↔ lệnh LaTeX bị nhầm
// Khi viết \bar trong chuỗi JS đơn, JS hiểu \b = Backspace (0x08)
// ──────────────────────────────────────────────────────────────────────────────
const controlCharMap = {
  0x00: '\\0 (null)',
  0x08: '\\b (backspace — likely \\bar or \\beta or \\begin or \\backslash)',
  0x09: '\\t (tab — likely \\theta, \\text, \\times, \\tilde, or \\to)',
  0x0A: '\\n (newline — likely \\ne, \\neq, \\nu, \\ngtr, \\not, or \\notin)',
  0x0C: '\\f (form feed — likely \\frac, \\forall)',
  0x0D: '\\r (carriage return — likely \\rho, \\right, \\rightarrow, or \\rfloor)',
};

// Regex bao gồm tất cả mã điều khiển nguy hiểm
const controlCharRegex = /[\x00\x08\x09\x0A\x0C\x0D]/g;

// ──────────────────────────────────────────────────────────────────────────────
// Các từ khóa thường gặp trong ngữ cảnh Toán/Lý/Hoá mà KHÔNG phải lệnh LaTeX,
// nên ta bỏ qua chúng (false positive). Ví dụ: "alpha" trong "alphabet".
// ──────────────────────────────────────────────────────────────────────────────
const falsePositivePatterns = [
  // "in" thường xuất hiện trong ngữ cảnh tiếng Anh, chỉ báo lỗi khi đứng độc lập
  // giữa các ký tự LaTeX
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

let errorCount = 0;
let warningCount = 0;

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const relPath = path.relative(root, filePath);

  const visit = node => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text;

      let match;
      const mathRegex = /\$\$(.*?)\$\$|\$([^$]+)\$/g;

      while ((match = mathRegex.exec(text)) !== null) {
        const isDoubleDollar = match[1] !== undefined;
        const mathExpr = isDoubleDollar ? match[1] : match[2];
        const matchStartPos = match.index + (isDoubleDollar ? 2 : 1);

        // ── CHECK 1: Ký tự điều khiển (mã nhị phân bất thường) ──
        controlCharRegex.lastIndex = 0;
        let controlMatch;
        while ((controlMatch = controlCharRegex.exec(mathExpr)) !== null) {
          const charCode = controlMatch[0].charCodeAt(0);
          const charName = controlCharMap[charCode] || `control character 0x${charCode.toString(16)}`;
          const pos = source.getLineAndCharacterOfPosition(node.getStart() + matchStartPos + controlMatch.index);
          console.error(`❌ ERROR ${relPath}:${pos.line + 1}:${pos.character + 1} — Control char ${charName} inside $...$`);
          errorCount++;
        }

        // ── CHECK 2: Từ khóa LaTeX mà thiếu dấu \ phía trước ──
        for (const keyword of katexKeywords) {
          // Bỏ qua từ khóa quá ngắn (<=3 ký tự): "in", "to", "le", "ge", "ne", "mid",
          // "ln", "log", "sin", "cos", "tan", "cot", "hat", "vec", "bar", "sum", "max", "min", "not"
          // Chúng quá dễ gây nhiễu false positive khi xuất hiện trong subscript hoặc text thường
          if (keyword.length <= 3) continue;

          const keywordRegex = new RegExp(`(?<![a-zA-Z\\\\])${keyword}(?![a-zA-Z])`, 'g');
          let keywordMatch;
          while ((keywordMatch = keywordRegex.exec(mathExpr)) !== null) {
            const index = keywordMatch.index;
            // Kiểm tra ký tự trước: nếu đã có \ thì OK
            if (index > 0 && mathExpr[index - 1] === '\\') continue;

            // Bỏ qua nếu từ khóa là một phần của subscript/superscript thường
            // Ví dụ: x_{min}, x_{max}, \\Delta_{max}, A^{text} — đây là tên biến
            if (index >= 1 && (mathExpr[index - 1] === '_' || mathExpr[index - 1] === '^')) continue;
            if (index >= 2 && mathExpr[index - 2] === '_' && mathExpr[index - 1] === '{') continue;
            if (index >= 2 && mathExpr[index - 2] === '^' && mathExpr[index - 1] === '{') continue;

            // Bỏ qua nếu từ khóa nằm trong khối \\text{...} — đây là văn bản thường
            const textBlockRegex = /\\text\{[^}]*\}/g;
            let isInsideTextBlock = false;
            let textMatch;
            while ((textMatch = textBlockRegex.exec(mathExpr)) !== null) {
              if (index >= textMatch.index && index < textMatch.index + textMatch[0].length) {
                isInsideTextBlock = true;
                break;
              }
            }
            if (isInsideTextBlock) continue;

            const pos = source.getLineAndCharacterOfPosition(node.getStart() + matchStartPos + index);
            console.error(`⚠️  WARN  ${relPath}:${pos.line + 1}:${pos.character + 1} — Keyword '${keyword}' without \\ inside $...$`);
            warningCount++;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
}

// ──────────────────────────────────────────────────────────────────────────────
console.log('🔍 LaTeX Syntax Validator v2.0');
console.log(`   Scanning: ${path.relative(root, dataDir)}`);
console.log(`   Keywords: ${katexKeywords.length} LaTeX commands tracked`);
console.log('─'.repeat(60));

walkDir(dataDir, validateFile);

console.log('─'.repeat(60));
if (errorCount > 0 || warningCount > 0) {
  if (errorCount > 0) console.log(`❌ ${errorCount} error(s) — control characters found (MUST fix)`);
  if (warningCount > 0) console.log(`⚠️  ${warningCount} warning(s) — keywords without backslash (review manually)`);
  process.exit(errorCount > 0 ? 1 : 0);
} else {
  console.log('✅ All clear — no LaTeX syntax issues found.');
  process.exit(0);
}
