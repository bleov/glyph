import type { UsersRecord } from "@/lib/pb-types";
import { ChartNoAxesColumnIcon } from "lucide-react";
import { Image, Modal, Tabs } from "rsuite";
import { CustomPuzzleStats } from "./Stats/CustomPuzzleStats";
import { CrosswordStats } from "./Stats/CrosswordStats";
import { StrandsStats } from "./Stats/StrandsStats";
import { WordleStats } from "./Stats/WordleStats";
import { useState } from "react";

export type StatType = "mini" | "daily" | "midi" | "strands" | "wordle" | "custom";

export function Stats({
  open,
  setOpen,
  type,
  user
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  type: StatType;
  user?: UsersRecord;
}) {
  const [activeTab, setActiveTab] = useState<StatType>(type);
  const [visitedTabs, setVisitedTabs] = useState<Set<StatType>>(() => new Set([type]));

  if (open && activeTab !== type) {
    setActiveTab(type);
    setVisitedTabs((visited) => new Set(visited).add(type));
  }

  function selectTab(eventKey: string | number | undefined) {
    if (
      eventKey !== "mini" &&
      eventKey !== "daily" &&
      eventKey !== "midi" &&
      eventKey !== "strands" &&
      eventKey !== "wordle" &&
      eventKey !== "custom"
    ) {
      return;
    }
    setActiveTab(eventKey);
    setVisitedTabs((visited) => new Set(visited).add(eventKey));
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} centered size={"sm"}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ChartNoAxesColumnIcon /> Stats
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px" }} className="stats-container">
        <Tabs activeKey={activeTab} onSelect={selectTab}>
          <Tabs.Tab eventKey="mini" title="Mini" icon={<Image src="/icons/mini/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("mini") && <CrosswordStats type="mini" user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
          <Tabs.Tab eventKey="midi" title="Midi" icon={<Image src="/icons/midi/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("midi") && <CrosswordStats type="midi" user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
          <Tabs.Tab eventKey="daily" title="Daily" icon={<Image src="/icons/daily/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("daily") && <CrosswordStats type="daily" user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
          <Tabs.Tab eventKey="strands" title="Strands" icon={<Image src="/icons/strands/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("strands") && <StrandsStats user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
          <Tabs.Tab eventKey="wordle" title="Wordle" icon={<Image src="/icons/wordle/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("wordle") && <WordleStats user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
          <Tabs.Tab eventKey="custom" title="Custom" icon={<Image src="/icons/custom_crossword/favicon.svg" width={16} height={16} />}>
            {visitedTabs.has("custom") && <CustomPuzzleStats user={user} open={open} setOpen={setOpen} />}
          </Tabs.Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}
