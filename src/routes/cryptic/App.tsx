import { useEffect, useState } from "react";
import { Center, Content, Loader, Text } from "rsuite";
import { pb } from "@/main";
import { useParams } from "react-router";
import posthog from "posthog-js";
import ArchivePage from "@/Components/ArchivePage";
import type { CrypticGame, typedArchiveResponse } from "@/lib/types";
import Cryptic from "./Components/Cryptic";
import "@/css/Cryptic.css";

export default function App({ custom = false }: { custom?: boolean }) {
  const [data, setData] = useState<CrypticGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Minute Cryptic – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/cryptic/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/cryptic/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/cryptic/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/cryptic.webmanifest`);
  }, []);

  async function fetchData() {
    try {
      if (params.date === "today") {
        const todayData = await pb.send("/api/today/cryptic", {
          method: "GET"
        });
        setData(todayData);
        posthog.capture("load_cryptic");
      } else if (!isArchive) {
        const archiveData = await pb
          .collection("archive")
          .getFirstListItem<typedArchiveResponse>(`publication_date="${params.date}"`, { fields: "cryptic" });
        if (archiveData.cryptic !== null) {
          setData(archiveData.cryptic as unknown as CrypticGame);
          posthog.capture("load_archive_cryptic");
        } else {
          setError("Failed to load puzzle.");
        }
      }
    } catch (err) {
      console.error(err);
      if (params.date === "today") {
        setError("Failed to load today's puzzle.");
      } else {
        setError("Failed to load puzzle.");
      }
    }
  }

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, []);

  if (error) {
    return (
      <>
        <Center>
          <Text size={"md"}>{error}</Text>
        </Center>
      </>
    );
  }

  if (isArchive) {
    return <Content className="connections">{<ArchivePage type="cryptic" />}</Content>;
  }

  return <Content className="cryptic">{data ? <Cryptic data={data} /> : <Loader center />}</Content>;
}
