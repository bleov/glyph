import Rating from "@/Components/Rating";
import type { BracketCityGame } from "@/lib/types";
import { pb } from "@/main";
import { ArrowLeftIcon, ExternalLinkIcon, TrophyIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, ButtonGroup, Center, Heading, Image, Modal, VStack } from "rsuite";

interface BracketsResultsProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  data: BracketCityGame;
}

export default function BracketsResults({ open, onClose, onOpenLeaderboard, data }: BracketsResultsProps) {
  const navigate = useNavigate();

  const [stats, setStatsOpen] = useState(false);

  return (
    <Modal open={open} onClose={onClose} dialogClassName="complete-dialog" centered size="fit-content" overflow={false}>
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={`/icons/brackets/pwa-192x192.png`} width={42} />
          </Center>
          <Heading level={2} className="merriweather-display">
            Puzzle Solved!
          </Heading>
        </VStack>
        {/* <Rating id={data.shortCode.toString()} /> */}
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
          <Button startIcon={<ExternalLinkIcon />} target="_blank" rel="" href={data.completionURL}>
            Learn More
          </Button>
          {/* {pb.authStore.record && (
            <Button onClick={() => setStatsOpen(true)} startIcon={<ChartNoAxesColumnIcon />}>
              Stats
            </Button>
          )} */}
          <Button
            appearance="default"
            startIcon={<ArrowLeftIcon />}
            onClick={() => {
              //   if (params.date && params.date !== "today") {
              //     navigate(`/brackets/archive`);
              //     return;
              //   }
              navigate("/");
            }}
          >
            Back
          </Button>
        </ButtonGroup>
      </VStack>
      {/* {pb.authStore.record && (
        <Stats open={statsOpen} setOpen={setStatsOpen} type="brackets" user={pb.authStore.record as unknown as UsersRecord} />
      )} */}
    </Modal>
  );
}
