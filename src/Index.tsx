import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Box, Button, ButtonGroup, CardGroup, Center, Heading, HStack, Image, List, Text, useBreakpointValue } from "rsuite";
import { ArchiveIcon, LayoutGridIcon, NewspaperIcon } from "lucide-react";

import Account from "@/Components/Account";
import AccountButtons from "@/Components/AccountButtons";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import Notifications from "./Components/Notifications";
import { pb } from "./main";

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
  archiveLink
}: {
  title: string;
  imageSrc: string;
  link: string;
  archiveLink?: string;
}) {
  return (
    <List.Item>
      <Link to={link}>
        <HStack spacing={10} alignItems={"center"}>
          <Image src={imageSrc} width={30} height={30} fit="contain" draggable={false}></Image>
          <Link to={link}>{title}</Link>
          {archiveLink && (
            <Box marginLeft={"auto"}>
              <Link to={archiveLink}>
                <Button startIcon={<ArchiveIcon />} size="xs" appearance="subtle">
                  Archive
                </Button>
              </Link>
            </Box>
          )}
        </HStack>
      </Link>
    </List.Item>
  );
}

export default function Index() {
  type ModalState = "account" | "friends" | "sign-in" | "notifications" | null;
  const [manualModalState, setManualModalState] = useState<ModalState>(null);
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
      <SignIn open={modalState === "sign-in"} setOpen={closeModal} />
      <Notifications open={modalState === "notifications"} setOpen={closeModal} />

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
          />
          <LinkGroupItem
            title="The Midi"
            link="/midi/today"
            imageSrc="/icons/midi/favicon.svg"
            archiveLink="/midi/archive"
          />
          <LinkGroupItem
            title="The Daily"
            link="/daily/today"
            imageSrc="/icons/daily/favicon.svg"
            archiveLink="/daily/archive"
          />
          <LinkGroupItem
            title="Connections"
            link="/connections/today"
            imageSrc="/icons/connections/favicon.svg"
            archiveLink="/connections/archive"
          />
          <LinkGroupItem title="Wordle" link="/wordle/today" imageSrc="/icons/wordle/favicon.svg" archiveLink="/wordle/archive" />
          <LinkGroupItem title="Strands" link="/strands/today" imageSrc="/icons/strands/favicon.svg" archiveLink="/strands/archive" />
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
            imageSrc="/icons/brackets/pwa-192x192.png"
            archiveLink="/brackets/archive"
          />
          <LinkGroupItem title="Custom Puzzles" link="/custom" imageSrc="/icons/custom_crossword/favicon.svg" />
        </LinkGroup>
      </CardGroup>
    </main>
  );
}
