export type BracketCityNode = string | BracketCityNode[];

export default function parse(puzzle: string) {
  let index = 0;

  function parseGroup(): BracketCityNode[] {
    const result: BracketCityNode[] = [];
    let text = "";

    function flush() {
      if (text) {
        result.push(text);
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
        text += char;
      }
    }

    flush();

    return result;
  }

  return parseGroup();
}
