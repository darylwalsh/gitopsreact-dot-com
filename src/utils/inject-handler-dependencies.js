function injectHandlerDependencies(
  handler,
  db,
  handerToEngineMap,
  handlerToValidatorMap,
  ValidationError
) {
  const engine = handlerToEngineMap.get(handler)
  const validator = handlerToValidatorMap.get(handler)

  return (req, res) => {
    handler(req, res, db, engine, validator, ValidationError)
  }
}

export default injectHandlerDependencies
