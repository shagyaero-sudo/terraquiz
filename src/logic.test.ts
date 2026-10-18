import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pickQuizQuestions,
  calculateQuizScore,
  shuffleQuestionOptions,
  type Question,
} from './logic.ts';

const mockQuestions: Question[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  question: `Soal #${i + 1}`,
  options: ['Benar', 'Salah 1', 'Salah 2', 'Salah 3'],
  correctIndex: 0,
  explanation: `Penjelasan #${i + 1}`,
}));

test('shuffleQuestionOptions preserves correct text mapping', () => {
  const original: Question = {
    id: 99,
    question: 'Test',
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    correctIndex: 1, // 'Beta'
    explanation: 'Exp',
  };

  for (let i = 0; i < 20; i++) {
    const shuffled = shuffleQuestionOptions(original);
    assert.equal(shuffled.options[shuffled.correctIndex], 'Beta');
    assert.equal(shuffled.options.length, 4);
  }
});

test('pickQuizQuestions produces randomized distribution across options', () => {
  const qBank = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    question: `Q${i}`,
    options: ['Jawaban Tepat', 'Distraktor 1', 'Distraktor 2', 'Distraktor 3'],
    correctIndex: 0,
    explanation: 'Exp',
  }));

  const picked = pickQuizQuestions(qBank, 'all');
  const indexCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  picked.forEach(q => {
    indexCounts[q.correctIndex as 0 | 1 | 2 | 3]++;
    assert.equal(q.options[q.correctIndex], 'Jawaban Tepat');
  });

  // Verify that answers are distributed across all positions (not just 0 or 1)
  assert.ok(indexCounts[0] > 10, 'Index 0 has selections');
  assert.ok(indexCounts[1] > 10, 'Index 1 has selections');
  assert.ok(indexCounts[2] > 10, 'Index 2 has selections');
  assert.ok(indexCounts[3] > 10, 'Index 3 has selections');
});

test('calculateQuizScore computes correct tally and wrong list', () => {
  const sample: Question[] = [
    { id: 1, question: 'Q1', options: ['A', 'B'], correctIndex: 0, explanation: 'Exp1' },
    { id: 2, question: 'Q2', options: ['A', 'B'], correctIndex: 1, explanation: 'Exp2' },
  ];

  const result = calculateQuizScore({ 1: 0, 2: 0 }, sample);
  assert.equal(result.score, 1);
  assert.equal(result.total, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.incorrectQuestions.length, 1);
  assert.equal(result.incorrectQuestions[0].question.id, 2);
});
