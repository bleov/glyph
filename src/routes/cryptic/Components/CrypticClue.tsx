import type { CrypticClue, CrypticClue as CrypticClueType, CrypticHint } from "@/lib/types";
import { Fragment } from "react/jsx-runtime";
import { Text } from "rsuite";

export default function CrypticClue({
  clue,
  config,
  hintsData,
  hints
}: {
  clue: CrypticClueType[];
  config: number[];
  hintsData: CrypticHint[];
  hints: string[];
}) {
  const hintColorMap: Record<string, string> = { pink: "indicator", yellow: "fodder", blue: "definition" };

  function getHighlightedWords(highlighting: [number, number][]): number[] {
    const highlightedWords = new Set<number>();
    let segmentStart = 0;

    for (let segmentIndex = 0; segmentIndex < clue.length; segmentIndex++) {
      const segmentEnd = segmentStart + clue[segmentIndex].text.length - 1;

      for (const [highlightStart, highlightEnd] of highlighting) {
        if (segmentStart <= highlightEnd && segmentEnd >= highlightStart) {
          highlightedWords.add(segmentIndex);
          break;
        }
      }

      segmentStart += clue[segmentIndex].text.length;
      if (segmentIndex < clue.length - 1) {
        segmentStart += 1;
      }
    }

    return [...highlightedWords];
  }

  const highlights: { color: string; type: string; highlight: number[] }[] = [];
  hintsData.forEach((hint: CrypticHint) => {
    const highlight = getHighlightedWords(hint.highlighting);
    highlights.push({ color: hint.colour, type: hint.type, highlight });
  });

  return (
    <Text className="cryptic-clue" size={"xl"}>
      {clue.map((word, i) => {
        const isSpace = i !== clue.length - 1;
        const wordClassList = ["cryptic-clue-word"];
        const spaceClassList = ["cryptic-clue-space"];

        highlights.forEach((highlight) => {
          if (highlight.highlight.includes(i) && hints.includes(highlight.type)) {
            wordClassList.push(hintColorMap[highlight.color]);
            if (clue[i + 1] && highlight.highlight.includes(i + 1)) {
              spaceClassList.push(hintColorMap[highlight.color]);
            }
          }
        });

        return (
          <Fragment key={i}>
            <span className={wordClassList.join(" ")}>{word.text}</span>
            {isSpace && <span className={spaceClassList.join(" ")}> </span>}
          </Fragment>
        );
      })}
      <span className="cryptic-clue-length"> ({config.join(", ")})</span>
    </Text>
  );
}
