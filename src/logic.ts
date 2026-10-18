export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shuffleQuestionOptions(q: Question): Question {
  const correctText = q.options[q.correctIndex];
  const shuffledOptions = shuffleArray(q.options);
  const newCorrectIndex = shuffledOptions.indexOf(correctText);

  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex,
  };
}

export function pickQuizQuestions(
  bank: Question[],
  mode: '10' | '25' | 'all'
): Question[] {
  const shuffledBank = shuffleArray(bank).map(q => shuffleQuestionOptions(q));

  if (mode === '10') {
    return shuffledBank.slice(0, Math.min(10, shuffledBank.length));
  }
  if (mode === '25') {
    return shuffledBank.slice(0, Math.min(25, shuffledBank.length));
  }
  return shuffledBank;
}

export function calculateQuizScore(
  userAnswers: Record<number, number>,
  questions: Question[]
): {
  score: number;
  total: number;
  percentage: number;
  incorrectQuestions: Array<{
    question: Question;
    selectedOption: string;
    correctOption: string;
  }>;
} {
  let score = 0;
  const incorrectQuestions: Array<{
    question: Question;
    selectedOption: string;
    correctOption: string;
  }> = [];

  questions.forEach((q) => {
    const selected = userAnswers[q.id];
    if (selected === q.correctIndex) {
      score++;
    } else {
      incorrectQuestions.push({
        question: q,
        selectedOption: selected !== undefined ? q.options[selected] : 'Tidak dijawab',
        correctOption: q.options[q.correctIndex],
      });
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return { score, total, percentage, incorrectQuestions };
}
