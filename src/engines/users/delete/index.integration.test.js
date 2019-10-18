import assert from 'assert'
import elasticsearch from 'elasticsearch'
// import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
import del from '.'

const USER_ID = 'TEST_USER_ID'
const USER_OBJ = {
  email: 'e@ma.il',
  password: 'hunter2',
}

// const db = new elasticsearch.Client({
//   host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
// })
// var client = new elasticsearch.Client({
//   host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
//   log: 'trace',
//   apiVersion: '7.4',
// })
// const client = new Client({
//   node: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
// })
var client = new elasticsearch.Client({
  // host: 'localhost:9200',
  host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
  log: 'trace',
  apiVersion: process.env.ELASTICSEARCH_VERSION, // use the same version of your Elasticsearch instance
})

const req = {
  params: {
    userId: USER_ID,
  },
}

describe('Engine - User - Delete', function() {
  let promise
  describe('When the user does not exists', function() {
    beforeEach(function() {
      promise = del(req, db)
    })
    it('should return with a promise that rejects with an Error object', function() {
      return promise.catch(err => assert(err instanceof Error))
    })
    it('that has the mesage "Not Found"', function() {
      return promise.catch(err => assert.equal(err.message, 'Not Found'))
    })
  })
  describe('When the user exists', function() {
    beforeEach(function() {
      // Creates a user with _id set to USER_ID
      promise = db
        .index({
          index: process.env.ELASTICSEARCH_INDEX,
          type: 'user',
          id: USER_ID,
          body: USER_OBJ,
          refresh: true,
        })
        .then(() => del(req, db))
      return promise
    })
    describe('When the Elasticsearch operation is successful', function() {
      it('should return with a promise that resolves', function() {
        return promise.then(() => assert(true))
      })
      it('to undefined', function() {
        return promise.then(res => typeof res === 'undefined')
      })
    })
  })
})
