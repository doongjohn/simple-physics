// TODO:
// - [x] discrete collision detection
// - [x] collision response
// - [x] verlet point and stick
//   - [x] distance constraints
//   - [ ] angle constraints
// - [ ] continuous collision detection

let deltaTime = 0 // seconds
let startTime = 0
let substep = 2

let gravity = 0 // 0 ~
let damping = 0 // 0 ~ 1
let drag = 0    // 0 ~ 1

let points = []
let sticks = []
let sticksHidden = []
let circles = []

function verletMove(self, dt) {
  // verlet integration
  // https://en.wikipedia.org/wiki/Verlet_integration
  // --------------------------------------
  // let p  : point(x, y)  = current pos
  // let pp : point(x, y)  = previous pos
  // let a  : vector(x, y) = acceleration
  // --------------------------------------
  // next position = 2p - pp + a * dt^2
  // --------------------------------------
  let nextPos =
    self.p.mulS(2 - drag).sub(self.pp.mulS(1 - drag))
    .add(self.a.mulS(dt ** 2))

  // update previous position
  self.pp = self.p

  // update current position
  self.p = nextPos

  // reset acceleration
  self.a.x = 0
  self.a.y = 0
}

// TODO: propagate collision response to all connected points
// TODO: point vs circle collision
// TODO: point vs stick collision
class Point {
  constructor(x, y, color = '') {
    // position
    this.p = new Vector2(x, y)

    // previous position
    this.pp = new Vector2(x, y)

    // acceleration
    this.a = Vector2.zero

    // draw color
    this.color = color ? color : '#ff9988'
  }

  move(dt) {
    verletMove(this, dt)
  }

  draw() {
    let radius = 3
    drawCircle(this.p.x, this.p.y, radius, this.color)
  }

  collisionBorder() {
    // border x-axis
    if (this.p.x > canvas.width) {
      this.p.x = canvas.width
    } else if (this.p.x < 0) {
      this.p.x = 0
    }

    // border y-axis
    if (this.p.y > canvas.height) {
      this.p.y = canvas.height
    } else if (this.p.y < 0) {
      this.p.y = 0
    }
  }

  collisionBorderBounce() {
    let v = this.p.sub(this.pp).mulS(1 - damping)

    // border x-axis
    if (this.p.x > canvas.width) {
      this.p.x = canvas.width
      this.pp.x = this.p.x + v.x
    } else if (this.p.x < 0) {
      this.p.x = 0
      this.pp.x = this.p.x + v.x
    }

    // border y-axis
    if (this.p.y > canvas.height) {
      this.p.y = canvas.height
      this.pp.y = this.p.y + v.y
    } else if (this.p.y < 0) {
      this.p.y = 0
      this.pp.y = this.p.y + v.y
    }
  }
}

class Stick {
  constructor(p1, p2, color = '') {
    // two points
    this.p1 = p1;
    this.p2 = p2;

    // initalize length
    this.length = this.p1.p.dist(this.p2.p)

    // draw color
    this.color = color ? color : '#ff9988'
  }

  constrainDistance() {
    // reference: https://www.youtube.com/watch?v=pBMivz4rIJY
    let dx = this.p2.p.x - this.p1.p.x
    let dy = this.p2.p.y - this.p1.p.y
    let dist = this.p1.p.dist(this.p2.p)
    let diff = this.length - dist
    let percent = diff / dist / 2

    let offsetX = dx * percent
    let offsetY = dy * percent
    this.p1.p.x -= offsetX
    this.p1.p.y -= offsetY
    this.p2.p.x += offsetX
    this.p2.p.y += offsetY
  }

  draw() {
    drawLine(this.p1.p, this.p2.p, this.color)
  }
}

// TODO: circle vs stick collision
class Circle {
  constructor(x, y, r, color = '') {
    // position
    this.p = new Vector2(x, y)

    // previous position
    this.pp = new Vector2(x, y)

    // acceleration
    this.a = Vector2.zero

    // radius
    this.r = r

    // draw color
    this.color = color ? color : '#88e0ff'
  }

  move(dt) {
    verletMove(this, dt)
  }

  collisionBorder() {
    // border x-axis
    if (this.p.x + this.r >= canvas.width) {
      this.p.x = canvas.width - this.r
    } else if (this.p.x - this.r <= 0) {
      this.p.x = this.r
    }

    // border y-axis
    if (this.p.y + this.r >= canvas.height) {
      this.p.y = canvas.height - this.r
    } else if (this.p.y - this.r <= 0) {
      this.p.y = this.r
    }
  }

  collisionBorderBounce() {
    let v = this.p.sub(this.pp).mulS(1 - damping)

    // border x-axis
    if (this.p.x + this.r >= canvas.width) {
      this.p.x = canvas.width - this.r
      this.pp.x = this.p.x + v.x
    } else if (this.p.x - this.r <= 0) {
      this.p.x = this.r
      this.pp.x = this.p.x + v.x
    }

    // border y-axis
    if (this.p.y + this.r >= canvas.height) {
      this.p.y = canvas.height - this.r
      this.pp.y = this.p.y + v.y
    } else if (this.p.y - this.r <= 0) {
      this.p.y = this.r
      this.pp.y = this.p.y + v.y
    }
  }

  collisionCircle(other, preserveImpulse = false) {
    if (this == other)
      return

    // other to self vector
    let o2s = this.p.sub(other.p)

    // overlap distance
    let overlap = (this.r + other.r - o2s.magnitude)

    if (overlap > 0) {
      // resolve overlap
      let pushDir = o2s.normalize()
      let pushVec = pushDir.mulS(overlap / 2)
      Vector2.add(this.p, pushVec)
      Vector2.add(this.pp, pushVec)
      Vector2.sub(other.p, pushVec)
      Vector2.sub(other.pp, pushVec)

      if (preserveImpulse) {
        // velocity (self)
        let vs = this.p.sub(this.pp).mulS(1 - damping)

        // velocity (other)
        let vo = other.p.sub(other.pp).mulS(1 - damping)

        // calculate separating velocity
        let relVel = vs.sub(vo)
        let sepVel = pushDir.mulS(-relVel.dot(pushDir))

        // apply separating velocity
        this.pp = this.p.sub(vs.add(sepVel))
        other.pp = other.p.sub(vo.sub(sepVel))
      }
    }
  }

  draw() {
    let lineWidth = 6
    drawCircleStroke(this.p.x, this.p.y, this.r - lineWidth / 2, lineWidth, this.color)
  }
}

// - click to move the first ball towards the mouse
// - shift click to teleport the first ball to the mouse position (resets velocity)
window.addEventListener('mousedown', event => {
  if (event.button == 0) {
    let mousePos = new Vector2(event.x, event.y)
    if (event.shiftKey) {
      // teleport to the mouse
      circles[0].p = mousePos.dup()
      circles[0].pp = mousePos.dup()
      circles[0].a = Vector2.zero
    } else {
      // move towards the mouse
      circles[0].pp = circles[0].p.dup()
      Vector2.add(circles[0].a, circles[0].p.dir(mousePos).mulS(100000))
    }
  }
})
