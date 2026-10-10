import { useCallback, useEffect, useRef } from "react";
import localforage from "localforage";
import { pb } from "@/main";
import posthog from "posthog-js";
import type { CrypticGame } from "@/lib/types";

export default function usePersistence(
  data: CrypticGame,
  setLoading: (x: boolean) => void,
  entry: string[],
  revealed: boolean[],
  hints: string[],
  complete: boolean,
  setEntry: (x: string[]) => void,
  setRevealed: (x: boolean[]) => void,
  setHints: (x: string[]) => void,
  setComplete: (x: boolean) => void
): void {
  const save = {
    entry,
    revealed,
    hints,
    complete
  };

  const saveRef = useRef(save);
  const completeRef = useRef(complete);
  const saveReadyRef = useRef(false);
  const recordIdRef = useRef<string | null>(null);
  saveRef.current = save;
  completeRef.current = complete;

  async function cloudLoad(): Promise<string> {
    const states = pb.collection("cryptic_state");
    if (!pb.authStore.isValid) return "";
    try {
      const record = (await states.getFirstListItem(pb.filter(`puzzle_id={:id}`, { id: data.puzzleId }))) as Record<string, any>;
      const storageRecord: any = {};
      Object.keys(save).forEach((key) => {
        storageRecord[key] = record.state[key];
      });
      await localforage.setItem(`cryptic-${data.puzzleId}`, storageRecord);
      recordIdRef.current = record.id;
      return record.id;
    } catch (err) {
      return "";
    }
  }

  const cloudSave = () => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;
    const states = pb.collection("cryptic_state");

    const record = {
      user: user.id,
      puzzle_id: data.puzzleId,
      puzzle_date: data.date,
      state: saveRef.current,
      complete: completeRef.current
    };
    if (recordIdRef.current) {
      states
        .update(recordIdRef.current, record)
        .then((res) => {})
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    } else {
      states
        .create(record)
        .then((res) => {
          recordIdRef.current = res.id;
        })
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    }
  };

  const submitScore = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;

    const leaderboard = pb.collection("cryptic_leaderboard");
    const record = {
      user: user.id,
      puzzle_id: data.puzzleId,
      puzzle_date: data.date,
      hint_count: saveRef.current.hints.length,
      hint_order: saveRef.current.hints
    };
    void leaderboard.create(record).catch(() => {});
    posthog.capture("cryptic_leaderboard_submit");
  }, [data.puzzleId, data.date]);

  function applySave(save: any) {
    setEntry(save.entry);
    setHints(save.hints);
    setRevealed(save.revealed);
    setComplete(save.complete);
    setTimeout(() => {
      saveReadyRef.current = true;
      setLoading(false);
    }, 50);
  }

  useEffect(() => {
    localforage.setItem(`cryptic-${data.puzzleId}`, save).catch(console.error);
  }, Object.values(save));

  useEffect(() => {
    cloudLoad()
      .then(() => {
        localforage
          .getItem(`cryptic-${data.puzzleId}`)
          .then((saved: any) => {
            if (saved) {
              applySave(saved);
            } else {
              setLoading(false);
            }
          })
          .catch(() => {
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [data.puzzleId]);

  useEffect(() => {
    if (!saveReadyRef.current) return;
    cloudSave();
  }, [hints, complete, revealed]);

  useEffect(() => {
    if (complete) {
      submitScore();
      posthog.capture("cryptic_complete", { puzzleId: data.puzzleId });
    }
  }, [complete]);
}
