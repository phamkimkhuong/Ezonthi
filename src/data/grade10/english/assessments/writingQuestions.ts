import { Question, Solution } from '@/types';

export const g10EnglishAssessmentWritingQuestions: Question[] = [
  // ==========================================
  // MIDTERM 1 - FORM A (Units 1–3)
  // ==========================================
  {
    id: 'eng10-exam-m1a-w1',
    subjectId: 'english',
    topicId: 'eng10-t1',
    questionTypeId: 'eng10-skill-qt-u1-writing',
    subTypeId: 'eng10-u1-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nMy father usually does the heavy lifting in our family.',
    options: [
      'A. In our family, the heavy lifting is usually done by my father.',
      'B. My father is never responsible for heavy lifting in our home.',
      'C. The heavy lifting in our family was done by my father yesterday.',
      'D. My father will do the heavy lifting in our family tomorrow.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'understanding',
    outcomeIds: ['eng10-lo-u1-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1a-w2',
    subjectId: 'english',
    topicId: 'eng10-t2',
    questionTypeId: 'eng10-skill-qt-u2-writing',
    subTypeId: 'eng10-u2-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nThey have decided to clean up the neighbourhood park this weekend.',
    options: [
      'A. They cleaned up the neighbourhood park last weekend.',
      'B. They are going to clean up the neighbourhood park this weekend.',
      'C. They might not clean up the neighbourhood park this weekend.',
      'D. They used to clean up the neighbourhood park every weekend.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u2-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1a-w3',
    subjectId: 'english',
    topicId: 'eng10-t3',
    questionTypeId: 'eng10-skill-qt-u3-writing',
    subTypeId: 'eng10-u3-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nIt is essential for young musicians to practise their instruments daily.',
    options: [
      'A. Young musicians should avoid practising their instruments daily.',
      'B. Young musicians practised their instruments every day last year.',
      'C. Young musicians need to practise their instruments every day.',
      'D. Young musicians may practise their instruments only once a week.'
    ],
    correctAnswer: 'C',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u3-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1a-w4',
    subjectId: 'english',
    topicId: 'eng10-t2',
    questionTypeId: 'eng10-skill-qt-u2-writing',
    subTypeId: 'eng10-u2-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nWe turn off unnecessary lights. We want to reduce electricity consumption.',
    options: [
      'A. We turn off unnecessary lights in order to reduce electricity consumption.',
      'B. We turn off unnecessary lights, but our electricity consumption increases.',
      'C. Although we turn off unnecessary lights, electricity is wasted.',
      'D. We turn off unnecessary lights so that electricity cannot be saved.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u2-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1a-w5',
    subjectId: 'english',
    topicId: 'eng10-t3',
    questionTypeId: 'eng10-skill-qt-u3-writing',
    subTypeId: 'eng10-u3-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nThe concert tickets were very expensive. Many students still bought them to support the school band.',
    options: [
      'A. Because the concert tickets were very expensive, many students bought them.',
      'B. Although the concert tickets were very expensive, many students still bought them to support the school band.',
      'C. The concert tickets were cheap enough for all students to buy easily.',
      'D. Many students bought the tickets despite they were very expensive.'
    ],
    correctAnswer: 'B',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u3-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // MIDTERM 1 - FORM B (Units 1–3)
  // ==========================================
  {
    id: 'eng10-exam-m1b-w1',
    subjectId: 'english',
    topicId: 'eng10-t1',
    questionTypeId: 'eng10-skill-qt-u1-writing',
    subTypeId: 'eng10-u1-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nMy mother prepares breakfast for the entire family every morning.',
    options: [
      'A. Breakfast was prepared by my mother yesterday morning.',
      'B. Breakfast is prepared by my mother for the entire family every morning.',
      'C. My mother will prepare breakfast for the entire family tomorrow.',
      'D. My mother rarely prepares breakfast for our family.'
    ],
    correctAnswer: 'B',
    difficulty: 'easy',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'understanding',
    outcomeIds: ['eng10-lo-u1-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1b-w2',
    subjectId: 'english',
    topicId: 'eng10-t2',
    questionTypeId: 'eng10-skill-qt-u2-writing',
    subTypeId: 'eng10-u2-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nPeople should sort household waste before putting it into bins.',
    options: [
      'A. Household waste shouldn’t be sorted before disposal.',
      'B. Household waste was sorted by local people last week.',
      'C. Household waste should be sorted before being put into bins.',
      'D. People never sort household waste in this neighbourhood.'
    ],
    correctAnswer: 'C',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u2-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1b-w3',
    subjectId: 'english',
    topicId: 'eng10-t3',
    questionTypeId: 'eng10-skill-qt-u3-writing',
    subTypeId: 'eng10-u3-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nShe plans to participate in the local singing competition next month.',
    options: [
      'A. She won the local singing competition last month.',
      'B. She will definitely quit the local singing competition next month.',
      'C. She refuses to take part in the local singing competition.',
      'D. She is going to take part in the local singing competition next month.'
    ],
    correctAnswer: 'D',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u3-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1b-w4',
    subjectId: 'english',
    topicId: 'eng10-t1',
    questionTypeId: 'eng10-skill-qt-u1-writing',
    subTypeId: 'eng10-u1-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nFamily members share domestic chores. They build strong and positive relationships.',
    options: [
      'A. By sharing domestic chores, family members build strong and positive relationships.',
      'B. Family members build strong relationships, yet they never share chores.',
      'C. Unless family members share chores, they will certainly build strong relationships.',
      'D. Sharing domestic chores makes family members too tired to talk.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u1-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m1b-w5',
    subjectId: 'english',
    topicId: 'eng10-t2',
    questionTypeId: 'eng10-skill-qt-u2-writing',
    subTypeId: 'eng10-u2-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nPlastic bottles are convenient to use. They take hundreds of years to decompose in landfills.',
    options: [
      'A. Plastic bottles take hundreds of years to decompose because they are convenient.',
      'B. Although plastic bottles are convenient to use, they take hundreds of years to decompose in landfills.',
      'C. Plastic bottles are convenient, so they decompose very quickly.',
      'D. Because plastic bottles decompose slowly, everyone should use more of them.'
    ],
    correctAnswer: 'B',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u2-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // FINAL 1 - FORM A (Units 1–5)
  // ==========================================
  {
    id: 'eng10-exam-f1a-w1',
    subjectId: 'english',
    topicId: 'eng10-t4',
    questionTypeId: 'eng10-skill-qt-u4-writing',
    subTypeId: 'eng10-u4-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nHe started volunteering at the local community center three years ago.',
    options: [
      'A. He stopped volunteering at the community center three years ago.',
      'B. He hasn’t volunteered at the community center for three years.',
      'C. He has volunteered at the local community center for three years.',
      'D. He will volunteer at the community center in three years.'
    ],
    correctAnswer: 'C',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u4-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1a-w2',
    subjectId: 'english',
    topicId: 'eng10-t5',
    questionTypeId: 'eng10-skill-qt-u5-writing',
    subTypeId: 'eng10-u5-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nScientists have developed a smartphone app that monitors air quality in cities.',
    options: [
      'A. A smartphone app that monitors air quality in cities has been developed by scientists.',
      'B. A smartphone app monitoring air quality was cancelled by scientists.',
      'C. Scientists are planning to develop an air monitor app in the future.',
      'D. Air quality in cities will develop a smartphone app for scientists.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u5-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1a-w3',
    subjectId: 'english',
    topicId: 'eng10-t3',
    questionTypeId: 'eng10-skill-qt-u3-writing',
    subTypeId: 'eng10-u3-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nIt is forbidden for visitors to take photographs during the performance.',
    options: [
      'A. Visitors may take photographs during the performance if they want.',
      'B. Visitors mustn’t take photographs during the performance.',
      'C. Visitors ought to take more photographs during the performance.',
      'D. Visitors didn’t take any photographs during the performance.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u3-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1a-w4',
    subjectId: 'english',
    topicId: 'eng10-t4',
    questionTypeId: 'eng10-skill-qt-u4-writing',
    subTypeId: 'eng10-u4-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nThe students were cleaning up the schoolyard. It started to rain heavily.',
    options: [
      'A. While the students were cleaning up the schoolyard, it started to rain heavily.',
      'B. The students cleaned up the schoolyard because it rained heavily.',
      'C. As soon as it rained heavily, the students cleaned up the schoolyard.',
      'D. The students were cleaning up the schoolyard so that it started to rain.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u4-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1a-w5',
    subjectId: 'english',
    topicId: 'eng10-t5',
    questionTypeId: 'eng10-skill-qt-u5-writing',
    subTypeId: 'eng10-u5-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nAI software can process medical images rapidly. It helps doctors detect illnesses early.',
    options: [
      'A. AI software can process medical images rapidly, which helps doctors detect illnesses early.',
      'B. Because AI software helps detect illnesses early, it cannot process images.',
      'C. Although AI software processes images rapidly, doctors detect illnesses late.',
      'D. AI software processes medical images rapidly so that doctors cannot detect illnesses.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u5-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // FINAL 1 - FORM B (Units 1–5)
  // ==========================================
  {
    id: 'eng10-exam-f1b-w1',
    subjectId: 'english',
    topicId: 'eng10-t4',
    questionTypeId: 'eng10-skill-qt-u4-writing',
    subTypeId: 'eng10-u4-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nShe last visited the nursing home in December.',
    options: [
      'A. She has visited the nursing home since December.',
      'B. She hasn’t visited the nursing home since December.',
      'C. She visited the nursing home every month after December.',
      'D. She will visit the nursing home next December.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u4-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1b-w2',
    subjectId: 'english',
    topicId: 'eng10-t5',
    questionTypeId: 'eng10-skill-qt-u5-writing',
    subTypeId: 'eng10-u5-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nEngineers designed 3D printers to produce low-cost prosthetic limbs.',
    options: [
      'A. 3D printers were designed by engineers to produce low-cost prosthetic limbs.',
      'B. 3D printers were too expensive for engineers to design prosthetic limbs.',
      'C. Engineers are going to design 3D printers for prosthetic limbs tomorrow.',
      'D. Low-cost prosthetic limbs designed 3D printers for engineers.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u5-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1b-w3',
    subjectId: 'english',
    topicId: 'eng10-t2',
    questionTypeId: 'eng10-skill-qt-u2-writing',
    subTypeId: 'eng10-u2-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nIt is not necessary for students to print their assignments on paper.',
    options: [
      'A. Students must print their assignments on paper.',
      'B. Students don’t need to print their assignments on paper.',
      'C. Students shouldn’t submit assignments at all.',
      'D. Students are forbidden to print assignments on paper.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u2-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1b-w4',
    subjectId: 'english',
    topicId: 'eng10-t4',
    questionTypeId: 'eng10-skill-qt-u4-writing',
    subTypeId: 'eng10-u4-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nLan was teaching English to rural children. Her phone rang unexpectedly.',
    options: [
      'A. Lan was teaching English when her phone rang unexpectedly.',
      'B. Lan taught English because her phone rang unexpectedly.',
      'C. As soon as Lan’s phone rang, she decided to teach English.',
      'D. Lan’s phone rang so that she was teaching English.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u4-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f1b-w5',
    subjectId: 'english',
    topicId: 'eng10-t5',
    questionTypeId: 'eng10-skill-qt-u5-writing',
    subTypeId: 'eng10-u5-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nThe young inventor created a solar water filter. His filter won the national science prize.',
    options: [
      'A. The young inventor created a solar water filter which won the national science prize.',
      'B. Although the filter won the prize, the inventor refused to create it.',
      'C. Because the solar filter won the prize, the inventor was too young to create it.',
      'D. The young inventor won the prize despite his filter did not work.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u5-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // MIDTERM 2 - FORM A (Units 6–8)
  // ==========================================
  {
    id: 'eng10-exam-m2a-w1',
    subjectId: 'english',
    topicId: 'eng10-t6',
    questionTypeId: 'eng10-skill-qt-u6-writing',
    subTypeId: 'eng10-u6-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nGovernments must provide equal job opportunities for both men and women.',
    options: [
      'A. Equal job opportunities must be provided for both men and women by governments.',
      'B. Men and women should avoid applying for government jobs.',
      'C. Governments were forced to provide jobs for men only.',
      'D. Equal job opportunities cannot be provided by governments.'
    ],
    correctAnswer: 'A',
    difficulty: 'easy',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'understanding',
    outcomeIds: ['eng10-lo-u6-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2a-w2',
    subjectId: 'english',
    topicId: 'eng10-t7',
    questionTypeId: 'eng10-skill-qt-u7-writing',
    subTypeId: 'eng10-u7-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nViet Nam’s economy is growing faster than many other economies in the region.',
    options: [
      'A. Many economies in the region grow faster than Viet Nam’s economy.',
      'B. Viet Nam’s economy does not grow as fast as other economies in the region.',
      'C. Many other economies in the region do not grow as fast as Viet Nam’s economy.',
      'D. Viet Nam’s economy has stopped growing in the region.'
    ],
    correctAnswer: 'C',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u7-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2a-w3',
    subjectId: 'english',
    topicId: 'eng10-t8',
    questionTypeId: 'eng10-skill-qt-u8-writing',
    subTypeId: 'eng10-u8-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nStudents are not permitted to use mobile phones during examination hours.',
    options: [
      'A. Students mustn’t use mobile phones during examination hours.',
      'B. Students don’t have to use mobile phones during exams.',
      'C. Students can use mobile phones if they need help.',
      'D. Students ought to check mobile phones during exams.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u8-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2a-w4',
    subjectId: 'english',
    topicId: 'eng10-t6',
    questionTypeId: 'eng10-skill-qt-u6-writing',
    subTypeId: 'eng10-u6-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nWomen face wage discrimination in some companies. They continue to achieve outstanding professional results.',
    options: [
      'A. Although women face wage discrimination in some companies, they continue to achieve outstanding professional results.',
      'B. Because women achieve outstanding results, they face wage discrimination.',
      'C. Women face wage discrimination, so they stop working hard.',
      'D. Despite women face wage discrimination, their results are outstanding.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u6-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2a-w5',
    subjectId: 'english',
    topicId: 'eng10-t8',
    questionTypeId: 'eng10-skill-qt-u8-writing',
    subTypeId: 'eng10-u8-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nWe interviewed a technology expert. Her online learning platform has helped thousands of students.',
    options: [
      'A. We interviewed a technology expert whose online learning platform has helped thousands of students.',
      'B. The technology expert who we interviewed her platform helped thousands of students.',
      'C. We interviewed an expert which online platform helped thousands of students.',
      'D. Although the platform helped students, we interviewed the technology expert.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u8-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // MIDTERM 2 - FORM B (Units 6–8)
  // ==========================================
  {
    id: 'eng10-exam-m2b-w1',
    subjectId: 'english',
    topicId: 'eng10-t6',
    questionTypeId: 'eng10-skill-qt-u6-writing',
    subTypeId: 'eng10-u6-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nSchools should encourage female students to join STEM clubs.',
    options: [
      'A. Female students should be encouraged to join STEM clubs by schools.',
      'B. Female students must avoid STEM clubs according to schools.',
      'C. Schools discouraged female students from joining STEM clubs.',
      'D. Male students are not allowed to join STEM clubs in schools.'
    ],
    correctAnswer: 'A',
    difficulty: 'easy',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'understanding',
    outcomeIds: ['eng10-lo-u6-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2b-w2',
    subjectId: 'english',
    topicId: 'eng10-t7',
    questionTypeId: 'eng10-skill-qt-u7-writing',
    subTypeId: 'eng10-u7-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nNo member country in the organisation is more committed to green growth than Viet Nam.',
    options: [
      'A. Viet Nam is the least committed country to green growth in the organisation.',
      'B. Viet Nam is the most committed member country to green growth in the organisation.',
      'C. Member countries are more committed to green growth than Viet Nam.',
      'D. Viet Nam is as uncommitted to green growth as other member countries.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u7-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2b-w3',
    subjectId: 'english',
    topicId: 'eng10-t8',
    questionTypeId: 'eng10-skill-qt-u8-writing',
    subTypeId: 'eng10-u8-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nIt is obligatory for students to submit their online projects by Friday midnight.',
    options: [
      'A. Students may submit their online projects after Friday midnight.',
      'B. Students must submit their online projects by Friday midnight.',
      'C. Students don’t need to submit their online projects on time.',
      'D. Students are advised not to submit their projects online.'
    ],
    correctAnswer: 'B',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u8-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2b-w4',
    subjectId: 'english',
    topicId: 'eng10-t7',
    questionTypeId: 'eng10-skill-qt-u7-writing',
    subTypeId: 'eng10-u7-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nViet Nam joined the World Trade Organisation. It has attracted significant foreign direct investment.',
    options: [
      'A. Since Viet Nam joined the World Trade Organisation, it has attracted significant foreign direct investment.',
      'B. Viet Nam joined the World Trade Organisation, but it attracted no investment.',
      'C. Although Viet Nam attracted foreign investment, it refused to join the WTO.',
      'D. Unless Viet Nam joined the WTO, foreign investment would increase rapidly.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u7-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-m2b-w5',
    subjectId: 'english',
    topicId: 'eng10-t8',
    questionTypeId: 'eng10-skill-qt-u8-writing',
    subTypeId: 'eng10-u8-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nThe school has introduced blended learning courses. They combine face-to-face workshops with digital modules.',
    options: [
      'A. The school has introduced blended learning courses which combine face-to-face workshops with digital modules.',
      'B. Blended learning courses combine workshops because the school refused to introduce them.',
      'C. The school introduced courses who combine face-to-face workshops with digital modules.',
      'D. Although digital modules are useful, the school stopped blended learning courses.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u8-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // FINAL 2 - FORM A (Units 6–10)
  // ==========================================
  {
    id: 'eng10-exam-f2a-w1',
    subjectId: 'english',
    topicId: 'eng10-t9',
    questionTypeId: 'eng10-skill-qt-u9-writing',
    subTypeId: 'eng10-u9-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\n“We are planting mangrove trees along the coastline today,” the volunteer said.',
    options: [
      'A. The volunteer said that they were planting mangrove trees along the coastline that day.',
      'B. The volunteer said that they planted mangrove trees along the coastline today.',
      'C. The volunteer told that they are planting mangrove trees along the coastline now.',
      'D. The volunteer asked whether they were planting mangrove trees that day.'
    ],
    correctAnswer: 'A',
    difficulty: 'easy',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'understanding',
    outcomeIds: ['eng10-lo-u9-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2a-w2',
    subjectId: 'english',
    topicId: 'eng10-t9',
    questionTypeId: 'eng10-skill-qt-u9-writing',
    subTypeId: 'eng10-u9-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\n“What are you going to do to protect local wildlife?”, the environmental officer asked me.',
    options: [
      'A. The environmental officer asked me what was I going to do to protect local wildlife.',
      'B. The environmental officer asked me what I was going to do to protect local wildlife.',
      'C. The environmental officer wanted to know if I am going to protect local wildlife.',
      'D. The environmental officer asked me what are you going to do to protect local wildlife.'
    ],
    correctAnswer: 'B',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u9-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2a-w3',
    subjectId: 'english',
    topicId: 'eng10-t10',
    questionTypeId: 'eng10-skill-qt-u10-writing',
    subTypeId: 'eng10-u10-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nTourists throw plastic rubbish into the coral reef, so the marine ecosystem is damaged.',
    options: [
      'A. If tourists didn’t throw plastic rubbish into the coral reef, the marine ecosystem wouldn’t be damaged.',
      'B. If tourists throw plastic rubbish into the coral reef, the marine ecosystem will be healthy.',
      'C. Unless tourists threw plastic rubbish into the reef, the marine ecosystem was damaged.',
      'D. If tourists don’t throw plastic rubbish, the marine ecosystem would have been damaged.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u10-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2a-w4',
    subjectId: 'english',
    topicId: 'eng10-t10',
    questionTypeId: 'eng10-skill-qt-u10-writing',
    subTypeId: 'eng10-u10-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nYou cannot remove any rare orchids from the national park. It is against conservation law.',
    options: [
      'A. Removing rare orchids from the national park is illegal, so you must not do it.',
      'B. You can remove rare orchids because conservation law allows it.',
      'C. Although removing orchids is legal, you should not do it.',
      'D. Conservation law encourages tourists to remove rare orchids from the park.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u10-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2a-w5',
    subjectId: 'english',
    topicId: 'eng10-t10',
    questionTypeId: 'eng10-skill-qt-u10-writing',
    subTypeId: 'eng10-u10-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nThe national park limits daily visitor numbers. This policy prevents trail erosion and protects endangered animals.',
    options: [
      'A. The national park limits daily visitor numbers in order to prevent trail erosion and protect endangered animals.',
      'B. The national park limits visitor numbers, but trails are completely eroded.',
      'C. Although visitor numbers are limited, endangered animals are not protected.',
      'D. Because the park protects endangered animals, it allows unlimited visitors every day.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u10-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  },

  // ==========================================
  // FINAL 2 - FORM B (Units 6–10)
  // ==========================================
  {
    id: 'eng10-exam-f2b-w1',
    subjectId: 'english',
    topicId: 'eng10-t9',
    questionTypeId: 'eng10-skill-qt-u9-writing',
    subTypeId: 'eng10-u9-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\n“We must reduce greenhouse gas emissions immediately,” said the scientist.',
    options: [
      'A. The scientist said that they had to reduce greenhouse gas emissions immediately.',
      'B. The scientist told that they must reduce greenhouse gas emissions yesterday.',
      'C. The scientist asked if they had reduced greenhouse gas emissions.',
      'D. The scientist said that they shouldn’t reduce greenhouse gas emissions.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u9-writing'],
    practiceRole: 'guided',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2b-w2',
    subjectId: 'english',
    topicId: 'eng10-t9',
    questionTypeId: 'eng10-skill-qt-u9-writing',
    subTypeId: 'eng10-u9-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\n“Do you support the ban on single-use plastic bags in our city?”, she asked Peter.',
    options: [
      'A. She asked Peter if he supported the ban on single-use plastic bags in their city.',
      'B. She asked Peter whether he did support the ban on single-use plastic bags in our city.',
      'C. She asked Peter what ban on single-use plastic bags he supported.',
      'D. She told Peter to support the ban on single-use plastic bags immediately.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u9-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2b-w3',
    subjectId: 'english',
    topicId: 'eng10-t10',
    questionTypeId: 'eng10-skill-qt-u10-writing',
    subTypeId: 'eng10-u10-writing-controlled',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that is closest in meaning to the following question.\n\nLocal residents do not have enough drinking water because mass tourism depletes the water table.',
    options: [
      'A. If mass tourism didn’t deplete the water table, local residents would have enough drinking water.',
      'B. If mass tourism depletes the water table, local residents had enough water.',
      'C. Unless local residents have water, mass tourism wouldn’t deplete it.',
      'D. If local residents didn’t have drinking water, mass tourism would stop.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u10-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2b-w4',
    subjectId: 'english',
    topicId: 'eng10-t10',
    questionTypeId: 'eng10-skill-qt-u10-writing',
    subTypeId: 'eng10-u10-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nTravellers choose genuine ecotours. They directly support indigenous communities and biodiversity conservation.',
    options: [
      'A. When travellers choose genuine ecotours, they directly support indigenous communities and biodiversity conservation.',
      'B. Travellers support indigenous communities, yet they avoid genuine ecotours.',
      'C. Unless travellers choose ecotours, biodiversity conservation will definitely succeed.',
      'D. Although travellers support local communities, ecotours harm the environment.'
    ],
    correctAnswer: 'A',
    difficulty: 'medium',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u10-writing'],
    practiceRole: 'near_transfer',
    representationType: 'text'
  },
  {
    id: 'eng10-exam-f2b-w5',
    subjectId: 'english',
    topicId: 'eng10-t6',
    questionTypeId: 'eng10-skill-qt-u6-writing',
    subTypeId: 'eng10-u6-writing-guided',
    content: 'Mark the letter A, B, C, or D to indicate the sentence that best combines the pair of sentences.\n\nCorporations must ensure pay transparency. Men and women doing equal work will receive equal wages.',
    options: [
      'A. Corporations must ensure pay transparency so that men and women doing equal work receive equal wages.',
      'B. Corporations ensure pay transparency, but equal wages are strictly prohibited.',
      'C. Although corporations ensure pay transparency, men receive higher wages.',
      'D. Men and women receive equal wages because corporations hide pay data.'
    ],
    correctAnswer: 'A',
    difficulty: 'hard',
    responseType: 'single_choice',
    validatorType: 'choice',
    sourceType: 'mock_exam',
    competency: 'english_writing',
    cognitiveLevel: 'application',
    outcomeIds: ['eng10-lo-u6-writing'],
    practiceRole: 'far_transfer',
    representationType: 'text'
  }
];

export const g10EnglishAssessmentWritingSolutions: Solution[] = [
  // M1A
  {
    id: 'eng10-exam-sol-m1a-w1',
    questionId: 'eng10-exam-m1a-w1',
    recognition: 'Câu bị động ở thì hiện tại đơn: S + V(s/es) + O -> O + is/are + V3/ed + (by S).',
    detailedSteps: [
      { order: 1, title: 'Xác định cấu trúc câu gốc', explanation: 'Câu gốc dùng thì hiện tại đơn "does the heavy lifting" chỉ thói quen trong gia đình.' },
      { order: 2, title: 'Chuyển sang thể bị động', explanation: '"the heavy lifting" là danh từ số ít/không đếm được, dùng "is usually done by my father". Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Nhầm thì hiện tại đơn sang quá khứ đơn (C) hoặc tương lai đơn (D).'],
    reviewSuggestions: ['Ôn lại câu bị động thì hiện tại đơn Unit 1.']
  },
  {
    id: 'eng10-exam-sol-m1a-w2',
    questionId: 'eng10-exam-m1a-w2',
    recognition: 'Diễn tả kế hoạch, quyết định đã có từ trước: have decided to V -> be going to V.',
    detailedSteps: [
      { order: 1, title: 'Phân tích nghĩa và mục đích', explanation: '"have decided to clean up" diễn tả dự định đã quyết định trước thời điểm nói.' },
      { order: 2, title: 'Chọn cấu trúc tương đương', explanation: 'Cấu trúc "be going to V" chỉ kế hoạch tương lai có chủ đích. Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm be going to với thói quen quá khứ used to (D).'],
    reviewSuggestions: ['Ôn thì tương lai gần be going to Unit 2.']
  },
  {
    id: 'eng10-exam-sol-m1a-w3',
    questionId: 'eng10-exam-m1a-w3',
    recognition: 'Cấu trúc It is essential/necessary for sb to V tương đương sb need to V / sb must V.',
    detailedSteps: [
      { order: 1, title: 'Phân tích tính từ chỉ sự cần thiết', explanation: '"It is essential for sb to V" có nghĩa là điều gì rất cần thiết đối với ai.' },
      { order: 2, title: 'Chuyển đổi tương đương', explanation: '"Young musicians need to practise their instruments every day." bảo toàn đúng ngữ nghĩa. Chọn C.' }
    ],
    finalAnswer: 'C',
    commonMistakes: ['Nhầm essential (cần thiết) với avoid (tránh) hoặc may (có thể).'],
    reviewSuggestions: ['Ôn tập động từ khuyết thiếu và cấu trúc to-infinitive Unit 3.']
  },
  {
    id: 'eng10-exam-sol-m1a-w4',
    questionId: 'eng10-exam-m1a-w4',
    recognition: 'Nối câu chỉ mục đích: in order to V / so as to V / so that + mệnh đề.',
    detailedSteps: [
      { order: 1, title: 'Xác định mối quan hệ giữa 2 mệnh đề', explanation: 'Câu 1 là hành động (tắt đèn không cần thiết), câu 2 là mục đích (muốn giảm tiêu thụ điện).' },
      { order: 2, title: 'Chọn từ nối chỉ mục đích', explanation: '"in order to reduce electricity consumption" diễn đạt mục đích chuẩn ngữ pháp. Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ nhưng (but) hoặc nhượng bộ (although) làm đảo lộn nghĩa câu.'],
    reviewSuggestions: ['Ôn cụm từ chỉ mục đích in order to Unit 2.']
  },
  {
    id: 'eng10-exam-sol-m1a-w5',
    questionId: 'eng10-exam-m1a-w5',
    recognition: 'Nối câu chỉ sự tương phản / nhượng bộ: Although + S + V, S + V.',
    detailedSteps: [
      { order: 1, title: 'Xác định tính tương phản', explanation: 'Vé rất đắt (vế 1) nhưng nhiều học sinh vẫn mua ủng hộ ban nhạc (vế 2).' },
      { order: 2, title: 'Kiểm tra liên từ', explanation: '"Although + mệnh đề" là cấu trúc chính xác. Phương án D sai ngữ pháp vì sau despite phải là N/V-ing, không đi kèm mệnh đề có S + V. Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Dùng despite + clause có S + V (D là lỗi sai ngữ pháp điển hình).'],
    reviewSuggestions: ['Ôn mệnh đề trạng ngữ chỉ sự nhượng bộ although/despite Unit 3.']
  },

  // M1B
  {
    id: 'eng10-exam-sol-m1b-w1',
    questionId: 'eng10-exam-m1b-w1',
    recognition: 'Câu bị động thì hiện tại đơn với tân ngữ chỉ món ăn/thời điểm: S + V(s/es) + O -> O + is/are + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định chủ ngữ và động từ', explanation: '"My mother prepares breakfast..." ở thì hiện tại đơn.' },
      { order: 2, title: 'Chuyển thể', explanation: '"Breakfast is prepared by my mother for the entire family every morning." Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Chọn câu sai thì quá khứ (A) hoặc tương lai (C).'],
    reviewSuggestions: ['Ôn câu bị động hiện tại đơn Unit 1.']
  },
  {
    id: 'eng10-exam-sol-m1b-w2',
    questionId: 'eng10-exam-m1b-w2',
    recognition: 'Câu bị động với động từ khuyết thiếu should: should + V -> should be + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định modal verb', explanation: 'Câu gốc dùng "should sort".' },
      { order: 2, title: 'Chuyển bị động', explanation: '"Household waste should be sorted before being put into bins." Chọn C.' }
    ],
    finalAnswer: 'C',
    commonMistakes: ['Bỏ sót trợ động từ be hoặc đổi sang câu phủ định shouldn’t.'],
    reviewSuggestions: ['Ôn câu bị động với modal verbs Unit 2.']
  },
  {
    id: 'eng10-exam-sol-m1b-w3',
    questionId: 'eng10-exam-m1b-w3',
    recognition: 'Diễn tả kế hoạch dự định: plan to V tương đương be going to V.',
    detailedSteps: [
      { order: 1, title: 'Phân tích cụm plan to V', explanation: '"She plans to participate..." = cô ấy dự định tham gia.' },
      { order: 2, title: 'Cấu trúc tương đương', explanation: '"is going to take part in" tương đương cả về ngữ pháp và nghĩa. Chọn D.' }
    ],
    finalAnswer: 'D',
    commonMistakes: ['Nhầm với refuse (từ chối) hoặc won (đã thắng).'],
    reviewSuggestions: ['Ôn cấu trúc be going to và cụm take part in Unit 3.']
  },
  {
    id: 'eng10-exam-sol-m1b-w4',
    questionId: 'eng10-exam-m1b-w4',
    recognition: 'Nối câu bằng giới từ By + V-ing chỉ phương thức/cách thức dẫn đến kết quả tích cực.',
    detailedSteps: [
      { order: 1, title: 'Xác định cách thức và kết quả', explanation: 'Chia sẻ việc nhà (cách thức) -> tạo dựng mối quan hệ khăng khít (kết quả).' },
      { order: 2, title: 'Cấu trúc By + V-ing', explanation: '"By sharing domestic chores, family members build strong and positive relationships." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Chọn câu dùng liên từ yet làm sai lệch hoàn toàn ngữ cảnh đoàn kết gia đình.'],
    reviewSuggestions: ['Ôn kỹ năng nối câu chỉ phương thức Unit 1.']
  },
  {
    id: 'eng10-exam-sol-m1b-w5',
    questionId: 'eng10-exam-m1b-w5',
    recognition: 'Nối câu chỉ sự đối lập giữa tính tiện lợi và tác hại môi trường: Although + clause.',
    detailedSteps: [
      { order: 1, title: 'Xác định sự tương phản', explanation: 'Chai nhựa tiện lợi nhưng lại mất hàng trăm năm để phân hủy.' },
      { order: 2, title: 'Chọn liên từ phù hợp', explanation: '"Although plastic bottles are convenient to use, they take hundreds of years to decompose in landfills." Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm liên từ nguyên nhân because hoặc so.'],
    reviewSuggestions: ['Ôn mệnh đề trạng ngữ chỉ sự tương phản Unit 2.']
  },

  // F1A
  {
    id: 'eng10-exam-sol-f1a-w1',
    questionId: 'eng10-exam-f1a-w1',
    recognition: 'Chuyển đổi giữa thì Quá khứ đơn (started/began to V ... ago) và Hiện tại hoàn thành (have/has V3/ed for ...).',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng mốc thời gian', explanation: '"started volunteering ... three years ago" = bắt đầu làm tình nguyện 3 năm trước và vẫn đang tiếp tục.' },
      { order: 2, title: 'Chuyển sang hiện tại hoàn thành', explanation: '"has volunteered ... for three years". Chọn C.' }
    ],
    finalAnswer: 'C',
    commonMistakes: ['Chọn câu phủ định hasn’t volunteered làm ngược nghĩa câu gốc.'],
    reviewSuggestions: ['Ôn chuyển đổi Quá khứ đơn - Hiện tại hoàn thành Unit 4.']
  },
  {
    id: 'eng10-exam-sol-f1a-w2',
    questionId: 'eng10-exam-f1a-w2',
    recognition: 'Câu bị động thì hiện tại hoàn thành: have/has + V3/ed -> have/has been + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định tân ngữ', explanation: 'Tân ngữ là "a smartphone app that monitors air quality in cities" (danh từ số ít).' },
      { order: 2, title: 'Chia động từ bị động', explanation: 'Dùng "has been developed by scientists". Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Bỏ từ been trong câu bị động hiện tại hoàn thành.'],
    reviewSuggestions: ['Ôn câu bị động hiện tại hoàn thành Unit 5.']
  },
  {
    id: 'eng10-exam-sol-f1a-w3',
    questionId: 'eng10-exam-f1a-w3',
    recognition: 'It is forbidden to V tương đương modal verb cấm đoán: mustn’t + V.',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng từ chỉ điều cấm', explanation: '"It is forbidden for visitors to take photographs" = Du khách bị cấm chụp ảnh.' },
      { order: 2, title: 'Động từ khuyết thiếu tương đương', explanation: '"mustn’t take photographs" diễn đạt sự cấm đoán tuyệt đối. Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm cấm đoán (mustn’t) với không cần thiết (don’t have to) hoặc có thể (may).'],
    reviewSuggestions: ['Ôn modal verbs cấm đoán và cho phép Unit 3.']
  },
  {
    id: 'eng10-exam-sol-f1a-w4',
    questionId: 'eng10-exam-f1a-w4',
    recognition: 'Hành động đang diễn ra (Past Continuous) thì hành động khác xen vào (Past Simple) với liên từ While / When.',
    detailedSteps: [
      { order: 1, title: 'Xác định hành động đang xảy ra và hành động xen vào', explanation: 'Học sinh đang dọn sân trường (đang xảy ra) thì trời mưa to (xen vào).' },
      { order: 2, title: 'Cấu trúc liên từ While', explanation: '"While + S + was/were V-ing, S + V2/ed". Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ chỉ mục đích so that hoặc nguyên nhân because.'],
    reviewSuggestions: ['Ôn phối hợp thì quá khứ đơn và quá khứ tiếp diễn với When/While Unit 4.']
  },
  {
    id: 'eng10-exam-sol-f1a-w5',
    questionId: 'eng10-exam-f1a-w5',
    recognition: 'Dùng đại từ quan hệ thay thế cho cả mệnh đề phía trước: , which + V.',
    detailedSteps: [
      { order: 1, title: 'Phân tích quan hệ giữa hai vế', explanation: 'Việc phần mềm AI xử lý hình ảnh nhanh chóng đem lại lợi ích là giúp bác sĩ phát hiện bệnh sớm.' },
      { order: 2, title: 'Dùng mệnh đề quan hệ không xác định', explanation: 'Dấu phẩy + "which helps doctors detect illnesses early" thay thế cho toàn bộ sự việc ở vế trước. Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Chọn câu dùng liên từ nhượng bộ although hoặc nguyên nhân làm lệch nghĩa.'],
    reviewSuggestions: ['Ôn mệnh đề quan hệ Unit 5.']
  },

  // F1B
  {
    id: 'eng10-exam-sol-f1b-w1',
    questionId: 'eng10-exam-f1b-w1',
    recognition: 'Chuyển đổi S + last + V2/ed in/at + time -> S + haven’t/hasn’t + V3/ed since + time.',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng cấu trúc last V-ed', explanation: '"She last visited the nursing home in December" = Lần cuối cô ấy đến thăm là vào tháng 12.' },
      { order: 2, title: 'Chuyển đổi sang phủ định hiện tại hoàn thành', explanation: '"She hasn’t visited the nursing home since December." Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Chọn câu khẳng định has visited làm đảo ngược hoàn toàn sự thật.'],
    reviewSuggestions: ['Ôn chuyển đổi câu với last và since/for Unit 4.']
  },
  {
    id: 'eng10-exam-sol-f1b-w2',
    questionId: 'eng10-exam-f1b-w2',
    recognition: 'Câu bị động thì quá khứ đơn: S + V2/ed + O -> O + was/were + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định chủ ngữ và động từ quá khứ', explanation: '"Engineers designed 3D printers..." ở thì quá khứ đơn.' },
      { order: 2, title: 'Chuyển sang bị động', explanation: '"3D printers were designed by engineers to produce low-cost prosthetic limbs." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Nhầm thì quá khứ với thì tương lai gần are going to design.'],
    reviewSuggestions: ['Ôn câu bị động quá khứ đơn Unit 5.']
  },
  {
    id: 'eng10-exam-sol-f1b-w3',
    questionId: 'eng10-exam-f1b-w3',
    recognition: 'It is not necessary for sb to V tương đương sb don’t/doesn’t need to V hoặc don’t have to V.',
    detailedSteps: [
      { order: 1, title: 'Phân tích tính không bắt buộc', explanation: '"It is not necessary" = Không cần thiết, không bắt buộc.' },
      { order: 2, title: 'Chọn cấu trúc tương đương', explanation: '"Students don’t need to print their assignments on paper." Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm không cần thiết (don’t need to) với cấm (are forbidden).'],
    reviewSuggestions: ['Ôn modal verbs chỉ sự cần thiết Unit 2.']
  },
  {
    id: 'eng10-exam-sol-f1b-w4',
    questionId: 'eng10-exam-f1b-w4',
    recognition: 'Nối câu bằng liên từ When kết hợp Quá khứ tiếp diễn và Quá khứ đơn.',
    detailedSteps: [
      { order: 1, title: 'Xác định hành động nền và hành động xen vào', explanation: 'Lan đang dạy tiếng Anh (nền - Past Continuous) thì điện thoại reo (xen vào - Past Simple).' },
      { order: 2, title: 'Chọn câu nối đúng', explanation: '"Lan was teaching English when her phone rang unexpectedly." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ chỉ kết quả so that hoặc nguyên nhân because.'],
    reviewSuggestions: ['Ôn phối hợp thì quá khứ đơn và tiếp diễn Unit 4.']
  },
  {
    id: 'eng10-exam-sol-f1b-w5',
    questionId: 'eng10-exam-f1b-w5',
    recognition: 'Nối câu bằng đại từ quan hệ which thay thế cho danh từ chỉ vật.',
    detailedSteps: [
      { order: 1, title: 'Xác định thành phần lặp lại', explanation: '"a solar water filter" và "His filter" đều chỉ chiếc máy lọc nước năng lượng mặt trời.' },
      { order: 2, title: 'Thay thế bằng đại từ quan hệ which', explanation: '"The young inventor created a solar water filter which won the national science prize." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng sai đại từ quan hệ who cho đồ vật.'],
    reviewSuggestions: ['Ôn đại từ quan hệ defining Unit 5.']
  },

  // M2A
  {
    id: 'eng10-exam-sol-m2a-w1',
    questionId: 'eng10-exam-m2a-w1',
    recognition: 'Câu bị động với động từ khuyết thiếu must: must + V -> must be + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định tân ngữ và modal verb', explanation: 'Tân ngữ "Equal job opportunities", modal verb "must".' },
      { order: 2, title: 'Chuyển sang bị động', explanation: '"Equal job opportunities must be provided for both men and women by governments." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Bỏ từ be hoặc đổi must thành cannot.'],
    reviewSuggestions: ['Ôn câu bị động với modal verbs Unit 6.']
  },
  {
    id: 'eng10-exam-sol-m2a-w2',
    questionId: 'eng10-exam-m2a-w2',
    recognition: 'Chuyển đổi câu so sánh hơn (faster than) sang so sánh không bằng (not as/so fast as).',
    detailedSteps: [
      { order: 1, title: 'Phân tích quan hệ so sánh', explanation: 'Kinh tế Việt Nam tăng trưởng nhanh hơn nhiều nền kinh tế khác trong khu vực.' },
      { order: 2, title: 'Chuyển sang câu so sánh bằng thể phủ định', explanation: 'Nhiều nền kinh tế khác trong khu vực không tăng trưởng nhanh bằng kinh tế Việt Nam. Chọn C.' }
    ],
    finalAnswer: 'C',
    commonMistakes: ['Chọn câu B làm đảo ngược chủ ngữ, biến kinh tế Việt Nam thành kém hơn.'],
    reviewSuggestions: ['Ôn so sánh hơn và so sánh bằng Unit 7.']
  },
  {
    id: 'eng10-exam-sol-m2a-w3',
    questionId: 'eng10-exam-m2a-w3',
    recognition: 'Cấu trúc be not permitted to V tương đương mustn’t + V (cấm đoán).',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng ý nghĩa cấm đoán', explanation: '"are not permitted to use" = không được phép sử dụng.' },
      { order: 2, title: 'Modal verb tương đương', explanation: '"mustn’t use mobile phones during examination hours." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Nhầm cấm đoán (mustn’t) với không phải làm (don’t have to).'],
    reviewSuggestions: ['Ôn modal verbs cấm đoán Unit 8.']
  },
  {
    id: 'eng10-exam-sol-m2a-w4',
    questionId: 'eng10-exam-m2a-w4',
    recognition: 'Nối câu bằng liên từ chỉ sự tương phản / nhượng bộ: Although + S + V, S + V.',
    detailedSteps: [
      { order: 1, title: 'Xác định sự đối lập', explanation: 'Phụ nữ gặp phân biệt tiền lương nhưng vẫn tiếp tục đạt thành tựu xuất sắc.' },
      { order: 2, title: 'Kiểm tra liên từ', explanation: '"Although women face wage discrimination in some companies, they continue to achieve outstanding professional results." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng despite với mệnh đề có S + V (D là lỗi sai ngữ pháp).'],
    reviewSuggestions: ['Ôn mệnh đề nhượng bộ although/despite Unit 6.']
  },
  {
    id: 'eng10-exam-sol-m2a-w5',
    questionId: 'eng10-exam-m2a-w5',
    recognition: 'Nối câu bằng đại từ quan hệ sở hữu whose thay cho tính từ sở hữu Her.',
    detailedSteps: [
      { order: 1, title: 'Xác định quan hệ sở hữu', explanation: '"a technology expert" và "Her online learning platform" -> dùng whose.' },
      { order: 2, title: 'Tạo mệnh đề quan hệ', explanation: '"We interviewed a technology expert whose online learning platform has helped thousands of students." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Giữ lại tính từ sở hữu her sau khi đã dùng đại từ quan hệ (B là lỗi thừa từ).'],
    reviewSuggestions: ['Ôn đại từ quan hệ sở hữu whose Unit 8.']
  },

  // M2B
  {
    id: 'eng10-exam-sol-m2b-w1',
    questionId: 'eng10-exam-m2b-w1',
    recognition: 'Câu bị động với động từ khuyết thiếu should: should + V -> should be + V3/ed.',
    detailedSteps: [
      { order: 1, title: 'Xác định tân ngữ', explanation: '"female students" là tân ngữ được đưa lên làm chủ ngữ mới.' },
      { order: 2, title: 'Chuyển sang bị động', explanation: '"Female students should be encouraged to join STEM clubs by schools." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Đổi should thành must avoid hoặc discouraged.'],
    reviewSuggestions: ['Ôn câu bị động với modal verbs Unit 6.']
  },
  {
    id: 'eng10-exam-sol-m2b-w2',
    questionId: 'eng10-exam-m2b-w2',
    recognition: 'Chuyển đổi câu so sánh không ai/không nước nào hơn (No ... is more ... than X) sang so sánh nhất (X is the most ...).',
    detailedSteps: [
      { order: 1, title: 'Phân tích câu gốc', explanation: 'Không quốc gia thành viên nào cam kết tăng trưởng xanh hơn Việt Nam.' },
      { order: 2, title: 'Chuyển sang so sánh nhất', explanation: 'Việt Nam là quốc gia thành viên cam kết tăng trưởng xanh nhất (the most committed member country). Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm the most (nhất) với the least (ít nhất).'],
    reviewSuggestions: ['Ôn so sánh nhất tính từ dài Unit 7.']
  },
  {
    id: 'eng10-exam-sol-m2b-w3',
    questionId: 'eng10-exam-m2b-w3',
    recognition: 'It is obligatory for sb to V tương đương sb must + V (bắt buộc).',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng tính bắt buộc', explanation: '"It is obligatory" = Bắt buộc phải thực hiện.' },
      { order: 2, title: 'Động từ khuyết thiếu tương đương', explanation: '"Students must submit their online projects by Friday midnight." Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Nhầm bắt buộc (must) với có thể (may) hoặc không cần (don’t need to).'],
    reviewSuggestions: ['Ôn modal verbs bắt buộc must Unit 8.']
  },
  {
    id: 'eng10-exam-sol-m2b-w4',
    questionId: 'eng10-exam-m2b-w4',
    recognition: 'Nối câu bằng liên từ thời gian Since (từ khi): Since + Quá khứ đơn, Hiện tại hoàn thành.',
    detailedSteps: [
      { order: 1, title: 'Xác định mốc thời gian và kết quả kéo dài', explanation: 'Việt Nam gia nhập WTO (quá khứ) -> từ đó thu hút nhiều đầu tư nước ngoài (kéo dài đến hiện tại).' },
      { order: 2, title: 'Chọn liên từ Since', explanation: '"Since Viet Nam joined the World Trade Organisation, it has attracted significant foreign direct investment." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ nhưng (but) hoặc nhượng bộ (although) làm mất tính nhân quả thời gian.'],
    reviewSuggestions: ['Ôn liên từ Since và thì hiện tại hoàn thành Unit 7.']
  },
  {
    id: 'eng10-exam-sol-m2b-w5',
    questionId: 'eng10-exam-m2b-w5',
    recognition: 'Nối câu bằng đại từ quan hệ which thay thế cho danh từ chỉ sự vật số nhiều.',
    detailedSteps: [
      { order: 1, title: 'Xác định từ được thay thế', explanation: '"blended learning courses" và đại từ "They" ở câu 2.' },
      { order: 2, title: 'Thay thế bằng which', explanation: '"The school has introduced blended learning courses which combine face-to-face workshops with digital modules." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng sai đại từ quan hệ who cho sự vật (C).'],
    reviewSuggestions: ['Ôn đại từ quan hệ Unit 8.']
  },

  // F2A
  {
    id: 'eng10-exam-sol-f2a-w1',
    questionId: 'eng10-exam-f2a-w1',
    recognition: 'Chuyển đổi câu trực tiếp sang gián tiếp (Reported speech: Statements): lùi thì và đổi trạng từ thời gian.',
    detailedSteps: [
      { order: 1, title: 'Lùi thì', explanation: '"are planting" (hiện tại tiếp diễn) lùi thì thành "were planting" (quá khứ tiếp diễn).' },
      { order: 2, title: 'Đổi trạng từ', explanation: '"today" đổi thành "that day". Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Quên đổi trạng từ today thành that day (B) hoặc quên lùi thì (C).'],
    reviewSuggestions: ['Ôn quy tắc lùi thì và đổi trạng từ trong câu tường thuật Unit 9.']
  },
  {
    id: 'eng10-exam-sol-f2a-w2',
    questionId: 'eng10-exam-f2a-w2',
    recognition: 'Câu tường thuật Wh-question: asked + (sb) + wh-word + S + V (không đảo ngữ).',
    detailedSteps: [
      { order: 1, title: 'Trật tự từ trong câu hỏi gián tiếp', explanation: 'Sau từ để hỏi "what", trật tự từ phải là S + V: "what I was going to do".' },
      { order: 2, title: 'Loại trừ phương án đảo ngữ', explanation: 'Phương án A đảo was lên trước I là sai. Chọn B.' }
    ],
    finalAnswer: 'B',
    commonMistakes: ['Giữ nguyên trật tự đảo ngữ câu hỏi was I (A là lỗi sai phổ biến nhất).'],
    reviewSuggestions: ['Ôn câu tường thuật dạng câu hỏi có từ để hỏi Wh-question Unit 9.']
  },
  {
    id: 'eng10-exam-sol-f2a-w3',
    questionId: 'eng10-exam-f2a-w3',
    recognition: 'Viết lại câu bằng câu điều kiện loại 2 giả định trái ngược với thực tế ở hiện tại.',
    detailedSteps: [
      { order: 1, title: 'Phân tích thực tế ở hiện tại', explanation: 'Thực tế: Khách du lịch vứt rác, hệ sinh thái bị tổn hại.' },
      { order: 2, title: 'Giả định điều kiện loại 2', explanation: 'Mệnh đề If: Quá khứ đơn (didn’t throw); Mệnh đề chính: wouldn’t be damaged. Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Nhầm điều kiện loại 1 (B) hoặc chia sai thì ở mệnh đề chính (D).'],
    reviewSuggestions: ['Ôn câu điều kiện loại 2 Unit 10.']
  },
  {
    id: 'eng10-exam-sol-f2a-w4',
    questionId: 'eng10-exam-f2a-w4',
    recognition: 'Kết hợp hai câu diễn đạt sự cấm đoán và lý do pháp luật.',
    detailedSteps: [
      { order: 1, title: 'Phân tích bản chất quy định', explanation: 'Hành vi hái phong lan quý là trái pháp luật (illegal) -> bạn không được phép làm (must not do it).' },
      { order: 2, title: 'Chọn câu kết hợp sát nghĩa nhất', explanation: '"Removing rare orchids from the national park is illegal, so you must not do it." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Chọn câu đảo lộn nghĩa nói rằng pháp luật cho phép hái lan (B, D).'],
    reviewSuggestions: ['Ôn kỹ năng kết hợp câu chỉ kết quả và nguyên nhân Unit 10.']
  },
  {
    id: 'eng10-exam-sol-f2a-w5',
    questionId: 'eng10-exam-f2a-w5',
    recognition: 'Nối câu chỉ mục đích bằng in order to + V.',
    detailedSteps: [
      { order: 1, title: 'Xác định hành động và mục đích', explanation: 'Hành động: Giới hạn lượng khách tham quan mỗi ngày. Mục đích: Ngăn chặn xói mòn đường mòn và bảo vệ động vật nguy cấp.' },
      { order: 2, title: 'Dùng cụm chỉ mục đích in order to', explanation: '"The national park limits daily visitor numbers in order to prevent trail erosion and protect endangered animals." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ tương phản but hoặc although làm sai logic.'],
    reviewSuggestions: ['Ôn cụm từ chỉ mục đích in order to / so as to Unit 10.']
  },

  // F2B
  {
    id: 'eng10-exam-sol-f2b-w1',
    questionId: 'eng10-exam-f2b-w1',
    recognition: 'Câu tường thuật: modal verb must chuyển thành had to khi chỉ sự bắt buộc trong quá khứ.',
    detailedSteps: [
      { order: 1, title: 'Lùi modal verb', explanation: '"must reduce" lùi thì thành "had to reduce".' },
      { order: 2, title: 'Đổi trạng từ', explanation: 'Đảm bảo nội dung truyền đạt chính xác phát ngôn của nhà khoa học. Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng told mà không có tân ngữ chỉ người nghe (B).'],
    reviewSuggestions: ['Ôn câu tường thuật với modal verbs Unit 9.']
  },
  {
    id: 'eng10-exam-sol-f2b-w2',
    questionId: 'eng10-exam-f2b-w2',
    recognition: 'Câu tường thuật Yes/No question: asked + sb + if/whether + S + V (lùi thì).',
    detailedSteps: [
      { order: 1, title: 'Nhận dạng câu hỏi Yes/No', explanation: '"Do you support...?" là câu hỏi Yes/No.' },
      { order: 2, title: 'Chuyển gián tiếp', explanation: 'Dùng "if he supported...", đổi tính từ sở hữu "our city" -> "their city". Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Giữ nguyên trợ động từ did support (B) hoặc quên đổi our thành their.'],
    reviewSuggestions: ['Ôn câu tường thuật Yes/No question Unit 9.']
  },
  {
    id: 'eng10-exam-sol-f2b-w3',
    questionId: 'eng10-exam-f2b-w3',
    recognition: 'Viết lại câu dùng câu điều kiện loại 2 giả định trái ngược với hiện tại.',
    detailedSteps: [
      { order: 1, title: 'Phân tích tình huống hiện tại', explanation: 'Thực tế: Du lịch đại trà làm cạn kiệt nguồn nước -> người dân không có đủ nước uống.' },
      { order: 2, title: 'Viết câu điều kiện loại 2', explanation: '"If mass tourism didn’t deplete the water table, local residents would have enough drinking water." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Chia sai thì ở mệnh đề If hoặc mệnh đề chính.'],
    reviewSuggestions: ['Ôn câu điều kiện loại 2 Unit 10.']
  },
  {
    id: 'eng10-exam-sol-f2b-w4',
    questionId: 'eng10-exam-f2b-w4',
    recognition: 'Nối câu bằng liên từ thời gian / điều kiện When chỉ mối quan hệ nhân quả tích cực.',
    detailedSteps: [
      { order: 1, title: 'Xác định hành động và hệ quả', explanation: 'Khi du khách chọn tour sinh thái chuẩn (hành động) -> hỗ trợ trực tiếp cộng đồng bản địa và bảo tồn (hệ quả).' },
      { order: 2, title: 'Liên từ When', explanation: '"When travellers choose genuine ecotours, they directly support indigenous communities and biodiversity conservation." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ yet hoặc although làm biến nghĩa thành tương phản vô lý.'],
    reviewSuggestions: ['Ôn kỹ năng nối câu Unit 10.']
  },
  {
    id: 'eng10-exam-sol-f2b-w5',
    questionId: 'eng10-exam-f2b-w5',
    recognition: 'Nối câu chỉ mục đích bằng liên từ so that + mệnh đề.',
    detailedSteps: [
      { order: 1, title: 'Xác định giải pháp và mục tiêu', explanation: 'Giải pháp: Tập đoàn phải minh bạch tiền lương. Mục tiêu: Nam và nữ làm công việc như nhau nhận lương bằng nhau.' },
      { order: 2, title: 'Cấu trúc so that', explanation: '"Corporations must ensure pay transparency so that men and women doing equal work receive equal wages." Chọn A.' }
    ],
    finalAnswer: 'A',
    commonMistakes: ['Dùng liên từ tương phản but hoặc although làm hỏng ý nghĩa bình đẳng giới.'],
    reviewSuggestions: ['Ôn liên từ chỉ mục đích so that và chủ đề Gender Equality Unit 6.']
  }
];
