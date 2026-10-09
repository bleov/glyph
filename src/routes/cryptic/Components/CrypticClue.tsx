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
  const indicators = hintsData.find((hint) => hint.type === "indicators");
  const fodder = hintsData.find((hint) => hint.type === "fodder");
  const definition = hintsData.find((hint) => hint.type === "definition");

  const indicatorsHint = hints.includes("indicators");
  const fodderHint = hints.includes("fodder");
  const definitionHint = hints.includes("definition");

  let indicatorsHighlight: number[] = [];
  let fodderHighlight: number[] = [];
  let definitionHighlight: number[] = [];

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

  if (indicators && indicatorsHint) {
    indicatorsHighlight = getHighlightedWords(indicators.highlighting);
  }
  if (fodder && fodderHint) {
    fodderHighlight = getHighlightedWords(fodder.highlighting);
  }
  if (definition && definitionHint) {
    definitionHighlight = getHighlightedWords(definition.highlighting);
  }

  return (
    <Text className="cryptic-clue" size={"xl"}>
      {clue.map((word, i) => {
        const isSpace = i !== clue.length - 1;
        const wordClassList = ["cryptic-clue-word"];
        const spaceClassList = ["cryptic-clue-space"];

        if (indicatorsHighlight.includes(i)) {
          wordClassList.push("indicator");
        }
        if (fodderHighlight.includes(i)) {
          wordClassList.push("fodder");
        }
        if (definitionHighlight.includes(i)) {
          wordClassList.push("definition");
        }

        if (isSpace) {
          if (indicatorsHighlight.includes(i) && indicatorsHighlight.includes(i + 1)) {
            spaceClassList.push("indicator");
          }
          if (fodderHighlight.includes(i) && fodderHighlight.includes(i + 1)) {
            spaceClassList.push("fodder");
          }
          if (definitionHighlight.includes(i) && definitionHighlight.includes(i + 1)) {
            spaceClassList.push("definition");
          }
        }

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
