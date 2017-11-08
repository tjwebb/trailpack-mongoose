module.exports = {

  /**
   * Pick only mongo stores from app config
   * @param {Object} stores
   * @return {Object}
   */
  pickStores (stores) {
    return Object.entries(stores)
      .filter(([ , store ]) => /^mongodb:\/\//.test(store.uri))
      .reduce((stores, [ storeName, store ]) => Object.assign(stores, { [storeName]: store }), { })
  },

  /**
   * Transform model definition from `/api/model` to Mongoose models definition
   * @param {TrailsApp} app
   * @return {Object}
   */
  transformModels (app) {
    return Object.entries(app.models)
      .map(([ modelName, model ]) => {
        const modelConfig = model.constructor.config(app, require('mongoose')) || { }
        const storeConfig = app.config.get(`stores.${modelConfig.store}`)
        const schema = model.constructor.schema(app, require('mongoose')) || { }
        const onSchema = modelConfig.onSchema || function () { }

        return {
          identity: modelName.toLowerCase(),
          globalId: modelName,
          tableName: modelConfig.tableName || modelName.toLowerCase(),
          connection: modelConfig.store,
          migrate: modelConfig.migrate || storeConfig.migrate,
          schema: schema,
          schemaOptions: modelConfig.schema,
          statics: modelConfig.statics || {},
          methods: modelConfig.methods || {},
          onSchema: onSchema
        }
      })
      .reduce((models, model) => Object.assign(models, { [model.globalId]: model }), { })
  }

}
