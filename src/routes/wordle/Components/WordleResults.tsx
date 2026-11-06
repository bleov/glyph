import Rating from "@/Components/Rating";
import { Button, ButtonGroup, Center, Heading, Image, Modal, VStack } from "rsuite";
import { ArrowLeftIcon, ChartNoAxesColumnIcon, TrophyIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useParams } from "react-router";
import type { WordleGame } from "@/lib/types";
import { pb } from "@/main";
import { useState } from "react";
import { Stats } from "@/Components/Stats";

interface WordleResultsProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  data: WordleGame;
  resultText: string;
}

export default function WordleResults({ open, onClose, onOpenLeaderboard, data, resultText }: WordleResultsProps) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <Modal open={open} onClose={onClose} dialogClassName="complete-dialog" centered size="fit-content" overflow={false}>
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={`/icons/wordle/pwa-192x192.png`} width={42} />
          </Center>
          <Heading level={2} className="merriweather-display">
            {resultText}
          </Heading>
        </VStack>
        <Rating id={data.id} />
        <ButtonGroup vertical block width={"100%"}>
          <Button
            onClick={() => {
              onClose();
            }}
            appearance="primary"
          >
            Admire Puzzle
          </Button>
          <Button onClick={onOpenLeaderboard} startIcon={<TrophyIcon />}>
            Leaderboard
          </Button>
          {pb.authStore.record && (
            <Button onClick={() => setStatsOpen(true)} startIcon={<ChartNoAxesColumnIcon />}>
              Stats
            </Button>
          )}
          <Button
            appearance="default"
            startIcon={<ArrowLeftIcon />}
            onClick={() => {
              if (location.pathname.includes("custom")) {
                return navigate("/custom");
              }
              if (params.date && params.date !== "today") {
                return navigate(`/wordle/archive`);
              }
              navigate("/");
            }}
          >
            Back
          </Button>
        </ButtonGroup>
      </VStack>
      {pb.authStore.record && <Stats open={statsOpen} setOpen={setStatsOpen} type="wordle" user={pb.authStore.record} />}
    </Modal>
  );
}
