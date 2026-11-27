import { Collections, type StrandsStatsRecord, type StrandsStatsResponse, type UsersRecord } from "@/lib/pb-types";
import { pb } from "@/main";
import { LightbulbIcon, LetterTextIcon, TrophyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { HStack, ProgressCircle, Stat, StatGroup, useBreakpointValue, VStack } from "rsuite";

const emptyStrandsStats: StrandsStatsRecord = {
  id: "",
  attempted: 0,
  complete: 0,
  completedHintless: 0,
  hintsFound: 0,
  hintsUsed: 0,
  wordsFound: 0
};

export function StrandsStats({ user, open }: { user?: UsersRecord; open: boolean; setOpen: (open: boolean) => void }) {
  const [data, setData] = useState<StrandsStatsResponse<number, number, number, number, number>>();
  const [loaded, setLoaded] = useState(false);

  user ??= pb.authStore.record as unknown as UsersRecord;

  const hintlessPercent = Math.floor(((data?.completedHintless ?? 0) / Math.max(data?.complete!, 1)) * 100);

  const columns = useBreakpointValue({
    xs: 1,
    sm: 2
  });

  useEffect(() => {
    if (!loaded && open) {
      async function fetchData() {
        let response: StrandsStatsResponse<number, number, number, number, number>;

        try {
          response = await pb
            .collection(Collections.StrandsStats)
            .getOne<StrandsStatsResponse<number, number, number, number, number>>(user!.id);
        } catch (err) {
          console.error(err);
          setData(emptyStrandsStats as StrandsStatsResponse<number, number, number, number, number>);
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
      <StatGroup columns={columns}>
        <Stat bordered>
          <Stat.Label>
            <TrophyIcon /> Puzzles Completed
          </Stat.Label>
          <Stat.Value>{data?.complete}</Stat.Value>
        </Stat>
        <Stat bordered>
          <HStack spacing={16}>
            <ProgressCircle percent={hintlessPercent} w={50} strokeWidth={10} trailWidth={10} />
            <VStack>
              <Stat.Label>Perfect Games</Stat.Label>
              <Stat.Value>{data?.completedHintless}</Stat.Value>
            </VStack>
          </HStack>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <LightbulbIcon /> Hints Used
          </Stat.Label>
          <Stat.Value>{data?.hintsUsed}</Stat.Value>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <LetterTextIcon /> Hint Words Found
          </Stat.Label>
          <Stat.Value>{data?.hintsFound}</Stat.Value>
        </Stat>
      </StatGroup>
    </>
  );
}
