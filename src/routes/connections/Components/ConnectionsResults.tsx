import Rating from "@/Components/Rating";
import { useContext } from "react";
import { Button, ButtonGroup, Center, Heading, Image, Modal, VStack } from "rsuite";
import { ConnectionsContext } from "./Connections";
import { ArrowLeftIcon, TrophyIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useParams } from "react-router";

interface ConnectionsResultsProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
}

export default function ConnectionsResults({ open, onClose, onOpenLeaderboard }: ConnectionsResultsProps) {
  const { data, resultText } = useContext(ConnectionsContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams();

  return (
    <Modal open={open} onClose={onClose} dialogClassName="complete-dialog" centered size="fit-content" overflow={false}>
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={`/icons/connections/pwa-192x192.png`} width={42} />
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
          <Button
            appearance="default"
            startIcon={<ArrowLeftIcon />}
            onClick={() => {
              if (location.pathname.includes("custom")) {
                return navigate("/custom");
              }
              if (params.date && params.date !== "today") {
                return navigate(`/connections/archive`);
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
