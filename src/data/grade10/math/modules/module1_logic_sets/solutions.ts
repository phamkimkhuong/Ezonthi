import type { Solution } from '@/types';

export const g10MathModule1Solutions: Solution[] = [
  {
    "id": "math10-s1",
    "questionId": "math10-q1",
    "recognition": "Tìm giao của hai tập hợp biểu diễn dưới dạng khoảng, đoạn số học.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn tập hợp A và B trên trục số",
        "explanation": "Vẽ một trục số thực $\\mathbb{R}$. Biểu diễn đoạn $A = [-2; 3]$ bằng cách lấy phần từ $-2$ đến $3$ (sử dụng ngoặc vuông) và gạch bỏ phần còn lại. Tương tự, biểu diễn khoảng $B = (1; 5)$ bằng cách lấy phần từ $1$ đến $5$ (sử dụng ngoặc tròn).",
        "result": "Đã biểu diễn A và B."
      },
      {
        "order": 2,
        "title": "Xác định giao của hai tập hợp",
        "explanation": "Giao của hai tập hợp $A \\cap B$ là phần trục số không bị gạch bỏ bởi cả hai tập hợp A và B. Phần giao nhau bắt đầu từ lớn hơn $1$ (ngoặc tròn từ B) đến bé hơn hoặc bằng $3$ (ngoặc vuông từ A). Do đó, $A \\cap B = (1; 3]$.",
        "result": "(1; 3]"
      }
    ],
    "finalAnswer": "(1; 3]",
    "commonMistakes": [
      "Viết nhầm đầu ngoặc thành $[1; 3]$ hoặc $(1; 3)$ do không chú ý dấu ngoặc tròn ở số 1 của tập B."
    ],
    "reviewSuggestions": [
      "Xem lại kỹ định nghĩa phép giao ($\\cap$) của hai tập hợp và quy tắc lấy ngoặc tròn/ngoặc vuông."
    ]
  },
  {
    "id": "math10-s2",
    "questionId": "math10-q2",
    "recognition": "Bài toán tìm tham số m để hai tập hợp số giao nhau khác rỗng bằng phương pháp phủ định.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Tìm điều kiện để A giao B bằng rỗng",
        "explanation": "Ta có $A = [m; m + 2]$ là đoạn luôn có nghĩa vì $m < m + 2$. Tập hợp $B = [-1; 3]$. Để $A \\cap B = \\varnothing$, đoạn A phải nằm hoàn toàn bên trái hoặc bên phải đoạn B. \nTrường hợp 1 (A nằm bên trái B): $m + 2 < -1 \\Leftrightarrow m < -3$.\nTrường hợp 2 (A nằm bên phải B): $m > 3$. \nVậy $A \\cap B = \\varnothing \\Leftrightarrow m < -3$ hoặc $m > 3$.",
        "result": "m < -3 hoặc m > 3"
      },
      {
        "order": 2,
        "title": "Lấy phủ định để tìm điều kiện giao nhau khác rỗng",
        "explanation": "Điều kiện để $A \\cap B \\neq \\varnothing$ là phủ định của điều kiện trên. Do đó: $-3 \\le m \\le 3$.",
        "result": "-3 <= m <= 3"
      }
    ],
    "finalAnswer": "-3 <= m <= 3",
    "commonMistakes": [
      "Lấy nhầm dấu ngoặc đơn thành ngoặc vuông hoặc ngược lại ở mốc biên biên độ m = -3 và m = 3.",
      "Quên không xét cả hai phía bên trái và bên phải của đoạn B."
    ],
    "reviewSuggestions": [
      "Luôn vẽ trục số thực để hình dung trực quan vị trí tương đối giữa hai tập hợp."
    ]
  },
  {
    "id": "math10-s6",
    "questionId": "math10-q6",
    "recognition": "Phép giao hai nửa khoảng có chứa điểm mút chung.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn tập hợp A và B trên trục số",
        "explanation": "Sắp xếp các điểm biên của hai tập hợp theo thứ tự tăng dần: $-3 < 0 < 2 < 5$. Vẽ trục số thực, xác định đoạn nửa khoảng $A = [-3; 2)$ và $B = [0; 5)$.",
        "result": "Đã biểu diễn A và B."
      },
      {
        "order": 2,
        "title": "Tìm giao của hai tập hợp",
        "explanation": "Lọc các phần tử đồng thời thuộc cả $A$ và $B$. Phần chung này bắt đầu từ $0$ (lấy vì có ngoặc vuông $[$ ở $B$) đến $2$ (không lấy vì có ngoặc tròn $)$ ở $A$). Do đó: $A \\cap B = [0; 2)$.",
        "result": "[0; 2)"
      }
    ],
    "finalAnswer": "[0; 2)",
    "commonMistakes": [
      "Ghi nhầm đầu mút thành $(0; 2)$ hoặc $[0; 2]$ do không chú ý dấu ngoặc tròn tại điểm 2 của tập A."
    ],
    "reviewSuggestions": [
      "Xem lại khái niệm phần chung của phép giao, chú ý nếu một tập hợp chứa mốc biên nhưng tập kia không chứa thì giao của chúng sẽ không chứa mốc đó."
    ]
  },
  {
    "id": "math10-s7",
    "questionId": "math10-q7",
    "recognition": "Phép hợp của khoảng và nửa khoảng.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Xác định các đầu mút biên và biểu diễn",
        "explanation": "Sắp xếp các điểm biên theo thứ tự tăng dần: $-4 < 0 < 1 < 3$. Biểu diễn khoảng $A = (-4; 1]$ và khoảng $B = (0; 3)$ trên trục số.",
        "result": "Đã biểu diễn A và B."
      },
      {
        "order": 2,
        "title": "Xác định tập hợp hợp",
        "explanation": "Hợp của hai tập hợp là phần trục số trải dài từ giá trị nhỏ nhất của tập này đến giá trị lớn nhất của tập kia mà không bị ngắt quãng. Vì hai tập giao nhau khác rỗng (giao là $(0;1]$), hợp của chúng sẽ kéo dài từ $-4$ đến $3$. Cả hai biên đều sử dụng ngoặc tròn. Do đó: $A \\cup B = (-4; 3)$.",
        "result": "(-4; 3)"
      }
    ],
    "finalAnswer": "(-4; 3)",
    "commonMistakes": [
      "Ghi nhầm ngoặc tròn ở số 3 thành ngoặc vuông, hoặc ghi nhầm thành $(-4; 1]$ do không gộp cả tập B."
    ],
    "reviewSuggestions": [
      "Luôn chú ý tô đậm toàn bộ các khoảng thuộc ít nhất một trong hai tập hợp trên trục số để tránh bỏ sót phần tử."
    ]
  },
  {
    "id": "math10-s8",
    "questionId": "math10-q8",
    "recognition": "Phép hiệu của hai tập hợp số (trừ đoạn cho khoảng).",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Giữ lại đoạn A và loại bỏ tập B",
        "explanation": "Đoạn $A = [-2; 4]$ và khoảng $B = (1; 6]$. Khi thực hiện hiệu $A \\setminus B$, ta gạch bỏ toàn bộ phần bên phải điểm 1 thuộc khoảng B. Phần còn lại thuộc A là từ $-2$ đến $1$.",
        "result": "Đoạn còn lại từ -2 đến 1"
      },
      {
        "order": 2,
        "title": "Đảo ngoặc tại điểm mút chung x = 1",
        "explanation": "Do $1$ không thuộc $B$ (ngoặc tròn ở $B$), nên khi bỏ đi tập $B$, điểm $1$ vẫn không bị trừ đi. Điểm $1$ vẫn thuộc $A$, do đó ta lấy điểm $1$. Ngoặc tròn $($ tại $1$ trong $B$ đổi thành ngoặc vuông $]$ trong kết quả hiệu. Kết quả: $A \\setminus B = [-2; 1]$.",
        "result": "[-2; 1]"
      }
    ],
    "finalAnswer": "[-2; 1]",
    "commonMistakes": [
      "Ghi nhầm ngoặc vuông ở điểm 1 thành ngoặc tròn $[-2; 1)$ do không áp dụng quy tắc đảo dấu ngoặc của phép hiệu."
    ],
    "reviewSuggestions": [
      "Nhớ quy tắc vàng: Khi tính hiệu $A \\setminus B$, dấu ngoặc tại mút biên của $B$ sẽ bị **ngược lại** ở kết quả."
    ]
  },
  {
    "id": "math10-s9",
    "questionId": "math10-q9",
    "recognition": "Phép hiệu của hai tập hợp số (trừ nửa khoảng cho khoảng vô hạn).",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Giữ lại nửa khoảng B và loại bỏ tập A",
        "explanation": "Tập $B = [-1; 4)$ và $A = (-\\infty; 2]$. Ta gạch bỏ toàn bộ phần thuộc A (nhỏ hơn hoặc bằng 2). Phần còn lại của B nằm từ $2$ đến $4$.",
        "result": "Đoạn từ 2 đến 4"
      },
      {
        "order": 2,
        "title": "Đảo ngoặc tại điểm biên chung x = 2",
        "explanation": "Vì điểm $2$ thuộc $A$ (ngoặc vuông ở $A$), nên khi bỏ đi tập $A$, điểm $2$ cũng bị trừ đi hoàn toàn và không thể có mặt trong kết quả hiệu. Ngoặc vuông $]$ tại $2$ ở tập A sẽ đảo thành ngoặc tròn $($ ở kết quả. Đầu mút $4$ giữ nguyên ngoặc tròn. Kết quả: $B \\setminus A = (2; 4)$.",
        "result": "(2; 4)"
      }
    ],
    "finalAnswer": "(2; 4)",
    "commonMistakes": [
      "Ghi nhầm đầu mút tại 2 thành ngoặc vuông $[2; 4)$ do quên trừ đi giá trị biên 2 đã thuộc tập A."
    ],
    "reviewSuggestions": [
      "Xem lại kỹ lý thuyết phép hiệu: phần tử thuộc hiệu $B \\setminus A$ bắt buộc phải KHÔNG thuộc A."
    ]
  },
  {
    "id": "math10-s10",
    "questionId": "math10-q10",
    "recognition": "Tìm phần bù của một nửa khoảng trong tập số thực R.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn phép toán dưới dạng phép hiệu R trừ A",
        "explanation": "Phần bù $C_{\\mathbb{R}}A$ chính là phép toán $\\mathbb{R} \\setminus A$. Ta lấy toàn bộ trục số thực $(-\\infty; +\\infty)$ và gạch bỏ đi nửa khoảng $A = [-3; 5)$.",
        "result": "Trục số thực gạch bỏ [-3; 5)"
      },
      {
        "order": 2,
        "title": "Xác định các khoảng còn lại và đảo ngoặc ở biên",
        "explanation": "Phần còn lại sau khi gạch bỏ gồm hai khoảng ngoài cùng: từ $-\\infty$ đến $-3$, và từ $5$ đến $+\\infty$.\n- Tại biên $x = -3$: Ở tập A là ngoặc vuông $[$ (lấy biên), nên phần bù phải gạch bỏ đi điểm $-3$ này (đảo thành ngoặc tròn $)_x$). Kết quả phần trái là $(-\\infty; -3)$.\n- Tại biên $x = 5$: Ở tập A là ngoặc tròn $)$ (không lấy biên), nên phần bù sẽ giữ lại điểm $5$ (đảo thành ngoặc vuông $[$). Kết quả phần phải là $[5; +\\infty)$.\n- Gộp lại bằng ký hiệu hợp ($\\cup$): $C_{\\mathbb{R}}A = (-\\infty; -3) \\cup [5; +\\infty)$.",
        "result": "(-\\infty; -3) \\cup [5; +\\infty)"
      }
    ],
    "finalAnswer": "(-\\infty; -3) \\cup [5; +\\infty)",
    "commonMistakes": [
      "Ghi sai ngoặc ở biên thành $(-\\infty; -3] \\cup (5; +\\infty)$ do quên đảo chiều ngoặc của cả hai biên."
    ],
    "reviewSuggestions": [
      "Phần bù của một đoạn/khoảng luôn luôn chia làm hai nửa nằm ở hai đầu trục số và nối với nhau bằng ký hiệu hợp."
    ]
  },
  {
    "id": "math10-s11",
    "questionId": "math10-q11",
    "recognition": "Tìm phần bù của phép hợp hai tập hợp số thực.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Tìm hợp của hai tập hợp A và B",
        "explanation": "Ta có $A = [0; 3]$ và $B = (2; 6)$. Biểu diễn A và B trên trục số thực. Giao của chúng khác rỗng vì $(2; 3]$ thuộc cả hai tập. Do đó, hợp của chúng kéo dài liên tục từ $0$ (lấy biên) đến $6$ (không lấy biên). Ta được: $A \\cup B = [0; 6)$.",
        "result": "[0; 6)"
      },
      {
        "order": 2,
        "title": "Tìm phần bù của hợp trên tập số thực R",
        "explanation": "Phần bù $C_{\\mathbb{R}}(A \\cup B) = \\mathbb{R} \\setminus [0; 6)$. \nTa loại bỏ đoạn $[0; 6)$ khỏi trục số thực. Phần còn lại gồm hai khoảng ngoài cùng: từ $-\\infty$ đến $0$, và từ $6$ đến $+\\infty$.\n- Điểm biên $0$ (ngoặc vuông ở hợp) sẽ đảo thành ngoặc tròn $($ ở kết quả phần bù.\n- Điểm biên $6$ (ngoặc tròn ở hợp) sẽ đảo thành ngoặc vuông $[$ ở kết quả phần bù.\nVậy: $C_{\\mathbb{R}}(A \\cup B) = (-\\infty; 0) \\cup [6; +\\infty)$.",
        "result": "(-\\infty; 0) \\cup [6; +\\infty)"
      }
    ],
    "finalAnswer": "(-\\infty; 0) \\cup [6; +\\infty)",
    "commonMistakes": [
      "Gộp sai phép hợp (ví dụ nhầm thành $[0; 6]$ hoặc $(0; 6)$).",
      "Quên đảo ngoặc tại điểm biên của phép hợp khi lấy phần bù."
    ],
    "reviewSuggestions": [
      "Luôn luôn thực hiện phép toán trong ngoặc đơn trước ($A \\cup B$), sau đó mới thực hiện phép toán ngoài ngoặc ($C_{\\mathbb{R}}$)."
    ]
  },
  {
    "id": "math10-s12",
    "questionId": "math10-q12",
    "recognition": "Phép giao của hai nửa khoảng vô hạn có chung điểm biên duy nhất.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn hai nửa khoảng vô hạn trên trục số",
        "explanation": "Biểu diễn tập $A = (-\\infty; -2]$ (gồm các số bé hơn hoặc bằng $-2$) và tập $B = [-2; +\\infty)$ (gồm các số lớn hơn hoặc bằng $-2$) trên trục số.",
        "result": "Đã biểu diễn A và B."
      },
      {
        "order": 2,
        "title": "Xác định giao của hai tập hợp",
        "explanation": "Tìm các giá trị thực đồng thời thuộc cả hai tập hợp. Do tập A chứa điểm $-2$ (ngoặc vuông) và tập B cũng chứa điểm $-2$ (ngoặc vuông), điểm duy nhất thuộc cả A và B là $x = -2$. Các điểm khác đều bị gạch bỏ. Do đó: $A \\cap B = \\{-2\\}$.",
        "result": "{-2}"
      }
    ],
    "finalAnswer": "{-2}",
    "commonMistakes": [
      "Chọn đáp án rỗng $\\varnothing$ do nghĩ hai khoảng nằm về hai phía đối lập mà quên xét điểm mút chung.",
      "Viết sai định dạng tập hợp phần tử đơn lẻ thành đoạn $[-2; -2]$ (ít khi dùng)."
    ],
    "reviewSuggestions": [
      "Chú ý dấu ngoặc vuông tại biên chung. Nếu một trong hai tập hợp tại điểm biên là ngoặc tròn, giao của chúng sẽ bằng rỗng."
    ]
  },
  {
    "id": "math10-s13",
    "questionId": "math10-q13",
    "recognition": "Tìm giao của ba tập hợp số thực.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Tìm giao của hai tập hợp đầu tiên A và B",
        "explanation": "Cho $A = [-4; 2]$ và $B = [-2; 4)$. Giao $A \\cap B$ là phần chung của hai đoạn này. Sắp xếp mốc biên: $-4 < -2 < 2 < 4$. Ta có: $A \\cap B = [-2; 2]$.",
        "result": "[-2; 2]"
      },
      {
        "order": 2,
        "title": "Tìm giao của kết quả trên với tập hợp C",
        "explanation": "Tìm giao của $[-2; 2]$ với tập $C = (0; 5]$. Sắp xếp mốc biên: $-2 < 0 < 2 < 5$. Phần chung nằm giữa $0$ (ngoặc tròn ở C) và $2$ (ngoặc vuông ở giao đầu). Do đó: $A \\cap B \\cap C = (0; 2]$.",
        "result": "(0; 2]"
      }
    ],
    "finalAnswer": "(0; 2]",
    "commonMistakes": [
      "Tính toán sai các phép toán trung gian.",
      "Lẫn lộn ngoặc tròn và ngoặc vuông ở kết quả cuối cùng."
    ],
    "reviewSuggestions": [
      "Khi giao nhiều tập hợp, bạn có thể vẽ tất cả lên cùng một trục số và gạch phần không thuộc của từng tập hợp một, phần còn lại cuối cùng chính là đáp án."
    ]
  },
  {
    "id": "math10-s14",
    "questionId": "math10-q14",
    "recognition": "Phép hiệu tách đoạn lớn cho đoạn nhỏ nằm ở giữa.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn tập bị trừ A và tập trừ B",
        "explanation": "Ta có $A = [-3; 3]$ và $B = [-1; 2]$. Tập B nằm hoàn toàn bên trong tập A (vì $-3 < -1 < 2 < 3$).",
        "result": "B chứa trong A"
      },
      {
        "order": 2,
        "title": "Loại bỏ tập B khỏi tập A và thực hiện đảo ngoặc",
        "explanation": "Khi gạch bỏ phần thuộc B $[-1; 2]$ khỏi A, trục số bị chia thành 2 phần độc lập: \n- Phần bên trái từ $-3$ đến $-1$. Tại biên $x = -1$: Do B chứa điểm $-1$ (ngoặc vuông) nên khi loại bỏ B, ta loại bỏ cả điểm $-1$. Ngoặc vuông ở B đổi thành ngoặc tròn ở hiệu: $[-3; -1)$.\n- Phần bên phải từ $2$ đến $3$. Tại biên $x = 2$: Do B chứa điểm $2$ (ngoặc vuông) nên khi loại bỏ B, điểm $2$ bị loại đi. Ngoặc vuông ở B đổi thành ngoặc tròn ở hiệu: $(2; 3]$.\n- Gộp lại bằng dấu hợp: $A \\setminus B = [-3; -1) \\cup (2; 3]$.",
        "result": "[-3; -1) \\cup (2; 3]"
      }
    ],
    "finalAnswer": "[-3; -1) \\cup (2; 3]",
    "commonMistakes": [
      "Quên đảo dấu ngoặc vuông của B thành ngoặc tròn trong kết quả hiệu.",
      "Viết sai kết quả bằng cách chỉ ghi lại một bên của khoảng số học."
    ],
    "reviewSuggestions": [
      "Khi tập bị trừ chứa hoàn toàn tập trừ, hiệu sẽ tách thành hai tập hợp rời rạc ở hai phía đầu mút."
    ]
  },
  {
    "id": "math10-s15",
    "questionId": "math10-q15",
    "recognition": "Giao của một khoảng và hợp của hai khoảng vô hạn bằng rỗng.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biến đổi điều kiện giao bằng rỗng",
        "explanation": "Ta có $B = (-\\infty; -3) \\cup [5; +\\infty)$. Phần bù của B trong $\\mathbb{R}$ chính là khoảng $C_{\\mathbb{R}}B = [-3; 5)$. \nĐể khoảng $A = (m - 1; m + 3)$ giao với B bằng rỗng, thì A phải nằm hoàn toàn trong phần bù của B, nghĩa là $A \\subset [-3; 5)$.",
        "result": "A \\subset [-3; 5)"
      },
      {
        "order": 2,
        "title": "Giải hệ bất phương trình đầu mút biên",
        "explanation": "Để khoảng $A = (m - 1; m + 3) \\subset [-3; 5)$, ta cần:\n$$\\begin{cases} -3 \\le m - 1 \\\\ m + 3 \\le 5 \\end{cases} \\Leftrightarrow \\begin{cases} m \\ge -2 \\\\ m \\le 2 \\end{cases} \\Leftrightarrow -2 \\le m \\le 2.$$\nVì A dùng ngoặc tròn nên tại các mốc biên $-3$ và $5$ lấy dấu bằng là hoàn toàn chính xác.",
        "result": "-2 <= m <= 2"
      }
    ],
    "finalAnswer": "-2 <= m <= 2",
    "commonMistakes": [
      "Không nhận diện được mối quan hệ thông qua tập hợp phần bù.",
      "Xét nhầm hoặc bỏ sót dấu bằng ở các điểm biên."
    ],
    "reviewSuggestions": [
      "Với bài toán giao của một khoảng với hợp hai khoảng bằng rỗng, cách nhanh nhất là đưa về điều kiện tập con trong tập phần bù."
    ]
  },
  {
    "id": "math10-s16",
    "questionId": "math10-q16",
    "recognition": "Điều kiện chứa nhau của khoảng và đoạn chứa tham số.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Thiết lập bất phương trình đầu mút",
        "explanation": "Để khoảng $A = (m; m + 2) \\subset B = [-2; 4]$, ta cần khoảng A nằm trọn trong đoạn B. Điều kiện tương ứng là:\n$$\\begin{cases} -2 \\le m \\\\ m + 2 \\le 4 \\end{cases} \\Leftrightarrow \\begin{cases} m \\ge -2 \\\\ m \\le 2 \\end{cases} \\Leftrightarrow -2 \\le m \\le 2.$$",
        "result": "-2 <= m <= 2"
      },
      {
        "order": 2,
        "title": "Kiểm tra tính hợp lệ của các giá trị biên",
        "explanation": "Nếu $m = -2$, ta có $A = (-2; 0) \\subset [-2; 4]$ (đúng).\nNếu $m = 2$, ta có $A = (2; 4) \\subset [-2; 4]$ (đúng).\nDo đó, giá trị $m \\in [-2; 2]$ hoàn toàn thỏa mãn.",
        "result": "m in [-2; 2]"
      }
    ],
    "finalAnswer": "-2 <= m <= 2",
    "commonMistakes": [
      "Nhầm lẫn điều kiện thành $-2 < m < 2$ (bỏ dấu bằng) do sợ ngoặc tròn không được bằng ngoặc vuông. Tuy nhiên, tập tròn có thể là con của tập vuông tại cùng biên."
    ],
    "reviewSuggestions": [
      "Ghi nhớ quy tắc: $(a; b) \\subset [a; b]$ là đúng, nhưng $[a; b] \\subset (a; b)$ là sai."
    ]
  },
  {
    "id": "math10-s17",
    "questionId": "math10-q17",
    "recognition": "Tìm m để đoạn giao với hợp của hai khoảng khác rỗng.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Đặt điều kiện tồn tại tập hợp A",
        "explanation": "Để tập hợp $A = [m - 1; \\frac{m + 5}{2}]$ tồn tại (khác rỗng), ta cần:\n$$m - 1 \\le \\frac{m + 5}{2} \\Leftrightarrow 2m - 2 \\le m + 5 \\Leftrightarrow m \\le 7.$$",
        "result": "m <= 7"
      },
      {
        "order": 2,
        "title": "Tìm điều kiện phần bù giao bằng rỗng",
        "explanation": "Để $A \\cap B = \\varnothing$ với $B = (-\\infty; -2) \\cup [3; +\\infty)$, đoạn A phải nằm hoàn toàn trong khoảng phần bù $C_{\\mathbb{R}}B = [-2; 3)$.\nTa cần:\n$$\\begin{cases} -2 \\le m - 1 \\\\ \\frac{m + 5}{2} < 3 \\end{cases} \\Leftrightarrow \\begin{cases} m \\ge -1 \\\\ m + 5 < 6 \\end{cases} \\Leftrightarrow \\begin{cases} m \\ge -1 \\\\ m < 1 \\end{cases} \\Leftrightarrow -1 \\le m < 1.$$",
        "result": "-1 <= m < 1"
      },
      {
        "order": 3,
        "title": "Lấy phủ định và kết hợp điều kiện tồn tại",
        "explanation": "Điều kiện để $A \\cap B \\neq \\varnothing$ là phủ định của điều kiện giao bằng rỗng ở trên:\n$$m < -1 \\quad \\text{hoặc} \\quad m \\ge 1.$$\nKết hợp với điều kiện tồn tại $m \\le 7$ ta được: $m < -1$ hoặc $1 \\le m \\le 7$.",
        "result": "m < -1 hoặc 1 <= m <= 7"
      }
    ],
    "finalAnswer": "m < -1 hoặc 1 <= m <= 7",
    "commonMistakes": [
      "Quên không đặt điều kiện tồn tại $m \\le 7$ cho đoạn A, dẫn đến thừa nhận các giá trị $m > 7$.",
      "Lấy sai dấu bằng ở biên của hệ bất phương trình phần bù."
    ],
    "reviewSuggestions": [
      "Luôn đặt điều kiện tồn tại cho tập hợp số chứa tham số trước khi thực hiện bất kỳ phép toán nào."
    ]
  },
  {
    "id": "math10-s18",
    "questionId": "math10-q18",
    "recognition": "Điều kiện tập con đối với các khoảng số vô hạn.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn và so sánh đầu mút",
        "explanation": "Ta có $A = [m; +\\infty)$ và $B = (5; +\\infty)$. Để $A \\subset B$, mọi phần tử thuộc A phải thuộc B. Rõ ràng ta cần so sánh hai biên trái: $m$ và $5$. \nĐể đoạn A nằm trọn trong B, ta cần $m \\ge 5$.",
        "result": "m >= 5"
      },
      {
        "order": 2,
        "title": "Xét trường hợp dấu bằng tại biên m = 5",
        "explanation": "Nếu $m = 5$, ta có $A = [5; +\\infty)$ và $B = (5; +\\infty)$. \nKhi đó, điểm $5 \\in A$ nhưng $5 \\notin B$, suy ra $A \\not\\subset B$ (vi phạm tính tập con). \nDo đó, ta không được lấy dấu bằng tại $m = 5$. Điều kiện đúng là $m > 5$.",
        "result": "m > 5"
      }
    ],
    "finalAnswer": "m > 5",
    "commonMistakes": [
      "Chọn đáp án $m \\ge 5$ do thói quen lấy dấu bằng mà không thử lại mốc biên biên độ để kiểm tra điều kiện tập con."
    ],
    "reviewSuggestions": [
      "Với mọi bài toán chứa tham số có mút biên, luôn thử lại trực tiếp giá trị dấu bằng tại biên để chắc chắn điều kiện đúng."
    ]
  },
  {
    "id": "math10-s19",
    "questionId": "math10-q19",
    "recognition": "Tìm m để khoảng và nửa khoảng chứa tham số giao nhau bằng rỗng.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Biểu diễn và chia trường hợp rời nhau",
        "explanation": "Ta có $A = (m - 3; m]$ và $B = (1; 4)$. Để $A \\cap B = \\varnothing$, tập A phải nằm hoàn toàn bên trái hoặc bên phải tập B.\n- Trường hợp 1 (A bên trái B): biên phải của A nhỏ hơn hoặc bằng biên trái của B $\\Leftrightarrow m \\le 1$.\n- Trường hợp 2 (A bên phải B): biên trái của A lớn hơn hoặc bằng biên phải của B $\\Leftrightarrow m - 3 \\ge 4 \\Leftrightarrow m \\ge 7$.",
        "result": "m <= 1 hoặc m >= 7"
      },
      {
        "order": 2,
        "title": "Biện luận dấu bằng tại biên",
        "explanation": "Xét tại biên $m = 7$: khi đó $A = (4; 7]$. Tập $B = (1; 4)$. Giao $A \\cap B$ rõ ràng bằng rỗng (vì A không lấy điểm 4, B cũng không lấy điểm 4). Vậy dấu bằng tại $m = 7$ là hợp lệ.\nXét tại biên $m = 1$: khi đó $A = (-2; 1]$. Tập $B = (1; 4)$. Giao $A \\cap B$ bằng rỗng (vì A lấy điểm 1 nhưng B không lấy điểm 1). Vậy dấu bằng tại $m = 1$ cũng hợp lệ.\nKết luận: $m \\le 1$ hoặc $m \\ge 7$.",
        "result": "m <= 1 hoặc m >= 7"
      }
    ],
    "finalAnswer": "m <= 1 hoặc m >= 7",
    "commonMistakes": [
      "Quên không lấy dấu bằng tại các mốc biên tiếp xúc, dẫn đến chọn đáp án bị thiếu giá trị biên."
    ],
    "reviewSuggestions": [
      "Luôn luôn kiểm tra dấu bằng tại các mốc biên tiếp xúc bằng cách thay trực tiếp vào giả thiết."
    ]
  },
  {
    "id": "math10-s20",
    "questionId": "math10-q20",
    "recognition": "Điều kiện tập con đối với các khoảng số vô hạn về phía âm vô cực.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Thiết lập bất phương trình so sánh biên phải",
        "explanation": "Ta có $A = (-\\infty; m)$ và $B = (-\\infty; 2m - 1]$. Để $A \\subset B$, ta cần biên phải của A phải nhỏ hơn hoặc bằng biên phải của B: $m \\le 2m - 1$.",
        "result": "m <= 2m - 1"
      },
      {
        "order": 2,
        "title": "Giải bất phương trình và biện luận",
        "explanation": "Bất phương trình $m \\le 2m - 1 \\Leftrightarrow m \\ge 1$.\n- Xét tại biên $m = 1$: $A = (-\\infty; 1)$ và $B = (-\\infty; 1]$. Rõ ràng $A \\subset B$ vì tập tròn chứa ít phần tử hơn tập vuông tại điểm mút. Nên dấu bằng hoàn toàn chính xác.",
        "result": "m >= 1"
      }
    ],
    "finalAnswer": "m >= 1",
    "commonMistakes": [
      "Nhầm lẫn chiều bất phương trình so sánh biên hoặc chọn đáp án $m > 1$ mà quên lấy dấu bằng."
    ],
    "reviewSuggestions": [
      "Khoảng tròn $(-\\infty; a)$ luôn là con của nửa khoảng vuông $(-\\infty; a]$."
    ]
  },
  {
    "id": "math10-s21",
    "questionId": "math10-q21",
    "recognition": "Tìm m để hai đoạn số thực chứa tham số giao nhau khác rỗng.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Tìm điều kiện để hai tập hợp giao nhau bằng rỗng",
        "explanation": "Ta có $A = [m; m + 3]$ và $B = [2m - 1; 2m + 2]$. Để $A \\cap B = \\varnothing$, đoạn A phải nằm hoàn toàn bên trái hoặc bên phải đoạn B.\n- TH1 (A nằm bên trái B): $m + 3 < 2m - 1 \\Leftrightarrow m > 4$.\n- TH2 (A nằm bên phải B): $2m + 2 < m \\Leftrightarrow m < -2$.\nVậy điều kiện giao bằng rỗng là: $m < -2$ hoặc $m > 4$.",
        "result": "m < -2 hoặc m > 4"
      },
      {
        "order": 2,
        "title": "Lấy phủ định để tìm điều kiện giao nhau khác rỗng",
        "explanation": "Điều kiện để $A \\cap B \\neq \\varnothing$ là phủ định của điều kiện giao bằng rỗng ở trên: \n$$-2 \\le m \\le 4.$$",
        "result": "-2 <= m <= 4"
      }
    ],
    "finalAnswer": "-2 <= m <= 4",
    "commonMistakes": [
      "Không chia đủ hai trường hợp A nằm bên trái và A nằm bên phải B.",
      "Lẫn lộn dấu bằng khi lấy phủ định phần bù."
    ],
    "reviewSuggestions": [
      "Phủ định của dấu bé hơn ($<$) là dấu lớn hơn hoặc bằng ($\\ge$), phủ định của dấu lớn hơn ($>$) là dấu nhỏ hơn hoặc bằng ($\\le$)."
    ]
  },
  {
    "id": "math10-s22",
    "questionId": "math10-q22",
    "recognition": "Tìm m để đoạn chứa tham số và đoạn số thực rời nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Thiết lập hệ bất phương trình rời nhau",
        "explanation": "Ta có $A = [2m - 1; 2m + 3]$ và $B = [-1; 5]$. Để $A \\cap B = \\varnothing$, ta có 2 trường hợp:\n- Trường hợp 1 (A bên trái B): Biên phải của A nhỏ hơn biên trái của B $\\Leftrightarrow 2m + 3 < -1 \\Leftrightarrow 2m < -4 \\Leftrightarrow m < -2$.\n- Trường hợp 2 (A bên phải B): Biên trái của A lớn hơn biên phải của B $\\Leftrightarrow 2m - 1 > 5 \\Leftrightarrow 2m > 6 \\Leftrightarrow m > 3$.",
        "result": "m < -2 hoặc m > 3"
      },
      {
        "order": 2,
        "title": "Kết luận điều kiện m",
        "explanation": "Gộp cả hai trường hợp, ta được điều kiện của m là $m < -2$ hoặc $m > 3$.",
        "result": "m < -2 hoặc m > 3"
      }
    ],
    "finalAnswer": "m < -2 hoặc m > 3",
    "commonMistakes": [
      "Lấy sai dấu bằng ở biên (nhầm thành $m \\le -2$ hoặc $m \\ge 3$). Vì cả hai tập hợp đều là đoạn (ngoặc vuông), nếu mút tiếp xúc bằng nhau thì chúng vẫn có 1 điểm chung, tức là giao khác rỗng. Do đó không được lấy dấu bằng."
    ],
    "reviewSuggestions": [
      "Với hai đoạn $[a; b]$ và $[c; d]$, giao bằng rỗng khi và chỉ khi $b < c$ hoặc $d < a$ (không có dấu bằng)."
    ]
  },
  {
    "id": "math10-s23",
    "questionId": "math10-q23",
    "recognition": "Điều kiện tập con chứa tham số giữa hai đoạn số thực.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Thiết lập hệ bất phương trình tập con",
        "explanation": "Để đoạn $A = [-3; 3] \\subset B = [m - 2; m + 5]$, ta cần đoạn A nằm trọn vẹn bên trong đoạn B. Điều kiện tương ứng với các đầu mút là:\n$$\\begin{cases} m - 2 \\le -3 \\\\ m + 5 \\ge 3 \\end{cases} \\Leftrightarrow \\begin{cases} m \\le -1 \\\\ m \\ge -2 \\end{cases} \\Leftrightarrow -2 \\le m \\le -1.$$",
        "result": "-2 <= m <= -1"
      },
      {
        "order": 2,
        "title": "Kiểm tra tính hợp lệ",
        "explanation": "Do cả hai tập đều dùng ngoặc vuông nên tại các biên lấy dấu bằng là hoàn toàn chính xác.",
        "result": "-2 <= m <= -1"
      }
    ],
    "finalAnswer": "-2 <= m <= -1",
    "commonMistakes": [
      "Giải sai hệ bất phương trình dẫn đến kết quả rỗng hoặc ngược chiều dấu."
    ],
    "reviewSuggestions": [
      "Vẽ trực quan hai đoạn số học trên giấy và dịch chuyển đoạn B chứa tham số m để thấy rõ điều kiện chặn biên."
    ]
  },
  {
    "id": "math10-s64",
    "questionId": "math10-q64",
    "recognition": "Dấu hiệu nhận biết: yêu cầu đếm phần tử không thuộc hai nhóm có phần giao; dùng nguyên lý bù và công thức cộng của hai tập hợp.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Đếm từng tập và phần giao",
        "explanation": "Trong $U=\\{1;2;\\ldots;30\\}$ có 15 số chia hết cho 2 và 10 số chia hết cho 3. Các số vừa chia hết cho 2 vừa chia hết cho 3 là các bội của 6, có $\\lfloor 30/6\\rfloor=5$ số.",
        "result": "|A|=15, |B|=10, |A \\cap B|=5"
      },
      {
        "order": 2,
        "title": "Dùng nguyên lý bù",
        "explanation": "$|A\\cup B|=|A|+|B|-|A\\cap B|=15+10-5=20$. Vì $|U|=30$ nên $|U\\setminus(A\\cup B)|=30-20=10$.",
        "result": "10"
      }
    ],
    "finalAnswer": "10",
    "commonMistakes": [
      "Cộng $15+10$ mà không trừ 5 phần tử đã bị đếm hai lần."
    ],
    "reviewSuggestions": [
      "Khi hai tập có thể giao nhau, luôn dùng $|A\\cup B|=|A|+|B|-|A\\cap B|$."
    ]
  },
  {
    "id": "math10-s65",
    "questionId": "math10-q65",
    "recognition": "Dấu hiệu nhận biết: biểu thức có phép hợp rồi phép hiệu; phải thực hiện phép toán trong ngoặc trước và kiểm tra ngoặc tại từng mốc biên.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Tìm hợp A và B",
        "explanation": "Hai khoảng $[-4;5]$ và $(-2;7)$ chồng lên nhau, nên hợp kéo dài từ $-4$ được lấy đến $7$ không được lấy.",
        "result": "A \\cup B=[-4;7)"
      },
      {
        "order": 2,
        "title": "Loại đoạn C",
        "explanation": "Loại toàn bộ $[0;3]$ khỏi $[-4;7)$. Hai điểm 0 và 3 thuộc C nên không còn trong kết quả.",
        "result": "[-4;0) \\cup (3;7)"
      }
    ],
    "finalAnswer": "[-4; 0) \\cup (3; 7)",
    "commonMistakes": [
      "Giữ lại 0 hoặc 3 dù hai điểm này thuộc tập bị trừ C.",
      "Thực hiện phép hiệu trước phép hợp trong ngoặc."
    ],
    "reviewSuggestions": [
      "Thực hiện phép toán tập hợp theo thứ tự dấu ngoặc, rồi xét riêng từng đầu mút."
    ]
  },
  {
    "id": "math10-s66",
    "questionId": "math10-q66",
    "recognition": "Dấu hiệu nhận biết: hai đoạn giao khác rỗng; so sánh đầu trái lớn nhất với đầu phải nhỏ nhất.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Xác định điều kiện hai đoạn còn chạm nhau",
        "explanation": "Đoạn A kết thúc tại 1, còn đoạn B bắt đầu tại m. Hai đoạn có điểm chung khi đầu trái của B không vượt quá đầu phải của A.",
        "result": "m \\le 1"
      },
      {
        "order": 2,
        "title": "Kiểm tra biên",
        "explanation": "Tại $m=1$, cả hai đoạn đều chứa điểm 1 nên giao vẫn khác rỗng; vì vậy phải lấy dấu bằng.",
        "result": "m \\le 1"
      }
    ],
    "finalAnswer": "m <= 1",
    "commonMistakes": [
      "Viết $m<1$ vì quên cả hai đầu mút tại 1 đều là ngoặc vuông."
    ],
    "reviewSuggestions": [
      "Sau khi so sánh đầu mút, thay trực tiếp giá trị biên để quyết định dấu bằng."
    ]
  },
  {
    "id": "math10-s67",
    "questionId": "math10-q67",
    "recognition": "Dấu hiệu nhận biết: đoạn chứa tham số phải vừa tồn tại vừa nằm hoàn toàn trong một đoạn cố định.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Đặt điều kiện A khác rỗng",
        "explanation": "Đoạn $[m;4]$ khác rỗng khi đầu trái không lớn hơn đầu phải.",
        "result": "m \\le 4"
      },
      {
        "order": 2,
        "title": "Đặt điều kiện tập con",
        "explanation": "Để $[m;4]\\subset[1;6]$, đầu trái m không được nhỏ hơn 1. Đầu phải 4 đã nằm trong B.",
        "result": "m \\ge 1"
      },
      {
        "order": 3,
        "title": "Kết hợp điều kiện",
        "explanation": "Kết hợp $m\\le4$ và $m\\ge1$.",
        "result": "1 \\le m \\le 4"
      }
    ],
    "finalAnswer": "1 <= m <= 4",
    "commonMistakes": [
      "Chỉ xét tập con mà quên điều kiện để đoạn $[m;4]$ tồn tại."
    ],
    "reviewSuggestions": [
      "Với khoảng hoặc đoạn có hai đầu phụ thuộc tham số, luôn kiểm tra điều kiện khác rỗng trước."
    ]
  },
  {
    "id": "math10-s68",
    "questionId": "math10-q68",
    "recognition": "Dấu hiệu nhận biết: một khoảng di động phải nằm trong đoạn cố định rồi yêu cầu lấy giá trị nguyên lớn nhất.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "So sánh hai đầu mút",
        "explanation": "Để $(m-1;m+1)\\subset[-3;2]$, cần $m-1\\ge-3$ và $m+1\\le2$. Dấu bằng được phép vì khoảng A không lấy hai đầu mút, còn B lại chứa chúng.",
        "result": "-2 \\le m \\le 1"
      },
      {
        "order": 2,
        "title": "Chọn số nguyên lớn nhất",
        "explanation": "Trong đoạn $[-2;1]$, số nguyên lớn nhất là 1.",
        "result": "m=1"
      }
    ],
    "finalAnswer": "1",
    "commonMistakes": [
      "Dùng bất đẳng thức nghiêm chỉ vì A có ngoặc tròn."
    ],
    "reviewSuggestions": [
      "Ngoặc tròn của tập con vẫn có thể trùng biên với ngoặc vuông của tập chứa."
    ]
  },
  {
    "id": "math10-m1-s001",
    "questionId": "math10-m1-q001",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phép giao giữ các số đồng thời thuộc cả A và B; lấy đầu trái lớn hơn và đầu phải nhỏ hơn."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phần chồng lấn chạy từ −1 đến 2; cả −1 và 2 đều thuộc hai tập.",
        "result": "[-1;2]"
      }
    ],
    "finalAnswer": "D. $[-1;2]$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s003",
    "questionId": "math10-m1-q003",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Giao hai tia là phần nằm bên phải 1 và không vượt quá 4."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Điểm 1 bị loại theo B, còn 4 được lấy theo A và thuộc B.",
        "result": "(1;4]"
      }
    ],
    "finalAnswer": "C. $(1;4]$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s004",
    "questionId": "math10-m1-q004",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Chọn phần đồng thời thỏa $-6\\le x<-2$ và $-4<x\\le1$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Kết hợp điều kiện được $-4<x<-2$.",
        "result": "(-4;-2)"
      }
    ],
    "finalAnswer": "D. $(-4;-2)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s005",
    "questionId": "math10-m1-q005",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai tập chỉ có thể chạm tại 5 nên phải kiểm tra điểm biên này."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "A không chứa 5, vì vậy không có phần tử chung.",
        "result": "\\varnothing"
      }
    ],
    "finalAnswer": "A. $\\varnothing$",
    "commonMistakes": [
      "Kết luận giao là {5} dù 5 không thuộc khoảng A."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s007",
    "questionId": "math10-m1-q007",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Xét điểm tiếp xúc −1 và hai miền ở hai phía của nó."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "A không chứa −1 và không có điểm nào của A đạt từ −1 trở lên.",
        "result": "\\varnothing"
      }
    ],
    "finalAnswer": "C. $\\varnothing$",
    "commonMistakes": [
      "Bỏ qua ngoặc tròn của A tại −1."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s008",
    "questionId": "math10-m1-q008",
    "recognition": "Dạng giao tập hợp: dấu hiệu là kí hiệu $\\cap$, từ “đồng thời” hoặc phần tô chồng nhau.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Cụm “tô đồng thời” là dấu hiệu của phép giao."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "B nằm trong A, nhưng B không lấy 2; do đó giao chính là B.",
        "result": "[-3;2)"
      }
    ],
    "finalAnswer": "D. $[-3;2)$",
    "commonMistakes": [
      "Chọn tập lớn A thay vì phần được tô đồng thời."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s010",
    "questionId": "math10-m1-q010",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai tập nối nhau tại 2; chỉ cần ít nhất một tập chứa điểm nối."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "B chứa 2 nên hợp không bị đứt tại 2 và kéo dài đến 6.",
        "result": "(-\\infty;6]"
      }
    ],
    "finalAnswer": "B. $(-\\infty;6]$",
    "commonMistakes": [
      "Tách hợp thành hai khoảng vì A không chứa 2, dù B có chứa 2."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s011",
    "questionId": "math10-m1-q011",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Kiểm tra xem hai khoảng có chạm hoặc chồng lên nhau trước khi gộp."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Khoảng (−2;1] nằm giữa không thuộc tập nào, nên phải giữ hai thành phần rời.",
        "result": "[-5;-2]\\cup(1;4)"
      }
    ],
    "finalAnswer": "C. $[-5;-2]\\cup(1;4)$",
    "commonMistakes": [
      "Gộp hai khoảng rời thành một khoảng liên tục."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s014",
    "questionId": "math10-m1-q014",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai khoảng chồng nhau trên (−2;−1], nên hợp là một khoảng liên tục."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Đầu ngoài cùng là −6 và 2, cả hai đều không được lấy.",
        "result": "(-6;2)"
      }
    ],
    "finalAnswer": "B. $(-6;2)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s015",
    "questionId": "math10-m1-q015",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Xét hai tia phủ hai phía và kiểm tra điểm nối −4."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "A chứa −4, B chứa mọi số lớn hơn −4; hợp phủ toàn bộ số thực.",
        "result": "\\mathbb{R}"
      }
    ],
    "finalAnswer": "C. $\\mathbb{R}$",
    "commonMistakes": [
      "Loại −4 vì chỉ nhìn ngoặc tròn của B."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s016",
    "questionId": "math10-m1-q016",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai khoảng chạm tại 0 nhưng cả hai đều không chứa 0."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Hợp vẫn bị khuyết 0 nên không thể gộp thành một khoảng.",
        "result": "(-2;0)\\cup(0;3)"
      }
    ],
    "finalAnswer": "D. $(-2;0)\\cup(0;3)$",
    "commonMistakes": [
      "Gộp qua điểm 0 dù điểm này không thuộc tập nào."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s017",
    "questionId": "math10-m1-q017",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Điểm −3 được B lấy nên hai phần không bị đứt."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Hợp chạy liên tục từ −8 đến 1 và lấy cả hai đầu.",
        "result": "[-8;1]"
      }
    ],
    "finalAnswer": "A. $[-8;1]$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s019",
    "questionId": "math10-m1-q019",
    "recognition": "Dạng hợp tập hợp: nhận ra qua kí hiệu $\\cup$ hoặc cụm “thuộc A hoặc B/ít nhất một tập”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Từ “hoặc” trong phép toán tập hợp được hiểu là thuộc ít nhất một tập."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Hai tập cùng chứa −1 nên hợp nối liền từ −5 đến 4.",
        "result": "(-5;4)"
      }
    ],
    "finalAnswer": "C. $(-5;4)$",
    "commonMistakes": [
      "Hiểu “hoặc” là loại trừ và bỏ điểm thuộc cả hai tập."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s021",
    "questionId": "math10-m1-q021",
    "recognition": "Dạng phép hiệu/kết hợp: dấu hiệu là $A\\setminus B$ hoặc biểu thức có ngoặc; thứ tự phép toán quyết định kết quả.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "B loại khỏi A mọi điểm từ 0 trở lên."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Điểm 0 thuộc B nên bị loại, phần còn lại là các số nhỏ hơn 0.",
        "result": "(-\\infty;0)"
      }
    ],
    "finalAnswer": "A. $(-\\infty;0)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s022",
    "questionId": "math10-m1-q022",
    "recognition": "Dạng phép hiệu/kết hợp: dấu hiệu là $A\\setminus B$ hoặc biểu thức có ngoặc; thứ tự phép toán quyết định kết quả.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Giữ A và cắt bỏ phần B chồng lên A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "B không chứa 2 nên 2 được giữ; A không chứa 6.",
        "result": "[2;6)"
      }
    ],
    "finalAnswer": "B. $[2;6)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s025",
    "questionId": "math10-m1-q025",
    "recognition": "Dạng phép hiệu/kết hợp: dấu hiệu là $A\\setminus B$ hoặc biểu thức có ngoặc; thứ tự phép toán quyết định kết quả.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Kiểm tra giao trước: nếu A và B rời nhau thì trừ B không làm A thay đổi."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "A không chứa 2 còn B bắt đầu tại 2, nên giao rỗng và hiệu bằng A.",
        "result": "[-6;2)"
      }
    ],
    "finalAnswer": "A. $[-6;2)$",
    "commonMistakes": [
      "Loại một phần của A chỉ vì hai biểu diễn có chung mốc 2."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s026",
    "questionId": "math10-m1-q026",
    "recognition": "Dạng phép hiệu/kết hợp: dấu hiệu là $A\\setminus B$ hoặc biểu thức có ngoặc; thứ tự phép toán quyết định kết quả.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mọi phần tử của A đều thuộc B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Loại toàn bộ B khỏi A không còn phần tử nào.",
        "result": "\\varnothing"
      }
    ],
    "finalAnswer": "B. $\\varnothing$",
    "commonMistakes": [
      "Cho rằng hiệu của hai tập bằng nhau vẫn bằng chính tập đó."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s027",
    "questionId": "math10-m1-q027",
    "recognition": "Dạng phép hiệu/kết hợp: dấu hiệu là $A\\setminus B$ hoặc biểu thức có ngoặc; thứ tự phép toán quyết định kết quả.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Thực hiện phép giao trong ngoặc trước, sau đó mới lấy hiệu với C."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$A\\cap B=(-1;6]$; loại [2;4) làm mất 2 nhưng giữ 4.",
        "result": "(-1;2)\\cup[4;6]"
      }
    ],
    "finalAnswer": "C. $(-1;2)\\cup[4;6]$",
    "commonMistakes": [
      "Không tuân theo dấu ngoặc hoặc xử lí sai hai đầu mút của C."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s028",
    "questionId": "math10-m1-q028",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phần bù trong R gồm mọi số thực không thuộc A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "−3 không thuộc A nên được lấy; 4 thuộc A nên bị loại.",
        "result": "(-\\infty;-3]\\cup(4;+\\infty)"
      }
    ],
    "finalAnswer": "D. $(-\\infty;-3]\\cup(4;+\\infty)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s029",
    "questionId": "math10-m1-q029",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Loại toàn bộ tia từ 1 trở đi khỏi trục số thực."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Vì 1 thuộc A nên phần bù không chứa 1.",
        "result": "(-\\infty;1)"
      }
    ],
    "finalAnswer": "A. $(-\\infty;1)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s030",
    "questionId": "math10-m1-q030",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phần bù là phía còn lại của trục số, đồng thời đảo trạng thái tại đầu mút."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "−2 không thuộc A nên phải thuộc phần bù.",
        "result": "[-2;+\\infty)"
      }
    ],
    "finalAnswer": "B. $[-2;+\\infty)$",
    "commonMistakes": [
      "Chỉ nhìn vị trí đầu mút mà không kiểm tra ngoặc tròn/vuông tại điểm biên."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s031",
    "questionId": "math10-m1-q031",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đi từ trái sang phải và lấy từng vùng trống ngoài các thành phần của A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Đảo trạng thái lấy/không lấy tại −5, 0, 3 và 7.",
        "result": "(-\\infty;-5]\\cup[0;3)\\cup(7;+\\infty)"
      }
    ],
    "finalAnswer": "C. $(-\\infty;-5]\\cup[0;3)\\cup(7;+\\infty)$",
    "commonMistakes": [
      "Bỏ sót khoảng trống nằm giữa hai thành phần của A."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s032",
    "questionId": "math10-m1-q032",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "A chứa mọi số thực ngoại trừ đúng điểm 2."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phần bù chỉ còn tập đơn gồm 2.",
        "result": "\\{2\\}"
      }
    ],
    "finalAnswer": "D. $\\{2\\}$",
    "commonMistakes": [
      "Cho rằng phần bù của hai tia luôn rỗng mà không kiểm tra điểm khuyết."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s033",
    "questionId": "math10-m1-q033",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Trong tập nền hữu hạn U, giữ các phần tử không thuộc A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Các phần tử không chẵn trong U chính là sáu số lẻ.",
        "result": "\\{1,3,5,7,9,11\\}"
      }
    ],
    "finalAnswer": "A. $\\{1,3,5,7,9,11\\}$",
    "commonMistakes": [
      "Mặc định tập nền là R thay vì U đã cho."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s034",
    "questionId": "math10-m1-q034",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Chỉ lấy phần nằm trong U nhưng không nằm trong A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "−2 không thuộc A nên được giữ; 3 thuộc A nên bị loại.",
        "result": "[-5;-2]\\cup(3;5]"
      }
    ],
    "finalAnswer": "B. $[-5;-2]\\cup(3;5]$",
    "commonMistakes": [
      "Viết phần bù vượt ra ngoài tập nền U."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s035",
    "questionId": "math10-m1-q035",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Lấy U làm khung rồi bỏ đoạn A."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "0 thuộc A nên mất; 4 không thuộc A nên được giữ.",
        "result": "(-4;0)\\cup[4;6]"
      }
    ],
    "finalAnswer": "C. $(-4;0)\\cup[4;6]$",
    "commonMistakes": [
      "Không giới hạn kết quả trong U."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s036",
    "questionId": "math10-m1-q036",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tính giao trước rồi lấy phần bù, hoặc dùng định luật De Morgan."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$A\\cap B=(1;5]$; đảo miền và trạng thái hai đầu mút.",
        "result": "(-\\infty;1]\\cup(5;+\\infty)"
      }
    ],
    "finalAnswer": "D. $(-\\infty;1]\\cup(5;+\\infty)$",
    "commonMistakes": [
      "Lấy phần bù của A và B riêng rồi giao thay vì hợp."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s037",
    "questionId": "math10-m1-q037",
    "recognition": "Dạng phần bù: đề luôn nêu tập nền; kết quả chỉ gồm phần tử thuộc tập nền nhưng không thuộc tập đã cho.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tìm hợp hai tia rồi giữ khoảng trống còn lại."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "−1 không thuộc A nên được giữ; 2 thuộc B nên bị loại.",
        "result": "[-1;2)"
      }
    ],
    "finalAnswer": "A. $[-1;2)$",
    "commonMistakes": [
      "Nhầm phần bù của hợp với hợp của các phần bù."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s038",
    "questionId": "math10-m1-q038",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Dùng bao hàm–loại trừ để tìm số bạn thích ít nhất một môn."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$|A\\cup B|=22+18-8=32$, nên số không thích môn nào là $40-32=8$.",
        "result": "8"
      }
    ],
    "finalAnswer": "B. $8$",
    "commonMistakes": [
      "Cộng 22 và 18 mà không trừ 8 bạn bị đếm hai lần."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s039",
    "questionId": "math10-m1-q039",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "“Ít nhất một” chính là số phần tử của hợp."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$25+17-9=33$.",
        "result": "33"
      }
    ],
    "finalAnswer": "C. $33$",
    "commonMistakes": [
      "Không trừ phần giao."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s040",
    "questionId": "math10-m1-q040",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Số chỉ thuộc A bằng số thuộc A trừ số thuộc cả A và B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$30-12=18$.",
        "result": "18"
      }
    ],
    "finalAnswer": "D. $18$",
    "commonMistakes": [
      "Tính hợp thay vì phần chỉ thuộc A."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s041",
    "questionId": "math10-m1-q041",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Biến đổi công thức $|A\\cup B|=|A|+|B|-|A\\cap B|$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$|A\\cap B|=28+21-40=9$.",
        "result": "9"
      }
    ],
    "finalAnswer": "A. $9$",
    "commonMistakes": [
      "Lấy $40-28-21$ dẫn đến số âm."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s042",
    "questionId": "math10-m1-q042",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Số đúng một nhóm bằng $|A|+|B|-2|A\\cap B|$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$35+27-2\\cdot15=32$.",
        "result": "32"
      }
    ],
    "finalAnswer": "B. $32$",
    "commonMistakes": [
      "Tính số tham gia ít nhất một môn thay vì đúng một môn."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s043",
    "questionId": "math10-m1-q043",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tìm hợp trước rồi lấy tổng trừ hợp."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$|X\\cup Y|=46+38-20=64$; không dùng là $80-64=16$.",
        "result": "16"
      }
    ],
    "finalAnswer": "C. $16$",
    "commonMistakes": [
      "Trừ phần giao hai lần."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s044",
    "questionId": "math10-m1-q044",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Từ số không thuộc nhóm nào suy ra số thuộc hợp."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$|A\\cup B|=45-7=38$, nên $|A\\cap B|=26+23-38=11$.",
        "result": "11"
      }
    ],
    "finalAnswer": "D. $11$",
    "commonMistakes": [
      "Dùng 45 trực tiếp làm số phần tử của hợp."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s045",
    "questionId": "math10-m1-q045",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hợp được chia thành ba phần rời nhau: chỉ A, giao, chỉ B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$14+6+9=29$.",
        "result": "29"
      }
    ],
    "finalAnswer": "A. $29$",
    "commonMistakes": [
      "Cộng giao thêm hai lần."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s046",
    "questionId": "math10-m1-q046",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đếm bội của 2, bội của 5 rồi trừ bội chung của 10."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$50+20-10=60$.",
        "result": "60"
      }
    ],
    "finalAnswer": "B. $60$",
    "commonMistakes": [
      "Cộng 50 và 20 mà không loại 10 bội chung."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s047",
    "questionId": "math10-m1-q047",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tính riêng phần chỉ A và chỉ B hoặc dùng công thức đúng một nhóm."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$(68-30)+(54-30)=38+24=62$.",
        "result": "62"
      }
    ],
    "finalAnswer": "C. $62$",
    "commonMistakes": [
      "Dùng $68+54-30$ là số ít nhất một CLB."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s048",
    "questionId": "math10-m1-q048",
    "recognition": "Dạng đếm bằng bao hàm–loại trừ: đề cho số phần tử các nhóm, phần giao và hỏi hợp, phần riêng hoặc phần còn lại.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Dùng bao hàm–loại trừ cho ba tập: cộng đơn, trừ các giao đôi, cộng lại giao ba."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$20+18+15-7-6-5+2=37$.",
        "result": "37"
      }
    ],
    "finalAnswer": "D. $37$",
    "commonMistakes": [
      "Quên cộng lại giao ba sau khi đã trừ ba giao đôi."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s049",
    "questionId": "math10-m1-q049",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai đoạn kín giao khác rỗng khi A không nằm hoàn toàn ngoài B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Cần $m+3\\ge1$ và $m\\le5$, suy ra $-2\\le m\\le5$.",
        "result": "-2\\le m\\le5"
      }
    ],
    "finalAnswer": "A. $-2\\le m\\le5$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s050",
    "questionId": "math10-m1-q050",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh đầu phải của mỗi đoạn với đầu trái của đoạn kia."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+2\\ge-3$ và $m-1\\le0$, nên $-5\\le m\\le1$.",
        "result": "-5\\le m\\le1"
      }
    ],
    "finalAnswer": "B. $-5\\le m\\le1$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s051",
    "questionId": "math10-m1-q051",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Lập hai điều kiện chồng lấn rồi giải theo m."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m+4\\ge6$ và $2m\\le10$, suy ra $1\\le m\\le5$.",
        "result": "1\\le m\\le5"
      }
    ],
    "finalAnswer": "C. $1\\le m\\le5$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s052",
    "questionId": "math10-m1-q052",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai đoạn kín vẫn giao khi chỉ chạm tại một đầu mút."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+1\\ge-4$ và $m\\le-1$, nên $-5\\le m\\le-1$.",
        "result": "-5\\le m\\le-1"
      }
    ],
    "finalAnswer": "D. $-5\\le m\\le-1$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s053",
    "questionId": "math10-m1-q053",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh $3m+2$ với 5 và $3m-1$ với 8."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$3m+2\\ge5$ và $3m-1\\le8$, suy ra $1\\le m\\le3$.",
        "result": "1\\le m\\le3"
      }
    ],
    "finalAnswer": "A. $1\\le m\\le3$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s054",
    "questionId": "math10-m1-q054",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đảm bảo đầu phải A không trước 7 và đầu trái A không sau 9."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+4\\ge7$ và $m-2\\le9$, nên $3\\le m\\le11$.",
        "result": "3\\le m\\le11"
      }
    ],
    "finalAnswer": "B. $3\\le m\\le11$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s055",
    "questionId": "math10-m1-q055",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đặt hai điều kiện chồng lấn rồi chú ý đổi chiều khi nhân với −1."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$-m+2\\ge1\\Rightarrow m\\le1$ và $-m\\le4\\Rightarrow m\\ge-4$.",
        "result": "-4\\le m\\le1"
      }
    ],
    "finalAnswer": "C. $-4\\le m\\le1$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s056",
    "questionId": "math10-m1-q056",
    "recognition": "Dạng tham số để giao khác rỗng: hai khoảng phải chồng lên nhau hoặc cùng chứa điểm tiếp xúc.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh hai đầu mút rồi giải hai bất phương trình bậc nhất."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m+1\\ge-2$ và $2m-3\\le6$, được $-3/2\\le m\\le9/2$.",
        "result": "-\\frac32\\le m\\le\\frac92"
      }
    ],
    "finalAnswer": "D. $-\\frac32\\le m\\le\\frac92$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s057",
    "questionId": "math10-m1-q057",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Ép đầu trái A không nhỏ hơn 0 và đầu phải A không lớn hơn 6."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m-1\\ge0$ và $m+2\\le6$, nên $1\\le m\\le4$.",
        "result": "1\\le m\\le4"
      }
    ],
    "finalAnswer": "A. $1\\le m\\le4$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s058",
    "questionId": "math10-m1-q058",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh đúng hai đầu mút tương ứng của tập con và tập chứa."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m\\ge-4$ và $2m+3\\le7$, suy ra $-2\\le m\\le2$.",
        "result": "-2\\le m\\le2"
      }
    ],
    "finalAnswer": "B. $-2\\le m\\le2$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s059",
    "questionId": "math10-m1-q059",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Khoảng mở A có thể chạm biên của đoạn đóng B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m-2\\ge-1$ và $m+5\\le9$, nên $1\\le m\\le4$.",
        "result": "1\\le m\\le4"
      }
    ],
    "finalAnswer": "C. $1\\le m\\le4$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s060",
    "questionId": "math10-m1-q060",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tập con phải nằm trọn giữa hai đầu mút của B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$3m-2\\ge4$ và $3m+1\\le13$, suy ra $2\\le m\\le4$.",
        "result": "2\\le m\\le4"
      }
    ],
    "finalAnswer": "D. $2\\le m\\le4$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s061",
    "questionId": "math10-m1-q061",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Viết hai bất phương trình đầu mút và cẩn thận khi đổi dấu."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$-m\\ge-6\\Rightarrow m\\le6$; $-m+4\\le2\\Rightarrow m\\ge2$.",
        "result": "2\\le m\\le6"
      }
    ],
    "finalAnswer": "A. $2\\le m\\le6$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s062",
    "questionId": "math10-m1-q062",
    "recognition": "Dạng quan hệ tập con: mọi điểm của tập A phải nằm trong B, nên phải khóa đồng thời cả hai đầu mút.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh đồng thời đầu trái và đầu phải của A với hai đầu mút của B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m-5\\ge-3$ và $2m+1\\le11$, lần lượt cho $m\\ge1$ và $m\\le5$.",
        "result": "1\\le m\\le5"
      }
    ],
    "finalAnswer": "B. $1\\le m\\le5$",
    "commonMistakes": [
      "Không đối chiếu lại phép biến đổi đầu trái của A."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s063",
    "questionId": "math10-m1-q063",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Hai đoạn kín rời nhau khi A nằm hẳn trái hoặc hẳn phải B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+2<5$ hoặc $m>8$, suy ra $m<3$ hoặc $m>8$.",
        "result": "m<3\\text{ hoặc }m>8"
      }
    ],
    "finalAnswer": "C. $m<3\\text{ hoặc }m>8$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s064",
    "questionId": "math10-m1-q064",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Xét hai khả năng A ở hoàn toàn bên trái hoặc bên phải B."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+1<-2$ hoặc $m-1>2$, nên $m<-3$ hoặc $m>3$.",
        "result": "m<-3\\text{ hoặc }m>3"
      }
    ],
    "finalAnswer": "D. $m<-3\\text{ hoặc }m>3$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s065",
    "questionId": "math10-m1-q065",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Viết điều kiện đầu phải A trước 7 hoặc đầu trái A sau 10."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m+3<7$ hoặc $2m>10$, được $m<2$ hoặc $m>5$.",
        "result": "m<2\\text{ hoặc }m>5"
      }
    ],
    "finalAnswer": "A. $m<2\\text{ hoặc }m>5$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s066",
    "questionId": "math10-m1-q066",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "A phải kết thúc trước −6 hoặc bắt đầu sau −2."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+4<-6$ hoặc $m>-2$, suy ra $m<-10$ hoặc $m>-2$.",
        "result": "m<-10\\text{ hoặc }m>-2"
      }
    ],
    "finalAnswer": "B. $m<-10\\text{ hoặc }m>-2$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s067",
    "questionId": "math10-m1-q067",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tách hai vị trí rời nhau và giải từng bất phương trình."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$3m+1<4$ hoặc $3m-2>9$, nên $m<1$ hoặc $m>11/3$.",
        "result": "m<1\\text{ hoặc }m>\\frac{11}{3}"
      }
    ],
    "finalAnswer": "C. $m<1\\text{ hoặc }m>\\frac{11}{3}$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s068",
    "questionId": "math10-m1-q068",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Xét A nằm phải B hoặc trái B rồi đổi chiều đúng khi nhân −1."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$-m>6\\Rightarrow m<-6$ hoặc $-m+2<3\\Rightarrow m>-1$.",
        "result": "m<-6\\text{ hoặc }m>-1"
      }
    ],
    "finalAnswer": "D. $m<-6\\text{ hoặc }m>-1$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s069",
    "questionId": "math10-m1-q069",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "A nằm trái B khi đầu phải nhỏ hơn −4, hoặc nằm phải khi đầu trái lớn hơn 4."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$2m+5<-4$ hoặc $2m-1>4$, suy ra $m<-9/2$ hoặc $m>5/2$.",
        "result": "m<-\\frac92\\text{ hoặc }m>\\frac52"
      }
    ],
    "finalAnswer": "A. $m<-\\frac92\\text{ hoặc }m>\\frac52$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s070",
    "questionId": "math10-m1-q070",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Do $m^2\\ge0$, A không thể nằm hoàn toàn bên trái B vì $m^2+1<2$ chỉ xảy ra khi $m^2<1$ và vẫn có thể; phải xét cả hai phía."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Hai khả năng là $m^2+1<2$ hoặc $m^2>5$, tức $m^2<1$ hoặc $m^2>5$.",
        "result": "m^2<1\\text{ hoặc }m^2>5"
      }
    ],
    "finalAnswer": "B. $m^2<1\\text{ hoặc }m^2>5$",
    "commonMistakes": [
      "Bỏ sót một trong hai vị trí rời nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s071",
    "questionId": "math10-m1-q071",
    "recognition": "Dạng hai tập rời nhau: tách hai khả năng “A hoàn toàn bên trái B” hoặc “A hoàn toàn bên phải B”.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Khoảng A rời B nếu đầu phải A trước −1 hoặc đầu trái A sau 1."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$m+3<-1$ hoặc $m-3>1$, nên $m<-4$ hoặc $m>4$.",
        "result": "m<-4\\text{ hoặc }m>4"
      }
    ],
    "finalAnswer": "C. $m<-4\\text{ hoặc }m>4$",
    "commonMistakes": [
      "Không kiểm tra dấu bằng tại trường hợp hai đầu mút vừa chạm nhau."
    ],
    "reviewSuggestions": [
      "Ôn lại quy tắc đầu mút và phép toán tập hợp."
    ]
  },
  {
    "id": "math10-m1-s072",
    "questionId": "math10-m1-q072",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mệnh đề là câu khẳng định có thể xác định đúng hoặc sai."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "“7 là số nguyên tố” là câu khẳng định đúng; các câu còn lại là câu hỏi, mệnh lệnh hoặc mệnh đề chứa biến.",
        "result": "7 là số nguyên tố."
      }
    ],
    "finalAnswer": "D. 7 là số nguyên tố.",
    "commonMistakes": [
      "Coi mọi câu có nội dung toán học đều là mệnh đề."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s073",
    "questionId": "math10-m1-q073",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Kiểm tra trực tiếp tính đúng sai của câu khẳng định."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "9 chia hết cho 3 nên không phải số nguyên tố; mệnh đề sai.",
        "result": "Sai"
      }
    ],
    "finalAnswer": "A. Sai",
    "commonMistakes": [
      "Nhầm số lẻ với số nguyên tố."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s074",
    "questionId": "math10-m1-q074",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Câu mệnh lệnh không mang giá trị đúng/sai."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "“Hãy tính…” là yêu cầu thực hiện hành động, không phải câu khẳng định.",
        "result": "Hãy tính 2+3."
      }
    ],
    "finalAnswer": "B. Hãy tính 2+3.",
    "commonMistakes": [
      "Gán giá trị đúng cho một câu mệnh lệnh."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s075",
    "questionId": "math10-m1-q075",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Nếu giá trị đúng sai phụ thuộc biến chưa được gán thì đó là mệnh đề chứa biến."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Câu đúng với x=±2 nhưng sai với nhiều giá trị khác, nên chưa có chân trị cố định.",
        "result": "Mệnh đề chứa biến"
      }
    ],
    "finalAnswer": "C. Mệnh đề chứa biến",
    "commonMistakes": [
      "Tự chọn x=2 rồi kết luận câu luôn đúng."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s076",
    "questionId": "math10-m1-q076",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đối chiếu từng phát biểu với định nghĩa hoặc tìm phản ví dụ."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Tính chia hết cho 2 là định nghĩa của số nguyên chẵn.",
        "result": "Mọi số nguyên chẵn đều chia hết cho 2."
      }
    ],
    "finalAnswer": "D. Mọi số nguyên chẵn đều chia hết cho 2.",
    "commonMistakes": [
      "Quên số 2 là số nguyên tố chẵn khi xét phương án nhiễu."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s077",
    "questionId": "math10-m1-q077",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Biểu diễn n=6k rồi kiểm tra hệ quả."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$n=6k=3(2k)$ nên n luôn chia hết cho 3.",
        "result": "Đúng"
      }
    ],
    "finalAnswer": "A. Đúng",
    "commonMistakes": [
      "Thử quá ít ví dụ rồi coi đó là chứng minh."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s078",
    "questionId": "math10-m1-q078",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Lượng từ “có” yêu cầu tìm ít nhất một phần tử trong đúng tập nền R."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Bình phương số thực luôn không âm nên không thể bằng −1.",
        "result": "Sai"
      }
    ],
    "finalAnswer": "B. Sai",
    "commonMistakes": [
      "Nhầm tập số thực với tập số phức."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s079",
    "questionId": "math10-m1-q079",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Với mệnh đề toàn thể, chỉ cần một phản ví dụ để bác bỏ."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Một hình thoi không có góc vuông là phản ví dụ.",
        "result": "Mọi hình thoi đều là hình vuông."
      }
    ],
    "finalAnswer": "C. Mọi hình thoi đều là hình vuông.",
    "commonMistakes": [
      "Đảo chiều quan hệ bao hàm giữa hình vuông và hình thoi."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s080",
    "questionId": "math10-m1-q080",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phân tích $n^2-n=n(n-1)$ là tích hai số nguyên liên tiếp."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Trong hai số nguyên liên tiếp luôn có một số chẵn, nên tích chẵn.",
        "result": "$P(n)$ đúng với mọi số nguyên n"
      }
    ],
    "finalAnswer": "D. $P(n)$ đúng với mọi số nguyên n",
    "commonMistakes": [
      "Chỉ xét riêng n chẵn mà bỏ trường hợp n lẻ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s081",
    "questionId": "math10-m1-q081",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Thay x=0 vào từng mệnh đề toàn thể."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Với x=0, ta có $x^2=0$ không lớn hơn 0.",
        "result": "Mọi số thực x đều thỏa $x^2>0$."
      }
    ],
    "finalAnswer": "A. Mọi số thực x đều thỏa $x^2>0$.",
    "commonMistakes": [
      "Không phân biệt dấu > với ≥."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s082",
    "questionId": "math10-m1-q082",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Nhận dạng thuật ngữ từ đặc điểm tất cả dòng đều đúng."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Một công thức mệnh đề đúng với mọi gán chân trị là hằng đúng.",
        "result": "Hằng đúng"
      }
    ],
    "finalAnswer": "B. Hằng đúng",
    "commonMistakes": [
      "Nhầm hằng đúng với một mệnh đề chỉ đúng trong trường hợp đang xét."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s083",
    "questionId": "math10-m1-q083",
    "recognition": "Dạng nhận biết mệnh đề: xác định đây có phải câu khẳng định có chân trị hay không, rồi kiểm tra đúng/sai bằng định nghĩa hoặc phản ví dụ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mệnh đề toàn thể khẳng định mọi phần tử đều có tính chất."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Chỉ một phần tử không có tính chất đã làm phát biểu “mọi” trở thành sai.",
        "result": "Một phản ví dụ đủ bác bỏ mệnh đề toàn thể."
      }
    ],
    "finalAnswer": "C. Một phản ví dụ đủ bác bỏ mệnh đề toàn thể.",
    "commonMistakes": [
      "Dùng một ví dụ thuận làm bằng chứng cho mệnh đề toàn thể."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s084",
    "questionId": "math10-m1-q084",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định phải có chân trị đối lập chính xác với mệnh đề gốc."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Thêm sự phủ định vào đúng thuộc tính “là số nguyên tố”.",
        "result": "5 không phải là số nguyên tố."
      }
    ],
    "finalAnswer": "D. 5 không phải là số nguyên tố.",
    "commonMistakes": [
      "Đổi sang một mệnh đề khác thay vì phủ định đúng nội dung."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s085",
    "questionId": "math10-m1-q085",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định “mọi” thành “tồn tại ít nhất một” và phủ định tính chất."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$\\neg(\\forall x,P(x))\\equiv\\exists x,\\neg P(x)$.",
        "result": "Có ít nhất một học sinh lớp 10A không đi học đúng giờ."
      }
    ],
    "finalAnswer": "A. Có ít nhất một học sinh lớp 10A không đi học đúng giờ.",
    "commonMistakes": [
      "Đổi “mọi” thành “không có ai”, tạo phát biểu mạnh hơn cần thiết."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s086",
    "questionId": "math10-m1-q086",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định lượng từ tồn tại thành lượng từ mọi và phủ định tính chất."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$\\neg(\\exists n,P(n))\\equiv\\forall n,\\neg P(n)$.",
        "result": "Mọi số nguyên n đều không chia hết cho 7."
      }
    ],
    "finalAnswer": "B. Mọi số nguyên n đều không chia hết cho 7.",
    "commonMistakes": [
      "Giữ nguyên lượng từ “có” khi phủ định."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s087",
    "questionId": "math10-m1-q087",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định dấu > phải bao gồm cả trường hợp nhỏ hơn và bằng."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Không lớn hơn 2 tương đương nhỏ hơn hoặc bằng 2.",
        "result": "$x\\le2$"
      }
    ],
    "finalAnswer": "C. $x\\le2$",
    "commonMistakes": [
      "Đổi > thành < và bỏ mất trường hợp bằng."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s088",
    "questionId": "math10-m1-q088",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Áp dụng De Morgan: phủ định của hội là tuyển các phủ định."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$\\neg(P\\land Q)\\equiv\\neg P\\lor\\neg Q$.",
        "result": "$a\\ne b$ hoặc $c\\ne d$"
      }
    ],
    "finalAnswer": "D. $a\\ne b$ hoặc $c\\ne d$",
    "commonMistakes": [
      "Giữ phép “và” sau khi phủ định."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s089",
    "questionId": "math10-m1-q089",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Áp dụng De Morgan: phủ định của tuyển là hội các phủ định."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$\\neg(P\\lor Q)\\equiv\\neg P\\land\\neg Q$.",
        "result": "$a\\le0$ và $b\\le0$"
      }
    ],
    "finalAnswer": "A. $a\\le0$ và $b\\le0$",
    "commonMistakes": [
      "Không đổi “hoặc” thành “và”."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s090",
    "questionId": "math10-m1-q090",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đổi ∀ thành ∃ và phủ định dấu > thành ≤."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$\\neg(\\forall x,P(x))=\\exists x,\\neg P(x)$.",
        "result": "Có số thực x sao cho $x^2+1\\le0$."
      }
    ],
    "finalAnswer": "B. Có số thực x sao cho $x^2+1\\le0$.",
    "commonMistakes": [
      "Chỉ đổi dấu bất đẳng thức mà không đổi lượng từ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s091",
    "questionId": "math10-m1-q091",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đổi ∃ thành ∀, sau đó dùng De Morgan cho hai tính chất nối bằng “và”."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phủ định “chẵn và chia hết cho 3” là “lẻ hoặc không chia hết cho 3”.",
        "result": "Mọi số tự nhiên n đều lẻ hoặc không chia hết cho 3."
      }
    ],
    "finalAnswer": "C. Mọi số tự nhiên n đều lẻ hoặc không chia hết cho 3.",
    "commonMistakes": [
      "Đổi lượng từ đúng nhưng giữ sai liên từ logic."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s092",
    "questionId": "math10-m1-q092",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định $P\\Rightarrow Q$ tương đương $P\\land\\neg Q$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Mệnh đề kéo theo chỉ sai khi tiền đề đúng và kết luận sai.",
        "result": "Trời mưa và đường không ướt."
      }
    ],
    "finalAnswer": "D. Trời mưa và đường không ướt.",
    "commonMistakes": [
      "Lấy mệnh đề đảo làm phủ định."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s093",
    "questionId": "math10-m1-q093",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phủ định một mệnh đề toàn thể bằng một trường hợp tồn tại không thỏa."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Chỉ cần tồn tại phương trình có nghiệm kép hoặc vô nghiệm để phủ định phát biểu gốc.",
        "result": "Có phương trình bậc hai không có hai nghiệm phân biệt."
      }
    ],
    "finalAnswer": "A. Có phương trình bậc hai không có hai nghiệm phân biệt.",
    "commonMistakes": [
      "Thay phủ định bằng một phát biểu cực đoan “mọi…đều không”."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s094",
    "questionId": "math10-m1-q094",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Nhận ra “không có” là phủ định của lượng từ tồn tại."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phủ định hai lần đưa về phát biểu tồn tại một số nguyên lớn nhất.",
        "result": "Có một số nguyên lớn nhất."
      }
    ],
    "finalAnswer": "B. Có một số nguyên lớn nhất.",
    "commonMistakes": [
      "Giữ từ “không” rồi thay đổi thuộc tính khác."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s095",
    "questionId": "math10-m1-q095",
    "recognition": "Dạng phủ định: tìm lượng từ và liên từ chính, đổi ∀↔∃, và↔hoặc, đồng thời phủ định đúng quan hệ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Dùng quy tắc đổi lượng từ và định luật De Morgan."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phủ định “mọi x đều P” là “tồn tại x không P”.",
        "result": "$\\neg(\\forall x,P(x))\\equiv\\exists x,\\neg P(x)$"
      }
    ],
    "finalAnswer": "C. $\\neg(\\forall x,P(x))\\equiv\\exists x,\\neg P(x)$",
    "commonMistakes": [
      "Phủ định tính chất nhưng quên đổi lượng từ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s096",
    "questionId": "math10-m1-q096",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mệnh đề đảo của $P\\Rightarrow Q$ là $Q\\Rightarrow P$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Đổi vị trí giả thiết “chia hết cho 4” và kết luận “chẵn”.",
        "result": "Nếu một số chẵn thì số đó chia hết cho 4."
      }
    ],
    "finalAnswer": "D. Nếu một số chẵn thì số đó chia hết cho 4.",
    "commonMistakes": [
      "Nhầm mệnh đề đảo với phản đảo hoặc phủ định."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s097",
    "questionId": "math10-m1-q097",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Trong $P\\Rightarrow Q$, P là điều kiện đủ của Q."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Biết tam giác cân tại A đủ để suy ra AB=AC.",
        "result": "Điều kiện đủ"
      }
    ],
    "finalAnswer": "A. Điều kiện đủ",
    "commonMistakes": [
      "Đảo vai trò điều kiện cần và đủ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s098",
    "questionId": "math10-m1-q098",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Trong $P\\Rightarrow Q$, Q là điều kiện cần của P."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Muốn n chia hết cho 6 thì bắt buộc n phải chia hết cho 3.",
        "result": "Điều kiện cần"
      }
    ],
    "finalAnswer": "B. Điều kiện cần",
    "commonMistakes": [
      "Thấy kết luận đứng sau nên gọi là điều kiện đủ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s099",
    "questionId": "math10-m1-q099",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mệnh đề kéo theo tương đương với phản đảo của nó."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$P\\Rightarrow Q$ và $\\neg Q\\Rightarrow\\neg P$ có cùng bảng chân trị.",
        "result": "$\\neg Q\\Rightarrow\\neg P$"
      }
    ],
    "finalAnswer": "C. $\\neg Q\\Rightarrow\\neg P$",
    "commonMistakes": [
      "Chọn mệnh đề đảo hoặc mệnh đề phản."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s100",
    "questionId": "math10-m1-q100",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Lập mệnh đề đảo rồi kiểm tra phản ví dụ."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$x=-2$ thỏa $x^2=4$ nhưng không thỏa $x=2$, nên mệnh đề đảo sai.",
        "result": "Nếu $x^2=4$ thì $x=2$ là sai."
      }
    ],
    "finalAnswer": "D. Nếu $x^2=4$ thì $x=2$ là sai.",
    "commonMistakes": [
      "Cho rằng mệnh đề gốc đúng thì mệnh đề đảo cũng đúng."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s101",
    "questionId": "math10-m1-q101",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "“Khi và chỉ khi” là hội của mệnh đề thuận và đảo."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Cần chứng minh đồng thời hai phép kéo theo ngược chiều.",
        "result": "n chẵn ⇒ n² chẵn và n² chẵn ⇒ n chẵn"
      }
    ],
    "finalAnswer": "A. n chẵn ⇒ n² chẵn và n² chẵn ⇒ n chẵn",
    "commonMistakes": [
      "Chỉ kiểm tra một chiều của mệnh đề tương đương."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s102",
    "questionId": "math10-m1-q102",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Tìm điều kiện vừa suy ra chia hết cho 10, vừa được suy ra từ chia hết cho 10."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "$10=2\\cdot5$ và 2,5 nguyên tố cùng nhau.",
        "result": "n chia hết cho cả 2 và 5"
      }
    ],
    "finalAnswer": "B. n chia hết cho cả 2 và 5",
    "commonMistakes": [
      "Chọn một điều kiện chỉ cần nhưng chưa đủ."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s103",
    "questionId": "math10-m1-q103",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Đọc dòng duy nhất nhận giá trị sai trong bảng chân trị kéo theo."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Một lời hứa “nếu P thì Q” chỉ bị vi phạm khi P xảy ra nhưng Q không xảy ra.",
        "result": "P đúng, Q sai"
      }
    ],
    "finalAnswer": "C. P đúng, Q sai",
    "commonMistakes": [
      "Cho rằng tiền đề sai làm mệnh đề kéo theo sai."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s104",
    "questionId": "math10-m1-q104",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "So sánh miền nghiệm của P và Q."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Mọi x>3 đều >1, nên P đủ cho Q; chiều ngược lại sai với x=2.",
        "result": "$P\\Rightarrow Q$"
      }
    ],
    "finalAnswer": "D. $P\\Rightarrow Q$",
    "commonMistakes": [
      "Nhầm tập con miền nghiệm và đảo chiều kéo theo."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s105",
    "questionId": "math10-m1-q105",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Phản đảo của $P\\Rightarrow Q$ là $\\neg Q\\Rightarrow\\neg P$."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Phủ định kết luận đưa lên làm giả thiết, phủ định giả thiết làm kết luận.",
        "result": "Nếu tứ giác không là hình thoi thì nó không là hình vuông."
      }
    ],
    "finalAnswer": "A. Nếu tứ giác không là hình thoi thì nó không là hình vuông.",
    "commonMistakes": [
      "Nhầm phản đảo với mệnh đề phản."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s106",
    "questionId": "math10-m1-q106",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Mệnh đề tương đương gồm hai phép kéo theo."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Hai chiều bảo đảm P và Q luôn có cùng giá trị chân lí.",
        "result": "Chứng minh cả $P\\Rightarrow Q$ và $Q\\Rightarrow P$"
      }
    ],
    "finalAnswer": "B. Chứng minh cả $P\\Rightarrow Q$ và $Q\\Rightarrow P$",
    "commonMistakes": [
      "Dừng sau khi chứng minh một chiều."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  },
  {
    "id": "math10-m1-s107",
    "questionId": "math10-m1-q107",
    "recognition": "Dạng kéo theo–tương đương: xác định P, Q; phân biệt mệnh đề đảo, phản đảo và vai trò điều kiện cần/đủ.",
    "detailedSteps": [
      {
        "order": 1,
        "title": "Nhận dạng và chọn quy tắc",
        "explanation": "Điều kiện đủ đứng ở vế giả thiết của phép kéo theo."
      },
      {
        "order": 2,
        "title": "Thực hiện và kiểm tra",
        "explanation": "Có A là đủ để kết luận B, nên A kéo theo B.",
        "result": "$A\\Rightarrow B$"
      }
    ],
    "finalAnswer": "C. $A\\Rightarrow B$",
    "commonMistakes": [
      "Đảo thành B kéo theo A vì nhầm với điều kiện cần."
    ],
    "reviewSuggestions": [
      "Ôn lại mệnh đề và phép toán logic."
    ]
  }
];
