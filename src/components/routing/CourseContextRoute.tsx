import React, { useLayoutEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAppStore } from '@/services/store';
import { buildCoursePath, isCourseContext } from '@/utils/courseRoutes';
import type { GradeCode, SubjectCode } from '@/types';

const CourseContextRoute: React.FC = () => {
  const { grade, subject } = useParams();
  const selectedGrade = useAppStore(state => state.selectedGrade);
  const selectedSubject = useAppStore(state => state.selectedSubject);
  const setCourse = useAppStore(state => state.setCourse);
  const valid = isCourseContext(grade, subject);

  useLayoutEffect(() => {
    if (valid && (grade !== selectedGrade || subject !== selectedSubject)) {
      setCourse(grade as GradeCode, subject as SubjectCode);
    }
  }, [grade, selectedGrade, selectedSubject, setCourse, subject, valid]);

  if (!valid) {
    return <Navigate to={buildCoursePath(selectedGrade, selectedSubject, 'dashboard')} replace />;
  }
  if (grade !== selectedGrade || subject !== selectedSubject) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-primary">
        <Loader className="animate-spin" aria-label="Đang nạp ngữ cảnh khóa học" />
      </div>
    );
  }
  return <Outlet />;
};

export default CourseContextRoute;
