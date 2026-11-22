import { pb } from "@/main";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router";
import PuzzleLoadError, { type PuzzleLoadErrorType } from "@/Components/PuzzleLoadError";

const CrosswordCreator = lazy(() => import("./crossword/Create"));
const ConnectionsCreator = lazy(() => import("./connections/Create"));
const WordleCreator = lazy(() => import("./wordle/Create"));

export default function CreateRouter() {
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
    return <ConnectionsCreator />;
  }
  if (type === "crossword") {
    return <CrosswordCreator />;
  }
  if (type === "wordle") {
    return <WordleCreator />;
  }
}
