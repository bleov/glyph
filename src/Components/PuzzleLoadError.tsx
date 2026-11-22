import { BugIcon, HouseIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react";
import { Link } from "react-router";
import { Button, ButtonToolbar, Heading, Text, VStack } from "rsuite";

export type PuzzleLoadErrorType = "NOT_ARCHIVED" | "NOT_FOUND" | "CORRUPTED" | "NETWORK_ERROR" | "UNKNOWN";

export default function PuzzleLoadError({ errorType }: { errorType: PuzzleLoadErrorType }) {
  if (errorType === "NOT_ARCHIVED") {
    return (
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading fontSize={80} lineHeight={80}>
          D'oh!
        </Heading>
        <VStack spacing={6} maxWidth={400} align={"center"}>
          <Text width="100%" align={"center"} size={"lg"}>
            Today's puzzle hasn't been saved yet.
            <br />
            Puzzles are saved at 12:01 AM New York time.
          </Text>
          <Text muted width="100%" align={"center"} size={"lg"}>
            <em>"Patience is a virtue, unless something's broken."</em>
          </Text>
        </VStack>

        <ButtonToolbar>
          <Button
            startIcon={<RefreshCwIcon />}
            onClick={() => {
              window.location.reload();
            }}
          >
            Retry
          </Button>
          <Link to="/">
            <Button startIcon={<HouseIcon />}>Home</Button>
          </Link>
        </ButtonToolbar>
      </VStack>
    );
  }

  if (errorType === "NOT_FOUND") {
    return (
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading fontSize={80} lineHeight={80}>
          404
        </Heading>
        <VStack spacing={6}>
          <Text maxWidth={500} align={"center"} size={"lg"}>
            This puzzle does not exist.
          </Text>
          <Text muted maxWidth={500} align={"center"} width={"100%"} size={"lg"}>
            <em>"Where are we?"</em>
          </Text>
        </VStack>
        <ButtonToolbar>
          <Link to="/">
            <Button startIcon={<HouseIcon />}>Home</Button>
          </Link>
        </ButtonToolbar>
      </VStack>
    );
  }

  if (errorType === "CORRUPTED") {
    return (
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading fontSize={50} lineHeight={40}>
          <BugIcon />
        </Heading>
        <Text maxWidth={400} align={"center"} size={"lg"}>
          This puzzle's data is corrupted.
        </Text>
        <ButtonToolbar>
          <Link to="/">
            <Button startIcon={<HouseIcon />}>Home</Button>
          </Link>
        </ButtonToolbar>
      </VStack>
    );
  }

  if (errorType === "NETWORK_ERROR") {
    return (
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading fontSize={50} lineHeight={40}>
          <WifiOffIcon />
        </Heading>
        <Text maxWidth={400} align={"center"} size={"lg"}>
          Couldn't fetch today's puzzle.
        </Text>
        <ButtonToolbar>
          <Button
            startIcon={<RefreshCwIcon />}
            onClick={() => {
              window.location.reload();
            }}
          >
            Retry
          </Button>
          <Link to="/">
            <Button startIcon={<HouseIcon />}>Home</Button>
          </Link>
        </ButtonToolbar>
      </VStack>
    );
  }

  if (errorType === "UNKNOWN") {
    return (
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading fontSize={80} lineHeight={80}>
          ???
        </Heading>
        <VStack spacing={6}>
          <Text maxWidth={500} align={"center"} size={"lg"}>
            There was an unknown error loading this puzzle.
          </Text>
          <Text muted maxWidth={500} align={"center"} width={"100%"} size={"lg"}>
            <em>"I'm just as lost as you are"</em>
          </Text>
        </VStack>

        <ButtonToolbar>
          <Button
            startIcon={<RefreshCwIcon />}
            onClick={() => {
              window.location.reload();
            }}
          >
            Retry
          </Button>
          <Link to="/">
            <Button startIcon={<HouseIcon />}>Home</Button>
          </Link>
        </ButtonToolbar>
      </VStack>
    );
  }
}
