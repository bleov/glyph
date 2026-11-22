import type { ConnectionsCard, ConnectionsGame } from "@/lib/types";
import { LayoutGridIcon } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Button, Modal, Text } from "rsuite";

interface ReorderModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: ConnectionsGame;
  setData: Dispatch<SetStateAction<ConnectionsGame | null>>;
}

interface ReorderCardProps {
  card: ConnectionsCard;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

function ReorderCard({ card, index, selected, onSelect }: ReorderCardProps) {
  return (
    <button
      type="button"
      className={`reorder-card${selected ? " selected" : ""}`}
      title={card.content}
      onClick={() => onSelect(index)}
      aria-pressed={selected}
    >
      {card.content}
    </button>
  );
}

interface ReorderModalContentProps {
  cards: ConnectionsCard[];
  data: ConnectionsGame;
  setOpen: (open: boolean) => void;
  setData: Dispatch<SetStateAction<ConnectionsGame | null>>;
}

function ReorderModalContent({ cards, data, setOpen, setData }: ReorderModalContentProps) {
  const [orderedCards, setOrderedCards] = useState<ConnectionsCard[]>(cards);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectCard = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    const fromIndex = selectedIndex;
    const toIndex = index;
    setOrderedCards((currentCards) => {
      const nextCards = [...currentCards];
      [nextCards[fromIndex], nextCards[toIndex]] = [nextCards[toIndex], nextCards[fromIndex]];
      return nextCards;
    });
    setSelectedIndex(null);
  };

  const finishReorder = () => {
    const positionsByOriginalPosition = new Map(orderedCards.map((card, position) => [card.position, position]));
    const updatedCategories = data.categories.map((category) => ({
      ...category,
      cards: category.cards.map((card) => ({
        ...card,
        position: positionsByOriginalPosition.get(card.position) ?? card.position
      }))
    }));

    setData((currentData) => {
      if (!currentData) return currentData;
      return {
        ...currentData,
        categories: updatedCategories
      };
    });
    setOpen(false);
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title>
          <LayoutGridIcon /> Reorder Cards
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="reorder-card-grid">
          {orderedCards.map((card, index) => (
            <ReorderCard key={card.position} card={card} index={index} selected={selectedIndex === index} onSelect={selectCard} />
          ))}
        </div>
        <Text weight="bold" align="center" size="md">
          Select two cards to swap their positions
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button appearance="primary" onClick={finishReorder}>
          Done
        </Button>
      </Modal.Footer>
    </>
  );
}

export default function ReorderModal({ open, setOpen, data, setData }: ReorderModalProps) {
  const cards = useMemo(() => {
    const cards: ConnectionsCard[] = [];
    data.categories.forEach((category) => {
      category.cards.forEach((card) => {
        cards.push(card);
      });
    });
    cards.sort((a, b) => a.position - b.position);
    return cards;
  }, [data]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      size="md"
      className="reorder-modal"
      backdrop="static"
    >
      {open && (
        <ReorderModalContent
          key={cards.map((card) => `${card.position}:${card.content}`).join("|")}
          cards={cards}
          data={data}
          setOpen={setOpen}
          setData={setData}
        />
      )}
    </Modal>
  );
}
