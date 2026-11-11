import type { BracketCityGame } from "@/lib/types";
import { Box, Button, Content, Footer, Header, HStack, Input, Loader, Text, useDialog, VStack } from "rsuite";
import parse, { type BracketCityNode } from "../parsePuzzle";
import { createContext, useContext, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import usePersistence from "../hooks/usePersistence";
import { getVariants } from "../data/variants";

export interface PuzzleContextType {
  activePeeks: string[];
  setActivePeeks: Dispatch<SetStateAction<string[]>>;
  bank: string[];
  setBank: Dispatch<SetStateAction<string[]>>;
  hintsUsedRef: RefObject<number>;
  puzzleData: BracketCityGame;
}

const PuzzleContext = createContext<PuzzleContextType | null>(null);

export default function BracketCity({ data }: { data: BracketCityGame }) {
  const [answer, setAnswer] = useState("");
  const [bank, setBank] = useState<string[]>([]);
  // TODO: implement highlighting of last correct answer
  const [lastCorrect, setLastCorrect] = useState<string>("");
  const [activePeeks, setActivePeeks] = useState<string[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [incorrectBannerShown, setIncorrectBannerShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const hintsUsedRef = useRef<number>(0);
  const [today] = useState(() => new Date());

  let activePuzzleString = data.initialPuzzle;

  for (const bankWord of bank) {
    const bankClue = Object.entries(data.solutions).find(([, val]) => val.toLowerCase() === bankWord);
    if (bankClue) {
      const [clue, solution] = bankClue;
      activePuzzleString = activePuzzleString.replace(`[${clue}]`, solution);
    }
  }

  const activePuzzle = parse(activePuzzleString) as BracketCityNode[];

  const complete = activePuzzle.length === 1;

  function checkAnswer(answer: string) {
    const variants = getVariants(answer);

    let isCorrect = false;
    let correctAnswerClue: [string, string] | undefined;
    for (const variant of variants) {
      const answerClue = Object.entries(data.solutions).find(([, val]) => val.toLowerCase() === variant);
      if (answerClue && activePuzzleString.includes(`[${answerClue[0]}]`)) {
        correctAnswerClue = answerClue;
        isCorrect = true;
        break;
      }
    }

    const incorrect = () => {
      setIncorrectAnswers((prev) => prev + 1);
      setIncorrectBannerShown(true);
      setAnswer("");
    };

    if (isCorrect) {
      setIncorrectBannerShown(false);
      setBank((prev) => [...prev, correctAnswerClue![1].toLowerCase()]);
      setLastCorrect(answer);
      setAnswer("");
    } else {
      incorrect();
    }
  }

  const puzzleContextValue: PuzzleContextType = {
    activePeeks,
    setActivePeeks,
    puzzleData: data,
    bank,
    setBank,
    hintsUsedRef
  };
  usePersistence(puzzleContextValue, complete, data, setLoading);

  if (loading) {
    return <Loader center />;
  }

  return (
    <>
      <Header>
        <HStack justify={"space-between"}>
          <HStack spacing={5}>
            <Text weight="bold" size={"md"} display={"inline-block"}>
              {today.toLocaleDateString()}
            </Text>
          </HStack>
          <Text size={"md"}>{data.author}</Text>
        </HStack>
      </Header>
      <Content className="puzzle">
        <PuzzleContext.Provider value={puzzleContextValue}>
          <Puzzle puzzle={activePuzzle} />
        </PuzzleContext.Provider>
        <Box className="input-form">
          <Text className="input-label">Answer</Text>
          <HStack>
            <form
              style={{ display: "contents" }}
              onSubmit={(e) => {
                e.preventDefault();
                checkAnswer(answer.toLowerCase().trim());
              }}
            >
              <Input
                placeholder="type any answer..."
                className="input-element"
                value={answer}
                autoComplete="off"
                onChange={(value) => {
                  setAnswer(value);
                  if (incorrectBannerShown) setIncorrectBannerShown(false);
                }}
              ></Input>
              <Button type="submit" className="input-submission">
                [enter]
              </Button>
            </form>
          </HStack>
        </Box>
      </Content>
      <Footer>
        {incorrectBannerShown && <Box className="incorrect-modal">Incorrect!</Box>}
        {bank.length > 0 && <Text className="bank-label">Answer Bank: </Text>}
        <VStack className="bank">
          {bank.toReversed().map((item) => {
            const clueObject = Object.entries(data.solutions).find(([, val]) => val.toLowerCase() === item);

            if (!clueObject) return null;
            const [clue, solution] = clueObject;

            return (
              <Box className="bank-item" key={clue + solution}>
                <HStack>
                  <Text>[{clue}] = </Text>
                  <Text className="highlighted-bank-item">{solution}</Text>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Footer>
    </>
  );
}

function Puzzle({ puzzle }: { puzzle: BracketCityNode[] }) {
  const context = useContext(PuzzleContext);
  const dialog = useDialog();

  if (!context) throw new Error("No context provider");

  const { activePeeks, setActivePeeks, puzzleData, bank, setBank, hintsUsedRef } = context;

  return puzzle.map((node, index) => {
    if (typeof node === "string") {
      return (
        <Text className="puzzle-node" key={index}>
          {node}
          {activePeeks.includes(node) && <span> ({puzzleData.solutions[node][0].toUpperCase()})</span>}
        </Text>
      );
    }

    return (
      <Text
        key={index}
        className={`puzzle-node ${node.length === 1 ? "active-node" : ""}`}
        onClick={async () => {
          if (node.length !== 1) return;
          const value = node[0] as string;
          const solution = puzzleData.solutions[value];

          if (!activePeeks.includes(value)) {
            if (!(await dialog.confirm("You sure you want to peek at the first letter of this answer?", { title: "Peek?" }))) return;

            setActivePeeks([...activePeeks, value]);
            hintsUsedRef.current++;
            return;
          }

          if (!(await dialog.confirm("You sure you want to reveal this answer?", { title: "Reveal Word?" }))) return;
          setBank([...bank, solution.toLowerCase()]);
          hintsUsedRef.current++;
        }}
      >
        [<Puzzle key={index} puzzle={node} />]
      </Text>
    );
  });
}
