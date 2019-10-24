function keyClean(key) {
  const keyToClean = key

  const keyCleanStr = keyToClean.replace(/\\n/g, '\n')
  const keyCleanQuotes = keyCleanStr.replace(/(^")|("$)/g, '')

  return keyCleanQuotes
}

export default keyClean
