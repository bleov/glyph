import type { typedArchiveResponse, BracketCityGame } from "@/lib/types";
import { pb } from "@/main";
import posthog from "posthog-js";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Center, Container, Content, Loader, Text } from "rsuite";
import BracketCity from "./components/BracketCity";
import "@/css/Brackets.css";
import ArchivePage from "@/Components/ArchivePage";

export default function App() {
  const [data, setData] = useState<BracketCityGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Bracket City – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/brackets/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/brackets/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/brackets/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/brackets.webmanifest`);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (params.date === "today") {
        const todayData = await pb.send("/api/today/brackets", {
          method: "GET"
        });
        setData(todayData);
        posthog.capture("load_brackets");
      } else if (!isArchive) {
        const archiveData = await pb.collection("archive").getFirstListItem<typedArchiveResponse>(
          pb.filter("publication_date = {:date}", {
            date: params.date
          }),
          { fields: "brackets" }
        );
        if (archiveData.brackets !== null) {
          setData(archiveData.brackets as unknown as BracketCityGame);
          posthog.capture("load_archive_brackets");
        } else {
          setError("Failed to load puzzle.");
        }
      }
    } catch (err) {
      console.error(err);
      if (params.today === "today") {
        setError("Failed to load today's puzzle");
      } else {
        setError("Failed to load puzzle.");
      }
    }
  }, [params.date, isArchive, params.today]);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

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
    return <Content className="connections">{<ArchivePage type="brackets" />}</Content>;
  }

  return (
    <Container className="brackets" fontFamily={"monospace"}>
      {data ? <BracketCity data={data} /> : <Loader center />}
    </Container>
  );
}
