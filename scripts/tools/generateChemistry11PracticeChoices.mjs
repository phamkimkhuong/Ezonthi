import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import {
  buildChoiceEntries,
  buildChemistryNumericDistractors,
} from './practiceChoiceHelpers.mjs';

const MODULE_DIRS = [
  'module0_bridge',
  'module1_equilibrium',
  'module2_nitrogen_sulfur',
  'module3_organic_basics',
  'module4_hydrocarbons',
  'module5_halogen_alcohol_phenol',
  'module6_carbonyl_carboxylic_acid',
];

const outputPath = path.resolve('src/data/grade11/chemistry/practiceChoices.ts');

const UNIT_SUFFIX_BY_ID = new Map([
  ['chem11-ns-x020', '%'],
  ['chem11-ns-x024', ' M'],
  ['chem11-org-x005', '%'],
  ['chem11-org-x008', '%'],
  ['chem11-cc-x018', ' g'],
]);

const CURATED_CHOICES = new Map([
  ['chem11-eq-x008', {
    correctDisplay: 'Chiều thuận (sang phải)',
    distractors: ['Chiều nghịch (sang trái)', 'Không chuyển dịch', 'Phụ thuộc áp suất ban đầu'],
  }],
  ['chem11-eq-x010', {
    correctDisplay: 'Không chuyển dịch',
    distractors: ['Chuyển dịch theo chiều thuận', 'Chuyển dịch theo chiều nghịch', 'Dừng phản ứng ngay lập tức'],
  }],
  ['chem11-eq-x012', {
    correctDisplay: '5',
    distractors: ['10', '2,5', '25'],
  }],
  ['chem11-eq-x014', {
    correctDisplay: '$5{,}0 \\times 10^{-11}$',
    distractors: ['$2{,}0 \\times 10^{-10}$', '$5{,}0 \\times 10^{-10}$', '$2{,}0 \\times 10^{-11}$'],
  }],
  ['chem11-ns-x002', {
    correctDisplay: '6,72',
    distractors: ['13,44', '8,96', '3,36'],
  }],
  ['chem11-ns-x020', {
    correctDisplay: '67,6%',
    distractors: ['32,4%', '45,1%', '53,8%'],
  }],
  ['chem11-hap-x005', {
    correctDisplay: '7,36',
    distractors: ['9,20', '14,72', '3,68'],
  }],
  ['chem11-org-x002', {
    correctDisplay: 'Hexane',
    distractors: ['Heptane', 'Hỗn hợp chỉ gồm heptane tinh khiết', 'Nước cất'],
  }],
  ['chem11-org-x010', {
    correctDisplay: 'Để xả áp suất hơi dung môi tích tụ trong phễu',
    distractors: [
      'Để tăng tốc độ hòa tan chất rắn',
      'Để rút lớp chất lỏng nặng ra ngay khi đang lắc',
      'Để dẫn thêm oxygen vào phản ứng với chất tan',
    ],
  }],
  ['chem11-org-x012', {
    correctDisplay: '16',
    distractors: ['40', '25', '84'],
  }],
  ['chem11-hc-x010', {
    correctDisplay: 'Butan-2-ol',
    distractors: ['Butan-1-ol', '2-methylpropan-1-ol', 'Butane-1,2-diol'],
  }],
  ['chem11-cc-x002', {
    correctDisplay: '21,6',
    distractors: ['10,8', '43,2', '32,4'],
  }],
  ['chem11-cc-x017', {
    correctDisplay: '0,16',
    distractors: ['0,24', '0,20', '0,12'],
  }],
  ['chem11-cc-x018', {
    correctDisplay: '12,32 g',
    distractors: ['17,6 g', '8,8 g', '24,64 g'],
  }],
]);

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
  optimizeDeps: { noDiscovery: true },
});

try {
  const questions = [];
  const solutions = [];
  for (const dir of MODULE_DIRS) {
    const mod = await server.ssrLoadModule(`/src/data/grade11/chemistry/modules/${dir}/index.ts`);
    questions.push(...(mod.questions || []));
    solutions.push(...(mod.solutions || []));
  }

  const solutionById = new Map(solutions.map(s => [s.questionId, s]));
  const targetQuestions = questions.filter(
    q => (!q.options || q.options.length === 0) && q.validatorType !== 'choice'
  );

  const { entries, keyCounts } = buildChoiceEntries({
    questions: targetQuestions,
    curatedMap: CURATED_CHOICES,
    generateDistractors: question => buildChemistryNumericDistractors({
      question,
      solution: solutionById.get(question.id),
      correctAnswerStr: String(question.correctAnswer),
      unitSuffix: UNIT_SUFFIX_BY_ID.get(question.id) ?? '',
    }),
  });

  const fileContent = [
    "import type { ConvertedPracticeChoice } from '@/data/practiceChoiceUtils';",
    '',
    '/**',
    ' * Phương án lựa chọn A–D cho các câu Hóa học 11 trước đây dùng ô nhập đáp án.',
    ' * Tệp được tạo tự động bằng `node scripts/tools/generateChemistry11PracticeChoices.mjs`; không sửa thủ công.',
    ' */',
    `export const g11ChemistryPracticeChoices: ConvertedPracticeChoice[] = ${JSON.stringify(entries, null, 2)};`,
    '',
  ].join('\n');

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Đã tạo ${entries.length} bộ phương án Hóa học 11 tại ${outputPath}.`);
  console.log(`Phân bố khóa: ${JSON.stringify(keyCounts)}.`);
} finally {
  await server.close();
}
