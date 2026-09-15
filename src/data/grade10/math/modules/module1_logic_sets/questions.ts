import type { Question } from '@/types';

export const g10MathModule1Questions: Question[] = [
  {
    "id": "math10-q1",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Hãy xác định tập hợp $A \\cap B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "(1; 3]",
    "acceptedAnswers": [
      "(1;3]",
      "(1; 3]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q2",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho tập hợp $A = [m; m + 2]$ và $B = [-1; 3]$. Tìm tất cả các giá trị thực của tham số m để $A \\cap B \\neq \\varnothing$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "-3 <= m <= 3",
    "acceptedAnswers": [
      "[-3; 3]",
      "-3 <= m <= 3",
      "m in [-3;3]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q6",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = [-3; 2)$ và $B = [0; 5)$. Hãy xác định tập hợp $A \\cap B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "[0; 2)",
    "acceptedAnswers": [
      "[0; 2)",
      "[0;2)",
      "[0; 2["
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q7",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = (-4; 1]$ và $B = (0; 3)$. Hãy xác định tập hợp $A \\cup B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "(-4; 3)",
    "acceptedAnswers": [
      "(-4; 3)",
      "(-4;3)",
      "]-4; 3["
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q8",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = [-2; 4]$ và $B = (1; 6]$. Hãy xác định tập hợp $A \\setminus B$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "[-2; 1]",
    "acceptedAnswers": [
      "[-2; 1]",
      "[-2;1]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q9",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = (-\\infty; 2]$ và $B = [-1; 4)$. Hãy xác định tập hợp $B \\setminus A$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "(2; 4)",
    "acceptedAnswers": [
      "(2; 4)",
      "(2;4)",
      "]2; 4["
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q10",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho tập hợp $A = [-3; 5)$. Hãy xác định phần bù của tập hợp A trong tập số thực $\\mathbb{R}$ (tức là $C_{\\mathbb{R}}A$).",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "(-\\infty; -3) \\cup [5; +\\infty)",
    "acceptedAnswers": [
      "(-\\infty; -3) \\cup [5; +\\infty)",
      "(-\\infty;-3) \\cup [5;+\\infty)",
      "(-\\infty; -3) U [5; +\\infty)",
      "(-\\infty;-3) U [5;+\\infty)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q11",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = [0; 3]$ và $B = (2; 6)$. Hãy xác định phần bù của tập hợp $A \\cup B$ trong tập số thực $\\mathbb{R}$ (tức là $C_{\\mathbb{R}}(A \\cup B)$).",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "(-\\infty; 0) \\cup [6; +\\infty)",
    "acceptedAnswers": [
      "(-\\infty; 0) \\cup [6; +\\infty)",
      "(-\\infty;0) \\cup [6;+\\infty)",
      "(-\\infty; 0) U [6; +\\infty)",
      "(-\\infty;0) U [6;+\\infty)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q12",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = (-\\infty; -2]$ và $B = [-2; +\\infty)$. Hãy xác định tập hợp $A \\cap B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "{-2}",
    "acceptedAnswers": [
      "{-2}",
      "{-2}",
      "[-2; -2]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q13",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho ba tập hợp $A = [-4; 2]$, $B = [-2; 4)$ và $C = (0; 5]$. Hãy xác định tập hợp $A \\cap B \\cap C$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "(0; 2]",
    "acceptedAnswers": [
      "(0; 2]",
      "(0;2]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q14",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hợp $A = [-3; 3]$ và $B = [-1; 2]$. Hãy xác định tập hợp $A \\setminus B$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "[-3; -1) \\cup (2; 3]",
    "acceptedAnswers": [
      "[-3; -1) \\cup (2; 3]",
      "[-3;-1) \\cup (2;3]",
      "[-3; -1) U (2; 3]",
      "[-3;-1) U (2;3]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q15",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho hai tập hợp $A = (m - 1; m + 3)$ và $B = (-\\infty; -3) \\cup [5; +\\infty)$. Tìm tất cả các giá trị của tham số m để $A \\cap B = \\varnothing$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "-2 <= m <= 2",
    "acceptedAnswers": [
      "-2 <= m <= 2",
      "[-2; 2]",
      "-2 <= m <= 2",
      "m in [-2;2]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q16",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho tập hợp $A = (m; m + 2)$ và $B = [-2; 4]$. Tìm tất cả các giá trị thực của tham số m để $A \\subset B$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "-2 <= m <= 2",
    "acceptedAnswers": [
      "-2 <= m <= 2",
      "[-2; 2]",
      "-2 <= m <= 2",
      "m in [-2;2]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q17",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho hai tập hợp $A = [m - 1; \\frac{m + 5}{2}]$ và $B = (-\\infty; -2) \\cup [3; +\\infty)$. Tìm tất cả các giá trị thực của m để $A \\cap B \\neq \\varnothing$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "m < -1 hoặc 1 <= m <= 7",
    "acceptedAnswers": [
      "m < -1 hoặc 1 <= m <= 7",
      "m < -1 hoac 1 <= m <= 7",
      "(-\\infty; -1) \\cup [1; 7]",
      "(-\\infty;-1) \\cup [1;7]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q18",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho tập hợp $A = [m; +\\infty)$ và $B = (5; +\\infty)$. Tìm điều kiện của tham số m để $A \\subset B$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "m > 5",
    "acceptedAnswers": [
      "m > 5",
      "m > 5",
      "(5; +\\infty)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q19",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho hai tập hợp $A = (m - 3; m]$ và $B = (1; 4)$. Tìm tất cả các giá trị của tham số m để $A \\cap B = \\varnothing$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "m <= 1 hoặc m >= 7",
    "acceptedAnswers": [
      "m <= 1 hoặc m >= 7",
      "m <= 1 hoac m >= 7",
      "(-\\infty; 1] \\cup [7; +\\infty)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q20",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho tập hợp $A = (-\\infty; m)$ và $B = (-\\infty; 2m - 1]$. Tìm tất cả các giá trị thực của m để $A \\subset B$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "m >= 1",
    "acceptedAnswers": [
      "m >= 1",
      "m >= 1",
      "[1; +\\infty)",
      "[1;+\\infty)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q21",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho hai tập hợp $A = [m; m + 3]$ và $B = [2m - 1; 2m + 2]$. Tìm điều kiện của tham số m để $A \\cap B \\neq \\varnothing$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "-2 <= m <= 4",
    "acceptedAnswers": [
      "-2 <= m <= 4",
      "[-2; 4]",
      "-2 <= m <= 4",
      "m in [-2;4]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q22",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho hai tập hợp $A = [2m - 1; 2m + 3]$ và $B = [-1; 5]$. Tìm tất cả các giá trị của tham số m để $A \\cap B = \\varnothing$.",
    "difficulty": "medium",
    "sourceType": "manual",
    "correctAnswer": "m < -2 hoặc m > 3",
    "acceptedAnswers": [
      "m < -2 hoặc m > 3",
      "m < -2 hoac m > 3",
      "m < -2 hoặc m > 3",
      "m < -2 hoac m > 3"
    ],
    "validatorType": "exact",
    "media": [
      {
        "id": "math10-q22-media-intervals",
        "type": "diagram",
        "src": "/assets/math/grade10/module1-disjoint-intervals.svg",
        "alt": "Hai trường hợp để khoảng A không giao khoảng B từ âm một đến năm: A nằm hoàn toàn bên trái hoặc hoàn toàn bên phải B.",
        "caption": "Sơ đồ định hướng điều kiện hai khoảng không giao nhau",
        "longDescription": "Hàng trên minh họa đầu phải của A phải nhỏ hơn đầu trái âm một của B. Hàng dưới minh họa đầu trái của A phải lớn hơn đầu phải năm của B.",
        "width": 760,
        "height": 360
      }
    ]
  },
  {
    "id": "math10-q23",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho tập hợp $A = [-3; 3]$ và $B = [m - 2; m + 5]$. Tìm điều kiện của tham số m để $A \\subset B$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "-2 <= m <= -1",
    "acceptedAnswers": [
      "-2 <= m <= -1",
      "[-2; -1]",
      "-2 <= m <= -1",
      "m in [-2;-1]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q64",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $U = \\{1;2;\\ldots;30\\}$, $A$ là tập các phần tử của $U$ chia hết cho 2 và $B$ là tập các phần tử của $U$ chia hết cho 3. Tính số phần tử của $U \\setminus (A \\cup B)$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "10",
    "acceptedAnswers": [
      "10",
      "10 phần tử",
      "10 phan tu"
    ],
    "validatorType": "number",
    "correctFinalAnswer": {
      "value": "10"
    },
    "acceptedFinalAnswers": [
      {
        "value": "10"
      }
    ],
    "answerSchema": {
      "type": "single-number",
      "fields": [
        {
          "key": "value",
          "label": "Số phần tử:",
          "valueType": "number",
          "placeholder": "Nhập số phần tử"
        }
      ],
      "proofImageRequired": false,
      "autoCheckMode": "numeric"
    }
  },
  {
    "id": "math10-q65",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-4;5]$, $B=(-2;7)$ và $C=[0;3]$. Xác định tập hợp $(A \\cup B) \\setminus C$.",
    "difficulty": "hard",
    "sourceType": "manual",
    "correctAnswer": "[-4; 0) \\cup (3; 7)",
    "acceptedAnswers": [
      "[-4; 0) \\cup (3; 7)",
      "[-4;0)\\cup(3;7)",
      "[-4; 0) U (3; 7)"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q66",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[-2;1]$ và $B=[m;4]$. Tìm điều kiện của $m$ để $A \\cap B \\ne \\varnothing$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "m <= 1",
    "acceptedAnswers": [
      "m <= 1",
      "m ≤ 1",
      "(-\\infty; 1]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q67",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m;4]$ và $B=[1;6]$. Tìm tất cả giá trị thực của $m$ để $A$ khác rỗng và $A \\subset B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "1 <= m <= 4",
    "acceptedAnswers": [
      "1 <= m <= 4",
      "1 ≤ m ≤ 4",
      "[1;4]",
      "m \\in [1;4]"
    ],
    "validatorType": "exact"
  },
  {
    "id": "math10-q68",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=(m-1;m+1)$ và $B=[-3;2]$. Tìm số nguyên lớn nhất $m$ để $A \\subset B$.",
    "difficulty": "easy",
    "sourceType": "manual",
    "correctAnswer": "1",
    "acceptedAnswers": [
      "1",
      "m = 1",
      "m=1"
    ],
    "validatorType": "number",
    "correctFinalAnswer": {
      "value": "1"
    },
    "acceptedFinalAnswers": [
      {
        "value": "1"
      }
    ],
    "answerSchema": {
      "type": "single-number",
      "fields": [
        {
          "key": "value",
          "label": "Giá trị lớn nhất của m:",
          "valueType": "number",
          "placeholder": "Nhập m"
        }
      ],
      "proofImageRequired": false,
      "autoCheckMode": "numeric"
    }
  },
  {
    "id": "math10-m1-q001",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-5;2]$ và $B=[-1;4)$. Tìm $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $(-5;4)$",
      "B. $(-1;2]$",
      "C. $[-1;2)$",
      "D. $[-1;2]$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q003",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;4]$ và $B=(1;+\\infty)$. Tìm $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $[1;4]$",
      "B. $(1;4)$",
      "C. $(1;4]$",
      "D. $(-\\infty;+\\infty)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q004",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-6;-2)$ và $B=(-4;1]$. Tìm $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $[-4;-2)$",
      "B. $(-4;-2]$",
      "C. $[-6;1]$",
      "D. $(-4;-2)$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q005",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-3;5)$ và $B=[5;8]$. Tìm $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $\\varnothing$",
      "B. $\\{5\\}$",
      "C. $(5;8]$",
      "D. $(-3;8]$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q007",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;-1)$ và $B=[-1;+\\infty)$. Tìm $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $\\{-1\\}$",
      "B. $(-\\infty;+\\infty)$",
      "C. $\\varnothing$",
      "D. $[-1;+\\infty)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q008",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trên trục số, miền tô của $A$ là $(-7;2]$, miền tô của $B$ là $[-3;2)$. Miền được tô đồng thời là tập nào?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $(-3;2]$",
      "B. $[-7;2]$",
      "C. $(-7;-3)$",
      "D. $[-3;2)$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q010",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;2)$ và $B=[2;6]$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;2)\\cup(2;6]$",
      "B. $(-\\infty;6]$",
      "C. $(-\\infty;6)$",
      "D. $[2;6]$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q011",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-5;-2]$ và $B=(1;4)$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $[-5;4)$",
      "B. $(-2;1)$",
      "C. $[-5;-2]\\cup(1;4)$",
      "D. $[-5;1)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q014",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-6;-1]$ và $B=(-2;2)$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $(-2;-1]$",
      "B. $(-6;2)$",
      "C. $[-6;2]$",
      "D. $(-6;-2)\\cup(-1;2)$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q015",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;-4]$ và $B=(-4;+\\infty)$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $\\mathbb{R}\\setminus\\{-4\\}$",
      "B. $(-\\infty;-4]$",
      "C. $\\mathbb{R}$",
      "D. $(-4;+\\infty)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q016",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-2;0)$ và $B=(0;3)$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $(-2;3)$",
      "B. $[-2;3]$",
      "C. $(-2;0]\\cup[0;3)$",
      "D. $(-2;0)\\cup(0;3)$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q017",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-8;-3)$ và $B=[-3;1]$. Tìm $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $[-8;1]$",
      "B. $[-8;-3)\\cup(-3;1]$",
      "C. $(-8;1]$",
      "D. $[-3;1]$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q019",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trên trục số, $A=(-5;-1]$ và $B=[-1;4)$. Miền thuộc A hoặc B là tập nào?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $(-5;-1)\\cup(-1;4)$",
      "B. $[-5;4)$",
      "C. $(-5;4)$",
      "D. $(-1;4)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q021",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;3)$, $B=[0;5]$. Tìm $A\\setminus B$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;0)$",
      "B. $(-\\infty;0]$",
      "C. $[3;5]$",
      "D. $[0;3)$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q022",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-4;6)$, $B=[-4;2)$. Tìm $A\\setminus B$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(2;6)$",
      "B. $[2;6)$",
      "C. $(-4;2)$",
      "D. $[-4;6)$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q025",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-6;2)$, $B=[2;5]$. Tìm $A\\setminus B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $[-6;2)$",
      "B. $[-6;2]$",
      "C. $\\varnothing$",
      "D. $[2;5]$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q026",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-2;5)$ và $B=(-2;5)$. Tìm $A\\setminus B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $(-2;5)$",
      "B. $\\varnothing$",
      "C. $\\{-2;5\\}$",
      "D. $[-2;5]$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q027",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=[-5;6]$, $B=(-1;8)$, $C=[2;4)$. Tìm $(A\\cap B)\\setminus C$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $[-5;2)\\cup[4;8)$",
      "B. $(-1;4)\\cup[6;8)$",
      "C. $(-1;2)\\cup[4;6]$",
      "D. $(-1;6]$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q028",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=(-3;4]$. Tìm $C_{\\mathbb R}A$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;-3)\\cup[4;+\\infty)$",
      "B. $[-3;4]$",
      "C. $(-3;4]$",
      "D. $(-\\infty;-3]\\cup(4;+\\infty)$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q029",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=[1;+\\infty)$. Tìm phần bù của A.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;1)$",
      "B. $(-\\infty;1]$",
      "C. $(1;+\\infty)$",
      "D. $[1;+\\infty)$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q030",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=(-\\infty;-2)$. Tìm phần bù của A.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $(-2;+\\infty)$",
      "B. $[-2;+\\infty)$",
      "C. $(-\\infty;-2]$",
      "D. $[-2;+\\infty]$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q031",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=(-5;0)\\cup[3;7]$. Tìm phần bù của A.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;-5)\\cup(0;3]\\cup[7;+\\infty)$",
      "B. $(-5;0)\\cup[3;7]$",
      "C. $(-\\infty;-5]\\cup[0;3)\\cup(7;+\\infty)$",
      "D. $[-5;0]\\cup(3;7)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q032",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $A=(-\\infty;2)\\cup(2;+\\infty)$. Tìm $C_{\\mathbb R}A$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $\\varnothing$",
      "B. $\\mathbb R$",
      "C. $(-\\infty;2]$",
      "D. $\\{2\\}$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q033",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho $U=\\{1,2,\\ldots,12\\}$ và A là tập các số chẵn trong U. Tìm $C_UA$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $\\{1,3,5,7,9,11\\}$",
      "B. $\\{2,4,6,8,10,12\\}$",
      "C. $\\{1,2,3,4,5,6\\}$",
      "D. $\\varnothing$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q034",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong tập nền $U=[-5;5]$, cho $A=(-2;3]$. Tìm $C_UA$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $[-5;-2)\\cup[3;5]$",
      "B. $[-5;-2]\\cup(3;5]$",
      "C. $(-\\infty;-2]\\cup(3;+\\infty)$",
      "D. $(-2;3]$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q035",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong tập nền $U=(-4;6]$, cho $A=[0;4)$. Tìm $C_UA$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $[-4;0]\\cup(4;6]$",
      "B. $(-\\infty;0)\\cup[4;+\\infty)$",
      "C. $(-4;0)\\cup[4;6]$",
      "D. $[0;4)$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q036",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=[-2;5]$, $B=(1;8)$. Tìm phần bù của $A\\cap B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $(-\\infty;-2)\\cup[8;+\\infty)$",
      "B. $(1;5]$",
      "C. $(-\\infty;1)\\cup[5;+\\infty)$",
      "D. $(-\\infty;1]\\cup(5;+\\infty)$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q037",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong $\\mathbb R$, cho $A=(-\\infty;-1)$, $B=[2;+\\infty)$. Tìm phần bù của $A\\cup B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $[-1;2)$",
      "B. $(-1;2]$",
      "C. $(-\\infty;-1]\\cup(2;+\\infty)$",
      "D. $[-1;2]$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q038",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Một lớp có 40 học sinh, 22 bạn thích Toán, 18 bạn thích Tin và 8 bạn thích cả hai. Có bao nhiêu bạn không thích môn nào?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $10$",
      "B. $8$",
      "C. $16$",
      "D. $32$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q039",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Có 25 học sinh học tiếng Anh, 17 học tiếng Nhật và 9 học cả hai. Số học sinh học ít nhất một ngoại ngữ là bao nhiêu?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $42$",
      "B. $16$",
      "C. $33$",
      "D. $51$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q040",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong 50 khách hàng, 30 người mua sản phẩm A, 24 người mua B và 12 người mua cả hai. Có bao nhiêu người chỉ mua A?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $30$",
      "B. $42$",
      "C. $6$",
      "D. $18$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q041",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Một khảo sát có $|A|=28$, $|B|=21$ và $|A\\cup B|=40$. Tính $|A\\cap B|$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $9$",
      "B. $49$",
      "C. $7$",
      "D. $12$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q042",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Có 60 học sinh; 35 bạn tham gia bóng đá, 27 bạn tham gia cầu lông, 15 bạn tham gia cả hai. Có bao nhiêu bạn chỉ tham gia đúng một môn?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $47$",
      "B. $32$",
      "C. $17$",
      "D. $45$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q043",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong 80 người, 46 người dùng ứng dụng X, 38 người dùng Y và 20 người dùng cả hai. Có bao nhiêu người không dùng ứng dụng nào?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $64$",
      "B. $4$",
      "C. $16$",
      "D. $36$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q044",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Một câu lạc bộ có 45 thành viên. 26 người biết bơi, 23 người biết chạy bền và 7 người không biết cả hai. Có bao nhiêu người biết cả bơi và chạy bền?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $4$",
      "B. $38$",
      "C. $42$",
      "D. $11$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q045",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Cho hai tập hữu hạn A, B với $|A\\setminus B|=14$, $|B\\setminus A|=9$ và $|A\\cap B|=6$. Tính $|A\\cup B|$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $29$",
      "B. $23$",
      "C. $35$",
      "D. $17$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q046",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Trong các số từ 1 đến 100, có bao nhiêu số chia hết cho 2 hoặc 5?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $70$",
      "B. $60$",
      "C. $50$",
      "D. $40$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q047",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Một trường có 120 học sinh: 68 học CLB Khoa học, 54 học CLB Nghệ thuật và 30 học cả hai. Số học sinh chỉ tham gia đúng một CLB là bao nhiêu?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $92$",
      "B. $32$",
      "C. $62$",
      "D. $122$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q048",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt1",
    "content": "Ba tập A, B, C có $|A|=20$, $|B|=18$, $|C|=15$, $|A\\cap B|=7$, $|A\\cap C|=6$, $|B\\cap C|=5$, $|A\\cap B\\cap C|=2$. Tính $|A\\cup B\\cup C|$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $35$",
      "B. $39$",
      "C. $53$",
      "D. $37$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q049",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m;m+3]$, $B=[1;5]$. Tìm m để $A\\cap B\\ne\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $-2\\le m\\le5$",
      "B. $m<-2\\text{ hoặc }m>5$",
      "C. $-2<m<5$",
      "D. $1\\le m\\le2$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q050",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m-1;m+2]$, $B=[-3;0]$. Tìm m để hai đoạn có điểm chung.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $-3\\le m\\le0$",
      "B. $-5\\le m\\le1$",
      "C. $m<-5\\text{ hoặc }m>1$",
      "D. $-5<m<1$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q051",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m;2m+4]$, $B=[6;10]$. Tìm m để $A\\cap B\\ne\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $2\\le m\\le3$",
      "B. $m<1\\text{ hoặc }m>5$",
      "C. $1\\le m\\le5$",
      "D. $1<m<5$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q052",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m;m+1]$, $B=[-4;-1]$. Tìm m để giao khác rỗng.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $-4\\le m\\le-2$",
      "B. $m<-5\\text{ hoặc }m>-1$",
      "C. $-5<m<-1$",
      "D. $-5\\le m\\le-1$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q053",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[3m-1;3m+2]$, $B=[5;8]$. Tìm m để hai đoạn giao nhau.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $1\\le m\\le3$",
      "B. $2\\le m\\le\\frac{8}{3}$",
      "C. $m<1\\text{ hoặc }m>3$",
      "D. $1<m<3$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q054",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m-2;m+4]$, $B=[7;9]$. Tìm m để $A\\cap B\\ne\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $5\\le m\\le7$",
      "B. $3\\le m\\le11$",
      "C. $m<3\\text{ hoặc }m>11$",
      "D. $3<m<11$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q055",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[-m;-m+2]$, $B=[1;4]$. Tìm m để hai đoạn có điểm chung.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $-1\\le m\\le4$",
      "B. $m<-4\\text{ hoặc }m>1$",
      "C. $-4\\le m\\le1$",
      "D. $-4<m<1$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q056",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m-3;2m+1]$, $B=[-2;6]$. Tìm m để giao khác rỗng.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $-\\frac12\\le m\\le\\frac32$",
      "B. $m<-\\frac32\\text{ hoặc }m>\\frac92$",
      "C. $-2\\le m\\le6$",
      "D. $-\\frac32\\le m\\le\\frac92$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q057",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m-1;m+2]$, $B=[0;6]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $1\\le m\\le4$",
      "B. $0\\le m\\le6$",
      "C. $-1\\le m\\le8$",
      "D. $m\\le1\\text{ hoặc }m\\ge4$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q058",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m;2m+3]$, $B=[-4;7]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $-4\\le m\\le7$",
      "B. $-2\\le m\\le2$",
      "C. $-2<m<2$",
      "D. $m\\le-2\\text{ hoặc }m\\ge2$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q059",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=(m-2;m+5)$, $B=[-1;9]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $-1<m<9$",
      "B. $-3\\le m\\le11$",
      "C. $1\\le m\\le4$",
      "D. $1<m<4$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q060",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[3m-2;3m+1]$, $B=[4;13]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $\\frac23\\le m\\le\\frac{13}{3}$",
      "B. $2<m<4$",
      "C. $m\\le2\\text{ hoặc }m\\ge4$",
      "D. $2\\le m\\le4$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q061",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[-m;-m+4]$, $B=[-6;2]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $2\\le m\\le6$",
      "B. $-6\\le m\\le2$",
      "C. $-2\\le m\\le6$",
      "D. $m\\le2\\text{ hoặc }m\\ge6$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q062",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m-5;2m+1]$, $B=[-3;11]$. Tìm m để $A\\subset B$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $-3\\le m\\le11$",
      "B. $1\\le m\\le5$",
      "C. $1<m<5$",
      "D. $m\\le1\\text{ hoặc }m\\ge5$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q063",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m;m+2]$, $B=[5;8]$. Tìm m để $A\\cap B=\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $3\\le m\\le8$",
      "B. $m\\le3\\text{ hoặc }m\\ge8$",
      "C. $m<3\\text{ hoặc }m>8$",
      "D. $m<5\\text{ hoặc }m>6$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q064",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m-1;m+1]$, $B=[-2;2]$. Tìm m để hai đoạn rời nhau.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $-3\\le m\\le3$",
      "B. $m\\le-3\\text{ hoặc }m\\ge3$",
      "C. $m<-1\\text{ hoặc }m>1$",
      "D. $m<-3\\text{ hoặc }m>3$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q065",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m;2m+3]$, $B=[7;10]$. Tìm m để $A\\cap B=\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. $m<2\\text{ hoặc }m>5$",
      "B. $2\\le m\\le5$",
      "C. $m\\le2\\text{ hoặc }m\\ge5$",
      "D. $m<\\frac72\\text{ hoặc }m>\\frac72$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q066",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m;m+4]$, $B=[-6;-2]$. Tìm m để hai đoạn không có điểm chung.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $-10\\le m\\le-2$",
      "B. $m<-10\\text{ hoặc }m>-2$",
      "C. $m\\le-10\\text{ hoặc }m\\ge-2$",
      "D. $m<-6\\text{ hoặc }m>-6$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q067",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[3m-2;3m+1]$, $B=[4;9]$. Tìm m để $A\\cap B=\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $1\\le m\\le\\frac{11}{3}$",
      "B. $m\\le1\\text{ hoặc }m\\ge\\frac{11}{3}$",
      "C. $m<1\\text{ hoặc }m>\\frac{11}{3}$",
      "D. $m<2\\text{ hoặc }m>3$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q068",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[-m;-m+2]$, $B=[3;6]$. Tìm m để hai đoạn rời nhau.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $-6\\le m\\le-1$",
      "B. $m\\le-6\\text{ hoặc }m\\ge-1$",
      "C. $m<-3\\text{ hoặc }m>1$",
      "D. $m<-6\\text{ hoặc }m>-1$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q069",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[2m-1;2m+5]$, $B=[-4;4]$. Tìm m để giao bằng rỗng.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $m<-\\frac92\\text{ hoặc }m>\\frac52$",
      "B. $-\\frac92\\le m\\le\\frac52$",
      "C. $m\\le-\\frac92\\text{ hoặc }m\\ge\\frac52$",
      "D. $m<-2\\text{ hoặc }m>2$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q070",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m^2;m^2+1]$, $B=[2;5]$. Điều kiện nào tương đương $A\\cap B=\\varnothing$?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $m^2>5$",
      "B. $m^2<1\\text{ hoặc }m^2>5$",
      "C. $m^2<1$",
      "D. $1\\le m^2\\le5$"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q071",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt2",
    "content": "Cho $A=[m-3;m+3]$, $B=[-1;1]$. Tìm m để $A\\cap B=\\varnothing$.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $-4\\le m\\le4$",
      "B. $m\\le-4\\text{ hoặc }m\\ge4$",
      "C. $m<-4\\text{ hoặc }m>4$",
      "D. $m<-2\\text{ hoặc }m>2$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q072",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Câu nào sau đây là một mệnh đề?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Bạn học bài chưa?",
      "B. Hãy đóng cửa lại.",
      "C. x+1=3.",
      "D. 7 là số nguyên tố."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q073",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề “9 là số nguyên tố” có giá trị chân lí nào?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Sai",
      "B. Đúng",
      "C. Không xác định",
      "D. Vừa đúng vừa sai"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q074",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phát biểu nào không phải là mệnh đề?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. 2+3=5.",
      "B. Hãy tính 2+3.",
      "C. Tam giác có ba cạnh.",
      "D. 10 nhỏ hơn 4."
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q075",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Xét câu “$x^2=4$”. Khi chưa xác định x, đây là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Mệnh đề đúng",
      "B. Mệnh đề sai",
      "C. Mệnh đề chứa biến",
      "D. Mệnh đề tương đương"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q076",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề nào sau đây đúng?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Mọi số nguyên tố đều lẻ.",
      "B. Có số thực lớn nhất.",
      "C. Bình phương mọi số thực đều âm.",
      "D. Mọi số nguyên chẵn đều chia hết cho 2."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q077",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề “Nếu n chia hết cho 6 thì n chia hết cho 3” đúng hay sai trên tập số nguyên?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Đúng",
      "B. Sai",
      "C. Chỉ đúng khi n>0",
      "D. Không xác định"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q078",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phát biểu “Có một số thực x sao cho $x^2=-1$” có giá trị chân lí nào?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Đúng",
      "B. Sai",
      "C. Đúng với x=-1",
      "D. Không xác định"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q079",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Trong các câu sau, câu nào là mệnh đề sai?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Mọi hình vuông đều là hình chữ nhật.",
      "B. Có số nguyên âm.",
      "C. Mọi hình thoi đều là hình vuông.",
      "D. Tổng hai số lẻ là số chẵn."
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q080",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Cho $P(n)$: “$n^2-n$ là số chẵn”, với n nguyên. Kết luận nào đúng?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $P(n)$ chỉ đúng khi n chẵn",
      "B. $P(n)$ chỉ đúng khi n lẻ",
      "C. $P(n)$ luôn sai",
      "D. $P(n)$ đúng với mọi số nguyên n"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q081",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề nào có thể bác bỏ bằng phản ví dụ x=0?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Mọi số thực x đều thỏa $x^2>0$.",
      "B. Mọi số thực x đều thỏa $x^2\\ge0$.",
      "C. Có số thực x thỏa x=0.",
      "D. Nếu x>1 thì x>0."
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q082",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Cho bảng chân trị của một câu luôn nhận giá trị đúng với mọi trường hợp. Câu đó được gọi là gì?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Hằng sai",
      "B. Hằng đúng",
      "C. Mệnh đề chứa biến",
      "D. Phản ví dụ"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q083",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phát biểu nào mô tả đúng vai trò của phản ví dụ?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Một ví dụ đúng đủ chứng minh mệnh đề toàn thể.",
      "B. Phản ví dụ chỉ dùng cho mệnh đề tồn tại.",
      "C. Một phản ví dụ đủ bác bỏ mệnh đề toàn thể.",
      "D. Cần vô hạn phản ví dụ mới bác bỏ được."
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q084",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của mệnh đề “5 là số nguyên tố” là gì?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. 5 là số hợp.",
      "B. 5 là số lẻ.",
      "C. 5 không phải là số tự nhiên.",
      "D. 5 không phải là số nguyên tố."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q085",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Mọi học sinh lớp 10A đều đi học đúng giờ” là gì?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Có ít nhất một học sinh lớp 10A không đi học đúng giờ.",
      "B. Mọi học sinh lớp 10A đều đi học muộn.",
      "C. Không có học sinh lớp 10A đi học đúng giờ.",
      "D. Có học sinh lớp 10A đi học đúng giờ."
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q086",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Có một số nguyên n chia hết cho 7” là gì?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Có số nguyên n không chia hết cho 7.",
      "B. Mọi số nguyên n đều không chia hết cho 7.",
      "C. Mọi số nguyên n đều chia hết cho 7.",
      "D. Không phải mọi số nguyên đều chia hết cho 7."
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q087",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định đúng của mệnh đề “$x>2$” là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $x<2$",
      "B. $x\\ge2$",
      "C. $x\\le2$",
      "D. $x=2$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q088",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “$a=b$ và $c=d$” là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $a\\ne b$ và $c\\ne d$",
      "B. $a=b$ hoặc $c=d$",
      "C. $a\\ne b$ kéo theo $c\\ne d$",
      "D. $a\\ne b$ hoặc $c\\ne d$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q089",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “$a>0$ hoặc $b>0$” là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $a\\le0$ và $b\\le0$",
      "B. $a\\le0$ hoặc $b\\le0$",
      "C. $a<0$ và $b<0$",
      "D. $a>0$ và $b>0$"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q090",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Với mọi số thực x, $x^2+1>0$” là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Với mọi x, $x^2+1\\le0$.",
      "B. Có số thực x sao cho $x^2+1\\le0$.",
      "C. Có x sao cho $x^2+1>0$.",
      "D. Không có x sao cho $x^2+1>0$."
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q091",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Có số tự nhiên n sao cho n vừa chẵn vừa chia hết cho 3” là gì?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Mọi n đều lẻ và không chia hết cho 3.",
      "B. Có n lẻ hoặc không chia hết cho 3.",
      "C. Mọi số tự nhiên n đều lẻ hoặc không chia hết cho 3.",
      "D. Không có số tự nhiên chẵn."
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q092",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề phủ định của “Nếu trời mưa thì đường ướt” là gì?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Nếu trời không mưa thì đường không ướt.",
      "B. Trời không mưa hoặc đường ướt.",
      "C. Nếu đường ướt thì trời mưa.",
      "D. Trời mưa và đường không ướt."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q093",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Mọi phương trình bậc hai đều có hai nghiệm phân biệt” là gì?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Có phương trình bậc hai không có hai nghiệm phân biệt.",
      "B. Mọi phương trình bậc hai đều vô nghiệm.",
      "C. Có phương trình bậc hai có hai nghiệm phân biệt.",
      "D. Không có phương trình bậc hai nào có nghiệm."
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q094",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phủ định của “Không có số nguyên lớn nhất” là gì?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Mọi số nguyên đều lớn nhất.",
      "B. Có một số nguyên lớn nhất.",
      "C. Có số nguyên không lớn nhất.",
      "D. Không có số nguyên nhỏ nhất."
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q095",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Chọn cặp biến đổi phủ định đúng.",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $\\neg(\\forall x,P(x))\\equiv\\forall x,\\neg P(x)$",
      "B. $\\neg(\\exists x,P(x))\\equiv\\exists x,\\neg P(x)$",
      "C. $\\neg(\\forall x,P(x))\\equiv\\exists x,\\neg P(x)$",
      "D. $\\neg(P\\land Q)\\equiv\\neg P\\land\\neg Q$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q096",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề đảo của “Nếu một số chia hết cho 4 thì số đó chẵn” là gì?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Nếu một số không chia hết cho 4 thì số đó lẻ.",
      "B. Một số chia hết cho 4 khi và chỉ khi nó chẵn.",
      "C. Nếu một số lẻ thì nó không chia hết cho 4.",
      "D. Nếu một số chẵn thì số đó chia hết cho 4."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q097",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Trong mệnh đề “Nếu tam giác ABC cân tại A thì AB=AC”, điều kiện “tam giác cân tại A” là gì đối với AB=AC?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Điều kiện đủ",
      "B. Điều kiện cần",
      "C. Điều kiện cần và đủ",
      "D. Không liên quan"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q098",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Trong mệnh đề “Nếu n chia hết cho 6 thì n chia hết cho 3”, tính chia hết cho 3 là gì?",
    "responseType": "single_choice",
    "difficulty": "easy",
    "sourceType": "manual",
    "options": [
      "A. Điều kiện đủ",
      "B. Điều kiện cần",
      "C. Điều kiện cần và đủ",
      "D. Phủ định"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q099",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề nào tương đương với $P\\Rightarrow Q$?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. $Q\\Rightarrow P$",
      "B. $\\neg P\\Rightarrow\\neg Q$",
      "C. $\\neg Q\\Rightarrow\\neg P$",
      "D. $P\\land\\neg Q$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q100",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề “Nếu $x=2$ thì $x^2=4$” có mệnh đề đảo nào đúng?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. Nếu $x^2=4$ thì $x=2$ là đúng.",
      "B. $x=2$ khi và chỉ khi $x^2=4$.",
      "C. Mệnh đề gốc sai.",
      "D. Nếu $x^2=4$ thì $x=2$ là sai."
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q101",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Phát biểu “n chẵn khi và chỉ khi $n^2$ chẵn” gồm hai chiều nào?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. n chẵn ⇒ n² chẵn và n² chẵn ⇒ n chẵn",
      "B. Chỉ có n chẵn ⇒ n² chẵn",
      "C. n lẻ ⇒ n² chẵn và ngược lại",
      "D. n² chẵn ⇒ n lẻ"
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q102",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Điều kiện nào là cần và đủ để số nguyên n chia hết cho 10?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. n chia hết cho 2",
      "B. n chia hết cho cả 2 và 5",
      "C. n chia hết cho 5",
      "D. n có chữ số tận cùng là 5"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q103",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Mệnh đề $P\\Rightarrow Q$ sai trong trường hợp nào?",
    "responseType": "single_choice",
    "difficulty": "medium",
    "sourceType": "manual",
    "options": [
      "A. P đúng, Q đúng",
      "B. P sai, Q đúng",
      "C. P đúng, Q sai",
      "D. P sai, Q sai"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q104",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Cho P: “x>3”, Q: “x>1”. Mệnh đề nào đúng với mọi số thực x?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $Q\\Rightarrow P$",
      "B. $P\\Leftrightarrow Q$",
      "C. $\\neg P\\Rightarrow\\neg Q$",
      "D. $P\\Rightarrow Q$"
    ],
    "correctAnswer": "D",
    "acceptedAnswers": [
      "D"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q105",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Cho mệnh đề “Nếu tứ giác là hình vuông thì nó là hình thoi”. Phản đảo là gì?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Nếu tứ giác không là hình thoi thì nó không là hình vuông.",
      "B. Nếu tứ giác là hình thoi thì nó là hình vuông.",
      "C. Nếu tứ giác không là hình vuông thì nó không là hình thoi.",
      "D. Tứ giác là hình vuông khi và chỉ khi là hình thoi."
    ],
    "correctAnswer": "A",
    "acceptedAnswers": [
      "A"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q106",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Để chứng minh $P\\Leftrightarrow Q$, phương án nào đầy đủ?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. Chỉ chứng minh $P\\Rightarrow Q$",
      "B. Chứng minh cả $P\\Rightarrow Q$ và $Q\\Rightarrow P$",
      "C. Chỉ tìm một ví dụ P,Q cùng đúng",
      "D. Chứng minh $P\\land Q$ đúng trong một trường hợp"
    ],
    "correctAnswer": "B",
    "acceptedAnswers": [
      "B"
    ],
    "validatorType": "choice"
  },
  {
    "id": "math10-m1-q107",
    "subjectId": "math",
    "topicId": "math10-t1",
    "questionTypeId": "math10-qt17",
    "content": "Câu “A là điều kiện đủ để có B” được kí hiệu đúng thế nào?",
    "responseType": "single_choice",
    "difficulty": "hard",
    "sourceType": "manual",
    "options": [
      "A. $B\\Rightarrow A$",
      "B. $A\\Leftrightarrow B$",
      "C. $A\\Rightarrow B$",
      "D. $A\\land B$"
    ],
    "correctAnswer": "C",
    "acceptedAnswers": [
      "C"
    ],
    "validatorType": "choice"
  }
];
