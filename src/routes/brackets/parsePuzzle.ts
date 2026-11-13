export type BracketCityNode = { text: string; start: number } | BracketCityNode[];

export function buildActivePuzzle(initialPuzzle: string, solutions: Record<string, string>, bank: string[], lastCorrect: string | null) {
  let puzzle = initialPuzzle;
  let highlight: {
    start: number;
    end: number;
  } | null = null;

  for (const bankWord of bank) {
    const bankClue = Object.entries(solutions).find(([_, val]) => val.toLowerCase() === bankWord);

    if (bankClue) {
      const [clue, solution] = bankClue;
      const target = `[${clue}]`;
      const start = puzzle.indexOf(target);

      if (start !== -1) {
        puzzle = puzzle.slice(0, start) + solution + puzzle.slice(start + target.length);

        if (clue === lastCorrect) {
          highlight = { start, end: start + solution.length };
        }
      }
    }
  }

  return { puzzle, highlight };
}

export default function parse(puzzle: string) {
  let index = 0;

  function parseGroup(): BracketCityNode[] {
    const result: BracketCityNode[] = [];
    let text = "";
    let startPoint = 0;

    function flush() {
      if (text) {
        result.push({ text, start: startPoint });
        text = "";
      }
    }

    while (index < puzzle.length) {
      const char = puzzle[index];
      index++;

      if (char === "[") {
        flush();

        const group = parseGroup();

        result.push(group);
      } else if (char === "]") {
        flush();

        return result;
      } else {
        if (!text) startPoint = index - 1;
        text += char;
      }
    }

    flush();

    return result;
  }

  return parseGroup();
}
