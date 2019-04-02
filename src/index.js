import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import elasticsearch from 'elasticsearch'

import checkEmptyPayload from './middleware/check-empty-payload'
import checkContentTypeIsSet from './middleware/check-content-type-is-set'
import checkContentTypeIsJson from './middleware/check-content-type-is-json'
import errorHandler from './middleware/error-handler'

import ValidationError from './validators/errors/validation-error'
import createUserValidator from './validators/users/create'
import injectHandlerDependencies from './utils/inject-handler-dependencies'
import createUserEngine from './engines/users/create'
import createUser from './handlers/users/create'

const handlerToEngineMap = new Map([[createUserHandler, createUserEngine]])

const handlerToValidatorMap = new Map([
  [createUserHandler, createUserValidator]
])

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${
    process.env.ELASTICSEARCH_HOSTNAME
  }:${process.env.ELASTICSEARCH_PORT}`
})
const app = express()

app.use(checkEmptyPayload)
app.use(checkContentTypeIsSet)
app.use(checkContentTypeIsJson)
app.use(bodyParser.json({ limit: 1e6 }))

app.post(
  '/users',
  injectHandlerDependencies(
    createUser,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)

app.use(errorHandler)

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `gitopsreact API server listening on port ${process.env.SERVER_PORT}!`
  )
})
