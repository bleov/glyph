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
        "id": "json1612619704",
        "maxSize": 1,
        "name": "mini",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2599515954",
        "maxSize": 1,
        "name": "midi",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2392697706",
        "maxSize": 1,
        "name": "daily",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3220634645",
        "maxSize": 1,
        "name": "connections",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3338651345",
        "maxSize": 1,
        "name": "wordle",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1510150617",
        "maxSize": 1,
        "name": "strands",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3445172078",
        "maxSize": 1,
        "name": "cryptic",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3704511449",
    "indexes": [],
    "listRule": null,
    "name": "user_today_status",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  user.id AS id,\n\n  COALESCE(\n    CASE\n      WHEN mini.id IS NULL THEN 0\n      WHEN mini.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS mini,\n\n  COALESCE(\n    CASE\n      WHEN midi.id IS NULL THEN 0\n      WHEN midi.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS midi,\n\n  COALESCE(\n    CASE\n      WHEN daily.id IS NULL THEN 0\n      WHEN daily.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS daily,\n\n  COALESCE(\n    CASE\n      WHEN connections.id IS NULL THEN 0\n      WHEN connections.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS connections,\n\n  COALESCE(\n    CASE\n      WHEN wordle.id IS NULL THEN 0\n      WHEN wordle.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS wordle,\n\n  COALESCE(\n    CASE\n      WHEN strands.id IS NULL THEN 0\n      WHEN strands.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS strands,\n\n  COALESCE(\n    CASE\n      WHEN cryptic.id IS NULL THEN 0\n      WHEN cryptic.complete THEN 2\n      ELSE 1\n    END,\n    0\n  ) AS cryptic\n\nFROM users AS user\n\nJOIN archive AS archive\n  ON archive.publication_date = date('now', 'localtime')\n\nLEFT JOIN puzzle_state AS mini\n  ON mini.user = user.id\n  AND mini.puzzle_id = archive.mini_id\n\nLEFT JOIN puzzle_state AS midi\n  ON midi.user = user.id\n  AND midi.puzzle_id = archive.midi_id\n\nLEFT JOIN puzzle_state AS daily\n  ON daily.user = user.id\n  AND daily.puzzle_id = archive.daily_id\n\nLEFT JOIN connections_state AS connections\n  ON connections.user = user.id\n  AND connections.puzzle_id = archive.connections_id\n\nLEFT JOIN wordle_state AS wordle\n  ON wordle.user = user.id\n  AND wordle.puzzle_id = archive.wordle_id\n\nLEFT JOIN strands_state AS strands\n  ON strands.user = user.id\n  AND strands.puzzle_id = archive.strands_id\n\nLEFT JOIN cryptic_state AS cryptic\n  ON cryptic.user = user.id\n  AND cryptic.puzzle_id = archive.cryptic_id",
    "viewRule": "@request.auth.id != \"\" && id = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3704511449");

  return app.delete(collection);
})
