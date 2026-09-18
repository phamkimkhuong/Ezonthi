import type { Question, QuestionType, Solution } from '@/types';

type Difficulty = Question['difficulty'];
type ChoiceLetter = 'A' | 'B' | 'C' | 'D';

interface TextStudySpec {
  title: string;
  text: string;
  mainIdea: string;
  detailOneQuestion: string;
  detailOneAnswer: string;
  detailTwoQuestion: string;
  detailTwoAnswer: string;
  vocabulary: string;
  vocabularyMeaning: string;
  inference: string;
  inferenceDistractors: [string, string, string];
  evaluation: string;
  evaluationDistractors: [string, string, string];
}

interface ListeningStudySpec {
  title: string;
  script: string;
  purpose: string;
  detailOneQuestion: string;
  detailOneAnswer: string;
  detailTwoQuestion: string;
  detailTwoAnswer: string;
  reasonQuestion: string;
  reasonAnswer: string;
  inference: string;
  inferenceDistractors: [string, string, string];
}

interface UnitDepthSpec {
  unit: number;
  topicId: string;
  theme: string;
  stakeholder: string;
  action: string;
  reason: string;
  counterpoint: string;
  example: string;
  opinionClaim: string;
  reading: TextStudySpec;
  listening: ListeningStudySpec;
}

interface ChoiceSeed {
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  difficulty: Difficulty;
  explanation: string;
  subtype: string;
  translation?: {
    content: string;
    options?: string[];
  };
}


const letters: ChoiceLetter[] = ['A', 'B', 'C', 'D'];
const listeningExtensionTopicId = 'eng10-listening-extension';

const unitSpecs: UnitDepthSpec[] = [
  {
    unit: 1,
    topicId: 'eng10-t1',
    theme: 'Family Life',
    stakeholder: 'family members',
    action: 'hold a ten-minute family meeting and publish a rotating weekly task board',
    reason: 'clear expectations reduce repeated reminders and make invisible work visible',
    counterpoint: 'a fixed timetable can become unfair when school or work schedules suddenly change',
    example: 'a child preparing for an exam can exchange one evening task and repay it at the weekend',
    opinionClaim: 'A perfectly equal division of housework is always the fairest arrangement.',
    reading: {
      title: 'The experiment with a family quiet hour',
      text: `The Nguyen family used to complain that evenings disappeared without anyone finishing what mattered. Notifications interrupted homework, parents answered work messages during dinner, and the youngest child watched short videos until bedtime. Instead of banning devices completely, the family tested a “quiet hour” from 7.30 to 8.30 for three weeks. Phones were placed in a basket, but anyone expecting an urgent call could keep the sound on. Each person chose a useful activity: homework, reading, preparing clothes for the next day or simply talking. During the first week, everyone reached for the basket several times. By the third week, the children finished schoolwork earlier and the parents reported fewer unfinished household tasks. The family kept the routine, although not every evening followed it. Their experience suggests that a shared rule works best when its purpose is understood and exceptions are discussed. The successful change was not the basket itself; it was the agreement to protect one hour of attention together.`,
      mainIdea: 'A flexible family agreement helped protect time and attention in the evening.',
      detailOneQuestion: 'How long did the family test the quiet-hour routine?',
      detailOneAnswer: 'For three weeks',
      detailTwoQuestion: 'What happened by the third week?',
      detailTwoAnswer: 'The children finished schoolwork earlier and fewer household tasks remained unfinished.',
      vocabulary: 'urgent',
      vocabularyMeaning: 'needing immediate attention',
      inference: 'The family valued cooperation more than strict punishment.',
      inferenceDistractors: ['The parents wanted to remove every device permanently.', 'The children were never allowed to contact friends.', 'The routine succeeded because nobody could make an exception.'],
      evaluation: 'The passage reports both initial difficulty and later observable changes.',
      evaluationDistractors: ['The author only states that phones are harmful.', 'The conclusion is based on a national survey.', 'The family proves that one routine works for every household.']
    },
    listening: {
      title: 'Changing a Sunday family plan',
      script: `Linh calls her father because the family planned to clean the storage room on Sunday morning. Her school team has unexpectedly reached the final of a debate competition at the same time. She does not ask to avoid the task completely. Instead, she offers to sort the smaller boxes on Saturday evening and label everything before the others begin. Her father says the heavy shelves still require two people, so they agree that Linh will help him move them after the competition. Linh also promises to tell her brother where the recycling bags are kept. Her father accepts the plan and thanks her for proposing alternatives early. Before ending the call, they repeat the new times so that nobody assumes the original schedule still applies.`,
      purpose: 'To renegotiate a family task after a timetable change',
      detailOneQuestion: 'What will Linh do on Saturday evening?',
      detailOneAnswer: 'Sort and label the smaller boxes',
      detailTwoQuestion: 'When will Linh help move the heavy shelves?',
      detailTwoAnswer: 'After the debate competition',
      reasonQuestion: 'Why does her father accept the change?',
      reasonAnswer: 'Linh gives early notice and offers workable alternatives.',
      inference: 'Both speakers consider the task a shared responsibility.',
      inferenceDistractors: ['Linh expects her brother to do all her work.', 'Her father thinks the competition is unimportant.', 'The storage room no longer needs cleaning.']
    }
  },
  {
    unit: 2,
    topicId: 'eng10-t2',
    theme: 'Humans and the Environment',
    stakeholder: 'students and school staff',
    action: 'run a monthly repair café for broken school supplies and small household items',
    reason: 'repairing useful objects prevents waste and teaches practical skills',
    counterpoint: 'unsafe electrical repairs require trained adults and clear limits',
    example: 'students can sew a torn bag or replace a loose button while technicians handle damaged wiring',
    opinionClaim: 'Recycling is enough to make a school environmentally responsible.',
    reading: {
      title: 'A repair café changes what students throw away',
      text: `At West Lake School, an environmental survey found that students understood recycling but still threw away many repairable objects. The eco-club therefore opened a monthly repair café in the technology room. Students brought torn bags, loose chair parts, damaged pencil cases and simple toys. Volunteers first inspected each object and placed it in one of three groups: safe for students to repair, requiring adult supervision or impossible to repair responsibly. Teachers demonstrated basic sewing, fastening and maintenance skills, while a local technician dealt with electrical items. In four sessions, the café repaired 126 objects and recorded why another 23 could not be saved. The organisers published both numbers instead of claiming perfect success. More importantly, students began asking whether an item could be maintained before buying a replacement. The project showed that waste reduction includes design, care and repair, not only sorting rubbish after an object has been discarded. Safety rules made the activity slower, but also made it credible enough for the school to continue.`,
      mainIdea: 'A supervised repair programme reduced waste and changed purchasing habits.',
      detailOneQuestion: 'How were objects classified before repair?',
      detailOneAnswer: 'By whether students could repair them safely, needed supervision or could not repair them responsibly',
      detailTwoQuestion: 'How many objects were successfully repaired in four sessions?',
      detailTwoAnswer: '126 objects',
      vocabulary: 'credible',
      vocabularyMeaning: 'believable and worthy of trust',
      inference: 'Reporting failed repairs strengthened rather than weakened the project.',
      inferenceDistractors: ['The organisers tried to hide all unsuccessful work.', 'Every object should be repaired regardless of risk.', 'The project focused only on electrical equipment.'],
      evaluation: 'The organisers used recorded outcomes and transparent safety categories.',
      evaluationDistractors: ['The project depended entirely on advertising claims.', 'No measurable result was collected.', 'Recycling bins were removed from the school.']
    },
    listening: {
      title: 'Reviewing a waste-free sports day',
      script: `Two student organisers review the school sports day. They are pleased that refill stations replaced most bottled water, but they notice a long queue during the lunch break. Minh suggests adding another station next year. Hoa agrees and points out that some teams still used disposable cups because they had not received the reminder email. They decide to include reusable bottles on the registration form and make team leaders confirm the rule. The food stalls produced less packaging than last year, although one supplier used plastic bags after running out of paper ones. Rather than describing the event as completely waste-free, the students will publish the remaining problems with their improvement plan. They believe honest reporting will help volunteers take next year’s targets seriously.`,
      purpose: 'To evaluate an environmental event and plan improvements',
      detailOneQuestion: 'What problem occurred at lunchtime?',
      detailOneAnswer: 'There was a long queue at the refill station.',
      detailTwoQuestion: 'Where will the reusable-bottle reminder be added?',
      detailTwoAnswer: 'To the registration form',
      reasonQuestion: 'Why will the organisers publish the remaining problems?',
      reasonAnswer: 'Honest reporting will make future targets more credible.',
      inference: 'The organisers judge success by evidence rather than by a perfect label.',
      inferenceDistractors: ['They intend to cancel the next sports day.', 'They think volunteers caused every problem.', 'They will return entirely to bottled water.']
    }
  },
  {
    unit: 3,
    topicId: 'eng10-t3',
    theme: 'Music',
    stakeholder: 'student performers and audiences',
    action: 'offer short accessible performances in different school spaces and collect audience feedback',
    reason: 'varied formats allow more people to experience music without lowering artistic standards',
    counterpoint: 'performers still need protected rehearsal time and suitable sound equipment',
    example: 'a lunchtime acoustic set can introduce a full evening concert to students who cannot stay late',
    opinionClaim: 'The popularity of a song is the best measure of its artistic value.',
    reading: {
      title: 'A concert designed for more than one kind of listener',
      text: `The student music club expected its annual concert to attract the usual audience of friends and relatives. This year, however, members interviewed students who rarely attended. Some could not stay for a two-hour evening event; others found the hall too loud or did not recognise the music. The club redesigned the programme without reducing its musical ambition. It presented two thirty-minute lunchtime sets, kept the full evening concert and created a quieter seating area away from the speakers. Performers introduced unfamiliar pieces in simple language, explaining what listeners might notice. A digital programme included lyrics and short composer notes. Total attendance rose by forty percent, but the most useful result came from feedback cards: newcomers said that explanations made the music easier to enter, while experienced listeners still valued the complete performances. The club learned that accessibility does not mean making every piece simple. It means removing avoidable barriers so that listeners can decide whether the music speaks to them.`,
      mainIdea: 'A music club widened access while preserving the quality of its performances.',
      detailOneQuestion: 'Why did some students avoid the earlier concert?',
      detailOneAnswer: 'The timing, loud sound or unfamiliar music created barriers.',
      detailTwoQuestion: 'By how much did total attendance rise?',
      detailTwoAnswer: 'By forty percent',
      vocabulary: 'ambition',
      vocabularyMeaning: 'a strong aim to achieve something demanding',
      inference: 'Providing context can help new listeners without disappointing experienced ones.',
      inferenceDistractors: ['Only familiar songs can attract an audience.', 'The full evening concert was removed.', 'Quieter seating made the performers less skilled.'],
      evaluation: 'Attendance data and feedback from different listener groups support the conclusion.',
      evaluationDistractors: ['The club relied only on one performer’s opinion.', 'No audience response was collected.', 'The passage proves every concert should last thirty minutes.']
    },
    listening: {
      title: 'Selecting songs for a school podcast',
      script: `An and Bao are choosing music for the first episode of their school podcast. Bao wants to use a popular commercial song, but An explains that they need permission to publish copyrighted music. She has found three tracks released under a licence that allows non-commercial school use if the artist is credited. Bao worries that unfamiliar music will attract fewer listeners. They listen to the tracks and choose an energetic instrumental piece that fits the opening without covering the presenters’ voices. They also plan to name the composer in the audio and episode description. Bao suggests keeping a record of every track and licence. An agrees because future editors will then know exactly what the podcast may reuse.`,
      purpose: 'To choose legally usable music for a school podcast',
      detailOneQuestion: 'What kind of track do they finally choose?',
      detailOneAnswer: 'An energetic instrumental track',
      detailTwoQuestion: 'Where will they credit the composer?',
      detailTwoAnswer: 'In the audio and the episode description',
      reasonQuestion: 'Why will they keep a record of licences?',
      reasonAnswer: 'Future editors need to know which music may legally be reused.',
      inference: 'They balance audience appeal with responsibility to creators.',
      inferenceDistractors: ['They believe all online music is free.', 'They decide to publish no music at all.', 'They care only about choosing a famous artist.']
    }
  },
  {
    unit: 4,
    topicId: 'eng10-t4',
    theme: 'For a Better Community',
    stakeholder: 'volunteers and local residents',
    action: 'begin each volunteer project with a needs meeting led by community representatives',
    reason: 'people affected by a problem understand priorities that outside volunteers may miss',
    counterpoint: 'consultation takes time and cannot replace urgent professional assistance',
    example: 'residents may prefer safer street lighting to a one-day donation event',
    opinionClaim: 'The number of volunteer hours is the clearest measure of community impact.',
    reading: {
      title: 'Mapping needs before offering help',
      text: `A youth group planned to spend its summer repainting an old community centre. Before buying materials, the coordinator invited residents to a mapping meeting. Participants marked places they used, avoided and wanted improved. The paint was not their main concern. Older residents struggled with the broken entrance ramp, parents worried about traffic near the gate, and evening classes needed reliable lights. The group changed its plan. A qualified builder repaired the ramp with funds the students raised, while volunteers painted clear traffic signs and replaced safe light fittings under supervision. They postponed decorating the main hall until more money was available. At the end of the project, residents tested the entrance and completed a short survey. The result looked less dramatic in photographs than a freshly painted building, yet daily use of the centre increased. The youth group concluded that service should be measured by a community’s priorities and lasting access, not by how visible volunteers appear.`,
      mainIdea: 'Listening to residents changed a visible project into a more useful one.',
      detailOneQuestion: 'What was the residents’ main concern about the entrance?',
      detailOneAnswer: 'The ramp was broken and difficult for older people to use.',
      detailTwoQuestion: 'What improvement was postponed?',
      detailTwoAnswer: 'Decorating the main hall',
      vocabulary: 'postponed',
      vocabularyMeaning: 'delayed until a later time',
      inference: 'A less photogenic project can produce greater community value.',
      inferenceDistractors: ['Residents wanted volunteers to leave immediately.', 'Painting is always useless in community work.', 'The youth group refused to raise any money.'],
      evaluation: 'Increased daily use and resident feedback show practical impact.',
      evaluationDistractors: ['The only evidence is the coordinator’s photograph.', 'Impact was measured by volunteer uniforms.', 'The centre stopped offering evening classes.']
    },
    listening: {
      title: 'Adjusting a reading-support session',
      script: `A volunteer tutor tells the coordinator that three children left the reading session early. She first assumes the books were too difficult, but the coordinator asks what the children said. One child needed to collect a younger brother, and two could not hear clearly because another activity was taking place nearby. They decide to move the next session to a quieter room and offer an earlier starting time. The tutor will still prepare books at two reading levels, but she will not label children publicly. The coordinator also asks parents whether the new time works before changing the schedule permanently. Both agree to record attendance and brief comments for four weeks before judging the adjustment.`,
      purpose: 'To identify barriers and improve a volunteer reading session',
      detailOneQuestion: 'Why did two children have difficulty in the session?',
      detailOneAnswer: 'Noise from another activity made it hard to hear.',
      detailTwoQuestion: 'For how long will attendance be recorded?',
      detailTwoAnswer: 'For four weeks',
      reasonQuestion: 'Why will reading levels not be labelled publicly?',
      reasonAnswer: 'Public labels could embarrass or discourage children.',
      inference: 'The volunteers revise their first assumption after gathering more information.',
      inferenceDistractors: ['They decide that the children dislike all books.', 'They cancel the programme without testing changes.', 'Parents are excluded from the scheduling decision.']
    }
  },
  {
    unit: 5,
    topicId: 'eng10-t5',
    theme: 'Inventions',
    stakeholder: 'designers and intended users',
    action: 'test an early prototype with diverse users before adding more features',
    reason: 'observing real use reveals barriers that a design team may not predict',
    counterpoint: 'user requests must still be assessed for safety, cost and technical feasibility',
    example: 'larger physical controls may be more useful than an extra screen on a medicine reminder',
    opinionClaim: 'The invention with the largest number of features is usually the most useful.',
    reading: {
      title: 'Why a simple label changed an invention',
      text: `A student team designed a box that reminded older users to take medicine. Their first prototype had coloured lights, a phone application and six identical buttons. During testing, several users pressed the wrong button, and one person could not distinguish two light colours. The team initially considered adding a tutorial video. A nurse suggested a simpler test: ask users to operate the box without help and explain each difficulty. The students then replaced the identical buttons with two large controls of different shapes, added raised labels and used a clear recorded message. They kept the application for carers but made it optional. In the second test, users completed the main task more quickly and made fewer errors. The device appeared less advanced on a feature list, yet it worked better for the people who needed it. The redesign taught the team that invention is not a competition to add functions. A useful product makes its essential purpose understandable, safe and accessible.`,
      mainIdea: 'User testing led to a simpler and more accessible medicine reminder.',
      detailOneQuestion: 'What problem occurred with the first prototype?',
      detailOneAnswer: 'Users confused identical buttons and some light colours.',
      detailTwoQuestion: 'What happened during the second test?',
      detailTwoAnswer: 'Users completed the task faster and made fewer errors.',
      vocabulary: 'optional',
      vocabularyMeaning: 'available by choice rather than required',
      inference: 'Removing complexity can represent an improvement rather than a failure.',
      inferenceDistractors: ['Every user wanted more buttons.', 'The application became the only way to operate the box.', 'A product is successful when its feature list is longest.'],
      evaluation: 'Performance time and error reduction directly test whether the redesign worked.',
      evaluationDistractors: ['The team judged success only by appearance.', 'No intended user tested the product.', 'The nurse selected the final colour without evidence.']
    },
    listening: {
      title: 'Testing a classroom timer',
      script: `Three students discuss feedback on a visual timer they built for group activities. The display is easy to read from the front, but students sitting near the windows cannot see it when sunlight reflects from the screen. The alarm is also too loud for quiet reading sessions. One designer wants to buy a brighter display immediately. Another suggests testing a movable shade first because it costs almost nothing. They agree to compare the shade and the brighter setting in two classrooms. They will also add three volume levels instead of removing the alarm. A teacher reminds them to record the room conditions and task type during each test. Otherwise, a result from one dark classroom might be applied incorrectly to every situation.`,
      purpose: 'To plan evidence-based improvements to a classroom timer',
      detailOneQuestion: 'What makes the display difficult to see?',
      detailOneAnswer: 'Sunlight reflecting from the screen',
      detailTwoQuestion: 'What change will be made to the alarm?',
      detailTwoAnswer: 'It will have three volume levels.',
      reasonQuestion: 'Why must students record room conditions?',
      reasonAnswer: 'A result from one setting may not apply to every classroom.',
      inference: 'The group will compare a low-cost solution before purchasing new hardware.',
      inferenceDistractors: ['They have already decided to remove the display.', 'The teacher refuses to let them test the timer.', 'Only the loudest alarm can be useful.']
    }
  },
  {
    unit: 6,
    topicId: 'eng10-t6',
    theme: 'Gender Equality',
    stakeholder: 'schools, employers and young people',
    action: 'use transparent criteria and structured interviews when selecting leaders or employees',
    reason: 'consistent evidence reduces the effect of stereotypes and informal preference',
    counterpoint: 'a fair process still requires people to examine biased criteria and unequal access to experience',
    example: 'all candidates can answer the same core questions and receive scores linked to the role',
    opinionClaim: 'Equal opportunity has been achieved once rules use gender-neutral words.',
    reading: {
      title: 'A leadership selection process under review',
      text: `A secondary school noticed that boys held most technical club leadership positions while girls led most care-related activities. No rule assigned roles by gender, so some teachers assumed the pattern reflected preference. The student council reviewed applications and found a less obvious barrier. Candidates for technical clubs were often chosen through informal recommendations from current leaders. Students outside those friendship networks rarely learned what experience was expected. The school introduced published criteria, a short skills task and the same interview questions for every applicant. It also offered introductory workshops before applications opened. In the following year, applications became more diverse and new leaders came from a wider range of groups. The school did not claim that one procedure had removed every inequality. It continued to compare application, selection and retention data. The review demonstrated that apparently neutral traditions can reproduce unequal access, and that fairness requires both clear rules and opportunities to prepare.`,
      mainIdea: 'Transparent selection and preparation reduced an informal barrier to leadership.',
      detailOneQuestion: 'How had technical club leaders often been selected?',
      detailOneAnswer: 'Through informal recommendations from current leaders',
      detailTwoQuestion: 'What did the school continue to compare?',
      detailTwoAnswer: 'Application, selection and retention data',
      vocabulary: 'retention',
      vocabularyMeaning: 'the continued participation of people over time',
      inference: 'A rule can appear neutral while its informal operation remains unequal.',
      inferenceDistractors: ['Students should be assigned clubs according to gender.', 'Published criteria guarantee that bias can never occur.', 'Introductory workshops make selection unnecessary.'],
      evaluation: 'The school examined process data before and after changing selection.',
      evaluationDistractors: ['The conclusion relies on a stereotype about interests.', 'Only the final leaders were counted.', 'The school prohibited technical activities.']
    },
    listening: {
      title: 'Revising an internship interview',
      script: `Two supervisors prepare interviews for a student internship. In previous years, each interviewer asked different questions, making comparisons difficult. They agree on four core questions linked to teamwork, problem solving, communication and reliability. Follow-up questions are allowed, but scores must refer to written evidence. One supervisor suggests removing candidates’ names from the first review of written tasks. The other supports the idea but notes that anonymising names cannot correct unequal access to expensive training. They therefore decide to accept examples from school, family and community responsibilities, not only formal courses. After the interviews, both supervisors will score independently before discussing differences. Their aim is not to make every candidate identical; it is to judge relevant ability with a consistent process.`,
      purpose: 'To make an internship selection process more consistent and inclusive',
      detailOneQuestion: 'How many core interview questions will be used?',
      detailOneAnswer: 'Four',
      detailTwoQuestion: 'When will the supervisors discuss scoring differences?',
      detailTwoAnswer: 'After scoring independently',
      reasonQuestion: 'Why will examples outside formal courses be accepted?',
      reasonAnswer: 'Not every candidate has equal access to expensive training.',
      inference: 'Anonymising names is useful but insufficient by itself.',
      inferenceDistractors: ['The supervisors will ignore all written evidence.', 'Only family responsibilities will count.', 'Consistency requires asking no follow-up questions.']
    }
  },
  {
    unit: 7,
    topicId: 'eng10-t7',
    theme: 'Viet Nam and International Organisations',
    stakeholder: 'Vietnamese youth and international partners',
    action: 'prepare joint projects with shared targets, local consultation and public progress reports',
    reason: 'cooperation becomes meaningful when responsibilities and evidence are visible',
    counterpoint: 'international models must be adapted rather than copied without local knowledge',
    example: 'a coastal project can combine global forecasting tools with fishers’ observations',
    opinionClaim: 'International cooperation is successful whenever many organisations attend a meeting.',
    reading: {
      title: 'When international data meets local knowledge',
      text: `After repeated coastal flooding, a Vietnamese youth network joined an international climate project. The overseas partner provided satellite maps and a forecasting tool, while local fishing families described channels that filled before official warnings were issued. At first, the technical team planned to install signs using only its computer model. Youth volunteers compared the model with residents’ observations and found two evacuation routes that became unsafe during particular tides. The partners revised the map, tested routes in a community exercise and produced warnings in both standard language and locally familiar place names. They also trained local teams to update the information rather than depending permanently on foreign experts. The project combined resources that neither side possessed alone. Satellite data showed wider patterns, but community experience explained how water moved through specific streets. Its success came from exchanging and testing knowledge, not from treating one partner as the giver and the other as a passive receiver.`,
      mainIdea: 'International tools and local experience were combined to improve flood planning.',
      detailOneQuestion: 'What weakness was found in the first evacuation plan?',
      detailOneAnswer: 'Two routes became unsafe during particular tides.',
      detailTwoQuestion: 'Why were local teams trained?',
      detailTwoAnswer: 'So they could update information without permanent dependence on foreign experts',
      vocabulary: 'passive',
      vocabularyMeaning: 'not actively participating or influencing events',
      inference: 'Local knowledge changed the technical plan rather than merely confirming it.',
      inferenceDistractors: ['Satellite maps were completely useless.', 'Foreign experts made every decision alone.', 'The community exercise was cancelled.'],
      evaluation: 'Revised routes were tested and responsibility for updates was transferred locally.',
      evaluationDistractors: ['Success was measured only by the number of organisations.', 'No local resident contributed information.', 'The project ended after producing one untranslated sign.']
    },
    listening: {
      title: 'Preparing a youth forum statement',
      script: `A Vietnamese delegate and a regional partner review their joint statement for a youth forum. The draft says that schools should “raise awareness” about disaster preparedness, but neither speaker thinks this is measurable. They replace the phrase with three actions: each participating school will map safe routes, run one practice exercise and report two lessons learned. The Vietnamese delegate asks to include students with disabilities in the planning team rather than inviting them only to the final event. Her partner agrees and suggests providing documents in accessible formats before meetings. They divide the presentation equally and leave one minute for questions. Before submitting the statement, they check that every promise has a responsible group and a date.`,
      purpose: 'To turn a general forum statement into an accountable joint plan',
      detailOneQuestion: 'How many lessons learned must each school report?',
      detailOneAnswer: 'Two',
      detailTwoQuestion: 'How will the two delegates divide the presentation?',
      detailTwoAnswer: 'Equally',
      reasonQuestion: 'Why are students with disabilities included in the planning team?',
      reasonAnswer: 'Their needs and knowledge should shape the plan from the beginning.',
      inference: 'The speakers prefer specific commitments to symbolic participation.',
      inferenceDistractors: ['They want to remove all questions from the forum.', 'Only one delegate will present the work.', 'They believe awareness cannot lead to action.']
    }
  },
  {
    unit: 8,
    topicId: 'eng10-t8',
    theme: 'New Ways to Learn',
    stakeholder: 'students and teachers',
    action: 'combine short retrieval practice with timely feedback and spaced review',
    reason: 'actively recalling knowledge reveals gaps that rereading can hide',
    counterpoint: 'practice should remain low-stakes and include explanation, not become constant testing',
    example: 'a three-question quiz can guide which concept students review again next week',
    opinionClaim: 'Using more digital tools automatically creates better learning.',
    reading: {
      title: 'The difference between feeling familiar and remembering',
      text: `A biology class prepared for a test by rereading notes and highlighting important terms. Many students felt confident because the pages looked familiar, yet they struggled to explain ideas without the notes. Their teacher introduced brief retrieval practice. At the end of a lesson, students closed their books and answered three questions from memory. They then compared answers, corrected errors and wrote one question to revisit several days later. The activity was not graded, and the teacher used anonymous response patterns to decide what to reteach. After six weeks, students were better at identifying what they did not understand and could connect concepts across lessons. Retrieval practice did not replace reading, discussion or experiments. It changed when students checked understanding: before the final test rather than during it. The class learned that difficulty recalling an idea can be useful information. Productive struggle, followed by feedback and spaced review, often builds stronger memory than comfortable rereading alone.`,
      mainIdea: 'Low-stakes retrieval with feedback helped students monitor and strengthen learning.',
      detailOneQuestion: 'What did students do after answering from memory?',
      detailOneAnswer: 'They compared answers, corrected errors and planned later review.',
      detailTwoQuestion: 'How did the teacher use anonymous response patterns?',
      detailTwoAnswer: 'To decide what needed to be taught again',
      vocabulary: 'retrieval',
      vocabularyMeaning: 'bringing stored information back to mind',
      inference: 'Feeling that material is familiar is not reliable proof of mastery.',
      inferenceDistractors: ['Reading and experiments should be removed from lessons.', 'Every practice response must receive a grade.', 'Forgetting once makes later learning impossible.'],
      evaluation: 'The approach included repeated practice, feedback and observed changes over six weeks.',
      evaluationDistractors: ['The teacher relied on one student’s first attempt.', 'No learning behaviour was compared over time.', 'Highlighting was forbidden in every subject.']
    },
    listening: {
      title: 'Improving an online study group',
      script: `Four students review why their online study session felt unproductive. They spent twenty minutes choosing backgrounds and then read the same notes silently. Trang suggests that each person prepare one question before the next meeting. During the session, members will answer without notes, explain their reasoning and mark points that need checking. Huy worries that wrong answers may be embarrassing, so the group agrees not to record individual scores. Instead, they will keep a shared list of topics to revisit. They also set a forty-minute limit and assign a rotating facilitator. At the end, each member must state one action to complete before the next meeting. The group expects the structure to create accountability without turning peer study into a formal examination.`,
      purpose: 'To redesign an unfocused online study session',
      detailOneQuestion: 'What must each person prepare before the next session?',
      detailOneAnswer: 'One question',
      detailTwoQuestion: 'How long will the study session last?',
      detailTwoAnswer: 'Forty minutes',
      reasonQuestion: 'Why will individual scores not be recorded?',
      reasonAnswer: 'The group wants members to risk answering without embarrassment.',
      inference: 'The new plan combines accountability with psychological safety.',
      inferenceDistractors: ['Members will study silently for the whole session.', 'The facilitator will give everyone a formal grade.', 'Wrong answers will be shared publicly.']
    }
  },
  {
    unit: 9,
    topicId: 'eng10-t9',
    theme: 'Protecting the Environment',
    stakeholder: 'scientists, residents and local authorities',
    action: 'publish a repeatable citizen-science monitoring plan with dates, locations and methods',
    reason: 'consistent observations can reveal trends and support targeted environmental action',
    counterpoint: 'volunteer data needs training, quality checks and professional interpretation',
    example: 'teams can photograph the same river points weekly and verify unusual readings twice',
    opinionClaim: 'One dramatic environmental photograph is enough evidence for a long-term policy.',
    reading: {
      title: 'A river survey that learned to repeat itself',
      text: `Residents near the Hoa River often posted photographs of litter or unusually dark water, but the images rarely included a date, exact location or weather conditions. A local science teacher helped volunteers create a repeatable survey. Every Saturday, trained pairs visited twelve marked points, photographed the same view and recorded water clarity, recent rain and visible waste. If a reading appeared unusual, a second pair repeated it before the group contacted specialists. After four months, the records showed that litter increased near two markets after busy evenings, while dark water at another site usually followed heavy rain and was not automatically evidence of illegal discharge. The findings allowed residents to request covered bins and adjusted collection times at the markets. They also avoided making an unsupported accusation about the third site. Citizen science did not replace laboratory testing, but it transformed isolated concern into organised evidence. Repetition, context and verification made the community’s observations more useful to decision makers.`,
      mainIdea: 'A consistent citizen survey turned isolated observations into useful environmental evidence.',
      detailOneQuestion: 'How often did trained pairs visit the marked points?',
      detailOneAnswer: 'Every Saturday',
      detailTwoQuestion: 'What action was requested near the markets?',
      detailTwoAnswer: 'Covered bins and adjusted waste-collection times',
      vocabulary: 'verification',
      vocabularyMeaning: 'the process of checking that information is accurate',
      inference: 'Context prevented volunteers from drawing at least one premature conclusion.',
      inferenceDistractors: ['Every dark-water photograph proved illegal discharge.', 'Laboratory testing became unnecessary.', 'The survey stopped residents from contacting authorities.'],
      evaluation: 'Repeated observations connected particular waste patterns with places and times.',
      evaluationDistractors: ['The conclusion came from one photograph without a date.', 'No method was shared among volunteers.', 'Market owners selected every result.']
    },
    listening: {
      title: 'Checking a claim about river quality',
      script: `A student team is preparing a presentation about a river. One member says the water is “twice as polluted” as last year because two measurements are higher. The science teacher asks whether the samples were taken at the same places, season and weather conditions. They were not: last year’s samples came after a dry week, while this year’s were collected after heavy rain. The team decides not to use the dramatic comparison. Instead, it will describe the current readings, explain the limitation and recommend monthly sampling at fixed sites. One student worries that admitting uncertainty will make the presentation weak. The teacher replies that a precise limitation makes a responsible claim stronger. The team also plans to ask a laboratory which indicators should be tested.`,
      purpose: 'To revise an environmental claim that the evidence cannot yet support',
      detailOneQuestion: 'When were this year’s samples collected?',
      detailOneAnswer: 'After heavy rain',
      detailTwoQuestion: 'What sampling plan will the team recommend?',
      detailTwoAnswer: 'Monthly sampling at fixed sites',
      reasonQuestion: 'Why is the “twice as polluted” claim removed?',
      reasonAnswer: 'The measurements were taken under different conditions and are not directly comparable.',
      inference: 'Clearly stating uncertainty can increase scientific credibility.',
      inferenceDistractors: ['Environmental presentations should contain no numbers.', 'The teacher believes pollution is impossible.', 'Two measurements always prove a long-term trend.']
    }
  },
  {
    unit: 10,
    topicId: 'eng10-t10',
    theme: 'Ecotourism',
    stakeholder: 'visitors, guides and host communities',
    action: 'set visitor limits with local guides and direct a transparent fee to conservation',
    reason: 'tourism should protect the site and create benefits that residents can verify',
    counterpoint: 'limits may reduce short-term ticket income and require fair booking rules',
    example: 'small timed groups can use trained local guides while part of each fee restores trails',
    opinionClaim: 'Any trip to a natural area should be advertised as ecotourism.',
    reading: {
      title: 'A village chooses fewer visitors at one time',
      text: `A mountain village became popular after photographs of its forest path spread online. Weekend visitor numbers rose quickly, bringing income to food stalls and homestays but also damaging plants beside the narrow trail. Residents first considered building a wider concrete path. Local guides argued that construction would remove the features visitors came to experience. The village instead tested timed entry with groups of no more than twelve, each accompanied by a trained guide. A clearly stated part of the fee paid for trail repair and waste collection, and residents published a simple monthly account. Some businesses feared that limits would reduce income. After one season, however, visitors stayed longer, guide employment increased and emergency rescues fell. Not every resident benefited equally, so the village created a rotating market schedule and continued reviewing fees. The programme shows that ecotourism is not proved by a green name. It requires limits, local decision making, transparent benefits and evidence that natural conditions are being protected.`,
      mainIdea: 'A village used visitor limits and transparent local management to reduce tourism pressure.',
      detailOneQuestion: 'What group-size limit was tested?',
      detailOneAnswer: 'No more than twelve visitors',
      detailTwoQuestion: 'What happened to emergency rescues after one season?',
      detailTwoAnswer: 'They decreased.',
      vocabulary: 'transparent',
      vocabularyMeaning: 'open and clear enough for others to examine',
      inference: 'Lower visitor volume at one time did not necessarily reduce overall local value.',
      inferenceDistractors: ['Every resident received exactly the same benefit immediately.', 'The concrete path was completed before the trial.', 'Guides became unnecessary after timed entry began.'],
      evaluation: 'The village compared visitor behaviour, employment and rescue outcomes after the trial.',
      evaluationDistractors: ['The green name of the programme is treated as sufficient proof.', 'Only social-media likes were measured.', 'Residents were excluded from reviewing fees.']
    },
    listening: {
      title: 'A guide explains a wildlife-viewing rule',
      script: `Before a wetland tour, the guide asks visitors to remain behind a marked line near a nesting area. One visitor says his camera lens is small and asks to move closer for only a minute. The guide explains that repeated short approaches by many people can cause parent birds to leave their nests. She offers a shared long-lens camera at the observation shelter and promises to send participants the photographs. The group must also keep voices low and take all food waste away. A visitor asks why the tour fee is higher than at an unregulated viewpoint. The guide explains that part of it pays local monitors and restores damaged vegetation. She points to a public notice showing last month’s spending before the group begins walking.`,
      purpose: 'To explain wildlife-viewing rules and how tour fees support conservation',
      detailOneQuestion: 'What alternative is offered to the visitor with a small lens?',
      detailOneAnswer: 'A shared long-lens camera at the shelter',
      detailTwoQuestion: 'Where can visitors see how fees were spent?',
      detailTwoAnswer: 'On a public notice',
      reasonQuestion: 'Why must visitors stay behind the marked line?',
      reasonAnswer: 'Repeated approaches can disturb parent birds and their nests.',
      inference: 'The guide supports restrictions with reasons and a practical alternative.',
      inferenceDistractors: ['The rules exist only to make the tour more expensive.', 'Visitors are forbidden to take any photographs.', 'Conservation spending is kept secret.']
    }
  }
];

const languageSeedsByUnit: Record<number, ChoiceSeed[]> = {
  1: [
    {
      prompt: 'My father usually __________ breakfast before the children wake up.',
      correct: 'prepares',
      distractors: ['is preparing', 'prepare', 'prepared'],
      difficulty: 'easy',
      explanation: '“Usually” describes a routine, so use the present simple.',
      subtype: 'grammar-context',
      translation: {
        content: 'Bố tôi thường __________ bữa sáng trước khi các con thức dậy.',
        options: [
          'prepares (chuẩn bị - hiện tại đơn số ít)',
          'is preparing (đang chuẩn bị)',
          'prepare (chuẩn bị - nguyên mẫu)',
          'prepared (đã chuẩn bị)'
        ]
      }
    },
    {
      prompt: 'Look! The twins __________ the washing-up together.',
      correct: 'are doing',
      distractors: ['do', 'does', 'did'],
      difficulty: 'easy',
      explanation: '“Look!” signals an action happening now.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nhìn kìa! Hai đứa trẻ sinh đôi __________ việc rửa bát đĩa cùng nhau.',
        options: [
          'are doing (đang rửa - hiện tại tiếp diễn số nhiều)',
          'do (rửa - hiện tại đơn)',
          'does (rửa - số ít)',
          'did (đã rửa)'
        ]
      }
    },
    {
      prompt: 'Mai __________ that a fair chore plan prevents arguments.',
      correct: 'believes',
      distractors: ['is believing', 'believe', 'believed now'],
      difficulty: 'easy',
      explanation: '“Believe” is normally a stative verb in the present simple.',
      subtype: 'grammar-context',
      translation: {
        content: 'Mai __________ rằng một kế hoạch phân công việc nhà công bằng sẽ ngăn chặn tranh cãi.',
        options: [
          'believes (tin tưởng - động từ trạng thái hiện tại đơn)',
          'is believing (sai vì believe không chia tiếp diễn)',
          'believe (nguyên mẫu)',
          'believed now (dùng sai thì)'
        ]
      }
    },
    {
      prompt: 'The children __________ turns taking out the rubbish.',
      correct: 'take',
      distractors: ['make', 'do', 'have'],
      difficulty: 'easy',
      explanation: 'The fixed expression is “take turns doing something”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Bọn trẻ __________ luân phiên nhau đi đổ rác.',
        options: [
          'take (take turns: luân phiên nhau làm)',
          'make (tạo ra)',
          'do (làm)',
          'have (có)'
        ]
      }
    },
    {
      prompt: 'This week, Nam __________ with dinner because his mother is working late.',
      correct: 'is helping',
      distractors: ['helps always', 'help', 'has help'],
      difficulty: 'medium',
      explanation: '“This week” marks a temporary current arrangement.',
      subtype: 'grammar-context',
      translation: {
        content: 'Tuần này, Nam __________ phụ nấu bữa tối vì mẹ bạn ấy làm việc về muộn.',
        options: [
          'is helping (đang giúp đỡ - mang tính tạm thời)',
          'helps always (dùng sai cấu trúc)',
          'help (nguyên mẫu)',
          'has help (dùng sai thì)'
        ]
      }
    },
    {
      prompt: 'Choose the grammatically correct sentence.',
      correct: 'At the moment, each family member is completing one task.',
      distractors: [
        'At the moment, each family member complete one task.',
        'At the moment, each family member are completing one task.',
        'At the moment, each family member completing one task.'
      ],
      difficulty: 'hard',
      explanation: '“Each family member” is singular and the action is in progress.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu đúng cấu trúc ngữ pháp nhất:',
        options: [
          'At the moment, each family member is completing one task. (Ngay lúc này, mỗi thành viên đang hoàn thành một nhiệm vụ.)',
          'At the moment, each family member complete one task. (Sai: thiếu is/V-ing)',
          'At the moment, each family member are completing one task. (Sai: each family member đi với is)',
          'At the moment, each family member completing one task. (Sai: thiếu to be)'
        ]
      }
    }
  ],
  2: [
    {
      prompt: 'Look at those dark clouds. It __________ rain.',
      correct: 'is going to',
      distractors: ['will to', 'goes to', 'is going'],
      difficulty: 'easy',
      explanation: 'Visible evidence supports a “be going to” prediction.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nhìn những đám mây đen kìa. Trời __________ mưa.',
        options: [
          'is going to (dự đoán có căn cứ thực tế)',
          'will to (dùng sai cấu trúc)',
          'goes to (dùng sai thì)',
          'is going (thiếu to V)'
        ]
      }
    },
    {
      prompt: '“I forgot my reusable bag.” “Don’t worry. I __________ lend you mine.”',
      correct: 'will',
      distractors: ['am going', 'was', 'have'],
      difficulty: 'easy',
      explanation: '“Will” is appropriate for a decision made at the moment of speaking.',
      subtype: 'grammar-context',
      translation: {
        content: '“Tớ quên mang túi tái sử dụng rồi.” “Đừng lo. Tớ __________ cho bạn mượn túi của tớ.”',
        options: [
          'will (bột phát ngay lúc nói)',
          'am going (thiếu to V)',
          'was (quá khứ)',
          'have (hiện tại)'
        ]
      }
    },
    {
      prompt: 'Plastic bottles __________ in the blue container every Friday.',
      correct: 'are collected',
      distractors: ['collect', 'collected', 'are collecting'],
      difficulty: 'easy',
      explanation: 'The present simple passive describes a regular process.',
      subtype: 'grammar-context',
      translation: {
        content: 'Các chai nhựa __________ trong thùng màu xanh vào mỗi Thứ Sáu.',
        options: [
          'are collected (bị động hiện tại đơn số nhiều)',
          'collect (chủ động)',
          'collected (quá khứ)',
          'are collecting (tiếp diễn)'
        ]
      }
    },
    {
      prompt: 'The repair café helps reduce the amount of electronic __________.',
      correct: 'waste',
      distractors: ['wasteful', 'wasted', 'wastingly'],
      difficulty: 'easy',
      explanation: 'The uncountable noun “waste” completes the environmental collocation.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Quán cà phê sửa chữa giúp giảm lượng rác thải __________.',
        options: [
          'waste (danh từ: electronic waste - rác thải điện tử)',
          'wasteful (tính từ: lãng phí)',
          'wasted (tính từ/V-ed)',
          'wastingly (trạng từ)'
        ]
      }
    },
    {
      prompt: 'The eco-club has bought the materials, so it __________ a repair workshop next Saturday.',
      correct: 'is going to hold',
      distractors: ['will holding', 'holds yesterday', 'is hold'],
      difficulty: 'medium',
      explanation: 'The materials show that this is a prior plan.',
      subtype: 'grammar-context',
      translation: {
        content: 'CLB môi trường đã mua vật liệu rồi, nên họ __________ một buổi xưởng sửa chữa vào Thứ Bảy tuần tới.',
        options: [
          'is going to hold (kế hoạch đã chuẩn bị vật liệu)',
          'will holding (sai cấu trúc)',
          'holds yesterday (sai thời gian)',
          'is hold (sai cấu trúc)'
        ]
      }
    },
    {
      prompt: 'Choose the correct passive sentence about the approved plan.',
      correct: 'A new refill station will be installed next month.',
      distractors: [
        'A new refill station will install next month.',
        'A new refill station is install next month.',
        'They will be installed a new refill station next month.'
      ],
      difficulty: 'hard',
      explanation: 'Future passive uses “will be + past participle”.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu bị động đúng về kế hoạch đã phê duyệt:',
        options: [
          'A new refill station will be installed next month. (Một trạm tiếp nước mới sẽ được lắp đặt vào tháng tới.)',
          'A new refill station will install next month. (Sai: dùng chủ động)',
          'A new refill station is install next month. (Sai: dùng sai to be/V-bare)',
          'They will be installed a new refill station next month. (Sai: nhầm chủ ngữ)'
        ]
      }
    }
  ],
  3: [
    {
      prompt: 'The music teacher let us __________ the instruments before rehearsal.',
      correct: 'try',
      distractors: ['to try', 'trying', 'tried'],
      difficulty: 'easy',
      explanation: '“Let + object” is followed by a bare infinitive.',
      subtype: 'grammar-context',
      translation: {
        content: 'Thầy giáo dạy nhạc đã cho phép chúng tớ __________ các nhạc cụ trước giờ tổng duyệt.',
        options: [
          'try (cấu trúc: let + O + V-bare)',
          'to try',
          'trying',
          'tried'
        ]
      }
    },
    {
      prompt: 'Our band hopes __________ at the community concert.',
      correct: 'to perform',
      distractors: ['perform', 'performing to', 'performed'],
      difficulty: 'easy',
      explanation: '“Hope” is followed by a to-infinitive.',
      subtype: 'grammar-context',
      translation: {
        content: 'Ban nhạc của chúng tớ hy vọng __________ tại buổi hòa nhạc cộng đồng.',
        options: [
          'to perform (cấu trúc: hope + to-V)',
          'perform',
          'performing to',
          'performed'
        ]
      }
    },
    {
      prompt: 'The melody was simple, __________ the lyrics carried a powerful message.',
      correct: 'but',
      distractors: ['so', 'or', 'and therefore because'],
      difficulty: 'easy',
      explanation: '“But” expresses the contrast between simple melody and powerful lyrics.',
      subtype: 'grammar-context',
      translation: {
        content: 'Giai điệu thật đơn giản, __________ lời bài hát mang một thông điệp vô cùng mạnh mẽ.',
        options: [
          'but (tương phản: nhưng)',
          'so (vì vậy)',
          'or (hoặc)',
          'and therefore because (dùng sai liên từ)'
        ]
      }
    },
    {
      prompt: 'A person who writes music is called a __________.',
      correct: 'composer',
      distractors: ['composition', 'compose', 'composingly'],
      difficulty: 'easy',
      explanation: '“Composer” is the noun for a person who writes music.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Người viết nhạc được gọi là một __________.',
        options: [
          'composer (danh từ: nhà soạn nhạc)',
          'composition (danh từ: tác phẩm/bản nhạc)',
          'compose (động từ: soạn nhạc)',
          'composingly (trạng từ)'
        ]
      }
    },
    {
      prompt: 'The organisers decided __________ a quieter seating area for the audience.',
      correct: 'to create',
      distractors: ['create', 'creating to', 'created'],
      difficulty: 'medium',
      explanation: '“Decide” is followed by a to-infinitive.',
      subtype: 'grammar-context',
      translation: {
        content: 'Ban tổ chức đã quyết định __________ một khu vực chỗ ngồi yên tĩnh hơn cho khán giả.',
        options: [
          'to create (cấu trúc: decide + to-V)',
          'create',
          'creating to',
          'created'
        ]
      }
    },
    {
      prompt: 'Choose the correctly connected sentence.',
      correct: 'The singer was tired, but she completed the performance confidently.',
      distractors: [
        'The singer was tired, so but she completed the performance confidently.',
        'The singer was tired but, she completed the performance confidently.',
        'The singer was tired, or she completed because the performance confidently.'
      ],
      difficulty: 'hard',
      explanation: 'Two independent clauses can be joined by comma + coordinating conjunction.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu nối đúng ngữ pháp:',
        options: [
          'The singer was tired, but she completed the performance confidently. (Nữ ca sĩ đã mệt, nhưng cô ấy vẫn hoàn thành phần biểu diễn một cách tự tin.)',
          'The singer was tired, so but she completed the performance confidently. (Sai: dùng thừa liên từ so but)',
          'The singer was tired but, she completed the performance confidently. (Sai: đặt dấu phẩy sau but)',
          'The singer was tired, or she completed because the performance confidently. (Sai: dùng sai liên từ or/because)'
        ]
      }
    }
  ],
  4: [
    {
      prompt: 'While the volunteers __________ the wall, a local artist arrived.',
      correct: 'were painting',
      distractors: ['painted', 'are painting', 'paint'],
      difficulty: 'easy',
      explanation: 'The longer background action uses the past continuous.',
      subtype: 'grammar-context',
      translation: {
        content: 'Trong khi các tình nguyện viên __________ bức tường, một nghệ sĩ địa phương đã tới.',
        options: [
          'were painting (hành động đang diễn ra trong quá khứ)',
          'painted',
          'are painting',
          'paint'
        ]
      }
    },
    {
      prompt: 'When we reached the centre, the children __________ books into boxes.',
      correct: 'were putting',
      distractors: ['put now', 'are putting', 'puts'],
      difficulty: 'easy',
      explanation: 'The action was already in progress when another event occurred.',
      subtype: 'grammar-context',
      translation: {
        content: 'Khi chúng tớ đến trung tâm, bọn trẻ __________ sách vào các thùng.',
        options: [
          'were putting (hành động đang diễn ra tại thời điểm quá khứ)',
          'put now',
          'are putting',
          'puts'
        ]
      }
    },
    {
      prompt: 'The youth group __________ enough money for the ramp last summer.',
      correct: 'raised',
      distractors: ['was raise', 'raises yesterday', 'is raising last summer'],
      difficulty: 'easy',
      explanation: 'A finished action at a specified past time uses the past simple.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nhóm thanh niên __________ đủ tiền để xây đường dốc vào mùa hè năm ngoái.',
        options: [
          'raised (hành động đã hoàn thành tại mốc thời gian quá khứ: last summer)',
          'was raise',
          'raises yesterday',
          'is raising last summer'
        ]
      }
    },
    {
      prompt: 'The organisation provides practical __________ to families in difficulty.',
      correct: 'support',
      distractors: ['supportive', 'supporting', 'supportedly'],
      difficulty: 'easy',
      explanation: 'A noun is needed after the adjective “practical”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Tổ chức cung cấp sự __________ thực tế cho các gia đình gặp khó khăn.',
        options: [
          'support (danh từ: sự hỗ trợ / practical support)',
          'supportive (tính từ)',
          'supporting (V-ing)',
          'supportedly (trạng từ)'
        ]
      }
    },
    {
      prompt: 'While one team __________ the lights, another team was checking the entrance.',
      correct: 'was replacing',
      distractors: ['replaced suddenly', 'is replacing', 'has replaced'],
      difficulty: 'medium',
      explanation: 'Two simultaneous background actions use the past continuous.',
      subtype: 'grammar-context',
      translation: {
        content: 'Trong khi một đội __________ hệ thống đèn, một đội khác đang kiểm tra lối vào.',
        options: [
          'was replacing (hai hành động song song cùng diễn ra trong quá khứ)',
          'replaced suddenly',
          'is replacing',
          'has replaced'
        ]
      }
    },
    {
      prompt: 'Choose the sentence with the correct time relationship.',
      correct: 'The residents were testing the ramp when the survey team arrived.',
      distractors: [
        'The residents tested the ramp while the survey team was arrived.',
        'The residents were test the ramp when the survey team arrived.',
        'The residents are testing the ramp when the survey team arrived yesterday.'
      ],
      difficulty: 'hard',
      explanation: 'Past continuous marks the ongoing action; past simple marks the interrupting event.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu có mối quan hệ thời gian đúng ngữ pháp:',
        options: [
          'The residents were testing the ramp when the survey team arrived. (Người dân đang thử đường dốc thì đội khảo sát tới.)',
          'The residents tested the ramp while the survey team was arrived. (Sai: was arrived)',
          'The residents were test the ramp when the survey team arrived. (Sai: were test)',
          'The residents are testing the ramp when the survey team arrived yesterday. (Sai: phối hợp thì hiện tại - quá khứ)'
        ]
      }
    }
  ],
  5: [
    {
      prompt: 'The team __________ this prototype for three months.',
      correct: 'has tested',
      distractors: ['tested for', 'is test', 'have testing'],
      difficulty: 'easy',
      explanation: '“For three months” with an unfinished period calls for the present perfect.',
      subtype: 'grammar-context',
      translation: {
        content: 'Đội ngũ __________ mẫu thử này được 3 tháng rồi.',
        options: [
          'has tested (chia Hiện tại hoàn thành với for + khoảng thời gian)',
          'tested for',
          'is test',
          'have testing'
        ]
      }
    },
    {
      prompt: 'We have not received the user feedback __________.',
      correct: 'yet',
      distractors: ['already not', 'ever yesterday', 'since'],
      difficulty: 'easy',
      explanation: '“Yet” is common in present-perfect negatives and questions.',
      subtype: 'grammar-context',
      translation: {
        content: 'Chúng tớ vẫn chưa nhận được phản hồi của người dùng __________.',
        options: [
          'yet (chưa: đứng cuối câu phủ định Hiện tại hoàn thành)',
          'already not',
          'ever yesterday',
          'since'
        ]
      }
    },
    {
      prompt: 'The designers enjoy __________ users operate the device.',
      correct: 'watching',
      distractors: ['to watching', 'watch', 'watched to'],
      difficulty: 'easy',
      explanation: '“Enjoy” is followed by a gerund.',
      subtype: 'grammar-context',
      translation: {
        content: 'Các nhà thiết kế thích __________ người dùng vận hành thiết bị.',
        options: [
          'watching (cấu trúc: enjoy + V-ing)',
          'to watching',
          'watch',
          'watched to'
        ]
      }
    },
    {
      prompt: 'The team built an early __________ so that users could test the design.',
      correct: 'prototype',
      distractors: ['prototypical', 'prototyping quickly', 'prototyped'],
      difficulty: 'easy',
      explanation: 'The countable noun “prototype” names an early test version.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Đội ngũ đã chế tạo một __________ ban đầu để người dùng có thể thử nghiệm thiết kế.',
        options: [
          'prototype (danh từ: mẫu thử nghiệm ban đầu)',
          'prototypical (tính từ)',
          'prototyping quickly (cụm V-ing)',
          'prototyped (động từ V-ed)'
        ]
      }
    },
    {
      prompt: 'The application has been available __________ 2024.',
      correct: 'since',
      distractors: ['for', 'yet', 'ever'],
      difficulty: 'medium',
      explanation: '“Since” introduces the starting point of a continuing period.',
      subtype: 'grammar-context',
      translation: {
        content: 'Ứng dụng đã có sẵn kể từ năm __________ 2024.',
        options: [
          'since (kể từ + mốc thời gian)',
          'for (khoảng thời gian)',
          'yet',
          'ever'
        ]
      }
    },
    {
      prompt: 'Choose the grammatically correct evaluation.',
      correct: 'After testing the device, the team decided to simplify its controls.',
      distractors: [
        'After test the device, the team decided simplifying its controls.',
        'After testing the device, the team decided simplify its controls.',
        'After to test the device, the team decided to simplifying its controls.'
      ],
      difficulty: 'hard',
      explanation: 'Use a gerund after “after” and a to-infinitive after “decide”.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu đánh giá đúng ngữ pháp:',
        options: [
          'After testing the device, the team decided to simplify its controls. (Sau khi thử nghiệm thiết bị, nhóm đã quyết định đơn giản hóa bảng điều khiển.)',
          'After test the device, the team decided simplifying its controls. (Sai: sau giới từ after phải dùng V-ing)',
          'After testing the device, the team decided simplify its controls. (Sai: sau decide phải dùng to-V)',
          'After to test the device, the team decided to simplifying its controls. (Sai: dùng sai to V-ing)'
        ]
      }
    }
  ],
  6: [
    {
      prompt: 'All candidates __________ the same core questions.',
      correct: 'must be asked',
      distractors: ['must ask', 'must be asking by', 'are must asked'],
      difficulty: 'easy',
      explanation: 'Modal passive uses “modal + be + past participle”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Tất cả các ứng viên __________ cùng những câu hỏi cốt lõi như nhau.',
        options: [
          'must be asked (bị động với modal: must be + V3)',
          'must ask',
          'must be asking by',
          'are must asked'
        ]
      }
    },
    {
      prompt: 'Leadership skills __________ through practice and feedback.',
      correct: 'can be developed',
      distractors: ['can develop by', 'can developed', 'are can develop'],
      difficulty: 'easy',
      explanation: 'The receiver of the action requires the passive form.',
      subtype: 'grammar-context',
      translation: {
        content: 'Các kỹ năng lãnh đạo __________ thông qua rèn luyện và phản hồi.',
        options: [
          'can be developed (bị động với can: can be + V3)',
          'can develop by',
          'can developed',
          'are can develop'
        ]
      }
    },
    {
      prompt: 'Students __________ by gender stereotypes.',
      correct: 'should not be judged',
      distractors: ['should not judge', 'should not judged', 'do not should judge'],
      difficulty: 'easy',
      explanation: 'Use “should not be + past participle”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Học sinh __________ dựa trên những định kiến giới.',
        options: [
          'should not be judged (không nên bị đánh giá: should not be + V3)',
          'should not judge',
          'should not judged',
          'do not should judge'
        ]
      }
    },
    {
      prompt: 'The new process aims to promote gender __________.',
      correct: 'equality',
      distractors: ['equal', 'equally', 'equalise'],
      difficulty: 'easy',
      explanation: 'A noun is needed after “gender”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Quy trình mới nhằm thúc đẩy bình đẳng __________.',
        options: [
          'equality (danh từ: gender equality)',
          'equal (tính từ)',
          'equally (trạng từ)',
          'equalise (động từ)'
        ]
      }
    },
    {
      prompt: 'Application data __________ regularly if the school wants to identify hidden barriers.',
      correct: 'should be reviewed',
      distractors: ['should review', 'should be review', 'reviews should'],
      difficulty: 'medium',
      explanation: 'The data receives the action, so use the modal passive.',
      subtype: 'grammar-context',
      translation: {
        content: 'Dữ liệu đơn đăng ký __________ thường xuyên nếu nhà trường muốn xác định các rào cản tiềm ẩn.',
        options: [
          'should be reviewed (bị động với should: should be + V3)',
          'should review',
          'should be review',
          'reviews should'
        ]
      }
    },
    {
      prompt: 'Choose the most accurate modal-perfect passive sentence.',
      correct: 'The unequal access may have been overlooked in earlier reviews.',
      distractors: [
        'The unequal access may have overlooked in earlier reviews.',
        'The unequal access may has been overlook in earlier reviews.',
        'Earlier reviews may been overlooked the unequal access.'
      ],
      difficulty: 'hard',
      explanation: 'Modal-perfect passive uses “may have been + past participle”.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu bị động khuyết thiếu hoàn thành chính xác nhất:',
        options: [
          'The unequal access may have been overlooked in earlier reviews. (Sự tiếp cận không bình đẳng có thể đã bị bỏ qua trong các đợt xem xét trước đó.)',
          'The unequal access may have overlooked in earlier reviews. (Sai: thiếu been)',
          'The unequal access may has been overlook in earlier reviews. (Sai: may has been -> may have been)',
          'Earlier reviews may been overlooked the unequal access. (Sai: dùng sai cấu trúc)'
        ]
      }
    }
  ],
  7: [
    {
      prompt: 'The revised plan is __________ than the first draft.',
      correct: 'more specific',
      distractors: ['specificer', 'most specific', 'more specifically plan'],
      difficulty: 'easy',
      explanation: 'A multi-syllable adjective normally forms the comparative with “more”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Kế hoạch sửa đổi thì __________ hơn so với bản thảo đầu tiên.',
        options: [
          'more specific (cụ thể hơn: so sánh hơn tính từ dài)',
          'specificer',
          'most specific',
          'more specifically plan'
        ]
      }
    },
    {
      prompt: 'This is the __________ youth project in the programme.',
      correct: 'most collaborative',
      distractors: ['more collaborative', 'collaborativest', 'most collaboratively'],
      difficulty: 'easy',
      explanation: 'Use the superlative after “the” when comparing the whole group.',
      subtype: 'grammar-context',
      translation: {
        content: 'Đây là dự án thanh niên mang tính hợp tác __________ trong chương trình.',
        options: [
          'most collaborative (mang tính hợp tác nhất - so sánh nhất với the)',
          'more collaborative',
          'collaborativest',
          'most collaboratively'
        ]
      }
    },
    {
      prompt: 'Local knowledge made the evacuation map __________ accurate.',
      correct: 'more',
      distractors: ['most than', 'many', 'muchest'],
      difficulty: 'easy',
      explanation: '“More accurate” is the correct comparative form.',
      subtype: 'grammar-context',
      translation: {
        content: 'Tri thức địa phương đã làm cho bản đồ sơ tán trở nên chính xác __________.',
        options: [
          'more (chính xác hơn: more accurate)',
          'most than',
          'many',
          'muchest'
        ]
      }
    },
    {
      prompt: 'The project depends on international __________.',
      correct: 'cooperation',
      distractors: ['cooperate', 'cooperative', 'cooperatively'],
      difficulty: 'easy',
      explanation: 'A noun is required after the adjective “international”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Dự án phụ thuộc vào sự __________ quốc tế.',
        options: [
          'cooperation (danh từ: sự hợp tác)',
          'cooperate (động từ)',
          'cooperative (tính từ)',
          'cooperatively (trạng từ)'
        ]
      }
    },
    {
      prompt: 'The tested route was __________ safer than the route in the original plan.',
      correct: 'far',
      distractors: ['very more', 'most', 'many'],
      difficulty: 'medium',
      explanation: '“Far” can intensify a comparative adjective.',
      subtype: 'grammar-context',
      translation: {
        content: 'Tuyến đường thử nghiệm an toàn hơn __________ nhiều so với tuyến đường trong kế hoạch ban đầu.',
        options: [
          'far (nhấn mạnh so sánh hơn: far safer)',
          'very more',
          'most',
          'many'
        ]
      }
    },
    {
      prompt: 'Choose the equivalent sentence: “This is the most practical proposal in the forum.”',
      correct: 'No other proposal in the forum is as practical as this one.',
      distractors: [
        'Every proposal is more practical than this one.',
        'This proposal is less practical than all the others.',
        'No proposal in the forum is practical.'
      ],
      difficulty: 'hard',
      explanation: '“No other … as + adjective + as” preserves the superlative meaning.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu tương đương nghĩa với câu: “Đây là đề xuất thực tế nhất trong diễn đàn.”',
        options: [
          'No other proposal in the forum is as practical as this one. (Không có đề xuất nào khác trong diễn đàn thực tế bằng đề xuất này.)',
          'Every proposal is more practical than this one. (Mọi đề xuất đều thực tế hơn đề xuất này.)',
          'This proposal is less practical than all the others. (Đề xuất này kém thực tế hơn tất cả các đề xuất khác.)',
          'No proposal in the forum is practical. (Không đề xuất nào trong diễn đàn là thực tế.)'
        ]
      }
    }
  ],
  8: [
    {
      prompt: 'The teacher __________ introduced retrieval practice is very patient.',
      correct: 'who',
      distractors: ['which', 'where', 'whose practice'],
      difficulty: 'easy',
      explanation: '“Who” refers to a person and functions as the subject.',
      subtype: 'grammar-context',
      translation: {
        content: 'Thầy giáo, người __________ giới thiệu phương pháp luyện tập gợi nhớ kiến thức, rất kiên nhẫn.',
        options: [
          'who (đại từ chỉ người làm chủ ngữ)',
          'which',
          'where',
          'whose practice'
        ]
      }
    },
    {
      prompt: 'The questions __________ we answer from memory reveal learning gaps.',
      correct: 'which',
      distractors: ['who', 'where', 'whose'],
      difficulty: 'easy',
      explanation: '“Which” refers to things.',
      subtype: 'grammar-context',
      translation: {
        content: 'Những câu hỏi __________ chúng tớ trả lời từ trí nhớ giúp bộc lộ các lỗ hổng kiến thức.',
        options: [
          'which (đại từ chỉ vật)',
          'who',
          'where',
          'whose'
        ]
      }
    },
    {
      prompt: 'The online room __________ our group meets has a shared whiteboard.',
      correct: 'where',
      distractors: ['who', 'which person', 'whose students'],
      difficulty: 'easy',
      explanation: '“Where” refers to a place.',
      subtype: 'grammar-context',
      translation: {
        content: 'Phòng học trực tuyến __________ nhóm chúng tớ họp có một bảng trắng chung.',
        options: [
          'where (trạng từ quan hệ chỉ nơi chốn)',
          'who',
          'which person',
          'whose students'
        ]
      }
    },
    {
      prompt: 'Timely __________ helps students recognise and correct mistakes.',
      correct: 'feedback',
      distractors: ['feed backly', 'feedbacking', 'fed back'],
      difficulty: 'easy',
      explanation: 'The noun “feedback” is the natural learning-related collocation.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Những __________ kịp thời giúp học sinh nhận ra và sửa chữa các sai sót.',
        options: [
          'feedback (danh từ: phản hồi/nhận xét)',
          'feed backly',
          'feedbacking',
          'fed back'
        ]
      }
    },
    {
      prompt: 'Our learning platform, __________ was updated yesterday, now loads more quickly.',
      correct: 'which',
      distractors: ['that without commas', 'who', 'where'],
      difficulty: 'medium',
      explanation: 'A non-defining clause about a thing uses comma + “which”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nền tảng học tập của chúng tớ, cái __________ được cập nhật ngày hôm qua, giờ đây tải nhanh hơn.',
        options: [
          'which (đại từ chỉ vật trong mệnh đề không xác định có dấu phẩy)',
          'that without commas',
          'who',
          'where'
        ]
      }
    },
    {
      prompt: 'Choose the correctly punctuated sentence.',
      correct: 'Trang, who facilitates today’s session, has prepared three questions.',
      distractors: [
        'Trang who facilitates today’s session, has prepared three questions.',
        'Trang, that facilitates today’s session has prepared three questions.',
        'Trang which facilitates today’s session, has prepared three questions.'
      ],
      difficulty: 'hard',
      explanation: 'The non-defining clause about Trang uses “who” between two commas.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu sử dụng dấu câu đúng ngữ pháp:',
        options: [
          'Trang, who facilitates today’s session, has prepared three questions. (Trang, người điều phối buổi học hôm nay, đã chuẩn bị ba câu hỏi.)',
          'Trang who facilitates today’s session, has prepared three questions. (Sai: thiếu dấu phẩy đầu)',
          'Trang, that facilitates today’s session has prepared three questions. (Sai: không dùng that sau dấu phẩy)',
          'Trang which facilitates today’s session, has prepared three questions. (Sai: không dùng which cho người)'
        ]
      }
    }
  ],
  9: [
    {
      prompt: 'Lan said that she __________ water samples after school.',
      correct: 'was collecting',
      distractors: ['is collecting yesterday', 'collects tomorrow', 'has collect'],
      difficulty: 'easy',
      explanation: 'Present continuous normally backshifts to past continuous in reported speech.',
      subtype: 'grammar-context',
      translation: {
        content: 'Lan nói rằng bạn ấy __________ các mẫu nước sau giờ học.',
        options: [
          'was collecting (lùi thì hiện tại tiếp diễn -> quá khứ tiếp diễn)',
          'is collecting yesterday',
          'collects tomorrow',
          'has collect'
        ]
      }
    },
    {
      prompt: 'The teacher asked whether the samples __________ from the same site.',
      correct: 'had come',
      distractors: ['do come', 'are coming yesterday', 'comes'],
      difficulty: 'easy',
      explanation: 'The earlier past action is reported with the past perfect.',
      subtype: 'grammar-context',
      translation: {
        content: 'Thầy giáo đã hỏi liệu các mẫu thử __________ từ cùng một địa điểm hay không.',
        options: [
          'had come (hành động xảy ra trước thời điểm hỏi nên chia quá khứ hoàn thành)',
          'do come',
          'are coming yesterday',
          'comes'
        ]
      }
    },
    {
      prompt: 'The reporter asked __________ the dark water had first appeared.',
      correct: 'where',
      distractors: ['if where', 'that', 'did where'],
      difficulty: 'easy',
      explanation: 'A reported wh-question keeps the wh-word and statement word order.',
      subtype: 'grammar-context',
      translation: {
        content: 'Phóng viên đã hỏi xem nguồn nước đen đã xuất hiện đầu tiên ở __________.',
        options: [
          'where (trạng từ quan hệ/từ để hỏi chỉ nơi chốn)',
          'if where',
          'that',
          'did where'
        ]
      }
    },
    {
      prompt: 'Regular monitoring provides more reliable __________.',
      correct: 'evidence',
      distractors: ['evident', 'evidently', 'evidenceful'],
      difficulty: 'easy',
      explanation: 'A noun is required after “reliable”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Việc giám sát thường xuyên cung cấp các __________ đáng tin cậy hơn.',
        options: [
          'evidence (danh từ: bằng chứng)',
          'evident (tính từ)',
          'evidently (trạng từ)',
          'evidenceful'
        ]
      }
    },
    {
      prompt: 'The teacher told the team __________ an unsupported accusation.',
      correct: 'not to make',
      distractors: ['to not made', 'do not make', 'not making to'],
      difficulty: 'medium',
      explanation: 'A negative reported command uses “told + object + not to + verb”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Thầy giáo đã bảo nhóm __________ một lời cáo buộc thiếu căn cứ.',
        options: [
          'not to make (cấu trúc câu mệnh lệnh gián tiếp phủ định: told + O + not to V)',
          'to not made',
          'do not make',
          'not making to'
        ]
      }
    },
    {
      prompt: 'Choose the correct reported sentence for “We will test the water tomorrow,” they said.',
      correct: 'They said that they would test the water the following day.',
      distractors: [
        'They said that we will test the water tomorrow.',
        'They said that they would tested the water the following day.',
        'They asked that they will test the water yesterday.'
      ],
      difficulty: 'hard',
      explanation: '“Will” backshifts to “would” and “tomorrow” changes to “the following day”.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu tường thuật đúng cho: “Chúng tớ sẽ xét nghiệm nước vào ngày mai,” họ nói.',
        options: [
          'They said that they would test the water the following day. (Họ nói rằng họ sẽ xét nghiệm nước vào ngày hôm sau.)',
          'They said that we will test the water tomorrow. (Sai: chưa đổi ngôi và chưa lùi thì)',
          'They said that they would tested the water the following day. (Sai: would + V1 không chia V-ed)',
          'They asked that they will test the water yesterday. (Sai cấu trúc)'
        ]
      }
    }
  ],
  10: [
    {
      prompt: 'If visitors follow the marked trail, they __________ the nesting area.',
      correct: 'will protect',
      distractors: ['would protected', 'protecting', 'will protected'],
      difficulty: 'easy',
      explanation: 'A real future condition uses present simple + “will”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nếu du khách tuân thủ tuyến đường đã đánh dấu, họ __________ khu vực làm tổ của động vật.',
        options: [
          'will protect (Mệnh đề chính loại 1 dùng will + V)',
          'would protected',
          'protecting',
          'will protected'
        ]
      }
    },
    {
      prompt: 'If I __________ the village guide, I would limit group size.',
      correct: 'were',
      distractors: ['am', 'will be', 'have been tomorrow'],
      difficulty: 'easy',
      explanation: 'A hypothetical type-2 condition commonly uses “were”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nếu tớ __________ hướng dẫn viên của làng, tớ sẽ giới hạn quy mô nhóm tham quan.',
        options: [
          'were (Giả định loại 2: If I were...)',
          'am',
          'will be',
          'have been tomorrow'
        ]
      }
    },
    {
      prompt: 'Visitors will not enter the wetland __________ they book a guided time slot.',
      correct: 'unless',
      distractors: ['if not because', 'when not', 'although if'],
      difficulty: 'easy',
      explanation: '“Unless” means “if not”.',
      subtype: 'grammar-context',
      translation: {
        content: 'Du khách sẽ không được vào khu đất ngập nước __________ họ đặt trước một khung giờ có hướng dẫn viên.',
        options: [
          'unless (trừ khi / nếu không: unless = if not)',
          'if not because',
          'when not',
          'although if'
        ]
      }
    },
    {
      prompt: 'The village wants tourism to be environmentally __________.',
      correct: 'sustainable',
      distractors: ['sustain', 'sustainably tourism', 'sustainability'],
      difficulty: 'easy',
      explanation: 'An adjective is needed after “be environmentally”.',
      subtype: 'vocabulary-use',
      translation: {
        content: 'Ngôi làng muốn hoạt động du lịch phải __________ về mặt môi trường.',
        options: [
          'sustainable (tính từ: bền vững / environmentally sustainable)',
          'sustain (động từ)',
          'sustainably tourism',
          'sustainability (danh từ)'
        ]
      }
    },
    {
      prompt: 'If tour fees __________ transparent, residents would trust the programme more.',
      correct: 'were',
      distractors: ['will be', 'are yesterday', 'would be'],
      difficulty: 'medium',
      explanation: 'A hypothetical present condition uses past simple in the if-clause.',
      subtype: 'grammar-context',
      translation: {
        content: 'Nếu phí tham quan __________ minh bạch, người dân sẽ tin tưởng chương trình hơn.',
        options: [
          'were (Mệnh đề if loại 2 chia quá khứ đơn/were)',
          'will be',
          'are yesterday',
          'would be'
        ]
      }
    },
    {
      prompt: 'Choose the sentence that correctly contrasts a real and a hypothetical result.',
      correct: 'If the guide explains the rule, visitors will follow it; if there were no guide, some might enter the nesting area.',
      distractors: [
        'If the guide will explain the rule, visitors follow it; if there is no guide, some would entered.',
        'If the guide explained the rule tomorrow, visitors will followed it; if there were no guide, some enter.',
        'If the guide explains the rule, visitors would followed it; if there was no guide, some will entering.'
      ],
      difficulty: 'hard',
      explanation: 'The first clause uses type 1; the second uses type 2 consistently.',
      subtype: 'editing',
      translation: {
        content: 'Chọn câu tương phản đúng giữa kết quả có thật và kết quả giả định:',
        options: [
          'If the guide explains the rule, visitors will follow it; if there were no guide, some might enter the nesting area. (Nếu hướng dẫn viên giải thích quy định, du khách sẽ tuân thủ; nếu không có hướng dẫn viên, một số người có thể đi vào khu vực làm tổ.)',
          'If the guide will explain the rule, visitors follow it; if there is no guide, some would entered. (Sai ngữ pháp)',
          'If the guide explained the rule tomorrow, visitors will followed it; if there were no guide, some enter. (Sai ngữ pháp)',
          'If the guide explains the rule, visitors would followed it; if there was no guide, some will entering. (Sai ngữ pháp)'
        ]
      }
    }
  ]
};

const arrangeChoice = (
  questionId: string,
  correct: string,
  distractors: [string, string, string],
  translationOptions?: string[]
): { options: string[]; answer: ChoiceLetter; arrangedTranslationOptions?: string[] } => {
  const correctIndex = [...questionId].reduce((total, character) => total + character.charCodeAt(0), 0) % 4;
  const rawOptions = [...distractors];
  rawOptions.splice(correctIndex, 0, correct);

  let arrangedTranslationOptions: string[] | undefined;
  if (translationOptions && translationOptions.length === 4) {
    // translation.options gốc theo thứ tự [correct, dist0, dist1, dist2]
    const rawTranslation = [translationOptions[1], translationOptions[2], translationOptions[3]];
    rawTranslation.splice(correctIndex, 0, translationOptions[0]);
    arrangedTranslationOptions = rawTranslation;
  }

  return {
    options: rawOptions.map((option, index) => `${letters[index]}. ${option}`),
    answer: letters[correctIndex],
    arrangedTranslationOptions
  };
};

const languageQuestionType = (spec: UnitDepthSpec): QuestionType => ({
  id: `eng10-deep-qt-u${spec.unit}-language-in-context`,
  topicId: spec.topicId,
  name: `Language in context nâng cao – ${spec.theme}`,
  slug: `language-in-context-deep-u${spec.unit}`,
  description: 'Vận dụng cấu trúc và từ vựng của Unit trong câu có ngữ cảnh, từ nhận biết đến phát hiện/chỉnh lỗi.',
  exampleQuestionId: `eng10-deep-u${spec.unit}-g1`,
  theory: [
    'Đọc toàn bộ câu để xác định thời gian, chủ thể, quan hệ ý và từ loại cần dùng.',
    'Không chọn chỉ vì thấy một từ khóa; phải kiểm tra cả nghĩa và cấu trúc.',
    'Ở câu sửa lỗi, đọc lại toàn câu sau khi chọn để kiểm tra tính tự nhiên.'
  ],
  subTypes: [
    { id: `eng10-u${spec.unit}-deep-language-grammar-context`, name: 'Ngữ pháp trong ngữ cảnh', example: 'Choose the form that completes the meaning', targetQuestionCount: 4 },
    { id: `eng10-u${spec.unit}-deep-language-vocabulary-use`, name: 'Từ vựng và từ loại', example: 'Choose the context-appropriate word', targetQuestionCount: 1 },
    { id: `eng10-u${spec.unit}-deep-language-editing`, name: 'Phát hiện và chỉnh câu', example: 'Choose the grammatically accurate sentence', targetQuestionCount: 1 }
  ],
  recognitionSigns: ['Câu có ngữ cảnh Unit và yêu cầu đồng thời kiểm tra nghĩa với hình thức ngôn ngữ.'],
  solvingSteps: ['Khoanh dấu hiệu ngữ cảnh.', 'Xác định cấu trúc/từ loại.', 'Loại phương án sai nghĩa hoặc sai kết hợp.', 'Đọc kiểm tra toàn câu.'],
  commonMistakes: ['Nhìn một từ khóa rồi chọn ngay.', 'Chỉ kiểm tra ngữ pháp mà bỏ qua nghĩa.', 'Không kiểm tra sự hòa hợp chủ ngữ–động từ.'],
  difficulty: 'medium',
  examFrequency: 'high',
  practiceCoverage: {
    targetQuestionCount: 6,
    minimumQuestionsPerSubType: 1,
    requiredPracticeRoles: ['guided', 'near_transfer', 'far_transfer'],
    requiredRepresentations: ['text'],
    masteryHoldoutCount: 1
  }
});

const languageQuestion = (spec: UnitDepthSpec, index: number, seed: ChoiceSeed): Question => {
  const questionId = `eng10-deep-u${spec.unit}-g${index + 1}`;
  const arranged = arrangeChoice(questionId, seed.correct, seed.distractors, seed.translation?.options);
  return {
    id: questionId,
    subjectId: 'english',
    topicId: spec.topicId,
    questionTypeId: `eng10-deep-qt-u${spec.unit}-language-in-context`,
    content: seed.prompt,
    options: arranged.options,
    correctAnswer: arranged.answer,
    translation: seed.translation ? {
      ...seed.translation,
      options: arranged.arrangedTranslationOptions ?? seed.translation.options
    } : undefined,
    difficulty: seed.difficulty,
    sourceType: 'manual',
    validatorType: 'choice',
    responseType: 'single_choice',
    outcomeIds: [`eng10-lo-u${spec.unit}-language`],
    competency: 'english_language_knowledge',
    cognitiveLevel: seed.difficulty === 'easy' ? 'recognition' : seed.difficulty === 'medium' ? 'understanding' : 'application',
    estimatedSeconds: seed.difficulty === 'hard' ? 100 : 65,
    subTypeId: `eng10-u${spec.unit}-deep-language-${seed.subtype}`,
    practiceRole: seed.difficulty === 'easy' ? 'guided' : seed.difficulty === 'medium' ? 'near_transfer' : 'far_transfer',
    representationType: 'text',
    isMasteryHoldout: seed.difficulty === 'hard'
  };
};

const languageSolution = (spec: UnitDepthSpec, index: number, seed: ChoiceSeed): Solution => {
  const questionId = `eng10-deep-u${spec.unit}-g${index + 1}`;
  const arranged = arrangeChoice(questionId, seed.correct, seed.distractors);
  return {
    id: `eng10-deep-sol-u${spec.unit}-g${index + 1}`,
    questionId,
    recognition: 'Language in context: xác định dấu hiệu nghĩa và cấu trúc trước khi chọn.',
    detailedSteps: [
      {
        order: 1,
        title: 'Quy tắc trong ngữ cảnh',
        explanation: seed.explanation,
        result: `Đáp án ${arranged.answer}: ${seed.correct}`
      },
      {
        order: 2,
        title: 'Kiểm tra lại',
        explanation: 'Thay phương án vào chỗ trống và đọc toàn câu để kiểm tra nghĩa, hình thức và tính tự nhiên.'
      }
    ],
    finalAnswer: arranged.answer,
    commonMistakes: ['Chọn theo từ khóa nhưng không kiểm tra toàn câu.', 'Nhầm dạng từ hoặc cấu trúc đi kèm.'],
    reviewSuggestions: [`Ôn Language Unit ${spec.unit}, sau đó tự đặt một câu mới dùng cùng cấu trúc.`]
  };
};

const readingSeeds = (spec: UnitDepthSpec): ChoiceSeed[] => [
  {
    prompt: 'What is the passage mainly about?',
    correct: spec.reading.mainIdea,
    distractors: [
      `A general history of ${spec.theme.toLowerCase()}`,
      'A personal biography with no practical decision',
      'An advertisement that reports no evidence'
    ],
    difficulty: 'easy',
    explanation: 'The answer covers the problem, action and result across the whole passage.',
    subtype: 'gist'
  },
  {
    prompt: spec.reading.detailOneQuestion,
    correct: spec.reading.detailOneAnswer,
    distractors: [spec.reading.detailTwoAnswer, 'The activity was cancelled immediately.', 'The passage does not mention any action.'],
    difficulty: 'easy',
    explanation: `The passage states: ${spec.reading.detailOneAnswer}.`,
    subtype: 'detail'
  },
  {
    prompt: spec.reading.detailTwoQuestion,
    correct: spec.reading.detailTwoAnswer,
    distractors: [spec.reading.detailOneAnswer, 'No result was recorded.', 'The original plan continued without change.'],
    difficulty: 'medium',
    explanation: `The relevant reported detail is: ${spec.reading.detailTwoAnswer}.`,
    subtype: 'detail'
  },
  {
    prompt: `The word “${spec.reading.vocabulary}” is closest in meaning to __________.`,
    correct: spec.reading.vocabularyMeaning,
    distractors: ['unrelated to the situation', 'impossible to observe', 'done without any purpose'],
    difficulty: 'medium',
    explanation: `In this context, “${spec.reading.vocabulary}” means ${spec.reading.vocabularyMeaning}.`,
    subtype: 'vocabulary'
  },
  {
    prompt: 'What can reasonably be inferred from the passage?',
    correct: spec.reading.inference,
    distractors: spec.reading.inferenceDistractors,
    difficulty: 'hard',
    explanation: 'This conclusion follows from more than one detail without going beyond the evidence.',
    subtype: 'inference'
  },
  {
    prompt: 'Which statement best explains why the conclusion is credible?',
    correct: spec.reading.evaluation,
    distractors: spec.reading.evaluationDistractors,
    difficulty: 'hard',
    explanation: 'The strongest answer identifies the evidence or method used in the passage.',
    subtype: 'inference'
  }
];

const listeningSeeds = (spec: UnitDepthSpec): ChoiceSeed[] => [
  {
    prompt: 'What is the main purpose of the conversation?',
    correct: spec.listening.purpose,
    distractors: [
      `To advertise an unrelated ${spec.theme.toLowerCase()} product`,
      'To repeat a decision that has already been cancelled',
      'To describe a problem without considering any response'
    ],
    difficulty: 'easy',
    explanation: 'The speakers identify an issue and work toward the stated purpose.',
    subtype: 'gist'
  },
  {
    prompt: spec.listening.detailOneQuestion,
    correct: spec.listening.detailOneAnswer,
    distractors: [spec.listening.detailTwoAnswer, 'No specific detail is agreed.', 'The speakers postpone every activity.'],
    difficulty: 'medium',
    explanation: `The script directly gives this detail: ${spec.listening.detailOneAnswer}.`,
    subtype: 'detail'
  },
  {
    prompt: spec.listening.detailTwoQuestion,
    correct: spec.listening.detailTwoAnswer,
    distractors: [spec.listening.detailOneAnswer, 'Immediately before the conversation', 'The speakers do not decide.'],
    difficulty: 'medium',
    explanation: `The correct information is: ${spec.listening.detailTwoAnswer}.`,
    subtype: 'detail'
  },
  {
    prompt: spec.listening.reasonQuestion,
    correct: spec.listening.reasonAnswer,
    distractors: ['Because evidence is considered unnecessary.', 'Because the original problem has disappeared.', 'Because only one speaker is allowed to decide.'],
    difficulty: 'hard',
    explanation: `The speakers’ reason is: ${spec.listening.reasonAnswer}.`,
    subtype: 'inference'
  },
  {
    prompt: 'What can be inferred about the speakers’ approach?',
    correct: spec.listening.inference,
    distractors: spec.listening.inferenceDistractors,
    difficulty: 'hard',
    explanation: 'The answer summarises the attitude shown by their choices and reasons.',
    subtype: 'inference'
  }
];


const choiceQuestion = (
  spec: UnitDepthSpec,
  skill: 'r' | 'l' | 'c',
  index: number,
  seed: ChoiceSeed
): Question => {
  const questionId = `eng10-deep-u${spec.unit}-${skill}${index + 1}`;
  const arranged = arrangeChoice(questionId, seed.correct, seed.distractors);
  const typeSkill = skill === 'r' ? 'reading' : skill === 'l' ? 'listening' : 'speaking';
  const competency = skill === 'r'
    ? 'english_reading'
    : skill === 'l'
      ? 'english_listening'
      : 'english_interaction';

  return {
    id: questionId,
    subjectId: 'english',
    topicId: skill === 'l' ? listeningExtensionTopicId : spec.topicId,
    questionTypeId: `eng10-skill-qt-u${spec.unit}-${typeSkill}`,
    content: seed.prompt,
    options: arranged.options,
    correctAnswer: arranged.answer,
    difficulty: seed.difficulty,
    sourceType: 'manual',
    validatorType: 'choice',
    responseType: 'single_choice',
    stimulus: skill === 'r'
      ? {
          id: `eng10-deep-stim-u${spec.unit}-reading`,
          title: spec.reading.title,
          content: spec.reading.text
        }
      : skill === 'l'
        ? {
            id: `eng10-deep-stim-u${spec.unit}-listening`,
            title: spec.listening.title,
            content: 'Nhấn phát để nghe. Transcript chỉ xuất hiện trong lời giải sau khi hoàn thành.',
            audioText: spec.listening.script,
            audioLanguage: 'en-US',
            audioPlaybackRate: 0.9
          }
        : undefined,
    outcomeIds: [`eng10-lo-u${spec.unit}-${skill === 'r' ? 'reading' : skill === 'l' ? 'listening' : 'speaking'}`],
    competency,
    cognitiveLevel: seed.difficulty === 'easy' ? 'recognition' : seed.difficulty === 'medium' ? 'understanding' : 'application',
    estimatedSeconds: skill === 'l' ? 170 : skill === 'r' ? 110 : 75,
    subTypeId: `eng10-u${spec.unit}-${typeSkill}-${seed.subtype}`,
    practiceRole: seed.difficulty === 'easy' ? 'guided' : seed.difficulty === 'medium' ? 'near_transfer' : 'far_transfer',
    representationType: skill === 'l' ? 'audio' : skill === 'c' ? 'dialogue' : 'text',
    isMasteryHoldout: seed.difficulty === 'hard' && index === (skill === 'c' ? 5 : skill === 'r' ? 5 : 4)
  };
};


const choiceSolution = (
  spec: UnitDepthSpec,
  skill: 'r' | 'l' | 'c',
  index: number,
  seed: ChoiceSeed
): Solution => {
  const questionId = `eng10-deep-u${spec.unit}-${skill}${index + 1}`;
  const arranged = arrangeChoice(questionId, seed.correct, seed.distractors);
  return {
    id: `eng10-deep-sol-u${spec.unit}-${skill}${index + 1}`,
    questionId,
    recognition: skill === 'r'
      ? 'Đọc câu hỏi, tìm bằng chứng rồi kiểm tra phạm vi kết luận.'
      : skill === 'l'
        ? 'Nghe toàn ý trước, lượt sau xác nhận chi tiết và quan hệ nguyên nhân.'
        : 'Xét mục tiêu giao tiếp, mức độ lịch sự và bước hành động tiếp theo.',
    detailedSteps: [
      {
        order: 1,
        title: 'Bằng chứng và loại trừ',
        explanation: seed.explanation,
        result: `Đáp án ${arranged.answer}: ${seed.correct}`
      },
      ...(skill === 'l'
        ? [{
            order: 2,
            title: 'Transcript đối chiếu sau khi làm',
            explanation: spec.listening.script
          }]
        : [])
    ],
    finalAnswer: arranged.answer,
    commonMistakes: ['Chọn phương án có từ giống ngữ liệu nhưng sai quan hệ ý.', 'Suy luận vượt quá bằng chứng được cung cấp.'],
    reviewSuggestions: [`Làm lại chiến lược ${skill === 'r' ? 'đọc' : skill === 'l' ? 'nghe' : 'giao tiếp'} Unit ${spec.unit} sau 2–3 ngày.`]
  };
};


export const g10EnglishDeepeningQuestionTypes: QuestionType[] = unitSpecs.map(languageQuestionType);

export const g10EnglishDeepeningQuestions: Question[] = unitSpecs.flatMap(spec => [
  ...languageSeedsByUnit[spec.unit].map((seed, index) => languageQuestion(spec, index, seed)),
  ...readingSeeds(spec).map((seed, index) => choiceQuestion(spec, 'r', index, seed)),
  ...listeningSeeds(spec).map((seed, index) => choiceQuestion(spec, 'l', index, seed))
]);

export const g10EnglishDeepeningSolutions: Solution[] = unitSpecs.flatMap(spec => [
  ...languageSeedsByUnit[spec.unit].map((seed, index) => languageSolution(spec, index, seed)),
  ...readingSeeds(spec).map((seed, index) => choiceSolution(spec, 'r', index, seed)),
  ...listeningSeeds(spec).map((seed, index) => choiceSolution(spec, 'l', index, seed))
]);

export const g10EnglishDeepeningStats = {
  unitCount: unitSpecs.length,
  readingPassageCount: unitSpecs.length,
  listeningScriptCount: unitSpecs.length,
  questionCountPerUnit: 17
} as const;
