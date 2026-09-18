import React from 'react';
import { useExamEngine } from './hooks/useExamEngine';
import { ExamIntroView } from './components/intro/ExamIntroView';
import { ExamTakingView } from './components/testing/ExamTakingView';
import { ExamResultView } from './components/result/ExamResultView';

export const ExamEngine: React.FC = () => {
  const engine = useExamEngine();

  if (engine.examState === 'intro') {
    return (
      <ExamIntroView
        subjectLabel={engine.subjectLabel}
        user={engine.user}
        selectedSubject={engine.selectedSubject}
        mockExamsList={engine.mockExamsList}
        subjectAssessmentBlueprints={engine.subjectAssessmentBlueprints}
        activeSessions={engine.activeSessions}
        examSummaryMap={engine.examSummaryMap}
        selectedExamId={engine.selectedExamId}
        setSelectedExamId={engine.setSelectedExamId}
        isLoadingReview={engine.isLoadingReview}
        onStartExam={engine.handleStartExam}
        onResumeExam={engine.handleResumeExam}
        onDiscardActiveSession={engine.handleDiscardActiveSession}
        onReviewPastResult={engine.handleReviewPastResult}
      />
    );
  }

  if (engine.examState === 'testing') {
    return (
      <ExamTakingView
        currentExam={engine.currentExam}
        subjectLabel={engine.subjectLabel}
        selectedSubject={engine.selectedSubject}
        user={engine.user}
        examQuestions={engine.examQuestions}
        examSections={engine.examSections}
        answers={engine.answers}
        finalAnswers={engine.finalAnswers}
        proofImagesByQuestion={engine.proofImagesByQuestion}
        timeLeft={engine.timeLeft}
        isSubmittingExam={engine.isSubmittingExam}
        examSubmitError={engine.examSubmitError}
        onOptionSelect={engine.handleOptionSelect}
        onInputChange={engine.handleInputChange}
        onFinalAnswerChange={engine.handleFinalAnswerChange}
        onProofImagesChange={engine.handleProofImagesChange}
        onPauseAndSave={engine.handlePauseAndSave}
        onSubmitExam={engine.handleSubmitExam}
        onDiscardAndExit={engine.handleDiscardAndExit}
      />
    );
  }

  if (engine.examState === 'result' && engine.examResult) {
    return (
      <ExamResultView
        examResult={engine.examResult}
        examQuestions={engine.examQuestions}
        currentExam={engine.currentExam}
        subjectLabel={engine.subjectLabel}
        selectedSubject={engine.selectedSubject}
        selectedGrade={engine.selectedGrade}
        subjectQuestionTypes={engine.subjectQuestionTypes}
        subjectTopics={engine.subjectTopics}
        user={engine.user}
        durationMinutes={engine.durationMinutes}
        onStartExam={engine.handleStartExam}
        onBackToIntro={engine.handleBackToIntro}
      />
    );
  }

  return null;
};

export default ExamEngine;
