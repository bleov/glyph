/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3376622359")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  user AS id,\n  COUNT(*) AS games_completed,\n  json_object(\n    \"1\", SUM(json_array_length(state, \"$.completeRows\") = 1),\n    \"2\", SUM(json_array_length(state, \"$.completeRows\") = 2),\n    \"3\", SUM(json_array_length(state, \"$.completeRows\") = 3),\n    \"4\", SUM(json_array_length(state, \"$.completeRows\") = 4),\n    \"5\", SUM(json_array_length(state, \"$.completeRows\") = 5),\n    \"6\", SUM(json_array_length(state, \"$.completeRows\") = 6)\n  ) AS guess_distribution\nFROM wordle_state\nWHERE complete = 1 AND length(CAST(puzzle_id AS TEXT)) != 15\nGROUP BY user"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3376622359")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  user AS id,\n  COUNT(*) AS games_completed,\n  json_object(\n    \"1\", SUM(json_array_length(state, \"$.completeRows\") = 1),\n    \"2\", SUM(json_array_length(state, \"$.completeRows\") = 2),\n    \"3\", SUM(json_array_length(state, \"$.completeRows\") = 3),\n    \"4\", SUM(json_array_length(state, \"$.completeRows\") = 4),\n    \"5\", SUM(json_array_length(state, \"$.completeRows\") = 5),\n    \"6\", SUM(json_array_length(state, \"$.completeRows\") = 6)\n  ) AS guess_distribution\nFROM wordle_state\nWHERE complete = 1\nGROUP BY user"
  }, collection)

  return app.save(collection)
})
