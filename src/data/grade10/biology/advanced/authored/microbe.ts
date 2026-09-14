import { bioProblem, biologyTable } from './helpers';

const topicId = 'bio10-adv-microbe';

export const microbeProblems = [
  bioProblem(topicId, {
    content: 'Trong nuôi cấy không liên tục, số tế bào sống ổn định nhưng tổng số tế bào đo bằng máy vẫn tăng nhẹ ở pha cân bằng. Giải thích nào phù hợp?',
    correct: 'Tốc độ sinh tế bào sống xấp xỉ tốc độ chết, còn máy có thể đếm cả tế bào chết hoặc mảnh gây đục.',
    distractors: ['Pha cân bằng nghĩa là mọi tế bào ngừng chuyển hóa và không tế bào nào phân chia.', 'Máy đếm chỉ nhận tế bào đang phân chia.', 'Số tế bào sống ổn định chứng minh chất dinh dưỡng vô hạn.'],
    insight: 'Các phương pháp đo khác nhau có thể theo dõi “tổng hạt” và “đơn vị sống” khác nhau.',
    evidence: 'Đếm sống không tăng nhưng độ đục/tổng hạt vẫn tăng nhẹ.',
    mechanism: 'Ở pha cân bằng, sinh và chết cùng xảy ra; tế bào chết chưa biến mất ngay khỏi tín hiệu quang học.',
    reasoning: ['Ổn định ròng không đồng nghĩa không có dòng vào–ra.', 'Pha cân bằng thường liên quan cạn dinh dưỡng và tích chất độc.'],
    distractorReasons: ['hiểu “cân bằng” là ngừng mọi hoạt động.', 'mô tả sai nguyên lí đo độ đục.', 'đảo nguyên nhân sinh thái của pha cân bằng.'],
    tags: ['đường cong sinh trưởng', 'phương pháp định lượng']
  }),
  bioProblem(topicId, {
    content: 'Một quần thể vi khuẩn tăng từ \(2,5\\times10^5\) lên \(8,0\\times10^6\) tế bào trong 150 phút ở pha log. Thời gian thế hệ gần nhất là bao nhiêu?',
    correct: '30 phút.',
    distractors: ['15 phút.', '25 phút.', '50 phút.'],
    insight: 'Tỉ số 32 tương ứng \(2^5\), tức năm thế hệ trong 150 phút.',
    evidence: '\(8,0\\times10^6 /(2,5\\times10^5)=32\).',
    mechanism: 'Ở pha log lý tưởng, N = N₀ × \(2^n\); thời gian thế hệ g = t/n.',
    reasoning: ['n = 5.', 'g = 150/5 = 30 phút.'],
    distractorReasons: ['chia cho mười thế hệ không có.', 'chia trực tiếp 150 cho 6.', 'coi số thế hệ là ba.'],
    tags: ['thời gian thế hệ', 'sinh trưởng lũy thừa']
  }),
  bioProblem(topicId, {
    content: 'Sau xử lí kháng sinh, OD của dịch vi khuẩn giảm ít nhưng số CFU giảm 99%. Diễn giải tốt nhất là gì?',
    correct: 'Nhiều tế bào đã mất khả năng tạo khuẩn lạc nhưng xác và tế bào tổn thương vẫn gây độ đục.',
    distractors: ['Kháng sinh chắc chắn không có tác dụng vì OD gần như giữ nguyên.', 'CFU đếm cả tế bào chết còn OD chỉ đếm sống.', 'Mọi tế bào sống đều tạo đúng một OD bằng nhau độc lập mật độ.'],
    insight: 'OD đo tán xạ bởi vật chất; CFU đo khả năng sinh sản thành khuẩn lạc.',
    evidence: 'Hai chỉ số tách nhau mạnh sau xử lí gây chết/tổn thương.',
    mechanism: 'Mất khả năng sinh sản xảy ra trước khi cấu trúc tế bào bị phân giải đủ để độ đục giảm.',
    reasoning: ['CFU có thể thấp hơn số tế bào sống nếu tế bào kết cụm.', 'OD hữu ích nhưng không thay thế phép đếm sống trong tình huống này.'],
    distractorReasons: ['chỉ dùng một phép đo không phù hợp mục tiêu sống.', 'đảo nguyên lí hai phương pháp.', 'mô tả OD như đơn vị cho từng tế bào.'],
    tags: ['OD–CFU', 'kháng sinh']
  }),
  bioProblem(topicId, {
    content: 'Bốn chủng chỉ sinh trưởng trong các điều kiện nguồn carbon/năng lượng cho ở bảng. Chủng nào là quang dị dưỡng?',
    correct: 'Chủng C.',
    distractors: ['Chủng A.', 'Chủng B.', 'Chủng D.'],
    insight: 'Quang dị dưỡng dùng ánh sáng cho năng lượng nhưng cần chất hữu cơ làm nguồn carbon.',
    evidence: 'C chỉ mọc khi có ánh sáng và acetate, không mọc với CO₂ là nguồn carbon duy nhất.',
    mechanism: 'Hai trục “quang/hóa” và “tự/dị dưỡng” phải được xác định riêng.',
    reasoning: ['A phù hợp quang tự dưỡng.', 'B phù hợp hóa tự dưỡng; D phù hợp hóa dị dưỡng.'],
    distractorReasons: ['dùng ánh sáng nhưng lấy CO₂ làm carbon.', 'không dùng ánh sáng và dùng chất vô cơ cho năng lượng.', 'không dùng ánh sáng và cần hữu cơ.'],
    tags: ['kiểu dinh dưỡng', 'đọc bảng'],
    stimulus: biologyTable('bio10-adv-microbe-04', 'Điều kiện sinh trưởng', 'Dấu + là sinh trưởng.', 'Nguồn năng lượng và carbon', [{ key: 'strain', label: 'Chủng' }, { key: 'lightCo2', label: 'Ánh sáng + CO₂' }, { key: 'lightAce', label: 'Ánh sáng + acetate' }, { key: 'darkInorg', label: 'Tối + chất vô cơ + CO₂' }, { key: 'darkGlucose', label: 'Tối + glucose' }], [{ strain: 'A', lightCo2: '+', lightAce: '+', darkInorg: '−', darkGlucose: '−' }, { strain: 'B', lightCo2: '−', lightAce: '−', darkInorg: '+', darkGlucose: '−' }, { strain: 'C', lightCo2: '−', lightAce: '+', darkInorg: '−', darkGlucose: '−' }, { strain: 'D', lightCo2: '−', lightAce: '−', darkInorg: '−', darkGlucose: '+' }])
  }),
  bioProblem(topicId, {
    content: 'Trong nuôi cấy liên tục, tốc độ đưa môi trường mới tăng vượt tốc độ sinh trưởng cực đại của vi khuẩn. Điều gì dễ xảy ra?',
    correct: 'Vi khuẩn bị rửa trôi vì tế bào bị lấy ra nhanh hơn khả năng sinh sản bù.',
    distractors: ['Mật độ tăng vô hạn vì dinh dưỡng vào nhiều.', 'Quần thể chuyển ngay thành virus.', 'Mọi tế bào đồng thời tạo nội bào tử dù loài không có khả năng đó.'],
    insight: 'Cân bằng chemostat đòi hỏi tốc độ tăng của quần thể ít nhất bù tốc độ pha loãng.',
    evidence: 'Dòng ra mang tế bào đi với tốc độ cao hơn tốc độ sinh trưởng cực đại.',
    mechanism: 'Khi hệ số pha loãng D > µmax, tốc độ thay đổi ròng của sinh khối âm.',
    reasoning: ['Dinh dưỡng không thể giúp tốc độ vượt giới hạn sinh lí tức thời.', 'Rửa trôi là hệ quả vật lí–sinh trưởng, không phải chuyển loại sinh vật.'],
    distractorReasons: ['bỏ dòng ra và giới hạn tốc độ.', 'mô tả chuyển đổi sinh học không thể.', 'gán đặc điểm không có cho mọi loài.'],
    tags: ['nuôi cấy liên tục', 'rửa trôi']
  }),
  bioProblem(topicId, {
    content: 'Kháng sinh A ức chế tổng hợp thành tế bào. Vì sao A thường tác động mạnh lên vi khuẩn đang sinh trưởng hơn vi khuẩn ngủ?',
    correct: 'Tế bào đang lớn và phân chia phải tổng hợp, tái cấu trúc peptidoglycan nên phụ thuộc mạnh vào đích của A.',
    distractors: ['Vi khuẩn ngủ không có DNA.', 'A chỉ vào tế bào khi có nguyên phân.', 'Vi khuẩn đang sinh trưởng mất hoàn toàn màng sinh chất.'],
    insight: 'Hiệu lực phụ thuộc mức hoạt động của con đường làm đích thuốc.',
    evidence: 'Đích là tổng hợp thành; nhu cầu tổng hợp thành tăng khi tế bào nở và tạo vách ngăn.',
    mechanism: 'Chặn liên kết peptidoglycan làm thành yếu dưới áp lực thẩm thấu, đặc biệt tại vùng đang xây mới.',
    reasoning: ['Vi khuẩn phân đôi chứ không nguyên phân.', 'Tế bào ngủ vẫn có DNA và màng.'],
    distractorReasons: ['phủ nhận vật liệu di truyền của trạng thái ngủ.', 'gán cơ chế phân bào nhân thực cho vi khuẩn.', 'mô tả mất màng không liên quan.'],
    tags: ['kháng sinh', 'thành tế bào']
  }),
  bioProblem(topicId, {
    content: 'Quần thể ban đầu có một tỉ lệ rất nhỏ vi khuẩn mang allele kháng. Sau nhiều đợt kháng sinh, allele kháng phổ biến. Cách giải thích đúng là gì?',
    correct: 'Kháng sinh chọn lọc biến dị kháng đã có hoặc phát sinh ngẫu nhiên; vi khuẩn kháng sống và sinh sản tương đối nhiều hơn.',
    distractors: ['Kháng sinh hướng dẫn mọi vi khuẩn tạo đúng đột biến cần thiết.', 'Vi khuẩn nhạy tự biến thành virus để tránh thuốc.', 'Allele kháng tăng vì kháng sinh làm vi khuẩn ngừng di truyền.'],
    insight: 'Tác nhân chọn lọc thay đổi tần số biến dị, không tạo đột biến thích nghi theo nhu cầu.',
    evidence: 'Đề đã nêu allele kháng tồn tại ở tỉ lệ nhỏ trước điều trị.',
    mechanism: 'Chênh lệch sống sót và sinh sản qua nhiều thế hệ làm allele kháng tăng trong quần thể.',
    reasoning: ['Đột biến có thể phát sinh ngẫu nhiên trước hoặc trong quá trình, không do thuốc “chỉ đạo”.', 'Sử dụng sai kháng sinh tăng áp lực chọn lọc.'],
    distractorReasons: ['dùng quan niệm thích nghi có định hướng.', 'mô tả chuyển loại sinh vật không có.', 'đảo vai trò của di truyền trong tăng tần số.'],
    tags: ['kháng kháng sinh', 'chọn lọc']
  }),
  bioProblem(topicId, {
    content: 'Chủng X có vòng vô khuẩn lớn với thuốc P nhưng nhỏ với Q; chủng Y có kết quả ngược lại. Kết luận an toàn nhất là gì?',
    correct: 'Trong điều kiện chuẩn hóa, X nhạy tương đối với P hơn Q và Y nhạy tương đối với Q hơn P; không so trực tiếp độ mạnh hai thuốc nếu khả năng khuếch tán khác.',
    distractors: ['P luôn mạnh hơn Q với mọi vi khuẩn vì vòng ở X lớn.', 'Y chắc chắn kháng hoàn toàn P dù vẫn có vòng nhỏ.', 'Kích thước vòng chỉ do màu thuốc.'],
    insight: 'Vòng vô khuẩn phản ánh cả nhạy cảm và khuếch tán, nên so sánh cần giới hạn.',
    evidence: 'Mẫu đảo chiều giữa hai chủng cho thấy tương tác thuốc–chủng, không có thuốc thắng tuyệt đối.',
    mechanism: 'Thuốc khuếch tán tạo gradient; vi khuẩn không mọc nơi nồng độ vượt ngưỡng ức chế.',
    reasoning: ['“Nhạy tương đối” phù hợp dữ liệu hơn “mạnh tuyệt đối”.', 'Vòng nhỏ khác 0 không tự chứng minh kháng hoàn toàn.'],
    distractorReasons: ['ngoại suy từ một chủng.', 'dùng từ tuyệt đối trái quan sát.', 'bỏ cơ sở sinh học của khuếch tán và ức chế.'],
    tags: ['kháng sinh đồ', 'giới hạn kết luận'],
    stimulus: biologyTable('bio10-adv-microbe-08', 'Vòng vô khuẩn', 'Đĩa giấy và lượng thuốc được chuẩn hóa.', 'Đường kính vòng', [{ key: 'strain', label: 'Chủng' }, { key: 'p', label: 'Thuốc P', unit: 'mm' }, { key: 'q', label: 'Thuốc Q', unit: 'mm' }], [{ strain: 'X', p: 28, q: 11 }, { strain: 'Y', p: 9, q: 25 }])
  }),
  bioProblem(topicId, {
    content: 'Phương pháp nào phù hợp nhất để tiệt trùng môi trường nuôi cấy chịu nhiệt chứa bào tử vi khuẩn?',
    correct: 'Hấp ướt dưới áp suất ở nhiệt độ và thời gian thích hợp, kèm chỉ thị kiểm tra chu trình.',
    distractors: ['Để ở nhiệt độ phòng qua đêm.', 'Rửa bằng nước cất rồi đóng nắp.', 'Chiếu ánh sáng nhìn thấy vài phút.'],
    insight: 'Tiệt trùng phải loại cả dạng sinh dưỡng và bào tử, đồng thời cần xác nhận quy trình.',
    evidence: 'Môi trường chịu nhiệt cho phép dùng hơi nước áp suất; bào tử đòi hỏi điều kiện mạnh hơn đun thường.',
    mechanism: 'Hơi nước nóng truyền nhiệt hiệu quả, làm biến tính protein và phá cấu trúc; áp suất cho phép đạt nhiệt độ cao.',
    reasoning: ['Chỉ thị hóa học/sinh học giúp phát hiện chu trình không đạt.', 'Nước cất không phải chất tiệt trùng.'],
    distractorReasons: ['không có tác nhân diệt vi sinh vật.', 'chỉ làm sạch cơ học rất hạn chế.', 'ánh sáng nhìn thấy không tiệt trùng đáng tin cậy.'],
    tags: ['tiệt trùng', 'bào tử']
  }),
  bioProblem(topicId, {
    content: 'Trong sản xuất sữa chua, pH giảm từ 6,6 xuống 4,5 rồi gần như ổn định. Nguyên nhân chính và ý nghĩa bảo quản là gì?',
    correct: 'Vi khuẩn lactic chuyển đường thành acid lactic; pH thấp tạo vị, đông protein sữa và ức chế nhiều vi sinh vật hư hỏng.',
    distractors: ['Vi khuẩn tạo NaOH làm pH giảm.', 'pH giảm vì mọi đường biến thành oxygen.', 'Acid lactic tiệt trùng tuyệt đối sản phẩm nên không cần bảo quản lạnh.'],
    insight: 'Sản phẩm chuyển hóa vừa tạo đặc tính thực phẩm vừa thay đổi hệ sinh thái vi sinh.',
    evidence: 'pH giảm trong quá trình lên men và dừng khi cơ chất/điều kiện trở nên hạn chế.',
    mechanism: 'Lên men lactic tái sinh NAD⁺ và tích acid, làm casein kết tụ gần vùng pH thích hợp.',
    reasoning: ['Ức chế không đồng nghĩa tiệt trùng.', 'Chuỗi lạnh vẫn giúp hạn chế sinh vật chịu acid và phản ứng tiếp tục.'],
    distractorReasons: ['base không làm pH giảm.', 'bịa chuyển đường thành oxygen.', 'biến hiệu ứng ức chế thành an toàn tuyệt đối.'],
    tags: ['lên men lactic', 'bảo quản thực phẩm']
  }),
  bioProblem(topicId, {
    content: 'Để đánh giá một chủng probiotic có sống sót qua dạ dày mô phỏng hay không, chỉ tiêu nào trực tiếp nhất?',
    correct: 'So sánh CFU trước và sau khi ủ trong acid có pepsin, kèm đối chứng pH trung tính và lặp độc lập.',
    distractors: ['Chỉ đo màu dịch nuôi sau acid.', 'Đếm tổng DNA vì DNA luôn chỉ có ở tế bào sống.', 'Ngửi mùi để suy số vi khuẩn sống.'],
    insight: 'Mục tiêu là khả năng sống và sinh sản sau thử thách, nên cần phép đếm sống cùng đối chứng.',
    evidence: 'CFU yêu cầu tế bào còn khả năng tạo khuẩn lạc; tổng DNA có thể tồn tại sau khi tế bào chết.',
    mechanism: 'Tỉ lệ sống = CFU sau/CFU trước dưới điều kiện acid so với nền trung tính.',
    reasoning: ['Pepsin làm mô hình gần dạ dày hơn nhưng vẫn không phải toàn bộ cơ thể.', 'Lặp độc lập đánh giá biến thiên sinh học.'],
    distractorReasons: ['màu không trực tiếp đo khả năng sống.', 'nhầm DNA tồn tại với tế bào sống.', 'dùng cảm quan không định lượng.'],
    tags: ['probiotic', 'đánh giá sống sót']
  }),
  bioProblem(topicId, {
    content: 'Vi khuẩn trong biofilm chịu kháng sinh tốt hơn cùng chủng sống tự do, nhưng sau tách khỏi biofilm nhiều tế bào lại nhạy. Giải thích phù hợp nhất?',
    correct: 'Ma trận biofilm, gradient dinh dưỡng và trạng thái chuyển hóa chậm tạo khả năng dung nạp không nhất thiết do đột biến kháng bền vững.',
    distractors: ['Mọi tế bào biofilm lập tức đổi thành loài mới.', 'Ma trận biofilm làm kháng sinh mạnh hơn nên tế bào sống.', 'Tách biofilm xóa mọi gene kháng khỏi DNA.'],
    insight: 'Kháng di truyền và dung nạp sinh lí là hai hiện tượng khác nhau.',
    evidence: 'Tính nhạy trở lại sau khi tách gợi trạng thái môi trường có thể đảo ngược.',
    mechanism: 'Ma trận làm chậm thấm; tế bào sâu thiếu chất, tăng chậm nên ít nhạy với thuốc đánh vào quá trình hoạt động.',
    reasoning: ['Vẫn có thể đồng thời tồn tại đột biến kháng, nhưng dữ kiện nhấn mạnh phần hồi phục.', 'Gene không tự bị xóa chỉ do tách biofilm.'],
    distractorReasons: ['mô tả hình thành loài tức thời.', 'đảo vai trò bảo vệ của ma trận.', 'gán thay đổi genome không có.'],
    tags: ['biofilm', 'dung nạp kháng sinh']
  }),
  bioProblem(topicId, {
    content: 'Vi khuẩn mọc ở mặt trên ống thạch sâu nơi có nhiều oxygen, còn hầu như không mọc phía dưới. Kiểu quan hệ với oxygen phù hợp nhất?',
    correct: 'Hiếu khí bắt buộc.',
    distractors: ['Kị khí bắt buộc.', 'Kị khí tùy nghi phân bố đều hơn hoặc ưu thế trên nhưng vẫn mọc dưới.', 'Vi hiếu khí tạo dải dưới mặt thoáng chứ không ngay bề mặt.'],
    insight: 'Vị trí sinh trưởng trong gradient oxygen phản ánh nhu cầu và độc tính oxygen.',
    evidence: 'Sinh trưởng tập trung nơi oxygen cao nhất và gần như vắng ở vùng thiếu oxygen.',
    mechanism: 'Sinh vật hiếu khí bắt buộc cần oxygen làm chất nhận electron cuối và không duy trì chuyển hóa khi thiếu.',
    reasoning: ['Kị khí bắt buộc sẽ tránh vùng trên.', 'Vi hiếu khí ưu nồng độ thấp hơn không khí.'],
    distractorReasons: ['dự đoán phân bố ngược.', 'vẫn phải có sinh trưởng ở vùng sâu.', 'dự đoán một dải không trùng bề mặt.'],
    tags: ['nhu cầu oxygen', 'nuôi cấy']
  }),
  bioProblem(topicId, {
    content: 'Ba chủng có nhiệt độ sinh trưởng tối ưu lần lượt 15, 37 và 65 °C. Khi bảo quản thực phẩm ở 4 °C, kết luận nào đúng nhất?',
    correct: 'Sinh trưởng của nhiều chủng chậm lại nhưng không bảo đảm dừng hoàn toàn, đặc biệt với vi sinh vật ưa lạnh hoặc chịu lạnh.',
    distractors: ['4 °C tiệt trùng mọi thực phẩm.', 'Chủng tối ưu 37 °C chết ngay khi xuống 4 °C.', 'Nhiệt độ tối ưu là nhiệt độ duy nhất một chủng có thể sống.'],
    insight: 'Tối ưu không phải giới hạn sống tuyệt đối; làm lạnh chủ yếu kìm hãm tốc độ.',
    evidence: 'Các chủng có vùng sinh trưởng quanh tối ưu và chủng tối ưu thấp có thể vẫn hoạt động ở 4 °C.',
    mechanism: 'Nhiệt thấp làm phản ứng enzyme và vận chuyển chậm nhưng không giống khử trùng nhiệt.',
    reasoning: ['An toàn thực phẩm vẫn cần thời hạn và vệ sinh.', 'Khả năng hồi phục sau lạnh khác với chết.'],
    distractorReasons: ['nhầm bảo quản lạnh với tiệt trùng.', 'dùng từ “chết ngay” không có.', 'hiểu sai khái niệm tối ưu.'],
    tags: ['nhiệt độ sinh trưởng', 'bảo quản']
  }),
  bioProblem(topicId, {
    content: 'Muối và đường nồng độ cao giúp bảo quản thực phẩm chủ yếu theo cơ chế nào?',
    correct: 'Làm giảm hoạt độ nước và tạo môi trường ưu trương, khiến nhiều vi sinh vật khó duy trì nước và chuyển hóa.',
    distractors: ['Cung cấp nước tự do cho vi khuẩn phát triển rồi tự chết.', 'Phá hủy DNA của mọi vi sinh vật theo cùng một cách.', 'Tăng pH lên vô hạn.'],
    insight: 'Nồng độ chất tan cao tác động lên khả năng tiếp cận nước và cân bằng thẩm thấu.',
    evidence: 'Cả muối và đường khác hóa học nhưng cùng có thể tạo nồng độ chất tan lớn.',
    mechanism: 'Nước rời tế bào và ít nước tự do cho phản ứng; chỉ sinh vật chịu mặn/chịu đường thích nghi tốt.',
    reasoning: ['Bảo quản không đồng nghĩa tiêu diệt mọi bào tử.', 'pH không phải tác động chung bắt buộc của cả hai.'],
    distractorReasons: ['đảo tác động lên hoạt độ nước.', 'gán cơ chế phá DNA tuyệt đối.', 'gán biến pH không liên quan chung.'],
    tags: ['hoạt độ nước', 'bảo quản thực phẩm']
  }),
  bioProblem(topicId, {
    content: 'Trong bể xử lí, NH₄⁺ giảm, NO₂⁻ tăng rồi giảm, NO₃⁻ tăng; điều kiện giàu oxygen. Chuỗi quá trình phù hợp nhất là gì?',
    correct: 'Vi sinh vật hóa tự dưỡng oxy hóa NH₄⁺ thành NO₂⁻ rồi nhóm khác oxy hóa NO₂⁻ thành NO₃⁻.',
    distractors: ['Vi khuẩn lên men biến nitrate trực tiếp thành glucose.', 'Virus oxy hóa NH₄⁺ để tự tạo ribosome.', 'Quang hợp biến nitrogen thành oxygen.'],
    insight: 'Sự xuất hiện rồi mất của chất trung gian NO₂⁻ chỉ ra con đường hai bước.',
    evidence: 'NH₄⁺ giảm trước/đồng thời NO₂⁻ tăng; sau đó NO₂⁻ giảm khi NO₃⁻ tăng.',
    mechanism: 'Hai nhóm nitrifier lấy năng lượng từ phản ứng oxy hóa chất vô cơ và dùng oxygen làm chất nhận electron.',
    reasoning: ['Điều kiện giàu oxygen phù hợp nitrat hóa.', 'Virus không có chuyển hóa và ribosome riêng.'],
    distractorReasons: ['mô tả con đường và sản phẩm không phù hợp.', 'gán chuyển hóa tự chủ cho virus.', 'trộn chu trình nitrogen với quang hợp.'],
    tags: ['chu trình nitrogen', 'hóa tự dưỡng'],
    stimulus: biologyTable('bio10-adv-microbe-16', 'Biến đổi nitrogen', 'Nồng độ tương đối theo thời gian.', 'Các dạng nitrogen', [{ key: 'day', label: 'Ngày' }, { key: 'nh4', label: 'NH₄⁺' }, { key: 'no2', label: 'NO₂⁻' }, { key: 'no3', label: 'NO₃⁻' }], [{ day: 0, nh4: 100, no2: 0, no3: 0 }, { day: 2, nh4: 62, no2: 30, no3: 8 }, { day: 5, nh4: 18, no2: 24, no3: 58 }, { day: 9, nh4: 2, no2: 3, no3: 95 }])
  }),
  bioProblem(topicId, {
    content: 'Bể bùn hoạt tính bị mất sục khí trong nhiều giờ. Thay đổi nào dự kiến xảy ra đầu tiên?',
    correct: 'Oxygen hòa tan giảm, hô hấp hiếu khí và phân hủy chất hữu cơ chậm; vi sinh vật kị khí/tùy nghi có lợi thế tương đối.',
    distractors: ['Mọi vi sinh vật chết tức thì và nước vô trùng.', 'Nồng độ oxygen tăng vì máy sục khí dừng.', 'Vi khuẩn hiếu khí chuyển ngay thành thực vật.'],
    insight: 'Sục khí cung cấp chất nhận electron và khuấy trộn cho cộng đồng phân hủy hiếu khí.',
    evidence: 'Mất sục khí loại nguồn bổ sung oxygen trong hệ có nhu cầu hô hấp cao.',
    mechanism: 'Vi sinh vật tiêu thụ oxygen còn lại; khi thiếu, tốc độ con đường hiếu khí giảm và thành phần cộng đồng dịch chuyển.',
    reasoning: ['Không phải mọi sinh vật có cùng nhu cầu oxygen.', 'Thay đổi cộng đồng cần thời gian, nhưng oxygen giảm là tức thời.'],
    distractorReasons: ['dùng kết quả tiệt trùng không thực tế.', 'đảo quan hệ nguồn cung oxygen.', 'mô tả chuyển giới sinh vật không thể.'],
    tags: ['xử lí nước thải', 'hô hấp vi sinh']
  }),
  bioProblem(topicId, {
    content: 'Một mẻ lên men có pH và nhiệt độ bình thường nhưng năng suất sản phẩm giảm, đồng thời xuất hiện một kiểu khuẩn lạc lạ sau cấy kiểm tra. Hành động nào hợp lí nhất?',
    correct: 'Cách ly mẻ, định danh sinh vật lạ, kiểm tra điểm nhiễm và vệ sinh–tiệt trùng trước khi chạy lại.',
    distractors: ['Trộn mẻ với mẻ tốt để pha loãng nhiễm.', 'Tăng đường ngay mà không xác định sinh vật lạ.', 'Bỏ qua vì pH trung bình vẫn đúng.'],
    insight: 'Chỉ số quá trình bình thường không loại nhiễm; khuẩn lạc lạ là bằng chứng độc lập cần truy nguyên.',
    evidence: 'Năng suất giảm đi cùng sự xuất hiện kiểu khuẩn lạc mới.',
    mechanism: 'Sinh vật nhiễm có thể cạnh tranh cơ chất, tạo sản phẩm phụ hoặc phá sản phẩm mà chưa làm pH tổng thay đổi rõ.',
    reasoning: ['Cách ly ngăn lan nhiễm sang dây chuyền khác.', 'Định danh và truy nguồn giúp sửa nguyên nhân thay vì che triệu chứng.'],
    distractorReasons: ['làm nhiễm cả mẻ tốt và không đảm bảo an toàn.', 'có thể nuôi sinh vật nhiễm mạnh hơn.', 'chỉ dựa một chỉ số và bỏ bằng chứng vi sinh.'],
    tags: ['công nghệ vi sinh', 'kiểm soát nhiễm'],
    stimulus: biologyTable('bio10-adv-microbe-18', 'Theo dõi mẻ lên men', 'Mẻ 4 có dấu hiệu bất thường.', 'Chỉ số cuối mẻ', [{ key: 'batch', label: 'Mẻ' }, { key: 'ph', label: 'pH' }, { key: 'temp', label: 'Nhiệt độ', unit: '°C' }, { key: 'yield', label: 'Năng suất', unit: '%' }, { key: 'colony', label: 'Kiểu khuẩn lạc' }], [{ batch: 1, ph: 4.6, temp: 30, yield: 96, colony: 'Chuẩn' }, { batch: 2, ph: 4.5, temp: 30, yield: 94, colony: 'Chuẩn' }, { batch: 4, ph: 4.6, temp: 30, yield: 51, colony: 'Chuẩn + lạ' }])
  })
];
