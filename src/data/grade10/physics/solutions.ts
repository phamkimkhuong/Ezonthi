import type { Solution } from '@/types';
import { g10PhysicsModule0Solutions } from './modules/module0_intro/solutions';
import { g10PhysicsModule0ExpansionSolutions } from './modules/module0_intro/practiceExpansion/solutions';
import { g10PhysicsModule0Expansion2Solutions } from './modules/module0_intro/practiceExpansion2/solutions';
import { g10PhysicsModule0GapFillSolutions } from './modules/module0_intro/practiceGapFill/solutions';
import { g10PhysicsModule0RemediationSolutions } from './modules/module0_intro/practiceRemediation';
import { g10PhysicsModule1Solutions } from './modules/module1_kinematics/solutions';
import { g10PhysicsModule1ExpansionSolutions } from './modules/module1_kinematics/practiceExpansion/solutions';
import { g10PhysicsModule1Expansion2Solutions } from './modules/module1_kinematics/practiceExpansion2/solutions';
import { g10PhysicsModule1GapFillSolutions } from './modules/module1_kinematics/practiceGapFill/solutions';
import { g10PhysicsModule1RemediationSolutions } from './modules/module1_kinematics/practiceRemediation';
import { g10PhysicsModule2Solutions } from './modules/module2_dynamics/solutions';
import { g10PhysicsModule2ExpansionSolutions } from './modules/module2_dynamics/practiceExpansion/solutions';
import { g10PhysicsModule2Expansion2Solutions } from './modules/module2_dynamics/practiceExpansion2/solutions';
import { g10PhysicsModule2GapFillSolutions } from './modules/module2_dynamics/practiceGapFill/solutions';
import { g10PhysicsModule2RemediationSolutions } from './modules/module2_dynamics/practiceRemediation';
import { g10PhysicsModule3Solutions } from './modules/module3_energy/solutions';
import { g10PhysicsModule3ExpansionSolutions } from './modules/module3_energy/practiceExpansion/solutions';
import { g10PhysicsModule3Expansion2Solutions } from './modules/module3_energy/practiceExpansion2/solutions';
import { g10PhysicsModule3GapFillSolutions } from './modules/module3_energy/practiceGapFill/solutions';
import { g10PhysicsModule3RemediationSolutions } from './modules/module3_energy/practiceRemediation';
import { g10PhysicsModule4Solutions } from './modules/module4_momentum/solutions';
import { g10PhysicsModule4ExpansionSolutions } from './modules/module4_momentum/practiceExpansion/solutions';
import { g10PhysicsModule4Expansion2Solutions } from './modules/module4_momentum/practiceExpansion2/solutions';
import { g10PhysicsModule4GapFillSolutions } from './modules/module4_momentum/practiceGapFill/solutions';
import { g10PhysicsModule4RemediationSolutions } from './modules/module4_momentum/practiceRemediation';
import { g10PhysicsModule5Solutions } from './modules/module5_circular_motion/solutions';
import { g10PhysicsModule5ExpansionSolutions } from './modules/module5_circular_motion/practiceExpansion/solutions';
import { g10PhysicsModule5Expansion2Solutions } from './modules/module5_circular_motion/practiceExpansion2/solutions';
import { g10PhysicsModule5GapFillSolutions } from './modules/module5_circular_motion/practiceGapFill/solutions';
import { g10PhysicsModule5RemediationSolutions } from './modules/module5_circular_motion/practiceRemediation';
import { g10PhysicsModule6Solutions } from './modules/module6_solid_deformation/solutions';
import { g10PhysicsModule6ExpansionSolutions } from './modules/module6_solid_deformation/practiceExpansion/solutions';
import { g10PhysicsModule6Expansion2Solutions } from './modules/module6_solid_deformation/practiceExpansion2/solutions';
import { g10PhysicsModule6GapFillSolutions } from './modules/module6_solid_deformation/practiceGapFill/solutions';
import { g10PhysicsModule6RemediationSolutions } from './modules/module6_solid_deformation/practiceRemediation';
import { g10PhysicsQuestions } from './questions';
import { applyPhysics10PracticeChoiceSolution } from './practiceChoiceNormalizer';

/** Aggregator: không đặt dữ liệu lời giải thô tại file gốc. */
const rawSolutions: Solution[] = [
  ...g10PhysicsModule0Solutions,
  ...g10PhysicsModule0ExpansionSolutions,
  ...g10PhysicsModule0Expansion2Solutions,
  ...g10PhysicsModule0GapFillSolutions,
  ...g10PhysicsModule0RemediationSolutions,
  ...g10PhysicsModule1Solutions,
  ...g10PhysicsModule1ExpansionSolutions,
  ...g10PhysicsModule1Expansion2Solutions,
  ...g10PhysicsModule1GapFillSolutions,
  ...g10PhysicsModule1RemediationSolutions,
  ...g10PhysicsModule2Solutions,
  ...g10PhysicsModule2ExpansionSolutions,
  ...g10PhysicsModule2Expansion2Solutions,
  ...g10PhysicsModule2GapFillSolutions,
  ...g10PhysicsModule2RemediationSolutions,
  ...g10PhysicsModule3Solutions,
  ...g10PhysicsModule3ExpansionSolutions,
  ...g10PhysicsModule3Expansion2Solutions,
  ...g10PhysicsModule3GapFillSolutions,
  ...g10PhysicsModule3RemediationSolutions,
  ...g10PhysicsModule4Solutions,
  ...g10PhysicsModule4ExpansionSolutions,
  ...g10PhysicsModule4Expansion2Solutions,
  ...g10PhysicsModule4GapFillSolutions,
  ...g10PhysicsModule4RemediationSolutions,
  ...g10PhysicsModule5Solutions,
  ...g10PhysicsModule5ExpansionSolutions,
  ...g10PhysicsModule5Expansion2Solutions,
  ...g10PhysicsModule5GapFillSolutions,
  ...g10PhysicsModule5RemediationSolutions,
  ...g10PhysicsModule6Solutions,
  ...g10PhysicsModule6ExpansionSolutions,
  ...g10PhysicsModule6Expansion2Solutions,
  ...g10PhysicsModule6GapFillSolutions,
  ...g10PhysicsModule6RemediationSolutions
];

const questionById = new Map(
  g10PhysicsQuestions.map(question => [question.id, question])
);

/** Aggregator: đồng bộ đáp án lời giải với lựa chọn A–B–C–D đã chuẩn hóa. */
export const g10PhysicsSolutions: Solution[] = rawSolutions.map(solution =>
  applyPhysics10PracticeChoiceSolution(
    solution,
    questionById.get(solution.questionId)
  )
);
