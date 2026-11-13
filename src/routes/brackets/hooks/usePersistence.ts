import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import localforage from "localforage";
import { pb } from "@/main";
import posthog from "posthog-js";
import type { PuzzleContextType } from "../components/BracketCity";
import type { BracketCityGame } from "@/lib/types";
import type { BracketsStateResponse } from "@/lib/pb-types";

export default function usePersistence(
  context: PuzzleContextType,
  complete: boolean,
  data: BracketCityGame,
  setLoading: Dispatch<SetStateAction<boolean>>
): void {
  const save = useMemo(() => {
    return {
      activePeeks: context.activePeeks,
      hintsUsed: context.hintsUsedRef.current,
      bank: context.bank,
      incorrectAnswers: context.incorrectAnswers,
      lastCorrect: context.lastCorrect
    };
  }, [context.activePeeks, context.hintsUsedRef, context.bank, context.incorrectAnswers, context.lastCorrect]);

  const saveReadyRef = useRef(false);
  const recordIdRef = useRef<string | null>(null);

  async function cloudLoad(): Promise<string> {
    const states = pb.collection("brackets_state");
    if (!pb.authStore.isValid) return "";
    try {
      const record = await states.getFirstListItem<BracketsStateResponse<typeof save>>(
        pb.filter(`puzzle_id={:id}`, { id: data.shortCode })
      );
      const storageRecord: any = {};
      (Object.keys(save) as Array<keyof typeof save>).forEach((key) => {
        storageRecord[key] = record.state?.[key];
      });
      await localforage.setItem(`brackets-${data.shortCode}`, storageRecord);
      recordIdRef.current = record.id;
      return record.id;
    } catch {
      return "";
    }
  }

  const cloudSave = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;
    const states = pb.collection("brackets_state");

    const record = {
      user: user.id,
      puzzle_id: data.shortCode,
      puzzle_date: data.puzzleDate,
      state: save,
      complete
    };
    if (recordIdRef.current) {
      states.update(recordIdRef.current, record).catch((err) => {
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
  }, [data.shortCode, data.puzzleDate, save]);

  const submitScore = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;

    const leaderboard = pb.collection("brackets_leaderboard");
    const record = {
      user: user.id,
      puzzle_id: data.shortCode,
      puzzle_date: data.puzzleDate,
      peek_count: save.activePeeks.length,
      hint_count: save.hintsUsed,
      incorrect_count: save.incorrectAnswers
    };
    void leaderboard.create(record).catch(() => {});
    posthog.capture("brackets_leaderboard_submit");
  }, [data.shortCode, data.puzzleDate, save]);

  function applySave(save: any) {
    context.setActivePeeks(save.activePeeks);
    context.hintsUsedRef.current = save.hintsUsed;
    context.setBank(save.bank);
    context.setLastCorrect(save.lastCorrect ?? null);
    setTimeout(() => {
      saveReadyRef.current = true;
      setLoading(false);
    }, 50);
  }

  useEffect(() => {
    localforage.setItem(`brackets-${data.shortCode}`, save).catch(console.error);
  }, [save, data.shortCode]);

  useEffect(() => {
    cloudLoad()
      .then(() => {
        localforage
          .getItem(`brackets-${data.shortCode}`)
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
  }, [data.shortCode]);

  useEffect(() => {
    if (!saveReadyRef.current) return;
    cloudSave();
  }, [save, cloudSave]);

  useEffect(() => {
    if (complete) {
      submitScore();
      posthog.capture("brackets_complete", { puzzleId: data.shortCode });
    }
  }, [complete, submitScore, data.shortCode]);
}
