/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1684777720")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_l1ypsys2um` ON `cryptic_leaderboard` (\n  `user`,\n  `puzzle_id`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1684777720")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
