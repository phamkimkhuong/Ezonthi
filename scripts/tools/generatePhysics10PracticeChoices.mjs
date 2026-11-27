import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import {
  ANSWER_LETTERS,
  countDecimals,
  extractNumbers,
  formatExactDecimalScale,
  formatNumber,
  semanticKey,
  stripOptionPrefix,
} from './practiceChoiceHelpers.mjs';

const outputPath = path.resolve('src/data/grade10/physics/practiceChoices.ts');

const MODULE_DIRS = [
  'module0_intro',
  'module1_kinematics',
  'module2_dynamics',
  'module3_energy',
  'module4_momentum',
  'module5_circular_motion',
  'module6_solid_deformation',
];

const EXACT_TINY_FIXES = new Map([
  ['phy10-m0-q007', ['0.00025', '0.0025', '0.000025', '0.025']],
  ['phy10-m0r-q006', ['0.025', '0.00025', '0.25', '0.0025']],
  ['phy10-m6r-q008', ['0.025', '0.0025', '0.00025', '0.25']],
]);

const isSpeedQuestion = text =>
  /km\/h|m\/s(?![²2^])|tốc độ|vận tốc/i.test(text);

const isDivision36Artifact = (candidateText, correctNumeric, allowRounded = false) => {
  if (!Number.isFinite(correctNumeric) || correctNumeric === 0) return false;
  const val = Number(candidateText);
  if (!Number.isFinite(val)) return false;
  if (allowRounded) {
    return Math.abs(val - correctNumeric / 3.6) < 0.02 && !Number.isInteger(val);
  }
  return /\.\d{4,}$/.test(candidateText) && Math.abs(val - correctNumeric / 3.6) < 0.002;
};

const isMultiply36Artifact = (candidateText, correctNumeric) => {
  if (!Number.isFinite(correctNumeric) || correctNumeric === 0) return false;
  const val = Number(candidateText);
  return Number.isFinite(val) && Math.abs(val - correctNumeric * 3.6) < 0.01;
};

const buildCleanPhysicsDistractors = ({ question, correctNumeric, decimals, existingValues }) => {
  const candidates = [];
  const lower = question.content.toLocaleLowerCase('vi');
  const allowNegative = correctNumeric < 0 || /đại số|vận tốc|tọa độ|độ dịch chuyển|gia tốc/.test(lower);
  const absVal = Math.abs(correctNumeric);
  const step = decimals > 0 ? 10 ** (-decimals) : Math.max(1, absVal >= 100 ? 10 : absVal >= 20 ? 5 : 1);

  if (isSpeedQuestion(question.content)) {
    // Keep clean m/s <-> km/h conversion distractors without ugly 6-decimal repeating tails.
    candidates.push(
      formatNumber(correctNumeric * 3.6, 2),
      formatNumber(correctNumeric / 3.6, 2),
    );
  }

  const operands = extractNumbers(question.content).slice(0, 8);
  candidates.push(
    formatNumber(correctNumeric * 2, Math.max(decimals, 2)),
    formatNumber(correctNumeric / 2, Math.max(decimals, 2)),
    formatNumber(correctNumeric * 10, decimals),
    formatNumber(correctNumeric / 10, Math.min(decimals + 1, 3)),
    formatNumber(correctNumeric + step, decimals),
    formatNumber(correctNumeric - step, decimals),
    formatNumber(correctNumeric + 2 * step, decimals),
    formatNumber(correctNumeric - 2 * step, decimals),
  );

  for (let i = 0; i < operands.length; i += 1) {
    for (let j = i + 1; j < operands.length; j += 1) {
      candidates.push(
        formatNumber(operands[i] * operands[j], Math.max(decimals, 2)),
        formatNumber(operands[i] + operands[j], Math.max(decimals, 2)),
        formatNumber(Math.abs(operands[i] - operands[j]), Math.max(decimals, 2)),
      );
      if (operands[j] !== 0) {
        const div = operands[i] / operands[j];
        if (Math.abs(div * 100 - Math.round(div * 100)) < 1e-6) {
          candidates.push(formatExactDecimalScale(div, 2));
        }
      }
    }
  }
  if (correctNumeric > 0) {
    candidates.push(formatNumber(correctNumeric * 4, decimals), formatNumber(correctNumeric * 0.25, Math.max(decimals, 2)));
  }
  if (allowNegative && correctNumeric !== 0) {
    candidates.push(formatNumber(-correctNumeric, decimals));
  }

  const seen = new Set(existingValues.map(semanticKey));
  const picked = [];
  for (const item of candidates) {
    if (!item) continue;
    const numeric = Number(item);
    if (!Number.isFinite(numeric)) continue;
    if (!allowNegative && numeric < 0) continue;
    const key = semanticKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(item);
    if (picked.length === 3) break;
  }
  return picked;
};

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
  optimizeDeps: { noDiscovery: true },
});

try {
  const rawQuestions = [];
  for (const dir of MODULE_DIRS) {
    const mod = await server.ssrLoadModule(`/src/data/grade10/physics/modules/${dir}/index.ts`);
    rawQuestions.push(...(mod.questions || []));
  }
  const rawById = new Map(rawQuestions.map(q => [q.id, q]));

  const choicesMod = await server.ssrLoadModule('/src/data/grade10/physics/practiceChoices.ts');
  const existingChoices = choicesMod.g10PhysicsPracticeChoices;

  let cleanedCount = 0;
  const updated = existingChoices.map(entry => {
    const rawQ = rawById.get(entry.id);
    if (!rawQ) throw new Error(`Missing raw Physics question for choice ${entry.id}`);

    const tinyFix = EXACT_TINY_FIXES.get(entry.id);
    if (tinyFix) {
      cleanedCount += 1;
      return {
        id: entry.id,
        correctAnswer: entry.correctAnswer,
        options: tinyFix.map((val, idx) => `${ANSWER_LETTERS[idx]}. ${val}`),
      };
    }

    const correctIdx = ANSWER_LETTERS.indexOf(entry.correctAnswer);
    const values = entry.options.map(stripOptionPrefix);
    const correctText = values[correctIdx];
    const correctNum = Number(correctText.replace(',', '.'));
    const decimals = countDecimals(correctText);
    const speedQ = isSpeedQuestion(rawQ.content);

    const hasBadDiv36 = decimals < 4 && values.some((v, idx) => idx !== correctIdx && isDivision36Artifact(v, correctNum));
    const hasNonSpeed36Pair = !speedQ && decimals < 4
      && values.some((v, idx) => idx !== correctIdx && isMultiply36Artifact(v, correctNum))
      && values.some((v, idx) => idx !== correctIdx && isDivision36Artifact(v, correctNum, true));
    if (!hasBadDiv36 && !hasNonSpeed36Pair) return entry;

    cleanedCount += 1;
    const keptValues = values.map((val, idx) => {
      if (idx === correctIdx) return val;
      if (isDivision36Artifact(val, correctNum, !speedQ)) return null;
      if (!speedQ && isMultiply36Artifact(val, correctNum)) return null;
      return val;
    });

    const pool = buildCleanPhysicsDistractors({
      question: rawQ,
      correctNumeric: correctNum,
      decimals,
      existingValues: keptValues.filter(Boolean),
    });

    let poolIdx = 0;
    const nextValues = keptValues.map(val => {
      if (val !== null) return val;
      const replacement = pool[poolIdx];
      poolIdx += 1;
      if (!replacement) {
        throw new Error(`${entry.id}: thiếu phương án thay thế cho ${values.join(', ')}`);
      }
      return replacement;
    });

    return {
      id: entry.id,
      correctAnswer: entry.correctAnswer,
      options: nextValues.map((val, idx) => `${ANSWER_LETTERS[idx]}. ${val}`),
    };
  });

  const keyCounts = Object.fromEntries(
    ANSWER_LETTERS.map(key => [
      key,
      updated.filter(entry => entry.correctAnswer === key).length,
    ])
  );

  const fileContent = [
    "import type { Physics10PracticeChoice } from './practiceChoiceNormalizer';",
    '',
    '/**',
    ' * Phương án lựa chọn cho các câu Vật lý 10 trước đây dùng ô nhập đáp án.',
    ' * Tệp được tạo tự động bằng `npm run generate:physics10-choices`; không sửa thủ công.',
    ' */',
    `export const g10PhysicsPracticeChoices: Physics10PracticeChoice[] = ${JSON.stringify(updated, null, 2)};`,
    '',
  ].join('\n');

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Đã cập nhật ${updated.length} bộ phương án Vật lý 10 (làm sạch ${cleanedCount} bộ nhiễu).`);
  console.log(`Phân bố khóa: ${JSON.stringify(keyCounts)}.`);
} finally {
  await server.close();
}
