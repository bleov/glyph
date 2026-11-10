import { P5Canvas } from "@p5-wrapper/react";
import { useEffect, useState } from "react";
import sketch from "../lib/sketch";
import { Button, Text } from "rsuite";
import { ChevronDownIcon } from "lucide-react";
import { pb } from "@/main";
import type { KrillionGame, KrillionPrompt } from "@/lib/types";

declare global {
  interface Window {
    krillion?: {
      setPan?: (pan: number) => void;
      setPrompt?: (prompt: KrillionPrompt | null) => void;
    };
  }
}

export default function Krillion() {
  const [data, setData] = useState<KrillionGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<KrillionPrompt>();
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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
