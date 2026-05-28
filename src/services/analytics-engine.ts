
/**
 * Analytics Engine
 * Processes quiz results to extract performance metrics and identified gaps.
 */

export function generateAnalytics({
  questions,
  answers,
}: {
  questions: any[];
  answers: Record<number, string>;
}) {
  let correct = 0;
  let wrong = 0;
  const topicMap: Record<string, { total: number; correct: number }> = {};

  questions.forEach((question, index) => {
    const isCorrect = answers[index] === question.correctAnswer;
    const isAttempted = answers[index] !== undefined;

    if (isAttempted) {
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

  const weakTopics = Object.entries(topicMap)
    .filter(([_, value]) => value.correct / value.total < 0.5)
    .map(([topic]) => topic);

  const accuracy = questions.length > 0 ? (correct / questions.length) * 100 : 0;

  return {
    correct,
    wrong,
    accuracy: Math.round(accuracy),
    weakTopics,
    readiness: accuracy > 80 ? "High" : accuracy > 60 ? "Medium" : "Low",
  };
}
