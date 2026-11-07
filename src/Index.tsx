import {
  ButtonGroup,
  Card,
  CardGroup,
  Heading,
  HStack,
  Image,
  Text,
  Center,
  Badge,
  VStack,
  IconButton,
  Whisper,
  Tooltip,
  useBreakpointValue
} from "rsuite";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

import Account from "@/Components/Account";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import AccountButtons from "@/Components/AccountButtons";
import { pb } from "./main";
import { ArchiveIcon } from "lucide-react";
import Notifications from "./Components/Notifications";

interface LinkCardProps {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
  disabled?: boolean;
  badgeContent?: string;
  small?: boolean;
  children?: React.ReactNode;
}

function LinkCard({ title, description, imageSrc, link, disabled, badgeContent, small, children }: LinkCardProps) {
  const classList = ["link-card"];

  if (disabled) {
    classList.push("link-card-disabled");
  }
  if (small) {
    classList.push("link-card-small");
  }

  return (
    <Link to={link} aria-disabled={disabled} className={classList.join(" ")}>
      <Card shaded direction={"row"} alignItems={small ? "center" : "unset"}>
        <Image src={imageSrc} width={"100%"} height={50} fit="contain" draggable={false} alignSelf={"center"}></Image>
        <VStack spacing={0}>
          <Card.Header>
            <HStack width={"100%"} justifyContent={"center"}>
              <Text size="lg" weight="bold">
                {title}
              </Text>
              {badgeContent && <Badge content={badgeContent} />}
            </HStack>
          </Card.Header>
          {!small && <Card.Body>{description}</Card.Body>}
        </VStack>
        {children}
      </Card>
    </Link>
  );
}

export default function Index() {
  type ModalState = "account" | "friends" | "sign-in" | "notifications" | null;
  const [manualModalState, setManualModalState] = useState<ModalState>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const columns = useBreakpointValue({ xs: 1, sm: 1, md: 2 });

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
        <LinkCard title="The Mini" description="Tiny crossword puzzles" link="/mini" imageSrc="/icons/mini/pwa-192x192.png" />
        <LinkCard title="The Midi" description="Medium crossword puzzles" link="/midi" imageSrc="/icons/midi/pwa-192x192.png" />
        <LinkCard title="The Daily" description="Large crossword puzzles" link="/daily" imageSrc="/icons/daily/pwa-192x192.png" />
        <LinkCard
          title="Connections"
          description="Create groups of four"
          link="/connections/today"
          imageSrc="/icons/connections/pwa-192x192.png"
        >
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/connections/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard title="Wordle" description="Guess the 5-letter word" link="/wordle/today" imageSrc="/icons/wordle/pwa-192x192.png">
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/wordle/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard title="Strands" description="Uncover hidden words" link="/strands/today" imageSrc="/icons/strands/pwa-192x192.png">
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/strands/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard title="Minute Cryptic" description="Solve cryptic clues" link="/cryptic/today" imageSrc="/icons/cryptic/pwa-192x192.png">
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/cryptic/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard
          title="Custom Puzzles"
          description="Create and share puzzles"
          link="/custom"
          imageSrc="/icons/custom_crossword/pwa-192x192.png"
        />
      </CardGroup>
    </main>
  );
}
