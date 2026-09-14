import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { buildCoursePath, isCourseContext } from '@/utils/courseRoutes';
import type { GradeCode, SubjectCode } from '@/types';

interface AdvancedCourseRouteProps {
  math: React.ReactNode;
  physics: React.ReactNode;
  chemistry: React.ReactNode;
  biology: React.ReactNode;
}

const AdvancedCourseRoute: React.FC<AdvancedCourseRouteProps> = props => {
  const { grade, subject } = useParams();
  if (!isCourseContext(grade, subject)) {
    return <Navigate to="/app/grade9/math/dashboard" replace />;
  }
  const routeGrade = grade as GradeCode;
  const routeSubject = subject as SubjectCode;
  if (grade !== 'grade10') {
    return <Navigate to={buildCoursePath(routeGrade, routeSubject, 'roadmap')} replace />;
  }
  if (subject === 'math') return props.math;
  if (subject === 'physics') return props.physics;
  if (subject === 'chemistry') return props.chemistry;
  if (subject === 'biology') return props.biology;
  return <Navigate to={buildCoursePath('grade10', routeSubject, 'roadmap')} replace />;
};

export default AdvancedCourseRoute;
