import { useCallback, useEffect, useState } from "react";
import { Loader, Rate, Text } from "rsuite";
import Star from "@rsuite/icons/Star";
import { pb } from "../main";
import localforage from "localforage";
import posthog from "posthog-js";

export default function Rating({ id }: { id: number }) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const descriptors = ["Rate this puzzle's difficulty", "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

  const fetchRating = useCallback(async () => {
    const averageRatings = pb.collection("average_ratings");
    const ratingData = await averageRatings.getFirstListItem(`puzzle_id='${id}'`);
    if (ratingData && ratingData.rating && ratingData.count) {
      setAverage(Number(ratingData.rating));
      setCount(Number(ratingData.count));
    }
  }, []);

  function rate(e: number) {
    if (loading || voted) return;
    setLoading(true);
    setSelected(e);
    const formData = new FormData();
    formData.set("puzzle_id", id.toString());
    formData.set("rating", e.toString());
    pb.collection("ratings")
      .create(formData)
      .finally(() => {
        setLoading(false);
        setVoted(true);
        localforage.setItem(`rating-${id}`, e);
        fetchRating();
      });
    posthog.capture("difficulty_rating", { puzzle_id: id, rating: e });
  }

  useEffect(() => {
    localforage.getItem(`rating-${id}`).then((value) => {
      if (value) {
        setVoted(true);
        fetchRating();
      }
    });
  }, [id]);

  return (
    <div className="rating-container">
      <Rate
        value={voted ? average : selected}
        readOnly={voted || loading}
        cleanable={false}
        color="#FF9800"
        size="sm"
        onChange={rate}
        onChangeActive={(value) => setHovered(Number(value) || 0)}
        renderCharacter={(_, index) => (
          <Star
            onClickCapture={(event) => {
              event.stopPropagation();
              rate(index + 1);
            }}
          />
        )}
      />
      {voted ? (
        <Text>
          Today's Difficulty: <strong>{average.toFixed(1)}/5</strong> ({count} {count === 1 ? "vote" : "votes"})
        </Text>
      ) : (
        <Text>{descriptors[hovered]}</Text>
      )}
      {loading && <Loader backdrop />}
    </div>
  );
}
