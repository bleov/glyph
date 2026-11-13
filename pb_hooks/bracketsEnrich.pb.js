/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  const config = {
    peekPenalty: 5,
    megaPeekPenalty: 15,
    wrongGuessPenalty: 2
  };

  const baseScore = 100;

  const peekPenalty = config.peekPenalty * e.record.get("peek_count");
  const hintPenalty = config.megaPeekPenalty * e.record.get("hint_count");
  const incorrectPenalty = config.wrongGuessPenalty * e.record.get("incorrect_count");

  const totalPenalty = peekPenalty + hintPenalty + incorrectPenalty;

  const computedScore = baseScore - totalPenalty;

  e.record.set("computed_score", Math.min(Math.max(computedScore, 0), 100));

  e.next();
}, "brackets_leaderboard");
