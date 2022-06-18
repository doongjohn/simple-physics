function simulate() {
  let subdt = deltaTime / substep
  for (let i = 0; i < substep; ++i) {
    // collision resolution
    for (let p of points)
      p.collisionBorder()

    for (let a of circles)
      for (let b of circles)
        a.collisionCircle(b)

    for (let c of circles)
      c.collisionBorder()

    // gravity
    for (let p of points) p.a.y += gravity
    for (let c of circles) c.a.y += gravity

    // move to next position
    for (let p of points) p.move(subdt)
    for (let c of circles) c.move(subdt)

    // collision response
    for (let p of points)
      p.collisionBorderBounce()

    forAllPairs(circles, (a, b) => {
      a.collisionCircle(b, true)
    })

    for (let c of circles)
      c.collisionBorderBounce()

    // update sticks
    for (let s of sticks)
      s.constrainDistance()
  }
}

function render() {
  clearScreen()
  for (let s of sticks) s.draw()
  for (let p of points) p.draw()
  for (let c of circles) c.draw()
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
