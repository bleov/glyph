import type { BracketCityGame } from "@/lib/types";
import { Box, Button, HStack, Input, Text, VStack } from "rsuite";
import parse, { type BracketCityNode } from "../parsePuzzle";
import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";

const PuzzleContext = createContext<{
  activePeeks: string[];
  setActivePeeks: Dispatch<SetStateAction<string[]>>;
  answersRevealed: number;
  setAnswersRevealed: Dispatch<SetStateAction<number>>;
  bank: string[];
  setBank: Dispatch<SetStateAction<string[]>>;
  puzzleData: BracketCityGame;
} | null>(null);

export default function BracketCity({ data }: { data: BracketCityGame }) {
  const [answer, setAnswer] = useState("");
  const [bank, setBank] = useState<string[]>([]);
  // TODO: implement highlighting of last correct answer
  const [lastCorrect, setLastCorrect] = useState<string>("");
  const [activePeeks, setActivePeeks] = useState<string[]>([]);
  const [answersRevealed, setAnswersRevealed] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [incorrectBannerShown, setIncorrectBannerShown] = useState(false);

  let activePuzzleString = data.initialPuzzle;

  for (const bankWord of bank) {
    const bankClue = Object.entries(data.solutions).find(([_, val]) => val.toLowerCase() === bankWord);
    if (bankClue) {
      const [clue, solution] = bankClue;
      activePuzzleString = activePuzzleString.replace(`[${clue}]`, solution);
    }
  }

  const activePuzzle = parse(activePuzzleString) as BracketCityNode[];

  const complete = activePuzzle.length === 1;

  function checkAnswer(answer: string) {
    const answerClue = Object.entries(data.solutions).find(([_, val]) => val.toLowerCase() === answer);
    setIncorrectBannerShown(false);

    const incorrect = () => {
      setIncorrectAnswers((prev) => prev + 1);
      setIncorrectBannerShown(true);
      setAnswer("");
    };

    if (!answerClue) {
      incorrect();
      return;
    }

    // is one of the active answers
    if (activePuzzleString.includes(`[${answerClue[0]}]`)) {
      setIncorrectBannerShown(false);
      setBank((prev) => [...prev, answer]);
      setLastCorrect(answer);
      setAnswer("");
      return;
    }

    incorrect();
  }

  return (
    <>
      <Box>
        <Box className="puzzle">
          <PuzzleContext.Provider
            value={{ activePeeks, setActivePeeks, puzzleData: data, answersRevealed, setAnswersRevealed, bank, setBank }}
          >
            <Puzzle puzzle={activePuzzle} />
          </PuzzleContext.Provider>
        </Box>
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
      </Box>
      {incorrectBannerShown && <Box className="incorrect-modal">Incorrect!</Box>}
      {bank.length > 0 && <Text className="bank-label">Answer Bank: </Text>}
      <VStack className="bank">
        {bank.toReversed().map((item, index) => {
          const clueObject = Object.entries(data.solutions).find(([_, val]) => val.toLowerCase() === item);

          if (!clueObject) return null;
          const [clue, solution] = clueObject;

          return (
            <Box className="bank-item">
              <HStack>
                <Text>[{clue}] = </Text>
                <Text className="highlighted-bank-item">{solution}</Text>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </>
  );
}

function Puzzle({ puzzle }: { puzzle: BracketCityNode[] }) {
  const context = useContext(PuzzleContext);

  if (!context) throw new Error("No context provider");

  const { activePeeks, setActivePeeks, puzzleData, answersRevealed, setAnswersRevealed, bank, setBank } = context;

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
        className={`puzzle-node ${node.length === 1 ? "active-node" : ""}`}
        onClick={() => {
          if (node.length !== 1) return;
          const value = node[0] as string;
          const solution = puzzleData.solutions[value];

          if (!activePeeks.includes(value)) {
            setActivePeeks([...activePeeks, value]);
            return;
          }

          setBank([...bank, solution.toLowerCase()]);
          setAnswersRevealed(answersRevealed + 1);
        }}
      >
        [<Puzzle key={index} puzzle={node} />]
      </Text>
    );
  });
}
