import type { CrypticClue, CrypticClue as CrypticClueType } from "@/lib/types";
import { Fragment } from "react/jsx-runtime";
import { Text } from "rsuite";

export default function CrypticClue({ clue, answerLength, hints }: { clue: CrypticClueType[]; answerLength: number; hints: string[] }) {
  return (
    <Text className="cryptic-clue" size={"xl"}>
      {clue.map((word, i) => (
        <Fragment key={i}>
          <span className="cryptic-clue-word">{word.text}</span>
          {i !== clue.length - 1 && <span className="cryptic-clue-space"> </span>}
        </Fragment>
      ))}
      <span className="cryptic-clue-length"> ({answerLength})</span>
    </Text>
  );
}
