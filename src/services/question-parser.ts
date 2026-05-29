/**
 * CRACKLIX INGEST ENGINE v1.0
 * Multi-Stage Regex Heuristic for Raw Text Ingestion.
 */

export interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export function parseRawText(text: string): ParsedQuestion[] {
  // Split by question markers (e.g., 1., Q1., Question 1:)
  const blocks = text.split(/(?=\d+[\.\)])|(?=Q\d+[\.\)])|(?=Question\s+\d+[:\.])/gi)
    .filter(b => b.trim().length > 20);

  return blocks.map(block => {
    // 1. Extract Question
    const questionMatch = block.split(/[A-D][\)\.]/)[0].trim();
    
    // 2. Extract Options
    const optionsMatch = block.match(/[A-D][\)\.](.*?)(?=[A-D][\)\.]|Answer:|Explanation:|$)/gs);
    const options = optionsMatch 
      ? optionsMatch.map(o => o.replace(/^[A-D][\)\.]\s*/, '').trim()) 
      : [];

    // 3. Extract Answer
    const answerMatch = block.match(/Answer:\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1].toUpperCase() : "A";

    // 4. Extract Explanation
    const explanationMatch = block.match(/Explanation:\s*(.*)/is);
    const explanation = explanationMatch ? explanationMatch[1].trim() : "";

    return {
      question: questionMatch.replace(/^\d+[\.\)]\s*|Q\d+[\.\)]\s*/, ''),
      options: options.slice(0, 4),
      answer,
      explanation
    };
  });
}
