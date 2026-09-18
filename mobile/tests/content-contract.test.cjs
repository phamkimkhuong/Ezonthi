const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Execute the actual service code without loading native/Firebase UI dependencies.
function loadService(name, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../services', name), 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', javascript)(dependency => {
    assert.ok(Object.hasOwn(dependencies, dependency), `Unexpected dependency: ${dependency}`);
    return dependencies[dependency];
  }, module.exports, module);
  return module.exports;
}

function services(transformBank = () => {}) {
  const bank = loadService('questionBank.ts');
  transformBank(bank.QUESTION_BANK);
  const data = loadService('dataService.ts', { './questionBank': bank });
  const exams = loadService('examService.ts', { './dataService': data });
  return { bank, data, exams };
}

test('published counts equal playable questions for every subject and topic', () => {
  const { data } = services();
  let total = 0;
  for (const [grade, subjects] of Object.entries(data.SUBJECTS_BY_GRADE)) {
    for (const subject of subjects) {
      let subjectCount = 0;
      for (const topic of subject.topics) {
        const questions = data.DataService.getQuestionsForTopic(topic.id, grade);
        assert.equal(topic.questionCount, questions.length);
        assert.ok(questions.every(q => q.topicId === topic.id && q.subjectId === subject.id));
        subjectCount += questions.length;
      }
      assert.equal(subject.totalQuestions, subjectCount);
      total += subjectCount;
    }
  }
  assert.equal(total, data.DataService.getAllQuestions().length);
  assert.equal(total, 66);
});

test('unknown IDs and a topic requested under the wrong grade return no questions', () => {
  const { data } = services();
  for (const id of ['', 'invalid', 'chem11-t1']) {
    assert.deepEqual(data.DataService.getQuestionsForTopic(id), []);
  }
  assert.deepEqual(data.DataService.getQuestionsForTopic('math9-t1', 'grade11'), []);
  assert.equal(data.DataService.getSubject('physics', 'grade9'), undefined);
  assert.deepEqual(data.getSubjectsByGrade('invalid'), []);
});

test('all 17 unfinished grade 11 topics and both exams are unavailable, including direct lookup', () => {
  const { data, exams } = services();
  const subjects = data.getSubjectsByGrade('grade11');
  const topics = subjects.flatMap(subject => subject.topics);
  assert.equal(topics.length, 17);
  assert.ok(subjects.every(subject => subject.totalQuestions === 0));
  for (const topic of topics) {
    assert.equal(topic.questionCount, 0);
    assert.deepEqual(data.DataService.getQuestionsForTopic(topic.id), []);
  }
  assert.deepEqual(exams.getExamsByGrade('grade11'), []);
  assert.equal(exams.getExamById('exam-math11-01'), undefined);
  assert.equal(exams.getExamById('exam-eng11-01'), undefined);
});

test('incorrectly bucketed questions and unlisted banks are excluded from counts and practice', () => {
  const { data } = services(bank => {
    bank['math9-t1'].push({ ...bank['math10-t1'][0] });
    bank['math9-t1'].push({ ...bank['math9-t1'][0], id: 'wrong-subject', subjectId: 'chemistry' });
    bank.unlisted = [{ ...bank['math9-t1'][0], id: 'unlisted', topicId: 'unlisted' }];
  });
  assert.equal(data.getSubjectsByGrade('grade9')[0].topics[0].questionCount, 3);
  assert.equal(data.DataService.getQuestionsForTopic('math9-t1').length, 3);
  assert.deepEqual(data.DataService.getQuestionsForTopic('unlisted'), []);
  assert.equal(data.DataService.getAllQuestions().length, 66);
});

test('all available exams contain questions only from their declared grade and subjects', () => {
  const { data, exams } = services();
  for (const grade of ['grade9', 'grade10']) {
    const available = exams.getExamsByGrade(grade);
    assert.ok(available.length > 0);
    for (const exam of available) {
      assert.ok(exam.questions.length > 0);
      assert.equal(exams.getExamById(exam.id), exam);
      for (const q of exam.questions) {
        assert.equal(data.DataService.getTopicScope(q.topicId).gradeId, grade);
        assert.ok(exam.subjectId === q.subjectId ||
          (exam.subjectId === 'khtn' && ['physics', 'chemistry', 'biology'].includes(q.subjectId)));
      }
    }
  }
});

test('empty, mixed-grade and mixed-subject exams cannot be opened', () => {
  const { data, exams } = services();
  const exam = exams.getExamsByGrade('grade9')[0];
  assert.equal(exams.isExamAvailable({ ...exam, questions: [] }), false);
  assert.equal(exams.isExamAvailable({ ...exam, questions: data.DataService.getQuestionsForTopic('math10-t1') }), false);
  assert.equal(exams.isExamAvailable({ ...exam, questions: data.DataService.getQuestionsForTopic('eng9-t1') }), false);
  assert.equal(exams.isExamAvailable({ ...exam, grade: 11 }), false);
  assert.equal(exams.isExamAvailable({ ...exam, contentStatus: 'draft' }), false);
  assert.deepEqual(exams.getQuestionsBySubject('physics', 'grade9'), []);
});

test('math9-t3-q2 grades 30 hours (D) as correct and 20 hours (A) as wrong', () => {
  const { data, exams } = services();
  const question = data.DataService.getQuestionsForTopic('math9-t3').find(q => q.id === 'math9-t3-q2');
  const v = (7 / 12 - 4 / 12) / 5;
  const u = 1 / 12 - v;
  assert.ok(Math.abs(1 / u - 30) < 1e-10);
  assert.equal(question.correctAnswer, 'D');
  assert.equal(question.options.find(option => option.startsWith('D.')), 'D. 30 giờ');
  assert.match(question.explanation, /người 1 làm một mình xong trong 30 giờ/);
  const exam = { ...exams.getExamsByGrade('grade9')[0], questions: [question] };
  assert.equal(exams.evaluateExam(exam, { [question.id]: 'D' }, 10).score10, 10);
  assert.equal(exams.evaluateExam(exam, { [question.id]: 'A' }, 10).score10, 0);
});
