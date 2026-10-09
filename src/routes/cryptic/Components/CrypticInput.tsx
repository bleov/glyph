import type { CrypticPuzzlePiece } from "@/lib/types";
import { useEffect, useState, type Dispatch, type MouseEventHandler, type SetStateAction } from "react";
import { Box, Center, HStack } from "rsuite";

function CrypticInputBox({
  selected,
  revealed,
  value,
  onClick
}: {
  selected: boolean;
  revealed: boolean;
  value: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}) {
  const boxClassList = ["cryptic-input-box"];
  if (selected) {
    boxClassList.push("selected");
  }
  if (revealed) {
    boxClassList.push("revealed");
  }

  return (
    <Center className={boxClassList.join(" ")} onClick={onClick}>
      <span className="cryptic-input-text">{value}</span>
    </Center>
  );
}

export default function CrypticInput({
  puzzlePieces,
  entry,
  revealed,
  setEntry,
  lastInput,
  setLastInput,
  shaking,
  check,
  config
}: {
  puzzlePieces: Record<number, CrypticPuzzlePiece>;
  entry: string[];
  revealed: boolean[];
  setEntry: Dispatch<SetStateAction<string[]>>;
  lastInput: KeyboardEvent | null;
  setLastInput: Dispatch<SetStateAction<KeyboardEvent | null>>;
  shaking: boolean;
  check: () => void;
  config: number[];
}) {
  const length = Object.keys(puzzlePieces).length;

  const [selected, setSelected] = useState(0);

  const ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    if (lastInput) {
      handleKeyDown(lastInput);
      setLastInput(null);
    }
  }, [lastInput]);

  function nextBox() {
    if (selected < length - 1) {
      if (!revealed[selected + 1]) {
        setSelected(selected + 1);
      } else {
        let nextUnrevealed = selected + 1;
        while (nextUnrevealed < length && revealed[nextUnrevealed]) {
          nextUnrevealed++;
        }
        if (nextUnrevealed < length) {
          setSelected(nextUnrevealed);
        }
      }
    }
  }
  function previousBox() {
    if (selected > 0) {
      if (!revealed[selected - 1]) {
        setSelected(selected - 1);
      } else {
        let prevUnrevealed = selected - 1;
        while (prevUnrevealed >= 0 && revealed[prevUnrevealed]) {
          prevUnrevealed--;
        }
        if (prevUnrevealed >= 0) {
          setSelected(prevUnrevealed);
        }
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") {
      previousBox();
    } else if (e.key === "ArrowRight") {
      nextBox();
    }

    if (!ALLOWED_KEYS.includes(e.key)) {
      e.preventDefault();
      if (e.key === "Backspace") {
        if (revealed[selected]) return;
        setEntry((prev) => {
          const newEntry = [...prev];
          newEntry[selected] = "";
          return newEntry;
        });
        previousBox();
      }
      if (e.key === "Enter") {
        check();
      }
      return;
    }
    if (revealed[selected]) return;
    setEntry((prev) => {
      const newEntry = [...prev];
      newEntry[selected] = e.key.toUpperCase();
      return newEntry;
    });
    nextBox();
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [puzzlePieces, revealed, selected, entry, shaking]);

  useEffect(() => {
    if (revealed[selected]) {
      let nextUnrevealed = selected + 1;
      while (nextUnrevealed < length && revealed[nextUnrevealed]) {
        nextUnrevealed++;
      }
      if (nextUnrevealed < length) {
        setSelected(nextUnrevealed);
      } else {
        let prevUnrevealed = selected - 1;
        while (prevUnrevealed >= 0 && revealed[prevUnrevealed]) {
          prevUnrevealed--;
        }
        if (prevUnrevealed >= 0) {
          setSelected(prevUnrevealed);
        }
      }
    }
  }, [revealed, selected]);

  const segments: string[][] = [];
  for (const segmentLength of config) {
    segments.push(entry.slice(segments.flat().length, segments.flat().length + segmentLength));
  }
  console.log(segments);

  return (
    <HStack wrap width={"100%"} spacing={16} justifyContent={"center"}>
      {segments.map((segment, i) => (
        <HStack key={i} className={`cryptic-input${shaking ? " shake" : ""}`} spacing={0}>
          {segment.map((_, j) => (
            <CrypticInputBox
              key={i.toString() + "_" + j.toString()}
              selected={selected === segments.slice(0, i).flat().length + j}
              revealed={revealed[segments.slice(0, i).flat().length + j]}
              value={entry[segments.slice(0, i).flat().length + j]}
              onClick={() => {
                if (!revealed[i]) setSelected(i);
              }}
            />
          ))}
        </HStack>
      ))}
    </HStack>
  );
}
