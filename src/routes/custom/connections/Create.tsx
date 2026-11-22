import { GlobalState } from "@/lib/GlobalState";
import type { ConnectionsGame, CustomPuzzle } from "@/lib/types";
import { pb } from "@/main";
import { LayoutGridIcon, PencilIcon, SaveIcon, SaveOffIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useBeforeUnload, useParams } from "react-router";
import { Button, Center, Text, VStack, ButtonToolbar, Box } from "rsuite";
import CategoryEditor from "./Components/CategoryEditor";
import posthog from "posthog-js";
import DetailsEditor from "../Components/DetailsEditor";
import PuzzleLoadError, { type PuzzleLoadErrorType } from "@/Components/PuzzleLoadError";
import ReorderModal from "./Components/ReorderModal";

function randomizeCardPositions(puzzle: ConnectionsGame): ConnectionsGame {
  const randomized = {
    ...puzzle,
    categories: puzzle.categories.map((category) => ({
      ...category,
      cards: category.cards.map((card) => ({ ...card }))
    }))
  };
  const positions = randomized.categories.flatMap((category) => category.cards.map((card) => card.position));

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let positionIndex = 0;
  randomized.categories.forEach((category) => {
    category.cards.forEach((card) => {
      card.position = positions[positionIndex++];
    });
  });

  return randomized;
}

export default function ConnectionsCreator() {
  const [record, setRecord] = useState<CustomPuzzle | null>(null);
  const [error, setError] = useState<PuzzleLoadErrorType | null>(null);
  const [data, setData] = useState<ConnectionsGame | null>(null);
  const [reorderOpen, setReorderOpen] = useState<boolean>(false);

  const [editingDetails, setEditingDetails] = useState<boolean>(false);
  const [details, setDetails] = useState({ title: "Untitled Puzzle", options: [] as string[] });
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");

  const params = useParams();
  const { user } = useContext(GlobalState);

  const DefaultPuzzle: ConnectionsGame = {
    categories: new Array(4).fill({ title: "", cards: [] }),
    editor: "",
    id: 0,
    print_date: "",
    status: "OK"
  };

  DefaultPuzzle.categories.forEach((category, index) => {
    for (let i = 0; i < 4; i++) {
      const newCards = [...DefaultPuzzle.categories[index].cards];
      newCards.push({
        position: index * 4 + i,
        content: ""
      });
      DefaultPuzzle.categories[index] = { ...category, cards: newCards };
    }
  });

  useBeforeUnload((e) => {
    if (saveStatus === "unsaved" || saveStatus === "saving" || saveStatus === "error") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  useEffect(() => {
    document.title = "Create Custom Connections - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom_connections/favicon.svg`);

    if (params.id) {
      // Existing puzzle
      pb.collection("custom_puzzles")
        .getOne(params.id)
        .then((record) => {
          if (record.puzzle == null) {
            setRecord(record as CustomPuzzle);
            setData(randomizeCardPositions(DefaultPuzzle));
          } else {
            setRecord(record as CustomPuzzle);
            setDetails({ title: record.title, options: record.public ? ["public"] : [] });
            setData(record.puzzle as ConnectionsGame);
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err?.toString().includes("404") ? "NOT_FOUND" : "NETWORK_ERROR");
        });
    } else {
      setError("NOT_FOUND");
    }
  }, []);

  async function save() {
    if (saveStatus === "saving") return;
    if (!data || !record) return;
    if (!user || !pb.authStore.isValid) {
      return;
    }
    const customPuzzles = pb.collection("custom_puzzles");
    const puzzle = {
      ...data
    };
    const newRecord = {
      author: user.id,
      title: details.title?.substring(0, 35) || "Untitled Puzzle",
      puzzle,
      public: details.options.includes("public"),
      shape: null
    };
    setSaveStatus("saving");
    posthog.capture("save_custom_puzzle", { puzzleId: record.id, public: newRecord.public, type: "connections" });
    customPuzzles
      .update(record.id, newRecord)
      .then(() => {
        setSaveStatus("saved");
      })
      .catch(() => {
        setSaveStatus("error");
      });
  }

  useEffect(() => {
    setSaveStatus("unsaved");
  }, [data, details]);

  if (error) {
    return <PuzzleLoadError errorType={error} />;
  }

  if (data) {
    return (
      <Box width={"min(100%, 800px)"} margin={"0 auto"}>
        <VStack spacing={8}>
          <VStack spacing={8} className="categories" width={"100%"}>
            {data.categories.map((category, categoryIndex) => (
              <CategoryEditor
                key={category.cards[0].position}
                category={category}
                categoryIndex={categoryIndex}
                onChange={(category) => {
                  setData((prevData) => {
                    if (!prevData) return prevData;
                    const newCategories = [...prevData.categories];
                    newCategories[categoryIndex] = category;
                    return { ...prevData, categories: newCategories };
                  });
                }}
                onSwap={(oldIndex, newIndex) => {
                  setData((oldData) => {
                    if (!oldData) return oldData;
                    const newData = { ...oldData };
                    const newCategories = [...newData.categories];
                    newCategories[newIndex] = oldData.categories[oldIndex];
                    newCategories[oldIndex] = oldData.categories[newIndex];
                    newData.categories = newCategories;
                    console.log(newData);
                    return newData;
                  });
                }}
              />
            ))}
          </VStack>
          <ButtonToolbar width={"100%"} justifyContent={"center"}>
            <Button
              startIcon={<PencilIcon />}
              onClick={() => {
                setEditingDetails(true);
              }}
            >
              Details
            </Button>
            <Button
              startIcon={<LayoutGridIcon />}
              onClick={() => {
                setReorderOpen(true);
              }}
            >
              Reorder
            </Button>
            <Button
              startIcon={<SaveIcon />}
              appearance="primary"
              color={saveStatus === "unsaved" ? "blue" : undefined}
              onClick={save}
              loading={saveStatus === "saving"}
              disabled={saveStatus === "saved"}
            >
              Save
            </Button>
          </ButtonToolbar>
          <Text width={"100%"} align="center">
            {saveStatus === "error" && (
              <Text color={"red"}>
                <SaveOffIcon /> Failed to save changes
              </Text>
            )}
          </Text>
        </VStack>
        <ReorderModal open={reorderOpen} setOpen={setReorderOpen} data={data} setData={setData} />
        <DetailsEditor open={editingDetails} setOpen={setEditingDetails} details={details} setDetails={setDetails} />
      </Box>
    );
  }
}
