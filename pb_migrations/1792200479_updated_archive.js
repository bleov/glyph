/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)",
      "CREATE INDEX `idx_c7v9wzr8p3` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`,\n  `connections_id`,\n  `wordle_id`,\n  `publication_date`,\n  `strands_id`,\n  `cryptic_id`,\n  `brackets_id`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3115264678",
    "max": 0,
    "min": 0,
    "name": "brackets_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "json2974125426",
    "maxSize": 0,
    "name": "brackets",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)",
      "CREATE INDEX `idx_c7v9wzr8p3` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`,\n  `connections_id`,\n  `wordle_id`,\n  `publication_date`,\n  `strands_id`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("text3115264678")

  // remove field
  collection.fields.removeById("json2974125426")

  return app.save(collection)
})
