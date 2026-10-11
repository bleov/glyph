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
        "id": "json3605471676",
        "maxSize": 1,
        "name": "hintsFound",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1066547961",
        "maxSize": 1,
        "name": "wordsFound",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3278863816",
        "maxSize": 1,
        "name": "hintsUsed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number3458571709",
        "max": null,
        "min": null,
        "name": "attempted",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1114099747",
        "maxSize": 1,
        "name": "complete",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2121164536",
        "maxSize": 1,
        "name": "completedHintless",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3647656859",
    "indexes": [],
    "listRule": null,
    "name": "strands_stats",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n\tuser as id,\n\tSUM(json_array_length(state, \"$.foundHints\")) hintsFound,\n\tSUM(json_array_length(state, \"$.revealedCells\") + (CASE WHEN json_array_length(state, \"$.spangramRevealedCells\") >= 1 THEN 1 ELSE 0 END)) wordsFound,\n\tSUM(COALESCE(json_extract(state, \"$.hintsUsed\"), 0)) hintsUsed,\n\tCOUNT(id) as attempted,\n\tSUM(COALESCE(complete, 0)) as complete,\n\tSUM(CASE WHEN complete = 1 AND COALESCE(json_extract(state, '$.hintsUsed'), 0) = 0 THEN 1 ELSE 0 END) AS completedHintless\nFROM strands_state\nGROUP BY user",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ id || @request.auth.id = id)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3647656859");

  return app.delete(collection);
})
