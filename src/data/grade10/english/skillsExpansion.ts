import type { Question, QuestionType, Solution } from '@/types';

type Difficulty = Question['difficulty'];
type ChoiceLetter = 'A' | 'B' | 'C' | 'D';

interface ChoiceSpec {
  prompt: string;
  options: [string, string, string, string];
  answer: ChoiceLetter;
  difficulty: Difficulty;
  explanation: string;
  translation?: {
    content: string;
    options?: string[];
  };
}

interface OpenTaskSpec {
  prompt: string;
  difficulty: Difficulty;
  model: string;
  minimumWords?: number;
}

interface EnglishSkillUnitSpec {
  unit: number;
  topicId: string;
  theme: string;
  readingTitle: string;
  readingPassage: string;
  readingQuestions: ChoiceSpec[];
  listeningTitle: string;
  listeningScript: string;
  listeningScriptTranslation?: string;
  listeningQuestions: ChoiceSpec[];
  writingTasks: OpenTaskSpec[];
  speakingTasks: OpenTaskSpec[];
  communicationQuestions: ChoiceSpec[];
}

const letters: ChoiceLetter[] = ['A', 'B', 'C', 'D'];
const listeningExtensionTopicId = 'eng10-listening-extension';

const readingSubtypeIds = ['gist', 'detail', 'vocabulary', 'reference', 'inference'];
const listeningSubtypeIds = ['gist', 'detail', 'detail', 'inference'];
const writingSubtypeIds = ['controlled', 'guided', 'extended'];
const speakingSubtypeIds = ['individual', 'interaction', 'presentation'];

const unitSpecs: EnglishSkillUnitSpec[] = [
  {
    unit: 1,
    topicId: 'eng10-t1',
    theme: 'Family Life',
    readingTitle: 'A fairer way to share housework',
    readingPassage: `When the Tran family moved to a new apartment, they decided to change the way they shared household chores. Previously, Mrs Tran did most of the cooking and cleaning, while her husband mainly earned money. Their two teenage children only helped when they were asked. The arrangement often made Mrs Tran tired and created arguments at weekends. The family therefore held a short meeting and listed every regular task. Each person chose jobs that matched both ability and available time. Mr Tran now prepares breakfast and shops for groceries. Their son takes out the rubbish and cleans the floors, while their daughter does the washing-up and cares for the plants. Tasks rotate every month so that nobody is permanently given an unpleasant job. After six weeks, the apartment is not always perfect, but the family members feel calmer and more responsible. More importantly, the children have learned that housework is not help offered to one person; it is a shared duty that keeps the whole family comfortable.`,
    readingQuestions: [
      {
        prompt: 'What is the passage mainly about?',
        options: ['Moving to a larger apartment', 'A family creating a fair system for chores', 'Children refusing to do housework', 'Ways to clean an apartment quickly'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'Every paragraph describes why and how the family changed its chore system.',
        translation: {
          content: 'Đoạn văn chủ yếu nói về nội dung gì?',
          options: [
            'A. Chuyển đến một căn hộ lớn hơn',
            'B. Một gia đình xây dựng hệ thống phân chia việc nhà công bằng',
            'C. Trẻ em từ chối làm việc nhà',
            'D. Các cách dọn dẹp căn hộ nhanh chóng'
          ]
        }
      },
      {
        prompt: 'Why did the family hold a meeting?',
        options: ['Mrs Tran wanted to buy new plants', 'The children needed more pocket money', 'The old arrangement caused tiredness and arguments', 'Mr Tran wanted to stop shopping'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'The passage directly links the meeting to Mrs Tran’s tiredness and weekend arguments.',
        translation: {
          content: 'Tại sao gia đình lại tổ chức một cuộc họp?',
          options: [
            'A. Bà Trân muốn mua thêm cây cảnh mới',
            'B. Các con cần thêm tiền tiêu vặt',
            'C. Việc phân công cũ gây ra sự mệt mỏi và tranh cãi vào cuối tuần',
            'D. Ông Trân muốn ngừng việc đi chợ'
          ]
        }
      },
      {
        prompt: 'The word “rotate” is closest in meaning to __________.',
        options: ['change regularly', 'finish immediately', 'become easier', 'remain fixed'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'The jobs change every month instead of remaining with one person.',
        translation: {
          content: 'Từ “rotate” (luân phiên) gần nghĩa nhất với cụm từ nào sau đây?',
          options: [
            'A. change regularly (thay đổi định kỳ/thường xuyên)',
            'B. finish immediately (hoàn thành ngay lập tức)',
            'C. become easier (trở nên dễ dàng hơn)',
            'D. remain fixed (giữ nguyên cố định)'
          ]
        }
      },
      {
        prompt: 'In the final sentence, “it” refers to __________.',
        options: ['help', 'one person', 'housework', 'the family'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The singular pronoun points back to housework: housework is a shared duty.',
        translation: {
          content: 'Trong câu cuối cùng, từ “it” thay thế cho từ nào?',
          options: [
            'A. help (sự giúp đỡ)',
            'B. one person (một người)',
            'C. housework (việc nhà)',
            'D. the family (gia đình)'
          ]
        }
      },
      {
        prompt: 'What can be inferred about the new system?',
        options: ['It makes the apartment perfect every day', 'It teaches responsibility as well as reducing conflict', 'It gives the children no free time', 'It depends on Mrs Tran checking every task'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The family is calmer and the children become more responsible, although the home is not perfect.',
        translation: {
          content: 'Có thể suy ra điều gì về hệ thống phân công mới của gia đình?',
          options: [
            'A. Nó giúp căn hộ luôn hoàn hảo mỗi ngày',
            'B. Nó rèn luyện tinh thần trách nhiệm cũng như giảm thiểu mâu thuẫn',
            'C. Nó khiến các con không có thời gian rảnh',
            'D. Nó phụ thuộc vào việc bà Trân kiểm tra từng công việc'
          ]
        }
      }
    ],
    listeningTitle: 'Planning chores before a busy weekend',
    listeningScript: `Mai and her brother Nam are planning the weekend because their parents will visit their grandparents on Saturday. Mai suggests cleaning everything on Friday evening, but Nam has basketball practice until seven. They agree that Mai will wash the dishes and organise the living room after school. Nam will clean the floor when he returns. On Saturday morning, he will also buy vegetables at the local market, while Mai prepares lunch. Nam first complains that he has more jobs, so Mai reminds him that she is also helping their younger sister with homework. In the end, they decide to write the tasks on a note and put it on the fridge. They both think the plan will prevent arguments and allow them to finish before their parents come home.`,
    listeningScriptTranslation: `Mai và em trai Nam đang lên kế hoạch cho cuối tuần vì bố mẹ sẽ đi thăm ông bà vào thứ Bảy. Mai gợi ý dọn dẹp mọi thứ vào tối thứ Sáu, nhưng Nam có buổi tập bóng rổ đến 7 giờ. Họ đồng ý Mai sẽ rửa bát và dọn dẹp phòng khách sau khi đi học về. Nam sẽ lau nhà khi về. Vào sáng thứ Bảy, Nam cũng sẽ đi chợ địa phương mua rau, trong khi Mai chuẩn bị bữa trưa. Ban đầu Nam phàn nàn rằng mình có nhiều việc hơn, nên Mai nhắc Nam nhớ rằng bạn ấy cũng đang giúp em gái làm bài tập về nhà. Cuối cùng, họ quyết định viết các công việc lên một tờ giấy ghi chú và dán lên tủ lạnh. Cả hai đều nghĩ kế hoạch này sẽ ngăn chặn các cuộc tranh cãi và giúp họ hoàn thành công việc trước khi bố mẹ về nhà.`,
    listeningQuestions: [
      {
        prompt: 'What are Mai and Nam mainly doing?',
        options: ['Preparing for a basketball match', 'Planning how to share weekend tasks', 'Choosing food for their grandparents', 'Discussing their younger sister’s school'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The whole conversation is about assigning weekend chores.',
        translation: {
          content: 'Mai và Nam chủ yếu đang làm gì?',
          options: [
            'A. Chuẩn bị cho một trận đấu bóng rổ',
            'B. Lập kế hoạch phân chia công việc cuối tuần',
            'C. Chọn thức ăn cho ông bà',
            'D. Thảo luận về việc học của em gái'
          ]
        }
      },
      {
        prompt: 'Why can Nam not clean on Friday immediately after school?',
        options: ['He visits his grandparents', 'He has basketball practice', 'He must cook lunch', 'He helps his sister'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Nam has practice until seven.',
        translation: {
          content: 'Tại sao Nam không thể dọn dẹp vào thứ Sáu ngay sau khi tan học?',
          options: [
            'A. Bạn ấy đi thăm ông bà',
            'B. Bạn ấy có buổi tập bóng rổ',
            'C. Bạn ấy phải nấu bữa trưa',
            'D. Bạn ấy giúp em gái'
          ]
        }
      },
      {
        prompt: 'What will Mai do on Saturday morning?',
        options: ['Buy vegetables', 'Clean the floor', 'Prepare lunch', 'Write a shopping list'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'Nam buys vegetables while Mai prepares lunch.',
        translation: {
          content: 'Mai sẽ làm gì vào sáng thứ Bảy?',
          options: [
            'A. Đi mua rau',
            'B. Lau nhà',
            'C. Chuẩn bị bữa trưa',
            'D. Viết danh sách mua sắm'
          ]
        }
      },
      {
        prompt: 'Why do they put the plan on the fridge?',
        options: ['To show it to their coach', 'To remember the division and avoid conflict', 'To ask their parents for money', 'To teach their sister to cook'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The note makes responsibilities clear and helps prevent arguments.',
        translation: {
          content: 'Tại sao họ lại dán bản kế hoạch lên tủ lạnh?',
          options: [
            'A. Để cho huấn luyện viên xem',
            'B. Để ghi nhớ sự phân công và tránh tranh cãi',
            'C. Để xin tiền bố mẹ',
            'D. Để dạy em gái nấu ăn'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words describing three household tasks you usually do and when you do them.', difficulty: 'easy', minimumWords: 60, model: 'I help my family with three regular chores. Every morning, I make my bed and water the plants before school. After dinner, I usually wash the dishes with my younger brother. At weekends, I clean my room and organise my books. These tasks do not take much time, but they make our home more comfortable and teach me to be responsible.' },
      { prompt: 'Write 90–120 words suggesting a fair weekly chore plan for a family of four. Give at least two reasons.', difficulty: 'medium', minimumWords: 90, model: 'A fair plan should match each person’s time and ability. The parents can take turns cooking because they return home at different times. The older child can shop for groceries and clean the floor, while the younger child can set the table and water the plants. Jobs should rotate at weekends so nobody is stuck with the same unpleasant task. This plan is fair because everyone contributes, and it also teaches the children practical skills. A shared checklist on the fridge can help the family remember their responsibilities.' },
      { prompt: 'Write a 120–150-word opinion paragraph: “Teenagers should share housework equally with adults.”', difficulty: 'hard', minimumWords: 120, model: 'Teenagers should share housework with adults, although “equally” should refer to responsibility rather than identical tasks. First, doing chores teaches young people useful skills such as cooking, organising time and caring for shared spaces. Second, a fair division prevents one family member from becoming exhausted. Teenagers also learn that a comfortable home is created by cooperation, not by one person serving everyone else. However, adults should consider schoolwork, age and safety when assigning jobs. A teenager can wash dishes or prepare a simple meal, but should not be expected to handle every difficult task. In my view, each family should discuss its schedule and rotate suitable chores. This approach respects both the needs of teenagers and the effort of adults.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for about one minute about one household task you can do well. Explain the steps.', difficulty: 'easy', model: 'I can prepare a simple breakfast. First, I check what food is available. Then I make eggs and toast, cut some fruit and put everything on the table. Finally, I wash the cooking tools. I like this task because it helps my family start the day on time.' },
      { prompt: 'Role-play with a sibling: politely negotiate who will cook, wash the dishes and clean the floor this evening.', difficulty: 'medium', model: 'Could you cook tonight if I wash the dishes? I also have time to clean the floor after I finish my homework. That sounds fair. If cooking takes longer, I can help you prepare the vegetables.' },
      { prompt: 'Give a two-minute presentation proposing how schools can teach students responsibility through practical tasks.', difficulty: 'hard', model: 'Schools can organise rotating classroom duties, short service projects and basic life-skills workshops. Students should understand the purpose of each task and reflect on what they learned. The aim is not free labour; it is cooperation, planning and respect for shared spaces.' }
    ],
    communicationQuestions: [
      { prompt: 'Your sister says, “I have a test tomorrow, but it is my turn to wash the dishes.” What is the most supportive response?', options: ['That is not my problem.', 'I can do it tonight if you take my turn on Saturday.', 'You never do anything.', 'Just leave them there.'], answer: 'B', difficulty: 'easy', explanation: 'The response offers a fair exchange and acknowledges the sister’s situation.' },
      { prompt: 'Choose the most polite way to disagree about a chore plan.', options: ['Your plan is ridiculous.', 'No. I will not do that.', 'I see your point, but could we divide the tasks differently?', 'You are completely wrong.'], answer: 'C', difficulty: 'medium', explanation: 'It acknowledges the other view and proposes negotiation.' },
      { prompt: 'A family member has completed a difficult task. Which response best maintains cooperation?', options: ['You finally did something.', 'That was your duty anyway.', 'Thanks for handling that; it made the evening much easier.', 'Next time, do it faster.'], answer: 'C', difficulty: 'hard', explanation: 'Specific appreciation supports continued cooperation without sounding controlling.' }
    ]
  },
  {
    unit: 2,
    topicId: 'eng10-t2',
    theme: 'Humans and the Environment',
    readingTitle: 'A school measures its environmental impact',
    readingPassage: `Students at Green River High wanted to make their school more environmentally friendly, but they first needed evidence. For one week, teams measured electricity use, counted single-use plastic bottles and examined the rubbish produced at lunch. They discovered that empty classrooms often had lights and fans running. The canteen also sold nearly six hundred plastic bottles a week, although drinking-water stations were available. Instead of announcing a general campaign, the students proposed three measurable changes. Class monitors would check electrical equipment at the end of each lesson. Students could borrow reusable bottles from the library for a small deposit, and the canteen would offer a discount to anyone bringing a reusable container. After two months, electricity use had fallen by twelve percent and plastic waste by almost half. The project did not solve every environmental problem, but it showed why data matters. When people can see a clear problem, a practical action and a measurable result, they are more likely to change their habits permanently.`,
    readingQuestions: [
      {
        prompt: 'What is the main purpose of the passage?',
        options: ['To advertise a new school canteen', 'To show how evidence led to practical environmental action', 'To explain why libraries should sell bottles', 'To compare two different schools'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The project moves from measurement to targeted action and measurable results.',
        translation: {
          content: 'Mục đích chính của đoạn văn là gì?',
          options: [
            'A. Quảng cáo một nhà ăn trường học mới',
            'B. Cho thấy bằng chứng đã dẫn đến hành động bảo vệ môi trường thực tế như thế nào',
            'C. Giải thích tại sao thư viện nên bán chai lọ',
            'D. So sánh hai trường học khác nhau'
          ]
        }
      },
      {
        prompt: 'What problem was found in empty classrooms?',
        options: ['Windows were left open', 'Rubbish was not collected', 'Lights and fans were still operating', 'Students borrowed too many bottles'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'This detail appears in the third sentence.',
        translation: {
          content: 'Vấn đề gì đã được tìm thấy ở các phòng học trống?',
          options: [
            'A. Cửa sổ bị để mở',
            'B. Rác không được thu gom',
            'C. Đèn và quạt vẫn đang hoạt động',
            'D. Học sinh mượn quá nhiều chai lọ'
          ]
        }
      },
      {
        prompt: 'The word “deposit” most nearly means __________.',
        options: ['money temporarily paid and later returned', 'a permanent school tax', 'a discount on electricity', 'the price of library membership'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'A borrowing deposit is held to encourage return of the bottle.',
        translation: {
          content: 'Từ “deposit” (tiền đặt cọc) có nghĩa gần nhất với cụm từ nào?',
          options: [
            'A. tiền tạm trả và sau đó được hoàn lại',
            'B. một khoản thuế trường học cố định',
            'C. khoản giảm giá tiền điện',
            'D. giá của thẻ thư viện'
          ]
        }
      },
      {
        prompt: 'What does “it” in “it showed why data matters” refer to?',
        options: ['the canteen', 'the environmental problem', 'the project', 'the library'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The project showed the value of data.',
        translation: {
          content: 'Từ “it” trong câu “it showed why data matters” thay thế cho từ nào?',
          options: [
            'A. nhà ăn (the canteen)',
            'B. vấn đề môi trường (the environmental problem)',
            'C. dự án (the project)',
            'D. thư viện (the library)'
          ]
        }
      },
      {
        prompt: 'Which principle is best supported by the project?',
        options: ['Awareness alone always changes behaviour', 'Environmental plans work better when goals can be measured', 'Plastic should be completely banned immediately', 'Only students can reduce school waste'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The conclusion stresses clear problems, practical actions and measurable results.',
        translation: {
          content: 'Nguyên tắc nào được hỗ trợ tốt nhất bởi dự án này?',
          options: [
            'A. Chỉ nhận thức thôi là luôn thay đổi được hành vi',
            'B. Các kế hoạch môi trường hoạt động tốt hơn khi mục tiêu có thể đo lường được',
            'C. Nhựa nên bị cấm hoàn toàn ngay lập tức',
            'D. Chỉ học sinh mới có thể giảm rác thải trường học'
          ]
        }
      }
    ],
    listeningTitle: 'Choosing a greener class trip',
    listeningScript: `A teacher presents two options for the class trip. The first is a theme park sixty kilometres away. Tickets are cheap, but the class would need two buses and most food is sold in disposable packaging. The second option is a wetland education centre only twenty kilometres away. It costs slightly more, yet students can travel together on one bus, refill water bottles and join a wildlife survey. Some students initially prefer the theme park because it sounds more exciting. The teacher asks them to consider transport emissions, waste and what they will learn. After a short discussion, the class chooses the wetland centre. They also agree to bring reusable lunch boxes and collect data about birds rather than feed them. The teacher reminds everyone that a green trip should protect the place as well as entertain visitors.`,
    listeningScriptTranslation: `Giáo viên đưa ra hai lựa chọn cho chuyến đi dã ngoại của lớp. Lựa chọn đầu tiên là một công viên giải trí cách đó 60 km. Vé vào cổng rẻ, nhưng lớp sẽ cần hai xe buýt và hầu hết đồ ăn được bán trong bao bì dùng một lần. Lựa chọn thứ hai là trung tâm giáo dục đất ngập nước chỉ cách 20 km. Chi phí đắt hơn một chút, nhưng học sinh có thể đi cùng nhau trên một xe buýt, nạp lại nước vào bình cá nhân và tham gia khảo sát động vật hoang dã. Ban đầu một số học sinh thích công viên giải trí hơn vì nghe có vẻ thú vị hơn. Giáo viên yêu cầu các em xem xét lượng khí thải vận chuyển, rác thải và những gì các em sẽ học được. Sau một cuộc thảo luận ngắn, cả lớp chọn trung tâm đất ngập nước. Các em cũng đồng ý mang theo hộp cơm dùng nhiều lần và thu thập dữ liệu về các loài chim thay vì cho chúng ăn. Giáo viên nhắc nhở mọi người rằng một chuyến đi xanh nên bảo vệ điểm đến cũng như giải trí cho du khách.`,
    listeningQuestions: [
      {
        prompt: 'What decision is the class making?',
        options: ['How to build a wetland', 'Where to go on a class trip', 'Which birds to feed', 'How many teachers need tickets'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The teacher compares two destinations for the trip.',
        translation: {
          content: 'Cả lớp đang đưa ra quyết định gì?',
          options: [
            'A. Cách xây dựng một khu đất ngập nước',
            'B. Đi đâu trong chuyến dã ngoại của lớp',
            'C. Cho những loài chim nào ăn',
            'D. Có bao nhiêu giáo viên cần vé'
          ]
        }
      },
      {
        prompt: 'Why is the wetland centre greener in terms of transport?',
        options: ['It provides free bicycles', 'It is closer and needs only one bus', 'Students can walk there', 'The centre pays for fuel'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'It is twenty kilometres away and the class can use one bus.',
        translation: {
          content: 'Tại sao trung tâm đất ngập nước lại "xanh" hơn về mặt phương tiện di chuyển?',
          options: [
            'A. Trung tâm cung cấp xe đạp miễn phí',
            'B. Nó gần hơn và chỉ cần một xe buýt',
            'C. Học sinh có thể đi bộ đến đó',
            'D. Trung tâm trả tiền nhiên liệu'
          ]
        }
      },
      {
        prompt: 'What activity will students do at the wetland?',
        options: ['Buy packaged food', 'Feed wild birds', 'Collect wildlife data', 'Ride in two buses'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'They agree to collect data about birds.',
        translation: {
          content: 'Học sinh sẽ làm hoạt động gì tại khu đất ngập nước?',
          options: [
            'A. Mua đồ ăn đóng gói sẵn',
            'B. Cho chim hoang dã ăn',
            'C. Thu thập dữ liệu về động vật hoang dã',
            'D. Đi trên hai xe buýt'
          ]
        }
      },
      {
        prompt: 'What broader message does the teacher give?',
        options: ['Cheap trips are always better', 'Entertainment is the only goal of travel', 'A green visit should avoid harming the destination', 'Students should never visit theme parks'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The final sentence explicitly connects green travel with protecting the place.',
        translation: {
          content: 'Thầy/cô giáo đưa ra thông điệp rộng lớn hơn nào?',
          options: [
            'A. Chuyến đi giá rẻ luôn tốt hơn',
            'B. Giải trí là mục đích duy nhất của chuyến đi',
            'C. Một chuyến đi xanh nên tránh làm hại điểm đến',
            'D. Học sinh không bao giờ nên đi công viên giải trí'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words about two actions your class can take to reduce plastic waste.', difficulty: 'easy', minimumWords: 60, model: 'Our class can reduce plastic waste in two simple ways. First, every student should bring a reusable water bottle instead of buying a new plastic bottle each day. Second, we can use one clearly labelled box to collect clean plastic for recycling. A weekly monitor can check the box and record how much waste we save.' },
      { prompt: 'Write a 90–120-word email inviting classmates to join a green-school campaign. Include time, activities and benefits.', difficulty: 'medium', minimumWords: 90, model: 'Subject: Join our Green Friday campaign\nHi everyone,\nOur class will hold Green Friday from 3 p.m. to 5 p.m. this Friday. We will collect recyclable waste, plant herbs near the library and check whether empty rooms are wasting electricity. Please bring gloves and a reusable bottle. By joining, you will help make the school cleaner and learn how small actions can reduce our carbon footprint. We also need two volunteers to record the results. Please reply before Thursday if you can take part.\nBest,\nLan' },
      { prompt: 'Write a 120–150-word proposal recommending one measurable environmental change for your school.', difficulty: 'hard', minimumWords: 120, model: 'I propose reducing the number of single-use bottles sold at school. At present, many students buy bottled drinks even though filtered-water stations are available. The school should offer a small discount to students who bring reusable bottles and stop selling plastic bottles on Fridays. The environmental club can count the bottles in rubbish bins for two weeks before the programme and again after one month. A successful target would be a reduction of at least thirty percent. Posters should explain both the environmental benefit and the money students can save. This plan is practical because it uses existing water stations, gives students a positive reason to change and produces clear data that the school can evaluate.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute about one habit that reduces your carbon footprint.', difficulty: 'easy', model: 'I usually cycle to school because the distance is short. Cycling produces no exhaust fumes and also keeps me active. When it rains, I share a ride instead of travelling alone.' },
      { prompt: 'Role-play a discussion in which one student wants disposable decorations and another suggests reusable alternatives.', difficulty: 'medium', model: 'Disposable decorations are convenient, but we would throw them away after one event. Could we borrow fabric banners and make signs from old cardboard instead? They may take longer to prepare, yet we can use them again.' },
      { prompt: 'Give a two-minute evidence-based pitch for an environmental project at school.', difficulty: 'hard', model: 'Our project should begin with a one-week waste audit. We can then target the largest source of rubbish, set a measurable reduction goal and publish weekly results. Evidence will show whether the campaign actually changes behaviour.' }
    ],
    communicationQuestions: [
      { prompt: 'A friend drops a bottle beside a full bin. What is the best response?', options: ['Leave it; someone cleans here.', 'Could you keep it until we find another bin?', 'You are a terrible person.', 'Throw it behind the building.'], answer: 'B', difficulty: 'easy', explanation: 'The response is polite and offers a practical action.' },
      { prompt: 'Which sentence best makes a suggestion during a green meeting?', options: ['You must accept my idea.', 'Why don’t we measure waste before choosing a solution?', 'There is no point discussing this.', 'Everybody else is wrong.'], answer: 'B', difficulty: 'medium', explanation: 'It uses an appropriate suggestion form and proposes evidence gathering.' },
      { prompt: 'Which reply shows qualified agreement?', options: ['Absolutely, and there are no disadvantages.', 'I agree that it could work, provided we can measure the result.', 'No, because I said no.', 'Maybe, but I did not listen.'], answer: 'B', difficulty: 'hard', explanation: 'Qualified agreement accepts the idea subject to a clear condition.' }
    ]
  },
  {
    unit: 3,
    topicId: 'eng10-t3',
    theme: 'Music',
    readingTitle: 'When a school concert becomes a community project',
    readingPassage: `At first, the students of Hoa Sen High planned an ordinary end-of-term concert. Then their music teacher suggested using the event to support a local children’s library. The idea changed both the programme and the way students worked. Instead of selecting only the strongest singers, the organisers created several roles: performers, sound technicians, designers, presenters and a publicity team. A shy student who rarely sang in public produced the concert poster, while two students interested in technology learned to operate the sound system. Local musicians agreed to perform without payment, and a bookshop promised to match the money raised from ticket sales. The concert attracted a larger audience than expected. More importantly, students who had never considered themselves musical discovered that a successful performance depends on many kinds of talent. The library received new books, but the school gained something less visible: students learned to listen to one another, solve problems under pressure and connect artistic work with a useful purpose in the community.`,
    readingQuestions: [
      {
        prompt: 'What is the central idea of the passage?',
        options: ['Only talented singers can organise concerts', 'A concert supported a library and developed different student talents', 'The school replaced music with technology', 'A bookshop organised the whole event'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The passage combines the charitable purpose with diverse student contributions.',
        translation: {
          content: 'Ý chính của đoạn văn là gì?',
          options: [
            'A. Chỉ những ca sĩ tài năng mới có thể tổ chức hòa nhạc',
            'B. Buổi hòa nhạc đã hỗ trợ một thư viện và phát triển nhiều tài năng học sinh khác nhau',
            'C. Nhà trường đã thay thế âm nhạc bằng công nghệ',
            'D. Một hiệu sách đã tổ chức toàn bộ sự kiện'
          ]
        }
      },
      {
        prompt: 'What did the shy student do?',
        options: ['Performed a solo', 'Operated the sound system', 'Designed the concert poster', 'Sold books'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'The passage directly states that the shy student produced the poster.',
        translation: {
          content: 'Học sinh nhút nhát đã làm công việc gì?',
          options: [
            'A. Hát đơn ca',
            'B. Vận hành hệ thống âm thanh',
            'C. Thiết kế áp phích (poster) cho buổi hòa nhạc',
            'D. Bán sách'
          ]
        }
      },
      {
        prompt: 'The phrase “match the money” means the bookshop would __________.',
        options: ['keep the ticket income', 'give an equal additional amount', 'count the money', 'sell tickets at the same price'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'To match a donation is to contribute the same amount.',
        translation: {
          content: 'Cụm từ “match the money” có nghĩa là hiệu sách sẽ __________.',
          options: [
            'A. giữ lại tiền bán vé',
            'B. đóng góp một khoản tiền bổ sung tương đương',
            'C. đếm tiền',
            'D. bán vé với cùng một mức giá'
          ]
        }
      },
      {
        prompt: 'What does “something less visible” refer to?',
        options: ['new library books', 'ticket sales', 'students’ teamwork and personal growth', 'the sound equipment'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The colon introduces listening, problem-solving and purposeful artistic work.',
        translation: {
          content: 'Cụm từ “something less visible” (điều gì đó ít hữu hình hơn) đề cập đến điều gì?',
          options: [
            'A. sách mới cho thư viện',
            'B. doanh thu bán vé',
            'C. tinh thần làm việc nhóm và sự trưởng thành của học sinh',
            'D. thiết bị âm thanh'
          ]
        }
      },
      {
        prompt: 'Which conclusion is best supported?',
        options: ['Community music projects need professional performers', 'Musical events can include valuable non-performing roles', 'Publicity is more important than performance', 'Schools should charge high ticket prices'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Students contributed through design, technology, presentation and publicity as well as performance.',
        translation: {
          content: 'Kết luận nào được ủng hộ tốt nhất bởi bài viết?',
          options: [
            'A. Các dự án âm nhạc cộng đồng cần những người biểu diễn chuyên nghiệp',
            'B. Các sự kiện âm nhạc có thể bao gồm những vai trò giá trị ngoài việc biểu diễn',
            'C. Việc truyền thông quan trọng hơn biểu diễn',
            'D. Các trường học nên bán vé với giá cao'
          ]
        }
      }
    ],
    listeningTitle: 'Preparing for a live performance',
    listeningScript: `A student band is rehearsing for Friday’s concert. Linh, the lead singer, says the second song is too fast and she cannot pronounce the final lines clearly. Minh, the drummer, offers to slow the tempo slightly, but the guitarist worries that the song will lose energy. Their teacher asks them to record one practice version at each speed and listen without playing. After comparing the recordings, the band chooses the slower version because the words are clearer and the rhythm still feels lively. They then notice that the keyboard is too loud during the first verse. The keyboard player lowers the volume and leaves more space for the singer. By the end of the rehearsal, the group understands that performing well is not about making every instrument loud; it is about creating balance.`,
    listeningScriptTranslation: `Một ban nhạc học sinh đang tập luyện cho buổi biểu diễn vào thứ Sáu. Linh, ca sĩ chính, nói rằng bài hát thứ hai quá nhanh và bạn ấy không thể phát âm rõ ràng các dòng cuối cùng. Minh, tay trống, đề nghị giảm nhịp độ xuống một chút, nhưng tay guitar lo lắng rằng bài hát sẽ mất đi năng lượng. Giáo viên yêu cầu các em ghi âm một bản tập ở mỗi tốc độ và nghe lại mà không chơi nhạc. Sau khi so sánh hai bản ghi âm, ban nhạc chọn bản chậm hơn vì lời bài hát rõ ràng hơn và nhịp điệu vẫn sôi động. Sau đó các em nhận ra tiếng đàn keyboard quá to trong khổ hát đầu tiên. Người chơi keyboard giảm âm lượng và dành nhiều khoảng trống hơn cho ca sĩ. Đến cuối buổi tập, cả nhóm hiểu rằng biểu diễn tốt không phải là làm cho mọi nhạc cụ kêu thật to; đó là tạo ra sự cân bằng.`,
    listeningQuestions: [
      {
        prompt: 'What problem does Linh first identify?',
        options: ['The keyboard is broken', 'The final lines are unclear at the current speed', 'The guitarist is absent', 'The concert has been cancelled'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'She says the song is too fast for clear pronunciation.',
        translation: {
          content: 'Linh nhận ra vấn đề gì đầu tiên?',
          options: [
            'A. Đàn keyboard bị hỏng',
            'B. Các dòng cuối không rõ ràng ở tốc độ hiện tại',
            'C. Tay guitar vắng mặt',
            'D. Buổi biểu diễn đã bị hủy'
          ]
        }
      },
      {
        prompt: 'How does the teacher help the band decide?',
        options: ['She chooses immediately', 'She asks the audience', 'She has them record and compare two versions', 'She removes the second song'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'The teacher suggests evidence from recordings at both speeds.',
        translation: {
          content: 'Giáo viên giúp ban nhạc quyết định như thế nào?',
          options: [
            'A. Cô ấy chọn ngay lập tức',
            'B. Cô ấy hỏi ý kiến khán giả',
            'C. Cô ấy yêu cầu các em ghi âm và so sánh hai bản',
            'D. Cô ấy bỏ bài hát thứ hai'
          ]
        }
      },
      {
        prompt: 'What change is made to the keyboard?',
        options: ['It plays faster', 'It becomes quieter in the first verse', 'It stops completely', 'It copies the guitar'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'The keyboard player lowers the volume.',
        translation: {
          content: 'Thay đổi nào được thực hiện với đàn keyboard?',
          options: [
            'A. Nó chơi nhanh hơn',
            'B. Nó đánh nhỏ hơn trong khổ hát đầu tiên',
            'C. Nó dừng lại hoàn toàn',
            'D. Nó đánh nhại theo guitar'
          ]
        }
      },
      {
        prompt: 'What lesson does the band learn?',
        options: ['Every instrument should be equally loud', 'Fast songs always sound better', 'Balance matters more than maximum volume', 'Singers should control the sound system'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The final sentence gives this lesson directly.',
        translation: {
          content: 'Ban nhạc rút ra bài học nào?',
          options: [
            'A. Mọi nhạc cụ nên to bằng nhau',
            'B. Bài hát nhanh luôn nghe hay hơn',
            'C. Sự cân bằng quan trọng hơn âm lượng tối đa',
            'D. Ca sĩ nên kiểm soát hệ thống âm thanh'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words introducing a singer, musician or band you enjoy.', difficulty: 'easy', minimumWords: 60, model: 'I enjoy listening to a Vietnamese band that combines modern pop with traditional instruments. Their songs have memorable melodies, but I especially like the clear lyrics and energetic live performances. The musicians often write about young people, family and Vietnamese culture. Their music helps me relax and also makes traditional sounds feel fresh.' },
      { prompt: 'Write a 90–120-word review of a school performance. Mention strengths and one useful improvement.', difficulty: 'medium', minimumWords: 90, model: 'The school music night was lively and well organised. The presenters introduced each act clearly, and the sound team changed equipment quickly between performances. The strongest part was the final group song because the singers listened to one another and created good harmony. However, the keyboard was sometimes too loud, so several lyrics were difficult to hear. At the next concert, the band should complete a sound check from the audience’s position. Overall, the event showed impressive teamwork and gave many students a chance to contribute.' },
      { prompt: 'Write a 120–150-word proposal for a music event that benefits the community.', difficulty: 'hard', minimumWords: 120, model: 'I propose a weekend concert to raise funds for instruments at the local youth centre. The programme should include student bands, a small traditional-music group and an open performance for younger children. Students who do not perform can design posters, manage sound, sell tickets and record the event. Entry should be affordable, while local businesses can increase the total by matching ticket income. To make the purpose clear, a representative from the youth centre should explain how the instruments will be used. The organising team must publish the amount raised and the final purchase after the event. This concert would provide enjoyable entertainment, develop students’ practical skills and give more children access to music.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute about a song that is meaningful to you.', difficulty: 'easy', model: 'A song I value is one I first heard with my family. Its melody is gentle and its lyrics are about staying hopeful. I listen to it when I feel stressed because it reminds me that difficult moments pass.' },
      { prompt: 'Role-play two band members negotiating song choice for a school concert.', difficulty: 'medium', model: 'I understand why you prefer the faster song, but our singer cannot perform it clearly yet. Could we choose the slower piece now and save the other one for the next concert?' },
      { prompt: 'Give a two-minute presentation explaining why music education should include technical and organisational roles.', difficulty: 'hard', model: 'Music projects require sound, design, planning, publicity and presentation. Including these roles allows more students to participate and demonstrates that artistic success depends on collaboration, not only performers.' }
    ],
    communicationQuestions: [
      { prompt: 'A friend is nervous before performing. What is the best encouragement?', options: ['Do not make any mistakes.', 'Everyone will judge you.', 'You have prepared carefully; focus on the first line and breathe.', 'I would be nervous too, so cancel it.'], answer: 'C', difficulty: 'easy', explanation: 'It recognises preparation and offers a practical calming action.' },
      { prompt: 'Choose the most polite way to suggest a tempo change during rehearsal.', options: ['You are playing terribly fast.', 'Could we try this section slightly slower to make the words clearer?', 'Stop playing immediately.', 'Fast music is completely wrong.'], answer: 'B', difficulty: 'medium', explanation: 'It uses a polite request and gives a clear musical reason.' },
      { prompt: 'A performance has a minor technical error. Which post-event comment is most constructive?', options: ['The whole show was ruined.', 'Never perform again.', 'The harmony was strong; fixing the keyboard balance will make the next show even better.', 'Ignore all sound issues.'], answer: 'C', difficulty: 'hard', explanation: 'It balances specific praise with a clear practical improvement.' }
    ]
  },
  {
    unit: 4,
    topicId: 'eng10-t4',
    theme: 'For a Better Community',
    readingTitle: 'Moving from good intentions to reliable service',
    readingPassage: `When a local youth club decided to support a nearby primary school, members first offered to teach English every afternoon. However, after three weeks, several volunteers missed classes because of school tests. The primary school teachers were disappointed because children were left waiting. The club leader realised that enthusiasm without organization could cause harm. The team therefore redesigned the project. They reduced the teaching days from five to two and created a shared calendar where every lesson had a primary teacher and a backup volunteer. They also prepared standard activity packs so that a substitute could teach without delay. Additionally, the volunteers established a rule: if someone could not attend, they had to inform the team leader at least twenty-four hours in advance. After these changes, attendance became reliable and the primary school welcomed the volunteers back. The club learned that community service is not defined by how much time you promise; it is measured by whether you keep commitments consistently.`,
    readingQuestions: [
      {
        prompt: 'What is the main theme of the passage?',
        options: ['Teaching English is impossible for teenagers', 'Community service requires organization and reliability', 'Primary schools do not need volunteers', 'Youth clubs should only organise sports'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The passage contrasts unorganised enthusiasm with reliable commitment.',
        translation: {
          content: 'Chủ đề chính của đoạn văn là gì?',
          options: [
            'A. Dạy tiếng Anh là điều không thể đối với thanh thiếu niên',
            'B. Phục vụ cộng đồng yêu cầu sự tổ chức và tính đáng tin cậy',
            'C. Các trường tiểu học không cần tình nguyện viên',
            'D. Các câu lạc bộ thanh thiếu niên chỉ nên tổ chức thể thao'
          ]
        }
      },
      {
        prompt: 'Why were the primary school teachers disappointed initially?',
        options: ['The volunteers brought the wrong books', 'Volunteers missed classes and left children waiting', 'The children disliked English', 'The club charged money for lessons'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Volunteers missed classes owing to tests.',
        translation: {
          content: 'Tại sao các giáo viên tiểu học ban đầu lại thất vọng?',
          options: [
            'A. Tình nguyện viên mang sai sách',
            'B. Tình nguyện viên bỏ buổi học và để trẻ em phải chờ đợi',
            'C. Trẻ em không thích tiếng Anh',
            'D. Câu lạc bộ thu tiền học'
          ]
        }
      },
      {
        prompt: 'The word “substitute” in paragraph 2 means __________.',
        options: ['a replacement person', 'a primary student', 'a new textbook', 'a school principal'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'A substitute fills in when the main volunteer cannot attend.',
        translation: {
          content: 'Từ “substitute” (người thay thế) trong đoạn 2 có nghĩa là __________.',
          options: [
            'A. một người thay thế (a replacement person)',
            'B. một học sinh tiểu học',
            'C. một cuốn sách giáo khoa mới',
            'D. hiệu trưởng trường học'
          ]
        }
      },
      {
        prompt: 'What did the backup system ensure?',
        options: ['Lessons could continue even if a volunteer was absent', 'Volunteers never had to prepare lessons', 'Children received free textbooks', 'The club could recruit more members'],
        answer: 'A',
        difficulty: 'hard',
        explanation: 'Backup volunteers and activity packs prevented delay.',
        translation: {
          content: 'Hệ thống dự phòng bảo đảm điều gì?',
          options: [
            'A. Các buổi học vẫn tiếp tục ngay cả khi một tình nguyện viên vắng mặt',
            'B. Tình nguyện viên không bao giờ phải chuẩn bị bài học',
            'C. Trẻ em nhận được sách giáo khoa miễn phí',
            'D. Câu lạc bộ có thể tuyển thêm thành viên'
          ]
        }
      },
      {
        prompt: 'Which lesson was learned by the youth club?',
        options: ['Promises matter more than results', 'Consistency is more valuable than making large promises', 'Volunteering should only happen during holidays', 'Smaller projects are always useless'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The conclusion explicitly links service to keeping commitments consistently.',
        translation: {
          content: 'Câu lạc bộ thanh thiếu niên đã rút ra bài học nào?',
          options: [
            'A. Lời hứa quan trọng hơn kết quả',
            'B. Sự nhất quán có giá trị hơn là đưa ra những lời hứa lớn',
            'C. Hoạt động tình nguyện chỉ nên diễn ra trong kỳ nghỉ',
            'D. Các dự án nhỏ hơn luôn vô dụng'
          ]
        }
      }
    ],
    listeningTitle: 'A volunteer orientation',
    listeningScript: `Before visiting an elderly care home, the coordinator gives students three reminders. First, they should talk with residents rather than perform every task for them. Some residents may want company more than practical help. Second, students must protect privacy. They may not take photographs or share personal stories online without clear permission. Third, they should arrive on time and tell the coordinator early if they cannot attend, because residents may be waiting for them. During the visit, students can read aloud, play board games or help with the garden. The coordinator adds that respectful volunteering includes listening carefully and accepting that someone may not want to join an activity. At the end, each student will write a short reflection about what the resident seemed to enjoy and what could be improved next time.`,
    listeningQuestions: [
      { prompt: 'Who is the talk intended for?', options: ['Residents of a care home', 'Students preparing to volunteer', 'Professional nurses', 'Online photographers'], answer: 'B', difficulty: 'easy', explanation: 'The coordinator is orienting students before their visit.' },
      { prompt: 'When may students share a photograph?', options: ['Whenever it is attractive', 'After receiving clear permission', 'Only during a board game', 'When no teacher is present'], answer: 'B', difficulty: 'medium', explanation: 'Privacy requires clear permission.' },
      { prompt: 'Why is punctuality especially important?', options: ['The garden closes early', 'Residents may be expecting the students', 'Students receive payment by the hour', 'Photographs need daylight'], answer: 'B', difficulty: 'medium', explanation: 'The coordinator says residents may be waiting.' },
      { prompt: 'What view of respectful service is communicated?', options: ['Volunteers should control every activity', 'Helping includes listening and respecting choice', 'Practical work is the only useful activity', 'Reflection is unnecessary'], answer: 'B', difficulty: 'hard', explanation: 'Students should listen and accept when a resident declines an activity.' }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words describing one community activity you would like to join.', difficulty: 'easy', minimumWords: 60, model: 'I would like to join a weekly reading club for younger children. Volunteers could read short stories, explain new words and help each child choose a suitable book. I enjoy reading and can be patient when someone needs time. The activity would be useful because regular practice can make children more confident.' },
      { prompt: 'Write a 90–120-word volunteer application email explaining your skills and availability.', difficulty: 'medium', minimumWords: 90, model: 'Subject: Application for the Saturday reading club\nDear Coordinator,\nI would like to volunteer for the Saturday reading club. I am a Grade 10 student who enjoys books and has experience helping my younger cousin with English. I can explain ideas patiently, organise simple games and arrive every Saturday morning for the next three months. I understand that volunteers must protect children’s privacy and follow the teacher’s plan. Please let me know whether training is required before the first session.\nYours sincerely,\nMinh' },
      { prompt: 'Write a 120–150-word reflection explaining how a volunteer project should measure real impact.', difficulty: 'hard', minimumWords: 120, model: 'A volunteer project should measure changes that matter to the community, not only count volunteers or photographs. Before acting, organisers need to ask local people what problem they want to address and record a starting point. A reading project, for example, could note attendance, reading confidence and the number of books children finish. Volunteers should keep consistent records and ask teachers or families whether the activity is useful. Numbers alone are not enough, so short interviews can reveal why participation rises or falls. At the end of a planned period, the group should compare the results with its original goal and adjust the programme. This process prevents well-meaning volunteers from assuming that every activity creates genuine benefit.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute about a skill you could contribute to a volunteer project.', difficulty: 'easy', model: 'I can contribute patient explanation. I often help classmates organise notes, so I could support younger students in a reading club. I would prepare simple activities and listen before giving advice.' },
      { prompt: 'Role-play a volunteer asking a coordinator for clarification about privacy and photographs.', difficulty: 'medium', model: 'Could you clarify whether parents have given permission for photographs? If permission is not recorded, I will avoid taking pictures and only write a private reflection about the activity.' },
      { prompt: 'Give a two-minute presentation comparing short-term charity with long-term community partnership.', difficulty: 'hard', model: 'Short-term charity can meet an urgent need, while partnership addresses causes through consultation and continued work. Effective projects choose the approach that fits the situation and evaluate results with the community.' }
    ],
    communicationQuestions: [
      { prompt: 'A resident does not want to join a game. What should a volunteer say?', options: ['You must participate.', 'That is fine. Would you prefer to talk or rest?', 'You are being difficult.', 'I will post about this online.'], answer: 'B', difficulty: 'easy', explanation: 'The response respects choice and offers alternatives.' },
      { prompt: 'Which question best identifies a community need?', options: ['Do you like our plan?', 'What problem would you most like this project to address?', 'Can we take a group photo?', 'Why did you not ask us earlier?'], answer: 'B', difficulty: 'medium', explanation: 'It is open, respectful and centres the community’s priorities.' },
      { prompt: 'A volunteer cannot attend. Which message is most responsible?', options: ['I might not come. Bye.', 'I cannot attend tomorrow; I am sorry. I have informed my partner and can prepare the materials today.', 'Nobody will notice.', 'Find someone else at the last minute.'], answer: 'B', difficulty: 'hard', explanation: 'It communicates early, apologises and supports continuity.' }
    ]
  },
  {
    unit: 5,
    topicId: 'eng10-t5',
    theme: 'Inventions',
    readingTitle: 'Designing technology with users, not only for them',
    readingPassage: `A group of engineering students designed a smart medicine box that sounded an alarm at the correct time. In laboratory tests, the device worked perfectly. However, when older adults tried it, several problems appeared. The alarm was too quiet for some users, the small screen was difficult to read and the lid required more hand strength than expected. The designers first felt disappointed because they had spent months developing the product. Then they realised that technical success was not the same as usefulness. They invited the users to weekly testing sessions and changed one feature at a time. The new box used a louder but gentler sound, large high-contrast text and a lid that opened with light pressure. It also included a simple button to confirm that medicine had been taken; it did not collect unnecessary personal data. The final version was less visually impressive than the original prototype, yet users trusted it more. The project demonstrated that responsible invention requires repeated feedback, accessibility and respect for privacy, not merely advanced technology.`,
    readingQuestions: [
      {
        prompt: 'What is the passage mainly about?',
        options: ['Why medicine should be cheaper', 'How user feedback improved an invention', 'How to study engineering', 'Why older adults dislike technology'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The product becomes useful through repeated testing with actual users.',
        translation: {
          content: 'Đoạn văn chủ yếu nói về điều gì?',
          options: [
            'A. Tại sao thuốc nên rẻ hơn',
            'B. Phản hồi của người dùng đã giúp cải thiện một phát minh như thế nào',
            'C. Cách học ngành kỹ thuật',
            'D. Tại sao người lớn tuổi không thích công nghệ'
          ]
        }
      },
      {
        prompt: 'Which was NOT a problem with the first prototype?',
        options: ['The alarm was quiet', 'The text was small', 'The lid was difficult to open', 'It collected too much personal data'],
        answer: 'D',
        difficulty: 'medium',
        explanation: 'Privacy is discussed as a design choice in the improved version, not an original reported failure.',
        translation: {
          content: 'Điều nào KHÔNG PHẢI là vấn đề của mẫu thử nghiệm ban đầu?',
          options: [
            'A. Chuông báo quá nhỏ',
            'B. Chữ trên màn hình quá nhỏ',
            'C. Nắp hộp khó mở',
            'D. Nó thu thập quá nhiều dữ liệu cá nhân'
          ]
        }
      },
      {
        prompt: 'The word “prototype” refers to __________.',
        options: ['an early model used for testing', 'a medical prescription', 'a group of users', 'a privacy law'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'The original prototype is the early version tested and revised.',
        translation: {
          content: 'Từ “prototype” (mẫu thử) dùng để chỉ __________.',
          options: [
            'A. một mô hình ban đầu được sử dụng để thử nghiệm',
            'B. một đơn thuốc',
            'C. một nhóm người dùng',
            'D. luật quyền riêng tư'
          ]
        }
      },
      {
        prompt: 'Why was only necessary data collected?',
        options: ['The device had no memory', 'The designers wanted to respect privacy', 'Users refused to press a button', 'The screen was too large'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The final sentence links responsible invention with privacy.',
        translation: {
          content: 'Tại sao chỉ có các dữ liệu cần thiết mới được thu thập?',
          options: [
            'A. Thiết bị không có bộ nhớ',
            'B. Các nhà thiết kế muốn tôn trọng quyền riêng tư',
            'C. Người dùng từ chối nhấn nút',
            'D. Màn hình quá lớn'
          ]
        }
      },
      {
        prompt: 'What can be inferred from the final version being “less visually impressive”?',
        options: ['Appearance was prioritised over function', 'Practical accessibility mattered more than a complex look', 'The device stopped working', 'Users preferred the original box'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Users trusted the simpler but more accessible design.',
        translation: {
          content: 'Có thể suy ra điều gì từ việc phiên bản cuối cùng “ít gây ấn tượng về mặt thị giác hơn”?',
          options: [
            'A. Diễn hại/vẻ ngoài được ưu tiên hơn chức năng',
            'B. Khả năng tiếp cận thực tế quan trọng hơn vẻ ngoài phức tạp',
            'C. Thiết bị đã ngừng hoạt động',
            'D. Người dùng thích chiếc hộp ban đầu hơn'
          ]
        }
      }
    ],
    listeningTitle: 'Comparing two note-taking apps',
    listeningScript: `Two students compare note-taking apps for their history project. The first app automatically records every lecture and produces a transcript. Lan likes its accuracy, but she worries that recording people without permission could create a privacy problem. The second app does not record audio. Instead, it lets group members write shared notes, add sources and mark questions that need checking. Minh initially prefers the first app because it saves time. After discussing how they will interview a local historian, he agrees that asking permission every time may be difficult and that an automatic transcript can still contain errors. They choose the shared-note app and decide that one student will take notes while another checks dates and names. Their decision is based not only on convenience but also on accuracy, consent and responsible use.`,
    listeningScriptTranslation: `Hai học sinh so sánh các ứng dụng ghi chú cho bài dự án lịch sử của mình. Ứng dụng đầu tiên tự động ghi âm mỗi bài giảng và tạo ra bản ký âm (transcript). Linh thích độ chính xác của nó, nhưng bạn ấy lo lắng rằng việc ghi âm mọi người mà không có sự cho phép có thể gây ra vấn đề riêng tư. Ứng dụng thứ hai không ghi âm thanh. Thay vào đó, nó cho phép các thành viên trong nhóm viết ghi chú chung, thêm nguồn và đánh dấu các câu hỏi cần kiểm tra. Ban đầu Minh thích ứng dụng đầu tiên hơn vì nó tiết kiệm thời gian. Sau khi thảo luận về việc các em sẽ phỏng vấn một nhà sử học địa phương như thế nào, bạn ấy đồng ý rằng việc xin phép mỗi lần có thể khó khăn và một bản ký âm tự động vẫn có thể chứa lỗi. Các em chọn ứng dụng ghi chú chung và quyết định rằng một học sinh sẽ ghi chú trong khi học sinh khác kiểm tra ngày tháng và tên gọi. Quyết định của các em dựa trên không chỉ sự tiện lợi mà còn dựa trên độ chính xác, sự đồng ý và việc sử dụng có trách nhiệm.`,
    listeningQuestions: [
      {
        prompt: 'What are the students choosing?',
        options: ['A history topic', 'A note-taking application', 'A person to interview', 'A lecture to record'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The conversation compares two note-taking apps.',
        translation: {
          content: 'Các học sinh đang lựa chọn cái gì?',
          options: [
            'A. Một chủ đề lịch sử',
            'B. Một ứng dụng ghi chú',
            'C. Một người để phỏng vấn',
            'D. Một bài giảng để ghi âm'
          ]
        }
      },
      {
        prompt: 'What concern does Lan have about the first app?',
        options: ['It has no transcript', 'It may record people without permission', 'It cannot recognise dates', 'It is too slow'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Lan raises a privacy and consent concern.',
        translation: {
          content: 'Linh có mối lo ngại gì về ứng dụng đầu tiên?',
          options: [
            'A. Nó không có bản ký âm',
            'B. Nó có thể ghi âm mọi người mà không có sự cho phép',
            'C. Nó không thể nhận diện ngày tháng',
            'D. Nó quá chậm'
          ]
        }
      },
      {
        prompt: 'How will the students divide work with the chosen app?',
        options: ['Both will record audio', 'One writes notes and one checks facts', 'The historian writes everything', 'The app checks all sources automatically'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'They assign note-taking and fact-checking roles.',
        translation: {
          content: 'Các học sinh sẽ phân chia công việc như thế nào với ứng dụng được chọn?',
          options: [
            'A. Cả hai sẽ ghi âm thanh',
            'B. Một người viết ghi chú và một người kiểm tra sự thật',
            'C. Nhà sử học tự viết mọi thứ',
            'D. Ứng dụng tự động kiểm tra tất cả các nguồn'
          ]
        }
      },
      {
        prompt: 'Which values guide the final decision?',
        options: ['Popularity and appearance', 'Speed only', 'Accuracy, consent and responsibility', 'Price and entertainment'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'These values are stated at the end.',
        translation: {
          content: 'Những giá trị nào định hướng cho quyết định cuối cùng?',
          options: [
            'A. Độ phổ biến và diện mạo',
            'B. Chỉ có tốc độ',
            'C. Độ chính xác, sự đồng ý và tinh thần trách nhiệm',
            'D. Giá cả và sự giải trí'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words describing an invention you use regularly and its main function.', difficulty: 'easy', minimumWords: 60, model: 'I regularly use a wireless e-reader. Its main function is to store and display digital books on a screen that is comfortable to read. I can change the text size, look up unfamiliar words and carry many books without extra weight. The battery also lasts much longer than a phone battery.' },
      { prompt: 'Write a 90–120-word product review including benefits, one limitation and a recommendation.', difficulty: 'medium', minimumWords: 90, model: 'I have used the StudyLight desk lamp for two months. Its adjustable brightness makes reading comfortable, and a timer reminds me to take breaks. The controls are simple, so I did not need a long manual. However, the charging cable is very short, which limits where I can place it. I would recommend the lamp to students who study in the evening, but the company should include a longer cable in the next version. Overall, it is a useful product because its features solve real study problems rather than simply looking modern.' },
      { prompt: 'Write a 120–150-word design proposal for an accessible school invention.', difficulty: 'hard', minimumWords: 120, model: 'I propose a classroom information panel that is accessible to students with different needs. It would display homework, room changes and emergency notices in large high-contrast text. A button could read the message aloud, while simple icons would support students who are still developing language skills. Teachers would update the panel through a secure school account, and the system would store no personal student data. Before installation, the design team should test the panel with students who have visual, hearing and reading difficulties. Their feedback would guide font size, volume and button position. The invention is technically simple, but it would reduce missed information and allow more students to act independently.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute explaining how a familiar device works.', difficulty: 'easy', model: 'A reusable digital timer has three main buttons. First, I set the number of minutes. Then I press start, and the screen counts down. When time ends, an alarm sounds. I use it to organise study sessions.' },
      { prompt: 'Role-play a designer interviewing a user about problems with a prototype.', difficulty: 'medium', model: 'Could you show me which part is difficult to use? Is the text large enough? What change would make the device safer or more comfortable for you?' },
      { prompt: 'Pitch an invention in two minutes, addressing usefulness, accessibility and privacy.', difficulty: 'hard', model: 'My invention is a school navigation app with step-free routes and spoken directions. It uses location only during navigation and deletes the route afterward. Students with mobility or visual needs would test every feature.' }
    ],
    communicationQuestions: [
      { prompt: 'A user cannot open a prototype lid. What should the designer say?', options: ['You are using it incorrectly.', 'Thank you for showing me. Could you describe where it feels difficult?', 'Everyone else can open it.', 'The design is already finished.'], answer: 'B', difficulty: 'easy', explanation: 'It values feedback and asks for specific evidence.' },
      { prompt: 'Which request properly addresses consent?', options: ['I am recording now.', 'May I record this interview to check my notes later?', 'The app records everyone automatically.', 'Privacy is not important in a project.'], answer: 'B', difficulty: 'medium', explanation: 'Permission is requested before recording and the purpose is stated.' },
      { prompt: 'Which response best balances convenience and privacy?', options: ['Collect every possible detail.', 'Avoid all digital tools.', 'Collect only data needed for the function and explain its use.', 'Hide the data policy from users.'], answer: 'C', difficulty: 'hard', explanation: 'Data minimisation and transparency balance function with privacy.' }
    ]
  },
  {
    unit: 6,
    topicId: 'eng10-t6',
    theme: 'Gender Equality',
    readingTitle: 'Removing an invisible barrier',
    readingPassage: `At a technology club, boys usually built robots while girls prepared slides and presented the final projects. No rule created this division; students simply repeated roles they had seen before. The club leader noticed that several girls wanted to programme but lacked confidence, while some boys were interested in design and communication. She introduced a rotation system. During each project, every member had to try planning, construction, coding, testing and presentation. At first, work became slower because students were learning unfamiliar skills. The leader therefore arranged short workshops and paired beginners with supportive classmates. By the third project, participation had changed. More girls volunteered to code, and boys contributed stronger visual designs and presentations. The robots did not improve because one gender was naturally better; they improved because the team used a wider range of abilities. The experience also changed how students described themselves. Instead of saying “that role is not for me,” they began asking what training they needed. Equal opportunity, the club learned, means removing barriers and providing genuine chances to develop.`,
    readingQuestions: [
      {
        prompt: 'What problem did the club leader notice?',
        options: ['Students refused to build robots', 'Project roles followed gender stereotypes', 'The club had no presentation equipment', 'Boys and girls worked in separate clubs'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'Roles were divided informally along gender lines.',
        translation: {
          content: 'Trưởng câu lạc bộ đã nhận ra vấn đề gì?',
          options: [
            'A. Học sinh từ chối chế tạo robot',
            'B. Phân công vai trò dự án tuân theo các định kiến giới',
            'C. Câu lạc bộ không có thiết bị thuyết trình',
            'D. Nam và nữ hoạt động ở hai câu lạc bộ riêng biệt'
          ]
        }
      },
      {
        prompt: 'What did the rotation system require?',
        options: ['Only experienced students could code', 'Every member tried each major project role', 'Girls presented every project', 'Boys attended extra meetings'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Planning, construction, coding, testing and presentation rotated.',
        translation: {
          content: 'Hệ thống xoay vòng vai trò yêu cầu điều gì?',
          options: [
            'A. Chỉ những học sinh có kinh nghiệm mới được lập trình',
            'B. Mỗi thành viên đều thử sức với từng vai trò chính trong dự án',
            'C. Nữ sinh thuyết trình cho mọi dự án',
            'D. Nam sinh phải tham gia thêm các buổi họp'
          ]
        }
      },
      {
        prompt: 'The word “barriers” most nearly means __________.',
        options: ['prizes', 'obstacles', 'machines', 'instructions'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Barriers are conditions that prevent people from participating or progressing.',
        translation: {
          content: 'Từ “barriers” (rào cản) có nghĩa gần nhất với __________.',
          options: [
            'A. giải thưởng',
            'B. trở ngại / chướng ngại vật (obstacles)',
            'C. máy móc',
            'D. hướng dẫn'
          ]
        }
      },
      {
        prompt: 'Why did work initially become slower?',
        options: ['The robots were larger', 'Students were learning unfamiliar roles', 'The leader cancelled workshops', 'Presentations were removed'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Rotation created a temporary learning period.',
        translation: {
          content: 'Tại sao lúc đầu công việc lại diễn ra chậm hơn?',
          options: [
            'A. Robot lớn hơn',
            'B. Học sinh đang học những vai trò chưa quen thuộc',
            'C. Trưởng nhóm hủy các buổi hội thảo',
            'D. Các bài thuyết trình bị bỏ qua'
          ]
        }
      },
      {
        prompt: 'Which statement best captures the author’s view?',
        options: ['Equality means pretending differences never exist', 'Opportunity requires access, support and skill development', 'Every task must always be completed equally', 'Natural ability should determine roles permanently'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The ending defines equality through removing barriers and creating genuine chances.',
        translation: {
          content: 'Phát biểu nào thể hiện rõ nhất quan điểm của tác giả?',
          options: [
            'A. Bình đẳng nghĩa là giả vờ rằng sự khác biệt chưa từng tồn tại',
            'B. Cơ hội đòi hỏi khả năng tiếp cận, sự hỗ trợ và phát triển kỹ năng',
            'C. Mọi nhiệm vụ lúc nào cũng phải hoàn thành như nhau',
            'D. Năng lực tự nhiên sẽ quyết định vai trò một cách vĩnh viễn'
          ]
        }
      }
    ],
    listeningTitle: 'Reviewing a recruitment advertisement',
    listeningScript: `Two members of a student enterprise review an advertisement for a team leader. The first draft asks for a “strong young man” who can manage pressure. Hoa points out that leadership does not depend on being male and that the phrase may discourage qualified applicants. Duc agrees but says the team sometimes carries equipment. Hoa suggests listing the actual task instead: the leader must occasionally move boxes weighing up to ten kilograms, with assistance available. They also replace “young” with “able to attend evening events twice a month,” because availability is the real requirement. Finally, they add clear criteria: communication, planning and experience coordinating a group. The revised advertisement describes the work rather than an imagined type of person, so applicants can decide based on relevant qualifications.`,
    listeningScriptTranslation: `Hai thành viên của một dự án khởi nghiệp học sinh đang xem lại một tin tuyển dụng vị trí trưởng nhóm. Bản nháp đầu tiên yêu cầu một “nam thanh niên khỏe mạnh” có thể quản lý áp lực. Hoa chỉ ra rằng năng lực lãnh đạo không phụ thuộc vào giới tính nam và cụm từ đó có thể làm nản lòng những ứng viên đủ năng lực. Đức đồng ý nhưng nói rằng thỉnh thoảng nhóm phải bê vác thiết bị. Hoa gợi ý nên liệt kê nhiệm vụ thực tế thay vào đó: trưởng nhóm thỉnh thoảng phải di chuyển các thùng hàng nặng tới 10 kg, và luôn có sự hỗ trợ. Các em cũng thay từ “trẻ tuổi” bằng “có thể tham dự các sự kiện buổi tối 2 lần một tháng”, vì khả năng sắp xếp thời gian mới là yêu cầu thực sự. Cuối cùng, các em bổ sung các tiêu chí rõ ràng: kỹ năng giao tiếp, lập kế hoạch và kinh nghiệm điều phối nhóm. Bản tin tuyển dụng được sửa đổi tập trung mô tả công việc thay vì hình mẫu con người trong tưởng tượng, nhờ đó các ứng viên có thể tự quyết định dựa trên các năng lực phù hợp.`,
    listeningQuestions: [
      {
        prompt: 'What document are Hoa and Duc revising?',
        options: ['A project report', 'A recruitment advertisement', 'A workshop timetable', 'A product manual'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'They review an advertisement for a team leader.',
        translation: {
          content: 'Hoa và Đức đang sửa đổi tài liệu nào?',
          options: [
            'A. Báo cáo dự án',
            'B. Tin tuyển dụng',
            'C. Thời khóa biểu hội thảo',
            'D. Sách hướng dẫn sản phẩm'
          ]
        }
      },
      {
        prompt: 'Why does Hoa object to “strong young man”?',
        options: ['The job has no pressure', 'It may exclude qualified people for irrelevant reasons', 'The enterprise hires only adults', 'Boxes are never moved'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Gender and age are replaced by actual job requirements.',
        translation: {
          content: 'Tại sao Hoa phản đối cụm từ “nam thanh niên khỏe mạnh”?',
          options: [
            'A. Công việc không có áp lực',
            'B. Nó có thể loại trừ những người đủ năng lực vì những lý do không liên quan',
            'C. Dự án chỉ tuyển người lớn',
            'D. Các thùng hàng không bao giờ được di chuyển'
          ]
        }
      },
      {
        prompt: 'What replaces the word “young”?',
        options: ['A requirement about evening availability', 'A higher salary', 'A coding qualification', 'A driving licence'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'Availability for two evening events is the genuine need.',
        translation: {
          content: 'Từ nào/yêu cầu nào thay thế cho từ “trẻ tuổi”?',
          options: [
            'A. Yêu cầu về khả năng tham gia vào buổi tối',
            'B. Mức lương cao hơn',
            'C. Bằng cấp lập trình',
            'D. Bằng lái xe'
          ]
        }
      },
      {
        prompt: 'What principle guides the revision?',
        options: ['Describe a preferred personality', 'List relevant tasks and qualifications', 'Make the advertisement shorter at any cost', 'Avoid mentioning responsibilities'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'The final version focuses on work and evidence-based criteria.',
        translation: {
          content: 'Nguyên tắc nào định hướng cho sự sửa đổi này?',
          options: [
            'A. Mô tả tính cách được ưa thích',
            'B. Liệt kê các nhiệm vụ và năng lực liên quan thực tế',
            'C. Làm cho tin tuyển dụng ngắn hơn bằng mọi giá',
            'D. Tránh đề cập đến trách nhiệm'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words about a person who challenges a gender stereotype.', difficulty: 'easy', minimumWords: 60, model: 'My cousin challenges the idea that engineering is only for men. She studies mechanical engineering and leads a university design team. She enjoys solving practical problems and also mentors younger girls who are curious about technology. Her success shows that interest, effort and training matter more than gender stereotypes.' },
      { prompt: 'Write a 90–120-word school announcement encouraging equal participation in a club.', difficulty: 'medium', minimumWords: 90, model: 'The Robotics Club welcomes students of every gender and level of experience. Members will rotate through coding, construction, design, testing and presentation, so nobody is limited to a traditional role. Beginners can attend a skills workshop on Wednesday and work with a trained partner during the first project. Selection for leadership positions will be based on communication, planning and commitment. If you are curious but unsure of your ability, please join the introductory meeting and try a task before deciding.' },
      { prompt: 'Write a 120–150-word argument explaining how schools can turn equal opportunity into real participation.', difficulty: 'hard', minimumWords: 120, model: 'Schools create real participation when they remove practical and social barriers, not merely announce that everyone is welcome. Clubs should describe roles using relevant skills and invite students who may not see themselves represented. Rotating tasks gives each learner a genuine chance to try coding, leadership, design or public speaking. Beginners also need training and supportive feedback; otherwise, confident students will continue taking the most valued roles. Teachers should monitor participation data and ask students why they do or do not volunteer. Equal numbers alone are not the final goal. A successful programme allows students of every gender to develop competence, influence decisions and choose roles based on interest rather than stereotypes.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute about a job or activity that should be open to everyone.', difficulty: 'easy', model: 'Leadership should be open to everyone. A good leader needs communication, planning and responsibility, none of which belongs to one gender. Selection should be based on evidence of these skills.' },
      { prompt: 'Role-play challenging a stereotypical role assignment politely.', difficulty: 'medium', model: 'I can prepare the slides, but I would also like to try coding. Could we rotate roles and arrange support for anyone learning a new task?' },
      { prompt: 'Give a two-minute proposal for measuring gender equality in a school activity.', difficulty: 'hard', model: 'We should track not only membership but also who speaks, leads, receives training and controls technical tasks. Anonymous feedback can reveal barriers that numbers do not explain.' }
    ],
    communicationQuestions: [
      { prompt: 'Which response supports equal opportunity?', options: ['Girls usually do the design.', 'Choose the role you want to learn; training is available.', 'Only experienced boys can code.', 'Leadership is too stressful for some genders.'], answer: 'B', difficulty: 'easy', explanation: 'Choice and training create genuine access.' },
      { prompt: 'How should a biased criterion be challenged?', options: ['Call the writer a bad person.', 'Ask what task the criterion predicts and replace it with a relevant requirement.', 'Ignore it completely.', 'Add more unrelated criteria.'], answer: 'B', difficulty: 'medium', explanation: 'This focuses discussion on job-related evidence.' },
      { prompt: 'Which statement distinguishes equality from identical treatment?', options: ['Everyone gets the same support regardless of need.', 'People receive fair access and appropriate support to reach the same opportunity.', 'Only outcomes matter.', 'Differences justify exclusion.'], answer: 'B', difficulty: 'hard', explanation: 'Fair access may require different support where barriers differ.' }
    ]
  },
  {
    unit: 7,
    topicId: 'eng10-t7',
    theme: 'Viet Nam and International Organisations',
    readingTitle: 'Cooperation after a coastal storm',
    readingPassage: `After a powerful storm damaged homes along the central coast, local authorities coordinated assistance from several organisations. A Vietnamese youth network mapped isolated villages and translated residents’ requests into a shared digital system. An international relief agency supplied water filters and temporary shelters, while a regional health organisation trained volunteers to recognise signs of contaminated water. The partners did not simply deliver identical packages everywhere. Teams compared population, road access and existing local resources before deciding what each village needed. Daily meetings allowed community representatives to correct outdated information and report problems. When roads reopened, local businesses were invited to supply food and building materials, which supported recovery without weakening the local economy. The operation was not free from disagreement: organisations used different reporting formats and initially repeated some deliveries. A common database and clearly assigned responsibilities reduced this duplication. The experience showed that international cooperation works best when outside expertise supports local knowledge, information is shared transparently and affected communities participate in decisions.`,
    readingQuestions: [
      {
        prompt: 'What is the passage mainly about?',
        options: ['Competition between relief organisations', 'How coordinated local and international support aided recovery', 'Why storms affect only coastal businesses', 'A new international database company'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The passage explains roles, coordination problems and lessons from joint relief.',
        translation: {
          content: 'Đoạn văn chủ yếu nói về điều gì?',
          options: [
            'A. Sự cạnh tranh giữa các tổ chức cứu trợ',
            'B. Sự phối hợp giữa hỗ trợ địa phương và quốc tế giúp khắc phục hậu quả ra sao',
            'C. Tại sao bão chỉ ảnh hưởng đến các doanh nghiệp ven biển',
            'D. Một công ty cơ sở dữ liệu quốc tế mới'
          ]
        }
      },
      {
        prompt: 'What role did the youth network perform?',
        options: ['It produced water filters', 'It mapped villages and translated requests', 'It rebuilt every road', 'It trained doctors'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Those tasks are stated in the second sentence.',
        translation: {
          content: 'Mạng lưới thanh niên đã thực hiện vai trò gì?',
          options: [
            'A. Sản xuất bộ lọc nước',
            'B. Lập bản đồ các ngôi làng và dịch các yêu cầu của người dân',
            'C. Xây dựng lại tất cả các con đường',
            'D. Đào tạo bác sĩ'
          ]
        }
      },
      {
        prompt: 'The word “duplication” refers to __________.',
        options: ['the same aid being delivered more than once', 'villages becoming larger', 'reports being translated', 'businesses reducing prices'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'Different systems caused repeated deliveries.',
        translation: {
          content: 'Từ “duplication” (sự trùng lặp) ám chỉ __________.',
          options: [
            'A. việc cùng một khoản cứu trợ được phân phát nhiều hơn một lần',
            'B. các ngôi làng trở nên lớn hơn',
            'C. các báo cáo được dịch thuật',
            'D. các doanh nghiệp giảm giá'
          ]
        }
      },
      {
        prompt: 'Why were local businesses involved after roads reopened?',
        options: ['To replace community representatives', 'To support supply and the local economy', 'To end international cooperation', 'To control the database'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Local purchasing supported recovery without weakening economic activity.',
        translation: {
          content: 'Tại sao các doanh nghiệp địa phương lại được tham gia sau khi đường mở lại?',
          options: [
            'A. Để thay thế các đại diện cộng đồng',
            'B. Để hỗ trợ nguồn cung và nền kinh tế địa phương',
            'C. Để chấm dứt sự hợp tác quốc tế',
            'D. Để kiểm soát cơ sở dữ liệu'
          ]
        }
      },
      {
        prompt: 'Which factor is presented as essential for effective cooperation?',
        options: ['Outside organisations making all decisions', 'One identical solution for every village', 'Transparent information and community participation', 'Avoiding daily communication'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The final sentence states these principles.',
        translation: {
          content: 'Yếu tố nào được đưa ra là thiết yếu đối với sự hợp tác hiệu quả?',
          options: [
            'A. Các tổ chức bên ngoài đưa ra mọi quyết định',
            'B. Một giải pháp giống hệt nhau cho mọi ngôi làng',
            'C. Thông tin minh bạch và sự tham gia của cộng đồng',
            'D. Tránh việc giao tiếp hằng ngày'
          ]
        }
      }
    ],
    listeningTitle: 'Preparing for an international youth forum',
    listeningScript: `A teacher briefs three students who will join an online youth forum. Their task is to present a local recycling project in five minutes. The teacher advises them not to spend the whole time describing their school. Instead, they should explain the problem, the action they tested and the evidence of change. One student will introduce the context, another will show a simple chart, and the third will discuss what other schools could adapt. Because participants come from several countries, the students should avoid unexplained local abbreviations and speak slightly more slowly than usual. They also need one minute for questions. The teacher reminds them that international exchange is not a competition to prove that one project is best. Its purpose is to share a method, listen to different experiences and identify ideas that can work in new contexts.`,
    listeningScriptTranslation: `Một giáo viên hướng dẫn ngắn cho ba học sinh sẽ tham gia một diễn đàn thanh niên quốc tế trực tuyến. Nhiệm vụ của các em là thuyết trình về một dự án tái chế tại địa phương trong 5 phút. Giáo viên khuyên các em không nên dành toàn bộ thời gian chỉ để mô tả về trường học của mình. Thay vào đó, các em nên giải thích vấn đề, hành động đã được thử nghiệm và bằng chứng về sự thay đổi. Một học sinh sẽ giới thiệu bối cảnh, một học sinh khác sẽ chiếu một biểu đồ đơn giản, và học sinh thứ ba sẽ thảo luận về những gì các trường khác có thể áp dụng theo. Vì các thành viên tham gia đến từ nhiều quốc gia, các em nên tránh dùng các từ viết tắt địa phương chưa được giải thích và nói chậm hơn một chút so với bình thường. Các em cũng cần dành một phút cho phần câu hỏi. Giáo viên nhắc nhở các em rằng giao lưu quốc tế không phải là cuộc thi để chứng tỏ dự án nào là tốt nhất. Mục đích của nó là chia sẻ một phương pháp, lắng nghe các trải nghiệm khác nhau và xác định những ý tưởng có thể hoạt động trong các bối cảnh mới.`,
    listeningQuestions: [
      {
        prompt: 'What will the students present?',
        options: ['A tourism advertisement', 'A local recycling project', 'A language lesson', 'A sports competition'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The forum presentation concerns their recycling project.',
        translation: {
          content: 'Các học sinh sẽ thuyết trình về điều gì?',
          options: [
            'A. Một quảng cáo du lịch',
            'B. Một dự án tái chế tại địa phương',
            'C. Một bài học ngôn ngữ',
            'D. Một cuộc thi thể thao'
          ]
        }
      },
      {
        prompt: 'What evidence will one student use?',
        options: ['A long video', 'A simple chart', 'A list of abbreviations', 'A school uniform'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'The second student will show a chart.',
        translation: {
          content: 'Một học sinh sẽ sử dụng bằng chứng nào?',
          options: [
            'A. Một video dài',
            'B. Một biểu đồ đơn giản',
            'C. Danh sách các từ viết tắt',
            'D. Đồng phục học sinh'
          ]
        }
      },
      {
        prompt: 'Why should local abbreviations be avoided?',
        options: ['They are grammatically incorrect', 'International participants may not understand them', 'The presentation must be shorter than one minute', 'Charts cannot contain letters'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'The audience comes from different countries.',
        translation: {
          content: 'Tại sao nên tránh dùng các từ viết tắt địa phương?',
          options: [
            'A. Chúng sai về mặt ngữ pháp',
            'B. Các thành viên quốc tế có thể không hiểu chúng',
            'C. Bài thuyết trình phải ngắn hơn một phút',
            'D. Biểu đồ không được chứa chữ cái'
          ]
        }
      },
      {
        prompt: 'How does the teacher define the purpose of exchange?',
        options: ['Winning a competition', 'Copying one solution exactly', 'Sharing, listening and adapting ideas', 'Promoting one school only'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The final two sentences contrast competition with mutual learning.',
        translation: {
          content: 'Giáo viên định nghĩa mục đích của việc giao lưu như thế nào?',
          options: [
            'A. Chiến thắng một cuộc thi',
            'B. Sao chép chính xác một giải pháp',
            'C. Chia sẻ, lắng nghe và thích ứng các ý tưởng',
            'D. Chỉ quảng bá cho một trường học'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words introducing one international organisation and its general purpose.', difficulty: 'easy', minimumWords: 60, model: 'UNICEF is an international organisation that works to protect children’s rights and well-being. It supports health, education, clean water and emergency assistance in many countries. UNICEF often cooperates with governments and local organisations because programmes are more effective when they reflect the needs of each community.' },
      { prompt: 'Write a 90–120-word summary of a cooperative school project for an international audience.', difficulty: 'medium', minimumWords: 90, model: 'Our school tested a reusable-bottle programme to reduce plastic waste. First, students counted discarded bottles for one week. We then offered refill stations and a small canteen discount for reusable containers. After one month, bottle waste fell by thirty-two percent. The main challenge was reminding new students where the refill stations were, so we added signs in two languages. Other schools could adapt the method by measuring their own starting point and choosing incentives that fit local conditions.' },
      { prompt: 'Write a 120–150-word recommendation on how international organisations should combine global expertise with local knowledge.', difficulty: 'hard', minimumWords: 120, model: 'International organisations should treat local people as decision-making partners, not only recipients. Global experts can contribute research, technical equipment and experience from other regions, but local communities understand language, geography, trust and daily constraints. A strong programme begins with consultation and shared evidence. Responsibilities should be clear, information should be accessible, and community representatives should be able to correct plans when conditions change. Organisations should also buy local goods and train local teams when this is safe and practical, so support strengthens rather than replaces existing capacity. Finally, results must be reported transparently to both donors and affected communities. Combining these forms of knowledge produces solutions that are technically sound, locally appropriate and more likely to continue after outside teams leave.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute introducing a project from Viet Nam to an international audience.', difficulty: 'easy', model: 'Our project reduces plastic waste at school. Students measure bottle use, promote refill stations and publish monthly results. The method is simple and other schools can adapt it.' },
      { prompt: 'Role-play answering a forum participant who asks whether your local solution will work everywhere.', difficulty: 'medium', model: 'The exact incentive may not work everywhere, but the method can be adapted. Each school should measure its own problem and consult students before choosing an action.' },
      { prompt: 'Give a two-minute briefing that divides responsibilities among three organisations after an emergency.', difficulty: 'hard', model: 'Local authorities should coordinate needs, the health organisation should manage safe-water guidance, and the relief agency should supply equipment. All partners should update one shared system.' }
    ],
    communicationQuestions: [
      { prompt: 'Which opening is clearest for an international audience?', options: ['You all know our local abbreviation.', 'Our project addresses plastic waste in a secondary school in central Viet Nam.', 'Our school is obviously the best.', 'There is no need for context.'], answer: 'B', difficulty: 'easy', explanation: 'It gives essential context without assuming local knowledge.' },
      { prompt: 'How should a speaker respond to a useful example from another country?', options: ['That cannot work here.', 'Thank you. Which conditions made that approach successful?', 'Our method is better.', 'Let us ignore differences.'], answer: 'B', difficulty: 'medium', explanation: 'It invites evidence and supports adaptation.' },
      { prompt: 'Which sentence communicates uncertainty responsibly?', options: ['The plan will definitely solve everything.', 'Current data suggests improvement, but we need a longer trial.', 'Evidence is unnecessary.', 'No result can ever be trusted.'], answer: 'B', difficulty: 'hard', explanation: 'It states what evidence supports and its limitation.' }
    ]
  },
  {
    unit: 8,
    topicId: 'eng10-t8',
    theme: 'New Ways to Learn',
    readingTitle: 'Technology does not automatically create active learning',
    readingPassage: `When a school introduced tablets, teachers expected students to become more independent immediately. During the first month, however, many learners copied information from websites without evaluating it, switched between unrelated applications and submitted attractive slides with little explanation. The school responded by changing the learning process rather than removing the devices. Before researching, students wrote a question and predicted what evidence they would need. They compared at least two sources and recorded the author, date and purpose of each one. During group work, roles rotated among researcher, fact-checker, designer and presenter. Teachers also scheduled short periods when screens were closed so groups could explain ideas face to face. After a term, students used fewer sources but selected them more carefully. Their presentations contained clearer reasoning, and group members could explain rather than merely display information. The tablets had not become more powerful; students had learned routines that made digital tools useful. The project suggests that effective blended learning combines technology with purpose, source evaluation, discussion and reflection.`,
    readingQuestions: [
      {
        prompt: 'What is the main message?',
        options: ['Tablets should replace teachers', 'Digital tools require purposeful learning routines', 'Students should use as many sources as possible', 'Slides are better than explanations'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'Improvement came from structured research and discussion, not the devices alone.',
        translation: {
          content: 'Thông điệp chính của bài đọc là gì?',
          options: [
            'A. Máy tính bảng nên thay thế giáo viên',
            'B. Các công cụ kỹ thuật số đòi hỏi thói quen học tập có mục đích',
            'C. Học sinh nên sử dụng càng nhiều nguồn càng tốt',
            'D. Slide thuyết trình tốt hơn là việc giải thích'
          ]
        }
      },
      {
        prompt: 'What did students do before researching after the change?',
        options: ['Closed every application', 'Wrote a question and predicted needed evidence', 'Designed slides first', 'Asked teachers for one website'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'This was the first new research routine.',
        translation: {
          content: 'Sau khi thay đổi, các học sinh đã làm gì trước khi bắt đầu tìm kiếm thông tin?',
          options: [
            'A. Đóng tất cả các ứng dụng',
            'B. Viết ra câu hỏi và dự đoán những bằng chứng cần thiết',
            'C. Thiết kế các slide trước',
            'D. Xin giáo viên một trang web'
          ]
        }
      },
      {
        prompt: 'The word “evaluating” most nearly means __________.',
        options: ['copying', 'judging quality and relevance', 'downloading', 'translating'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Students needed to judge sources rather than copy them.',
        translation: {
          content: 'Từ “evaluating” (đánh giá) có nghĩa gần nhất với __________.',
          options: [
            'A. việc sao chép',
            'B. đánh giá chất lượng và sự phù hợp (judging quality and relevance)',
            'C. việc tải xuống',
            'D. việc dịch thuật'
          ]
        }
      },
      {
        prompt: 'Why were screen-free periods included?',
        options: ['The tablets had weak batteries', 'Groups needed to explain ideas directly', 'Teachers disliked technology', 'Students had completed every task'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Closed-screen discussion required active explanation.',
        translation: {
          content: 'Tại sao các khoảng thời gian không dùng màn hình lại được đưa vào?',
          options: [
            'A. Máy tính bảng bị yếu pin',
            'B. Các nhóm cần giải thích trực tiếp các ý tưởng',
            'C. Giáo viên không thích công nghệ',
            'D. Học sinh đã hoàn thành mọi nhiệm vụ'
          ]
        }
      },
      {
        prompt: 'What can be inferred about the number of sources?',
        options: ['More sources always produce better work', 'Careful selection can be better than collecting many weak sources', 'Students stopped researching', 'Only printed sources were allowed'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Students used fewer sources but produced clearer reasoning.',
        translation: {
          content: 'Có thể suy ra điều gì về số lượng các nguồn tài liệu?',
          options: [
            'A. Càng nhiều nguồn tài liệu thì công việc lúc nào cũng tốt hơn',
            'B. Sự lựa chọn cẩn thận tốt hơn là thu thập nhiều nguồn yếu',
            'C. Học sinh đã ngừng tìm kiếm tài liệu',
            'D. Chỉ các nguồn in mới được phép'
          ]
        }
      }
    ],
    listeningTitle: 'Solving a group-work problem online',
    listeningScript: `Four students are preparing an online presentation, but two have edited the same slide and deleted each other’s work. Their group leader pauses the task and proposes a clearer system. Each member will first add ideas in a shared outline, where comments are visible to everyone. After the group agrees on the evidence, one student will draft the slides, another will check sources and a third will review language. The fourth student will rehearse the timing and record questions for revision. They also set a deadline one day before submission so there is time to solve technical problems. One member suggests using private messages because they feel faster, but the leader explains that decisions may then be hidden from the rest of the group. They agree to keep project decisions in the shared document and use messages only for urgent reminders.`,
    listeningScriptTranslation: `Bốn học sinh đang chuẩn bị cho một bài thuyết trình trực tuyến, nhưng hai bạn đã chỉnh sửa trên cùng một trang slide và làm mất bài làm của nhau. Trưởng nhóm của các em tạm dừng công việc và đề xuất một hệ thống rõ ràng hơn. Mỗi thành viên trước tiên sẽ thêm ý tưởng vào một dàn ý chung, nơi các bình luận đều được mọi người nhìn thấy. Sau khi nhóm thống nhất về bằng chứng, một học sinh sẽ soạn các trang slide, một học sinh khác sẽ kiểm tra các nguồn tài liệu và học sinh thứ ba sẽ rà soát lại ngôn ngữ. Học sinh thứ tư sẽ tập luyện thời gian và ghi lại các câu hỏi để chỉnh sửa. Các em cũng đặt hạn chót trước ngày nộp 1 ngày để có thời gian giải quyết các sự cố kỹ thuật. Một thành viên gợi ý dùng tin nhắn riêng vì cảm thấy nhanh hơn, nhưng trưởng nhóm giải thích rằng các quyết định khi đó có thể bị che khuất đối với phần còn lại của nhóm. Các em đồng ý giữ lại các quyết định dự án trong tài liệu chung và chỉ dùng tin nhắn riêng cho các nhắc nhở khẩn cấp.`,
    listeningQuestions: [
      {
        prompt: 'What problem has occurred?',
        options: ['The presentation topic changed', 'Students overwrote one another’s slide work', 'No student has internet access', 'The deadline was cancelled'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'Two students edited the same slide and deleted work.',
        translation: {
          content: 'Sự cố gì đã xảy ra?',
          options: [
            'A. Chủ đề thuyết trình bị thay đổi',
            'B. Học sinh ghi đè lên bài làm slide của nhau',
            'C. Không học sinh nào có kết nối internet',
            'D. Hạn nộp bài đã bị hủy'
          ]
        }
      },
      {
        prompt: 'Where will students first collect ideas?',
        options: ['In private messages', 'In a shared outline', 'On the final slide', 'In a recorded video'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'The shared outline makes comments visible.',
        translation: {
          content: 'Các học sinh sẽ thu thập ý tưởng ở đâu đầu tiên?',
          options: [
            'A. Trong tin nhắn riêng',
            'B. Trong một dàn ý dùng chung',
            'C. Trên trang slide cuối cùng',
            'D. Trong một video ghi âm'
          ]
        }
      },
      {
        prompt: 'Why is the internal deadline early?',
        options: ['To finish before choosing evidence', 'To leave time for technical problems', 'To prevent language review', 'To avoid rehearsal'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'The extra day is a buffer for problems.',
        translation: {
          content: 'Tại sao hạn chót nội bộ lại sớm hơn?',
          options: [
            'A. Để hoàn thành trước khi chọn bằng chứng',
            'B. Để dành thời gian cho các sự cố kỹ thuật',
            'C. Để ngăn chặn việc rà soát ngôn ngữ',
            'D. Để tránh việc tập luyện'
          ]
        }
      },
      {
        prompt: 'Why are project decisions kept in the shared document?',
        options: ['It uses less electricity', 'Everyone can see and follow them', 'Private messages are illegal', 'Only the leader can edit it'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Transparency prevents members from missing decisions.',
        translation: {
          content: 'Tại sao các quyết định dự án lại được giữ trong tài liệu chung?',
          options: [
            'A. Nó sử dụng ít điện hơn',
            'B. Mọi người đều có thể thấy và làm theo',
            'C. Tin nhắn riêng là bất hợp pháp',
            'D. Chỉ trưởng nhóm mới được chỉnh sửa'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words describing one digital tool that helps you learn.', difficulty: 'easy', minimumWords: 60, model: 'A digital flashcard tool helps me review vocabulary. I create a card with a word, pronunciation, meaning and example. The tool shows difficult cards more often, so I spend time on what I forget. I still write my own examples because simply clicking through cards does not guarantee understanding.' },
      { prompt: 'Write a 90–120-word set of guidelines for responsible online group work.', difficulty: 'medium', minimumWords: 90, model: 'Begin with one shared outline and agree on evidence before designing slides. Assign clear roles, but rotate them in later projects so everyone develops new skills. Keep important decisions in the shared document instead of private messages. Cite the author and date of every source, and mark any fact that still needs checking. Set an internal deadline before the official one. Finally, rehearse together and make sure each member can explain the whole argument, not only their own slide.' },
{
        prompt: 'Write a 120–150-word evaluation of blended learning, including conditions for success.', difficulty: 'hard', minimumWords: 120, model: 'Blended learning can combine the flexibility of online resources with the social value of classroom discussion, but technology alone does not improve learning. Students need a clear question, criteria for evaluating sources and routines for managing distraction. Online tools are useful for revising at an individual pace, sharing drafts and receiving feedback. Face-to-face time is better used for explanation, debate and problems that require immediate support. Teachers should also check whether all students have reliable access and provide an alternative when they do not. Assessment must reward reasoning and reflection rather than attractive digital products. When these conditions are present, blended learning can increase independence without isolating learners or reducing study to screen time.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute recommending a study tool and one rule for using it effectively.', difficulty: 'easy', model: 'I recommend digital flashcards, but users should create their own examples. Copying a definition is quick, while producing an example proves that you understand the word.' },
      { prompt: 'Role-play resolving a disagreement about editing a shared document.', difficulty: 'medium', model: 'We have both changed the same section. Let us restore the earlier version, agree on the evidence in comments and assign one editor for the final paragraph.' },
      { prompt: 'Give a two-minute briefing that separates evidence, uncertainty and recommendation.', difficulty: 'hard', model: 'Our bird count has increased, but two months of data cannot prove full recovery. We recommend continuing habitat restoration while monitoring water quality for a full year.' }
    ],
    communicationQuestions: [
      { prompt: 'A visitor wants to feed wildlife for a photograph. What should a guide say?', options: ['Only feed small animals.', 'Please do not feed them; it changes natural behaviour and can be unsafe.', 'Do it quickly.', 'Use more food to bring them closer.'], answer: 'B', difficulty: 'easy', explanation: 'It gives a clear rule and reason.' },
      { prompt: 'Which sentence explains a visitor limit most effectively?', options: ['Because we said so.', 'Daily numbers are limited to protect nesting habitat and maintain a safe guided experience.', 'Tourists are the problem.', 'The site needs fewer customers.'], answer: 'B', difficulty: 'medium', explanation: 'It explains both conservation and visitor benefit.' },
      { prompt: 'A business fears lower visitor numbers. Which response addresses the trade-off?', options: ['Income does not matter.', 'Longer guided visits can increase local spending while reducing ecological pressure.', 'Remove every limit immediately.', 'Only foreign companies should benefit.'], answer: 'B', difficulty: 'hard', explanation: 'It proposes a model that supports conservation and local value.' }
    ]
  },
  {
    unit: 10,
    topicId: 'eng10-t10',
    theme: 'Ecotourism',
    readingTitle: 'When visitor numbers become part of conservation',
    readingPassage: `A forest reserve became popular after photographs of a rare flowering plant spread online. Tourism created income for local guides and family-run guesthouses, but hundreds of visitors began entering the same narrow valley each weekend. Some left the marked trail to take photographs, compacting soil around the plants. The reserve initially added signs, yet damage continued because visitors arrived faster than rangers could explain the rules. Managers then introduced a booking system with timed groups and trained local guides. Part of each ticket funded trail repair and plant monitoring. Visitors received a short briefing before entry and could view a live camera when the most sensitive area was closed. Some businesses feared fewer customers, but longer guided visits led tourists to buy local meals and crafts instead of making a quick stop. After one season, plant damage fell while local tourism income remained stable. The case shows that ecotourism is not simply travel in nature; it requires limits, education, local benefit and evidence that tourism is not destroying the attraction it depends on.`,
    readingQuestions: [
      {
        prompt: 'What central problem did the reserve face?',
        options: ['Nobody wanted to visit', 'Tourism income rose while visitor pressure damaged rare plants', 'Local guides refused training', 'The live camera stopped working'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The reserve needed to balance benefits with ecological damage.',
        translation: {
          content: 'Khu bảo tồn đã phải đối mặt với vấn đề trung tâm nào?',
          options: [
            'A. Không ai muốn đến tham quan',
            'B. Thu nhập từ du lịch tăng lên trong khi áp lực từ du khách làm hư hại các loài cây quý hiếm',
            'C. Các hướng dẫn viên địa phương từ chối tham gia đào tạo',
            'D. Camera trực tiếp ngừng hoạt động'
          ]
        }
      },
      {
        prompt: 'Why were signs alone ineffective?',
        options: ['They used the wrong language', 'Visitors arrived too quickly for rules to be reinforced', 'The plants covered them', 'Businesses removed them'],
        answer: 'B',
        difficulty: 'medium',
        explanation: 'Rangers could not brief the growing number of visitors.',
        translation: {
          content: 'Tại sao chỉ dùng các biển báo thôi lại không hiệu quả?',
          options: [
            'A. Chúng sử dụng sai ngôn ngữ',
            'B. Du khách đến quá nhanh khiến các quy định không kịp được phổ biến',
            'C. Cây cối đã che khuất các biển báo',
            'D. Các doanh nghiệp đã gỡ bỏ chúng'
          ]
        }
      },
      {
        prompt: 'The word “compacting” means __________.',
        options: ['pressing soil tightly together', 'adding water to soil', 'photographing flowers', 'marking a trail'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'Leaving the trail pressed the soil around plants.',
        translation: {
          content: 'Từ “compacting” (nén chặt) có nghĩa là __________.',
          options: [
            'A. nén đất chặt lại với nhau (pressing soil tightly together)',
            'B. thêm nước vào đất',
            'C. chụp ảnh hoa',
            'D. đánh dấu một tuyến đường'
          ]
        }
      },
      {
        prompt: 'How did longer guided visits help local businesses?',
        options: ['Tickets became free', 'Tourists spent more on meals and crafts', 'Every visitor stayed at a hotel', 'The reserve removed limits'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Visitors made more local purchases instead of stopping briefly.',
        translation: {
          content: 'Các chuyến tham quan có hướng dẫn dài hơn đã giúp ích gì cho các doanh nghiệp địa phương?',
          options: [
            'A. Vé tham quan trở nên miễn phí',
            'B. Du khách chi tiêu nhiều hơn cho bữa ăn và đồ thủ công',
            'C. Mọi du khách đều ở lại khách sạn',
            'D. Khu bảo tồn gỡ bỏ các giới hạn'
          ]
        }
      },
      {
        prompt: 'Which policy best reflects the passage’s definition of ecotourism?',
        options: ['Maximise visitors and repair damage later', 'Close every natural area permanently', 'Set evidence-based limits and return benefits to conservation and residents', 'Use nature only as an advertising background'],
        answer: 'C',
        difficulty: 'hard',
        explanation: 'The conclusion combines limits, education, local benefit and monitoring.',
        translation: {
          content: 'Chính sách nào phản ánh đúng nhất định nghĩa về du lịch sinh thái trong bài đọc?',
          options: [
            'A. Tối đa hóa số lượng du khách và sửa chữa thiệt hại sau',
            'B. Đóng cửa vĩnh viễn mọi khu vực tự nhiên',
            'C. Đặt ra các giới hạn dựa trên cơ sở khoa học và trả lại lợi ích cho công tác bảo tồn và người dân',
            'D. Chỉ sử dụng thiên nhiên làm nền cho quảng cáo'
          ]
        }
      }
    ],
    listeningTitle: 'A responsible tour briefing',
    listeningScript: `Before a mangrove tour, the guide explains that the group will travel by small boat and then walk on a raised path. Visitors must remain on the path because young mangrove roots are easily damaged. They may photograph birds but should turn off flash and keep voices low near nesting areas. The guide asks everyone to carry reusable water bottles and bring all rubbish back to the visitor centre. At the craft village, tourists can buy directly from local producers, but they should ask before photographing people at work. If heavy rain begins, the group will return early rather than enter a flooded section. One visitor asks whether feeding monkeys would help them come closer for photographs. The guide says no: feeding changes animal behaviour and can make both wildlife and people less safe. Responsible visitors observe natural behaviour instead of creating it.`,
    listeningScriptTranslation: `Trước khi đến thăm một khu rừng ngập mặn, người hướng dẫn giải thích rằng nhóm sẽ di chuyển bằng thuyền nhỏ và sau đó đi bộ trên một đường đi được nâng cao. Du khách phải ở lại trên đường đi vì rễ ngập mặn non rất dễ bị hư hại. Họ có thể chụp ảnh các loài chim nhưng nên tắt đèn flash và nói khẽ gần các khu vực làm tổ. Người hướng dẫn yêu cầu mọi người mang theo bình nước dùng nhiều lần và mang tất cả rác thải trở lại trung tâm du khách. Tại làng nghề thủ công, du khách có thể mua trực tiếp từ các sản phẩm của người dân địa phương, nhưng nên xin phép trước khi chụp ảnh người đang làm việc. Nếu trời mưa to, nhóm sẽ quay về sớm thay vì đi vào phần đường bị ngập. Một du khách hỏi liệu việc cho khỉ ăn có giúp chúng lại gần hơn để chụp ảnh hay không. Người hướng dẫn nói không: việc cho ăn làm thay đổi hành vi của động vật và có thể khiến cả động vật hoang dã lẫn con người kém an toàn hơn. Du khách có trách nhiệm quan sát hành vi tự nhiên thay vì tạo ra nó.`,
    listeningQuestions: [
      {
        prompt: 'Why must visitors stay on the raised path?',
        options: ['The boats are too small', 'Young mangrove roots are fragile', 'Local products are sold there', 'Photography is forbidden'],
        answer: 'B',
        difficulty: 'easy',
        explanation: 'The guide says the roots are easily damaged.',
        translation: {
          content: 'Tại sao du khách phải ở lại trên đường đi bộ được nâng cao?',
          options: [
            'A. Thuyền quá nhỏ',
            'B. Rễ cây ngập mặn non rất dễ bị tổn thương/hư hại',
            'C. Các sản phẩm địa phương được bán ở đó',
            'D. Chụp ảnh bị cấm'
          ]
        }
      },
      {
        prompt: 'What should visitors do near nesting birds?',
        options: ['Use flash', 'Speak loudly', 'Keep voices low', 'Offer food'],
        answer: 'C',
        difficulty: 'medium',
        explanation: 'Low voices and no flash reduce disturbance.',
        translation: {
          content: 'Du khách nên làm gì khi ở gần các loài chim đang làm tổ?',
          options: [
            'A. Sử dụng đèn flash',
            'B. Nói to',
            'C. Nói khẽ/giữ giọng thấp',
            'D. Cho ăn'
          ]
        }
      },
      {
        prompt: 'When should visitors ask permission to take photographs?',
        options: ['Before photographing people at work', 'Before photographing the path', 'Before photographing their own boat', 'Before photographing bottled water'],
        answer: 'A',
        difficulty: 'medium',
        explanation: 'The guide specifically mentions workers in the craft village.',
        translation: {
          content: 'Khi nào du khách nên xin phép để chụp ảnh?',
          options: [
            'A. Trước khi chụp ảnh những người đang làm việc',
            'B. Trước khi chụp ảnh đường đi',
            'C. Trước khi chụp ảnh thuyền của họ',
            'D. Trước khi chụp ảnh nước đóng chai'
          ]
        }
      },
      {
        prompt: 'Why should monkeys not be fed?',
        options: ['Food is too expensive', 'It alters behaviour and creates safety risks', 'Monkeys cannot approach boats', 'The tour ends early'],
        answer: 'B',
        difficulty: 'hard',
        explanation: 'Feeding changes natural behaviour and can harm animals and people.',
        translation: {
          content: 'Tại sao không nên cho khỉ ăn?',
          options: [
            'A. Thức ăn quá đắt',
            'B. Nó làm thay đổi hành vi và tạo ra các rủi ro an toàn',
            'C. Khỉ không thể tiếp cận thuyền',
            'D. Chuyến tham quan kết thúc sớm'
          ]
        }
      }
    ],
    writingTasks: [
      { prompt: 'Write 60–80 words giving three rules for visitors to a natural area.', difficulty: 'easy', minimumWords: 60, model: 'Visitors should stay on marked paths so they do not damage plants or disturb nesting animals. They should carry reusable bottles and take every piece of rubbish away. Finally, they must observe wildlife quietly and never feed it. These simple rules protect the place and keep both visitors and animals safer.' },
      { prompt: 'Write a 90–120-word ecotour description that includes conservation and local benefits.', difficulty: 'medium', minimumWords: 90, model: 'Join a small-group mangrove tour led by trained local guides. Visitors travel by boat, walk on a raised path and learn how mangroves protect the coast. Group size is limited to twelve people to reduce disturbance. Part of every ticket supports habitat monitoring and trail maintenance. Lunch is prepared by a family-run business, and guests can buy crafts directly from local producers. Please bring a reusable bottle, remain on marked paths and ask permission before photographing residents.' },
      { prompt: 'Write a 120–150-word recommendation on managing visitor limits at a popular natural site.', difficulty: 'hard', minimumWords: 120, model: 'The site should introduce timed booking rather than allow unlimited entry. Managers first need baseline data on trail erosion, wildlife disturbance and the number of visitors that guides can supervise safely. Group size and daily capacity should then be set conservatively and reviewed each season. Ticket income should fund monitoring, path maintenance and training for local guides. When a sensitive area is closed, visitors can use an observation platform or live camera instead of entering it. Local businesses should be involved in planning so that longer, higher-quality visits replace rapid mass tourism. The policy should publish both environmental indicators and local income data. Visitor limits are justified when they protect the ecosystem while keeping benefits in the community.' }
    ],
    speakingTasks: [
      { prompt: 'Speak for one minute giving responsible-tourist advice.', difficulty: 'easy', model: 'Stay on marked paths, carry reusable items and follow your guide’s instructions. Observe wildlife quietly and never feed it. Buy local products when possible.' },
      { prompt: 'Role-play a guide explaining why a visitor cannot enter a closed nesting area.', difficulty: 'medium', model: 'I understand that you want a closer photograph, but this area is closed during nesting season. You can use the viewing platform without disturbing the birds.' },
      { prompt: 'Give a two-minute proposal balancing conservation, visitor experience and local income.', difficulty: 'hard', model: 'Timed small groups can reduce pressure while trained local guides create a better experience. Ticket income should fund conservation, and tours should include local meals or crafts.' }
    ],
    communicationQuestions: [
      { prompt: 'A visitor wants to feed wildlife for a photograph. What should a guide say?', options: ['Only feed small animals.', 'Please do not feed them; it changes natural behaviour and can be unsafe.', 'Do it quickly.', 'Use more food to bring them closer.'], answer: 'B', difficulty: 'easy', explanation: 'It gives a clear rule and reason.' },
      { prompt: 'Which sentence explains a visitor limit most effectively?', options: ['Because we said so.', 'Daily numbers are limited to protect nesting habitat and maintain a safe guided experience.', 'Tourists are the problem.', 'The site needs fewer customers.'], answer: 'B', difficulty: 'medium', explanation: 'It explains both conservation and visitor benefit.' },
      { prompt: 'A business fears lower visitor numbers. Which response addresses the trade-off?', options: ['Income does not matter.', 'Longer guided visits can increase local spending while reducing ecological pressure.', 'Remove every limit immediately.', 'Only foreign companies should benefit.'], answer: 'B', difficulty: 'hard', explanation: 'It proposes a model that supports conservation and local value.' }
    ]
  }
];

const makeQuestionTypes = (
  spec: Pick<EnglishSkillUnitSpec, 'unit' | 'topicId' | 'theme'>
): QuestionType[] => [
  {
    id: `eng10-skill-qt-u${spec.unit}-reading`,
    topicId: spec.topicId,
    name: `Đọc hiểu tích hợp – ${spec.theme}`,
    slug: `reading-u${spec.unit}`,
    description: 'Đọc văn bản theo chiến lược, tìm ý chính, chi tiết, nghĩa từ, từ quy chiếu và suy luận có bằng chứng.',
    exampleQuestionId: `eng10-skill-u${spec.unit}-r1`,
    theory: [
      'Đọc tiêu đề và câu đầu/cuối để dự đoán ý chính; không dịch từng từ.',
      'Với câu chi tiết và suy luận, gạch bằng chứng trong bài rồi mới đối chiếu phương án.',
      'Đoán từ theo ngữ cảnh bằng từ loại, quan hệ nguyên nhân–kết quả và ví dụ xung quanh.'
    ],
    subTypes: [
      { id: `eng10-u${spec.unit}-reading-gist`, name: 'Ý chính', example: 'What is the passage mainly about?', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-reading-detail`, name: 'Chi tiết', example: 'According to the passage...', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-reading-vocabulary`, name: 'Từ trong ngữ cảnh', example: 'The word ... is closest in meaning to...', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-reading-reference`, name: 'Từ quy chiếu', example: 'The word it refers to...', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-reading-inference`, name: 'Suy luận', example: 'What can be inferred?', targetQuestionCount: 1 }
    ],
    recognitionSigns: ['Có một văn bản chung và câu hỏi yêu cầu bằng chứng từ ngữ liệu.'],
    solvingSteps: ['Đọc câu hỏi trước.', 'Quét đoạn chứa bằng chứng.', 'Loại phương án sai hoặc vượt quá thông tin.'],
    commonMistakes: ['Chọn phương án có từ giống bài nhưng sai quan hệ.', 'Suy luận bằng kiến thức cá nhân thay vì văn bản.'],
    difficulty: 'medium',
    examFrequency: 'high',
    practiceCoverage: {
      targetQuestionCount: 5,
      minimumQuestionsPerSubType: 1,
      requiredPracticeRoles: ['guided', 'near_transfer', 'far_transfer'],
      requiredRepresentations: ['text'],
      masteryHoldoutCount: 1
    }
  },
  {
    id: `eng10-skill-qt-u${spec.unit}-listening`,
    topicId: listeningExtensionTopicId,
    name: `Nghe hiểu – ${spec.theme}`,
    slug: `listening-u${spec.unit}`,
    description: 'Chuyên đề tự chọn: nghe đoạn nói tự nhiên để xác định mục đích, ý chính, chi tiết và hàm ý; không thuộc cấu trúc đề giữa kỳ/cuối kỳ.',
    exampleQuestionId: `eng10-skill-u${spec.unit}-l1`,
    theory: ['Đọc câu hỏi trước khi phát audio.', 'Lượt đầu nghe ý chính; lượt sau ghi từ khóa và quan hệ giữa các ý.', 'Không dừng lại vì một từ chưa biết.'],
    subTypes: [
      { id: `eng10-u${spec.unit}-listening-gist`, name: 'Ý chính/mục đích', example: 'What are the speakers mainly discussing?', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-listening-detail`, name: 'Chi tiết', example: 'What will the speaker do?', targetQuestionCount: 2 },
      { id: `eng10-u${spec.unit}-listening-inference`, name: 'Hàm ý/thái độ', example: 'What does the speaker imply?', targetQuestionCount: 1 }
    ],
    recognitionSigns: ['Có nút phát bài nghe và transcript được ẩn trước khi nộp.'],
    solvingSteps: ['Dự đoán loại thông tin cần nghe.', 'Nghe toàn ý.', 'Nghe lại để kiểm tra chi tiết.'],
    commonMistakes: ['Chọn từ nghe thấy đầu tiên.', 'Cố ghi lại toàn bộ transcript.'],
    difficulty: 'medium',
    examFrequency: 'high',
    practiceCoverage: {
      targetQuestionCount: 4,
      minimumQuestionsPerSubType: 1,
      requiredPracticeRoles: ['guided', 'near_transfer', 'far_transfer'],
      requiredRepresentations: ['audio'],
      masteryHoldoutCount: 1
    }
  },
  {
    id: `eng10-skill-qt-u${spec.unit}-writing`,
    topicId: spec.topicId,
    name: `Viết có hướng dẫn – ${spec.theme}`,
    slug: `writing-u${spec.unit}`,
    description: 'Lập dàn ý, viết và tự sửa bài theo mục đích, độ dài và rubric rõ ràng.',
    exampleQuestionId: `eng10-skill-u${spec.unit}-w1`,
    theory: ['Xác định người đọc và mục đích.', 'Lập ý theo claim–reason–example hoặc opening–body–closing.', 'Dành thời gian kiểm tra nội dung, liên kết, từ vựng và ngữ pháp.'],
    subTypes: [
      { id: `eng10-u${spec.unit}-writing-controlled`, name: 'Đoạn ngắn có kiểm soát', example: '60–80 words', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-writing-guided`, name: 'Bài viết có hướng dẫn', example: '90–120 words', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-writing-extended`, name: 'Bài viết lập luận', example: '120–150 words', targetQuestionCount: 1 }
    ],
    recognitionSigns: ['Đề yêu cầu tạo lập văn bản và nêu rõ mục đích/độ dài.'],
    solvingSteps: ['Gạch yêu cầu bắt buộc.', 'Lập dàn ý ngắn.', 'Viết bản nháp.', 'Soát theo rubric.'],
    commonMistakes: ['Viết đúng ngữ pháp nhưng lạc yêu cầu.', 'Không có liên kết hoặc bằng chứng.'],
    difficulty: 'medium',
    examFrequency: 'high',
    practiceCoverage: {
      targetQuestionCount: 3,
      minimumQuestionsPerSubType: 1,
      requiredPracticeRoles: ['guided', 'near_transfer', 'far_transfer'],
      requiredRepresentations: ['extended_response'],
      masteryHoldoutCount: 1
    }
  },
  {
    id: `eng10-skill-qt-u${spec.unit}-speaking`,
    topicId: spec.topicId,
    name: `Nói và giao tiếp – ${spec.theme}`,
    slug: `speaking-interaction-u${spec.unit}`,
    description: 'Trình bày, tương tác, phản hồi lịch sự và xử lý tình huống giao tiếp theo chủ đề.',
    exampleQuestionId: `eng10-skill-u${spec.unit}-s1`,
    theory: ['Dùng cấu trúc mở ý–phát triển–kết luận cho nói cá nhân.', 'Trong tương tác: lắng nghe, xác nhận ý, phản hồi và đề xuất bước tiếp theo.', 'Ưu tiên rõ nghĩa, dẫn chứng và giao tiếp phù hợp hơn câu quá phức tạp.'],
    subTypes: [
      { id: `eng10-u${spec.unit}-speaking-individual`, name: 'Nói cá nhân', example: 'One-minute talk', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-speaking-interaction`, name: 'Hội thoại/role-play', example: 'Negotiate politely', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-speaking-presentation`, name: 'Thuyết trình', example: 'Two-minute evidence-based talk', targetQuestionCount: 1 },
      { id: `eng10-u${spec.unit}-speaking-functional`, name: 'Chức năng giao tiếp', example: 'Choose the most appropriate response', targetQuestionCount: 3 }
    ],
    recognitionSigns: ['Đề yêu cầu nói, thương lượng, thuyết trình hoặc chọn phản hồi phù hợp.'],
    solvingSteps: ['Xác định vai trò và mục tiêu.', 'Chọn mức độ lịch sự.', 'Nêu lý do/bằng chứng.', 'Kết thúc bằng hành động tiếp theo.'],
    commonMistakes: ['Dịch máy móc từ tiếng Việt.', 'Đúng ngữ pháp nhưng không phù hợp quan hệ giao tiếp.'],
    difficulty: 'medium',
    examFrequency: 'high',
    practiceCoverage: {
      targetQuestionCount: 6,
      minimumQuestionsPerSubType: 1,
      requiredPracticeRoles: ['guided', 'near_transfer', 'far_transfer'],
      requiredRepresentations: ['dialogue', 'extended_response'],
      masteryHoldoutCount: 1
    }
  }
];

const roleByDifficulty = (
  difficulty: Difficulty
): NonNullable<Question['practiceRole']> => (
  difficulty === 'easy' ? 'guided' : difficulty === 'medium' ? 'near_transfer' : 'far_transfer'
);

const choiceQuestion = (
  spec: EnglishSkillUnitSpec,
  skill: 'r' | 'l' | 'c',
  index: number,
  item: ChoiceSpec
): Question => {
  const isReading = skill === 'r';
  const isListening = skill === 'l';
  const typeSkill = isReading ? 'reading' : isListening ? 'listening' : 'speaking';
  const subtype = isReading
    ? readingSubtypeIds[index]
    : isListening
      ? listeningSubtypeIds[index]
      : 'functional';

  return {
    id: `eng10-skill-u${spec.unit}-${skill}${index + 1}`,
    subjectId: 'english',
    topicId: isListening ? listeningExtensionTopicId : spec.topicId,
    questionTypeId: `eng10-skill-qt-u${spec.unit}-${typeSkill}`,
    content: item.prompt,
    options: item.options.map((option, optionIndex) => `${letters[optionIndex]}. ${option}`),
    correctAnswer: item.answer,
    translation: item.translation,
    difficulty: item.difficulty,
    sourceType: 'manual',
    validatorType: 'choice',
    responseType: 'single_choice',
    stimulus: isReading
      ? {
          id: `eng10-stim-u${spec.unit}-reading`,
          title: spec.readingTitle,
          content: spec.readingPassage
        }
      : isListening
        ? {
            id: `eng10-stim-u${spec.unit}-listening`,
            title: spec.listeningTitle,
            content: 'Nhấn phát và nghe đoạn tiếng Anh. Không đọc transcript trước khi trả lời.',
            audioText: spec.listeningScript,
            audioLanguage: 'en-US',
            audioPlaybackRate: 0.92
          }
        : undefined,
    outcomeIds: [`eng10-lo-u${spec.unit}-${isReading ? 'reading' : isListening ? 'listening' : 'speaking'}`],
    competency: isReading ? 'english_reading' : isListening ? 'english_listening' : 'english_interaction',
    cognitiveLevel: item.difficulty === 'easy' ? 'recognition' : item.difficulty === 'medium' ? 'understanding' : 'application',
    estimatedSeconds: isListening ? 150 : 90,
    subTypeId: `eng10-u${spec.unit}-${typeSkill}-${subtype}`,
    practiceRole: roleByDifficulty(item.difficulty),
    representationType: isReading ? 'text' : isListening ? 'audio' : 'dialogue',
    isMasteryHoldout: item.difficulty === 'hard' && index === (isReading ? 4 : isListening ? 3 : 2)
  };
};

const choiceSolution = (
  spec: EnglishSkillUnitSpec,
  skill: 'r' | 'l' | 'c',
  index: number,
  item: ChoiceSpec
): Solution => ({
  id: `eng10-skill-sol-u${spec.unit}-${skill}${index + 1}`,
  questionId: `eng10-skill-u${spec.unit}-${skill}${index + 1}`,
  recognition: skill === 'r'
    ? 'Câu đọc hiểu: xác định vị trí bằng chứng trước khi chọn.'
    : skill === 'l'
      ? 'Câu nghe hiểu: đối chiếu ý nghe được, không chỉ một từ riêng lẻ.'
      : 'Tình huống giao tiếp: xét mục tiêu, quan hệ và mức độ lịch sự.',
  detailedSteps: [
    {
      order: 1,
      title: 'Bằng chứng và lập luận',
      explanation: item.explanation,
      result: `Chọn ${item.answer}.`
    },
    ...(skill === 'l'
      ? [{
          order: 2,
          title: 'Transcript để đối chiếu sau khi làm',
          explanation: spec.listeningScriptTranslation
            ? `${spec.listeningScript}\n\n🌐 Bản dịch Transcript:\n${spec.listeningScriptTranslation}`
            : spec.listeningScript
        }]
      : [])
  ],
  finalAnswer: item.answer,
  commonMistakes: ['Chọn theo từ khóa bề mặt mà không kiểm tra toàn ý.'],
  reviewSuggestions: [`Ôn chiến lược ${skill === 'r' ? 'đọc' : skill === 'l' ? 'nghe' : 'giao tiếp'} của Unit ${spec.unit}.`]
});

const openQuestion = (
  spec: EnglishSkillUnitSpec,
  skill: 'w' | 's',
  index: number,
  task: OpenTaskSpec
): Question => {
  const typeSkill = skill === 'w' ? 'writing' : 'speaking';
  const subtype = skill === 'w' ? writingSubtypeIds[index] : speakingSubtypeIds[index];
  return {
    id: `eng10-skill-u${spec.unit}-${skill}${index + 1}`,
    subjectId: 'english',
    topicId: spec.topicId,
    questionTypeId: `eng10-skill-qt-u${spec.unit}-${typeSkill}`,
    content: task.prompt,
    responseType: 'constructed_response',
    correctAnswer: 'Chấm theo rubric',
    difficulty: task.difficulty,
    sourceType: 'manual',
    validatorType: 'manual',
    answerSchema: {
      type: 'self-check',
      fields: [{
        key: 'response',
        label: skill === 'w' ? 'Bài viết của em' : 'Dàn ý hoặc transcript phần nói của em',
        valueType: 'text',
        placeholder: skill === 'w' ? 'Viết câu trả lời bằng tiếng Anh...' : 'Nói thành tiếng, sau đó ghi lại các ý chính hoặc transcript...',
        hint: task.minimumWords ? `Mục tiêu tối thiểu ${task.minimumWords} từ.` : 'Thực hành nói thành tiếng trước khi ghi ý chính.',
        required: true
      }],
      proofImageRequired: false,
      autoCheckMode: 'manual'
    },
    outcomeIds: [`eng10-lo-u${spec.unit}-${typeSkill}`],
    competency: skill === 'w' ? 'english_writing' : 'english_speaking',
    cognitiveLevel: task.difficulty === 'easy' ? 'recognition' : task.difficulty === 'medium' ? 'understanding' : 'application',
    estimatedSeconds: task.difficulty === 'hard' ? 900 : task.difficulty === 'medium' ? 600 : 360,
    subTypeId: `eng10-u${spec.unit}-${typeSkill}-${subtype}`,
    practiceRole: roleByDifficulty(task.difficulty),
    representationType: 'extended_response',
    isMasteryHoldout: task.difficulty === 'hard'
  };
};

const openSolution = (
  spec: EnglishSkillUnitSpec,
  skill: 'w' | 's',
  index: number,
  task: OpenTaskSpec
): Solution => ({
  id: `eng10-skill-sol-u${spec.unit}-${skill}${index + 1}`,
  questionId: `eng10-skill-u${spec.unit}-${skill}${index + 1}`,
  recognition: skill === 'w' ? 'Nhiệm vụ viết mở: lập ý và tự kiểm tra theo rubric.' : 'Nhiệm vụ nói mở: thực hành thành tiếng và tự đánh giá.',
  detailedSteps: [
    { order: 1, title: 'Lập kế hoạch', explanation: 'Xác định mục đích, 2–3 ý chính và ví dụ phù hợp.' },
    { order: 2, title: 'Bài mẫu tham khảo', explanation: task.model }
  ],
  finalAnswer: task.model,
  commonMistakes: skill === 'w'
    ? ['Bỏ sót yêu cầu đề.', 'Liệt kê ý mà không liên kết.', 'Sao chép bài mẫu thay vì tự viết.']
    : ['Chỉ đọc thầm.', 'Nói từng câu rời rạc.', 'Không phản hồi vai trò/người nghe.'],
  reviewSuggestions: [`Dùng rubric Unit ${spec.unit} để sửa một lần rồi thực hiện lại.`],
  rubric: skill === 'w'
    ? [
        { id: 'task', description: 'Hoàn thành đúng nhiệm vụ và phát triển đủ ý', points: 4, evidence: ['đúng chủ đề', 'đủ yêu cầu', 'có lý do hoặc ví dụ'] },
        { id: 'organisation', description: 'Tổ chức và liên kết', points: 2, evidence: ['trình tự rõ', 'từ nối phù hợp'] },
        { id: 'language', description: 'Từ vựng và ngữ pháp', points: 3, evidence: ['từ vựng chủ đề', 'cấu trúc Unit', 'lỗi không cản trở nghĩa'] },
        { id: 'mechanics', description: 'Chính tả, dấu câu và độ dài', points: 1, evidence: ['dễ đọc', 'đạt độ dài'] }
      ]
    : [
        { id: 'content', description: 'Ý rõ và phù hợp nhiệm vụ', points: 4, evidence: ['trả lời trực tiếp', 'có phát triển ý'] },
        { id: 'delivery', description: 'Độ trôi chảy và phát âm', points: 2, evidence: ['nói thành tiếng', 'ngắt ý hợp lý'] },
        { id: 'language', description: 'Ngôn ngữ phù hợp', points: 2, evidence: ['từ vựng chủ đề', 'cấu trúc tương đối chính xác'] },
        { id: 'interaction', description: 'Phản hồi người nghe/tình huống', points: 2, evidence: ['mức độ lịch sự', 'phản hồi hoặc kết luận'] }
      ]
});

const unit9QuestionTypeSpec = {
  unit: 9,
  topicId: 'eng10-t9',
  theme: 'Protecting the Environment'
} as const;

export const g10EnglishSkillQuestionTypes: QuestionType[] = [...unitSpecs, unit9QuestionTypeSpec]
  .flatMap(makeQuestionTypes)
  .filter(type => !type.id.endsWith('-speaking'))
  .map(type => {
    if (!type.id.startsWith('eng10-skill-qt-u9-')) return type;
    if (type.id.endsWith('-reading')) {
      return {
        ...type,
        exampleQuestionId: 'eng10-deep-u9-r1',
        subTypes: type.subTypes
          ?.filter(subType => !subType.id?.endsWith('-reference'))
          .map(subType => ({
            ...subType,
            targetQuestionCount: subType.id?.endsWith('-detail') || subType.id?.endsWith('-inference') ? 2 : 1
          })),
        practiceCoverage: type.practiceCoverage
          ? { ...type.practiceCoverage, targetQuestionCount: 6 }
          : undefined
      };
    }
    if (type.id.endsWith('-listening')) {
      return {
        ...type,
        exampleQuestionId: 'eng10-deep-u9-l1',
        subTypes: type.subTypes?.map(subType => ({
          ...subType,
          targetQuestionCount: subType.id?.endsWith('-inference') ? 2 : subType.targetQuestionCount
        })),
        practiceCoverage: type.practiceCoverage
          ? { ...type.practiceCoverage, targetQuestionCount: 5 }
          : undefined
      };
    }
    return { ...type, exampleQuestionId: 'eng10-deep-u9-w1' };
  });

export const g10EnglishSkillQuestions: Question[] = unitSpecs.flatMap(spec => [
  ...spec.readingQuestions.map((item, index) => choiceQuestion(spec, 'r', index, item)),
  ...spec.listeningQuestions.map((item, index) => choiceQuestion(spec, 'l', index, item)),
  ...spec.writingTasks.map((item, index) => openQuestion(spec, 'w', index, item))
]);

export const g10EnglishSkillSolutions: Solution[] = unitSpecs.flatMap(spec => [
  ...spec.readingQuestions.map((item, index) => choiceSolution(spec, 'r', index, item)),
  ...spec.listeningQuestions.map((item, index) => choiceSolution(spec, 'l', index, item)),
  ...spec.writingTasks.map((item, index) => openSolution(spec, 'w', index, item))
]);
