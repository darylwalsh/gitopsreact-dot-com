import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import elasticsearch from 'elasticsearch'

import checkEmptyPayload from './middleware/check-empty-payload'
import checkContentTypeIsSet from './middleware/check-content-type-is-set'
import checkContentTypeIsJson from './middleware/check-content-type-is-json'
import errorHandler from './middleware/error-handler'

import injectHandlerDependencies from './utils/inject-handler-dependencies'
import ValidationError from './validators/errors/validation-error'

// Create User
import createUserValidator from './validators/users/create'
import createUserEngine from './engines/users/create'
import createUserHandler from './handlers/users/create'

// Retrieve User
import retrieveUserEngine from './engines/users/retrieve'
import retrieveUserHandler from './handlers/users/retrieve'

// Delete User
import deleteUserEngine from './engines/users/delete'
import deleteUserHandler from './handlers/users/delete'

// Search User
import searchUserEngine from './engines/users/search'
import searchUserValidator from './validators/users/search'
import searchUserHandler from './handlers/users/search'

const handlerToEngineMap = new Map([
  [createUserHandler, createUserEngine],
  [retrieveUserHandler, retrieveUserEngine],
  [deleteUserHandler, deleteUserEngine],
  [searchUserHandler, searchUserEngine],
])

const handlerToValidatorMap = new Map([
  [createUserHandler, createUserValidator],
  [searchUserHandler, searchUserValidator],
])

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${
    process.env.ELASTICSEARCH_HOSTNAME
  }:${process.env.ELASTICSEARCH_PORT}`,
})
const app = express()

app.use(checkEmptyPayload)
app.use(checkContentTypeIsSet)
app.use(checkContentTypeIsJson)
app.use(bodyParser.json({ limit: 1e6 }))

app.post(
  '/users',
  injectHandlerDependencies(
    createUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)
app.get(
  '/users/:userId',
  injectHandlerDependencies(
    retrieveUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)
app.delete(
  '/users/:userId',
  injectHandlerDependencies(
    deleteUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)
app.get(
  '/users/',
  injectHandlerDependencies(
    searchUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)
app.use(errorHandler)

const server = app.listen(process.env.SERVER_PORT, async () => {
  const indexParams = { index: process.env.ELASTICSEARCH_INDEX }
  const indexExists = await client.indices.exists(indexParams)
  if (!indexExists) {
    await client.indices.create(indexParams)
  }
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`)
})

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0)
  })
})
