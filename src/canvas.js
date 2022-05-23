const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.background = '#ffffff'

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  center.x = canvas.width / 2
  center.y = canvas.height / 2
})

const gl = canvas.getContext('2d')

function clearScreen() {
  gl.clearRect(0, 0, canvas.width, canvas.height)
}

function drawCircle(x, y, r, color = '') {
  color && (gl.fillStyle = color)
  gl.beginPath()
  gl.arc(x, y, r, 0, Math.TAU)
  gl.fill()
}

function drawCircleStroke(x, y, r, lw, color = '') {
  color && (gl.strokeStyle = color)
  gl.lineWidth = lw
  gl.beginPath()
  gl.arc(x, y, r, 0, Math.PI * 180)
  gl.stroke()
}

function drawRect(x, y, w, h, color = '') {
  color && (gl.fillStyle = color)
  gl.fillRect(x - w / 2, y - h / 2, w, h)
}

function drawLine(p1, p2, color = '') {
  color && (gl.strokeStyle = color)
  gl.beginPath()
  gl.moveTo(p1.x, p1.y)
  gl.lineTo(p2.x, p2.y)
  gl.stroke()
}

function drawVec(pos, vec, color = '') {
  drawLine(pos, pos.add(vec), color)
}
