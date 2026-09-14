import { createServer } from 'vite';

/** Nạp đúng registry mà ứng dụng sử dụng, không đoán dữ liệu bằng regex. */
export async function loadSeoCatalog() {
  const vite = await createServer({
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true }
  });

  try {
    const [registry, landingModule] = await Promise.all([
      vite.ssrLoadModule('/src/data/allDataRegistry.ts'),
      vite.ssrLoadModule('/src/seo/landingPages.ts')
    ]);

    const questionTypes = registry.allQuestionTypesList.map(item => {
      const info = registry.getSubjectInfoByTypeId(item.id);
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        theory: item.theory || [],
        recognitionSigns: item.recognitionSigns || [],
        solvingSteps: item.solvingSteps || [],
        commonMistakes: item.commonMistakes || [],
        difficulty: item.difficulty,
        subjectKey: info.key,
        subject: info.name.replace(/\s+\d+$/, ''),
        grade: info.grade
      };
    });

    const ids = new Set();
    for (const item of questionTypes) {
      if (ids.has(item.id)) throw new Error(`Question type bị trùng ID: ${item.id}`);
      ids.add(item.id);
    }

    return {
      questionTypes: questionTypes.sort((a, b) => a.id.localeCompare(b.id)),
      landingPages: landingModule.seoLandingPages
    };
  } finally {
    await vite.close();
  }
}
