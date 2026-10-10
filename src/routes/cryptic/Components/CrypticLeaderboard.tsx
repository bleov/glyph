import { TrophyIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Center, Loader, Modal } from "rsuite";
import { Table } from "rsuite/Table";
import { GlobalState } from "@/lib/GlobalState";
import type { CrypticGame } from "@/lib/types";
import { pb } from "@/main";
import { FriendsNudge, LeaderboardNudge } from "@/Components/Leaderboard";
import posthog from "posthog-js";
import type { CrypticLeaderboardRecord } from "@/lib/pb-types";

export default function CrypticLeaderboard({ open, onClose, puzzleData }: { open: boolean; onClose: () => void; puzzleData: CrypticGame }) {
  const [loading, setLoading] = useState(true);
  // Safari and Chromium seem to have issues with rendering the Table component while the modal is animating, especially on high dpi displays.
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<CrypticLeaderboardRecord[]>([]);

  const { user } = useContext(GlobalState);

  useEffect(() => {
    if (!user) return;
    if (!open || !ready) return;
    if (data && data.length > 0) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const leaderboard = pb.collection("cryptic_leaderboard");
        const filter = pb.filter(`puzzle_id={:puzzleId}`, { puzzleId: puzzleData.puzzleId });
        const leaderboardData = await leaderboard.getList(1, 50, {
          sort: "-hint_count",
          filter,
          expand: "user"
        });

        const rankedData = Object.values(leaderboardData.items).map((item, index) => ({ ...item, rank: index + 1 }));

        setData(rankedData);

        if (!cancelled) {
          posthog.capture("view_cryptic_leaderboard", { puzzleId: puzzleData.puzzleId });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Leaderboard fetch error:", err);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open, puzzleData.puzzleId, ready]);

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
      <Modal centered open={open} onClose={onClose} size="fit-content" overflow={false}>
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
      size="fit-content"
      overflow={false}
      onClose={onClose}
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
      <Modal.Body>
        <div className="leaderboard-container" style={{ minWidth: "300px" }}>
          {data && !loading && (
            <>
              <Table data={data} bordered autoHeight maxHeight={408}>
                <Table.Column width={40} align="center" verticalAlign="center">
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.Cell dataKey="rank" />
                </Table.Column>
                <Table.Column flexGrow={2} align="left" verticalAlign="center">
                  <Table.HeaderCell>Username</Table.HeaderCell>
                  <Table.Cell dataKey="expand.user.username" className="leaderboard-username" />
                </Table.Column>
                <Table.Column flexGrow={1} align="right" verticalAlign="center">
                  <Table.HeaderCell>Hints</Table.HeaderCell>
                  <Table.Cell dataKey="hint_count" />
                </Table.Column>
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
