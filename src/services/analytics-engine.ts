/**
 * PRODUCTION ANALYTICS ENGINE v45.0
 * Processes CBT attempts with institutional scoring logic and detailed topic auditing.
 */

import { MockTest, Question, AttemptAnswer } from "@/types";

export interface AnalysisResult {
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  score: number;
  accuracy: number;
  topicPerformance: Record<string, { total: number; correct: number }>;
  timeSpentSeconds: number;
}

export function calculateAttemptMetrics(
  questions: Question[],
  answers: Record<string, AttemptAnswer>,
  mock: MockTest,
  totalTimeSeconds: number
): AnalysisResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  const topicPerformance: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    const ans = answers[q.id];
    const sub = q.subject || "General Awareness";

    if (!topicPerformance[sub]) {
      topicPerformance[sub] = { total: 0, correct: 0 };
    }
    topicPerformance[sub].total++;

    if (!ans || ans.selectedOption === null || ans.selectedOption === undefined) {
      unattemptedCount++;
    } else {
      if (Number(ans.selectedOption) === Number(q.correctAnswer)) {
        correctCount++;
        topicPerformance[sub].correct++;
      } else {
        incorrectCount++;
      }
    }
  });

  const marksPerQuestion = mock.totalMarks / (questions.length || 1);
  const rawScore = (correctCount * marksPerQuestion) - (incorrectCount * (mock.negativeMarking || 0));
  const accuracy = (correctCount + incorrectCount) > 0 ? (correctCount / (correctCount + incorrectCount)) * 100 : 0;

  return {
    correctCount,
    incorrectCount,
    unattemptedCount,
    score: Number(rawScore.toFixed(2)),
    accuracy: Math.round(accuracy),
    topicPerformance,
    timeSpentSeconds: (mock.duration * 60) - totalTimeSeconds
  };
}
