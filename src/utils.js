const log = {
  vector(v) {
    console.log(`[${v.x}, ${v.y}]`)
  },
}

function forAllPairs(array, cb) {
  if (!array || array.length < 2) return
  for (let a = 0; a < array.length - 1; ++a)
    for (let b = a + 1; b < array.length; ++b)
      cb(array[a], array[b])
}
