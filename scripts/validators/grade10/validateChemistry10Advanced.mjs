import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true }
});

const errors = [];
const normalize = value => String(value ?? '')
  .normalize('NFC')
  .toLowerCase()
  .replace(/-?\d+(?:[.,]\d+)?(?:×10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹-]+)?/g, '#')
  .replace(/\s+/g, ' ')
  .trim();
const words = value => String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
const unique = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} trùng ${key}: ${item[key]}`);
    seen.add(item[key]);
  }
};

try {
  const { advancedChemistry10Topics, advancedChemistry10Questions, advancedChemistry10Solutions } =
    await server.ssrLoadModule('/src/data/grade10/chemistry/advanced/index.ts');

  unique(advancedChemistry10Topics, 'id', 'Topic');
  unique(advancedChemistry10Questions, 'id', 'Question');
  unique(advancedChemistry10Solutions, 'questionId', 'Solution');

  if (advancedChemistry10Topics.length !== 9) errors.push(`Cần 9 chuyên đề, hiện có ${advancedChemistry10Topics.length}.`);
  if (advancedChemistry10Questions.length !== 192) errors.push(`Cần 192 câu, hiện có ${advancedChemistry10Questions.length}.`);
  if (advancedChemistry10Solutions.length !== 192) errors.push(`Cần 192 lời giải, hiện có ${advancedChemistry10Solutions.length}.`);

  const expectedByTopic = {
    'chem10-adv-atom': 20,
    'chem10-adv-periodic': 20,
    'chem10-adv-bond': 24,
    'chem10-adv-nuclear': 20,
    'chem10-adv-redox': 24,
    'chem10-adv-energy': 24,
    'chem10-adv-rate': 20,
    'chem10-adv-halogen': 22,
    'chem10-adv-experiment': 18
  };
  const topicIds = new Set(advancedChemistry10Topics.map(topic => topic.id));
  const solutionByQuestion = new Map(advancedChemistry10Solutions.map(solution => [solution.questionId, solution]));
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const levelCounts = { hard: 0, very_hard: 0, extreme: 0 };
  const lengthCounts = { compact: 0, extended: 0, olympiad: 0 };
  const scopeCounts = { core_advanced: 0, grade10_specialized: 0, olympiad_extension: 0 };
  const structures = new Map();
  const mistakeSets = new Map();
  let dataQuestionCount = 0;

  for (const [topicId, expected] of Object.entries(expectedByTopic)) {
    const actual = advancedChemistry10Questions.filter(question => question.topicId === topicId).length;
    if (actual !== expected) errors.push(`${topicId}: cần ${expected} câu, hiện có ${actual}.`);
  }

  for (const [index, question] of advancedChemistry10Questions.entries()) {
    const expectedId = `chem10-adv-q${String(index + 1).padStart(3, '0')}`;
    if (question.id !== expectedId) errors.push(`Sai ID vị trí ${index + 1}: ${question.id}.`);
    if (!topicIds.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
    if (question.subjectId !== 'chemistry') errors.push(`${question.id}: subjectId phải là chemistry.`);
    if (question.responseType !== 'single_choice') errors.push(`${question.id}: chỉ chấp nhận single_choice.`);
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: cần đúng bốn phương án.`);
    if (new Set(question.options).size !== 4) errors.push(`${question.id}: phương án bị trùng.`);
    if (!Object.hasOwn(answerCounts, question.correctAnswer)) errors.push(`${question.id}: đáp án ngoài A–D.`);
    else answerCounts[question.correctAnswer] += 1;
    if (!Object.hasOwn(levelCounts, question.advancedLevel)) errors.push(`${question.id}: mức độ sai.`);
    else levelCounts[question.advancedLevel] += 1;
    if (!Object.hasOwn(lengthCounts, question.problemLength)) errors.push(`${question.id}: độ dài sai.`);
    else lengthCounts[question.problemLength] += 1;
    if (!Object.hasOwn(scopeCounts, question.advancedScope)) errors.push(`${question.id}: phạm vi kiến thức sai.`);
    else scopeCounts[question.advancedScope] += 1;
    if (question.estimatedMinutes < 7) errors.push(`${question.id}: thời gian ước lượng quá thấp.`);
    if (question.stimulus?.dataTable || question.stimulus?.media?.length) dataQuestionCount += 1;

    const structure = normalize([question.stimulus?.title, question.stimulus?.content, question.content].filter(Boolean).join(' '));
    const previous = structures.get(structure);
    if (previous) errors.push(`${question.id}: lặp cấu trúc với ${previous} sau khi bỏ số liệu.`);
    else structures.set(structure, question.id);

    const solution = solutionByQuestion.get(question.id);
    if (!solution) {
      errors.push(`${question.id}: thiếu lời giải.`);
      continue;
    }
    if (solution.finalAnswer !== question.correctAnswer) errors.push(`${question.id}: đáp án câu và lời giải lệch nhau.`);
    if (solution.recognition.length < 120) errors.push(`${question.id}: nhận dạng quá ngắn.`);
    if (!solution.insight || solution.insight.length < 30) errors.push(`${question.id}: thiếu mấu chốt riêng.`);
    if (solution.detailedSteps.length < 8) errors.push(`${question.id}: cần ít nhất 8 bước lời giải, hiện có ${solution.detailedSteps.length}.`);
    const explanationWords = solution.detailedSteps.reduce((sum, step) => sum + words(step.explanation), 0);
    if (explanationWords < 180) errors.push(`${question.id}: lời giải chỉ ${explanationWords} từ, cần tối thiểu 180.`);
    if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length !== 3) errors.push(`${question.id}: cần đúng ba bẫy sai.`);
    if (!Array.isArray(solution.reviewSuggestions) || solution.reviewSuggestions.length < 2) errors.push(`${question.id}: thiếu gợi ý ôn tập.`);
    const mistakeKey = solution.commonMistakes.join('|');
    if (mistakeSets.has(mistakeKey)) errors.push(`${question.id}: bộ bẫy lặp với ${mistakeSets.get(mistakeKey)}.`);
    else mistakeSets.set(mistakeKey, question.id);

    const allText = JSON.stringify({ question, solution });
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(allText)) errors.push(`${question.id}: có ký tự điều khiển.`);
    if (/Vậy đáp án cần|câu hỏi được hiệu chỉnh|đáp án phải là/i.test(allText)) errors.push(`${question.id}: còn ghi chú biên tập trong dữ liệu.`);
  }

  for (const [key, value] of Object.entries(answerCounts)) if (value !== 48) errors.push(`Đáp án ${key}: cần 48, hiện có ${value}.`);
  const expectedLevels = { hard: 48, very_hard: 80, extreme: 64 };
  const expectedLengths = { compact: 64, extended: 80, olympiad: 48 };
  for (const [key, value] of Object.entries(expectedLevels)) if (levelCounts[key] !== value) errors.push(`Mức ${key}: cần ${value}, hiện có ${levelCounts[key]}.`);
  for (const [key, value] of Object.entries(expectedLengths)) if (lengthCounts[key] !== value) errors.push(`Kiểu ${key}: cần ${value}, hiện có ${lengthCounts[key]}.`);
  if (scopeCounts.core_advanced < 110) errors.push(`Câu cốt lõi nâng cao quá ít: ${scopeCounts.core_advanced}.`);
  if (scopeCounts.grade10_specialized < 30) errors.push(`Câu chuyên đề chính thức quá ít: ${scopeCounts.grade10_specialized}.`);
  if (scopeCounts.olympiad_extension > 24) errors.push(`Câu mở rộng Olympic vượt biên: ${scopeCounts.olympiad_extension}.`);
  if (dataQuestionCount < 20) errors.push(`Cần ít nhất 20 câu có bảng/hình, hiện có ${dataQuestionCount}.`);

  if (errors.length) {
    console.error(`Hóa học 10 nâng cao chưa hợp lệ (${errors.length} lỗi):`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`Hóa học 10 nâng cao: ${advancedChemistry10Questions.length} câu / ${advancedChemistry10Topics.length} chuyên đề.`);
    console.log(`Mức độ: ${JSON.stringify(levelCounts)}.`);
    console.log(`Độ dài: ${JSON.stringify(lengthCounts)}.`);
    console.log(`Phạm vi: ${JSON.stringify(scopeCounts)}.`);
    console.log(`Đáp án: ${JSON.stringify(answerCounts)}; ${dataQuestionCount} câu có bảng/hình.`);
    console.log(`Đa dạng: ${structures.size}/${advancedChemistry10Questions.length} cấu trúc và ${mistakeSets.size} bộ bẫy riêng.`);
    console.log('Toàn bộ câu hỏi dùng A–B–C–D và có lời giải sư phạm nhiều bước.');
  }
} finally {
  await server.close();
}
