/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // add field
  collection.fields.addAt(18, new Field({
    "help": "",
    "hidden": false,
    "id": "file2666849659",
    "maxSelect": 0,
    "maxSize": 15000000,
    "mimeTypes": [
      "application/json"
    ],
    "name": "krillion",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // remove field
  collection.fields.removeById("file2666849659")

  return app.save(collection)
})
