/// <reference path="../pb_data/types.d.ts" />

cronAdd("archive", "1 0 * * *", async () => {
  const util = require(`${__hooks}/util.js`);
  const today = util.getTodayDateString();
  console.log(`[archive] starting archive for ${today}`);

  const archive = $app.findCollectionByNameOrId("archive");

  let record = null;
  try {
    record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    console.log(`[archive] updating existing record ${record.get("id")}`);
  } catch {
    console.log("[archive] a new record will be created");
    record = new Record(archive);
  }

  const NYT = "https://nytimes.com";
  const MINI_URL = [NYT, "svc", "crosswords", "v6", "puzzle", "mini", `${today}.json`].join("/");
  const MIDI_URL = [NYT, "svc", "crosswords", "v6", "puzzle", "midi", `${today}.json`].join("/");
  const DAILY_URL = [NYT, "svc", "crosswords", "v6", "puzzle", "daily", `${today}.json`].join("/");
  const CONNECTIONS_URL = [NYT, "svc", "connections", "v2", `${today}.json`].join("/");
  const WORDLE_URL = [NYT, "svc", "wordle", "v2", `${today}.json`].join("/");
  const STRANDS_URL = [NYT, "svc", "strands", "v2", `${today}.json`].join("/");
  const CRYPTIC_URL = ["https://minutecryptic.com", "api", "daily_puzzle", "today?tz=America%2FNew_York"].join("/");
  const BRACKETS_URL = ["https://8huadblp0h.execute-api.us-east-2.amazonaws.com", "puzzles", today].join("/");

  function fetchPuzzle(url, bypass) {
    const headers = {};
    if (bypass) {
      headers[["X", "Games", "Auth", "Bypass"].join("-")] = true;
    }

    return $http.send({
      url,
      method: "GET",
      body: "",
      headers,
      timeout: 30
    }).json;
  }

  function addPuzzle(data, id, type) {
    console.log(`[archive] ${type} fetched successfully (${id})`);
    record.set(`${type}_id`, id);
    if (data.body && data.body[0]) {
      data.body[0].SVG = {};
    }
    record.set(type, data);
  }

  const mini = fetchPuzzle(MINI_URL, true);
  const midi = fetchPuzzle(MIDI_URL, true);
  const daily = fetchPuzzle(DAILY_URL, true);
  const connections = fetchPuzzle(CONNECTIONS_URL);
  const wordle = fetchPuzzle(WORDLE_URL);
  const strands = fetchPuzzle(STRANDS_URL);
  const cryptic = fetchPuzzle(CRYPTIC_URL);
  const brackets = fetchPuzzle(BRACKETS_URL);

  record.set("publication_date", today);

  addPuzzle(mini, mini.id, "mini");
  addPuzzle(midi, midi.id, "midi");
  addPuzzle(daily, daily.id, "daily");
  addPuzzle(connections, connections.id, "connections");
  addPuzzle(wordle, wordle.id, "wordle");
  addPuzzle(strands, strands.id, "strands");
  addPuzzle(cryptic, cryptic.puzzleId, "cryptic");
  addPuzzle(brackets, brackets.shortCode, "brackets");

  $app.save(record);

  console.log(`[archive] complete (${today})`);
});
