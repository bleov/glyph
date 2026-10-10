import type { CrypticGame } from "@/lib/types";
import CrypticClue from "./CrypticClue";
import CrypticInput from "./CrypticInput";
import { Button, ButtonToolbar, Center, Loader, Modal, Text, useDialog, VStack } from "rsuite";
import { useState } from "react";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import CrytpicKeyboard from "./CrypticKeyboard";
import { LightbulbIcon } from "lucide-react";
import CrypticResults from "./CrypticResults";
import usePersistence from "../hooks/usePersistence";
import CrypticLeaderboard from "./CrypticLeaderboard";

export default function Cryptic({ data }: { data: CrypticGame }) {
  const length = Object.keys(data.puzzlePieces).length;

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(new Array(length).fill(""));
  const [revealed, setRevealed] = useState(new Array(length).fill(false));
  const [hints, setHints] = useState<string[]>([]);
  const [lastInput, setLastInput] = useState<KeyboardEvent | null>(null);
  const [hintDialogType, setHintDialogType] = useState<"indicators" | "fodder" | "definition" | null>(null);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [modalState, setModalState] = useState<"results" | "leaderboard" | null>(null);
  const [resultText, setResultText] = useState<string>("Well done!");
  const [complete, setComplete] = useState(false);

  const hintTexts: Record<string, string> = {};
  for (const hint of data.hints) {
    hintTexts[hint.type] = hint.text;
  }

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
    setHintDialogType("indicators");
    setHintDialogOpen(true);
  }
  function showFodder() {
    if (!hints.includes("fodder")) setHints((prev) => [...prev, "fodder"]);
    setHintDialogType("fodder");
    setHintDialogOpen(true);
  }
  function showDefinition() {
    if (!hints.includes("definition")) setHints((prev) => [...prev, "definition"]);
    setHintDialogType("definition");
    setHintDialogOpen(true);
  }

  function check() {
    if (!entry.every((x) => x !== "")) return;
    if (shaking) return;
    if (entry.every((x, i) => x === data.puzzlePieces[i].answer)) {
      setComplete(true);
      if (hints.length === 0) {
        setResultText("No hints!");
      }
      setModalState("results");
    } else {
      setShaking(true);
      setTimeout(() => {
        setShaking(false);
      }, 500);
    }
  }

  usePersistence(data, setLoading, entry, revealed, hints, complete, setEntry, setRevealed, setHints, setComplete);

  if (loading) {
    return <Loader center />;
  }

  return (
    <>
      <VStack spacing={32} height={"100%"}>
        <CrypticClue clue={data.clue} config={data.config} hintsData={data.hints} hints={hints} />
        <CrypticInput
          entry={entry}
          setEntry={setEntry}
          revealed={revealed}
          puzzlePieces={data.puzzlePieces}
          lastInput={lastInput}
          setLastInput={setLastInput}
          shaking={shaking}
          check={check}
          config={data.config}
          complete={complete}
        />
        <ButtonToolbar alignSelf={"center"} spacing={16}>
          {complete ? (
            <Button
              onClick={() => {
                setModalState("results");
              }}
            >
              view results
            </Button>
          ) : (
            <>
              <Menu portal transition menuButton={<Button className="hints-btn">hints</Button>}>
                <MenuItem onClick={showIndicators}>show indicators</MenuItem>
                <MenuItem onClick={showFodder}>show fodder</MenuItem>
                <MenuItem onClick={showDefinition}>show definition</MenuItem>
                <MenuDivider />
                <MenuItem onClick={showLetter}>show letter</MenuItem>
              </Menu>
              <Button disabled={!entry.every((x) => x !== "")} onClick={check}>
                check
              </Button>
            </>
          )}
        </ButtonToolbar>
        <Center width={"100%"} marginTop={"auto"}>
          <CrytpicKeyboard
            handleKeyDown={(e) => {
              setLastInput(e);
            }}
          />
        </Center>
      </VStack>
      <Modal open={hintDialogOpen} onClose={() => setHintDialogOpen(false)} size={"xs"} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <LightbulbIcon /> Hint
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 400 }}>{hintDialogType && <Text>{hintTexts[hintDialogType]}</Text>}</Modal.Body>
      </Modal>
      <CrypticResults
        open={modalState === "results"}
        onClose={() => setModalState(null)}
        onOpenLeaderboard={() => setModalState("leaderboard")}
        data={data}
        resultText={resultText}
      />
      <CrypticLeaderboard open={modalState === "leaderboard"} onClose={() => setModalState(null)} puzzleData={data} />
    </>
  );
}
