import specialEscape from 'special-escape'

const specialChars = [
  '+',
  '-',
  '=',
  '&&',
  '||',
  '>',
  '<',
  '!',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  '^',
  '"',
  '~',
  '*',
  '?',
  ':',
  '\\',
  '/',
]

function loginUser(req, db, validator, ValidationError, sign) {
  const validationResults = validator(req)
  if (validationResults instanceof ValidationError) {
    return Promise.reject(validationResults)
  }
  return db
    .search({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      q: `(email:${specialEscape(
        req.body.email,
        specialChars
      )}) AND (digest:${specialEscape(req.body.digest, specialChars)})`,
      defaultOperator: 'AND',
    })
    .then(res => {
      if (res.hits.total > 0) {
        const payload = { sub: res.hits.hits[0]._id }
        const options = { algorithm: 'RS512' }
        console.log(process.env.PRIVATE_KEY)
        const privateKeyClean = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
        console.log(privateKeyClean)
        const privateKeyCleanQuotes = privateKeyClean.replace(/(^")|("$)/g, '')

        console.log(privateKeyCleanQuotes)
        const token = sign(payload, privateKeyCleanQuotes, options)
        return token
      }
      return Promise.reject(new Error('Not Found'))
    })
}

export default loginUser
