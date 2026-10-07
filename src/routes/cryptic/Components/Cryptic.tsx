import type { CrypticGame } from "@/lib/types";
import CrypticClue from "./CrypticClue";
import CrypticInput from "./CrypticInput";
import { Button, ButtonToolbar, Center, VStack } from "rsuite";
import { useEffect, useState } from "react";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import CrytpicKeyboard from "./CrypticKeyboard";

export default function Cryptic({ data }: { data: CrypticGame }) {
  const length = Object.keys(data.puzzlePieces).length;

  const [entry, setEntry] = useState(new Array(length).fill(""));
  const [revealed, setRevealed] = useState(new Array(length).fill(false));
  const [hints, setHints] = useState<string[]>([]);
  const [lastInput, setLastInput] = useState<KeyboardEvent | null>(null);

  function showLetter() {
    const revealedCount = revealed.filter((x) => x).length;
    if (revealedCount >= data.letterRevealOrder.length) {
      return;
    }
    setRevealed((prev) => {
      const newRevealed = [...prev];
      newRevealed[data.letterRevealOrder[revealedCount]] = true;
      return newRevealed;
    });
    setEntry((prev) => {
      const newEntry = [...prev];
      newEntry[data.letterRevealOrder[revealedCount]] = data.puzzlePieces[data.letterRevealOrder[revealedCount]].answer;
      return newEntry;
    });
    setHints((prev) => [...prev, "letter"]);
  }

  function showIndicators() {
    if (!hints.includes("indicators")) setHints((prev) => [...prev, "indicators"]);
  }
  function showFodder() {
    if (!hints.includes("fodder")) setHints((prev) => [...prev, "fodder"]);
  }
  function showDefinition() {
    if (!hints.includes("definition")) setHints((prev) => [...prev, "definition"]);
  }

  return (
    <VStack spacing={32} height={"100%"}>
      <CrypticClue clue={data.clue} answerLength={Object.keys(data.puzzlePieces).length} hintsData={data.hints} hints={hints} />
      <CrypticInput
        entry={entry}
        setEntry={setEntry}
        revealed={revealed}
        puzzlePieces={data.puzzlePieces}
        lastInput={lastInput}
        setLastInput={setLastInput}
      />
      <ButtonToolbar alignSelf={"center"} spacing={16}>
        <Menu portal transition menuButton={<Button className="hints-btn">hints</Button>}>
          <MenuItem onClick={showIndicators}>show indicators</MenuItem>
          <MenuItem onClick={showFodder}>show fodder</MenuItem>
          <MenuItem onClick={showDefinition}>show definition</MenuItem>
          <MenuDivider />
          <MenuItem onClick={showLetter}>show letter</MenuItem>
        </Menu>
        <Button disabled={!entry.every((x) => x !== "")}>check</Button>
      </ButtonToolbar>
      <Center width={"100%"} marginTop={"auto"}>
        <CrytpicKeyboard
          handleKeyDown={(e) => {
            setLastInput(e);
          }}
        />
      </Center>
    </VStack>
  );
}
