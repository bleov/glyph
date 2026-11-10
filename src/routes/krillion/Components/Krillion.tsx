import { P5Canvas } from "@p5-wrapper/react";
import { useEffect, useState } from "react";
import sketch from "../lib/sketch";
import { Button } from "rsuite";
import { ChevronDownIcon } from "lucide-react";
import { pb } from "@/main";
import type { KrillionGame, KrillionPrompt } from "@/lib/types";
import KrillionInput from "./KrillionInput";
import Fuse from "fuse.js";

declare global {
  interface Window {
    krillion?: {
      setPan?: (pan: number) => void;
      setPrompt?: (prompt: KrillionPrompt | null) => void;
      setTitleVisible?: (visible: boolean) => void;
    };
  }
}

export default function Krillion() {
  const [data, setData] = useState<KrillionGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<KrillionPrompt>();
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
        setPrompt(fileJSON.prompts[0]);
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

  function checkAnswer(answer: string) {
    if (!data || !prompt) return;
    const matches = [];
    for (const promptAnswer of prompt.answers) {
      const answerWords = answer
        .split(" ")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);
      const promptAnswerWords = promptAnswer.answer
        .split(" ")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);
      // if (Math.abs(answerWords.length - promptAnswerWords.length) > 1) continue;
      if (answerWords.length === promptAnswerWords.length) continue;
      const matches = [];
      for (const answerWord in answerWords) {
        for (const promptAnswerWord in promptAnswerWords) {
          if (answerWord === promptAnswerWord) continue;
          const match = Fuse.match(answerWord, promptAnswerWord);
          if (match.isMatch && match.score < 0.1) matches.push([promptAnswer, match]);
        }
      }
      if (matches.length === answerWords.length) {
        console.log(matches);
      }
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
      if (window.krillion.setPrompt) {
        if (!prompt) {
          return window.krillion.setPrompt(null);
        }
        window.krillion.setPrompt(prompt);
      }
    }
  }, [pan, prompt]);

  return (
    <>
      <P5Canvas sketch={sketch} />
      {prompt && inputVisible && <KrillionInput prompt={prompt} onSubmit={checkAnswer} />}
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
