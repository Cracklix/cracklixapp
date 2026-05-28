/**
 * PRODUCTION ANALYTICS ENGINE v30.0
 * Processes CBT attempts with institutional scoring logic.
 */

import { MockTest, Question, AttemptAnswer } from "@/types";

export interface AnalysisResult {
  correct: number;
  wrong: number;
  unattempted: number;
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
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;
  const topicPerformance: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    const ans = answers[q.id];
    const sub = q.subject || "Other";

    if (!topicPerformance[sub]) {
      topicPerformance[sub] = { total: 0, correct: 0 };
    }
    topicPerformance[sub].total++;

    if (!ans || !ans.selectedOption) {
      unattempted++;
    } else {
      if (ans.selectedOption === q.correctAnswer) {
        correct++;
        topicPerformance[sub].correct++;
      } else {
        wrong++;
      }
    }
  });

  const rawScore = (correct * (mock.totalMarks ? mock.totalMarks / questions.length : 1)) - (wrong * mock.negativeMarking);
  const accuracy = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;

  return {
    correct,
    wrong,
    unattempted,
    score: Number(rawScore.toFixed(2)),
    accuracy: Math.round(accuracy),
    topicPerformance,
    timeSpentSeconds: (mock.duration * 60) - totalTimeSeconds
  };
}
