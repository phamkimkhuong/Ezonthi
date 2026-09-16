export interface MobileQuestion {
  id: string;
  subjectId: string;
  topicId: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  recognition?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const QUESTION_BANK: Record<string, MobileQuestion[]> = {
  // ========================== TOÁN HỌC 9 (ÔN THI VÀO 10) ==========================
  'math9-t1': [
    {
      id: 'math9-t1-q1',
      subjectId: 'math',
      topicId: 'math9-t1',
      content: 'Rút gọn biểu thức $A = \\sqrt{12} - \\sqrt{27} + \\sqrt{48}$ ta được kết quả là:',
      options: ['A. 3\\sqrt{3}', 'B. 5\\sqrt{3}', 'C. 2\\sqrt{3}', 'D. \\sqrt{3}'],
      correctAnswer: 'A',
      recognition: 'Đưa thừa số ra ngoài dấu căn: $\\sqrt{12} = 2\\sqrt{3}$, $\\sqrt{27} = 3\\sqrt{3}$, $\\sqrt{48} = 4\\sqrt{3}$.',
      explanation: 'Ta có $A = 2\\sqrt{3} - 3\\sqrt{3} + 4\\sqrt{3} = (2 - 3 + 4)\\sqrt{3} = 3\\sqrt{3}$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t1-q2',
      subjectId: 'math',
      topicId: 'math9-t1',
      content: 'Điều kiện xác định của biểu thức $\\sqrt{2x - 6}$ là:',
      options: ['A. x >= 3', 'B. x > 3', 'C. x <= 3', 'D. x < 3'],
      correctAnswer: 'A',
      recognition: 'Biểu thức căn bậc hai $\\sqrt{A}$ xác định khi và chỉ khi $A \\ge 0$.',
      explanation: 'Ta có $2x - 6 \\ge 0 \\Leftrightarrow 2x \\ge 6 \\Leftrightarrow x \\ge 3$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t1-q3',
      subjectId: 'math',
      topicId: 'math9-t1',
      content: 'Giá trị của biểu thức $B = \\sqrt{(\\sqrt{5} - 3)^2} + \\sqrt{5}$ bằng:',
      options: ['A. 3', 'B. 2\\sqrt{5} - 3', 'C. -3', 'D. 3 - 2\\sqrt{5}'],
      correctAnswer: 'A',
      recognition: 'Hằng đẳng thức $\\sqrt{A^2} = |A|$. Chú ý so sánh $\\sqrt{5}$ với $3 = \\sqrt{9}$.',
      explanation: 'Vì $\\sqrt{5} < 3$ nên $|\\sqrt{5} - 3| = 3 - \\sqrt{5}$. Do đó $B = 3 - \\sqrt{5} + \\sqrt{5} = 3$.',
      difficulty: 'medium'
    }
  ],

  'math9-t2': [
    {
      id: 'math9-t2-q1',
      subjectId: 'math',
      topicId: 'math9-t2',
      content: 'Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng hai nghiệm $S = x_1 + x_2$ và tích hai nghiệm $P = x_1 x_2$ lần lượt là:',
      options: ['A. S = 5; P = 6', 'B. S = -5; P = 6', 'C. S = 5; P = -6', 'D. S = -5; P = -6'],
      correctAnswer: 'A',
      recognition: 'Hệ thức Vi-ét cho phương trình $ax^2 + bx + c = 0$: $S = -b/a$, $P = c/a$.',
      explanation: 'Với $a = 1, b = -5, c = 6$: $S = -(-5)/1 = 5$, $P = 6/1 = 6$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t2-q2',
      subjectId: 'math',
      topicId: 'math9-t2',
      content: 'Phương trình $x^2 - 4x + 1 = 0$ có 2 nghiệm $x_1, x_2$. Giá trị của biểu thức $A = x_1^2 + x_2^2$ bằng:',
      options: ['A. 14', 'B. 16', 'C. 18', 'D. 12'],
      correctAnswer: 'A',
      recognition: 'Biến đổi hằng đẳng thức $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$.',
      explanation: 'Theo Vi-ét: $x_1 + x_2 = 4$, $x_1 x_2 = 1$. Vậy $A = 4^2 - 2(1) = 16 - 2 = 14$.',
      difficulty: 'medium'
    },
    {
      id: 'math9-t2-q3',
      subjectId: 'math',
      topicId: 'math9-t2',
      content: 'Tìm tất cả các giá trị của tham số $m$ để phương trình $x^2 - 2(m-1)x + m^2 - 3 = 0$ có nghiệm kép:',
      options: ['A. m = 2', 'B. m = -2', 'C. m = 1', 'D. m = -1'],
      correctAnswer: 'A',
      recognition: 'Phương trình bậc hai có nghiệm kép khi và chỉ khi biệt thức $\\Delta\' = 0$.',
      explanation: '$\\Delta\' = (m-1)^2 - (m^2 - 3) = m^2 - 2m + 1 - m^2 + 3 = 4 - 2m$. Để có nghiệm kép: $4 - 2m = 0 \\Leftrightarrow m = 2$.',
      difficulty: 'hard'
    }
  ],

  'math9-t3': [
    {
      id: 'math9-t3-q1',
      subjectId: 'math',
      topicId: 'math9-t3',
      content: 'Nghiệm của hệ phương trình $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$ là cặp số $(x; y)$:',
      options: ['A. (2; 1)', 'B. (1; 2)', 'C. (3; -1)', 'D. (0; 5)'],
      correctAnswer: 'A',
      recognition: 'Cộng từng vế hai phương trình để triệt tiêu biến $y$: $(2x + x) = 5 + 1 \\Rightarrow 3x = 6$.',
      explanation: 'Cộng hai vế: $3x = 6 \\Rightarrow x = 2$. Thay vào $x - y = 1 \\Rightarrow y = 2 - 1 = 1$. Cặp nghiệm là $(2; 1)$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t3-q2',
      subjectId: 'math',
      topicId: 'math9-t3',
      content: 'Hai người làm chung công việc trong 12 giờ thì xong. Nếu người 1 làm 4h rồi người 2 làm tiếp 9h thì được 7/12 công việc. Người 1 làm một mình xong trong bao lâu?',
      options: ['A. 20 giờ', 'B. 24 giờ', 'C. 18 giờ', 'D. 30 giờ'],
      correctAnswer: 'D',
      recognition: 'Giải bài toán bằng cách lập hệ phương trình: đặt ẩn là thời gian hoàn thành công việc của từng người.',
      explanation: 'Gọi năng suất mỗi giờ của người 1 và người 2 là $u$ và $v$. Ta có $u + v = 1/12$ và $4u + 9v = 7/12$. Trừ bốn lần phương trình đầu khỏi phương trình sau được $5v = 3/12$, nên $v = 1/20$ và $u = 1/30$. Vậy người 1 làm một mình xong trong 30 giờ.',
      difficulty: 'hard'
    }
  ],

  'math9-t4': [
    {
      id: 'math9-t4-q1',
      subjectId: 'math',
      topicId: 'math9-t4',
      content: 'Cho parabol $(P): y = 2x^2$. Điểm nào sau đây thuộc đồ thị $(P)$?',
      options: ['A. M(1; 2)', 'B. N(-1; -2)', 'C. P(2; 4)', 'D. Q(-2; 4)'],
      correctAnswer: 'A',
      recognition: 'Thay hoành độ $x$ vào hàm số để kiểm tra xem tung độ $y$ có bằng tung độ của điểm đã cho hay không.',
      explanation: 'Với $x = 1 \\Rightarrow y = 2(1^2) = 2$, vậy điểm $M(1; 2)$ thuộc Parabol.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t4-q2',
      subjectId: 'math',
      topicId: 'math9-t4',
      content: 'Tọa độ các giao điểm của Parabol $(P): y = x^2$ và đường thẳng $(d): y = 2x + 3$ là:',
      options: ['A. (-1; 1) và (3; 9)', 'B. (1; 1) và (3; 9)', 'C. (-1; 1) và (-3; 9)', 'D. (2; 4) và (3; 9)'],
      correctAnswer: 'A',
      recognition: 'Phương trình hoành độ giao điểm: $x^2 = 2x + 3 \\Leftrightarrow x^2 - 2x - 3 = 0$.',
      explanation: 'Phương trình $x^2 - 2x - 3 = 0$ có $a - b + c = 0 \\Rightarrow x_1 = -1$ (suy ra $y_1 = 1$), $x_2 = 3$ (suy ra $y_2 = 9$). Giao điểm: $(-1; 1)$ và $(3; 9)$.',
      difficulty: 'medium'
    }
  ],

  'math9-t5': [
    {
      id: 'math9-t5-q1',
      subjectId: 'math',
      topicId: 'math9-t5',
      content: 'Cho đường tròn $(O; 5\\text{ cm})$ và dây cung $AB = 8\\text{ cm}$. Khoảng cách từ tâm $O$ đến dây cung $AB$ bằng:',
      options: ['A. 3 cm', 'B. 4 cm', 'C. 2.5 cm', 'D. \\sqrt{41} cm'],
      correctAnswer: 'A',
      recognition: 'Đường kính vuông góc với dây cung đi qua trung điểm của dây, áp dụng định lý Pythagore trong tam giác vuông.',
      explanation: 'Kẻ $OH \\perp AB \\Rightarrow H$ là trung điểm $AB \\Rightarrow AH = 4\\text{ cm}$. Tam giác $OAH$ vuông tại $H: OH = \\sqrt{OA^2 - AH^2} = \\sqrt{5^2 - 4^2} = 3\\text{ cm}$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t5-q2',
      subjectId: 'math',
      topicId: 'math9-t5',
      content: 'Cho tam giác $ABC$ nội tiếp đường tròn $(O)$ có góc $\\widehat{BAC} = 60^\\circ$. Số đo của cung nhỏ $BC$ bằng:',
      options: ['A. 120°', 'B. 60°', 'C. 30°', 'D. 180°'],
      correctAnswer: 'A',
      recognition: 'Góc nội tiếp chắn cung có số đo bằng một nửa số đo của cung bị chắn.',
      explanation: 'Số đo góc nội tiếp $\\widehat{BAC} = \\frac{1}{2} \\text{sđ}\\overparen{BC} \\Rightarrow \\text{sđ}\\overparen{BC} = 2 \\times 60^\\circ = 120^\\circ$.',
      difficulty: 'easy'
    }
  ],

  'math9-t6': [
    {
      id: 'math9-t6-q1',
      subjectId: 'math',
      topicId: 'math9-t6',
      content: 'Gieo một con xúc xắc cân đối và đồng chất 1 lần. Xác suất để xuất hiện mặt có số chấm là số nguyên tố bằng:',
      options: ['A. 1/2', 'B. 1/3', 'C. 2/3', 'D. 1/6'],
      correctAnswer: 'A',
      recognition: 'Không gian mẫu có 6 kết quả {1, 2, 3, 4, 5, 6}. Các số nguyên tố là {2, 3, 5}.',
      explanation: 'Số kết quả thuận lợi là 3 (gồm các mặt 2, 3, 5). Xác suất là $P = 3/6 = 1/2$.',
      difficulty: 'easy'
    },
    {
      id: 'math9-t6-q2',
      subjectId: 'math',
      topicId: 'math9-t6',
      content: 'Điểm kiểm tra môn Toán của 10 học sinh: 7, 8, 9, 7, 6, 8, 7, 9, 10, 8. Mốt ($M_o$) của mẫu số liệu trên là:',
      options: ['A. 7 và 8', 'B. 7', 'C. 8', 'D. 9'],
      correctAnswer: 'A',
      recognition: 'Mốt là giá trị có tần số xuất hiện nhiều nhất trong mẫu số liệu.',
      explanation: 'Giá trị 7 xuất hiện 3 lần, giá trị 8 xuất hiện 3 lần. Cả hai đều có tần số cao nhất nên mốt là 7 và 8.',
      difficulty: 'medium'
    }
  ],

  // ========================== TIẾNG ANH 9 (ÔN THI VÀO 10) ==========================
  'eng9-t1': [
    {
      id: 'eng9-t1-q1',
      subjectId: 'english',
      topicId: 'eng9-t1',
      content: 'If the weather ______ fine tomorrow, we will go on a picnic in the countryside.',
      options: ['A. is', 'B. will be', 'C. were', 'D. would be'],
      correctAnswer: 'A',
      recognition: 'Câu điều kiện loại 1: If + S + V(hiện tại đơn), S + will + V(nguyên mẫu).',
      explanation: 'Mệnh đề If của câu điều kiện loại 1 chia thì hiện tại đơn với chủ ngữ số ít "the weather" là "is".',
      difficulty: 'easy'
    },
    {
      id: 'eng9-t1-q2',
      subjectId: 'english',
      topicId: 'eng9-t1',
      content: 'The woman ______ lives next door to my house is a famous English teacher.',
      options: ['A. who', 'B. whom', 'C. which', 'D. whose'],
      correctAnswer: 'A',
      recognition: 'Đại từ quan hệ thay thế cho danh từ chỉ người làm chủ ngữ trong mệnh đề quan hệ.',
      explanation: '"The woman" là danh từ chỉ người, theo sau là động từ "lives" nên dùng đại từ quan hệ "who".',
      difficulty: 'easy'
    },
    {
      id: 'eng9-t1-q3',
      subjectId: 'english',
      topicId: 'eng9-t1',
      content: 'She asked me where I ______ the previous weekend.',
      options: ['A. had gone', 'B. went', 'C. go', 'D. have gone'],
      correctAnswer: 'A',
      recognition: 'Câu tường thuật (Reported speech) với thì quá khứ đơn lùi về quá khứ hoàn thành (had + V3/ed).',
      explanation: '"the previous weekend" thay thế cho "last weekend" trong câu trực tiếp, do đó thì quá khứ đơn lùi thành quá khứ hoàn thành: had gone.',
      difficulty: 'medium'
    }
  ],

  'eng9-t2': [
    {
      id: 'eng9-t2-q1',
      subjectId: 'english',
      topicId: 'eng9-t2',
      content: 'Choose the best word to complete the sentence: Many students in our school are interested ______ joining the green club.',
      options: ['A. in', 'B. on', 'C. at', 'D. with'],
      correctAnswer: 'A',
      recognition: 'Cụm giới từ cố định: be interested in + V-ing/Noun (thích, quan tâm đến cái gì).',
      explanation: 'Cấu trúc "interested in": say mê, quan tâm đến hoạt động nào đó.',
      difficulty: 'easy'
    },
    {
      id: 'eng9-t2-q2',
      subjectId: 'english',
      topicId: 'eng9-t2',
      content: 'Read and identify the main benefit: "Renewable energy sources like solar and wind power produce no greenhouse gas emissions and never run out." What is stated?',
      options: [
        'A. They do not emit greenhouse gases and are inexhaustible',
        'B. They are harmful to wildlife',
        'C. They run out quickly in the winter',
        'D. They produce high greenhouse emissions'
      ],
      correctAnswer: 'A',
      recognition: 'Kỹ năng Skimming / Scanning đọc hiểu tìm ý chính của đoạn văn bản.',
      explanation: 'Đoạn văn chỉ rõ "produce no greenhouse gas emissions and never run out", tương đương với "do not emit greenhouse gases and are inexhaustible".',
      difficulty: 'medium'
    }
  ],

  'eng9-t3': [
    {
      id: 'eng9-t3-q1',
      subjectId: 'english',
      topicId: 'eng9-t3',
      content: 'Choose the sentence that has the CLOSEST meaning to: "They built this bridge in 2020."',
      options: [
        'A. This bridge was built in 2020.',
        'B. This bridge is built in 2020.',
        'C. This bridge has been built in 2020.',
        'D. This bridge was build in 2020.'
      ],
      correctAnswer: 'A',
      recognition: 'Biến đổi câu chủ động sang câu bị động thì Quá khứ đơn: S + was/were + V3/ed + (by O).',
      explanation: 'Chủ ngữ mới là "This bridge" (số ít), thì quá khứ đơn dùng "was built".',
      difficulty: 'easy'
    },
    {
      id: 'eng9-t3-q2',
      subjectId: 'english',
      topicId: 'eng9-t3',
      content: 'Choose the sentence that has the CLOSEST meaning to: "Because it rained heavily, we postponed our soccer match."',
      options: [
        'A. Because of the heavy rain, we postponed our soccer match.',
        'B. In spite of the heavy rain, we postponed our soccer match.',
        'C. Although it rained heavily, we postponed our soccer match.',
        'D. Despite it rained heavily, we cancelled our soccer match.'
      ],
      correctAnswer: 'A',
      recognition: 'Chuyển đổi giữa liên từ "Because + clause" và cụm giới từ "Because of + noun phrase".',
      explanation: '"Because it rained heavily" = "Because of the heavy rain". Các đáp án còn lại (In spite of, Although, Despite) chỉ sự nhượng bộ là sai nghĩa.',
      difficulty: 'medium'
    }
  ],

  // ========================== TOÁN HỌC 10 ==========================
  'math10-t1': [
    {
      id: 'math10-t1-q1',
      subjectId: 'math',
      topicId: 'math10-t1',
      content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Hãy xác định tập hợp $A \\cap B$.',
      options: ['A. [1; 3]', 'B. (1; 3)', 'C. (2; 3]', 'D. (1; 3]'],
      correctAnswer: 'D',
      recognition: 'Giao của hai khoảng, đoạn số học. Tìm phần tử chung thỏa mãn đồng thời cả hai điều kiện.',
      explanation: 'Giao của $A = [-2; 3]$ và $B = (1; 5)$ là các số thực $x$ thỏa mãn $-2 \\le x \\le 3$ và $1 < x < 5$. Do đó $1 < x \\le 3$, tức là nửa khoảng $(1; 3]$.',
      difficulty: 'easy'
    },
    {
      id: 'math10-t1-q2',
      subjectId: 'math',
      topicId: 'math10-t1',
      content: 'Cho hai tập hợp $A = [-2; 4]$ và $B = (1; 6]$. Hãy xác định tập hợp $A \\setminus B$.',
      options: ['A. (-2; 1]', 'B. [-2; 1)', 'C. [-1; 1]', 'D. [-2; 1]'],
      correctAnswer: 'D',
      recognition: 'Hiệu của hai tập hợp $A \\setminus B$ gồm các phần tử thuộc A nhưng không thuộc B.',
      explanation: 'Ta có $A = [-2; 4]$ và $B = (1; 6]$. Lấy các điểm thuộc A mà không thuộc B ta thu được đoạn $[-2; 1]$. Do $x=1 \\notin B$ nên $1 \\in A \\setminus B$.',
      difficulty: 'medium'
    },
    {
      id: 'math10-t1-q3',
      subjectId: 'math',
      topicId: 'math10-t1',
      content: 'Cho tập hợp $A = [m; m + 2]$ và $B = [-1; 3]$. Tìm tất cả các giá trị thực của tham số m để $A \\cap B \\neq \\varnothing$.',
      options: ['A. -3 <= m <= 3', 'B. -3 < m <= 3', 'C. -2 <= m <= 3', 'D. -4 <= m <= 3'],
      correctAnswer: 'A',
      recognition: 'Hai đoạn $[a; b]$ và $[c; d]$ giao nhau khác rỗng khi và chỉ khi $a \\le d$ và $b \\ge c$.',
      explanation: 'Hai đoạn có giao khác rỗng khi: $m \\le 3$ và $m + 2 \\ge -1 \\Leftrightarrow m \\ge -3$. Vậy $-3 \\le m \\le 3$.',
      difficulty: 'hard'
    }
  ],

  'math10-t2': [
    {
      id: 'math10-t2-q1',
      subjectId: 'math',
      topicId: 'math10-t2',
      content: 'Cặp số $(x; y)$ nào sau đây là nghiệm của bất phương trình $2x - 3y + 1 > 0$?',
      options: ['A. (1; 2)', 'B. (2; 1)', 'C. (0; 1)', 'D. (-1; 0)'],
      correctAnswer: 'B',
      recognition: 'Thay trực tiếp tọa độ $(x; y)$ vào vế trái của bất phương trình để kiểm tra dấu.',
      explanation: 'Thay $(2; 1)$ vào: $2(2) - 3(1) + 1 = 4 - 3 + 1 = 2 > 0$ (thỏa mãn).',
      difficulty: 'easy'
    },
    {
      id: 'math10-t2-q2',
      subjectId: 'math',
      topicId: 'math10-t2',
      content: 'Miền nghiệm của bất phương trình $x + y \\le 2$ chứa điểm nào sau đây?',
      options: ['A. (2; 2)', 'B. (1; 2)', 'C. (0; 0)', 'D. (3; -0.5)'],
      correctAnswer: 'C',
      recognition: 'Điểm gốc tọa độ $O(0; 0)$ thường là điểm thử kinh điển khi xác định miền nghiệm.',
      explanation: 'Thay $x=0, y=0$ vào bất phương trình: $0 + 0 = 0 \\le 2$ (đúng), vậy miền nghiệm chứa điểm gốc tọa độ $(0; 0)$.',
      difficulty: 'easy'
    }
  ],

  'math10-t3': [
    {
      id: 'math10-t3-q1',
      subjectId: 'math',
      topicId: 'math10-t3',
      content: 'Tọa độ đỉnh I của parabol $(P): y = x^2 - 4x + 3$ là:',
      options: ['A. I(2; -1)', 'B. I(-2; 15)', 'C. I(2; 1)', 'D. I(4; 3)'],
      correctAnswer: 'A',
      recognition: 'Tọa độ đỉnh Parabol $y = ax^2 + bx + c$ có hoành độ $x_I = -\\frac{b}{2a}$.',
      explanation: 'Ta có $a = 1, b = -4, c = 3$. Hoành độ đỉnh $x_I = -\\frac{-4}{2(1)} = 2$. Tung độ $y_I = 2^2 - 4(2) + 3 = 4 - 8 + 3 = -1$. Vậy $I(2; -1)$.',
      difficulty: 'easy'
    },
    {
      id: 'math10-t3-q2',
      subjectId: 'math',
      topicId: 'math10-t3',
      content: 'Trục đối xứng của đồ thị hàm số $y = -2x^2 + 6x - 1$ là đường thẳng:',
      options: ['A. x = 3/2', 'B. x = -3/2', 'C. x = 3', 'D. x = -3'],
      correctAnswer: 'A',
      recognition: 'Phương trình trục đối xứng của Parabol là đường thẳng $x = -\\frac{b}{2a}$.',
      explanation: 'Trục đối xứng: $x = -\\frac{6}{2(-2)} = \\frac{6}{4} = \\frac{3}{2}$.',
      difficulty: 'easy'
    }
  ],

  'math10-t4': [
    {
      id: 'math10-t4-q1',
      subjectId: 'math',
      topicId: 'math10-t4',
      content: 'Cho tam giác $ABC$ có $b = 7, c = 5$ và $\\widehat{A} = 60^\\circ$. Độ dài cạnh $a$ bằng:',
      options: ['A. \\sqrt{39}', 'B. 39', 'C. \\sqrt{109}', 'D. 2\\sqrt{10}'],
      correctAnswer: 'A',
      recognition: 'Áp dụng định lý côsin: $a^2 = b^2 + c^2 - 2bc \\cos A$.',
      explanation: 'Theo định lý côsin: $a^2 = 7^2 + 5^2 - 2 \\cdot 7 \\cdot 5 \\cdot \\cos 60^\\circ = 49 + 25 - 70 \\cdot \\frac{1}{2} = 74 - 35 = 39 \\Rightarrow a = \\sqrt{39}$.',
      difficulty: 'medium'
    },
    {
      id: 'math10-t4-q2',
      subjectId: 'math',
      topicId: 'math10-t4',
      content: 'Diện tích tam giác có ba cạnh $a = 6, b = 8, c = 10$ là:',
      options: ['A. 24', 'B. 48', 'C. 30', 'D. 40'],
      correctAnswer: 'A',
      recognition: 'Nhận xét $6^2 + 8^2 = 36 + 64 = 100 = 10^2$, đây là tam giác vuông!',
      explanation: 'Bộ ba $(6, 8, 10)$ thỏa mãn định lý Pythagore nên tam giác vuông tại đỉnh đối diện cạnh huyền 10. Diện tích $S = \\frac{1}{2} \\cdot 6 \\cdot 8 = 24$.',
      difficulty: 'easy'
    }
  ],

  'math10-t5': [
    {
      id: 'math10-t5-q1',
      subjectId: 'math',
      topicId: 'math10-t5',
      content: 'Cho hình bình hành $ABCD$. Đẳng thức vectơ nào sau đây đúng?',
      options: [
        'A. \\vec{AB} + \\vec{AD} = \\vec{AC}',
        'B. \\vec{AB} + \\vec{AC} = \\vec{AD}',
        'C. \\vec{BA} + \\vec{BC} = \\vec{CA}',
        'D. \\vec{AB} - \\vec{AD} = \\vec{AC}'
      ],
      correctAnswer: 'A',
      recognition: 'Quy tắc hình bình hành: Hai vectơ chung gốc là hai cạnh thì tổng bằng vectơ đường chéo chung gốc.',
      explanation: 'Theo quy tắc hình bình hành xuất phát từ đỉnh A: $\\vec{AB} + \\vec{AD} = \\vec{AC}$.',
      difficulty: 'easy'
    },
    {
      id: 'math10-t5-q2',
      subjectId: 'math',
      topicId: 'math10-t5',
      content: 'Cho hai vectơ $\\vec{u} = (2; -3)$ và $\\vec{v} = (4; 1)$. Tích vô hướng $\\vec{u} \\cdot \\vec{v}$ bằng:',
      options: ['A. 5', 'B. 11', 'C. 8', 'D. -5'],
      correctAnswer: 'A',
      recognition: 'Tích vô hướng trong hệ tọa độ: $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2$.',
      explanation: '$\\vec{u} \\cdot \\vec{v} = 2(4) + (-3)(1) = 8 - 3 = 5$.',
      difficulty: 'easy'
    }
  ],

  'math10-t6': [
    {
      id: 'math10-t6-q1',
      subjectId: 'math',
      topicId: 'math10-t6',
      content: 'Một đội văn nghệ có 5 bạn nam và 6 bạn nữ. Có bao nhiêu cách chọn ra 1 bạn để đại diện phát biểu?',
      options: ['A. 11', 'B. 30', 'C. 5', 'D. 6'],
      correctAnswer: 'A',
      recognition: 'Quy tắc cộng: Chọn 1 đối tượng trong các phương án rời nhau.',
      explanation: 'Chọn 1 bạn (hoặc nam hoặc nữ). Theo quy tắc cộng: $5 + 6 = 11$ cách chọn.',
      difficulty: 'easy'
    },
    {
      id: 'math10-t6-q2',
      subjectId: 'math',
      topicId: 'math10-t6',
      content: 'Có bao nhiêu cách xếp 5 học sinh thành một hàng dọc?',
      options: ['A. 120', 'B. 24', 'C. 25', 'D. 720'],
      correctAnswer: 'A',
      recognition: 'Số hoán vị của $n$ phần tử là $P_n = n!$.',
      explanation: 'Số cách sắp xếp 5 học sinh là $P_5 = 5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$.',
      difficulty: 'easy'
    }
  ],

  'math10-t7': [
    {
      id: 'math10-t7-q1',
      subjectId: 'math',
      topicId: 'math10-t7',
      content: 'Gieo một con xúc xắc cân đối và đồng chất một lần. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng:',
      options: ['A. 1/2', 'B. 1/3', 'C. 1/6', 'D. 2/3'],
      correctAnswer: 'A',
      recognition: 'Xác suất cổ điển: $P(A) = \\frac{n(A)}{n(\\Omega)}$.',
      explanation: 'Không gian mẫu $n(\\Omega) = 6$. Các mặt chẵn là $\\{2, 4, 6\\} \\Rightarrow n(A) = 3$. Vậy $P(A) = \\frac{3}{6} = \\frac{1}{2}$.',
      difficulty: 'easy'
    }
  ],

  'math10-t8': [
    {
      id: 'math10-t8-q1',
      subjectId: 'math',
      topicId: 'math10-t8',
      content: 'Vectơ nào dưới đây là một vectơ pháp tuyến của đường thẳng $\\Delta: 2x - 3y + 5 = 0$?',
      options: ['A. \\vec{n} = (2; -3)', 'B. \\vec{n} = (2; 3)', 'C. \\vec{n} = (3; 2)', 'D. \\vec{n} = (-3; 2)'],
      correctAnswer: 'A',
      recognition: 'Đường thẳng $ax + by + c = 0$ có vectơ pháp tuyến $\\vec{n} = (a; b)$.',
      explanation: 'Phương trình $2x - 3y + 5 = 0$ có các hệ số $a = 2, b = -3$. Do đó một VTPT là $\\vec{n} = (2; -3)$.',
      difficulty: 'easy'
    },
    {
      id: 'math10-t8-q2',
      subjectId: 'math',
      topicId: 'math10-t8',
      content: 'Tâm $I$ và bán kính $R$ của đường tròn $(C): (x - 2)^2 + (y + 1)^2 = 16$ là:',
      options: ['A. I(2; -1), R = 4', 'B. I(-2; 1), R = 4', 'C. I(2; -1), R = 16', 'D. I(-2; 1), R = 16'],
      correctAnswer: 'A',
      recognition: 'Phương trình chính tắc đường tròn $(x - a)^2 + (y - b)^2 = R^2$ có tâm $I(a; b)$ và bán kính $R$.',
      explanation: 'So sánh với dạng chuẩn: $a = 2, b = -1, R = \\sqrt{16} = 4$. Vậy $I(2; -1)$ và $R = 4$.',
      difficulty: 'easy'
    }
  ],

  // ========================== VẬT LÝ 10 ==========================
  'phy10-t1': [
    {
      id: 'phy10-t1-q1',
      subjectId: 'physics',
      topicId: 'phy10-t1',
      content: 'Một vật chuyển động thẳng đều với vận tốc $v = 15\\text{ m/s}$. Quãng đường vật đi được trong thời gian $t = 20\\text{ s}$ là:',
      options: ['A. 300 m', 'B. 150 m', 'C. 75 m', 'D. 400 m'],
      correctAnswer: 'A',
      recognition: 'Công thức chuyển động thẳng đều: $s = v \\cdot t$.',
      explanation: 'Ta có $s = v \\cdot t = 15 \\cdot 20 = 300\\text{ m}$.',
      difficulty: 'easy'
    },
    {
      id: 'phy10-t1-q2',
      subjectId: 'physics',
      topicId: 'phy10-t1',
      content: 'Đơn vị đo của vận tốc trong hệ SI là:',
      options: ['A. m/s', 'B. km/h', 'C. m/s^2', 'D. cm/s'],
      correctAnswer: 'A',
      recognition: 'Đơn vị chuẩn SI: chiều dài đo bằng mét (m), thời gian đo bằng giây (s).',
      explanation: 'Trong hệ SI, đơn vị hợp pháp của vận tốc là mét trên giây (m/s).',
      difficulty: 'easy'
    }
  ],

  'phy10-t2': [
    {
      id: 'phy10-t2-q1',
      subjectId: 'physics',
      topicId: 'phy10-t2',
      content: 'Một xe máy bắt đầu khởi hành từ trạng thái nghỉ với gia tốc không đổi $a = 2\\text{ m/s}^2$. Vận tốc của xe sau $5\\text{ s}$ là:',
      options: ['A. 10 m/s', 'B. 25 m/s', 'C. 5 m/s', 'D. 20 m/s'],
      correctAnswer: 'A',
      recognition: 'Công thức vận tốc biến đổi đều xuất phát từ trạng thái nghỉ: $v = a \\cdot t$.',
      explanation: 'Khởi hành từ trạng thái nghỉ $\\Rightarrow v_0 = 0$. Vận tốc sau 5s là $v = v_0 + at = 0 + 2 \\times 5 = 10\\text{ m/s}$.',
      difficulty: 'easy'
    },
    {
      id: 'phy10-t2-q2',
      subjectId: 'physics',
      topicId: 'phy10-t2',
      content: 'Thả một vật rơi tự do từ độ cao $h = 20\\text{ m}$ so với mặt đất. Lấy $g = 10\\text{ m/s}^2$. Thời gian vật chạm đất là:',
      options: ['A. 2 s', 'B. 4 s', 'C. 1 s', 'D. 2.5 s'],
      correctAnswer: 'A',
      recognition: 'Thời gian rơi tự do từ độ cao h: $t = \\sqrt{\\frac{2h}{g}}$.',
      explanation: '$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times 20}{10}} = \\sqrt{4} = 2\\text{ s}$.',
      difficulty: 'medium'
    }
  ],

  'phy10-t3': [
    {
      id: 'phy10-t3-q1',
      subjectId: 'physics',
      topicId: 'phy10-t3',
      content: 'Theo định luật II Newton, hệ thức liên hệ giữa lực tác dụng $\\vec{F}$, khối lượng $m$ và gia tốc $\\vec{a}$ là:',
      options: ['A. \\vec{F} = m \\cdot \\vec{a}', 'B. \\vec{a} = m \\cdot \\vec{F}', 'C. \\vec{F} = \\frac{\\vec{a}}{m}', 'D. m = \\vec{F} \\cdot \\vec{a}'],
      correctAnswer: 'A',
      recognition: 'Định luật II Newton: Gia tốc của một vật cùng hướng với lực tác dụng và tỉ lệ thuận với độ lớn của lực.',
      explanation: 'Biểu thức vectơ của định luật II Newton là $\\vec{F} = m\\vec{a}$ hay $\\vec{a} = \\frac{\\vec{F}}{m}$.',
      difficulty: 'easy'
    }
  ],

  'phy10-t4': [
    {
      id: 'phy10-t4-q1',
      subjectId: 'physics',
      topicId: 'phy10-t4',
      content: 'Một lực $F = 50\\text{ N}$ kéo một vật di chuyển một quãng đường $s = 10\\text{ m}$ cùng hướng với lực. Công của lực đó bằng:',
      options: ['A. 500 J', 'B. 250 J', 'C. 50 J', 'D. 5 J'],
      correctAnswer: 'A',
      recognition: 'Công cơ học khi lực cùng hướng dịch chuyển: $A = F \\cdot s$.',
      explanation: 'Ta có $\\alpha = 0^\\circ \\Rightarrow \\cos 0^\\circ = 1$. Công sinh ra là $A = F \\cdot s \\cdot \\cos 0^\\circ = 50 \\times 10 = 500\\text{ J}$.',
      difficulty: 'easy'
    }
  ],

  'phy10-t5': [
    {
      id: 'phy10-t5-q1',
      subjectId: 'physics',
      topicId: 'phy10-t5',
      content: 'Động lượng $\\vec{p}$ của một vật khối lượng $m$ chuyển động với vận tốc $\\vec{v}$ được xác định bởi công thức:',
      options: ['A. \\vec{p} = m \\cdot \\vec{v}', 'B. \\vec{p} = \\frac{1}{2}m\\vec{v}^2', 'C. \\vec{p} = m \\cdot \\vec{a}', 'D. \\vec{p} = \\frac{\\vec{v}}{m}'],
      correctAnswer: 'A',
      recognition: 'Định nghĩa động lượng: tích của khối lượng và vận tốc của vật.',
      explanation: 'Động lượng của một vật là một đại lượng vectơ đo bằng tích của khối lượng và vận tốc: $\\vec{p} = m\\vec{v}$.',
      difficulty: 'easy'
    }
  ],

  'phy10-t6': [
    {
      id: 'phy10-t6-q1',
      subjectId: 'physics',
      topicId: 'phy10-t6',
      content: 'Góc $60^\\circ$ khi đổi sang đơn vị radian bằng bao nhiêu?',
      options: ['A. \\pi / 4', 'B. \\pi / 3', 'C. \\pi / 6', 'D. \\pi / 2'],
      correctAnswer: 'B',
      recognition: 'Công thức chuyển đổi: $\\alpha(\\text{rad}) = a^\\circ \\cdot \\frac{\\pi}{180^\\circ}$.',
      explanation: 'Ta có $60^\\circ = 60 \\cdot \\frac{\\pi}{180} = \\frac{\\pi}{3}\\text{ rad}$.',
      difficulty: 'easy'
    }
  ],

  // ========================== HÓA HỌC 10 ==========================
  'chem10-t1': [
    {
      id: 'chem10-t1-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t1',
      content: 'Hạt mang điện tích âm cấu tạo nên nguyên tử là:',
      options: ['A. Electron', 'B. Proton', 'C. Neutron', 'D. Positron'],
      correctAnswer: 'A',
      recognition: 'Cấu tạo hạt nguyên tử: proton (+), electron (-), neutron (không mang điện).',
      explanation: 'Electron (kí hiệu là e) mang điện tích âm $-1,602 \\times 10^{-19}\\text{ C}$.',
      difficulty: 'easy'
    },
    {
      id: 'chem10-t1-q2',
      subjectId: 'chemistry',
      topicId: 'chem10-t1',
      content: 'Nguyên tử Sodium ($_{11}\\text{Na}$) có số electron lớp ngoài cùng là:',
      options: ['A. 1', 'B. 2', 'C. 7', 'D. 8'],
      correctAnswer: 'A',
      recognition: 'Viết cấu hình electron của nguyên tử: Na (Z = 11): $1s^2 2s^2 2p^6 3s^1$.',
      explanation: 'Cấu hình electron của Na: $1s^2 2s^2 2p^6 3s^1$. Lớp ngoài cùng (lớp n=3) có đúng 1 electron.',
      difficulty: 'easy'
    }
  ],

  'chem10-t2': [
    {
      id: 'chem10-t2-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t2',
      content: 'Bảng tuần hoàn hiện đại được sắp xếp theo nguyên tắc nào?',
      options: [
        'A. Theo chiều tăng dần của điện tích hạt nhân nguyên tử',
        'B. Theo chiều tăng dần của khối lượng nguyên tử',
        'C. Theo chiều tăng dần của số neutron',
        'D. Theo thứ tự bảng chữ cái tên nguyên tố'
      ],
      correctAnswer: 'A',
      recognition: 'Định luật tuần hoàn hiện đại: Các nguyên tố được xếp theo chiều tăng dần của điện tích hạt nhân (Z).',
      explanation: 'Các nguyên tố trong bảng tuần hoàn được sắp xếp theo chiều tăng dần của điện tích hạt nhân nguyên tử.',
      difficulty: 'easy'
    }
  ],

  'chem10-t3': [
    {
      id: 'chem10-t3-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t3',
      content: 'Theo quy tắc Octet, khi hình thành liên kết hóa học, các nguyên tử có xu hướng đạt được cấu hình electron bền vững với bao nhiêu electron ở lớp ngoài cùng?',
      options: ['A. 8 (hoặc 2 với He)', 'B. 6', 'C. 10', 'D. 18'],
      correctAnswer: 'A',
      recognition: 'Quy tắc bát tử (Octet): 8 electron lớp ngoài cùng giống khí hiếm gần nhất.',
      explanation: 'Quy tắc Octet phát biểu rằng các nguyên tử có xu hướng nhường, nhận hoặc góp chung electron để đạt cấu hình bền vững gồm 8 electron lớp ngoài cùng (hoặc 2 electron như Heli).',
      difficulty: 'easy'
    }
  ],

  'chem10-t4': [
    {
      id: 'chem10-t4-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t4',
      content: 'Số oxi hóa của nguyên tố sulfur (S) trong phân tử $H_2SO_4$ là:',
      options: ['A. +6', 'B. +4', 'C. -2', 'D. 0'],
      correctAnswer: 'A',
      recognition: 'Trong hợp chất trung hòa: Tổng đại số số oxi hóa của các nguyên tử bằng 0. Số oxi hóa của H là +1, O là -2.',
      explanation: 'Trong $H_2SO_4$: $2(+1) + x + 4(-2) = 0 \\Leftrightarrow x - 6 = 0 \\Leftrightarrow x = +6$.',
      difficulty: 'easy'
    }
  ],

  'chem10-t5': [
    {
      id: 'chem10-t5-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t5',
      content: 'Phản ứng có biến thiên Enthalpy $\\Delta_r H^\\circ_{298} < 0$ là phản ứng:',
      options: ['A. Tỏa nhiệt', 'B. Thu nhiệt', 'C. Không có sự trao đổi năng lượng', 'D. Tự phát phân hủy'],
      correctAnswer: 'A',
      recognition: 'Quy ước dấu Enthalpy: $\\Delta H < 0$ là tỏa nhiệt (giải phóng năng lượng), $\\Delta H > 0$ là thu nhiệt.',
      explanation: 'Khi $\\Delta_r H^\\circ_{298} < 0$, năng lượng của hệ giảm đi do nhiệt lượng tỏa ra môi trường xung quanh, đây là phản ứng tỏa nhiệt.',
      difficulty: 'easy'
    }
  ],

  'chem10-t6': [
    {
      id: 'chem10-t6-q1',
      subjectId: 'chemistry',
      topicId: 'chem10-t6',
      content: 'Yếu tố nào sau đây KHÔNG làm ảnh hưởng đến tốc độ của phản ứng hóa học?',
      options: ['A. Thể tích bình phản ứng khi chất tham gia là chất lỏng', 'B. Nhiệt độ', 'C. Nồng độ chất phản ứng', 'D. Chất xúc tác'],
      correctAnswer: 'A',
      recognition: '5 yếu tố ảnh hưởng tốc độ phản ứng: nồng độ, áp suất (chất khí), nhiệt độ, diện tích tiếp xúc, chất xúc tác.',
      explanation: 'Thể tích bình chứa chất lỏng không làm thay đổi nồng độ chất phản ứng nếu lượng dung môi không đổi, do đó không tác động đến tốc độ.',
      difficulty: 'medium'
    }
  ],

  // ========================== SINH HỌC 10 ==========================
  'bio10-t1': [
    {
      id: 'bio10-t1-q1',
      subjectId: 'biology',
      topicId: 'bio10-t1',
      content: 'Bốn nguyên tố hóa học chính chiếm khoảng 96% khối lượng chất khô của tế bào là:',
      options: ['A. C, H, O, N', 'B. C, H, O, P', 'C. C, H, O, S', 'D. C, N, P, K'],
      correctAnswer: 'A',
      recognition: 'Các nguyên tố đại lượng đa lượng tạo nên khung sinh học của sự sống (CHON).',
      explanation: 'Carbon, Hydrogen, Oxygen, Nitrogen là bốn nguyên tố chủ yếu tham gia cấu tạo các hợp chất hữu cơ quan trọng (protein, lipid, carbohydrate, nucleic acid).',
      difficulty: 'easy'
    },
    {
      id: 'bio10-t1-q2',
      subjectId: 'biology',
      topicId: 'bio10-t1',
      content: 'Đơn phân cấu tạo nên protein là:',
      options: ['A. Axit amin (amino acid)', 'B. Nucleotide', 'C. Glucose', 'D. Axit béo'],
      correctAnswer: 'A',
      recognition: 'Mối quan hệ đa phân - đơn phân: Protein được cấu tạo từ các amino acid liên kết bằng liên kết peptide.',
      explanation: 'Protein là đại phân tử sinh học có cấu trúc đa phân, trong đó đơn phân là các axit amin (có 20 loại axit amin phổ biến).',
      difficulty: 'easy'
    }
  ],

  'bio10-t2': [
    {
      id: 'bio10-t2-q1',
      subjectId: 'biology',
      topicId: 'bio10-t2',
      content: 'Điểm khác biệt cốt lõi giữa tế bào nhân sơ và tế bào nhân thực là tế bào nhân sơ:',
      options: [
        'A. Chưa có màng nhân bao bọc vật chất di truyền',
        'B. Không có màng sinh chất',
        'C. Không có ribosome',
        'D. Có kích thước lớn hơn nhiều'
      ],
      correctAnswer: 'A',
      recognition: 'Nhân sơ (Prokaryote): vùng nhân chưa có màng bao bọc. Nhân thực (Eukaryote): nhân hoàn chỉnh có màng nhân.',
      explanation: 'Tế bào nhân sơ (như vi khuẩn) có vùng nhân chứa phân tử DNA trần, dạng vòng và chưa được màng nhân bao bọc.',
      difficulty: 'easy'
    }
  ],

  'bio10-t3': [
    {
      id: 'bio10-t3-q1',
      subjectId: 'biology',
      topicId: 'bio10-t3',
      content: 'Phân tử nào được coi là "đồng tiền năng lượng" của tế bào?',
      options: ['A. ATP', 'B. ADP', 'C. Glucose', 'D. DNA'],
      correctAnswer: 'A',
      recognition: 'ATP (Adenosine Triphosphate) chứa các liên kết cao năng dễ bị thủy phân giải phóng năng lượng.',
      explanation: 'ATP cung cấp năng lượng trực tiếp cho hầu hết các hoạt động sống của tế bào (tổng hợp chất, co cơ, vận chuyển chủ động...).',
      difficulty: 'easy'
    }
  ],

  'bio10-t4': [
    {
      id: 'bio10-t4-q1',
      subjectId: 'biology',
      topicId: 'bio10-t4',
      content: 'Kết quả của quá trình nguyên phân từ một tế bào mẹ ban đầu (2n) tạo ra:',
      options: [
        'A. 2 tế bào con có bộ NST 2n giống hệt nhau và giống tế bào mẹ',
        'B. 4 tế bào con có bộ NST n giảm đi một nửa',
        'C. 2 tế bào con có bộ NST n',
        'D. 1 tế bào con mang bộ NST 4n'
      ],
      correctAnswer: 'A',
      recognition: 'Nguyên phân (Mitosis) giúp bảo toàn nguyên vẹn bộ nhiễm sắc thể lưỡng bội 2n.',
      explanation: 'Từ 1 tế bào mẹ (2n) qua một lần nguyên phân tạo ra 2 tế bào con có bộ NST lưỡng bội (2n) hoàn toàn giống nhau và giống hệt tế bào mẹ.',
      difficulty: 'easy'
    }
  ],

  // ========================== TIẾNG ANH 10 ==========================
  'eng10-t1': [
    {
      id: 'eng10-t1-q1',
      subjectId: 'english',
      topicId: 'eng10-t1',
      content: 'Choose the best word to complete the sentence: "In my family, both my parents _______ the household chores equally."',
      options: ['A. share', 'B. make', 'C. take', 'D. prepare'],
      correctAnswer: 'A',
      recognition: 'Collocation trong chủ đề Family Life: "share household chores" (chia sẻ việc nhà).',
      explanation: 'Cụm từ cố định: "share the household chores" nghĩa là chia sẻ công việc nhà với nhau.',
      difficulty: 'easy'
    },
    {
      id: 'eng10-t1-q2',
      subjectId: 'english',
      topicId: 'eng10-t1',
      content: 'Look! My mother _______ dinner in the kitchen right now.',
      options: ['A. is cooking', 'B. cooks', 'C. cooked', 'D. has cooked'],
      correctAnswer: 'A',
      recognition: 'Dấu hiệu thì hiện tại tiếp diễn: "Look!", "right now" diễn tả hành động đang diễn ra tại thời điểm nói.',
      explanation: 'Có "Look!" và "right now", dùng thì Hiện Tại Tiếp Diễn: S + is/am/are + V-ing. Với "My mother", dùng "is cooking".',
      difficulty: 'easy'
    }
  ],

  'eng10-t2': [
    {
      id: 'eng10-t2-q1',
      subjectId: 'english',
      topicId: 'eng10-t2',
      content: 'We should reduce our _______ footprint by turning off electrical appliances when not in use.',
      options: ['A. carbon', 'B. ecological', 'C. environmental', 'D. organic'],
      correctAnswer: 'A',
      recognition: 'Cụm từ vựng môi trường phổ biến: "carbon footprint" (dấu chân carbon).',
      explanation: '"Carbon footprint" nghĩa là lượng khí nhà kính (chủ yếu là CO2) thải ra môi trường do các hoạt động của con người.',
      difficulty: 'easy'
    }
  ],

  'eng10-t3': [
    {
      id: 'eng10-t3-q1',
      subjectId: 'english',
      topicId: 'eng10-t3',
      content: 'The famous singer was greeted by thousands of cheering _______ when she stepped on stage.',
      options: ['A. fans', 'B. viewers', 'C. onlookers', 'D. spectators'],
      correctAnswer: 'A',
      recognition: 'Từ vựng chủ đề Music: người hâm mộ ca sĩ/ban nhạc là "fans".',
      explanation: '"Fan" là người hâm mộ thần tượng/nghệ sĩ. "Spectator" thường dùng cho người xem thể thao trên sân vận động.',
      difficulty: 'easy'
    }
  ],

  'eng10-t4': [
    {
      id: 'eng10-t4-q1',
      subjectId: 'english',
      topicId: 'eng10-t4',
      content: 'Smartphones allow students to access online learning materials _______ anywhere and anytime.',
      options: ['A. from', 'B. in', 'C. on', 'D. at'],
      correctAnswer: 'A',
      recognition: 'Giới từ đi với địa điểm truy cập: "access ... from anywhere".',
      explanation: '"from anywhere and anytime" là cụm diễn đạt tự nhiên mang ý nghĩa "từ bất cứ nơi đâu và vào bất cứ lúc nào".',
      difficulty: 'easy'
    }
  ],

  // ========================== LỊCH SỬ 10 ==========================
  'his10-t1': [
    {
      id: 'his10-t1-q1',
      subjectId: 'history',
      topicId: 'his10-t1',
      content: 'Hiện thực lịch sử là gì?',
      options: [
        'A. Tất cả những gì đã diễn ra trong quá khứ, tồn tại hoàn toàn khách quan',
        'B. Những điều con người suy đoán về tương lai',
        'C. Những câu chuyện truyền thuyết do dân gian sáng tạo',
        'D. Những ghi chép chủ quan của các nhà sử học'
      ],
      correctAnswer: 'A',
      recognition: 'Khái niệm mở đầu SGK Lịch sử 10 mới: Phân biệt "Hiện thực lịch sử" và "Nhận thức lịch sử".',
      explanation: 'Hiện thực lịch sử là toàn bộ những gì đã diễn ra trong quá khứ, tồn tại một cách khách quan, độc lập với ý muốn của con người.',
      difficulty: 'easy'
    }
  ],

  'his10-t2': [
    {
      id: 'his10-t2-q1',
      subjectId: 'history',
      topicId: 'his10-t2',
      content: 'Một trong những chức năng quan trọng nhất của khoa học Lịch sử đối với đời sống con người là:',
      options: [
        'A. Rút ra các bài học kinh nghiệm để phục vụ hiện tại và tương lai',
        'B. Phục dựng lại chính xác 100% cuộc sống người nguyên thủy',
        'C. Tiên đoán chính xác các sự kiện khoa học công nghệ tương lai',
        'D. Thay đổi các sự kiện đau buồn từng xảy ra trong quá khứ'
      ],
      correctAnswer: 'A',
      recognition: 'Ý nghĩa của tri thức lịch sử: Hiểu quá khứ để định hướng tương lai.',
      explanation: 'Học tập lịch sử giúp đúc kết những bài học thành công và thất bại quý báu trong quá khứ nhằm giải quyết các vấn đề đương đại.',
      difficulty: 'easy'
    }
  ],

  'his10-t3': [
    {
      id: 'his10-t3-q1',
      subjectId: 'history',
      topicId: 'his10-t3',
      content: 'Công trình kiến trúc Kim tự tháp kỳ vĩ là thành tựu tiêu biểu của nền văn minh cổ đại nào?',
      options: ['A. Ai Cập cổ đại', 'B. Lưỡng Hà', 'C. Ấn Độ cổ đại', 'D. Trung Hoa'],
      correctAnswer: 'A',
      recognition: 'Biểu tượng văn minh sông Nin: Các Kim tự tháp Giza và tượng Nhân sư.',
      explanation: 'Kim tự tháp là lăng mộ của các Pharaon, biểu tượng cho quyền lực tối cao và thành tựu kiến trúc kiệt xuất của người Ai Cập cổ đại.',
      difficulty: 'easy'
    }
  ],

  'his10-t4': [
    {
      id: 'his10-t4-q1',
      subjectId: 'history',
      topicId: 'his10-t4',
      content: 'Trống đồng Đông Sơn là hiện vật tiêu biểu gắn liền với nền văn minh nào của dân tộc Việt Nam?',
      options: ['A. Văn minh Văn Lang - Âu Lạc', 'B. Văn minh Đại Việt', 'C. Văn minh Champa', 'D. Văn minh Phù Nam'],
      correctAnswer: 'A',
      recognition: 'Đặc trưng văn hóa Đông Sơn thời kỳ dựng nước thời các Vua Hùng và An Dương Vương.',
      explanation: 'Trống đồng Đông Sơn (như trống đồng Ngọc Lũ, Hoàng Hạ) phản ánh đỉnh cao kỹ nghệ đúc đồng và đời sống tâm linh của người Việt cổ thời Văn Lang - Âu Lạc.',
      difficulty: 'easy'
    }
  ]
};
