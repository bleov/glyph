import Rating from "@/Components/Rating";
import { Button, ButtonGroup, Center, Heading, Image, Modal, VStack } from "rsuite";
import { ArrowLeftIcon, TrophyIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import type { CrypticGame } from "@/lib/types";

interface CrypticResultsProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  data: CrypticGame;
  resultText: string;
}

export default function CrypticResults({ open, onClose, onOpenLeaderboard, data, resultText }: CrypticResultsProps) {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Modal open={open} onClose={onClose} dialogClassName="complete-dialog" centered size="fit-content" overflow={false}>
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={`/icons/cryptic/pwa-192x192.png`} width={42} />
          </Center>
          <Heading level={2} className="merriweather-display">
            {resultText}
          </Heading>
        </VStack>
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
          <Button
            appearance="default"
            startIcon={<ArrowLeftIcon />}
            onClick={() => {
              if (params.date && params.date !== "today") {
                navigate(`/cryptic/archive`);
                return;
              }
              navigate("/");
            }}
          >
            Back
          </Button>
        </ButtonGroup>
      </VStack>
    </Modal>
  );
}
