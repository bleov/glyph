import { HouseIcon } from "lucide-react";
import { Button, VStack, Heading, Text, ButtonToolbar } from "rsuite";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <VStack spacing={20} alignItems={"center"} width={"100%"}>
      <Heading fontSize={80} lineHeight={80}>
        404
      </Heading>
      <VStack spacing={6} maxWidth={500}>
        <Text width={"100%"} align={"center"} size={"lg"}>
          This page does not exist.
        </Text>
        <Text muted width={"100%"} align={"center"} size={"lg"}>
          <em>"What are we doing? What's going on?"</em>
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
