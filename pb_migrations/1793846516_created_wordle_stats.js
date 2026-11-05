/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number356394894",
        "max": null,
        "min": null,
        "name": "games_completed",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3266595574",
        "maxSize": 1,
        "name": "guess_distribution",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3376622359",
    "indexes": [],
    "listRule": null,
    "name": "wordle_stats",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  user AS id,\n  COUNT(*) AS games_completed,\n  json_object(\n    \"1\", SUM(json_array_length(state, \"$.completeRows\") = 1),\n    \"2\", SUM(json_array_length(state, \"$.completeRows\") = 2),\n    \"3\", SUM(json_array_length(state, \"$.completeRows\") = 3),\n    \"4\", SUM(json_array_length(state, \"$.completeRows\") = 4),\n    \"5\", SUM(json_array_length(state, \"$.completeRows\") = 5),\n    \"6\", SUM(json_array_length(state, \"$.completeRows\") = 6)\n  ) AS guess_distribution\nFROM wordle_state\nWHERE complete = 1\nGROUP BY user",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ id || @request.auth.id = id)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3376622359");

  return app.delete(collection);
})
