import type { KrillionPrompt } from "@/lib/types";
import { useState } from "react";
import { Button, Form, HStack, Input, Progress, Text, VStack } from "rsuite";

export default function KrillionInput({ prompt, onSubmit }: { prompt: KrillionPrompt; onSubmit: (answer: string) => void }) {
  const [answer, setAnswer] = useState("");
  return (
    <Form
      className="answer-input-form"
      onSubmit={() => {
        onSubmit(answer);
      }}
    >
      <VStack>
        <HStack width={"100%"}>
          <Text>25</Text>
          <Input value={answer} onChange={setAnswer} placeholder="enter an answer..." autoComplete="off" autoCorrect="off" />
          <Button>DIVE</Button>
        </HStack>
        <Progress percent={100} showInfo={false} />
      </VStack>
    </Form>
  );
}
