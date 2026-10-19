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
import { Link, useLocation } from "react-router";
import React, { useEffect, useState, type CSSProperties } from "react";

import Account from "@/Components/Account";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import AccountButtons from "@/Components/AccountButtons";
import { pb } from "./main";
import { ArchiveIcon } from "lucide-react";
import { useNavigate } from "react-router";
import Notifications from "./Components/Notifications";
import { Collections } from "./lib/pb-types";
import { type typedUserTodayStatusResponse, type typedUserTodayStatusRecord } from "./lib/types";
import { setDate } from "rsuite/esm/internals/utils/date";

interface LinkCardProps {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
  disabled?: boolean;
  badgeContent?: string;
  small?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function LinkCard({ title, description, imageSrc, link, disabled, badgeContent, small, children, className }: LinkCardProps) {
  const classList = ["link-card"];

  if (className) {
    classList.push(...className.split(" "));
  }
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
  const [modalState, setModalState] = useState<"account" | "friends" | "sign-in" | "notifications" | null>(null);
  const [todayStatus, setTodayStatus] = useState<typedUserTodayStatusRecord>();
  const location = useLocation();
  const columns = useBreakpointValue({ xs: 1, sm: 1, md: 2 });

  useEffect(() => {
    document.title = "Glyph – Daily word games";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/mini/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/mini/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/mini/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/index.webmanifest`);
  }, []);

  useEffect(() => {
    switch (location.hash) {
      case "#friends":
        if (pb.authStore.isValid) {
          setModalState("friends");
        }
        break;
      case "#account":
        if (pb.authStore.isValid) {
          setModalState("account");
        }
        break;
      case "#sign-in":
        if (!pb.authStore.isValid) {
          setModalState("sign-in");
        }
        break;
      default:
        break;
    }
  }, [location]);

  useEffect(() => {
    let response: typedUserTodayStatusResponse;
    if (pb.authStore.isValid && pb.authStore.record) {
      async function fetchData() {
        try {
          response = await pb.collection(Collections.UserTodayStatus).getOne(pb.authStore.record!.id);
        } catch (err) {
          console.error(err);
        }

        setTodayStatus(response);
        return;
      }

      fetchData();
    }
  }, [pb.authStore.isValid]);

  return (
    <main className="index">
      <Account open={modalState === "account"} setOpen={() => setModalState(null)} />
      <Friends open={modalState === "friends"} setOpen={() => setModalState(null)} />
      <SignIn open={modalState === "sign-in"} setOpen={() => setModalState(null)} />
      <Notifications open={modalState === "notifications"} setOpen={() => setModalState(null)} />

      <div className="title-container">
        <Heading level={1} className="merriweather-display">
          Glyph
        </Heading>
        <Heading level={3} className="merriweather-bold">
          Daily word games
        </Heading>
        <Center>
          <ButtonGroup className="account-buttons">
            <AccountButtons modalState={modalState} setModalState={setModalState} appearance="default" />
          </ButtonGroup>
        </Center>
      </div>
      <CardGroup columns={columns} className={`game-cards${columns === 1 ? " vertical" : ""}`} spacing={10}>
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.mini!) ? " " : ""}
          className={todayStatus?.mini === 1 ? "started" : todayStatus?.mini === 2 ? "finished" : ""}
          title="The Mini"
          description="Tiny crossword puzzles"
          link="/mini"
          imageSrc="/icons/mini/pwa-192x192.png"
        />
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.midi!) ? " " : ""}
          className={todayStatus?.midi === 1 ? "started" : todayStatus?.midi === 2 ? "finished" : ""}
          title="The Midi"
          description="Medium crossword puzzles"
          link="/midi"
          imageSrc="/icons/midi/pwa-192x192.png"
        />
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.daily!) ? " " : ""}
          className={todayStatus?.daily === 1 ? "started" : todayStatus?.daily === 2 ? "finished" : ""}
          title="The Daily"
          description="Large crossword puzzles"
          link="/daily"
          imageSrc="/icons/daily/pwa-192x192.png"
        />
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.connections!) ? " " : ""}
          className={todayStatus?.connections === 1 ? "started" : todayStatus?.connections === 2 ? "finished" : ""}
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
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.wordle!) ? " " : ""}
          className={todayStatus?.wordle === 1 ? "started" : todayStatus?.wordle === 2 ? "finished" : ""}
          title="Wordle"
          description="Guess the 5-letter word"
          link="/wordle/today"
          imageSrc="/icons/wordle/pwa-192x192.png"
        >
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/wordle/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.strands!) ? " " : ""}
          className={todayStatus?.strands === 1 ? "started" : todayStatus?.strands === 2 ? "finished" : ""}
          title="Strands"
          description="Uncover hidden words"
          link="/strands/today"
          imageSrc="/icons/strands/pwa-192x192.png"
        >
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/strands/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard
          badgeContent={[1, 2].includes(todayStatus?.cryptic!) ? " " : ""}
          className={todayStatus?.cryptic === 1 ? "started" : todayStatus?.cryptic === 2 ? "finished" : ""}
          title="Minute Cryptic"
          description="Solve cryptic clues"
          link="/cryptic/today"
          imageSrc="/icons/cryptic/pwa-192x192.png"
        >
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
