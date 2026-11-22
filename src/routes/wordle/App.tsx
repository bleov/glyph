import { useEffect, useState } from "react";
import Wordle from "./Components/Wordle";
import type { typedArchiveResponse, WordleGame } from "@/lib/types";
import { Content, Loader } from "rsuite";
import { pb } from "@/main";
import { useParams } from "react-router";
import posthog from "posthog-js";
import type { CustomPuzzlesResponse, ShapesRecord } from "@/lib/pb-types";
import ArchivePage from "@/Components/ArchivePage";
import PuzzleLoadError, { type PuzzleLoadErrorType } from "@/Components/PuzzleLoadError";

export default function App({ custom = false }: { custom?: boolean }) {
  const [data, setData] = useState<WordleGame | null>(null);
  const [error, setError] = useState<PuzzleLoadErrorType | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Wordle – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/wordle/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/wordle/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/wordle/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/wordle.webmanifest`);
  }, []);

  async function fetchData() {
    if (custom) {
      if (params.id) {
        pb.collection("custom_puzzles")
          .getOne<
            CustomPuzzlesResponse<
              WordleGame,
              {
                shape: ShapesRecord;
              }
            >
          >(params.id, { expand: "shape" })
          .then((record) => {
            const newData = record.puzzle;

            if (!newData) {
              setError("CORRUPTED");
              console.error("No puzzle data found for custom puzzle");
              return;
            }

            newData.id = record.id as unknown as number;
            setData(newData);
            posthog.capture("load_custom_wordle");
          })
          .catch((err) => {
            console.error(err);
            setError(err?.toString().includes("404") ? "NOT_FOUND" : "NETWORK_ERROR");
          });
      }
    } else {
      try {
        if (params.date === "today") {
          const todayData = await pb.send("/api/today/wordle", {
            method: "GET"
          });
          setData(todayData);
          posthog.capture("load_wordle");
        } else if (!isArchive) {
          const archiveData = await pb
            .collection("archive")
            .getFirstListItem<typedArchiveResponse>(`publication_date="${params.date}"`, { fields: "wordle" });
          if (archiveData.wordle !== null) {
            setData(archiveData.wordle as WordleGame);
            posthog.capture("load_archive_wordle");
          } else {
            setError("NOT_ARCHIVED");
          }
        }
      } catch (err) {
        console.error(err);
        if (params.date === "today" && err?.toString().includes("404")) {
          setError("NOT_ARCHIVED");
        } else if (err?.toString().includes("404")) {
          setError("NOT_FOUND");
        } else {
          setError("NETWORK_ERROR");
        }
      }
    }
  }

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, []);

  if (error) {
    return <PuzzleLoadError errorType={error} />;
  }

  if (isArchive) {
    return <Content className="connections">{<ArchivePage type="wordle" />}</Content>;
  }

  return <Content className="wordle">{data ? <Wordle data={data} /> : <Loader center />}</Content>;
}
