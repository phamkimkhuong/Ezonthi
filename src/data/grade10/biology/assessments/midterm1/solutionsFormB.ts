import type { Solution } from '@/types';

const solved = (
  questionId: string,
  recognition: string,
  explanation: string,
  finalAnswer: string,
  commonMistakes: string[],
  reviewSuggestions: string[]
): Solution => ({
  id: `solution-${questionId}`,
  questionId,
  recognition,
  detailedSteps: [
    { order: 1, title: 'Nhận diện yêu cầu', explanation: recognition },
    { order: 2, title: 'Đối chiếu dữ kiện và kết luận', explanation, result: finalAnswer }
  ],
  finalAnswer,
  commonMistakes,
  reviewSuggestions
});

export const biologyMidterm1SolutionsFormB: Solution[] = [
  solved('bio10-assess-mid1-b-q01', 'Đề yêu cầu nhận diện hoạt động nghiên cứu trực tiếp một hiện tượng của thế giới sống.', 'Cơ chế vi khuẩn kháng kháng sinh là vấn đề sinh học; các phương án còn lại thuộc vật lí, địa chất hoặc kĩ thuật điện.', 'A', ['Chọn hoạt động chỉ vì có từ “khoa học”.'], ['Đối tượng nghiên cứu của sinh học']),
  solved('bio10-assess-mid1-b-q02', 'Dữ liệu DNA là dữ liệu nhạy cảm nên phải đánh giá đồng thuận, bảo mật và mục đích sử dụng.', 'Đồng thuận rõ ràng, mã hóa dữ liệu và giới hạn truy cập bảo vệ người tham gia mà vẫn cho phép nghiên cứu.', 'B', ['Cho rằng lợi ích y học cho phép bỏ qua quyền riêng tư.', 'Công khai dữ liệu định danh.'], ['Đạo đức sinh học']),
  solved('bio10-assess-mid1-b-q03', 'Câu hỏi dùng từ “ảnh hưởng” nên cần chủ động thay đổi ánh sáng và so sánh nhóm.', 'Thực nghiệm có nhóm, lặp lại và kiểm soát điều kiện tạo bằng chứng phù hợp hơn khảo sát ý kiến hoặc quan sát một cá thể.', 'B', ['Dùng quan sát một trường hợp để kết luận nhân quả.'], ['Phương pháp nghiên cứu sinh học']),
  solved('bio10-assess-mid1-b-q04', 'Biến độc lập là yếu tố người nghiên cứu chủ động đặt các mức khác nhau.', 'Lượng ánh sáng được thay đổi; chiều cao tăng thêm là kết quả được đo nên là biến phụ thuộc.', 'B', ['Chọn đại lượng được đo làm biến độc lập.', 'Chọn biến kiểm soát.'], ['Thiết kế thí nghiệm']),
  solved('bio10-assess-mid1-b-q05', 'Dãy phải bắt đầu từ tế bào rồi tăng dần theo quan hệ bao hàm.', 'Tế bào tạo cơ thể; các cơ thể cùng loài tạo quần thể; nhiều quần thể tương tác tạo quần xã.', 'A', ['Đảo vị trí quần thể và quần xã.', 'Đặt cơ thể trước tế bào.'], ['Các cấp độ tổ chức sống']),
  solved('bio10-assess-mid1-b-q06', 'Dấu hiệu là khả năng carbon tạo khung phân tử hữu cơ đa dạng.', 'Carbon có bốn electron hóa trị, tạo nhiều liên kết cộng hóa trị bền và liên kết với chính carbon thành mạch thẳng, nhánh hoặc vòng.', 'B', ['Cho rằng carbon chỉ tạo một liên kết.', 'Không liên hệ hóa trị với sự đa dạng cấu trúc.'], ['Vai trò của carbon']),
  solved('bio10-assess-mid1-b-q07', 'Hiện tượng bay hơi làm mát liên quan đến nhiệt hóa hơi cao của nước.', 'Các phân tử nước có năng lượng cao rời bề mặt khi bay hơi và mang theo nhiều nhiệt, làm giảm nhiệt bề mặt da.', 'A', ['Nhầm bay hơi với tăng nhiệt.', 'Nói nước kị nước.'], ['Tính chất của nước']),
  solved('bio10-assess-mid1-b-q08', 'Đề hỏi polysaccharide cấu trúc đặc trưng của thực vật.', 'Cellulose cấu tạo thành tế bào thực vật; glycogen là chất dự trữ ở động vật/nấm, glucose là đường đơn và sucrose là đường đôi.', 'C', ['Nhầm cellulose với glycogen.'], ['Carbohydrate']),
  solved('bio10-assess-mid1-b-q09', 'Dấu hiệu “khung cơ bản của màng” hướng tới phân tử có đầu ưa nước và đuôi kị nước.', 'Phospholipid tự sắp xếp thành lớp kép và tạo nền cấu trúc của màng sinh chất.', 'B', ['Chọn triglyceride vì cũng là lipid.'], ['Lipid và màng sinh chất']),
  solved('bio10-assess-mid1-b-q10', 'Đề hỏi đơn phân của protein.', 'Protein là polymer được tạo từ các amino acid nối nhau bằng liên kết peptide.', 'C', ['Nhầm nucleotide với amino acid.'], ['Protein']),
  solved('bio10-assess-mid1-b-q11', 'Mất hoạt tính ở pH cực đoan là dấu hiệu cấu trúc không gian của enzyme bị biến đổi.', 'pH làm thay đổi trạng thái ion hóa và tương tác duy trì cấu trúc, khiến trung tâm hoạt động không còn hình dạng phù hợp.', 'B', ['Khẳng định mọi liên kết peptide đều bị cắt.', 'Cho rằng pH trực tiếp đổi protein thành carbohydrate.'], ['Biến tính protein']),
  solved('bio10-assess-mid1-b-q12', 'Cần phân biệt base đặc trưng của RNA và DNA.', 'RNA dùng uracil, trong khi DNA dùng thymine; A, G và C đều có ở cả hai.', 'D', ['Nhầm uracil với thymine.'], ['Nucleic acid']),
  solved('bio10-assess-mid1-b-q13', 'Cụm “cấu tạo ribosome” là dấu hiệu của ribosomal RNA.', 'rRNA cùng protein tạo ribosome và có vai trò xúc tác trong hình thành liên kết peptide.', 'A', ['Chọn mRNA vì mRNA đi qua ribosome.', 'Nhầm rRNA với tRNA.'], ['Các loại RNA']),
  solved('bio10-assess-mid1-b-q14', 'Biuret tím là kết quả dương tính liên quan các liên kết peptide.', 'Kết quả hỗ trợ mẫu có protein hoặc peptide đủ điều kiện phản ứng; không chứng minh mẫu chỉ chứa một amino acid.', 'A', ['Kết luận quá mức về độ tinh khiết.', 'Nhầm Biuret với iodine.'], ['Thực hành nhận biết protein']),
  solved('bio10-assess-mid1-b-q15', 'Đọc màu dương tính: Biuret tím cho protein; iodine xanh tím cho tinh bột.', 'M tím với Biuret và không xanh tím với iodine nên có protein; N xanh tím với iodine và không tím với Biuret nên có tinh bột.', 'B', ['Đảo hai thuốc thử.', 'Không đọc đồng thời cả hai cột.'], ['Đọc bảng thí nghiệm']),
  solved('bio10-assess-mid1-b-q16', 'Phát biểu tuyệt đối “luôn có hại” và “loại bỏ hoàn toàn” là dấu hiệu cần phân loại carbohydrate và xét chức năng.', 'Carbohydrate gồm nhiều loại, có vai trò cung cấp/dự trữ năng lượng và cấu trúc; tác động sức khỏe phụ thuộc loại và lượng sử dụng.', 'B', ['Đồng nhất mọi carbohydrate với đường tinh luyện.', 'Phản biện nhưng không nêu chức năng sinh học.'], ['Dinh dưỡng và carbohydrate']),
  solved('bio10-assess-mid1-b-q17', 'Xác định yếu tố chủ động thay đổi, đại lượng đo và phạm vi có thể khái quát.', 'a Đúng: thời gian chiếu sáng được đặt các mức. b Sai: chiều cao tăng thêm là biến phụ thuộc. c Đúng: kiểm soát các điều kiện giảm nhiễu. d Sai: kết quả không đại diện cho mọi loài và mọi điều kiện.', 'a:Đ|b:S|c:Đ|d:S', ['Nhầm biến phụ thuộc với biến kiểm soát.', 'Khái quát quá phạm vi khảo sát.'], ['Thiết kế thí nghiệm', 'Giới hạn kết luận']),
  solved('bio10-assess-mid1-b-q18', 'Cụm kiểm tra quan hệ cấu trúc–chức năng của lipid và carbohydrate.', 'a Đúng: phospholipid lưỡng cực. b Sai: triglyceride gồm glycerol và acid béo, không phải polymer amino acid. c Đúng: glycogen dự trữ ở động vật. d Sai: cellulose và glycogen không ngọt, không tan tốt như đường đơn.', 'a:Đ|b:S|c:Đ|d:S', ['Gọi mọi đại phân tử là polymer amino acid.', 'Cho rằng mọi carbohydrate đều là đường ngọt.'], ['Lipid', 'Carbohydrate']),
  solved('bio10-assess-mid1-b-q19', 'Dựa vào hiện tượng đặc trưng để xác định từng phép thử dương, rồi mới đếm.', 'Iodine vàng nâu: tinh bột âm tính. Biuret tím: protein dương tính. Sudan III tạo lớp đỏ cam: lipid dương tính. Có 2 nhóm dương tính.', '2', ['Đếm số phép thử thay vì số kết quả dương.', 'Coi vàng nâu của iodine là dương tính.'], ['Thực hành nhận biết phân tử sinh học']),
  solved('bio10-assess-mid1-b-q20', 'Cụm “tham gia cấu tạo ribosome” là dấu hiệu đặc trưng của ribosomal RNA.', 'Tên viết tắt của ribosomal RNA là rRNA.', 'rRNA', ['Trả lời mRNA hoặc tRNA.'], ['Các loại RNA'])
];
