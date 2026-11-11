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
      <HStack width={"100%"} spacing={8}>
        <Text marginBottom={12}>25</Text>
        <VStack width={"100%"} spacing={2}>
          <Input value={answer} onChange={setAnswer} placeholder="enter an answer..." autoComplete="off" autoCorrect="off" />
          <Progress percent={100} showInfo={false} strokeWidth={5} />
        </VStack>
        <Button marginBottom={12} type="submit">
          DIVE
        </Button>
      </HStack>
    </Form>
  );
}
