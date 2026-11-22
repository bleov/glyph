import { pb } from "@/main";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router";
import PuzzleLoadError, { type PuzzleLoadErrorType } from "@/Components/PuzzleLoadError";

const ConnectionsApp = lazy(() => import("../connections/App"));
const CrosswordApp = lazy(() => import("../crossword/App"));
const WordleApp = lazy(() => import("../wordle/App"));

export default function GameRouter() {
  const params = useParams();
  const [type, setType] = useState<"crossword" | "connections" | "wordle" | null>(null);
  const [error, setError] = useState<PuzzleLoadErrorType | null>(null);

  useEffect(() => {
    if (params.id) {
      pb.collection("custom_puzzles")
        .getOne(params.id, { fields: "type" })
        .then((res) => {
          if (res.type === "connections") {
            setType("connections");
          } else if (res.type === "wordle") {
            setType("wordle");
          } else {
            setType("crossword");
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err?.toString().includes("404") ? "NOT_FOUND" : "NETWORK_ERROR");
        });
    } else {
      setError("NOT_FOUND");
    }
  }, [params.id]);

  if (error) {
    return <PuzzleLoadError errorType={error} />;
  }

  if (type === "connections") {
    return <ConnectionsApp custom={true} />;
  }
  if (type === "crossword") {
    return <CrosswordApp type="custom" />;
  }
  if (type === "wordle") {
    return <WordleApp custom={true} />;
  }
}
