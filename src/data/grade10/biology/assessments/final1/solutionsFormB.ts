import type { Solution } from '@/types';

const solved = (questionId: string, recognition: string, explanation: string, finalAnswer: string, commonMistakes: string[], reviewSuggestions: string[]): Solution => ({
  id: `solution-${questionId}`, questionId, recognition,
  detailedSteps: [
    { order: 1, title: 'Dấu hiệu nhận dạng', explanation: recognition },
    { order: 2, title: 'Lập luận và kết luận', explanation, result: finalAnswer }
  ],
  finalAnswer, commonMistakes, reviewSuggestions
});

export const biologyFinal1SolutionsFormB: Solution[] = [
  solved('bio10-assess-final1-b-q01', 'Biến độc lập là yếu tố người nghiên cứu chủ động đặt các mức khác nhau.', 'Nhiệt độ được thay đổi có chủ đích; thời gian lan màu là đại lượng đo, còn kích thước agar phải giữ ổn định.', 'A', ['Nhầm đại lượng đo với biến độc lập.'], ['Thiết kế thí nghiệm']),
  solved('bio10-assess-final1-b-q02', 'Cần phân biệt đầu phân cực với đuôi hydrocarbon của phospholipid.', 'Hai đuôi acid béo không phân cực là phần kị nước; đầu chứa phosphate là phần ưa nước.', 'B', ['Đảo đầu ưa nước và đuôi kị nước.'], ['Phospholipid']),
  solved('bio10-assess-final1-b-q03', 'Đề nối cấu trúc không gian protein thụ thể với khả năng nhận tín hiệu.', 'Vùng gắn có hình dạng và tính chất hóa học đặc hiệu; thay đổi cấu trúc có thể làm ligand không gắn được và mất đáp ứng.', 'A', ['Cho đột biến một protein làm mọi lipid biến mất.'], ['Protein', 'Thụ thể màng']),
  solved('bio10-assess-final1-b-q04', 'Từ khóa “tế bào có trước” được kiểm chứng trực tiếp bằng quan sát phân chia.', 'Một tế bào mẹ phân chia tạo tế bào con là bằng chứng phù hợp với nguyên lí nguồn gốc tế bào.', 'A', ['Chọn dữ kiện không nói về nguồn gốc tế bào.'], ['Học thuyết tế bào']),
  solved('bio10-assess-final1-b-q05', 'Nhân sơ không có hệ bào quan có màng nhưng vẫn có bộ máy tổng hợp protein.', 'Vi khuẩn có ribosome; không có nhân được bao màng, lưới nội chất hay Golgi.', 'B', ['Cho nhân sơ không có cấu trúc bên trong.', 'Coi ribosome là bào quan có màng.'], ['Tế bào nhân sơ']),
  solved('bio10-assess-final1-b-q06', 'Tính thấm chọn lọc phải giải thích bằng cấu trúc phân tử của màng.', 'Lõi kị nước của lớp phospholipid và protein kênh/tải đặc hiệu quyết định chất nào đi qua và bằng cơ chế nào.', 'A', ['Cho thành tế bào quyết định toàn bộ tính thấm màng.'], ['Màng sinh chất']),
  solved('bio10-assess-final1-b-q07', 'Nucleolus là vùng đậm trong nhân liên quan quá trình hình thành ribosome.', 'Nucleolus tổng hợp rRNA và lắp ráp ban đầu các tiểu đơn vị ribosome trước khi chúng ra tế bào chất.', 'B', ['Nhầm nucleolus với ti thể.'], ['Nhân tế bào']),
  solved('bio10-assess-final1-b-q08', 'Dấu hiệu “nhận túi từ lưới nội chất, biến đổi và phân loại” đặc trưng cho Golgi.', 'Bộ máy Golgi xử lí, phân loại và đóng gói nhiều protein/lipid vào các túi hướng tới đích.', 'A', ['Nhầm Golgi với ribosome.'], ['Hệ thống nội màng']),
  solved('bio10-assess-final1-b-q09', 'Tế bào cơ cần nhiều năng lượng cho co cơ nên bào quan hô hấp phải phát triển.', 'Ti thể tạo phần lớn ATP qua hô hấp tế bào, đáp ứng nhu cầu năng lượng cao của tế bào cơ.', 'A', ['Gán chức năng tổng hợp protein tiết cho ti thể.'], ['Tế bào chuyên hóa']),
  solved('bio10-assess-final1-b-q10', 'Cần chọn cấu trúc chung của hai loại tế bào nhân thực.', 'Cả tế bào thực vật và động vật đều có ti thể; thành cellulose, lục lạp và không bào trung tâm lớn đặc trưng cho thực vật.', 'C', ['Cho ti thể chỉ có ở động vật.'], ['So sánh tế bào']),
  solved('bio10-assess-final1-b-q11', 'Khi dùng vật kính lớn, khoảng cách làm việc nhỏ nên tránh chỉnh thô.', 'Ốc chỉnh tinh thay đổi vị trí rất nhỏ, giúp làm rõ ảnh và giảm nguy cơ vật kính va vào tiêu bản.', 'A', ['Dùng ốc chỉnh thô với vật kính lớn.'], ['Kính hiển vi']),
  solved('bio10-assess-final1-b-q12', 'Môi trường nhược trương có nồng độ chất tan thấp hơn bên trong nên nước đi vào tế bào.', 'Tế bào động vật không có thành cứng; nhận quá nhiều nước làm trương và có thể vỡ.', 'B', ['Cho tế bào động vật có thành.', 'Nhầm chiều nước.'], ['Thẩm thấu']),
  solved('bio10-assess-final1-b-q13', 'Muốn tìm quá trình phụ thuộc ATP, cần chọn chất đi ngược gradient qua bơm.', 'Bơm ion cần năng lượng để duy trì gradient; khuếch tán đơn giản, hỗ trợ và thẩm thấu là thụ động.', 'B', ['Cho mọi protein vận chuyển dùng ATP.'], ['Vận chuyển chủ động']),
  solved('bio10-assess-final1-b-q14', 'Túi nội bào hòa màng và thải chất ra ngoài là dấu hiệu xuất bào.', 'Màng túi hợp nhất với màng sinh chất, giải phóng enzyme ra môi trường ngoài.', 'C', ['Đảo nhập bào và xuất bào.'], ['Nhập bào và xuất bào']),
  solved('bio10-assess-final1-b-q15', 'Đáp ứng đặc hiệu bắt đầu từ sự phù hợp ligand–thụ thể.', 'Không có thụ thể tương thích thì tế bào không tiếp nhận tín hiệu X và không khởi phát chuỗi đáp ứng đặc hiệu, dù X hiện diện.', 'A', ['Cho mọi tế bào phản ứng giống nhau với một hormone.'], ['Truyền tin tế bào']),
  solved('bio10-assess-final1-b-q16', 'Rau héo được ngâm nước sạch là tình huống môi trường ngoài nhược trương so với tế bào.', 'Nước đi vào không bào và tế bào, sức trương tăng nên mô rau cứng trở lại nếu tế bào chưa tổn thương nặng.', 'A', ['Nói chất tan đi bằng thẩm thấu.', 'Cho nước cần bơm ATP để đi vào.'], ['Vận dụng thẩm thấu']),
  solved('bio10-assess-final1-b-q17', 'Đánh giá lần lượt cấu trúc chung, cấu trúc đặc trưng và sự chuyên hóa/phối hợp.', 'a Đúng: mọi tế bào có màng sinh chất. b Sai: thực vật và động vật đều có ti thể. c Đúng: hệ tiết protein phát triển. d Sai: bào quan phối hợp thành hệ thống.', 'a:Đ|b:S|c:Đ|d:S', ['Cho ti thể chỉ có ở động vật.', 'Cho bào quan độc lập.'], ['So sánh tế bào', 'Hệ thống nội màng']),
  solved('bio10-assess-final1-b-q18', 'Đọc chiều biến đổi khối lượng và đánh giá thiết kế, không suy diễn quá độ phân giải dữ liệu.', 'a Đúng: khối lượng giảm dần khi NaCl tăng. b Đúng: ở 0% mẫu nhận nước. c Sai: điểm 0% thay đổi nằm giữa 0,5% và 1,0%. d Sai: cần mẫu lặp để ước lượng sai số.', 'a:Đ|b:Đ|c:S|d:S', ['Gọi 0,5% là đẳng trương chính xác.', 'Cho một mẫu loại bỏ sai số.'], ['Đọc dữ liệu thẩm thấu']),
  solved('bio10-assess-final1-b-q19', 'Độ phóng đại tổng cộng bằng thị kính nhân vật kính.', '$10\\times20=200$ lần.', '200', ['Cộng hai độ phóng đại.'], ['Kính hiển vi']),
  solved('bio10-assess-final1-b-q20', 'Đề hỏi độ lớn phần trăm giảm, lấy phần khối lượng mất chia khối lượng ban đầu.', '$\\frac{4{,}00-3{,}60}{4{,}00}\\times100\%=10\%$.', '10', ['Chia cho khối lượng cuối.', 'Ghi −10 dù đề hỏi độ lớn phần trăm giảm.'], ['Xử lí dữ liệu thực nghiệm'])
];
