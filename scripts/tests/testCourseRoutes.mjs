import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent'
});

try {
  const {
    AVAILABLE_SUBJECTS_BY_GRADE,
    buildCoursePath,
    changeCourseContext,
    isCourseContext,
    parseCoursePath
  } = await vite.ssrLoadModule('/src/utils/courseRoutes.ts');

  assert.equal(isCourseContext('grade10', 'english'), true);
  assert.equal(isCourseContext('grade9', 'biology'), false);
  assert.equal(isCourseContext('grade12', 'math'), false);

  for (const [grade, subjects] of Object.entries(AVAILABLE_SUBJECTS_BY_GRADE)) {
    for (const subject of subjects) {
      const path = buildCoursePath(grade, subject, 'practice', 'type/with spaces');
      assert.deepEqual(parseCoursePath(path), {
        grade,
        subject,
        section: 'practice',
        detailId: 'type/with spaces'
      });
    }
  }

  for (const subject of ['math', 'physics', 'chemistry', 'biology']) {
    const deepLink = buildCoursePath('grade10', subject, 'advanced');
    assert.equal(parseCoursePath(deepLink)?.subject, subject);
    assert.equal(parseCoursePath(deepLink)?.section, 'advanced');
  }

  assert.equal(
    changeCourseContext('/app/grade10/math/advanced', 'grade10', 'english'),
    '/app/grade10/english/roadmap'
  );
  assert.equal(
    changeCourseContext('/app/grade10/english/practice/eng10-qt1', 'grade11', 'english'),
    '/app/grade11/english/practice/eng10-qt1'
  );
  assert.equal(parseCoursePath('/app/grade10/not-a-subject/dashboard'), null);

  const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  assert.ok(
    firebaseConfig.hosting?.rewrites?.some(
      rewrite => rewrite.source === '/app/**' && rewrite.destination === '/index.html'
    ),
    'Firebase Hosting phải rewrite deep link /app/** về SPA entry'
  );

  console.log('Course route tests passed: all released contexts, deep links, context changes and 4 advanced pages.');
} finally {
  await vite.close();
}
