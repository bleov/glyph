import { FriendsNudge, LeaderboardNudge } from "@/Components/Leaderboard";
import { GlobalState } from "@/lib/GlobalState";
import type { BracketsLeaderboardResponse, UsersRecord } from "@/lib/pb-types";
import type { BracketCityGame } from "@/lib/types";
import { pb } from "@/main";
import { TrophyIcon } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useEffect, useState } from "react";
import { Center, Loader, Modal, Table, Whisper } from "rsuite";

type ExpandedBracketsLeaderboardRecord = BracketsLeaderboardResponse<{ user: UsersRecord }>;

export default function BracketCityLeaderboard({
  open,
  setOpen,
  puzzleData
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  puzzleData: BracketCityGame;
}) {
  const [loading, setLoading] = useState(true);
  // Safari and Chromium seem to have issue with rendering the Table component while the modal is animation, especially on high dpi displays.
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<ExpandedBracketsLeaderboardRecord[]>([]);

  const { user } = useContext(GlobalState);

  useEffect(() => {
    if (!user) return;
    if (!open || !ready) return;
    if (data && data.length > 0) return;

    let cancelled = false;

    async function fetchData() {
      try {
        const leaderboard = pb.collection("brackets_leaderboard");
        const leaderboardData = await leaderboard.getList<ExpandedBracketsLeaderboardRecord>(1, 50, {
          filter: pb.filter("puzzle_id = {:puzzle_id}", {
            puzzle_id: puzzleData.shortCode
          }),
          sort: "+computed_score",
          expand: "user"
        });

        if (!cancelled) {
          setData(leaderboardData.items.map((item, index) => ({ ...item, rank: index + 1 })));
          posthog.capture("view_brackets_leaderboard", { puzzleId: puzzleData.shortCode });
        }
      } catch (err) {
        if (!cancelled) console.error("Leaderboard fetch error:", err);
        setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open, puzzleData.shortCode, ready]);

  function ModalHeader() {
    return (
      <Modal.Header closeButton>
        <Modal.Title>
          <TrophyIcon /> Leaderboard
        </Modal.Title>
      </Modal.Header>
    );
  }

  if (!user) {
    return (
      <Modal
        centered
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        size="fit-content"
        overflow={false}
      >
        <ModalHeader />
        <Modal.Body>
          <LeaderboardNudge />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      centered
      open={open}
      size={"fit-content"}
      overflow={false}
      onClose={() => {
        setOpen(false);
      }}
      onEntered={() => {
        setReady(true);
      }}
      onExited={() => {
        setReady(false);
        setLoading(true);
        setData([]);
      }}
    >
      <ModalHeader />
      <Modal.Body height={300} overflowY={"auto"} overflowX={"hidden"}>
        <div className="leaderboard-container" style={{ minWidth: "320px" }}>
          {data && !loading && (
            <>
              <Table data={data} bordered autoHeight maxHeight={408}>
                <Table.Column width={30} align="center" verticalAlign="center">
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.Cell dataKey="rank" />
                </Table.Column>
                <Table.Column flexGrow={2} align="left" verticalAlign="center">
                  <Table.HeaderCell>Username</Table.HeaderCell>
                  <Table.Cell dataKey="expand.user.username" className="leaderboard-username" />
                </Table.Column>
                <Table.Column width={60} align="center" verticalAlign="center">
                  <Table.HeaderCell>Score</Table.HeaderCell>
                  <Table.Cell dataKey="computed_score" />
                </Table.Column>
                <Table.Column width={50} align="center" verticalAlign="center">
                  <Table.HeaderCell>Peeks</Table.HeaderCell>
                  <Table.Cell dataKey="peek_count" />
                </Table.Column>
                <Table.Column width={50} align="center" verticalAlign="center">
                  <Table.HeaderCell>Hints</Table.HeaderCell>
                  <Table.Cell dataKey="hint_count" />
                </Table.Column>
                {/* <Table.Column width={50} align="center" verticalAlign="center">
                  <Table.HeaderCell>Errors</Table.HeaderCell>
                  <Table.Cell dataKey="incorrect_count" />
                </Table.Column> */}
              </Table>
              {user.friends.length === 0 && (
                <Center marginTop={10}>
                  <FriendsNudge />
                </Center>
              )}
            </>
          )}
        </div>

        {loading && <Loader center backdrop />}
      </Modal.Body>
    </Modal>
  );
}
