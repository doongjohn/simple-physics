function simulate() {
  let subdt = deltaTime / substep
  for (let i = 0; i < substep; ++i) {
    // collision resolution
    for (let a of circles)
      for (let b of circles)
        a.collisionCircle(b)

    for (let c of circles)
      c.collisionBorder()

    // gravity
    for (let c of circles)
      c.a.y += 100

    // move to next position
    for (let c of circles)
      c.move(subdt)

    // collision response
    forAllPairs(circles, (a, b) => {
      a.collisionCircle(b, true)
    })

    for (let c of circles) {
      c.collisionBorderBounce()
    }
  }
}

function render() {
  clearScreen()
  for (let c of circles)
    c.draw()
}

; (function loop() {
  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

  simulate()
  render()
  requestAnimationFrame(loop)
})()

// frame by frame
// window.addEventListener('keydown', (input) => {
//   if (input.key == ' ') {
//     deltaTime = 0.01
//     loop()
//   }
// })
