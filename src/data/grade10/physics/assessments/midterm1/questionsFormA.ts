import type { Question } from '@/types';

export const physicsMidterm1QuestionsFormA: Question[] = [
  {
    id: 'phy10-assess-mid1-a-q01', subjectId: 'physics', topicId: 'phy10-t0', questionTypeId: 'phy10-qt2',
    content: 'Đơn vị SI của gia tốc là', options: ['A. m', 'B. m/s', 'C. m/s²', 'D. N'],
    responseType: 'single_choice', difficulty: 'easy', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M0-O03'], competency: 'physical_cognition', cognitiveLevel: 'recognition', estimatedSeconds: 35
  },
  {
    id: 'phy10-assess-mid1-a-q02', subjectId: 'physics', topicId: 'phy10-t0', questionTypeId: 'phy10-qt2',
    content: 'Một thước có các vạch liên tiếp cách nhau 1 mm. Độ chia nhỏ nhất của thước là', options: ['A. 0,1 mm', 'B. 0,5 mm', 'C. 1 mm', 'D. 10 mm'],
    responseType: 'single_choice', difficulty: 'easy', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M0-O03'], competency: 'physical_cognition', cognitiveLevel: 'recognition', estimatedSeconds: 40
  },
  {
    id: 'phy10-assess-mid1-a-q03', subjectId: 'physics', topicId: 'phy10-t0', questionTypeId: 'phy10-qt4',
    content: 'Cân điện tử khi không đặt vật vẫn chỉ 2 g. Nếu không hiệu chỉnh, sai lệch này chủ yếu là', options: ['A. sai số ngẫu nhiên', 'B. sai số hệ thống', 'C. sai số do làm tròn', 'D. không phải sai số'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'B', acceptedAnswers: ['B', 'b'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M0-O05'], competency: 'physical_cognition', cognitiveLevel: 'understanding', estimatedSeconds: 55
  },
  {
    id: 'phy10-assess-mid1-a-q04', subjectId: 'physics', topicId: 'phy10-t0', questionTypeId: 'phy10-qt7',
    content: 'Biện pháp nào phù hợp nhất để giảm ảnh hưởng của sai số ngẫu nhiên khi đo thời gian?', options: ['A. Chỉ chọn lần đo nhỏ nhất', 'B. Đo lặp nhiều lần và lấy trung bình', 'C. Đổi đơn vị từ giây sang mili giây', 'D. Bỏ mọi kết quả khác nhau'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'B', acceptedAnswers: ['B', 'b'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M0-O08'], competency: 'physical_inquiry', cognitiveLevel: 'understanding', estimatedSeconds: 60
  },
  {
    id: 'phy10-assess-mid1-a-q05', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt8',
    content: 'Một hành khách ngồi yên trên ô tô đang chạy. Hành khách', options: ['A. đứng yên so với mặt đường', 'B. chuyển động so với ghế xe', 'C. đứng yên so với ô tô nhưng chuyển động so với mặt đường', 'D. đứng yên đối với mọi vật'],
    responseType: 'single_choice', difficulty: 'easy', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O01'], competency: 'physical_cognition', cognitiveLevel: 'understanding', estimatedSeconds: 45
  },
  {
    id: 'phy10-assess-mid1-a-q06', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt9',
    content: 'Trên trục Ox, vật đi thẳng từ x = 20 m đến x = −10 m, không đổi chiều. Quãng đường và độ dịch chuyển lần lượt là', options: ['A. 30 m và −30 m', 'B. −30 m và 30 m', 'C. 10 m và −10 m', 'D. 30 m và 30 m'],
    responseType: 'single_choice', difficulty: 'easy', sourceType: 'mock_exam', correctAnswer: 'A', acceptedAnswers: ['A', 'a'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O02'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 60
  },
  {
    id: 'phy10-assess-mid1-a-q07', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt10',
    content: 'Một xe đi 60 km trong 1 giờ, nghỉ 0,5 giờ rồi đi tiếp 40 km trong 1 giờ. Tốc độ trung bình của cả hành trình là', options: ['A. 40 km/h', 'B. 50 km/h', 'C. 60 km/h', 'D. 100 km/h'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'A', acceptedAnswers: ['A', 'a'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O03'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 80
  },
  {
    id: 'phy10-assess-mid1-a-q08', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt10',
    content: 'Trong hệ trục đã chọn, vận tốc của vật bằng −5 m/s. Phát biểu đúng là', options: ['A. Vật có tốc độ −5 m/s', 'B. Vật chuyển động theo chiều âm với tốc độ 5 m/s', 'C. Vật đang chậm dần', 'D. Gia tốc của vật âm'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'B', acceptedAnswers: ['B', 'b'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O03'], competency: 'physical_cognition', cognitiveLevel: 'understanding', estimatedSeconds: 55
  },
  {
    id: 'phy10-assess-mid1-a-q09', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt11',
    content: 'Hai ô tô chuyển động cùng chiều với tốc độ 20 m/s và 15 m/s. Độ lớn vận tốc của xe thứ nhất đối với xe thứ hai là', options: ['A. 5 m/s', 'B. 15 m/s', 'C. 20 m/s', 'D. 35 m/s'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'A', acceptedAnswers: ['A', 'a'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O04'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 65
  },
  {
    id: 'phy10-assess-mid1-a-q10', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt12',
    content: 'Vật chuyển động theo phương trình x = 2 + 3t (x tính bằng m, t bằng s). Vận tốc của vật là', options: ['A. 2 m/s', 'B. 3 m/s', 'C. 5 m/s', 'D. 6 m/s'],
    responseType: 'single_choice', difficulty: 'easy', sourceType: 'mock_exam', correctAnswer: 'B', acceptedAnswers: ['B', 'b'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O05'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 50
  },
  {
    id: 'phy10-assess-mid1-a-q11', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt13',
    content: 'Vận tốc của vật tăng từ −2 m/s lên 4 m/s trong 3 s. Gia tốc trung bình là', options: ['A. −2 m/s²', 'B. 0,67 m/s²', 'C. 2 m/s²', 'D. 6 m/s²'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O06'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 65
  },
  {
    id: 'phy10-assess-mid1-a-q12', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt14',
    content: 'Vật có v₀ = 5 m/s, gia tốc không đổi a = 2 m/s². Sau 4 s, vận tốc bằng', options: ['A. 7 m/s', 'B. 10 m/s', 'C. 13 m/s', 'D. 18 m/s'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O07'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 60
  },
  {
    id: 'phy10-assess-mid1-a-q13', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt14',
    content: 'Vật xuất phát từ nghỉ, chuyển động thẳng nhanh dần đều với a = 3 m/s² trong 4 s. Độ dịch chuyển là', options: ['A. 6 m', 'B. 12 m', 'C. 24 m', 'D. 48 m'],
    responseType: 'single_choice', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O07'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 75
  },
  {
    id: 'phy10-assess-mid1-a-q14', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt15',
    content: 'Trên đồ thị v–t, vận tốc tăng đều từ 2 m/s tại t = 0 đến 6 m/s tại t = 4 s. Độ dịch chuyển trong 4 s là', options: ['A. 8 m', 'B. 12 m', 'C. 16 m', 'D. 24 m'],
    responseType: 'single_choice', difficulty: 'hard', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O08'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 90
  },
  {
    id: 'phy10-assess-mid1-a-q15', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt14',
    content: 'Vật có phương trình vận tốc v = 6 − 2t (m/s). Thời điểm vật đổi chiều là', options: ['A. 2 s', 'B. 3 s', 'C. 4 s', 'D. 6 s'],
    responseType: 'single_choice', difficulty: 'hard', sourceType: 'mock_exam', correctAnswer: 'B', acceptedAnswers: ['B', 'b'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O07'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 90
  },
  {
    id: 'phy10-assess-mid1-a-q16', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt12',
    stimulus: { id: 'phy10-mid1-a-x-t', title: 'Bảng tọa độ–thời gian', dataTable: { caption: 'Dữ liệu chuyển động', columns: [{ key: 't', label: 't (s)' }, { key: 'x', label: 'x (m)' }], rows: [{ t: 0, x: 1 }, { t: 2, x: 5 }, { t: 4, x: 5 }] } },
    content: 'Kết luận phù hợp nhất với bảng dữ liệu là', options: ['A. Vật đứng yên từ 0 đến 2 s', 'B. Vật chuyển động đều trong cả 4 s', 'C. Vật đứng yên từ 2 đến 4 s', 'D. Vật đổi chiều tại t = 2 s'],
    responseType: 'single_choice', difficulty: 'hard', sourceType: 'mock_exam', correctAnswer: 'C', acceptedAnswers: ['C', 'c'], validatorType: 'choice', points: 0.25,
    outcomeIds: ['PHY10-M1-O05', 'PHY10-M1-O08'], competency: 'physical_inquiry', cognitiveLevel: 'application', estimatedSeconds: 100
  },
  {
    id: 'phy10-assess-mid1-a-q17', subjectId: 'physics', topicId: 'phy10-t0', questionTypeId: 'phy10-qt7',
    content: 'Chọn Đúng hoặc Sai cho từng phát biểu về phép đo.', responseType: 'true_false_cluster', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: 'a:Đ|b:S|c:Đ|d:S', validatorType: 'exact', points: 1,
    answerSchema: { type: 'true-false-cluster', proofImageRequired: false, autoCheckMode: 'exact', scoringMode: 'per_field', fieldWeights: { a: 1, b: 1, c: 1, d: 1 }, fields: [
      { key: 'a', label: 'a) Đo lặp và lấy trung bình thường giúp giảm ảnh hưởng của sai số ngẫu nhiên.', valueType: 'choice', required: true },
      { key: 'b', label: 'b) Đổi đơn vị đo sẽ làm phép đo chính xác hơn.', valueType: 'choice', required: true },
      { key: 'c', label: 'c) Kết quả đo cần được ghi kèm đơn vị và độ không đảm bảo phù hợp.', valueType: 'choice', required: true },
      { key: 'd', label: 'd) Các số đo rất gần nhau chứng minh dụng cụ không có sai số hệ thống.', valueType: 'choice', required: true }
    ] },
    correctFinalAnswer: { a: 'Đ', b: 'S', c: 'Đ', d: 'S' }, outcomeIds: ['PHY10-M0-O05', 'PHY10-M0-O06', 'PHY10-M0-O08'], competency: 'physical_inquiry', cognitiveLevel: 'understanding', estimatedSeconds: 180
  },
  {
    id: 'phy10-assess-mid1-a-q18', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt15',
    content: 'Chọn Đúng hoặc Sai. Một vật chuyển động thẳng có v₀ = −4 m/s và a = −2 m/s².', responseType: 'true_false_cluster', difficulty: 'hard', sourceType: 'mock_exam', correctAnswer: 'a:Đ|b:Đ|c:S|d:Đ', validatorType: 'exact', points: 1,
    answerSchema: { type: 'true-false-cluster', proofImageRequired: false, autoCheckMode: 'exact', scoringMode: 'per_field', fieldWeights: { a: 1, b: 1, c: 1, d: 1 }, fields: [
      { key: 'a', label: 'a) Vật chuyển động theo chiều âm.', valueType: 'choice', required: true },
      { key: 'b', label: 'b) Tốc độ của vật tăng theo thời gian.', valueType: 'choice', required: true },
      { key: 'c', label: 'c) Sau 3 s, vận tốc của vật là 2 m/s.', valueType: 'choice', required: true },
      { key: 'd', label: 'd) Độ dịch chuyển trong 3 s là −21 m.', valueType: 'choice', required: true }
    ] },
    correctFinalAnswer: { a: 'Đ', b: 'Đ', c: 'S', d: 'Đ' }, outcomeIds: ['PHY10-M1-O06', 'PHY10-M1-O07', 'PHY10-M1-O08'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 210
  },
  {
    id: 'phy10-assess-mid1-a-q19', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt10',
    content: 'Một vật đi từ x = 10 m đến x = −14 m trong 4 s. Tính vận tốc trung bình, đơn vị m/s.', responseType: 'short_answer', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: '-6', acceptedAnswers: ['-6', '-6 m/s', '-6,0'], validatorType: 'number', points: 2,
    outcomeIds: ['PHY10-M1-O02', 'PHY10-M1-O03'], competency: 'physical_cognition', cognitiveLevel: 'application', estimatedSeconds: 90
  },
  {
    id: 'phy10-assess-mid1-a-q20', subjectId: 'physics', topicId: 'phy10-t1', questionTypeId: 'phy10-qt14',
    content: 'Vật có v₀ = 2 m/s, a = 3 m/s². Tính độ dịch chuyển sau 4 s, đơn vị mét.', responseType: 'short_answer', difficulty: 'medium', sourceType: 'mock_exam', correctAnswer: '32', acceptedAnswers: ['32', '32 m', '32,0'], validatorType: 'number', points: 2,
    outcomeIds: ['PHY10-M1-O07'], competency: 'physical_application', cognitiveLevel: 'application', estimatedSeconds: 100
  }
];
