import type { BracketCityGame } from "@/lib/types";
import { Box, Button, Content, Footer, Header, HStack, Input, Loader, Text, useDialog, VStack } from "rsuite";
import parse, { buildActivePuzzle, type BracketCityNode } from "../parsePuzzle";
import { createContext, useContext, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import usePersistence from "../hooks/usePersistence";
import { getVariants } from "../data/variants";
import BracketsResults from "./BracketCityResults";
import BracketCityLeaderboard from "./BracketCityLeaderboard";

export interface PuzzleContextType {
  activePeeks: string[];
  setActivePeeks: Dispatch<SetStateAction<string[]>>;
  bank: string[];
  setBank: Dispatch<SetStateAction<string[]>>;
  hintsUsedRef: RefObject<number>;
  puzzleData: BracketCityGame;
  incorrectAnswers: number;
  lastCorrect: string | null;
  setLastCorrect: Dispatch<SetStateAction<string | null>>;
  highlight: { start: number; end: number } | null;
}

const PuzzleContext = createContext<PuzzleContextType | null>(null);

export default function BracketCity({ data }: { data: BracketCityGame }) {
  const [answer, setAnswer] = useState("");
  const [bank, setBank] = useState<string[]>([]);
  const [lastCorrect, setLastCorrect] = useState<string | null>(null);
  const [activePeeks, setActivePeeks] = useState<string[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [incorrectBannerShown, setIncorrectBannerShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const hintsUsedRef = useRef<number>(0);
  const [today] = useState(() => new Date());
  const [modalState, setModalState] = useState<"leaderboard" | "results" | null>(null);

  const { puzzle: activePuzzleString, highlight } = buildActivePuzzle(data.initialPuzzle, data.solutions, bank, lastCorrect);
  const activePuzzle = parse(activePuzzleString);

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
      setLastCorrect(correctAnswerClue![0]);
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
    hintsUsedRef,
    incorrectAnswers,
    lastCorrect,
    setLastCorrect,
    highlight
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
          {complete && (
            <Text display={"inline"} fontWeight={"bold"} className="puzzle-node">
              {data.completionText + " "}
            </Text>
          )}
          <Puzzle puzzle={activePuzzle} />
        </PuzzleContext.Provider>
        <Box className="input-form">
          {complete ? (
            <>
              <Text className="input-label">Congratulations!</Text>
              <Button
                className="input-submission"
                onClick={() => {
                  setModalState("results");
                }}
              >
                View Results
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
      <BracketsResults
        open={modalState === "results"}
        onClose={() => setModalState(null)}
        onOpenLeaderboard={() => setModalState("leaderboard")}
        data={data}
      />
      <BracketCityLeaderboard
        open={modalState === "leaderboard"}
        setOpen={(open) => setModalState(open ? "leaderboard" : "results")}
        puzzleData={data}
      />
    </>
  );
}

function Puzzle({ puzzle }: { puzzle: BracketCityNode[] }) {
  const context = useContext(PuzzleContext);
  const dialog = useDialog();

  if (!context) throw new Error("No context provider");

  const { activePeeks, setActivePeeks, puzzleData, bank, setBank, hintsUsedRef, highlight, setLastCorrect } = context;

  return puzzle.map((node, index) => {
    if (!Array.isArray(node)) {
      const startIndex = highlight ? Math.max(0, highlight.start - node.start) : 0;
      const endIndex = highlight ? Math.min(node.text.length, highlight.end - node.start) : 0;

      const text = node.text;

      return (
        <Text className="puzzle-node" key={index}>
          {endIndex > startIndex ? (
            <>
              {text.slice(0, startIndex)}
              <span className="last-correct">{text.slice(startIndex, endIndex)}</span>
              {text.slice(endIndex)}
            </>
          ) : (
            text
          )}
          {activePeeks.includes(text) && <span> ({puzzleData.solutions[text][0].toUpperCase()})</span>}
        </Text>
      );
    }

    const clue = node.length === 1 && !Array.isArray(node[0]) ? node[0].text : null;

    return (
      <Text
        key={index}
        className={`puzzle-node ${clue !== null ? "active-node" : ""}`}
        onClick={async () => {
          if (clue === null) return;
          const value = clue;
          const solution = puzzleData.solutions[value];

          if (!activePeeks.includes(value)) {
            if (!(await dialog.confirm("You sure you want to peek at the first letter of this answer?", { title: "Peek?" }))) return;

            setActivePeeks([...activePeeks, value]);
            return;
          }

          if (!(await dialog.confirm("You sure you want to reveal this answer?", { title: "Reveal Word?" }))) return;
          setBank([...bank, solution.toLowerCase()]);

          setLastCorrect(clue);

          hintsUsedRef.current++;
        }}
      >
        [<Puzzle key={index} puzzle={node} />]
      </Text>
    );
  });
}
