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

export const biologyMidterm1SolutionsFormA: Solution[] = [
  solved('bio10-assess-mid1-a-q01', 'Dấu hiệu là đề hỏi phạm vi nghiên cứu của sinh học, không hỏi một ngành hẹp.', 'Sinh học nghiên cứu thế giới sống từ cấu trúc, chức năng, cơ chế đến quan hệ và sự biến đổi. Các phương án còn lại đều thu hẹp sai phạm vi.', 'B', ['Đồng nhất sinh học với học thuộc phân loại.', 'Chỉ nghĩ sinh học nghiên cứu cơ thể người.'], ['Đối tượng và vai trò của sinh học']),
  solved('bio10-assess-mid1-a-q02', 'Tình huống chứa dữ liệu hệ gene cá nhân nên phải xét đồng thuận, riêng tư và công bằng.', 'Dữ liệu di truyền nhạy cảm; chỉ độ chính xác kỹ thuật không thay thế được đồng thuận và bảo mật. Không được dùng dữ liệu để phân biệt đối xử.', 'C', ['Chỉ cân nhắc lợi ích công nghệ.', 'Cho rằng công ty sở hữu mặc nhiên dữ liệu nhân viên.'], ['Đạo đức sinh học']),
  solved('bio10-assess-mid1-a-q03', 'Đề cần mô tả hiện trạng/thói quen của một quần thể chứ không cần can thiệp biến.', 'Điều tra bằng bảng hỏi trên mẫu đại diện tạo dữ liệu phù hợp để ước lượng tỉ lệ ăn sáng trong trường.', 'A', ['Chọn thực nghiệm cho mọi câu hỏi nghiên cứu.', 'Khảo sát mẫu thuận tiện rồi khái quát cho toàn trường.'], ['Phương pháp nghiên cứu sinh học']),
  solved('bio10-assess-mid1-a-q04', 'Đại lượng được chủ động thay đổi là nhiệt độ; đại lượng được đo để xem phản ứng là tỉ lệ nảy mầm.', 'Vì tỉ lệ nảy mầm phụ thuộc vào nhiệt độ đã đặt nên đó là biến phụ thuộc.', 'C', ['Nhầm biến độc lập với biến phụ thuộc.', 'Chọn một biến kiểm soát làm biến phụ thuộc.'], ['Thiết kế thí nghiệm và kiểm soát biến']),
  solved('bio10-assess-mid1-a-q05', 'Đề hỏi cấp nhỏ nhất vẫn biểu hiện đầy đủ đặc trưng sống.', 'Phân tử và bào quan là thành phần của tế bào nhưng không tự biểu hiện đầy đủ đặc trưng sống; tế bào là đơn vị cơ bản.', 'C', ['Chọn đối tượng nhỏ nhất về kích thước.', 'Nhầm mô là đơn vị cơ bản của mọi sự sống.'], ['Các cấp độ tổ chức sống']),
  solved('bio10-assess-mid1-a-q06', 'Đề đối chiếu lượng cơ thể cần với tầm quan trọng sinh học của nguyên tố.', 'Vi lượng nghĩa là cần ở lượng nhỏ, không có nghĩa vai trò nhỏ. Thiếu vi lượng thiết yếu vẫn có thể gây rối loạn nghiêm trọng.', 'C', ['Đồng nhất hàm lượng nhỏ với không quan trọng.'], ['Nguyên tố đa lượng và vi lượng']),
  solved('bio10-assess-mid1-a-q07', 'Dấu hiệu “hạn chế biến động nhiệt” hướng tới nhiệt dung riêng cao của nước.', 'Mạng liên kết hydrogen khiến cần nhiều năng lượng để tăng nhiệt độ nước; vì vậy nước giúp ổn định nhiệt trong tế bào và cơ thể.', 'A', ['Nêu liên kết hydrogen nhưng không nối với nhiệt dung.', 'Cho rằng nước kị nước.'], ['Cấu tạo và vai trò sinh học của nước']),
  solved('bio10-assess-mid1-a-q08', 'Cần phân loại từng carbohydrate theo chức năng dự trữ hoặc cấu trúc.', 'Glycogen là polysaccharide dự trữ ở động vật và nấm. Cellulose có chức năng cấu trúc ở thực vật.', 'B', ['Nhầm cellulose với tinh bột.', 'Cho rằng mọi polysaccharide đều dự trữ năng lượng.'], ['Carbohydrate']),
  solved('bio10-assess-mid1-a-q09', 'Dấu hiệu “lớp kép trong nước” yêu cầu nhận ra tính lưỡng cực của phospholipid.', 'Đầu phosphate phân cực tương tác với nước, còn đuôi hydrocarbon tránh nước; sự sắp xếp này tạo lớp kép.', 'B', ['Nhầm triglyceride với phospholipid.', 'Cho rằng phospholipid liên kết bằng liên kết peptide.'], ['Lipid và màng tế bào']),
  solved('bio10-assess-mid1-a-q10', 'Đề mô tả liên kết giữa hai amino acid.', 'Phản ứng giữa nhóm carboxyl và nhóm amino tạo liên kết peptide; nhiều amino acid nối nhau tạo polypeptide.', 'C', ['Nhầm với liên kết phosphodiester của nucleic acid.'], ['Protein và liên kết peptide']),
  solved('bio10-assess-mid1-a-q11', 'Hiện tượng đông tụ khi đun nóng là dấu hiệu biến tính protein.', 'Nhiệt làm phá vỡ các tương tác duy trì cấu trúc bậc cao, làm chuỗi protein thay đổi không gian và kết tụ; không nhất thiết cắt toàn bộ liên kết peptide.', 'B', ['Đồng nhất biến tính với thủy phân hoàn toàn.', 'Cho rằng protein biến thành lipid.'], ['Biến tính protein']),
  solved('bio10-assess-mid1-a-q12', 'Cần nhớ ba thành phần nucleotide và loại đường đặc trưng của DNA.', 'Nucleotide DNA gồm deoxyribose, nhóm phosphate và một nitrogenous base.', 'B', ['Dùng ribose của RNA.', 'Thiếu nhóm phosphate.'], ['Nucleic acid']),
  solved('bio10-assess-mid1-a-q13', 'Đề hỏi chức năng riêng của một loại RNA.', 'tRNA gắn với amino acid đặc hiệu và đưa amino acid tới ribosome trong quá trình dịch mã.', 'B', ['Gán chức năng của mRNA cho mọi RNA.', 'Cho tRNA là vật liệu cấu tạo màng.'], ['Các loại RNA']),
  solved('bio10-assess-mid1-a-q14', 'Benedict sau khi đun nóng và kết tủa đỏ gạch là dấu hiệu dương tính với đường khử.', 'Phép thử cho phép kết luận có đường khử trong giới hạn điều kiện thử, không chứng minh mẫu chỉ chứa glucose tinh khiết.', 'B', ['Kết luận vượt quá độ đặc hiệu của phép thử.', 'Quên điều kiện đun nóng.'], ['Thực hành nhận biết phân tử sinh học']),
  solved('bio10-assess-mid1-a-q15', 'Đọc từng cột thuốc thử: iodine dương tính với tinh bột, Biuret tím dương tính với protein.', 'P đổi xanh tím với iodine và không tím với Biuret nên có tinh bột; Q giữ vàng nâu với iodine nhưng tím với Biuret nên có protein.', 'A', ['Đọc nhầm màu dương tính của hai thuốc thử.', 'Bỏ qua kết quả âm tính.'], ['Đọc bảng thí nghiệm nhận biết chất']),
  solved('bio10-assess-mid1-a-q16', 'Tình huống khẩu phần loại bỏ lipid yêu cầu liên hệ lipid với hấp thu vitamin tan trong dầu.', 'Vitamin A, D, E và K tan trong lipid nên thiếu lipid kéo dài có thể làm giảm hấp thu những vitamin này.', 'B', ['Cho rằng lipid chỉ là nguồn năng lượng.', 'Suy diễn loại lipid làm mọi protein biến tính.'], ['Dinh dưỡng và lipid']),
  solved('bio10-assess-mid1-a-q17', 'Cụm Đúng/Sai yêu cầu xác định biến trước, sau đó đánh giá giới hạn kết luận.', 'a Sai: tỉ lệ nảy mầm là biến phụ thuộc. b Đúng: nồng độ NaCl được chủ động thay đổi. c Đúng: 0% là mốc không có tác động độ mặn. d Sai: dữ liệu chỉ áp dụng cho giống và khoảng nồng độ đã khảo sát.', 'a:S|b:Đ|c:Đ|d:S', ['Đánh đồng xu hướng trong mẫu với quy luật cho mọi loài.', 'Nhầm đại lượng đo với biến độc lập.'], ['Biến thí nghiệm', 'Giới hạn của kết luận']),
  solved('bio10-assess-mid1-a-q18', 'Mỗi phát biểu kiểm tra một quan hệ cấu trúc–chức năng, không chỉ định nghĩa tên gọi.', 'a Đúng: cả DNA và RNA là polymer nucleotide. b Sai: tRNA, rRNA có chức năng khác mRNA. c Đúng: trình tự amino acid chi phối cách gấp cuộn. d Sai: biến tính thường không phá toàn bộ liên kết peptide.', 'a:Đ|b:S|c:Đ|d:S', ['Gán chức năng mRNA cho mọi RNA.', 'Đồng nhất biến tính với thủy phân.'], ['Protein', 'Nucleic acid']),
  solved('bio10-assess-mid1-a-q19', 'Đếm số phép thử dương tính dựa trên màu đặc trưng, không đếm số phép thử đã làm.', 'Iodine xanh tím: tinh bột dương tính. Biuret tím: protein dương tính. Sudan III không tạo lớp đỏ cam: lipid âm tính. Có 2 nhóm dương tính.', '2', ['Đếm cả kết quả âm tính.', 'Nhầm màu của iodine với Biuret.'], ['Thực hành nhận biết phân tử sinh học']),
  solved('bio10-assess-mid1-a-q20', 'Cụm “vận chuyển amino acid tới ribosome” là dấu hiệu đặc trưng của transfer RNA.', 'Tên viết tắt của transfer RNA là tRNA.', 'tRNA', ['Trả lời mRNA vì thấy từ “ribosome”.', 'Nhầm rRNA với tRNA.'], ['Các loại RNA'])
];
