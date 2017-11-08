const smokesignals = require('smokesignals')
const User = require('./model/User')
const Role = require('./model/Role')

module.exports = Object.assign(smokesignals.FailsafeConfig, {
  pkg: {
    name: 'mongoose-trailpack-test'
  },
  api: {
    models: {
      User: User,
      Role: Role
    }
  },
  config: {
    log: {
      logger: new smokesignals.Logger('error')
    },
    main: {
      packs: [
        require('../') // trailpack-mongoose
      ]
    },
    stores: {
      teststore: {
        migrate: 'drop',
        uri: 'mongodb://localhost:27017/test',
        options: {

        }
      },
      storeoverride: {
        migrate: 'drop',
        uri: 'mongodb://localhost:27017/test2',
        options: {

        }
      },
      notMongoStore: {
        migrate: 'drop',
        uri: 'postgres://localhost:5432/tests',
        options: {}
      }
    }
  }
})
