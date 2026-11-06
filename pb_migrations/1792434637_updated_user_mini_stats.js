/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1964230513")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.friends ?~ id || num_completed >= 50)",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.friends ?~ id || num_completed >= 50)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1964230513")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ id || @request.auth.id = id)"
  }, collection)

  return app.save(collection)
})
