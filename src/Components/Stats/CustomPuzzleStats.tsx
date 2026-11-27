import { Collections, type CustomPuzzleDataResponse, type UsersRecord } from "@/lib/pb-types";
import { pb } from "@/main";
import { CrownIcon, HashIcon, StarIcon, TrophyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { HStack, Loader, Rate, Stat, StatGroup, useBreakpointValue } from "rsuite";

export function CustomPuzzleStats({ user, open, setOpen }: { user?: UsersRecord; open: boolean; setOpen: (open: boolean) => void }) {
  const [data, setData] = useState<CustomPuzzleDataResponse<string, number, number, object>[]>([]);
  const [loaded, setLoaded] = useState(false);

  user ??= pb.authStore.record as unknown as UsersRecord;

  useEffect(() => {
    if (!loaded && open) {
      async function fetchData() {
        let response: CustomPuzzleDataResponse<string, number, number, object>[];

        try {
          response = await pb
            .collection(Collections.CustomPuzzleData)
            .getFullList<CustomPuzzleDataResponse<string, number, number, object>>({
              filter: pb.filter("author = {:author} && public = true", {
                author: user!.id
              })
            });
        } catch (err) {
          console.error(err);
          setData([]);
          setLoaded(true);
          setOpen(false);
          return;
        }

        setData(response);
        setLoaded(true);
      }
      fetchData();
    }
  }, [open, loaded]);

  const averageRating =
    data.reduce((a, cur) => {
      if (cur.public) a += cur.avg_rating ?? 0;
      return a;
    }, 0) / data.filter((c) => c.public).length;

  const mostPlayed = data.toSorted((a, b) => (b.completions ?? 0) - (a.completions ?? 0))[0];

  const columns = useBreakpointValue({
    xs: 1,
    sm: 2
  });

  return (
    <>
      <StatGroup columns={columns}>
        <Stat bordered>
          <Stat.Label>
            <HashIcon /> Published Puzzles
          </Stat.Label>
          <Stat.Value>
            {data.reduce((a, cur) => {
              if (cur.public) a += 1;
              return a;
            }, 0)}
          </Stat.Value>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <TrophyIcon /> Puzzle Completions
          </Stat.Label>
          <Stat.Value>
            {data.reduce((a, cur) => {
              if (cur.public) a += cur.completions ?? 0;
              return a;
            }, 0)}
          </Stat.Value>
        </Stat>
        {!Number.isNaN(averageRating) ? (
          <Stat bordered>
            <Stat.Label>
              <StarIcon /> Average Difficulty Rating
            </Stat.Label>
            <Stat.Value>
              <HStack width="100%" justify={"space-between"}>
                {averageRating.toFixed(2)}
                <Rate color="#FF9800" size="sm" value={averageRating} readOnly></Rate>
              </HStack>
            </Stat.Value>
          </Stat>
        ) : (
          <></>
        )}
        {mostPlayed ? (
          <Stat bordered>
            <Stat.Label>
              <CrownIcon /> Most Played Puzzle
            </Stat.Label>
            <Stat.Value textDecoration={"underline"} fontSize={18}>
              <Link color={"black"} to={`/custom/${mostPlayed.id}`}>
                {mostPlayed.title}
              </Link>
            </Stat.Value>
            <Stat.HelpText>{mostPlayed.completions} completions</Stat.HelpText>
          </Stat>
        ) : (
          <></>
        )}
      </StatGroup>
      {!loaded && <Loader center backdrop />}
    </>
  );
}
