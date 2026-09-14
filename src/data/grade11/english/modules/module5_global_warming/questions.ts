import type { CourseQuestion } from '@/data/schema';
import type { PracticeRole, QuestionRepresentationType, QuestionStimulus } from '@/types';

type Choice = 'A' | 'B' | 'C' | 'D';
type Raw = {
  p: string;
  c: string;
  w: [string, string, string];
  stimulus?: QuestionStimulus;
  representation?: QuestionRepresentationType;
  translation?: {
    content: string;
    options?: string[];
  };
};
const letters: Choice[] = ['A', 'B', 'C', 'D'];
const roles: PracticeRole[] = ['guided', 'near_transfer', 'misconception_check', 'far_transfer', 'retention', 'mastery_holdout'];
const difficulties: CourseQuestion['difficulty'][] = ['easy', 'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard'];
const build = (key: string, lesson: string, rows: Raw[], subTypes: [string, string]): CourseQuestion[] =>
  rows.map((row, index) => {
    const position = index % 4;
    const choices = [...row.w];
    choices.splice(position, 0, row.c);
    return {
      id: `eng11-q-u5-${key}-${String(index + 1).padStart(2, '0')}`,
      courseId: 'grade11:english', moduleId: 'eng11-m5', lessonId: `eng11-u5-${lesson}`,
      subjectId: 'english', topicId: 'eng11-topic-u5', questionTypeId: `eng11-qt-u5-${key}`,
      content: row.p, options: choices.map((option, optionIndex) => `${letters[optionIndex]}. ${option}`) as [string, string, string, string],
      correctAnswer: letters[position], responseType: 'single_choice', validatorType: 'choice',
      translation: row.translation,
      difficulty: difficulties[index], points: 0.25, sourceType: 'manual', outcomeIds: [`eng11-out-u5-${key}`],
      subTypeId: `eng11-u5-${key}-${index < 6 ? subTypes[0] : subTypes[1]}`,
      practiceRole: roles[index % 6], representationType: row.representation ?? (index % 4 === 3 ? 'dialogue' : 'text'),
      isMasteryHoldout: index % 6 === 5, stimulus: row.stimulus
    };
  });

const pronunciation: Raw[] = [
  {
    p: 'Which word normally carries the main stress in “Factories release harmful gases”?',
    c: 'harmful',
    w: ['the implied article', 'no word', 'a missing preposition'],
    translation: {
      content: 'Từ nào thường mang trọng âm chính trong câu “Factories release harmful gases”?',
      options: ['A. harmful (tính từ mang thông tin quan trọng)', 'B. mạo từ ẩn', 'C. không có từ nào', 'D. giới từ thiếu']
    }
  },
  {
    p: 'In neutral speech, which item is most likely to be stressed?',
    c: 'emissions',
    w: ['the', 'of', 'to'],
    translation: {
      content: 'Trong lời nói tự nhiên trung tính, từ nào nhiều khả năng mang trọng âm nhất?',
      options: ['A. the', 'B. emissions (danh từ thực từ: emissions)', 'C. of', 'D. to']
    }
  },
  {
    p: 'Which group mainly contains content words?',
    c: 'climate, reduce, serious',
    w: ['the, of, a', 'can, have, to', 'we, they, it'],
    translation: {
      content: 'Nhóm nào chủ yếu chứa các từ thực từ (content words)?',
      options: ['A. the, of, a', 'B. can, have, to', 'C. climate, reduce, serious (danh từ, động từ, tính từ - các từ thực từ)', 'D. we, they, it']
    }
  },
  {
    p: 'A: “Why is ‘energy’ prominent in the sentence?” B: “Because it ______.”',
    c: 'carries important meaning',
    w: ['is always the last word', 'is a function word', 'has the fewest letters'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Tại sao từ ‘energy’ lại nổi bật trong câu?” B: “Bởi vì nó ______.”',
      options: ['A. luôn là từ cuối cùng', 'B. là hư từ', 'C. có ít chữ cái nhất', 'D. carries important meaning (mang ý nghĩa quan trọng)']
    }
  },
  {
    p: 'In “People can REDUCE waste”, why is reduce stressed?',
    c: 'It is the main verb carrying information.',
    w: ['It is an article.', 'It has no meaning.', 'Every auxiliary must be strongest.'],
    translation: {
      content: 'Trong câu “People can REDUCE waste”, tại sao từ reduce lại được nhấn trọng âm?',
      options: ['A. It is the main verb carrying information. (Nó là động từ chính mang thông tin.)', 'B. Nó là mạo từ.', 'C. Nó không có ý nghĩa.', 'D. Mọi trợ động từ phải mạnh nhất.']
    }
  },
  {
    p: 'Function words are commonly weaker because they:',
    c: 'mainly express grammatical relationships',
    w: ['are always silent', 'are never necessary', 'cannot occur in questions'],
    translation: {
      content: 'Hư từ (function words) thường yếu hơn vì chúng:',
      options: ['A. luôn câm', 'B. mainly express grammatical relationships (chủ yếu thể hiện mối quan hệ ngữ pháp)', 'C. không bao giờ cần thiết', 'D. không thể xuất hiện trong câu hỏi']
    }
  },
  {
    p: 'In “We need SOLAR power, not coal”, SOLAR receives extra stress to:',
    c: 'mark a contrast',
    w: ['end the sentence', 'remove meaning', 'turn it into a function word'],
    translation: {
      content: 'Trong câu “We need SOLAR power, not coal”, từ SOLAR nhận trọng âm bổ sung để:',
      options: ['A. kết thúc câu', 'B. gỡ bỏ ý nghĩa', 'C. mark a contrast (đánh dấu sự tương phản: trọng âm tương phản)', 'D. biến nó thành hư từ']
    }
  },
  {
    p: 'A: “Did Lan propose buses?” B: “No, she proposed TRAINS.” The stress corrects:',
    c: 'the type of transport',
    w: ['the speaker’s name', 'the tense', 'the number of syllables'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Lan đã đề xuất xe buýt à?” B: “Không, bạn ấy đề xuất TÀU HỎA.” Trọng âm sửa đổi:',
      options: ['A. tên người nói', 'B. thì ngữ pháp', 'C. số lượng âm tiết', 'D. the type of transport (loại hình giao thông)']
    }
  },
  {
    p: 'Which statement about English rhythm is most accurate?',
    c: 'Unstressed syllables may be shortened between stressed beats.',
    w: ['Every syllable has equal force.', 'Rhythm depends only on spelling.', 'All short words disappear.'],
    translation: {
      content: 'Phát biểu nào về nhịp điệu tiếng Anh là chính xác nhất?',
      options: ['A. Unstressed syllables may be shortened between stressed beats. (Các âm tiết không mang trọng âm có thể bị rút ngắn giữa các nhịp mang trọng âm.)', 'B. Mọi âm tiết có lực bằng nhau.', 'C. Nhịp điệu chỉ phụ thuộc vào cách đánh vần.', 'D. Tất cả các từ ngắn đều biến mất.']
    }
  },
  {
    p: 'To make “I said Tuesday, not Thursday” clear, the most useful contrastive stress is on:',
    c: 'Tuesday',
    w: ['I only', 'said only', 'the implied punctuation'],
    translation: {
      content: 'Để làm rõ câu “Tớ nói thứ Ba, chứ không phải thứ Năm”, trọng âm tương phản hữu ích nhất rơi vào:',
      options: ['A. I', 'B. Tuesday (Tuesday vs Thursday)', 'C. said', 'D. dấu câu ẩn']
    }
  },
  {
    p: 'Why can a function word receive stress?',
    c: 'The speaker may contrast or correct it.',
    w: ['It becomes a noun permanently.', 'Grammar requires every function word to be loud.', 'It has four syllables.'],
    translation: {
      content: 'Tại sao một hư từ lại có thể nhận trọng âm?',
      options: ['A. Nó trở thành danh từ vĩnh viễn.', 'B. Ngữ pháp đòi hỏi mọi hư từ phải to.', 'C. The speaker may contrast or correct it. (Người nói có thể tạo sự tương phản hoặc sửa đổi nó.)', 'D. Nó có 4 âm tiết.']
    }
  },
  {
    p: 'What is the safest strategy when marking sentence stress?',
    c: 'Use meaning and context to identify prominent information.',
    w: ['Stress every written word.', 'Stress only the longest spelling.', 'Ignore correction and contrast.'],
    translation: {
      content: 'Chiến lược an toàn nhất khi đánh dấu trọng âm câu là gì?',
      options: ['A. Nhấn trọng âm mọi từ được viết.', 'B. Nhấn trọng âm chỉ từ dài nhất.', 'C. Bỏ qua sự sửa đổi và tương phản.', 'D. Use meaning and context to identify prominent information. (Sử dụng ý nghĩa và bối cảnh để xác định thông tin nổi bật.)']
    }
  }
];

const vocabulary: Raw[] = [
  {
    p: 'Gases that trap heat in the atmosphere are called:',
    c: 'greenhouse gases',
    w: ['renewable gases', 'weather walls', 'carbon roads'],
    translation: {
      content: 'Các chất khí giữ nhiệt trong khí quyển được gọi là:',
      options: ['A. greenhouse gases (khí nhà kính)', 'B. renewable gases', 'C. weather walls', 'D. carbon roads']
    }
  },
  {
    p: 'The total emissions linked to an activity can be called its carbon:',
    c: 'footprint',
    w: ['fingerprint', 'shadowing', 'temperature'],
    translation: {
      content: 'Tổng lượng khí thải liên quan đến một hoạt động có thể được gọi là carbon ______ của nó:',
      options: ['A. fingerprint', 'B. footprint (carbon footprint - dấu chân carbon)', 'C. shadowing', 'D. temperature']
    }
  },
  {
    p: 'Which term means adjusting to reduce harm from climate impacts?',
    c: 'adaptation',
    w: ['emission', 'combustion', 'prediction only'],
    translation: {
      content: 'Thuật ngữ nào có nghĩa là điều chỉnh để giảm thiểu tác hại từ các tác động khí hậu?',
      options: ['A. emission', 'B. combustion', 'C. adaptation (sự thích ứng / adaptation)', 'D. prediction only']
    }
  },
  {
    p: 'A: “What is mitigation?” B: “It means ______.”',
    c: 'reducing emissions or increasing carbon removal',
    w: ['measuring one rainy day', 'ignoring future risk', 'moving every community'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Mitigation (giảm nhẹ) là gì?” B: “Nó có nghĩa là ______.”',
      options: ['A. đo lường một ngày mưa', 'B. bỏ qua rủi ro tương lai', 'C. di chuyển mọi cộng đồng', 'D. reducing emissions or increasing carbon removal (giảm khí thải hoặc tăng cường hấp thụ carbon)']
    }
  },
  {
    p: 'Energy from sunlight and wind is generally described as:',
    c: 'renewable',
    w: ['fossilised', 'exhaustive weather', 'emissive'],
    translation: {
      content: 'Năng lượng từ ánh sáng mặt trời và gió thường được mô tả là:',
      options: ['A. renewable (tái tạo / renewable energy)', 'B. fossilised', 'C. exhaustive weather', 'D. emissive']
    }
  },
  {
    p: 'A long-term rise in average sea level is called:',
    c: 'sea-level rise',
    w: ['sea-level mood', 'weather footprint', 'carbon adaptation'],
    translation: {
      content: 'Sự gia tăng lâu dài về mực nước biển trung bình được gọi là:',
      options: ['A. sea-level mood', 'B. sea-level rise (sự dâng cao mực nước biển)', 'C. weather footprint', 'D. carbon adaptation']
    }
  },
  {
    p: 'Choose the correct collocation for climate action.',
    c: 'reduce emissions',
    w: ['do emissions', 'make emissions down', 'take greenhouse'],
    translation: {
      content: 'Chọn kết hợp từ (collocation) đúng cho hành động vì khí hậu:',
      options: ['A. do emissions', 'B. make emissions down', 'C. reduce emissions (cắt giảm khí thải)', 'D. take greenhouse']
    }
  },
  {
    p: 'Countries can ______ to cleaner sources of energy.',
    c: 'switch',
    w: ['release at', 'cope into', 'emit from'],
    translation: {
      content: 'Các quốc gia có thể ______ sang các nguồn năng lượng sạch hơn:',
      options: ['A. release at', 'B. cope into', 'C. emit from', 'D. switch (chuyển đổi / switch to)']
    }
  },
  {
    p: 'Forests can act as carbon ______ by absorbing carbon dioxide.',
    c: 'sinks',
    w: ['waves', 'storms', 'footprints only'],
    translation: {
      content: 'Rừng có thể đóng vai trò như các bể chứa carbon (carbon ______) bằng cách hấp thụ khí CO2.',
      options: ['A. sinks (bể chứa carbon / carbon sinks)', 'B. waves', 'C. storms', 'D. footprints only']
    }
  },
  {
    p: 'A: “How can coastal towns ______ rising seas?” B: “Through adaptation planning.”',
    c: 'cope with',
    w: ['release to', 'switch at', 'absorb on'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Làm thế nào các thị trấn ven biển có thể ______ với mực nước biển dâng?” B: “Thông qua quy hoạch thích ứng.”',
      options: ['A. release to', 'B. cope with (ứng phó với / cope with)', 'C. switch at', 'D. absorb on']
    }
  },
  {
    p: 'The noun needed in “Improved energy ______ lowers demand” is:',
    c: 'efficiency',
    w: ['efficient', 'efficiently', 'efficiencies adjective'],
    translation: {
      content: 'Danh từ cần thiết trong câu “Sự hiệu quả năng lượng (energy ______) được cải thiện giúp giảm nhu cầu” là:',
      options: ['A. efficient', 'B. efficiently', 'C. efficiency (energy efficiency - hiệu quả sử dụng năng lượng)', 'D. efficiencies adjective']
    }
  },
  {
    p: 'Which phrase refers to unusually severe climate-related events?',
    c: 'extreme weather',
    w: ['renewable climate', 'efficient carbon', 'greenhouse adaptation'],
    translation: {
      content: 'Cụm từ nào đề cập đến các sự kiện liên quan đến khí hậu nghiêm trọng bất thường?',
      options: ['A. renewable climate', 'B. efficient carbon', 'C. greenhouse adaptation', 'D. extreme weather (thời tiết cực đoan / extreme weather)']
    }
  }
];

const grammar: Raw[] = [
  {
    p: '______ less electricity, households can lower their emissions.',
    c: 'Using',
    w: ['Used', 'Use', 'To used'],
    translation: {
      content: '______ ít điện hơn, các hộ gia đình có thể giảm lượng khí thải của họ.',
      options: ['A. Using (Phân từ hiện tại chỉ nguyên nhân/hành động chủ động: Using)', 'B. Used', 'C. Use', 'D. To used']
    }
  },
  {
    p: 'Walking to school, Minh ______ fuel and gets exercise.',
    c: 'saves',
    w: ['is saved by fuel', 'saving only', 'were save'],
    translation: {
      content: 'Đi bộ đến trường, Minh ______ nhiên liệu và tập thể dục.',
      options: ['A. is saved by fuel', 'B. saves (chia động từ thì hiện tại đơn cùng chủ ngữ Minh: saves)', 'C. saving only', 'D. were save']
    }
  },
  {
    p: '______ the long-term data, researchers identified a warming trend.',
    c: 'Analysing',
    w: ['Analysed by the data', 'Analyse', 'To analysed'],
    translation: {
      content: '______ dữ liệu dài hạn, các nhà nghiên cứu đã xác định xu hướng ấm lên.',
      options: ['A. Analysed by the data', 'B. Analyse', 'C. Analysing (Phân từ hiện tại chủ động: Analysing)', 'D. To analysed']
    }
  },
  {
    p: 'A: “Why use ‘reducing’?” B: “Because the subject actively ______ waste.”',
    c: 'reduces',
    w: ['is reduced by', 'was reducing by itself only', 'has no link to'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Tại sao lại dùng ‘reducing’?” B: “Bởi vì chủ ngữ chủ động ______ rác thải.”',
      options: ['A. is reduced by', 'B. was reducing by itself only', 'C. has no link to', 'D. reduces (chủ động giảm rác thải: reduces)']
    }
  },
  {
    p: 'Which sentence has a correct shared logical subject?',
    c: 'Cycling to work, Mai avoids traffic emissions.',
    w: ['Cycling to work, the rain began.', 'Cycling to work, the road was wet.', 'Cycling to work, there were clouds.'],
    translation: {
      content: 'Câu nào có chủ ngữ logic chung đúng giữa mệnh đề phân từ và mệnh đề chính?',
      options: ['A. Cycling to work, Mai avoids traffic emissions. (Mai đi xe đạp, Mai tránh khí thải - cùng chủ ngữ Mai)', 'B. Sai (mệnh đề phân từ treo - dangling participle)', 'C. Sai (mệnh đề phân từ treo)', 'D. Sai (mệnh đề phân từ treo)']
    }
  },
  {
    p: 'Choose the clause showing two actions by the same subject.',
    c: 'Comparing the options, the council selected solar panels.',
    w: ['Compared the options, rain fell.', 'Comparing the options, the cost was high.', 'To comparing, the plan selected.'],
    translation: {
      content: 'Chọn mệnh đề thể hiện 2 hành động được thực hiện bởi cùng một chủ ngữ:',
      options: ['A. Sai (dangling participle)', 'B. Comparing the options, the council selected solar panels. (So sánh các lựa chọn, hội đồng đã chọn pin mặt trời)', 'C. Sai (dangling participle)', 'D. Sai (lỗi cấu trúc)']
    }
  },
  {
    p: '______ by rising water, several paths were temporarily closed.',
    c: 'Flooded',
    w: ['Flooding actively', 'Flood', 'To flooding'],
    translation: {
      content: '______ bởi nước dâng cao, một số con đường đã tạm thời bị đóng cửa.',
      options: ['A. Flooding actively', 'B. Flood', 'C. Flooded (Phân từ quá khứ mang nghĩa bị động: Flooded)', 'D. To flooding']
    }
  },
  {
    p: 'A: “Why is ‘powered’ correct?” B: “Because the building is ______ by solar energy.”',
    c: 'powered',
    w: ['powering the sun', 'to power itself', 'powers'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Tại sao ‘powered’ lại đúng?” B: “Bởi vì tòa nhà được ______ bởi năng lượng mặt trời.”',
      options: ['A. powering the sun', 'B. to power itself', 'C. powers', 'D. powered (bị động: được vận hành bằng năng lượng mặt trời)']
    }
  },
  {
    p: '______ from local farms, the food requires less transport.',
    c: 'Sourced',
    w: ['Sourcing itself', 'Source', 'To sourcing'],
    translation: {
      content: '______ từ các trang trại địa phương, thực phẩm đòi hỏi ít sự vận chuyển hơn.',
      options: ['A. Sourced (Phân từ quá khứ bị động: Được thu mua/lấy từ...)', 'B. Sourcing itself', 'C. Source', 'D. To sourcing']
    }
  },
  {
    p: 'Which sentence correctly uses a past participle clause?',
    c: 'Designed for hot weather, the roof keeps rooms cooler.',
    w: ['Designing for hot weather, the roof designer disappeared.', 'Designed the roof, it cooling.', 'To designed, rooms cool.'],
    translation: {
      content: 'Câu nào sử dụng đúng mệnh đề phân từ quá khứ?',
      options: ['A. Sai ngữ pháp', 'B. Designed for hot weather, the roof keeps rooms cooler. (Được thiết kế cho thời tiết nóng, mái nhà giúp các phòng mát hơn.)', 'C. Sai ngữ pháp', 'D. Sai ngữ pháp']
    }
  },
  {
    p: 'Select the best reduction: “Because it was damaged by the storm, the bridge closed.”',
    c: 'Damaged by the storm, the bridge closed.',
    w: ['Damaging by the storm, the bridge closed.', 'Having damage the storm, the bridge closed.', 'To damage, the bridge closed.'],
    translation: {
      content: 'Chọn cách rút gọn tốt nhất cho câu: “Vì nó bị hư hỏng bởi cơn bão, cây cầu đã đóng cửa.”',
      options: ['A. Sai ngữ pháp', 'B. Sai ngữ pháp', 'C. Damaged by the storm, the bridge closed. (Rút gọn bị động dùng Past Participle: Damaged by...)', 'D. Sai ngữ pháp']
    }
  },
  {
    p: 'Which revision fixes the dangling clause “Driving home, the storm began”?',
    c: 'While we were driving home, the storm began.',
    w: ['Driving home, the storm was beginning us.', 'Driven home, the storm drove.', 'Driving the storm, home began.'],
    translation: {
      content: 'Bản sửa đổi nào khắc phục mệnh đề phân từ treo “Driving home, the storm began”?',
      options: ['A. Vẫn bị lỗi phân từ treo', 'B. Vẫn bị lỗi phân từ treo', 'C. Vẫn bị lỗi phân từ treo', 'D. While we were driving home, the storm began. (Sửa thành mệnh đề trạng ngữ rõ chủ ngữ "we")']
    }
  }
];

const passage1: QuestionStimulus = {
  id: 'eng11-stim-u5-reading-1', title: 'Testing passive cooling in a city school',
  content: `A high school in a crowded district recorded afternoon indoor temperatures above 34 degrees Celsius during summer months. Air-conditioning units were expensive to install and operate, and the school board wanted to lower energy costs while reducing emissions. The environmental club proposed a one-year pilot test using passive cooling methods in six south-facing classrooms. Two similar rooms without changes served as controls throughout the trial.

Volunteers painted classroom roofs with reflective white paint, installed external bamboo blinds and planted fast-growing climbing plants near outer walls. Sensors recorded indoor temperature, humidity, airflow and power consumption every fifteen minutes. Teachers also logged student attention and attendance during peak afternoon hours. The control rooms remained unchanged.

Data collected over three months showed an average reduction of 3.2 degrees Celsius in painted-roof rooms and 2.1 degrees Celsius in rooms with external shading. The combined measures lowered peak indoor temperatures by up to 4.8 degrees Celsius compared with unshaded control rooms. Electricity use for fans decreased by nearly 30 percent, and teachers reported fewer complaints about heat fatigue. However, top-floor rooms still needed extra cooling during periods of peak heat.

The project demonstrated that low-cost structural modifications can significantly lower indoor heat without relying heavily on mechanical cooling. Although high humidity occasionally limited evaporation, the school board approved expanding reflective roofing to all remaining blocks. Students will combine seasonal measurements with student comfort reports before selecting measures for the remaining renovations. The case shows that local adaptation actions can deliver immediate comfort while supporting long-term climate targets.`
};
const passage2: QuestionStimulus = {
  id: 'eng11-stim-u5-reading-2', title: 'Building a fair town emissions baseline',
  content: `A medium-sized town wanted to measure whether its climate plan was reducing greenhouse gas emissions. Officials combined electricity bills, fuel sales, traffic counts and household surveys to create a baseline. Each source had limitations: bills did not separate every activity, sales records included visitors, and surveys depended on honest memories. The town therefore published an emissions range instead of claiming one perfectly precise figure.

Travel research revealed another problem. Residents in outer neighbourhoods made more car journeys, but many lacked practical low-carbon alternatives because buses stopped early and safe cycling paths did not reach their streets. The council added evening buses on two routes and connected one residential area to the town centre with a protected cycling corridor. It also recorded use by time, age group and neighbourhood.

After six months, transport emissions appeared slightly lower. Analysts warned that this period was too short to establish a lasting trend because weather, fuel prices and school holidays could temporarily change travel. They recommended comparing at least two complete years with the original baseline and reporting uncertainty beside every estimate.

The next review will examine both total emissions and fairness. A policy cannot be called successful if new options are available only to central neighbourhoods or people who already cycle. The town will ask whether residents in different areas can use the new services safely, affordably and at useful times. Local disability groups also tested stops and timetables during the trial. Publishing methods, limitations and access data should help the public judge progress without exaggeration.`
};
const passage3: QuestionStimulus = {
  id: 'eng11-stim-u5-reading-3', title: 'Restoring a wetland with the community',
  content: `A farming district planned to restore a drained wetland that once stored floodwater and supported wildlife. Rather than redesigning the whole landscape immediately, the project team began with a small area. This allowed researchers to monitor flooding risks, test water-control structures and adjust the design before expanding work near homes and fields.

Residents contributed knowledge that did not appear on recent maps. Older farmers identified former water paths, while livestock owners marked crossings that cattle still needed to use. The team kept several access routes open and agreed on compensation rules before raising water levels. These decisions reduced conflict and protected livelihoods during the trial.

Within one season, native plants returned, water remained longer after storms and several bird species were recorded. Researchers refused to announce a carbon success after only these early observations. Carbon exchange in a wetland varies across seasons as water levels, plant growth and soil conditions change. Reliable conclusions require repeated measurements over several years, including unusually wet and dry periods.

The pilot showed that ecological recovery cannot be judged by planting or one attractive photograph alone. Expansion should integrate habitat goals, local livelihoods, land and water rights, and long-term monitoring. Community representatives will review the results each year with scientists and local authorities. If flooding, access or income problems emerge, the design will be changed before more land is included. Independent reviewers will publicly publish both ecological gains and unresolved community concerns after each annual meeting. This slower process makes the restoration more credible and fair.`
};

const reading: Raw[] = [
  {
    p: 'What is the main purpose of the classroom passage?',
    c: 'To show how a school tested combined cooling measures before wider renovation',
    w: ['To advertise one air-conditioner brand', 'To prove trees cool every room immediately', 'To reject temperature measurements'],
    stimulus: passage1,
    translation: {
      content: 'Mục đích chính của đoạn văn về lớp học là gì?',
      options: ['A. To show how a school tested combined cooling measures before wider renovation (Chỉ ra cách trường học thử nghiệm các biện pháp làm mát kết hợp trước khi cải tạo diện rộng)', 'B. Để quảng cáo một thương hiệu điều hòa', 'C. Để chứng minh cây xanh làm mát mọi phòng ngay lập tức', 'D. Để bác bỏ các đo lường nhiệt độ']
    }
  },
  {
    p: 'Why did the school examine electricity use?',
    c: 'Cooling choices could increase energy demand and emissions.',
    w: ['Electricity has no relation to cooling.', 'Students requested new lights.', 'The roof generated unlimited power.'],
    stimulus: passage1,
    translation: {
      content: 'Tại sao nhà trường lại kiểm tra việc sử dụng điện?',
      options: ['A. Điện không liên quan đến làm mát', 'B. Cooling choices could increase energy demand and emissions. (Các lựa chọn làm mát có thể làm tăng nhu cầu năng lượng và lượng khí thải.)', 'C. Học sinh yêu cầu đèn mới', 'D. Mái nhà tạo ra năng lượng vô hạn']
    }
  },
  {
    p: 'What limitation remained in the pilot rooms?',
    c: 'Top-floor rooms still needed extra cooling at peak heat.',
    w: ['All fans failed permanently.', 'No temperatures were recorded.', 'Trees damaged the foundations.'],
    stimulus: passage1,
    translation: {
      content: 'Hạn chế nào vẫn còn ở các phòng học thử nghiệm?',
      options: ['A. Tất cả quạt hỏng vĩnh viễn', 'B. Không có nhiệt độ nào được ghi lại', 'C. Top-floor rooms still needed extra cooling at peak heat. (Các phòng ở tầng trên cùng vẫn cần làm mát thêm vào lúc đỉnh điểm cái nóng.)', 'D. Cây cối làm hỏng móng nhà']
    }
  },
  {
    p: 'Which evidence will guide the remaining renovations?',
    c: 'Seasonal measurements combined with student comfort reports',
    w: ['One afternoon observation', 'The colour of equipment', 'A guaranteed average without room differences'],
    stimulus: passage1,
    translation: {
      content: 'Bằng chứng nào sẽ hướng dẫn các đợt cải tạo còn lại?',
      options: ['A. Một quan sát buổi chiều', 'B. Màu sắc thiết bị', 'C. Một mức trung bình đảm bảo không có sự khác biệt giữa các phòng', 'D. Seasonal measurements combined with student comfort reports (Đo lường theo mùa kết hợp với báo cáo sự thoải mái của học sinh)']
    }
  },
  {
    p: 'Why did the town publish an emissions range?',
    c: 'Every measurement source had limitations.',
    w: ['It collected no information.', 'Ranges always look smaller.', 'Officials wanted to hide methods.'],
    stimulus: passage2,
    translation: {
      content: 'Tại sao thị trấn lại công bố một khoảng lượng khí thải?',
      options: ['A. Every measurement source had limitations. (Mỗi nguồn đo lường đều có những hạn chế.)', 'B. Nó không thu thập thông tin nào', 'C. Các khoảng trông luôn nhỏ hơn', 'D. Các quan chức muốn giấu phương pháp']
    }
  },
  {
    p: 'What did the travel research reveal?',
    c: 'Many residents lacked practical low-carbon alternatives.',
    w: ['Every resident owned a bicycle.', 'All journeys were long flights.', 'Buses already reached every street.'],
    stimulus: passage2,
    translation: {
      content: 'Nghiên cứu về việc di chuyển đã tiết lộ điều gì?',
      options: ['A. Mọi cư dân đều sở hữu xe đạp', 'B. Many residents lacked practical low-carbon alternatives. (Nhiều cư dân thiếu các giải pháp thay thế phát thải thấp thực tế.)', 'C. Mọi chuyến đi đều là chuyến bay dài', 'D. Xe buýt đã vươn tới mọi con phố']
    }
  },
  {
    p: 'Why was six months insufficient?',
    c: 'It was too short to establish a lasting emissions trend.',
    w: ['No buses were introduced.', 'Fuel cannot be measured.', 'A baseline never supports comparison.'],
    stimulus: passage2,
    translation: {
      content: 'Tại sao 6 tháng lại không đủ?',
      options: ['A. Không có xe buýt nào được đưa vào', 'B. Nhiên liệu không thể đo lường', 'C. It was too short to establish a lasting emissions trend. (Nó quá ngắn để thiết lập một xu hướng khí thải bền vững.)', 'D. Mức cơ sở không bao giờ hỗ trợ so sánh']
    }
  },
  {
    p: 'What fairness question shapes the next review?',
    c: 'Whether people in different neighbourhoods can use the new options',
    w: ['Whether every bus has the same colour', 'Whether reports use short titles', 'Whether roads avoid all data'],
    stimulus: passage2,
    translation: {
      content: 'Câu hỏi về sự công bằng nào sẽ định hình đợt đánh giá tiếp theo?',
      options: ['A. Xe buýt có cùng màu không', 'B. Báo cáo có dùng tiêu đề ngắn không', 'C. Đường xá có tránh mọi dữ liệu không', 'D. Whether people in different neighbourhoods can use the new options (Liệu mọi người ở các khu phố khác nhau có thể sử dụng các tùy chọn mới hay không)']
    }
  },
  {
    p: 'Why did the wetland group begin with a small area?',
    c: 'To monitor risks and adjust the design before expansion',
    w: ['To avoid community knowledge', 'To remove every channel immediately', 'To guarantee results in one day'],
    stimulus: passage3,
    translation: {
      content: 'Tại sao nhóm phục hồi đất ngập nước lại bắt đầu với một diện tích nhỏ?',
      options: ['A. To monitor risks and adjust the design before expansion (Đo lường rủi ro và điều chỉnh thiết kế trước khi mở rộng)', 'B. Để tránh kiến thức cộng đồng', 'C. Để gỡ bỏ mọi kênh ngay lập tức', 'D. Để đảm bảo kết quả trong một ngày']
    }
  },
  {
    p: 'What did residents contribute to the wetland project?',
    c: 'Knowledge of old water paths and livestock crossings',
    w: ['A ban on all monitoring', 'Only satellite images', 'A promise that flooding was impossible'],
    stimulus: passage3,
    translation: {
      content: 'Cư dân đã đóng góp gì cho dự án đất ngập nước?',
      options: ['A. Lệnh cấm mọi sự theo dõi', 'B. Knowledge of old water paths and livestock crossings (Kiến thức về các dòng chảy cũ và chỗ gia súc băng qua)', 'C. Chỉ hình ảnh vệ tinh', 'D. Lời hứa rằng lũ lụt là không thể']
    }
  },
  {
    p: 'Why did researchers avoid judging carbon after one season?',
    c: 'Ecosystem carbon exchange varies over time.',
    w: ['Wetlands contain no carbon.', 'Birds determine every measurement.', 'Soil cannot be monitored.'],
    stimulus: passage3,
    translation: {
      content: 'Tại sao các nhà nghiên cứu tránh đánh giá carbon chỉ sau một mùa?',
      options: ['A. Đất ngập nước không chứa carbon', 'B. Chim chóc quyết định mọi đo lường', 'C. Ecosystem carbon exchange varies over time. (Sự trao đổi carbon của hệ sinh thái thay đổi theo thời gian.)', 'D. Đất không thể theo dõi']
    }
  },
  {
    p: 'Which conclusion best follows from passage 3?',
    c: 'Restoration should integrate ecology, livelihoods, rights and long-term monitoring.',
    w: ['Fast visible change is the only goal.', 'Local trust reduces scientific quality.', 'Planting alone guarantees every outcome.'],
    stimulus: passage3,
    translation: {
      content: 'Kết luận nào rút ra tốt nhất từ đoạn 3?',
      options: ['A. Thay đổi nhanh nhìn thấy được là mục tiêu duy nhất', 'B. Sự tin tưởng địa phương làm giảm chất lượng khoa học', 'C. Chỉ riêng việc trồng cây đảm bảo mọi kết quả', 'D. Restoration should integrate ecology, livelihoods, rights and long-term monitoring. (Sự phục hồi nên tích hợp sinh thái, sinh kế, quyền lợi và sự theo dõi lâu dài.)']
    }
  }
];

const writing: Raw[] = [
  {
    p: 'Choose the best order: (a) This raises flood risk. (b) Sea level is rising along the coast. (c) The town is restoring dunes and improving warnings.',
    c: 'b-a-c',
    w: ['a-c-b', 'c-b-a', 'b-c-a'],
    translation: {
      content: 'Chọn thứ tự tốt nhất: (a) Điều này làm tăng rủi ro lũ lụt. (b) Mực nước biển đang dâng dọc theo bờ biển. (c) Thị trấn đang phục hồi các cồn cát và cải thiện cảnh báo.',
      options: ['A. b-a-c', 'B. a-c-b', 'C. c-b-a', 'D. b-c-a']
    }
  },
  {
    p: 'Which sentence is the clearest problem statement for a climate paragraph?',
    c: 'Summer heat is increasing health risks for older residents in the district.',
    w: ['Climate is a word.', 'Everything is terrible everywhere.', 'Residents exist.'],
    translation: {
      content: 'Câu nào là tuyên bố vấn đề rõ ràng nhất cho đoạn văn về khí hậu?',
      options: ['A. Khí hậu là một từ.', 'B. Summer heat is increasing health risks for older residents in the district. (Cái nóng mùa hè đang làm tăng các rủi ro sức khỏe cho người lớn tuổi trong quận.)', 'C. Mọi thứ đều tồi tệ ở khắp nơi.', 'D. Cư dân tồn tại.']
    }
  },
  {
    p: 'Choose the logical connector: “The bus network is limited. ______, many commuters still depend on private vehicles.”',
    c: 'As a result',
    w: ['In contrast to no cause', 'For example of a definition', 'Before that means purpose'],
    translation: {
      content: 'Chọn từ nối lô-gíc: “Mạng lưới xe buýt bị hạn chế. ______, nhiều người đi làm vẫn phụ thuộc vào xe cá nhân.”',
      options: ['A. Tương phản', 'B. Ví dụ', 'C. As a result (Kết quả là)', 'D. Trước đó']
    }
  },
  {
    p: 'A: “What should follow evidence of hotter nights?” B: “______”',
    c: 'An explanation of impacts and a feasible response',
    w: ['An unrelated slogan', 'A new topic without a link', 'A claim that evidence is unnecessary'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Điều gì nên nối tiếp bằng chứng về các đêm nóng hơn?” B: “______”',
      options: ['A. Một khẩu hiệu không liên quan', 'B. Một chủ đề mới không có liên kết', 'C. Tuyên bố rằng bằng chứng là không cần thiết', 'D. An explanation of impacts and a feasible response (Lời giải thích về tác động và phản ứng khả thi)']
    }
  },
  {
    p: 'Which sentence uses evidence with suitable caution?',
    c: 'The five-year record suggests that hot nights are becoming more frequent.',
    w: ['One night proves permanent change.', 'The record guarantees every future temperature.', 'No uncertainty can exist.'],
    translation: {
      content: 'Câu nào sử dụng bằng chứng với sự thận trọng phù hợp?',
      options: ['A. The five-year record suggests that hot nights are becoming more frequent. (Bản ghi 5 năm cho thấy các đêm nóng đang trở nên thường xuyên hơn.)', 'B. Một đêm chứng minh sự thay đổi vĩnh viễn', 'C. Bản ghi đảm bảo mọi nhiệt độ tương lai', 'D. Không thể có sự không chắc chắn']
    }
  },
  {
    p: 'Which detail is least relevant in a proposal for cooler classrooms?',
    c: 'The designer’s favourite song',
    w: ['Indoor temperature data', 'Electricity demand', 'Maintenance responsibilities'],
    translation: {
      content: 'Chi tiết nào ít liên quan nhất trong đề xuất cho các lớp học mát mẻ hơn?',
      options: ['A. Dữ liệu nhiệt độ trong nhà', 'B. The designer’s favourite song (Bài hát yêu thích của nhà thiết kế - Không liên quan)', 'C. Nhu cầu điện', 'D. Trách nhiệm bảo trì']
    }
  },
  {
    p: 'Select the clearest participle-clause revision.',
    c: 'Using efficient lights, the school reduced electricity demand.',
    w: ['Used efficient lights, demand reduced school.', 'Using efficient lights, electricity was happy.', 'To used lights, school reducing.'],
    translation: {
      content: 'Chọn bản sửa đổi mệnh đề phân từ rõ ràng nhất:',
      options: ['A. Sai cấu trúc', 'B. Sai cấu trúc', 'C. Using efficient lights, the school reduced electricity demand. (Sử dụng đèn hiệu quả, nhà trường đã giảm nhu cầu dùng điện.)', 'D. Sai cấu trúc']
    }
  },
  {
    p: 'A: “How can I avoid a dangling clause?” B: “______”',
    c: 'Make sure the participle clause and main clause share a logical subject.',
    w: ['Always start with V3.', 'Delete the main subject.', 'Use any V-ing phrase.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Làm thế nào tớ có thể tránh mệnh đề phân từ treo?” B: “______”',
      options: ['A. Luôn bắt đầu bằng V3', 'B. Xóa chủ ngữ chính', 'C. Sử dụng bất kỳ cụm V-ing nào', 'D. Make sure the participle clause and main clause share a logical subject. (Đảm bảo mệnh đề phân từ và mệnh đề chính chung một chủ ngữ logic.)']
    }
  },
  {
    p: 'Choose the best topic sentence for a paragraph about buses, cycling paths and compact development.',
    c: 'Cities can reduce transport emissions through coordinated planning.',
    w: ['Buses have wheels.', 'Development has letters.', 'Every city is identical.'],
    translation: {
      content: 'Chọn câu chủ đề tốt nhất cho đoạn văn về xe buýt, đường cho xe đạp và phát triển nhỏ gọn:',
      options: ['A. Cities can reduce transport emissions through coordinated planning. (Các thành phố có thể giảm khí thải giao thông thông qua quy hoạch phối hợp.)', 'B. Xe buýt có bánh xe.', 'C. Phát triển có các chữ cái.', 'D. Mọi thành phố đều giống hệt nhau.']
    }
  },
  {
    p: 'Which Unit 5 revision reports the pilot without overclaiming?',
    c: 'The pilot may reduce peak electricity use if equipment is maintained.',
    w: ['The pilot solves climate change forever.', 'Maintenance never matters.', 'One result guarantees every building.'],
    translation: {
      content: 'Bản sửa đổi Chuyên đề 5 nào báo cáo đợt thử nghiệm mà không tuyên bố quá lời?',
      options: ['A. Đợt thử nghiệm giải quyết biến đổi khí hậu mãi mãi', 'B. The pilot may reduce peak electricity use if equipment is maintained. (Đợt thử nghiệm có thể giảm sử dụng điện lúc cao điểm nếu thiết bị được bảo trì.)', 'C. Bảo trì không bao giờ quan trọng', 'D. Một kết quả đảm bảo cho mọi tòa nhà']
    }
  },
  {
    p: 'Choose the clearest cause–effect combination.',
    c: 'Because dark roofs absorb heat, indoor temperatures can rise.',
    w: ['Dark roofs although temperature because.', 'Heat absorbs roofs therefore no link.', 'Indoor temperatures roof.'],
    translation: {
      content: 'Chọn câu kết hợp nguyên nhân–kết quả rõ ràng nhất:',
      options: ['A. Vô nghĩa', 'B. Vô nghĩa', 'C. Because dark roofs absorb heat, indoor temperatures can rise. (Bởi vì mái nhà tối màu hấp thụ nhiệt, nhiệt độ trong nhà có thể tăng lên.)', 'D. Vô nghĩa']
    }
  },
  {
    p: 'Which final sentence best closes a balanced climate proposal?',
    c: 'Annual monitoring will show whether the measures cut emissions without reducing access.',
    w: ['The proposal has twelve lines.', 'Climate is important.', 'Success is already guaranteed.'],
    translation: {
      content: 'Câu kết thúc nào khép lại tốt nhất một đề xuất về khí hậu cân bằng?',
      options: ['A. Đề xuất có 12 dòng', 'B. Khí hậu là quan trọng', 'C. Thành công đã được đảm bảo', 'D. Annual monitoring will show whether the measures cut emissions without reducing access. (Sự theo dõi hằng năm sẽ chỉ ra liệu các biện pháp có cắt giảm khí thải mà không làm giảm khả năng tiếp cận hay không.)']
    }
  }
];

const communication: Raw[] = [
  {
    p: 'Which sentence makes a constructive climate suggestion?',
    c: 'We could test a weekly car-free zone near the school.',
    w: ['Cars are bad and discussion is over.', 'Do nothing forever.', 'Everyone must agree immediately.'],
    translation: {
      content: 'Câu nào đưa ra gợi ý về khí hậu mang tính xây dựng?',
      options: ['A. We could test a weekly car-free zone near the school. (Chúng ta có thể thử nghiệm khu vực không ô tô hằng tuần gần trường học.)', 'B. Ô tô là xấu và cuộc thảo luận kết thúc.', 'C. Không làm gì mãi mãi.', 'D. Mọi người phải đồng ý ngay lập tức.']
    }
  },
  {
    p: 'A: “Let’s install solar panels.” B: “______”',
    c: 'That could help. Could we compare cost, roof condition and expected output?',
    w: ['Evidence is irrelevant.', 'Solar means sunny.', 'No questions are allowed.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Hãy lắp đặt các tấm pin mặt trời.” B: “______”',
      options: ['A. Bằng chứng là không liên quan', 'B. That could help. Could we compare cost, roof condition and expected output? (Điều đó có thể giúp ích. Chúng ta có thể so sánh chi phí, tình trạng mái nhà và sản lượng dự kiến không?)', 'C. Mặt trời nghĩa là có nắng', 'D. Không câu hỏi nào được cho phép']
    }
  },
  {
    p: 'Which question asks for evidence?',
    c: 'What data supports the estimated emissions reduction?',
    w: ['Is the poster green?', 'Who chose the font?', 'Does the title rhyme?'],
    translation: {
      content: 'Câu hỏi nào yêu cầu bằng chứng?',
      options: ['A. Áp phích có màu xanh không?', 'B. Ai đã chọn phông chữ?', 'C. What data supports the estimated emissions reduction? (Dữ liệu nào ủng hộ mức giảm khí thải ước tính?)', 'D. Tiêu đề có vần không?']
    }
  },
  {
    p: 'A: “This is the cheapest option.” B: “______”',
    c: 'How effective is it, and who might bear additional costs?',
    w: ['Cheapest always means fairest.', 'No other criteria exist.', 'Cost has no meaning.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Đây là lựa chọn rẻ nhất.” B: “______”',
      options: ['A. Rẻ nhất luôn có nghĩa là công bằng nhất', 'B. Không có tiêu chí nào khác tồn tại', 'C. Chi phí không có nghĩa', 'D. How effective is it, and who might bear additional costs? (Nó hiệu quả như thế nào, và ai có thể gánh chịu các chi phí bổ sung?)']
    }
  },
  {
    p: 'Which response appropriately agrees with a condition?',
    c: 'I support the trial provided that its safety and access are monitored.',
    w: ['I agree without knowing the plan.', 'Monitoring must stop.', 'Safety is unrelated.'],
    translation: {
      content: 'Phản hồi nào đồng ý đi kèm với một điều kiện một cách phù hợp?',
      options: ['A. I support the trial provided that its safety and access are monitored. (Tớ ủng hộ đợt thử nghiệm với điều kiện sự an toàn và khả năng tiếp cận của nó được theo dõi.)', 'B. Tớ đồng ý mà không cần biết kế hoạch', 'C. Việc theo dõi phải dừng lại', 'D. An toàn là không liên quan']
    }
  },
  {
    p: 'A: “Individual choices are useless.” B: “______”',
    c: 'They can contribute, especially when infrastructure and policy make them practical.',
    w: ['Only individuals control power grids.', 'Systems never matter.', 'Both levels must be ignored.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Các lựa chọn cá nhân là vô ích.” B: “______”',
      options: ['A. Chỉ cá nhân mới kiểm soát lưới điện', 'B. They can contribute, especially when infrastructure and policy make them practical. (Chúng có thể đóng góp, đặc biệt khi cơ sở hạ tầng và chính sách làm cho chúng trở nên thực tế.)', 'C. Các hệ thống không bao giờ quan trọng', 'D. Cả hai cấp độ phải bị lờ đi']
    }
  },
  {
    p: 'Which criterion best measures feasibility?',
    c: 'Available resources, time and implementation capacity',
    w: ['Poster brightness only', 'Number of slogans', 'Length of the project name'],
    translation: {
      content: 'Tiêu chí nào đo lường tính khả thi tốt nhất?',
      options: ['A. Chỉ độ sáng áp phích', 'B. Số lượng khẩu hiệu', 'C. Available resources, time and implementation capacity (Các nguồn lực có sẵn, thời gian và năng lực thực thi)', 'D. Độ dài tên dự án']
    }
  },
  {
    p: 'A: “Should every household pay the same fee?” B: “______”',
    c: 'We should consider income and who receives the benefits.',
    w: ['Fairness means ignoring ability to pay.', 'All impacts are identical.', 'Benefits cannot be studied.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Có phải mọi hộ gia đình nên trả cùng một mức phí không?” B: “______”',
      options: ['A. Công bằng có nghĩa là lờ đi khả năng chi trả', 'B. Mọi tác động đều giống hệt nhau', 'C. Lợi ích không thể nghiên cứu', 'D. We should consider income and who receives the benefits. (Chúng ta nên xem xét thu nhập và ai là người nhận được lợi ích.)']
    }
  },
  {
    p: 'Which statement distinguishes mitigation from adaptation?',
    c: 'Mitigation cuts drivers of warming; adaptation reduces harm from impacts.',
    w: ['Both mean recording weather.', 'Adaptation always increases emissions.', 'Mitigation is only emergency relief.'],
    translation: {
      content: 'Phát biểu nào phân biệt giữa giảm nhẹ (mitigation) và thích ứng (adaptation)?',
      options: ['A. Mitigation cuts drivers of warming; adaptation reduces harm from impacts. (Giảm nhẹ cắt giảm các yếu tố gây ấm lên; thích ứng giảm thiểu tác hại từ các tác động.)', 'B. Cả hai đều có nghĩa là ghi chép thời tiết', 'C. Thích ứng luôn làm tăng khí thải', 'D. Giảm nhẹ chỉ là cứu trợ khẩn cấp']
    }
  },
  {
    p: 'A: “The pilot worked in one street, so it will work everywhere.” B: “______”',
    c: 'We need to check whether conditions are comparable before scaling it.',
    w: ['One case guarantees all results.', 'Context never matters.', 'Pilots need no evaluation.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Đợt thử nghiệm đã hoạt động trên một con phố, vì vậy nó sẽ hoạt động ở khắp mọi nơi.” B: “______”',
      options: ['A. Một trường hợp đảm bảo tất cả kết quả', 'B. We need to check whether conditions are comparable before scaling it. (Chúng ta cần kiểm tra xem các điều kiện có thể so sánh được không trước khi mở rộng mô hình.)', 'C. Bối cảnh không bao giờ quan trọng', 'D. Các đợt thử nghiệm không cần đánh giá']
    }
  },
  {
    p: 'Which response identifies a trade-off?',
    c: 'The dam may provide low-carbon power but could disrupt habitats and livelihoods.',
    w: ['Every benefit has zero cost.', 'Energy projects affect nothing.', 'Trade-offs are only grammar.'],
    translation: {
      content: 'Phản hồi nào xác định một sự đánh đổi (trade-off)?',
      options: ['A. Mọi lợi ích đều có chi phí bằng không', 'B. Các dự án năng lượng không ảnh hưởng đến điều gì', 'C. The dam may provide low-carbon power but could disrupt habitats and livelihoods. (Đập nước có thể cung cấp năng lượng carbon thấp nhưng có thể làm gián đoạn môi trường sống và sinh kế.)', 'D. Sự đánh đổi chỉ là ngữ pháp']
    }
  },
  {
    p: 'A: “How should we choose between the options?” B: “______”',
    c: 'Let’s compare emissions, resilience, cost, access and unintended effects.',
    w: ['Choose the shortest name.', 'Use one criterion secretly.', 'Assume all options are equal.'],
    representation: 'dialogue',
    translation: {
      content: 'A: “Chúng ta nên lựa chọn giữa các phương án như thế nào?” B: “______”',
      options: ['A. Chọn tên ngắn nhất', 'B. Sử dụng một tiêu chí một cách bí mật', 'C. Cho rằng tất cả các tùy chọn đều bình đẳng', 'D. Let’s compare emissions, resilience, cost, access and unintended effects. (Hãy so sánh lượng khí thải, khả năng phục hồi, chi phí, khả năng tiếp cận và các tác động ngoài dự kiến.)']
    }
  }
];

export const g11EnglishModule5Questions: CourseQuestion[] = [
  ...build('pronunciation', 'language', pronunciation, ['content-stress', 'contrastive-stress']),
  ...build('vocabulary', 'language', vocabulary, ['meaning-word-form', 'climate-collocation']),
  ...build('grammar', 'language', grammar, ['present-participle', 'past-participle']),
  ...build('reading', 'reading', reading, ['main-detail', 'infer-evidence']),
  ...build('writing', 'writing', writing, ['order-cohesion', 'transform-evidence']),
  ...build('communication', 'communication-culture', communication, ['suggest-respond', 'evidence-tradeoff'])
];
