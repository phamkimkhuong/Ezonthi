import type { LearningMisconception, LearningOutcome, LearningScope } from '@/types';

interface EnglishUnitPathSpec {
  unit: number;
  topicId: string;
  theme: string;
  languageTypeIds: string[];
  languageFocus: string;
}

const unitSpecs: EnglishUnitPathSpec[] = [
  {
    unit: 1,
    topicId: 'eng10-t1',
    theme: 'Family Life',
    languageTypeIds: ['eng10-qt1', 'eng10-qt9', 'eng10-qt14'],
    languageFocus: 'hiện tại đơn/tiếp diễn, từ vựng gia đình và cụm phụ âm /br/, /kr/, /tr/'
  },
  {
    unit: 2,
    topicId: 'eng10-t2',
    theme: 'Humans and the Environment',
    languageTypeIds: ['eng10-qt2', 'eng10-qt3', 'eng10-qt10', 'eng10-qt15'],
    languageFocus: 'will/be going to, câu bị động, từ vựng môi trường và cụm phụ âm'
  },
  {
    unit: 3,
    topicId: 'eng10-t3',
    theme: 'Music',
    languageTypeIds: ['eng10-qt4', 'eng10-qt7', 'eng10-qt11', 'eng10-qt16'],
    languageFocus: 'to-infinitive/bare infinitive, câu ghép, từ vựng âm nhạc và trọng âm'
  },
  {
    unit: 4,
    topicId: 'eng10-t4',
    theme: 'For a Better Community',
    languageTypeIds: ['eng10-qt5', 'eng10-qt12', 'eng10-qt17'],
    languageFocus: 'quá khứ đơn/tiếp diễn, từ vựng cộng đồng và trọng âm ba âm tiết'
  },
  {
    unit: 5,
    topicId: 'eng10-t5',
    theme: 'Inventions',
    languageTypeIds: ['eng10-qt6', 'eng10-qt8', 'eng10-qt13', 'eng10-qt18'],
    languageFocus: 'hiện tại hoàn thành, gerund/infinitive, từ vựng phát minh và trọng âm danh từ ghép'
  },
  {
    unit: 6,
    topicId: 'eng10-t6',
    theme: 'Gender Equality',
    languageTypeIds: ['eng10-qt19', 'eng10-qt20', 'eng10-qt21'],
    languageFocus: 'câu bị động với động từ khuyết thiếu, từ vựng bình đẳng giới và trọng âm'
  },
  {
    unit: 7,
    topicId: 'eng10-t7',
    theme: 'Viet Nam and International Organisations',
    languageTypeIds: ['eng10-qt22', 'eng10-qt23', 'eng10-qt24'],
    languageFocus: 'so sánh, từ vựng tổ chức quốc tế và trọng âm từ nhiều âm tiết'
  },
  {
    unit: 8,
    topicId: 'eng10-t8',
    theme: 'New Ways to Learn',
    languageTypeIds: ['eng10-qt25', 'eng10-qt26', 'eng10-qt27'],
    languageFocus: 'mệnh đề quan hệ, từ vựng học tập số và trọng âm câu'
  },
  {
    unit: 9,
    topicId: 'eng10-t9',
    theme: 'Protecting the Environment',
    languageTypeIds: ['eng10-qt28', 'eng10-qt29', 'eng10-qt30'],
    languageFocus: 'câu tường thuật, từ vựng bảo vệ môi trường và nhịp điệu câu'
  },
  {
    unit: 10,
    topicId: 'eng10-t10',
    theme: 'Ecotourism',
    languageTypeIds: ['eng10-qt31', 'eng10-qt32', 'eng10-qt33'],
    languageFocus: 'câu điều kiện, từ vựng du lịch sinh thái và ngữ điệu'
  }
];

const listeningExtensionTopicId = 'eng10-listening-extension';

const scopeForUnit = (unit: number): LearningScope => {
  if (unit <= 3) return 'core';
  if (unit <= 7) return 'specialized';
  return 'advanced';
};

export const g10EnglishMisconceptions: LearningMisconception[] = unitSpecs.flatMap(spec => [
  {
    id: `eng10-mis-u${spec.unit}-language`,
    outcomeId: `eng10-lo-u${spec.unit}-language`,
    title: `Dùng quy tắc Unit ${spec.unit} mà không xét ngữ cảnh`,
    description: `Học sinh nhận ra từ khóa nhưng không kiểm tra ý nghĩa toàn câu ở chủ đề ${spec.theme}.`,
    correction: 'Đọc trọn câu, xác định mục đích giao tiếp rồi mới chọn cấu trúc hoặc từ.',
    severity: 'normal'
  },
  {
    id: `eng10-mis-u${spec.unit}-skills`,
    outcomeId: `eng10-lo-u${spec.unit}-reading`,
    title: `Dịch từng từ thay vì xử lý thông tin`,
    description: 'Học sinh cố dịch toàn bộ bài đọc/bài nghe, bỏ lỡ ý chính, từ nối và quan hệ giữa các ý.',
    correction: 'Đọc hoặc nghe theo nhiệm vụ: dự đoán chủ đề, tìm ý chính, quét chi tiết và suy luận từ bằng chứng.',
    severity: 'critical',
    remediationOutcomeIds: [`eng10-lo-u${spec.unit}-reading`, `eng10-lo-u${spec.unit}-listening`]
  }
]);

export const g10EnglishOutcomes: LearningOutcome[] = unitSpecs.flatMap((spec, index) => {
  const previousLanguageOutcome = index > 0 ? [`eng10-lo-u${spec.unit - 1}-language`] : [];
  const languageOutcomeId = `eng10-lo-u${spec.unit}-language`;
  const readingOutcomeId = `eng10-lo-u${spec.unit}-reading`;
  const listeningOutcomeId = `eng10-lo-u${spec.unit}-listening`;

  return [
    {
      id: languageOutcomeId,
      topicId: spec.topicId,
      title: `Language – ${spec.theme}`,
      description: `Hiểu và sử dụng ${spec.languageFocus} trong câu và tình huống giao tiếp có nghĩa.`,
      scope: scopeForUnit(spec.unit),
      orderIndex: spec.unit * 10 + 1,
      questionTypeIds: [...spec.languageTypeIds, `eng10-deep-qt-u${spec.unit}-language-in-context`],
      prerequisiteOutcomeIds: previousLanguageOutcome,
      misconceptionIds: [`eng10-mis-u${spec.unit}-language`],
      evidenceTypes: ['recognition', 'explanation', 'application'],
      estimatedMinutes: 90,
      isCritical: true
    },
    {
      id: readingOutcomeId,
      topicId: spec.topicId,
      title: `Reading – ${spec.theme}`,
      description: `Đọc văn bản theo chủ đề ${spec.theme}, xác định ý chính, chi tiết, từ quy chiếu và suy luận có bằng chứng.`,
      scope: scopeForUnit(spec.unit),
      orderIndex: spec.unit * 10 + 2,
      questionTypeIds: [`eng10-skill-qt-u${spec.unit}-reading`],
      prerequisiteOutcomeIds: [languageOutcomeId],
      misconceptionIds: [`eng10-mis-u${spec.unit}-skills`],
      evidenceTypes: ['reading', 'explanation'],
      estimatedMinutes: 45,
      isCritical: true
    },
    {
      id: listeningOutcomeId,
      topicId: listeningExtensionTopicId,
      title: `Listening tự chọn – Unit ${spec.unit}: ${spec.theme}`,
      description: `Chuyên đề mở rộng tự chọn: nghe đoạn nói/hội thoại về ${spec.theme}, nắm ý chính, chi tiết và thái độ người nói. Nội dung này không thuộc đề giữa kỳ/cuối kỳ mặc định.`,
      scope: scopeForUnit(spec.unit),
      orderIndex: 1000 + spec.unit,
      questionTypeIds: [`eng10-skill-qt-u${spec.unit}-listening`],
      prerequisiteOutcomeIds: [languageOutcomeId],
      misconceptionIds: [`eng10-mis-u${spec.unit}-skills`],
      evidenceTypes: ['listening', 'recognition'],
      estimatedMinutes: 40,
      isCritical: false
    },
    {
      id: `eng10-lo-u${spec.unit}-writing`,
      topicId: spec.topicId,
      title: `Writing: Sentence Transformation & Combination – ${spec.theme}`,
      description: `Nhận diện và áp dụng cấu trúc viết lại câu, nối câu tương đương theo chủ đề ${spec.theme}.`,
      scope: scopeForUnit(spec.unit),
      orderIndex: spec.unit * 10 + 4,
      questionTypeIds: [`eng10-skill-qt-u${spec.unit}-writing`],
      prerequisiteOutcomeIds: [languageOutcomeId, readingOutcomeId],
      misconceptionIds: [`eng10-mis-u${spec.unit}-language`],
      evidenceTypes: ['writing', 'application'],
      estimatedMinutes: 40,
      isCritical: true
    }
  ];
});
