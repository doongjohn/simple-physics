Math.TAU = Math.PI * 2

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function sign01(x) {
  return x >= 0 ? 1 : 0
}

function approximately(v1, v2, epsilon = 0.0001) {
  Math.abs(v1 - v2) < epsilon
}

Object.defineProperty(Vector2, 'zero', {
  get: () => new Vector2(0, 0)
});

Object.defineProperty(Vector2, 'one', {
  get: () => new Vector2(1, 1)
});

Vector2.prototype.dup = function() {
  return new Vector2(this.x, this.y)
}

Vector2.prototype.isZero = function() {
  return (this.x == 0 && this.y ==0)
}

Vector2.prototype.eq = function(other) {
  return this.x == other.x && this.y == other.y
}

Vector2.add = function(self, other) {
  self.x += other.x
  self.y += other.y
  return self
}

Vector2.prototype.add = function(other) {
  let res = this.dup()
  Vector2.add(res, other)
  return res
}

Vector2.sub = function(self, other) {
  self.x -= other.x
  self.y -= other.y
  return self
}

Vector2.prototype.sub = function(other) {
  let res = this.dup()
  Vector2.sub(res, other)
  return res
}

Vector2.mul = function(self, other) {
  self.x *= other.x
  self.y *= other.y
  return self
}

Vector2.prototype.mul = function(other) {
  return new Vector2(this.x * other.x, this.y * other.y)
}

Vector2.div = function(self, other) {
  self.x /= other.x
  self.y /= other.y
  return self
}

Vector2.mulS = function(self, scalar) {
  self.x *= scalar
  self.y *= scalar
  return self
}

Vector2.prototype.mulS = function(scalar) {
  return new Vector2(this.x * scalar, this.y * scalar)
}

Vector2.avg = function(out, ...vecs) {
  out.x = 0
  out.y = 0
  for (let v in vecs) {
    out.x += v.x
    out.y += v.y
  }
  out.x /= vecs.length
  out.y /= vecs.length
}

Vector2.rotate = function(vec, rad) {
  let x = vec.x * Math.cos(rad) - vec.y * Math.sin(rad)
  vec.y = vec.x * Math.sin(rad) + vec.y * Math.cos(rad)
  vec.x = x
  return vec
}

Vector2.prototype.rotate = function(rad) {
  return Vector2.rotate(this.dup(), rad)
}

Vector2.prototype.distSqr = function(other) {
  return (this.x - other.x) ** 2 + (this.y - other.y) ** 2
}

Vector2.prototype.dist = function(other) {
  return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
}

Vector2.prototype.magSqr = function() {
  return this.x ** 2 + this.y ** 2
}

Vector2.normalize = function(vec) {
  if (vec.x == 0 && vec.y == 0)
    return vec
  let mag = vec.magnitude
  vec.x = vec.x / mag
  vec.y = vec.y / mag
  return vec
}

Vector2.prototype.normalize = function() {
  let vec = this.dup()
  if (vec.x == 0 && vec.y == 0)
    return vec
  let mag = vec.magnitude
  vec.x = vec.x / mag
  vec.y = vec.y / mag
  return vec
}

Vector2.prototype.dir = function(to) {
  return to.sub(this).normalize()
}

Vector2.prototype.dot = function(other) {
  return (this.x * other.x + this.y * other.y)
}

Vector2.prototype.reflect = function(normal) {
  // r = d - 2(d·n)n
  return this.sub(normal.mulS(2 * this.dot(normal)))
}

Vector2.prototype.project = function(on) {
  on = on.normalize()
  return on.mulS(this.dot(on))
}
