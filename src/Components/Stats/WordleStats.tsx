import { Collections, type UsersRecord, type WordleStatsResponse } from "@/lib/pb-types";
import { pb } from "@/main";
import { ChartBarIcon, HashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { HStack, Stat, StatGroup, VStack } from "rsuite";

type expandedWordleStatsResponse = WordleStatsResponse<{
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  "6": number;
}>;

export function WordleStats({ user, open }: { user?: UsersRecord; open: boolean; setOpen: (open: boolean) => void }) {
  const [data, setData] = useState<expandedWordleStatsResponse>();
  const [loaded, setLoaded] = useState(false);

  user ??= pb.authStore.record as unknown as UsersRecord;

  useEffect(() => {
    if (!loaded && open) {
      async function fetchData() {
        let response: expandedWordleStatsResponse;

        try {
          response = await pb.collection(Collections.WordleStats).getOne<expandedWordleStatsResponse>(user!.id);
        } catch (err) {
          console.error(err);
          setData({ guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 }, id: "" } as expandedWordleStatsResponse);
          setLoaded(true);
          return;
        }

        setData(response);
        setLoaded(true);
      }

      fetchData();
    }
  }, [open, loaded]);

  return (
    <>
      <StatGroup columns={1}>
        <Stat bordered>
          <Stat.Label>
            <HashIcon /> Games Played
          </Stat.Label>
          <Stat.Value>{data?.games_completed ?? 0}</Stat.Value>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <ChartBarIcon /> Guess Distribution
          </Stat.Label>
          <Stat.Value>
            <VStack style={{ width: "100%", fontSize: "0.925rem" }}>
              {Object.entries(data?.guess_distribution ?? {}).map(([guess, count]) => (
                <HStack style={{ width: "70%" }} key={guess}>
                  <span>{guess}</span>
                  <div
                    style={{
                      backgroundColor: "#787c7e",
                      padding: "2px 8px",
                      color: "white",
                      textAlign: "right",
                      minWidth: "1ch",
                      boxSizing: "border-box",
                      width: (count / Math.max(...Object.values(data?.guess_distribution ?? {}))) * 100 + "%"
                    }}
                  >
                    {count}
                  </div>
                </HStack>
              ))}
            </VStack>
          </Stat.Value>
        </Stat>
      </StatGroup>
    </>
  );
}
