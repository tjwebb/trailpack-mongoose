/* global describe, it */

const assert = require('assert')

describe('SchemaMigrationService', () => {
  it('should exist', () => {
    assert(global.app.api.services['SchemaMigrationService'])
  })
  describe('#create', () => {
    it('should create collections', () => {
      return Promise.all(Object.values(global.app.models).map(model => {
        return Promise.resolve()
      }))
    })
  })
})
