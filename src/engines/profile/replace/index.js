function replace(req, db, validator, ValidationError) {
  const validationResults = validator(req)
  if (validationResults instanceof ValidationError) {
    return Promise.reject(validationResults)
  }
  return db
    .update({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      id: req.params.userId,
      body: {
        script: {
          lang: 'painless',
          source: 'ctx._source.profile = params.profile',
          params: {
            profile: req.body,
          },
        },
      },
    })
    .then(() => undefined)
    .catch(err => {
      if (err.status === 404) {
        return Promise.reject(new Error('Not Found'))
      }
      return Promise.reject(new Error('Internal Server Error'))
    })
}

export default replace
