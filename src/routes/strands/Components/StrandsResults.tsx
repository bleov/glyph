import Rating from "@/Components/Rating";
import { Button, ButtonGroup, Center, Heading, Image, Modal, VStack } from "rsuite";
import { ArrowLeftIcon, ChartNoAxesColumnIcon, TrophyIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import type { StrandsGame } from "@/lib/types";
import { useState } from "react";
import { Stats } from "@/Components/Stats";
import { pb } from "@/main";

interface StrandsResultsProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  data: StrandsGame;
  resultText: string;
}

export default function StrandsResults({ open, onClose, onOpenLeaderboard, data, resultText }: StrandsResultsProps) {
  const navigate = useNavigate();
  const params = useParams();

  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <Modal open={open} onClose={onClose} dialogClassName="complete-dialog" centered size="fit-content" overflow={false}>
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={`/icons/strands/pwa-192x192.png`} width={42} />
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
              //   if (params.date && params.date !== "today") {
              //     navigate(`/strands/archive`);
              //     return;
              //   }
              navigate("/");
            }}
          >
            Back
          </Button>
        </ButtonGroup>
      </VStack>
      {pb.authStore.record && <Stats open={statsOpen} setOpen={setStatsOpen} type="strands" user={pb.authStore.record} />}
    </Modal>
  );
}
