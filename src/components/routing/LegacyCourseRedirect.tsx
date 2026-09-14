import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAppStore } from '@/services/store';
import { buildCoursePath, type CourseSection } from '@/utils/courseRoutes';
import { getSubjectFromQuestionTypeId } from '@/utils/subject';
import type { GradeCode, SubjectCode } from '@/types';

interface LegacyCourseRedirectProps {
  section: CourseSection;
  grade?: GradeCode;
  subject?: SubjectCode;
  useQuestionTypeSubject?: boolean;
}

const LegacyCourseRedirect: React.FC<LegacyCourseRedirectProps> = ({
  section,
  grade,
  subject,
  useQuestionTypeSubject = false
}) => {
  const location = useLocation();
  const { questionTypeId } = useParams();
  const selectedGrade = useAppStore(state => state.selectedGrade);
  const selectedSubject = useAppStore(state => state.selectedSubject);
  const inferredSubject = useQuestionTypeSubject && questionTypeId
    ? getSubjectFromQuestionTypeId(questionTypeId)
    : undefined;
  const target = buildCoursePath(
    grade ?? selectedGrade,
    subject ?? inferredSubject ?? selectedSubject,
    section,
    questionTypeId
  );
  return <Navigate to={`${target}${location.search}`} replace />;
};

export const DefaultCourseRedirect: React.FC = () => {
  const grade = useAppStore(state => state.selectedGrade);
  const subject = useAppStore(state => state.selectedSubject);
  return <Navigate to={buildCoursePath(grade, subject, 'dashboard')} replace />;
};

export default LegacyCourseRedirect;
