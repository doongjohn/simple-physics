// TODO:
// - [x] discrete collision detection
// - [x] collision response
// - [ ] verlet point and stick
//   - [ ] distance constraints
//   - [ ] angle constraints
// - [ ] line vs circle collision
// - [ ] line vs verlet point collision
// - [ ] continuous collision detection

let deltaTime = 0 // seconds
let startTime = 0
let substep = 2

let gravity = 0 // 0 ~
let damping = 0 // 0 ~ 1
let drag = 0    // 0 ~ 1

let circles = []

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
      this.p.mulS(2 - drag).sub(this.pp.mulS(1 - drag))
        .add(this.a.mulS(dt ** 2))

    // update previous position
    this.pp = this.p

    // update current position
    this.p = nextPos

    // reset acceleration
    this.a.x = 0
    this.a.y = 0
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
      Vector2.add(circles[0].a, circles[0].p.dir(mousePos).mulS(50000))
    }
  }
})
