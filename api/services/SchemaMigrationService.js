/**
 * @module SchemaMigrationService
 * @description Schema Migrations
 */
module.exports = class SchemaMigrationService extends Service {

  /**
   * @param connection connection object
   *
   * Drop collections in current connection
   */
  drop (connection) {
    return Promise.all(
      Object.values(connection.collections).map(collection => {
        return new Promise((resolve, reject) => {
          collection.drop(err => {
            if (err) return reject()
            resolve()
          })
        })
      }))
  }

  /**
   * Alter an existing schema
   */
  alter (connection) {
    throw new Error('trailpack-mongoose does not currently support migrate=alter')
  }

  /**
   * Do not perform any migrations.
   */
  none () {
  }
}
