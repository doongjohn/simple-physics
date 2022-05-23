// TODO:
// - [x] 모든 방향에서 충돌 할 수 있도록 만들기
// - [x] 충돌 했을 때 반응하기
// - [ ] 움직이는 원 2개가 서로 충돌 + 반응하기
// - [ ] 움직이는 원 n개가 서로 충돌 + 반응하기
// - [ ] 터널링이 불가능 하게 만들기(CCD)
// - [ ] 선분도 원과 똑같이 작동하게 만들기
// - [ ] 원과 선분이 서로 충돌 + 반응하기
// - [ ] 충돌시 해결시 가속도 반영하기
// - [ ] 물체 회전 구현하기
// - [ ] 충돌시 해결시 회전 반영하기
// LINKS:
// - https://www.falstad.com
// - https://tip1234.tistory.com/143
// - https://ericleong.me/research/circle-circle/
// - https://www.youtube.com/watch?v=eED4bSkYCB8

class Circle {
  constructor(x, y, r, color = '') {
    this.color = color ? color : '#88e0ff'
    this.p = new Vector2(x, y)
    this.r = r
    this.m = 1
    this.v = new Vector2(0, 0)
    this.nv = new Vector2(0, 0)
  }
  draw() {
    drawCircleStroke(this.p.x, this.p.y, this.r - 3, 6, this.color)
  }
  move(dt) {
    Vector2.add(this.p, this.v.mulS(dt))
  }
}

let circles = []

for (let y = 1; y < 12; ++y) {
  for (let x = 1; x < 17; ++x) {
    circles.push(new Circle(canvas.width - x * 82, canvas.height - y * 82, randomInt(10, 40)))
  }
}

window.addEventListener('mousedown', event => {
  if (event.button == 0) {
    if (event.shiftKey) {
      circles[0].v = Vector2.zero
      circles[0].nv = null
      circles[0].p.x = event.x
      circles[0].p.y = event.y
    } else {
      circles[0].v = circles[0].p.dir(new Vector2(event.x, event.y)).mulS(1000)
    }
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
        let pushDist = (self.r + other.r) - self.p.dist(other.p)
        let pushVec = self.p.dir(other.p).mulS(pushDist / 2)
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

  // move
  for (let c of circles)
    c.move(deltaTime)

  // resolve
  for (let c of circles)
    Collision.resolve(c)

  // response
  for (let c of circles)
    Collision.response(c)

  // apply new vector
  for (let c of circles) {
    if (c.nv) {
      c.v = c.nv
      c.nv = null
    }
  }

  // draw
  for (let c of circles) c.draw()
}

// loop
(function LOOP() {
  loop()
  requestAnimationFrame(LOOP)
})()

// window.addEventListener('keydown', (input) => {
//   if (input.key == ' ') {
//     loop()
//   }
// })
