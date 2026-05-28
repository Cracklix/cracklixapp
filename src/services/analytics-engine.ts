/**
 * Analytics Engine v9.0
 * Processes CBT attempt results with negative marking logic.
 */

export function generateAnalytics({
  questions,
  answers,
  mock
}: {
  questions: any[];
  answers: Record<number, any>;
  mock: any;
}) {
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;
  const topicMap: Record<string, { total: number; correct: number }> = {};

  questions.forEach((question, index) => {
    const userAnswer = answers[index]?.selectedOption;
    const isAttempted = userAnswer !== null && userAnswer !== undefined;
    const isCorrect = userAnswer === question.correctAnswer;

    if (!isAttempted) {
      unattempted++;
    } else {
      if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    }

    const sub = question.subject || "General";
    if (!topicMap[sub]) {
      topicMap[sub] = { total: 0, correct: 0 };
    }
    topicMap[sub].total++;
    if (isCorrect) {
      topicMap[sub].correct++;
    }
  });

  const penalty = mock.negativeMarking || 0.25;
  const marksPerQ = 1;
  const rawScore = (correct * marksPerQ) - (wrong * penalty);
  const accuracy = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;

  return {
    correct,
    wrong,
    unattempted,
    score: Number(rawScore.toFixed(2)),
    totalQuestions: questions.length,
    accuracy: Math.round(accuracy),
    topicPerformance: topicMap,
    status: 'completed',
    timestamp: Date.now()
  };
}
