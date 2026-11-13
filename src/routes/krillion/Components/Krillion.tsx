import { P5Canvas } from "@p5-wrapper/react";
import { useEffect, useState } from "react";
import sketch from "../lib/sketch";
import { Button } from "rsuite";
import { ChevronDownIcon } from "lucide-react";
import { pb } from "@/main";
import type { KrillionAnswer, KrillionGame, KrillionPrompt } from "@/lib/types";
import KrillionInput from "./KrillionInput";
import { answerDistance, normalizeAnswer } from "../lib/answerDistance";

declare global {
  interface Window {
    krillion?: {
      setPan?: (pan: number) => void;
      setPrompt?: (prompt: KrillionPrompt | null) => void;
      setTitleVisible?: (visible: boolean) => void;
      dive?: (answer: string) => void;
      diveComplete?: () => void;
    };
  }
}

const MAX_ANSWER_EDITS = 2;
const FUZZY_SCORE_PENALTY = 10;

export default function Krillion() {
  const [data, setData] = useState<KrillionGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState<number>(-1);
  const [inputVisible, setInputVisible] = useState(false);
  const [pan, setPan] = useState<number>(0);

  async function handleStart() {
    setLoading(true);
    try {
      const today = await pb.send("/api/today", { method: "GET" });
      const date = today.date;
      const archiveRecord = await pb
        .collection("archive")
        .getFirstListItem(pb.filter("publication_date={:date}", { date }), { fields: "id,publication_date,krillion" });
      if (archiveRecord && "krillion" in archiveRecord) {
        const fileRes = await fetch(`${pb.baseURL}/api/files/archive/${archiveRecord.id}/${archiveRecord.krillion}`);
        const fileBlob = await fileRes.blob();
        const fileText = await fileBlob.text();
        const fileJSON = JSON.parse(fileText);
        setData(fileJSON);
        setPromptIndex(0);
        setPan(200);
        setTimeout(() => {
          if (window.krillion?.setTitleVisible) window.krillion.setTitleVisible(false);
          setInputVisible(true);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function nextPrompt(answer: KrillionAnswer) {
    if (!data) return;
    setInputVisible(false);
    if (promptIndex + 1 < data.prompts.length) {
      if (window.krillion?.dive) window.krillion.dive(answer.answer);
      setPromptIndex((prev) => prev + 1);
      setTimeout(() => {
        setPan((prev) => {
          return prev + answer.score * 10;
        });
        setTimeout(() => {
          setInputVisible(true);
        }, 3000);
      }, 500);
    } else {
      setPromptIndex(-1);
      setInputVisible(false);
      setPan(0);
      if (window.krillion?.setTitleVisible) window.krillion.setTitleVisible(true);
    }
  }

  function checkAnswer(answer: string) {
    if (!data || promptIndex < 0) return;
    const prompt = data.prompts[promptIndex];
    if (!prompt) return;
    const exactAnswer = prompt.answers.find((promptAnswer) => answerDistance(answer, promptAnswer.answer, 0) === 0);
    if (exactAnswer) {
      console.log(exactAnswer);
      nextPrompt(exactAnswer);
      return;
    }

    const matchingAnswer = prompt.answers
      .map((promptAnswer) => {
        const normalizedExpectedAnswer = normalizeAnswer(promptAnswer.answer);
        const maxEdits =
          promptAnswer.score >= 100 || normalizedExpectedAnswer.length <= 4 ? 0 : promptAnswer.score >= 80 ? 1 : MAX_ANSWER_EDITS;
        const distance = answerDistance(answer, promptAnswer.answer, maxEdits);

        return distance && maxEdits > 0
          ? {
              promptAnswer,
              weightedScore: promptAnswer.score - distance * FUZZY_SCORE_PENALTY
            }
          : null;
      })
      .filter((match): match is { promptAnswer: (typeof prompt.answers)[number]; weightedScore: number } => match !== null)
      .sort((left, right) => right.weightedScore - left.weightedScore)[0]?.promptAnswer;

    if (matchingAnswer) {
      console.log(matchingAnswer);
      nextPrompt(matchingAnswer);
    }
  }

  useEffect(() => {
    if (!window.krillion) {
      window.krillion = {};
    }
  }, []);

  useEffect(() => {
    if (window.krillion) {
      if (window.krillion.setPan) {
        window.krillion.setPan(pan);
      }
      if (window.krillion.setPrompt && data) {
        if (promptIndex >= data.prompts.length) {
          return window.krillion.setPrompt(null);
        }
        window.krillion.setPrompt(data.prompts[promptIndex]);
      }
    }
  }, [data, pan, promptIndex]);

  return (
    <>
      <P5Canvas sketch={sketch} />
      {data && promptIndex > -1 && inputVisible && <KrillionInput prompt={data.prompts[promptIndex]} onSubmit={checkAnswer} />}
      {!data && (
        <Button
          className="descend-btn"
          appearance="primary"
          startIcon={!loading && <ChevronDownIcon />}
          endIcon={!loading && <ChevronDownIcon />}
          onClick={handleStart}
        >
          {loading ? "Descending..." : "Begin Descent"}
        </Button>
      )}
    </>
  );
}
