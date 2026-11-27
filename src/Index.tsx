import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Box,
  ButtonGroup,
  CardGroup,
  Center,
  Heading,
  HStack,
  IconButton,
  Image,
  List,
  Text,
  Tooltip,
  useBreakpointValue,
  Whisper
} from "rsuite";
import { ArchiveIcon, ChartNoAxesColumnIcon, LayoutGridIcon, NewspaperIcon } from "lucide-react";

import Account from "@/Components/Account";
import AccountButtons from "@/Components/AccountButtons";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import Notifications from "./Components/Notifications";
import { pb } from "./main";
import { Stats, type StatType } from "./Components/Stats";

function LinkGroup({ children, title, titleIcon }: { children: React.ReactNode; title: string; titleIcon?: React.ReactNode }) {
  return (
    <List bordered hover size="md" className="link-group">
      <List.Item>
        <Text size={"sm"}>
          {titleIcon} {title}
        </Text>
      </List.Item>
      {children}
    </List>
  );
}

function LinkGroupItem({
  title,
  imageSrc,
  link,
  archiveLink,
  statType,
  onStatsClick
}: {
  title: string;
  imageSrc: string;
  link: string;
  archiveLink?: string;
  statType?: StatType;
  onStatsClick?: (type: StatType) => void;
}) {
  return (
    <List.Item>
      <HStack spacing={10} alignItems={"center"}>
        <Link to={link} style={{ display: "flex", flex: 1, minWidth: 0 }}>
          <HStack spacing={10} alignItems={"center"}>
            <Image src={imageSrc} width={30} height={30} fit="contain" draggable={false}></Image>
            <span>{title}</span>
          </HStack>
        </Link>
        <Box marginLeft={"auto"}>
          {statType && (
            <Whisper speaker={<Tooltip>Stats</Tooltip>} placement="top">
              <IconButton
                icon={<ChartNoAxesColumnIcon />}
                size="sm"
                appearance="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatsClick?.(statType);
                }}
              />
            </Whisper>
          )}
          {archiveLink && (
            <Whisper speaker={<Tooltip>Archive</Tooltip>} placement="top">
              <Link to={archiveLink}>
                <IconButton icon={<ArchiveIcon />} size="sm" appearance="subtle" />
              </Link>
            </Whisper>
          )}
        </Box>
      </HStack>
    </List.Item>
  );
}

export default function Index() {
  type ModalState = "account" | "friends" | "sign-in" | "notifications" | "stats" | null;
  const [manualModalState, setManualModalState] = useState<ModalState>(null);
  const [statsType, setStatsType] = useState<StatType>("mini");
  const location = useLocation();
  const navigate = useNavigate();
  const columns = useBreakpointValue({ xs: 1, sm: 2 });

  const hashModalState: ModalState = (() => {
    switch (location.hash) {
      case "#friends":
        return pb.authStore.isValid ? "friends" : null;
      case "#account":
        return pb.authStore.isValid ? "account" : null;
      case "#sign-in":
        return pb.authStore.isValid ? null : "sign-in";
      default:
        return null;
    }
  })();
  const modalState = hashModalState ?? manualModalState;
  const openStats = (type: StatType) => {
    setStatsType(type);
    setManualModalState("stats");
  };
  const closeModal = () => {
    setManualModalState(null);
    if (location.hash) {
      navigate(`${location.pathname}${location.search}`, { replace: true });
    }
  };

  useEffect(() => {
    document.title = "Glyph – Daily word games";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/mini/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/mini/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/mini/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/index.webmanifest`);
  }, []);

  return (
    <main className="index">
      <Account open={modalState === "account"} setOpen={closeModal} />
      <Friends open={modalState === "friends"} setOpen={closeModal} />
      <Notifications open={modalState === "notifications"} setOpen={closeModal} />
      <SignIn open={modalState === "sign-in"} setOpen={closeModal} />
      <Stats open={modalState === "stats"} setOpen={closeModal} type={statsType} />

      <div className="title-container">
        <Heading level={1} className="merriweather-display">
          Glyph
        </Heading>
        <Heading level={3} className="merriweather-bold">
          Daily word games
        </Heading>
        <Center>
          <ButtonGroup className="account-buttons">
            <AccountButtons modalState={modalState} setModalState={setManualModalState} appearance="default" />
          </ButtonGroup>
        </Center>
      </div>
      <CardGroup columns={columns} className={`game-cards${columns === 1 ? " vertical" : ""}`} spacing={10}>
        <LinkGroup title="The New York Times" titleIcon={<NewspaperIcon />}>
          <LinkGroupItem
            title="The Mini"
            link="/mini/today"
            imageSrc="/icons/mini/favicon.svg"
            archiveLink="/mini/archive"
            statType="mini"
            onStatsClick={openStats}
          />
          <LinkGroupItem
            title="The Midi"
            link="/midi/today"
            imageSrc="/icons/midi/favicon.svg"
            archiveLink="/midi/archive"
            statType="midi"
            onStatsClick={openStats}
          />
          <LinkGroupItem
            title="The Daily"
            link="/daily/today"
            imageSrc="/icons/daily/favicon.svg"
            archiveLink="/daily/archive"
            statType="daily"
            onStatsClick={openStats}
          />
          <LinkGroupItem
            title="Connections"
            link="/connections/today"
            imageSrc="/icons/connections/favicon.svg"
            archiveLink="/connections/archive"
          />
          <LinkGroupItem
            title="Wordle"
            link="/wordle/today"
            imageSrc="/icons/wordle/favicon.svg"
            archiveLink="/wordle/archive"
            statType="wordle"
            onStatsClick={openStats}
          />
          <LinkGroupItem
            title="Strands"
            link="/strands/today"
            imageSrc="/icons/strands/favicon.svg"
            archiveLink="/strands/archive"
            statType="strands"
            onStatsClick={openStats}
          />
        </LinkGroup>
        <LinkGroup title="Other" titleIcon=<LayoutGridIcon />>
          <LinkGroupItem
            title="Minute Cryptic"
            link="/cryptic/today"
            imageSrc="/icons/cryptic/favicon.svg"
            archiveLink="/cryptic/archive"
          />
          <LinkGroupItem
            title="Bracket City"
            link="/brackets/today"
            imageSrc="/icons/brackets/favicon.svg"
            archiveLink="/brackets/archive"
          />
          <LinkGroupItem
            title="Custom Puzzles"
            link="/custom"
            imageSrc="/icons/custom_crossword/favicon.svg"
            statType="custom"
            onStatsClick={openStats}
          />
        </LinkGroup>
      </CardGroup>
    </main>
  );
}
