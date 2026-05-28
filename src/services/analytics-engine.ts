/**
 * Analytics Engine
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
    const isCorrect = userAnswer === question.correctAnswer;
    const isAttempted = userAnswer !== null && userAnswer !== undefined;

    if (!isAttempted) {
      unattempted++;
    } else {
      if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    }

    const topic = question.topic || "General";
    if (!topicMap[topic]) {
      topicMap[topic] = { total: 0, correct: 0 };
    }
    topicMap[topic].total++;
    if (isCorrect) {
      topicMap[topic].correct++;
    }
  });

  const penalty = mock.negativeMarking || 0;
  const marksPerQ = mock.marksPerQuestion || 1;
  const rawScore = (correct * marksPerQ) - (wrong * penalty);
  const totalMarks = questions.length * marksPerQ;
  const accuracy = correct + wrong > 0 ? (correct / (correct + wrong)) * 100 : 0;

  return {
    correct,
    wrong,
    unattempted,
    score: Number(rawScore.toFixed(2)),
    totalMarks,
    accuracy: Math.round(accuracy),
    readiness: accuracy > 80 ? "High" : accuracy > 60 ? "Medium" : "Low",
    topicPerformance: topicMap
  };
}
