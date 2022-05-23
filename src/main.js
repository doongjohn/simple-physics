// TODO:
// - [x] 움직이는 원 2개가 서로 충돌 및 반응하기
// - [ ] 움직이는 원 n개가 서로 충돌 및 반응하기
// - [ ] 선분과 원이 서로 충돌 및 반응하기
// - [ ] 터널링 방지 기능 만들기 (CCD)

class Circle {
  constructor(x, y, r, color = '') {
    // position
    this.p = new Vector2(x, y)

    // radius
    this.r = r

    // current velocity
    this.v = new Vector2(0, 0)

    // next frame velocity
    this.nv = null

    // draw color
    this.color = color ? color : '#88e0ff'
  }

  move(dt) {
    Vector2.add(this.p, this.v.mulS(dt))
  }

  draw() {
    drawCircleStroke(this.p.x, this.p.y, this.r - 3, 6, this.color)
  }
}

let circles = []

for (let y = 1; y < 12; ++y) {
  for (let x = 1; x < 23; ++x) {
    circles.push(new Circle(canvas.width - x * 83, canvas.height - y * 83, randomInt(10, 40)))
  }
}

// - click to move the first ball towards the mouse
// - shift click to teleport the first ball to the mouse position
window.addEventListener('mousedown', event => {
  if (event.button != 0) return
  if (event.shiftKey) {
    circles[0].v = Vector2.zero
    circles[0].nv = null
    circles[0].p.x = event.x
    circles[0].p.y = event.y
  } else {
    circles[0].v = circles[0].p.dir(new Vector2(event.x, event.y)).mulS(1000)
  }
})

function isCircleOverlap(a, b) {
  return a.p.distSqr(b.p) <= (a.r + b.r) ** 2
}

class Collision {
  static resolve(self) {
    // resolve other balls
    for (let other of circles) {
      if (self == other) continue
      if (isCircleOverlap(self, other)) {
        let pushDist = (self.r + other.r - self.p.dist(other.p)) / 2
        let pushVec = self.p.dir(other.p).mulS(pushDist)
        Vector2.sub(self.p, pushVec)
        Vector2.add(other.p, pushVec)
      }
    }

    // resolve wall
    let wallPos = self.p.dup()
    let wallNormal = Vector2.zero
    if (self.p.x + self.r >= canvas.width) {
      wallNormal.x = -1
      wallPos.x = canvas.width
    } else if (self.p.x - self.r <= 0) {
      wallNormal.x = 1
      wallPos.x = 0
    }
    if (self.p.y + self.r >= canvas.height) {
      wallNormal.y = -1
      wallPos.y = canvas.height
    } else if (self.p.y - self.r <= 0) {
      wallNormal.y = 1
      wallPos.y = 0
    }
    if (!wallNormal.isZero()) {
      // force ball to be inside of the canvas area
      self.p = wallPos.add(wallNormal.mulS(self.r))
    }
  }

  static #calcPropagateVelocity(self, other) {
    // calculate how much velocity `self` is going to give to `other`
    if (self.v.isZero())
      return Vector2.zero

    let hitDir = self.p.dir(other.p)
    let hitForce = self.v.magnitude * self.v.normalize().dot(hitDir)
    return hitDir.mulS(hitForce)
  }

  static response(self) {
    // wall response
    let wallNormal = Vector2.zero
    if (self.p.x + self.r >= canvas.width)
      wallNormal.x = -1
    else if (self.p.x - self.r <= 0)
      wallNormal.x = 1
    if (self.p.y + self.r >= canvas.height)
      wallNormal.y = -1
    else if (self.p.y - self.r <= 0)
      wallNormal.y = 1
    if (!wallNormal.isZero()) {
      Vector2.normalize(wallNormal)
      self.nv = self.v.reflect(wallNormal)
    }

    // other ball response
    for (let other of circles) {
      if (other == self || self.nv) continue
      // TODO: response multiple collision
      if (isCircleOverlap(self, other)) {
        let selfToOther = this.#calcPropagateVelocity(self, other);
        let otherToSelf = this.#calcPropagateVelocity(other, self);
        // 주는 힘을 빼고 받는 힘을 더한다
        other.nv = other.v.sub(otherToSelf).add(selfToOther)
        self.nv = self.v.sub(selfToOther).add(otherToSelf)
      }
    }
  }
}

let deltaTime = 0 // seconds
let startTime = 0

function loop() {
  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

  // clear screen
  clearScreen()

  // resolve
  for (let c of circles)
    Collision.resolve(c)

  // response
  for (let c of circles)
    Collision.response(c)

  // apply new vector (response vector)
  for (let c of circles) {
    if (c.nv) {
      c.v = c.nv
      c.nv = null
    }
  }

  // move
  for (let c of circles) {
    c.move(deltaTime)
  }

  // draw
  for (let c of circles) {
    c.draw()
  }
}

// loop
; (function LOOP() {
  loop()
  requestAnimationFrame(LOOP)
})()

// window.addEventListener('keydown', (input) => {
//   if (input.key == ' ') {
//     loop()
//   }
// })
