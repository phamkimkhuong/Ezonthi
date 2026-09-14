import { bioProblem, biologyTable } from './helpers';

const topicId = 'bio10-adv-method';

export const methodProblems = [
  bioProblem(topicId, {
    content: 'Bốn nhóm ống nghiệm đều chứa cùng lượng hydrogen peroxide và dịch chiết khoai tây. Kết quả nào được phép kết luận trực tiếp từ bảng?',
    correct: 'Trong phạm vi 10–60 °C, hoạt tính catalase cao nhất ở 35 °C và giảm mạnh ở 60 °C.',
    distractors: ['Nhiệt độ tối ưu tuyệt đối của catalase khoai tây là đúng 35 °C.', 'Mọi enzyme đều bị phá hủy hoàn toàn ở 60 °C.', 'Nhiệt độ là yếu tố duy nhất quyết định lượng bọt tạo thành.'],
    insight: 'Kết luận phải bị giới hạn bởi các mức nhiệt đã đo và đại lượng thực sự quan sát.',
    evidence: 'Bảng chỉ so sánh bốn mức nhiệt; 35 °C cho cột bọt cao nhất, còn 60 °C thấp hơn rõ rệt. Không có phép đo giữa các mốc và cũng không đo trực tiếp cấu trúc enzyme.',
    mechanism: 'Tốc độ phản ứng enzyme thường tăng đến một vùng thích hợp rồi giảm khi cấu trúc protein bị ảnh hưởng, nhưng dữ liệu rời rạc không xác định được một nhiệt độ tối ưu tuyệt đối.',
    reasoning: ['So sánh trong cùng thời gian giúp dùng chiều cao bọt như chỉ báo tương đối.', 'Cụm “trong phạm vi đã khảo sát” giữ kết luận đúng với năng lực của thiết kế.'],
    distractorReasons: ['nội suy quá mức giữa các nhiệt độ chưa được đo.', 'khái quát từ một enzyme sang mọi enzyme và dùng từ “hoàn toàn” khi không có bằng chứng.', 'bỏ qua pH, lượng enzyme, cơ chất và sai số đo.'],
    tags: ['thiết kế thí nghiệm', 'giới hạn kết luận'],
    stimulus: biologyTable('bio10-adv-method-01', 'Catalase và nhiệt độ', 'Các ống được ủ 5 phút trước khi đo.', 'Chiều cao cột bọt sau 60 giây', [{ key: 'temp', label: 'Nhiệt độ', unit: '°C' }, { key: 'foam', label: 'Cột bọt', unit: 'mm' }], [{ temp: 10, foam: 7 }, { temp: 25, foam: 22 }, { temp: 35, foam: 31 }, { temp: 60, foam: 3 }])
  }),
  bioProblem(topicId, {
    content: 'Một lớp đặt 30 chậu cây được bón phân ở cửa sổ phía nam và 30 chậu không bón ở cửa sổ phía bắc. Sau ba tuần, nhóm bón phân cao hơn. Điều chỉnh nào quan trọng nhất để kiểm tra riêng tác động của phân bón?',
    correct: 'Phân bố ngẫu nhiên chậu của cả hai nhóm vào các vị trí ánh sáng tương đương và chỉ thay đổi việc bón phân.',
    distractors: ['Tăng mỗi nhóm lên 100 chậu nhưng vẫn giữ ở hai cửa sổ khác nhau.', 'Đo thêm màu lá nhưng không thay đổi cách bố trí.', 'Chỉ chọn những chậu có chiều cao ban đầu giống hệt nhau.'],
    insight: 'Ánh sáng đang đồng biến với xử lí phân bón nên là biến nhiễu.',
    evidence: 'Hai nhóm khác nhau đồng thời ở phân bón và hướng cửa sổ. Vì vậy chênh lệch chiều cao không thể quy riêng cho một nguyên nhân.',
    mechanism: 'Ngẫu nhiên hóa và giữ các điều kiện còn lại tương đương giúp tách tác động của biến độc lập khỏi biến gây nhiễu.',
    reasoning: ['Tăng cỡ mẫu không sửa được sai lệch có hệ thống trong bố trí.', 'Đo nhiều chỉ tiêu hơn cũng không làm hai nhóm trở nên so sánh được.'],
    distractorReasons: ['cỡ mẫu lớn vẫn cho kết luận lệch nếu ánh sáng không được kiểm soát.', 'thêm biến phụ thuộc không loại biến nhiễu.', 'đồng nhất tuyệt đối cây ban đầu không xử lí khác biệt ánh sáng sau đó.'],
    tags: ['biến nhiễu', 'ngẫu nhiên hóa']
  }),
  bioProblem(topicId, {
    content: 'Ảnh một tế bào có thanh tỉ lệ 10 µm dài 25 mm trên màn hình. Chiều dài tế bào đo được 87,5 mm. Kích thước thật của tế bào là bao nhiêu?',
    correct: '35 µm.',
    distractors: ['3,5 µm.', '87,5 µm.', '350 µm.'],
    insight: 'Phải dùng tỉ số với thanh chuẩn trên chính ảnh, không dùng độ phóng đại màn hình.',
    evidence: '87,5 mm gấp 3,5 lần chiều dài thanh tỉ lệ 25 mm; mỗi thanh biểu diễn 10 µm.',
    mechanism: 'Ảnh có thể bị phóng to hoặc thu nhỏ nhưng tỉ số giữa vật và thanh tỉ lệ không đổi.',
    reasoning: ['Tính 87,5/25 = 3,5.', 'Nhân 3,5 với 10 µm để thu được 35 µm.'],
    distractorReasons: ['bỏ mất hệ số 10 µm của thanh chuẩn.', 'đồng nhất độ dài trên màn hình với kích thước thật.', 'nhân thêm sai một hệ số mười.'],
    tags: ['kính hiển vi', 'thanh tỉ lệ']
  }),
  bioProblem(topicId, {
    content: 'Khi so sánh vòng vô khuẩn của hai loại kháng sinh trên đĩa thạch, yếu tố nào phải được chuẩn hóa để phép so sánh có giá trị nhất?',
    correct: 'Mật độ vi khuẩn ban đầu, đường kính đĩa giấy, lượng thuốc và điều kiện ủ.',
    distractors: ['Màu của đĩa giấy và tên thương mại của thuốc.', 'Chỉ đường kính hộp Petri, các yếu tố khác có thể khác.', 'Chỉ nhiệt độ phòng lúc đọc kết quả.'],
    insight: 'Vòng vô khuẩn phụ thuộc cả khuếch tán thuốc và mật độ vi khuẩn, không chỉ độ nhạy.',
    evidence: 'Nếu đĩa giấy chứa lượng khác nhau hoặc thảm vi khuẩn không đều, cùng một chủng vẫn tạo vòng có kích thước khác.',
    mechanism: 'Chuẩn hóa biến kiểm soát giúp khác biệt vòng vô khuẩn phản ánh chủ yếu loại kháng sinh.',
    reasoning: ['Các điều kiện được liệt kê tác động trực tiếp đến nồng độ thuốc quanh đĩa và khả năng mọc.', 'Tên thương mại hoặc màu giấy không phải biến sinh học quyết định trong phép đo.'],
    distractorReasons: ['chọn các đặc điểm không đảm bảo liều và khả năng khuếch tán tương đương.', 'bỏ qua những biến quan trọng nhất.', 'thời điểm đọc, môi trường ủ và lượng thuốc vẫn chưa được kiểm soát.'],
    tags: ['đối chứng', 'kháng sinh đồ']
  }),
  bioProblem(topicId, {
    content: 'Một thuốc thử đổi màu càng đậm khi nồng độ đường khử càng cao. Nhóm nghiên cứu chỉ ghi “nhạt, vừa, đậm” bằng mắt. Cải tiến nào làm dữ liệu định lượng và ít thiên lệch hơn?',
    correct: 'Lập đường chuẩn bằng các nồng độ đã biết và đo độ hấp thụ bằng máy ở cùng bước sóng.',
    distractors: ['Để một người có thị lực tốt hơn gọi tên màu.', 'Chụp ảnh mỗi mẫu ở các điều kiện ánh sáng khác nhau.', 'Lặp lại nhiều lần nhưng vẫn chỉ ghi ba mức màu.'],
    insight: 'Đường chuẩn chuyển tín hiệu quang học thành nồng độ; máy đo giảm đánh giá chủ quan.',
    evidence: 'Ba nhãn màu chỉ là dữ liệu thứ bậc, không cho biết chênh lệch nồng độ bằng bao nhiêu.',
    mechanism: 'Độ hấp thụ trong vùng phù hợp có thể liên hệ với nồng độ qua đường chuẩn được đo cùng điều kiện.',
    reasoning: ['Mẫu chuẩn tạo mốc đối chiếu khách quan.', 'Giữ cùng bước sóng và điều kiện đo tránh tạo sai lệch mới.'],
    distractorReasons: ['vẫn phụ thuộc cảm nhận cá nhân.', 'ánh sáng thay đổi làm giá trị ảnh không so sánh được.', 'lặp lại không biến thang đo định tính thành định lượng.'],
    tags: ['định lượng', 'đường chuẩn']
  }),
  bioProblem(topicId, {
    content: 'Một dự án muốn lưu DNA của học sinh để “nghiên cứu sau này”, nhưng phiếu đồng thuận không nêu mục đích tương lai và không cho quyền rút mẫu. Yêu cầu đạo đức tối thiểu nào đang thiếu?',
    correct: 'Đồng thuận có hiểu biết, giới hạn sử dụng, bảo mật và quyền rút khỏi nghiên cứu.',
    distractors: ['Chỉ cần giáo viên chủ nhiệm đồng ý thay cho mọi học sinh.', 'Chỉ cần xóa tên nhưng có thể dùng mẫu cho bất kỳ mục đích nào.', 'Không cần đồng thuận vì DNA được lấy từ tế bào niêm mạc đã rời cơ thể.'],
    insight: 'Mẫu sinh học vẫn gắn với quyền riêng tư và quyền tự quyết của người tham gia.',
    evidence: 'Phiếu hiện tại không giải thích phạm vi dùng mẫu và khiến người tham gia không thể thay đổi quyết định.',
    mechanism: 'Đồng thuận có hiểu biết phải tự nguyện, đủ thông tin và cho phép rút lui; dữ liệu di truyền cần bảo vệ đặc biệt.',
    reasoning: ['Ẩn danh chỉ giảm một phần rủi ro, không thay thế đồng thuận.', 'Người giám hộ có vai trò với trẻ vị thành niên nhưng không làm mất yêu cầu giải thích phù hợp cho học sinh.'],
    distractorReasons: ['trao toàn quyền quyết định cho một người không phải người tham gia hoặc người giám hộ hợp pháp.', 'coi ẩn danh là giấy phép sử dụng vô hạn.', 'nhầm mẫu đã tách khỏi cơ thể với dữ liệu không còn thuộc phạm vi đạo đức.'],
    tags: ['đạo đức sinh học', 'đồng thuận']
  }),
  bioProblem(topicId, {
    content: 'Thuốc X được thử trên các lô tế bào. Kết luận nào hợp lí nhất từ bảng, biết mỗi giá trị là trung bình của sáu lô độc lập?',
    correct: 'X làm giảm tỉ lệ sống theo liều trong điều kiện khảo sát; cần thêm nhóm dung môi nếu X được hòa trong dung môi riêng.',
    distractors: ['X chắc chắn chữa được ung thư ở người vì tế bào sống giảm.', 'Liều 20 gây chết toàn bộ tế bào vì giá trị trung bình thấp.', 'Không cần nhóm đối chứng vì đã có ba liều X.'],
    insight: 'Dữ liệu nuôi cấy chỉ hỗ trợ quan hệ liều–đáp ứng trong mô hình, chưa chứng minh hiệu quả lâm sàng.',
    evidence: 'Tỉ lệ sống giảm từ 100 xuống 77, 48 và 19% khi liều tăng; không mức nào bằng 0 và bảng chưa nói về dung môi.',
    mechanism: 'Đối chứng dung môi tách tác động của hoạt chất khỏi chất mang; ngoại suy từ tế bào sang cơ thể cần nhiều tầng bằng chứng.',
    reasoning: ['Sáu lô độc lập làm kết quả đáng tin hơn nhưng không mở rộng phạm vi kết luận.', 'Cụm “trong điều kiện khảo sát” phản ánh đúng giới hạn mô hình.'],
    distractorReasons: ['đánh đồng độc tính trên tế bào với hiệu quả và an toàn ở người.', 'biến giá trị trung bình 19% thành 0%.', 'không nhận ra cần so với tất cả thành phần ngoài hoạt chất.'],
    tags: ['liều–đáp ứng', 'đối chứng'],
    stimulus: biologyTable('bio10-adv-method-07', 'Đáp ứng với thuốc X', 'Tế bào được xử lí 24 giờ.', 'Tỉ lệ tế bào sống', [{ key: 'dose', label: 'Liều X', unit: 'µM' }, { key: 'survival', label: 'Tế bào sống', unit: '%' }], [{ dose: 0, survival: 100 }, { dose: 5, survival: 77 }, { dose: 10, survival: 48 }, { dose: 20, survival: 19 }])
  }),
  bioProblem(topicId, {
    content: 'Một khảo sát thấy học sinh vận động nhiều có số lượng ty thể trung bình trong tế bào cơ cao hơn. Phát biểu nào mô tả đúng nhất bằng chứng hiện có?',
    correct: 'Hai biến có liên hệ; chưa thể khẳng định vận động là nguyên nhân nếu chưa kiểm soát các khác biệt nền hoặc thực hiện thiết kế phù hợp.',
    distractors: ['Vận động chắc chắn tạo ra ty thể mới ở mọi loại tế bào.', 'Nhiều ty thể chắc chắn khiến học sinh tự chọn vận động nhiều.', 'Không có bất kỳ thông tin hữu ích nào vì nghiên cứu quan sát luôn vô giá trị.'],
    insight: 'Tương quan không tự xác định chiều nhân quả hoặc loại bỏ biến thứ ba.',
    evidence: 'Khảo sát chỉ phân nhóm theo hành vi đã có; dinh dưỡng, di truyền, sức khỏe và loại cơ có thể khác nhau.',
    mechanism: 'Thiết kế can thiệp có đối chứng hoặc theo dõi dọc giúp đánh giá nhân quả tốt hơn nghiên cứu cắt ngang.',
    reasoning: ['Mối liên hệ vẫn là một quan sát hợp lệ và có thể tạo giả thuyết.', 'Không được đảo chiều nguyên nhân chỉ vì hai biến đi cùng nhau.'],
    distractorReasons: ['dùng từ tuyệt đối và mở rộng sang mọi tế bào.', 'tự ý đảo chiều quan hệ.', 'phủ nhận giá trị mô tả và tạo giả thuyết của nghiên cứu quan sát.'],
    tags: ['tương quan', 'nhân quả']
  }),
  bioProblem(topicId, {
    content: 'Nhà nghiên cứu muốn kiểm tra riêng ảnh hưởng của pH lên tốc độ sinh trưởng vi khuẩn. Bố trí nào phù hợp nhất?',
    correct: 'Dùng cùng chủng, môi trường, nhiệt độ và mật độ đầu; thay đổi pH, có lặp độc lập và theo dõi OD theo thời gian.',
    distractors: ['Mỗi pH dùng một chủng vi khuẩn khác để tăng tính đa dạng.', 'pH thấp ủ ở 20 °C, pH cao ủ ở 37 °C để vi khuẩn đều có thể mọc.', 'Chỉ đo OD một lần ở cuối và không cần mẫu trắng môi trường.'],
    insight: 'Muốn quy kết cho pH thì pH phải là khác biệt có hệ thống duy nhất giữa các nhóm.',
    evidence: 'Chủng, nhiệt độ và mật độ đầu đều tác động lên sinh trưởng; OD còn bao gồm độ đục nền của môi trường.',
    mechanism: 'Mẫu trắng hiệu chỉnh nền, lặp độc lập ước lượng biến thiên và chuỗi thời gian phân biệt pha trễ với tốc độ tăng.',
    reasoning: ['Giữ chủng và nhiệt độ như nhau ngăn tương tác không kiểm soát.', 'Theo dõi nhiều thời điểm tránh kết luận sai từ một ảnh chụp cuối quá trình.'],
    distractorReasons: ['đưa kiểu gene thành biến nhiễu.', 'làm pH và nhiệt độ cùng thay đổi.', 'không hiệu chỉnh nền và không biết đường cong sinh trưởng.'],
    tags: ['biến kiểm soát', 'sinh trưởng'],
    stimulus: biologyTable('bio10-adv-method-09', 'Thiết kế sơ bộ', 'Ba phương án bố trí đang được cân nhắc.', 'Các biến có thể thay đổi', [{ key: 'factor', label: 'Yếu tố' }, { key: 'impact', label: 'Có thể ảnh hưởng' }], [{ factor: 'pH', impact: 'Hoạt tính enzyme, màng' }, { factor: 'Nhiệt độ', impact: 'Tốc độ chuyển hóa' }, { factor: 'Mật độ đầu', impact: 'Thời điểm vào pha log' }])
  }),
  bioProblem(topicId, {
    content: 'Tất cả mẫu đối chứng được đo vào buổi sáng và tất cả mẫu xử lí được đo vào buổi chiều bằng một máy có tín hiệu giảm dần theo ngày. Đây là loại sai lệch nào và sửa thế nào?',
    correct: 'Hiệu ứng lô/thời điểm; xen kẽ hoặc ngẫu nhiên hóa thứ tự đo và dùng chuẩn kiểm tra máy.',
    distractors: ['Sai số ngẫu nhiên thuần túy; chỉ cần lấy trung bình.', 'Sai số do cỡ mẫu nhỏ; tăng số mẫu nhưng giữ nguyên thứ tự đo.', 'Không phải sai lệch vì mọi mẫu trong một nhóm được đo cùng lúc.'],
    insight: 'Nhóm sinh học bị trùng hoàn toàn với thời điểm đo nên trôi máy có thể giả thành hiệu ứng xử lí.',
    evidence: 'Tín hiệu giảm theo ngày khiến nhóm chiều có xu hướng thấp hơn dù mẫu giống nhau.',
    mechanism: 'Ngẫu nhiên hóa/xen kẽ phá liên hệ giữa nhóm và thứ tự; chuẩn kiểm soát phát hiện trôi thiết bị.',
    reasoning: ['Lấy trung bình không loại sai lệch cùng chiều.', 'Tăng số mẫu trong bố trí lệch chỉ làm ước lượng sai trở nên “chắc” hơn.'],
    distractorReasons: ['gọi một sai lệch hệ thống là nhiễu ngẫu nhiên.', 'không sửa sự gắn nhóm với thời điểm.', 'nhầm tính nhất quán trong nhóm với tính công bằng giữa nhóm.'],
    tags: ['hiệu ứng lô', 'ngẫu nhiên hóa']
  }),
  bioProblem(topicId, {
    content: 'Một xét nghiệm có độ nhạy 95% và độ đặc hiệu 90% được dùng trong quần thể chỉ có 1% người mắc bệnh. Vì sao không thể nói “người dương tính có 95% khả năng mắc bệnh”?',
    correct: 'Vì xác suất sau xét nghiệm còn phụ thuộc tỉ lệ mắc ban đầu; số dương tính giả có thể lớn hơn dương tính thật.',
    distractors: ['Vì độ nhạy và độ đặc hiệu luôn cộng lại bằng 100%.', 'Vì xét nghiệm có độ nhạy cao thì không bao giờ có âm tính giả.', 'Vì tỉ lệ mắc bệnh không liên quan đến cách diễn giải kết quả cá nhân.'],
    insight: 'Độ nhạy là xác suất dương tính khi đã mắc bệnh, không phải xác suất mắc bệnh khi nhận kết quả dương tính.',
    evidence: 'Trong 10.000 người, khoảng 100 người mắc: 95 dương tính thật; trong 9.900 người không mắc, khoảng 990 dương tính giả.',
    mechanism: 'Khi bệnh hiếm, quần thể không bệnh rất lớn nên một tỉ lệ dương tính giả vừa phải vẫn tạo nhiều ca giả.',
    reasoning: ['Tổng dương tính xấp xỉ 1.085, chỉ 95 là thật.', 'Vì vậy xác suất sau xét nghiệm thấp hơn nhiều so với 95%.'],
    distractorReasons: ['hai đại lượng không có quy tắc cộng như vậy.', 'độ nhạy 95% vẫn cho phép 5% âm tính giả trong nhóm mắc.', 'phủ nhận vai trò của xác suất ban đầu.'],
    tags: ['độ nhạy–đặc hiệu', 'xác suất điều kiện']
  }),
  bioProblem(topicId, {
    content: 'Hai nghiên cứu đều đo 120 cây. Nghiên cứu A dùng 120 cây trong một nhà kính; nghiên cứu B dùng 20 cây ở mỗi một trong sáu nhà kính độc lập. Khi mục tiêu là khái quát qua điều kiện nhà kính, thiết kế nào mạnh hơn?',
    correct: 'Nghiên cứu B, vì có sáu đơn vị lặp độc lập ở cấp điều kiện cần khái quát.',
    distractors: ['Hai nghiên cứu hoàn toàn tương đương vì đều có 120 cây.', 'Nghiên cứu A mạnh hơn vì mọi cây chịu điều kiện giống nhau.', 'Không nghiên cứu nào có lặp vì cây không phải bản sao di truyền.'],
    insight: 'Đơn vị lặp phải phù hợp với cấp mà xử lí hoặc điều kiện được áp dụng.',
    evidence: 'Các cây cùng một nhà kính chia sẻ nhiệt độ, ánh sáng và nhiều nhiễu chung nên không phải 120 lần lặp độc lập của “điều kiện nhà kính”.',
    mechanism: 'Lặp ở nhiều nhà kính cho phép ước lượng biến thiên giữa nhà kính và khái quát tốt hơn.',
    reasoning: ['Số cá thể lớn trong một lô giúp đo trung bình lô chính xác nhưng không thay thế lặp lô.', 'Tính độc lập thống kê không đòi hỏi các cá thể giống hệt về gene.'],
    distractorReasons: ['chỉ đếm cá thể mà bỏ cấu trúc lồng nhau.', 'đồng nhất điều kiện làm giảm khả năng khái quát.', 'hiểu sai khái niệm lặp độc lập.'],
    tags: ['mẫu lặp', 'khái quát hóa']
  }),
  bioProblem(topicId, {
    content: 'Dịch nuôi cấy được pha loãng liên tiếp 10 lần. Ở độ pha loãng \(10^{-5}\), cấy 0,1 mL thu được 64 khuẩn lạc. Mật độ ban đầu gần nhất là bao nhiêu?',
    correct: '\(6,4\\times10^7\) CFU/mL.',
    distractors: ['\(6,4\\times10^5\) CFU/mL.', '\(6,4\\times10^6\) CFU/mL.', '\(6,4\\times10^8\) CFU/mL.'],
    insight: 'Phải hiệu chỉnh đồng thời hệ số pha loãng và thể tích cấy 0,1 mL.',
    evidence: '64 khuẩn lạc nằm trên đĩa nhận 0,1 mL của mẫu đã loãng \(10^5\) lần.',
    mechanism: 'CFU/mL ban đầu = số khuẩn lạc / (thể tích cấy × độ pha loãng).',
    reasoning: ['Mật độ trong mẫu pha loãng là 64/0,1 = 640 CFU/mL.', 'Nhân \(10^5\) để hoàn nguyên về mẫu ban đầu.'],
    distractorReasons: ['chỉ hoàn nguyên pha loãng mà quên chia thể tích.', 'bỏ hệ số 10 do cấy 0,1 mL.', 'nhân thừa thêm một hệ số 10.'],
    tags: ['pha loãng', 'định lượng vi sinh'],
    stimulus: biologyTable('bio10-adv-method-13', 'Đếm khuẩn lạc', 'Các đĩa được ủ cùng điều kiện.', 'Kết quả pha loãng', [{ key: 'dilution', label: 'Độ pha loãng' }, { key: 'colonies', label: 'Khuẩn lạc' }], [{ dilution: '10⁻⁴', colonies: '>300' }, { dilution: '10⁻⁵', colonies: 64 }, { dilution: '10⁻⁶', colonies: 5 }])
  }),
  bioProblem(topicId, {
    content: 'Để ước lượng tỉ lệ cây bị bệnh dọc một cánh đồng có độ ẩm tăng từ tây sang đông, cách lấy mẫu nào giảm sai lệch vị trí tốt nhất?',
    correct: 'Đặt nhiều tuyến cắt ngang gradient, chọn ô ngẫu nhiên trong từng đoạn và ghi vị trí–độ ẩm.',
    distractors: ['Chỉ lấy cây ở lối vào vì dễ tiếp cận.', 'Chọn những vùng có triệu chứng rõ nhất để khỏi bỏ sót bệnh.', 'Lấy 100 lá từ một cây nằm giữa ruộng.'],
    insight: 'Mẫu cần bao phủ gradient không gian và đơn vị độc lập là nhiều cây/ô, không phải nhiều lá một cây.',
    evidence: 'Bệnh có thể liên quan độ ẩm nên lấy mẫu thuận tiện ở một vị trí sẽ không đại diện toàn cánh đồng.',
    mechanism: 'Phân tầng theo không gian rồi ngẫu nhiên hóa trong tầng vừa đảm bảo bao phủ vừa giảm lựa chọn chủ quan.',
    reasoning: ['Ghi độ ẩm cho phép kiểm tra quan hệ môi trường thay vì coi toàn ruộng đồng nhất.', 'Nhiều lá trên một cây chủ yếu mô tả cây đó.'],
    distractorReasons: ['tạo sai lệch thuận tiện.', 'chủ động làm tăng ước lượng bệnh.', 'lặp giả ở cấp lá.'],
    tags: ['lấy mẫu', 'sai lệch không gian']
  }),
  bioProblem(topicId, {
    content: 'Một chỉnh sửa gene trên phôi có thể di truyền cho thế hệ sau nhưng chưa biết đầy đủ tác động ngoài mục tiêu. Quyết định nghiên cứu nào phù hợp nhất với nguyên tắc thận trọng?',
    correct: 'Không chuyển phôi để tạo thai; tiếp tục nghiên cứu mô hình không di truyền, đánh giá ngoài mục tiêu và có giám sát đạo đức.',
    distractors: ['Tiến hành ngay nếu cha mẹ ký đồng thuận vì rủi ro chỉ thuộc gia đình.', 'Tiến hành nếu chỉnh sửa đúng ở phần lớn tế bào, bỏ qua một số tế bào khảm.', 'Cấm vĩnh viễn mọi nghiên cứu chỉnh sửa gene, kể cả trên tế bào nuôi cấy.'],
    insight: 'Thay đổi dòng mầm có hậu quả cho người chưa thể đồng thuận và có thể lan qua nhiều thế hệ.',
    evidence: 'Đề nêu hai bất định quan trọng: tác động ngoài mục tiêu và khả năng di truyền.',
    mechanism: 'Nguyên tắc thận trọng cân bằng giá trị nghiên cứu với mức độ không thể đảo ngược và phạm vi người chịu rủi ro.',
    reasoning: ['Đồng thuận của cha mẹ không giải quyết đầy đủ quyền lợi của thế hệ tương lai.', 'Nghiên cứu tiền lâm sàng an toàn hơn vẫn có thể tiếp tục.'],
    distractorReasons: ['thu hẹp sai phạm vi người bị ảnh hưởng.', 'coi thể khảm là không đáng kể dù có thể gây hậu quả.', 'đánh đồng tạm hoãn ứng dụng rủi ro với cấm mọi nghiên cứu.'],
    tags: ['đạo đức sinh học', 'đánh giá rủi ro']
  }),
  bioProblem(topicId, {
    content: 'Trong sáu lần lặp, năm giá trị tốc độ hô hấp nằm quanh 20–22, còn một giá trị là 61. Nhật kí cho biết đầu dò ở lần đó chưa được hiệu chuẩn. Xử lí nào khoa học nhất?',
    correct: 'Đánh dấu giá trị theo tiêu chí chất lượng đã định, báo cáo phân tích có và không có nó, đồng thời lặp lại phép đo nếu có thể.',
    distractors: ['Xóa 61 vì nó làm trung bình xấu đi và không cần ghi lại.', 'Giữ 61 như mọi giá trị khác vì không bao giờ được loại số liệu.', 'Thay 61 bằng trung bình của năm lần còn lại.'],
    insight: 'Quyết định về ngoại lệ phải dựa trên bằng chứng quy trình, không dựa trên việc kết quả có thuận ý hay không.',
    evidence: 'Nhật kí cung cấp nguyên nhân kỹ thuật độc lập với độ lớn bất thường: đầu dò chưa hiệu chuẩn.',
    mechanism: 'Phân tích độ nhạy cho thấy kết luận phụ thuộc ngoại lệ ra sao; đo lại giúp phân biệt sự kiện sinh học với lỗi thiết bị.',
    reasoning: ['Không được âm thầm xóa hoặc sửa dữ liệu gốc.', 'Giữ một phép đo biết rõ không đạt chất lượng như dữ liệu hợp lệ cũng làm sai ước lượng.'],
    distractorReasons: ['dùng tiêu chí hậu nghiệm và che giấu quyết định.', 'coi mọi số liệu có chất lượng bằng nhau dù có hồ sơ lỗi.', 'bịa ra một phép đo chưa từng quan sát.'],
    tags: ['ngoại lệ', 'minh bạch dữ liệu'],
    stimulus: biologyTable('bio10-adv-method-16', 'Độ lệch bất thường', 'Đơn vị tương đối.', 'Sáu phép đo độc lập', [{ key: 'run', label: 'Lần' }, { key: 'rate', label: 'Tốc độ' }], [{ run: 1, rate: 21 }, { run: 2, rate: 20 }, { run: 3, rate: 22 }, { run: 4, rate: 61 }, { run: 5, rate: 21 }, { run: 6, rate: 20 }])
  }),
  bioProblem(topicId, {
    content: 'Trong thử nghiệm một chế phẩm hỗ trợ ngủ, người phân phát viên biết lọ nào là chế phẩm và thường vô thức động viên nhóm đó nhiều hơn. Biện pháp nào xử lí trực tiếp nguy cơ này?',
    correct: 'Mã hóa lọ để cả người tham gia và người phân phát/đánh giá không biết nhóm cho đến khi khóa dữ liệu.',
    distractors: ['Chỉ không cho người tham gia biết, còn người phân phát vẫn biết.', 'Cho người phân phát chọn nhóm dựa trên mức mất ngủ.', 'Tăng thời gian thử nghiệm nhưng giữ cách phân phát.'],
    insight: 'Làm mù kép ngăn kỳ vọng của cả người tham gia lẫn người tương tác với họ làm thay đổi kết quả.',
    evidence: 'Nguồn sai lệch được mô tả đến từ hành vi của người phân phát, nên chỉ làm mù người tham gia chưa đủ.',
    mechanism: 'Mã ngẫu nhiên che phân nhóm trong quá trình can thiệp và đánh giá; chỉ giải mã sau khi tiêu chí phân tích đã cố định.',
    reasoning: ['Phân nhóm theo mức bệnh tạo khác biệt nền.', 'Kéo dài thời gian không làm mất ảnh hưởng kỳ vọng có hệ thống.'],
    distractorReasons: ['không che người gây ra sai lệch trong tình huống.', 'mất ngẫu nhiên hóa và tạo thiên lệch chọn nhóm.', 'tăng thời gian phơi nhiễm với cùng sai lệch.'],
    tags: ['làm mù', 'thiên lệch quan sát']
  }),
  bioProblem(topicId, {
    content: 'Đầu dò oxygen luôn đọc 1,2 mg/L khi đặt trong dung dịch không có oxygen và đọc 7,2 mg/L trong chuẩn 6,0 mg/L. Một mẫu cho số đọc 4,7 mg/L. Nếu sai lệch tuyến tính chỉ là độ lệch nền, giá trị hiệu chỉnh là bao nhiêu?',
    correct: '3,5 mg/L.',
    distractors: ['4,7 mg/L.', '5,9 mg/L.', '2,3 mg/L.'],
    insight: 'Cả chuẩn 0 và chuẩn 6 đều cao hơn thật 1,2 mg/L, cho thấy độ lệch cộng.',
    evidence: '0 được đọc thành 1,2 và 6,0 được đọc thành 7,2; độ chênh ở hai điểm giống nhau.',
    mechanism: 'Với sai lệch nền cộng cố định, trừ 1,2 khỏi mọi số đọc trong vùng hiệu chuẩn.',
    reasoning: ['4,7 − 1,2 = 3,5 mg/L.', 'Hai điểm chuẩn giúp phân biệt độ lệch cộng với sai hệ số khuếch đại.'],
    distractorReasons: ['không hiệu chỉnh dù đã phát hiện sai lệch.', 'cộng độ lệch thay vì trừ.', 'trừ hai lần độ lệch nền.'],
    tags: ['hiệu chuẩn', 'xử lí số liệu'],
    stimulus: biologyTable('bio10-adv-method-18', 'Hiệu chuẩn đầu dò oxygen', 'Các chuẩn và mẫu được đo cùng nhiệt độ.', 'Số đọc của đầu dò', [{ key: 'sample', label: 'Dung dịch' }, { key: 'true', label: 'Giá trị chuẩn', unit: 'mg/L' }, { key: 'read', label: 'Số đọc', unit: 'mg/L' }], [{ sample: 'Chuẩn 0', true: 0, read: 1.2 }, { sample: 'Chuẩn 6', true: 6, read: 7.2 }, { sample: 'Mẫu', true: '?', read: 4.7 }])
  })
];
