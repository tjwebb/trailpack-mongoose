const mongoose = require('mongoose')
const DatastoreTrailpack = require('trailpack/datastore')
const lib = require('./lib')

/**
 * Mongoose integration for Trails. Allows mongoose to read its configration from the
 * trails datastore config, and auto-migrate on startup.
 */
module.exports = class MongooseTrailpack extends DatastoreTrailpack {

  /**
   * Ensure that this trailpack supports the configured migration
   */
  validate () {
  }

  /**
   * Create default configuration
   */
  configure () {
    this.app.config.set('stores.orm', 'mongoose')

    this.mongoose = mongoose
  }

  /**
   * Initialize mongoose connections, and perform migrations.
   */
  initialize () {
    super.initialize()

    // Binding promise library
    // We will use default one
    mongoose.Promise = global.Promise

    this.models = lib.Transformer.transformModels(this.app)

    this.orm = this.orm || {}
    // Need to pick only mongoose stores
    const stores = lib.Transformer.pickStores(this.app.config.stores)
    // iterating only through mongo stores
    this.connections = new Map(Object.entries(stores).map(([ storeName, store ]) => {
      store = Object.assign({ }, store)

      if (typeof store.uri !== 'string')
        throw new Error('Store must contain "uri" option')

      if (typeof store.options !== 'object')
        store.options = { }

      const connection = mongoose.createConnection(store.uri, store.options)
      const models = Object.values(this.models).filter(m => m.connection === storeName)

      models.forEach(model => {
        const schema = new mongoose.Schema(model.schema, model.schemaOptions)
        // Bind statics & methods
        schema.statics = model.statics
        schema.methods = model.methods

        model.onSchema(this.app, schema)

        //create model
        this.orm[model.globalId] = connection.model(model.globalId, schema, model.tableName)
        this.orm[model.identity] = this.orm[model.globalId]
      })

      return [ storeName, connection ]
    }))

    this.app.orm = this.orm

    return this.migrate()
  }

  /**
   * Close all database connections
   */
  unload () {
    const closeConnections = [ ]
    this.connections.forEach(connection => {
      closeConnections.push(new Promise((resolve, reject) => {
        connection.close((err) => {
          if (err) return reject(err)
          resolve()
        })
      }))
    })

    return Promise.all(closeConnections)
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }

  /**
   * Run migrations
   */
  migrate () {
    const SchemaMigrationService = this.app.services.SchemaMigrationService

    if (this.app.config.get('stores.models.migrate') == 'none') return

    const migrations = [ ]
    this.connections.forEach((connection, storeName) => {
      const migrateMethod = this.app.config.get(`stores.${storeName}.migrate`)
      //console.log('migrating with migrate method', migrateMethod)
      migrations.push(SchemaMigrationService[migrateMethod](connection))
    })

    return Promise.all(migrations)
  }
}
