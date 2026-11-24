import localforage from "localforage";
import { ArchiveIcon, ArrowLeftIcon, ChartNoAxesColumnIcon, InfoIcon, PlayIcon, StarIcon } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Center,
  Checkbox,
  CheckboxGroup,
  Content,
  Heading,
  Image,
  Modal,
  Text,
  Tooltip,
  useDialog,
  VStack,
  Whisper
} from "rsuite";

import AccountButtons from "@/Components/AccountButtons";
import SignIn from "@/Components/SignIn";
import { GlobalState } from "@/lib/GlobalState";
import { formatDate } from "@/lib/formatting";
import type { Crossword as CrosswordType, typedArchiveResponse } from "@/lib/types";
import { pb } from "@/main";
import Crossword from "./Components/Crossword";
import Timer from "./Components/Timer";
import { CrosswordAppState } from "./state";
import { useLocation, useNavigate, useParams } from "react-router";
import { Stats } from "../../Components/Stats";
import type { CustomPuzzlesResponse, ShapesRecord, UsersRecord } from "@/lib/pb-types";
import PuzzleLoadError, { type PuzzleLoadErrorType } from "@/Components/PuzzleLoadError";
import ArchivePage from "@/Components/ArchivePage";

function App({ type }: { type: "mini" | "daily" | "midi" | "custom" }) {
  const [data, setData] = useState<CrosswordType | null>(null);
  const [restoredTime, setRestoredTime] = useState<number>(-1);
  const [error, setError] = useState<PuzzleLoadErrorType | null>(null);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [options, setOptions] = useState<(string | number)[]>([]);
  const [modalState, setModalState] = useState<"welcome" | "sign-in" | "friends" | "account" | "stats" | null>("welcome");

  const timeRef = useRef<number[]>([]);
  const startTouched = useRef(false);
  const stateDocId = useRef<string>("");
  const dialog = useDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useContext(GlobalState);

  const appState = useMemo(
    () => ({
      paused,
      data,
      setData,
      modalState,
      setModalState,
      type,
      options,
      setOptions,
      complete,
      setComplete
    }),
    [user, paused, data, modalState, type, options, complete]
  );

  if (import.meta.env.DEV) {
    // @ts-ignore
    window.game = appState;
  }

  function pause() {
    if (options.includes("hardcore")) return;
    if (complete) return;
    setPaused(true);
  }

  const isArchive = params.date === "archive";

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setRestoredTime(-1);
    setComplete(false);
    setAlreadyCompleted(false);
    setPaused(false);
    setOptions([]);
    startTouched.current = false;
    timeRef.current = [];
    stateDocId.current = "";

    async function fetchData() {
      try {
        if (type === "custom") {
          if (!params.id) return;
          const record = await pb.collection("custom_puzzles").getOne<
            CustomPuzzlesResponse<
              CrosswordType,
              {
                author: UsersRecord;
                shape: ShapesRecord<CrosswordType>;
              }
            >
          >(params.id, { expand: "author,shape" });
          if (cancelled) return;
          if (!record.expand?.shape) {
            setError("CORRUPTED");
            return;
          }
          const newData = record.puzzle as CrosswordType;
          newData.id = record.id as unknown as number;
          newData.title = record.title;
          newData.constructors = [record.expand.author?.username ?? "Unknown User"];
          newData.editor = "";
          newData.body[0].board = record.expand.shape.data!.body[0].board;
          setData(newData);
          return;
        }

        if (isArchive) return;

        if (params.date === "today") {
          const json = await pb.send("/api/today/" + type, { method: "GET" });
          if (cancelled) return;
          if (json.error === "Not Found") {
            setError("NOT_ARCHIVED");
            return;
          }
          setData(json);
        } else {
          const record = await pb.collection("archive").getFirstListItem<typedArchiveResponse>(`publication_date="${params.date}"`, {
            fields: type
          });
          if (cancelled) return;
          const puzzle = record[type];
          if (puzzle) {
            setData(puzzle as CrosswordType);
            posthog.capture("load_archive_crossword", { type });
          } else {
            setError("NOT_ARCHIVED");
          }
        }
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        if (params.date === "today" && err?.toString().includes("404")) {
          setError("NOT_ARCHIVED");
        } else if (err?.toString().includes("404")) {
          setError("NOT_FOUND");
        } else {
          setError("NETWORK_ERROR");
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [type, params.date, params.id]);

  useEffect(() => {
    if (type === "custom") {
      document.title = "Custom Puzzle – Glyph";
    } else {
      document.title = `The ${type.charAt(0).toUpperCase()}${type.substring(1)} – Glyph`;
    }
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/${type}/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/${type}/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/${type}/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/${type}.webmanifest`);
  }, [type]);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        username: user.username
      });
    }
  }, [user]);

  useEffect(() => {
    if (!data?.id) return;

    const restoreSave = async () => {
      setCloudLoading(true);

      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          const record = await pb.collection("puzzle_state").getFirstListItem(`puzzle_id="${data.id}" && user="${pb.authStore.record.id}"`);
          console.log("Found cloud save:", record.id);
          console.log("Restored cloud time:", record.time);
          stateDocId.current = record.id;
          await Promise.all([
            localforage.setItem(`autocheck-${data.id}`, record.autocheck),
            localforage.setItem(`state-${data.id}`, record.board_state),
            localforage.setItem(`time-${data.id}`, record.time),
            localforage.setItem(`selected-${data.id}`, record.selected),
            localforage.setItem(`complete-${data.id}`, record.complete),
            localforage.setItem(`cheated-${data.id}`, record.cheated)
          ]);
          if (record.complete) {
            setAlreadyCompleted(true);
          }
          setRestoredTime(record.time ?? 0);
          setCloudLoading(false);
          return;
        } catch (err: any) {
          if (!err.toString().includes("404")) console.error(err);
        }
      }

      try {
        const localTime = await localforage.getItem<number>(`time-${data.id}`);
        setRestoredTime(typeof localTime === "number" ? localTime : 0);
        console.log("Restored local time:", localTime);
      } catch (err) {
        console.error(err);
        setRestoredTime(0);
      } finally {
        setCloudLoading(false);
      }
    };

    restoreSave();
  }, [data, user]);

  useEffect(() => {
    const handleBlur = () => {
      if (modalState == null && !paused) {
        if (complete) return;
        if (options.includes("hardcore")) {
          setOptions((prev) => prev.filter((opt) => opt !== "hardcore"));
          posthog.capture("hardcore_invalidate");
          dialog.alert("Hardcore mode was invalidated because you left the tab. You can still continue in normal mode.");
          setPaused(true);
        }
        if (import.meta.env.VITE_AUTO_PAUSE === "false") return;
        posthog.capture("auto_pause", {
          time: `${timeRef.current.length === 2 ? timeRef.current[0] + ":" + timeRef.current[1].toString().padStart(2, "0") : ""}`
        });
        pause();
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  });

  useEffect(() => {
    if (!user) return;
    if (cloudLoading) return;
    if (!data) return;
    if (restoredTime === -1) return;
    (async () => {
      const hardcorePreference = await localforage.getItem(`hardcore-preference-${type}`);
      if (hardcorePreference) {
        if (restoredTime > 0) {
          setOptions((prev) => prev.filter((x) => x !== "hardcore"));
          return;
        }
        setOptions((prev) => [...prev, "hardcore"]);
      }
    })();
  }, [cloudLoading, data, restoredTime]);

  useEffect(() => {
    if (!options.includes("hardcore") && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [options]);

  return (
    <CrosswordAppState.Provider value={appState}>
      {data && restoredTime > -1 && !isArchive && (
        <Modal
          open={modalState === "welcome"}
          onClose={() => {}}
          centered
          overflow={false}
          size={"fit-content"}
          dialogClassName="welcome-dialog"
        >
          <VStack spacing={10}>
            <VStack width={"100%"} spacing={5} alignItems={"center"}>
              <Image src={type === "custom" ? `/icons/custom_crossword/pwa-192x192.png` : `/icons/${type}/pwa-192x192.png`} width={48} />
              <Heading level={2} className="merriweather-display">
                {type !== "custom" && "The "}
                {type.charAt(0).toUpperCase()}
                {type.substring(1)}
                {type === "custom" && " Puzzle"}
              </Heading>
              {data.title && (
                <Heading level={3} className="merriweather-bold">
                  "{data.title}"
                </Heading>
              )}
            </VStack>
            <VStack width={"100%"} maxWidth={280} spacing={5}>
              <Text width={"100%"} textAlign={"center"}>
                By {data.constructors.join(", ")}
                {data.editor && ` · Edited by ${data.editor}`}
              </Text>
              {type !== "custom" && (
                <Text width={"100%"} textAlign={"center"}>
                  {formatDate(data.publicationDate)}
                </Text>
              )}
            </VStack>
            {user && (
              <Center width={"100%"}>
                <CheckboxGroup
                  value={options}
                  onChange={(value) => {
                    localforage.setItem(`hardcore-preference-${type}`, value.includes("hardcore"));
                    setOptions(value);
                  }}
                >
                  <Checkbox value="hardcore" disabled={restoredTime > 0}>
                    Hardcore Mode{" "}
                    <Whisper
                      placement="top"
                      trigger={"hover"}
                      speaker={
                        <Tooltip>
                          When enabled, the game can't be paused and autocheck will be disabled. Exiting the tab will invalidate hardcore
                          mode. Can only be attempted once per puzzle.
                        </Tooltip>
                      }
                    >
                      <InfoIcon />
                    </Whisper>
                  </Checkbox>
                </CheckboxGroup>
              </Center>
            )}
            <ButtonGroup vertical block>
              <Button
                onClick={async () => {
                  if (options.includes("hardcore")) {
                    if (
                      !(await dialog.confirm(
                        "Once you start in hardcore mode, you won't be able to pause the game or use autocheck. If you leave or close the tab, hardcore mode will be permanently invalidated for this puzzle, but you can still solve it normally.",
                        { title: "Ready to start?" }
                      ))
                    ) {
                      return;
                    }
                    if (document.fullscreenEnabled) {
                      document.documentElement.requestFullscreen();
                    }
                  }
                  setModalState(null);
                  posthog.capture(restoredTime > 0 ? "continue_puzzle" : "start_puzzle", { puzzle: data.id });
                }}
                onTouchStart={() => {
                  startTouched.current = true;
                  console.log("touch input detected");
                }}
                appearance="primary"
                startIcon={options.includes("hardcore") ? <StarIcon /> : undefined}
                loading={cloudLoading}
                disabled={cloudLoading}
              >
                {alreadyCompleted
                  ? "Admire Puzzle"
                  : restoredTime > 0
                    ? "Continue Solving"
                    : `Start Solving${options.includes("hardcore") ? " (Hardcore)" : ""}`}
              </Button>
              {type !== "custom" && (
                <Button
                  onClick={() => {
                    navigate(`/${type}/archive`);
                    posthog.capture("open_archive");
                  }}
                  appearance="default"
                  startIcon={<ArchiveIcon />}
                >
                  Archive
                </Button>
              )}
            </ButtonGroup>
            <ButtonGroup justified>
              <Button
                startIcon={<ArrowLeftIcon />}
                appearance="subtle"
                onClick={() => {
                  if (type === "custom") {
                    navigate("/custom");
                    return;
                  }
                  if (location.state?.fromArchive) {
                    navigate(`/${type}/archive`);
                    return;
                  }
                  navigate("/");
                }}
              >
                Back
              </Button>
              {type !== "custom" &&
                (user ? (
                  <Button startIcon={<ChartNoAxesColumnIcon />} appearance="subtle" onClick={() => setModalState("stats")}>
                    Stats
                  </Button>
                ) : (
                  <AccountButtons modalState={modalState} setModalState={setModalState} appearance="subtle" />
                ))}
            </ButtonGroup>
          </VStack>
        </Modal>
      )}

      <Modal
        open={paused}
        onClose={() => {
          setPaused(false);
        }}
        keyboard={false}
        centered
        size="fit-content"
        overflow={false}
        className="pause-modal"
      >
        <VStack spacing={10}>
          <Heading level={2} className="merriweather-display">
            Paused
          </Heading>
          {timeRef.current.length === 2 ? (
            <Text weight="bold" size={"lg"} className="pause-time block centered">
              {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
            </Text>
          ) : (
            ""
          )}
          <Button
            appearance="primary"
            onClick={() => {
              setPaused(false);
              posthog.capture("resume");
            }}
            startIcon={<PlayIcon />}
          >
            Resume
          </Button>
        </VStack>
      </Modal>

      <SignIn
        open={modalState === "sign-in"}
        setOpen={() => {
          setModalState("welcome");
        }}
      />

      {type !== "custom" && isArchive && (
        <Content className="connections">
          <ArchivePage type={type} />
        </Content>
      )}

      {type !== "custom" && (
        <Stats
          open={modalState === "stats"}
          setOpen={() => {
            setModalState("welcome");
          }}
          type={type}
        />
      )}

      {data && restoredTime > -1 && modalState === null ? (
        <Timer
          onPause={() => {
            pause();
          }}
          isPaused={paused}
          setPaused={setPaused}
          running={!paused && !complete}
          setTime={(time) => {
            timeRef.current = time;
          }}
          puzzle={data}
          restoredTime={restoredTime}
        />
      ) : (
        ""
      )}
      {data && restoredTime > -1 && modalState === null ? (
        <Crossword
          data={data}
          startTouched={startTouched.current}
          timeRef={timeRef}
          stateDocId={stateDocId}
          alreadyCompleted={alreadyCompleted}
        />
      ) : (
        !data && !error && <Text className="loading centered block"></Text>
      )}
      {error && <PuzzleLoadError errorType={error} />}
    </CrosswordAppState.Provider>
  );
}

export default App;
