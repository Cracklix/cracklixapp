/**
 * CRACKLIX INGEST ENGINE v2.0
 * Improved Multi-Stage Regex Heuristic for Raw Text Ingestion.
 */

export interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export function parseRawText(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = text.split(/(?=^\d+\.\s*)/gm);

  for (const block of questionBlocks) {
    if (block.trim() === '') continue;

    const questionMatch = block.match(/^(\d+\.\s*.*?)(?=\n[A-Z]\))/s);
    const question = questionMatch ? questionMatch[1].replace(/\d+\.\s*/, '').trim() : '';

    const optionsMatch = Array.from(block.matchAll(/([A-Z])\)\s(.*?)(?=\n[A-Z]\)|\nAnswer:|\nExplanation:|$)/gs));
    const options = optionsMatch.map(match => match[2].trim());

    const answerMatch = block.match(/Answer:\s*[A-Z]/);
    const answer = answerMatch ? answerMatch[0].slice(-1) : '';

    const explanationMatch = block.match(/Explanation:\s*(.*)/s);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    if (question && options.length > 0 && answer) {
        questions.push({
            question,
            options,
            answer,
            explanation,
        });
    }
  }

  return questions;
}
