// TODO:
// - [x] 움직이는 원 2개가 서로 충돌 및 반응하기
// - [x] 움직이는 원 n개가 서로 충돌 및 반응하기
// - [ ] 선분과 원이 서로 충돌 및 반응하기
// - [ ] 터널링 방지 기능 만들기 (CCD)

class Circle {
  constructor(x, y, r, color = '') {
    // position
    this.p = new Vector2(x, y)

    // radius
    this.r = r

    // velocity
    this.v = new Vector2(0, 0)

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
    // for (let y = 1; y < 3; ++y) {
    //   for (let x = 1; x < 3; ++x) {
    circles.push(new Circle(
      canvas.width - x * 83,
      canvas.height - y * 83,
      randomInt(10, 40),
      '#bbbb' + randomInt(200, 255).toString(16)
    ))
  }
}

// - click to move the first ball towards the mouse
// - shift click to teleport the first ball to the mouse position
window.addEventListener('mousedown', event => {
  if (event.button == 0) {
    let mousePos = new Vector2(event.x, event.y)
    if (event.shiftKey) {
      // teleport to the mouse
      circles[0].v = Vector2.zero
      circles[0].p = mousePos
    } else {
      // move towards the mouse
      circles[0].v = circles[0].p.dir(mousePos).mulS(1000)
    }
  }
})

function isCircleOverlap(a, b) {
  return a.p.distSqr(b.p) <= (a.r + b.r) ** 2
}

class Collision {
  static colliding = new Map()

  static createCollisionGroup(self) {
    // TODO: find better way to group collisions

    let group = []
    for (let other of circles) {
      if (self == other) continue
      if (isCircleOverlap(self, other)) {
        // resolve collision
        this.resolve(self, other)

        if (this.colliding.has(other)) {
          // add to existing group
          if (!this.colliding.get(other).includes(self))
            this.colliding.get(other).push(self)
          return
        }

        // add to group
        group.push(other)
      }
    }

    // create new collision group
    if (group.length > 0) {
      group.push(self)
      this.colliding.set(self, group)
    }
  }

  static resolve(self, other) {
    // TODO: find better way to resolve collision
    let pushDist = (self.r + other.r - self.p.dist(other.p)) / 2
    if (pushDist == 0)
      return
    let pushVec = self.p.dir(other.p).mulS(pushDist)
    Vector2.sub(self.p, pushVec)
    Vector2.add(other.p, pushVec)
  }

  static resolveWall(self) {
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
      // force `self` to be inside of the canvas area
      self.p = wallPos.add(wallNormal.mulS(self.r))
    }
  }

  static #calcPropagateVelocity(self, other) {
    // calculate how much velocity `self` is going to give to `other`
    if (self.v.isZero())
      return Vector2.zero

    // TODO: optimize this if possible
    let hitDir = self.p.dir(other.p)
    let hitForce = self.v.magnitude * self.v.normalize().dot(hitDir)
    return hitDir.mulS(hitForce)
  }

  static response(self, other) {
    if (isCircleOverlap(self, other)) {
      // 주는 힘을 빼고 받는 힘을 더한다
      let selfToOther = this.#calcPropagateVelocity(self, other);
      let otherToSelf = this.#calcPropagateVelocity(other, self);
      other.v = other.v.sub(otherToSelf).add(selfToOther)
      self.v = self.v.sub(selfToOther).add(otherToSelf)
      Vector2.mulS(other.v, 0.99)
      Vector2.mulS(self.v, 0.99)
    }
  }

  static responseWall(self) {
    let wallNormal = Vector2.zero
    if (self.p.x + self.r >= canvas.width) {
      wallNormal.x = -1
    } else if (self.p.x - self.r <= 0) {
      wallNormal.x = 1
    }
    if (self.p.y + self.r >= canvas.height) {
      wallNormal.y = -1
    } else if (self.p.y - self.r <= 0) {
      wallNormal.y = 1
    }
    if (!wallNormal.isZero()) {
      Vector2.normalize(wallNormal)
      self.v = self.v.reflect(wallNormal)
    }
  }
}

function forAllPairs(array, cb) {
  if (!array || array.length < 2) return
  for (let a = 0; a < array.length - 1; ++a)
    for (let b = a + 1; b < array.length; ++b)
      cb(array[a], array[b])
}

let deltaTime = 0 // seconds
let startTime = 0

function loop() {
  if (document.hidden) {
    startTime = performance.now()
    return
  }

  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

  for (let substep = 0; substep < 10; ++substep) {
    // check collision
    Collision.colliding.clear()
    for (let c of circles) {
      Collision.createCollisionGroup(c)
    }

    // resolve wall
    for (let c of circles) {
      Collision.resolveWall(c)
    }
  }

  // response
  for (let col of Collision.colliding.values()) {
    forAllPairs(col, (a, b) => {
      Collision.response(a, b)
    })
  }

  // response wall
  for (let c of circles) {
    Collision.responseWall(c)
  }

  // update positions
  for (let c of circles) {
    c.move(deltaTime)
  }

  // draw balls
  clearScreen()
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
//     deltaTime = 0.01
//     loop()
//   }
// })
