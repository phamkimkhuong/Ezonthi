import type { Question } from '@/types';
import { g10PhysicsModule0Questions } from './modules/module0_intro/questions';
import { g10PhysicsModule0ExpansionQuestions } from './modules/module0_intro/practiceExpansion/questions';
import { g10PhysicsModule0Expansion2Questions } from './modules/module0_intro/practiceExpansion2/questions';
import { g10PhysicsModule0GapFillQuestions } from './modules/module0_intro/practiceGapFill/questions';
import { g10PhysicsModule0RemediationQuestions } from './modules/module0_intro/practiceRemediation';
import { g10PhysicsModule1Questions } from './modules/module1_kinematics/questions';
import { g10PhysicsModule1ExpansionQuestions } from './modules/module1_kinematics/practiceExpansion/questions';
import { g10PhysicsModule1Expansion2Questions } from './modules/module1_kinematics/practiceExpansion2/questions';
import { g10PhysicsModule1GapFillQuestions } from './modules/module1_kinematics/practiceGapFill/questions';
import { g10PhysicsModule1RemediationQuestions } from './modules/module1_kinematics/practiceRemediation';
import { g10PhysicsModule2Questions } from './modules/module2_dynamics/questions';
import { g10PhysicsModule2ExpansionQuestions } from './modules/module2_dynamics/practiceExpansion/questions';
import { g10PhysicsModule2Expansion2Questions } from './modules/module2_dynamics/practiceExpansion2/questions';
import { g10PhysicsModule2GapFillQuestions } from './modules/module2_dynamics/practiceGapFill/questions';
import { g10PhysicsModule2RemediationQuestions } from './modules/module2_dynamics/practiceRemediation';
import { g10PhysicsModule3Questions } from './modules/module3_energy/questions';
import { g10PhysicsModule3ExpansionQuestions } from './modules/module3_energy/practiceExpansion/questions';
import { g10PhysicsModule3Expansion2Questions } from './modules/module3_energy/practiceExpansion2/questions';
import { g10PhysicsModule3GapFillQuestions } from './modules/module3_energy/practiceGapFill/questions';
import { g10PhysicsModule3RemediationQuestions } from './modules/module3_energy/practiceRemediation';
import { g10PhysicsModule4Questions } from './modules/module4_momentum/questions';
import { g10PhysicsModule4ExpansionQuestions } from './modules/module4_momentum/practiceExpansion/questions';
import { g10PhysicsModule4Expansion2Questions } from './modules/module4_momentum/practiceExpansion2/questions';
import { g10PhysicsModule4GapFillQuestions } from './modules/module4_momentum/practiceGapFill/questions';
import { g10PhysicsModule4RemediationQuestions } from './modules/module4_momentum/practiceRemediation';
import { g10PhysicsModule5Questions } from './modules/module5_circular_motion/questions';
import { g10PhysicsModule5ExpansionQuestions } from './modules/module5_circular_motion/practiceExpansion/questions';
import { g10PhysicsModule5Expansion2Questions } from './modules/module5_circular_motion/practiceExpansion2/questions';
import { g10PhysicsModule5GapFillQuestions } from './modules/module5_circular_motion/practiceGapFill/questions';
import { g10PhysicsModule5RemediationQuestions } from './modules/module5_circular_motion/practiceRemediation';
import { g10PhysicsModule6Questions } from './modules/module6_solid_deformation/questions';
import { g10PhysicsModule6ExpansionQuestions } from './modules/module6_solid_deformation/practiceExpansion/questions';
import { g10PhysicsModule6Expansion2Questions } from './modules/module6_solid_deformation/practiceExpansion2/questions';
import { g10PhysicsModule6GapFillQuestions } from './modules/module6_solid_deformation/practiceGapFill/questions';
import { g10PhysicsModule6RemediationQuestions } from './modules/module6_solid_deformation/practiceRemediation';
import { g10PhysicsPracticeMetadata } from './practiceMetadata';
import { g10PhysicsPracticeChoices } from './practiceChoices';
import { applyPhysics10PracticeChoice } from './practiceChoiceNormalizer';

const moduleQuestions: Question[] = [
  ...g10PhysicsModule0Questions,
  ...g10PhysicsModule0ExpansionQuestions,
  ...g10PhysicsModule0Expansion2Questions,
  ...g10PhysicsModule0GapFillQuestions,
  ...g10PhysicsModule0RemediationQuestions,
  ...g10PhysicsModule1Questions,
  ...g10PhysicsModule1ExpansionQuestions,
  ...g10PhysicsModule1Expansion2Questions,
  ...g10PhysicsModule1GapFillQuestions,
  ...g10PhysicsModule1RemediationQuestions,
  ...g10PhysicsModule2Questions,
  ...g10PhysicsModule2ExpansionQuestions,
  ...g10PhysicsModule2Expansion2Questions,
  ...g10PhysicsModule2GapFillQuestions,
  ...g10PhysicsModule2RemediationQuestions,
  ...g10PhysicsModule3Questions,
  ...g10PhysicsModule3ExpansionQuestions,
  ...g10PhysicsModule3Expansion2Questions,
  ...g10PhysicsModule3GapFillQuestions,
  ...g10PhysicsModule3RemediationQuestions,
  ...g10PhysicsModule4Questions,
  ...g10PhysicsModule4ExpansionQuestions,
  ...g10PhysicsModule4Expansion2Questions,
  ...g10PhysicsModule4GapFillQuestions,
  ...g10PhysicsModule4RemediationQuestions,
  ...g10PhysicsModule5Questions,
  ...g10PhysicsModule5ExpansionQuestions,
  ...g10PhysicsModule5Expansion2Questions,
  ...g10PhysicsModule5GapFillQuestions,
  ...g10PhysicsModule5RemediationQuestions,
  ...g10PhysicsModule6Questions,
  ...g10PhysicsModule6ExpansionQuestions,
  ...g10PhysicsModule6Expansion2Questions,
  ...g10PhysicsModule6GapFillQuestions,
  ...g10PhysicsModule6RemediationQuestions
];

const practiceMetadataByQuestionId = new Map(
  g10PhysicsPracticeMetadata.map(metadata => [metadata.questionId, metadata])
);
const choiceByQuestionId = new Map(
  g10PhysicsPracticeChoices.map(choice => [choice.id, choice])
);

/** Aggregator: chuẩn hóa câu luyện tập về A–B–C–D rồi gắn metadata học tập. */
export const g10PhysicsQuestions: Question[] = moduleQuestions.map(question => {
  const normalizedQuestion = applyPhysics10PracticeChoice(
    question,
    choiceByQuestionId.get(question.id)
  );
  const metadata = practiceMetadataByQuestionId.get(question.id);
  return metadata ? { ...normalizedQuestion, ...metadata, id: question.id } : normalizedQuestion;
});
