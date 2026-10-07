import type { CrypticPuzzlePiece } from "@/lib/types";
import { useEffect, useState, type Dispatch, type MouseEventHandler, type SetStateAction } from "react";
import { Box, Center, HStack } from "rsuite";

function CrypticInputBox({
  piece,
  selected,
  revealed,
  value,
  onClick
}: {
  piece: CrypticPuzzlePiece;
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
  setEntry
}: {
  puzzlePieces: Record<number, CrypticPuzzlePiece>;
  entry: string[];
  revealed: boolean[];
  setEntry: Dispatch<SetStateAction<string[]>>;
}) {
  const length = Object.keys(puzzlePieces).length;

  const [selected, setSelected] = useState(0);

  const ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
        setEntry((prev) => {
          const newEntry = [...prev];
          newEntry[selected] = "";
          return newEntry;
        });
        previousBox();
      }
      return;
    }
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
  }, [puzzlePieces, selected]);

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

  return (
    <HStack className="cryptic-input" spacing={0}>
      {Object.values(puzzlePieces).map((piece, i) => (
        <CrypticInputBox
          key={i}
          piece={piece}
          selected={selected === i}
          revealed={revealed[i]}
          value={entry[i]}
          onClick={() => {
            if (!revealed[i]) setSelected(i);
          }}
        />
      ))}
    </HStack>
  );
}
