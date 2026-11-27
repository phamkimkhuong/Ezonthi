import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import {
  buildChoiceEntries,
  buildChemistryNumericDistractors,
} from './practiceChoiceHelpers.mjs';

const MODULE_DIRS = [
  'module0_intro',
  'module1_atoms',
  'module2_periodic',
  'module3_bond',
  'module4_redox',
  'module5_energy',
  'module6_rate',
  'module7_halogen',
  'module8_synthesis',
];

const outputPath = path.resolve('src/data/grade10/chemistry/practiceChoices.ts');

const UNIT_SUFFIX_BY_ID = new Map([
  ['chem10-q02', ' L'],
  ['chem10-m0-gf036', ' L'],
  ['chem10-m0-gf050', '%'],
  ['chem10-m1-gf034', '%'],
  ['chem10-m1-gf035', '%'],
  ['chem10-rem-q017', '%'],
  ['chem10-m5-gf027', ' kJ/mol'],
  ['chem10-m5-gf028', ' kJ/mol'],
  ['chem10-m5-gf029', ' kJ/mol'],
  ['chem10-m5-gf045', ' kJ/mol'],
  ['chem10-m5-gf047', ' kJ'],
  ['chem10-m5-gf048', ' kJ/mol'],
  ['chem10-rem-q007', ' g'],
  ['chem10-rem-q009', ' mol'],
  ['chem10-rem-q058', ' J'],
  ['chem10-rem-q063', ' kJ'],
  ['chem10-rem-q067', ' M/s'],
  ['chem10-rem-q069', ' M/s'],
  ['chem10-rem-q084', ' kJ'],
]);

const CURATED_CHOICES = new Map([
  ['chem10-q3', { correctDisplay: '35,48', distractors: ['36,52', '36,00', '35,24'] }],
  ['chem10-m0-gf040', { correctDisplay: '$3{,}011 \\times 10^{23}$', distractors: ['$6{,}022 \\times 10^{23}$', '$1{,}506 \\times 10^{23}$', '$1{,}204 \\times 10^{24}$'] }],
  ['chem10-m0-gf050', { correctDisplay: '10%', distractors: ['11,1%', '20%', '5%'] }],
  ['chem10-m1-gf031', { correctDisplay: '10,3', distractors: ['10,7', '10,5', '10,1'] }],
  ['chem10-m1-gf032', { correctDisplay: '28,11', distractors: ['29,00', '28,35', '28,89'] }],
  ['chem10-m1-gf034', { correctDisplay: '80%', distractors: ['20%', '75%', '85%'] }],
  ['chem10-m1-gf035', { correctDisplay: '80%', distractors: ['20%', '75%', '60%'] }],
  ['chem10-m1-gf036', { correctDisplay: '24', distractors: ['25', '26', '22'] }],
  ['chem10-m1-gf037', { correctDisplay: '63,54', distractors: ['64,46', '64,00', '63,27'] }],
  ['chem10-m3-gf006', { correctDisplay: '$Al_2S_3$', distractors: ['$Al_3S_2$', '$AlS$', '$AlS_2$'] }],
  ['chem10-m3-gf019', { correctDisplay: '0,89', distractors: ['0,45', '1,78', '1,05'] }],
  ['chem10-m3-x2-013', { correctDisplay: '$Ca_3N_2$', distractors: ['$Ca_2N_3$', '$CaN$', '$Ca_3N$'] }],
  ['chem10-m3-x2-014', { correctDisplay: '$AlF_3$', distractors: ['$Al_3F$', '$AlF$', '$AlF_2$'] }],
  ['chem10-m4-gf001', { correctDisplay: '0', distractors: ['+1', '-1', '-2'] }],
  ['chem10-m4-gf002', { correctDisplay: '+5', distractors: ['+3', '-3', '+7'] }],
  ['chem10-m4-gf003', { correctDisplay: '+6', distractors: ['+3', '+7', '+12'] }],
  ['chem10-m4-x2-004', { correctDisplay: '+3', distractors: ['+2', '0', '-3'] }],
  ['chem10-m4-x2-005', { correctDisplay: '+4', distractors: ['+2', '-4', '0'] }],
  ['chem10-m4-x2-006', { correctDisplay: '+6', distractors: ['+4', '-2', '+8'] }],
  ['chem10-m4-x2-007', { correctDisplay: '+2', distractors: ['-2', '+1', '-1'] }],
  ['chem10-m4-x2-008', { correctDisplay: '-1', distractors: ['+1', '0', '-2'] }],
  ['chem10-m4-x2-030', { correctDisplay: '1:1', distractors: ['1:2', '2:1', '3:4'] }],
  ['chem10-m7-gf009', { correctDisplay: '$2Cl^- + Br_2$', distractors: ['$Cl_2^- + 2Br$', '$2Cl + Br_2^-$', 'Không xảy ra phản ứng'] }],
  ['chem10-m7-gf010', { correctDisplay: '$2Br^- + I_2$', distractors: ['$Br_2^- + 2I$', '$2Br + I_2^-$', 'Không xảy ra phản ứng'] }],
  ['chem10-m7-gf046', { correctDisplay: '$AgCl\\downarrow$', distractors: ['$AgCl_2\\downarrow$', '$Ag_2Cl\\downarrow$', 'Không tạo kết tủa'] }],
  ['chem10-m7-gf047', { correctDisplay: '$AgI\\downarrow$', distractors: ['$AgI_2\\downarrow$', '$Ag_2I\\downarrow$', 'Không tạo kết tủa'] }],
  ['chem10-rem-q012', { correctDisplay: '0,00055', distractors: ['0,0055', '0,000055', '0,0011'] }],
  ['chem10-rem-q016', { correctDisplay: '24,32', distractors: ['25,00', '24,68', '24,11'] }],
  ['chem10-rem-q017', { correctDisplay: '80%', distractors: ['20%', '70%', '85%'] }],
  ['chem10-rem-q031', { correctDisplay: 'Mg', distractors: ['Na', 'Al', 'Ca'] }],
  ['chem10-rem-q034', { correctDisplay: 'Na < Mg < Al < Cl', distractors: ['Cl < Al < Mg < Na', 'Na < Al < Mg < Cl', 'Mg < Na < Al < Cl'] }],
  ['chem10-rem-q037', { correctDisplay: 'Cl', distractors: ['S', 'P', 'Br'] }],
  ['chem10-rem-q040', { correctDisplay: '$MgCl_2$', distractors: ['$Mg_2Cl$', '$MgCl$', '$Mg_2Cl_3$'] }],
  ['chem10-rem-q048', { correctDisplay: '+6', distractors: ['+3', '+7', '+12'] }],
  ['chem10-rem-q049', { correctDisplay: '+7', distractors: ['+6', '+4', '+8'] }],
  ['chem10-rem-q050', { correctDisplay: '-1', distractors: ['-2', '+1', '0'] }],
  ['chem10-rem-q052', { correctDisplay: '$Cl_2$', distractors: ['$FeCl_2$', '$FeCl_3$', '$Fe^{2+}$'] }],
  ['chem10-rem-q058', { correctDisplay: '2508 J', distractors: ['1254 J', '4180 J', '250,8 J'] }],
  ['chem10-rem-q075', { correctDisplay: '$Br_2$', distractors: ['$I_2$', '$F_2$', '$KCl$'] }],
  ['chem10-rem-q076', { correctDisplay: '$I^-$', distractors: ['$Cl^-$', '$Br^-$', '$Br_2$'] }],
  ['chem10-rem-q083', { correctDisplay: 'Cl', distractors: ['F', 'Br', 'S'] }],
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
    const mod = await server.ssrLoadModule(`/src/data/grade10/chemistry/modules/${dir}/index.ts`);
    questions.push(...(mod.questions || []));
    solutions.push(...(mod.solutions || []));
  }
  const rem = await server.ssrLoadModule('/src/data/grade10/chemistry/practiceRemediation.ts');
  questions.push(...(rem.g10ChemistryRemediationQuestions || []));
  solutions.push(...(rem.g10ChemistryRemediationSolutions || []));

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
    ' * Phương án lựa chọn A–D cho các câu Hóa học 10 trước đây dùng ô nhập đáp án.',
    ' * Tệp được tạo tự động bằng `node scripts/tools/generateChemistry10PracticeChoices.mjs`; không sửa thủ công.',
    ' */',
    `export const g10ChemistryPracticeChoices: ConvertedPracticeChoice[] = ${JSON.stringify(entries, null, 2)};`,
    '',
  ].join('\n');

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Đã tạo ${entries.length} bộ phương án Hóa học 10 tại ${outputPath}.`);
  console.log(`Phân bố khóa: ${JSON.stringify(keyCounts)}.`);
} finally {
  await server.close();
}
