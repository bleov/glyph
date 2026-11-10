import { P5Canvas } from "@p5-wrapper/react";
import { useEffect, useState } from "react";
import sketch from "../lib/sketch";
import { Button } from "rsuite";
import { ChevronDownIcon } from "lucide-react";
import { pb } from "@/main";

declare global {
  interface Window {
    krillion: {
      promptY: number;
      pan: number;
    };
  }
}

export default function Krillion() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState();

  window.krillion = {
    promptY: -1,
    pan: 0
  };

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
        console.log(fileJSON);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <P5Canvas sketch={sketch} />
      <Button
        className="descend-btn"
        appearance="primary"
        startIcon={!loading && <ChevronDownIcon />}
        endIcon={!loading && <ChevronDownIcon />}
        onClick={handleStart}
      >
        {loading ? "Descending..." : "Begin Descent"}
      </Button>
    </>
  );
}
