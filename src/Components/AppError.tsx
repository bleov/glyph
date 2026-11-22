import { BugIcon, HouseIcon, RefreshCwIcon } from "lucide-react";
import { Button, ButtonToolbar, Heading, Text, VStack } from "rsuite";

type AppErrorProps = {
  resetError?: () => void;
};

export default function AppError({ resetError }: AppErrorProps) {
  return (
    <VStack spacing={20} alignItems={"center"} width={"100%"}>
      <Heading fontSize={50} lineHeight={40}>
        <BugIcon />
      </Heading>
      <VStack spacing={6} maxWidth={500}>
        <Text width="100%" align={"center"} size={"lg"}>
          Something went wrong.
        </Text>
        <Text muted width="100%" align={"center"}>
          <em>
            "Even Edison failed a couple times before
            <br />
            pretending to invent the lightbulb"
          </em>
        </Text>
      </VStack>
      <ButtonToolbar>
        <Button
          startIcon={<RefreshCwIcon />}
          onClick={() => {
            if (resetError) {
              resetError();
            } else {
              window.location.reload();
            }
          }}
        >
          Reload
        </Button>
        <Button
          startIcon={<HouseIcon />}
          onClick={() => {
            window.location.assign("/");
          }}
        >
          Home
        </Button>
      </ButtonToolbar>
    </VStack>
  );
}
