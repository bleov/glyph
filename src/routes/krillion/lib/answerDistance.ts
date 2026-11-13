export function normalizeAnswer(answer: string) {
  return answer
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function answerDistance(answer: string, expectedAnswer: string, maxEdits: number) {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpectedAnswer = normalizeAnswer(expectedAnswer);

  if (!normalizedAnswer || !normalizedExpectedAnswer) return null;
  if (Math.abs(normalizedAnswer.length - normalizedExpectedAnswer.length) > maxEdits) return null;

  let previousRow = Array.from({ length: normalizedExpectedAnswer.length + 1 }, (_, index) => index);

  for (let answerIndex = 1; answerIndex <= normalizedAnswer.length; answerIndex++) {
    const currentRow = [answerIndex];
    let minimumDistance = currentRow[0];

    for (let expectedIndex = 1; expectedIndex <= normalizedExpectedAnswer.length; expectedIndex++) {
      const distance = normalizedAnswer[answerIndex - 1] === normalizedExpectedAnswer[expectedIndex - 1] ? 0 : 1;
      const value = Math.min(previousRow[expectedIndex] + 1, currentRow[expectedIndex - 1] + 1, previousRow[expectedIndex - 1] + distance);
      currentRow.push(value);
      minimumDistance = Math.min(minimumDistance, value);
    }

    if (minimumDistance > maxEdits) return null;
    previousRow = currentRow;
  }

  const distance = previousRow[normalizedExpectedAnswer.length];
  return distance <= maxEdits ? distance : null;
}
