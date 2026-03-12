import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// -- Constants --
const TILE = 32
const COLS = 155
const ROWS = 14
const CW = 512
const CH = ROWS * TILE // 448

const GRAVITY = 1800
const JUMP_VEL = -580
const RUN = 185
const MAX_FALL = 950
const ENEMY_SPEED = 55

// Tile types
const E = 0, SOLID = 1, BRICK = 2, QBLOCK = 3, QUSED = 4, COIN = 5, PIPE = 6, POLE = 7

function isSolid(t) {
  return t === SOLID || t === BRICK || t === QBLOCK || t === QUSED || t === PIPE
}

// -- Level builder --
function buildLevel() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(E))
  const fill = (r, c1, c2, t = SOLID) => { for (let c = c1; c <= c2; c++) g[r][c] = t }
  const set = (r, c, t) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS) g[r][c] = t }

  // Ground with two gaps
  fill(12, 0, 30); fill(13, 0, 30)    // gap: 31-34
  fill(12, 35, 72); fill(13, 35, 72)  // gap: 73-76
  fill(12, 77, 154); fill(13, 77, 154)

  // Question / brick platforms
  fill(8, 14, 14, BRICK); fill(8, 15, 15, QBLOCK); fill(8, 16, 16, BRICK)
  fill(8, 17, 17, QBLOCK); fill(8, 18, 18, BRICK); fill(8, 19, 19, QBLOCK)

  fill(9, 7, 10, BRICK) // early low platform

  fill(9, 37, 41, BRICK) // bridge after gap 1
  fill(8, 45, 45, QBLOCK); fill(8, 47, 47, QBLOCK); fill(8, 49, 49, QBLOCK)

  fill(8, 57, 57, QBLOCK); fill(8, 59, 59, QBLOCK)
  fill(8, 62, 67, BRICK)

  fill(9, 79, 83, BRICK) // bridge after gap 2
  fill(8, 86, 86, QBLOCK); fill(8, 88, 88, QBLOCK)
  fill(8, 90, 95, BRICK)

  fill(9, 105, 111, BRICK)
  fill(8, 115, 115, QBLOCK); fill(8, 117, 117, QBLOCK); fill(8, 119, 119, QBLOCK)

  // Staircase up then down near end
  for (let i = 0; i < 5; i++) fill(11 - i, 131 + i, 131 + i)
  for (let i = 0; i < 5; i++) fill(11 - i, 140 - i, 140 - i)

  // Pipes (2 wide, rows 10-11)
  fill(10, 24, 25, PIPE); fill(11, 24, 25, PIPE)
  fill(10, 55, 56, PIPE); fill(11, 55, 56, PIPE)
  fill(9, 100, 101, PIPE); fill(10, 100, 101, PIPE); fill(11, 100, 101, PIPE)

  // Coins
  for (let c = 3; c <= 6; c++) set(11, c, COIN)
  for (let c = 51; c <= 54; c++) set(11, c, COIN)
  for (let c = 96; c <= 99; c++) set(11, c, COIN)
  for (let c = 125; c <= 129; c++) set(11, c, COIN)

  // Flag pole
  for (let r = 3; r <= 12; r++) set(r, 150, POLE)

  return g
}

// -- Enemies --
function buildEnemies() {
  const EY = 12 * TILE - 24
  const mk = (col, dir = -1) => ({
    x: col * TILE, y: EY, vx: dir * ENEMY_SPEED, vy: 0,
    w: 24, h: 24, onGround: false, alive: true, squished: false, squishTimer: 0,
  })
  return [
    mk(10), mk(22, 1),
    mk(40), mk(52, 1), mk(66),
    mk(85, 1), mk(95), mk(115, 1),
    mk(127), mk(135, 1),
  ]
}

function initState() {
  return {
    tiles: buildLevel(),
    enemies: buildEnemies(),
    player: {
      x: 2 * TILE, y: 12 * TILE - 28,
      vx: 0, vy: 0, w: 24, h: 28,
      onGround: false, facingRight: true,
      dead: false, deadTimer: 0,
    },
    camera: { x: 0 },
    score: 0, coins: 0,
    won: false, gameOver: false,
  }
}

// -- Tile helpers --
function tileAt(tiles, col, row) {
  if (col < 0 || col >= COLS) return SOLID
  if (row < 0) return E
  if (row >= ROWS) return SOLID
  return tiles[row][col]
}

function resolveX(tiles, obj) {
  const top = Math.floor((obj.y + 2) / TILE)
  const bot = Math.floor((obj.y + obj.h - 2) / TILE)
  if (obj.vx > 0) {
    const col = Math.floor((obj.x + obj.w) / TILE)
    for (let r = top; r <= bot; r++) {
      if (isSolid(tileAt(tiles, col, r))) { obj.x = col * TILE - obj.w; obj.vx = 0; return true }
    }
  } else if (obj.vx < 0) {
    const col = Math.floor(obj.x / TILE)
    for (let r = top; r <= bot; r++) {
      if (isSolid(tileAt(tiles, col, r))) { obj.x = (col + 1) * TILE; obj.vx = 0; return true }
    }
  }
  return false
}

function resolveY(gs, obj, isPlayer = false) {
  const left = Math.floor((obj.x + 2) / TILE)
  const right = Math.floor((obj.x + obj.w - 2) / TILE)
  if (obj.vy >= 0) {
    const row = Math.floor((obj.y + obj.h) / TILE)
    for (let c = left; c <= right; c++) {
      if (isSolid(tileAt(gs.tiles, c, row))) {
        obj.y = row * TILE - obj.h; obj.vy = 0; obj.onGround = true; return
      }
    }
  } else {
    const row = Math.floor(obj.y / TILE)
    for (let c = left; c <= right; c++) {
      const t = tileAt(gs.tiles, c, row)
      if (isSolid(t)) {
        obj.y = (row + 1) * TILE; obj.vy = 0
        if (isPlayer && t === QBLOCK) {
          gs.tiles[row][c] = QUSED
          gs.score += 100; gs.coins++
        }
        return
      }
    }
  }
}

// -- Update --
function update(gs, dt, keys) {
  if (gs.gameOver || gs.won) return
  const p = gs.player

  if (p.dead) {
    p.deadTimer += dt
    p.vy += GRAVITY * dt
    p.y += p.vy * dt
    if (p.deadTimer > 2.5) gs.gameOver = true
    return
  }

  // Horizontal
  if (keys.left) { p.vx = -RUN; p.facingRight = false }
  else if (keys.right) { p.vx = RUN; p.facingRight = true }
  else p.vx *= Math.pow(0.001, dt)

  // Jump (consume press, require ground)
  if (keys.jumpPressed && p.onGround) {
    p.vy = JUMP_VEL
    p.onGround = false
    keys.jumpPressed = false
  } else if (!p.onGround) {
    keys.jumpPressed = false
  }

  // Gravity
  p.vy = Math.min(p.vy + GRAVITY * dt, MAX_FALL)
  p.onGround = false

  // Move & resolve
  p.x += p.vx * dt; resolveX(gs.tiles, p)
  p.y += p.vy * dt; resolveY(gs, p, true)
  p.x = Math.max(0, p.x)

  // Fall into pit
  if (p.y > CH + 50) { p.dead = true; p.vy = -500 }

  // Coin pickup
  const cc = Math.floor((p.x + p.w / 2) / TILE)
  const cr = Math.floor((p.y + p.h / 2) / TILE)
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      const c = cc + dc, r = cr + dr
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue
      if (tileAt(gs.tiles, c, r) !== COIN) continue
      const tx = c * TILE, ty = r * TILE
      if (p.x + p.w > tx + 4 && p.x < tx + TILE - 4 &&
          p.y + p.h > ty + 4 && p.y < ty + TILE - 4) {
        gs.tiles[r][c] = E
        gs.score += 200; gs.coins++
      }
    }
  }

  // Win: reach flag pole area
  if (p.x + p.w > 150 * TILE - 4) {
    gs.won = true; gs.score += 1000
  }

  // Enemies
  for (const en of gs.enemies) {
    if (en.squished) {
      en.squishTimer += dt
      if (en.squishTimer > 0.4) en.alive = false
      continue
    }
    if (!en.alive) continue

    en.vy = Math.min(en.vy + GRAVITY * dt, MAX_FALL)
    en.onGround = false

    const prevVx = en.vx
    en.x += en.vx * dt
    const hitWall = resolveX(gs.tiles, en)
    if (hitWall) en.vx = -Math.sign(prevVx) * ENEMY_SPEED

    en.y += en.vy * dt
    resolveY(gs, en, false)

    if (en.y > CH + 50) { en.alive = false; continue }

    // Player collision
    if (p.dead) continue
    const hit = (p.x + p.w > en.x + 2 && p.x < en.x + en.w - 2 &&
                 p.y + p.h > en.y + 2 && p.y < en.y + en.h - 2)
    if (!hit) continue

    if (p.vy > 10 && p.y + p.h < en.y + en.h * 0.6) {
      en.squished = true; en.squishTimer = 0
      p.vy = -320; gs.score += 100
    } else {
      p.dead = true; p.vy = -500
    }
  }

  // Camera
  const target = p.x - CW / 2 + p.w / 2
  gs.camera.x = Math.max(0, Math.min(target, COLS * TILE - CW))
}

// -- Rendering --
function drawTile(ctx, t, tx, ty) {
  if (t === SOLID) {
    ctx.fillStyle = '#c84c0c'; ctx.fillRect(tx, ty, TILE, TILE)
    ctx.fillStyle = '#f0c060'; ctx.fillRect(tx, ty, TILE, 4)
    ctx.fillStyle = '#a03000'; ctx.fillRect(tx, ty + TILE - 2, TILE, 2)
  } else if (t === BRICK) {
    ctx.fillStyle = '#c84c0c'; ctx.fillRect(tx, ty, TILE, TILE)
    ctx.fillStyle = '#803010'
    ctx.fillRect(tx, ty + TILE / 2 - 1, TILE, 2)
    ctx.fillRect(tx + TILE / 2 - 1, ty, 2, TILE / 2 - 1)
    ctx.fillRect(tx + TILE / 4 - 1, ty + TILE / 2 + 1, 2, TILE / 2 - 1)
    ctx.fillRect(tx + 3 * TILE / 4 - 1, ty + TILE / 2 + 1, 2, TILE / 2 - 1)
    ctx.fillStyle = '#e06030'
    ctx.fillRect(tx + 1, ty + 1, TILE / 2 - 3, TILE / 2 - 3)
    ctx.fillRect(tx + TILE / 2 + 1, ty + 1, TILE / 2 - 3, TILE / 2 - 3)
    ctx.fillRect(tx + TILE / 4 + 1, ty + TILE / 2 + 2, TILE / 2 - 3, TILE / 2 - 4)
  } else if (t === QBLOCK) {
    ctx.fillStyle = '#f0a000'; ctx.fillRect(tx, ty, TILE, TILE)
    ctx.fillStyle = '#f8d870'; ctx.fillRect(tx + 2, ty + 2, TILE - 4, 5)
    ctx.fillStyle = '#a06000'; ctx.fillRect(tx + 2, ty + TILE - 4, TILE - 4, 2)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('?', tx + TILE / 2, ty + TILE / 2 + 1)
  } else if (t === QUSED) {
    ctx.fillStyle = '#7a5910'; ctx.fillRect(tx, ty, TILE, TILE)
    ctx.fillStyle = '#5a3f08'; ctx.fillRect(tx + 3, ty + 3, TILE - 6, TILE - 6)
  } else if (t === COIN) {
    ctx.fillStyle = '#ffd700'
    ctx.beginPath(); ctx.arc(tx + TILE / 2, ty + TILE / 2, 9, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath(); ctx.arc(tx + TILE / 2 - 2, ty + TILE / 2 - 2, 4, 0, Math.PI * 2); ctx.fill()
  } else if (t === PIPE) {
    ctx.fillStyle = '#00a000'; ctx.fillRect(tx, ty, TILE, TILE)
    ctx.fillStyle = '#00c800'; ctx.fillRect(tx + 2, ty, TILE / 2 - 2, TILE)
    ctx.fillStyle = '#006400'; ctx.fillRect(tx + TILE - 3, ty, 3, TILE)
  } else if (t === POLE) {
    ctx.fillStyle = '#aaa'
    ctx.fillRect(tx + TILE / 2 - 2, ty, 4, TILE)
    // Flag at top
    if (ty < 4 * TILE) {
      ctx.fillStyle = '#00c800'
      ctx.fillRect(tx + TILE / 2 + 2, ty + 2, 14, 10)
    }
  }
}

function render(ctx, gs) {
  const cam = gs.camera.x

  // Sky gradient-ish
  ctx.fillStyle = '#5c94fc'; ctx.fillRect(0, 0, CW, CH)
  // Lighter sky at top
  ctx.fillStyle = 'rgba(200,220,255,0.15)'; ctx.fillRect(0, 0, CW, CH / 2)

  const startCol = Math.max(0, Math.floor(cam / TILE))
  const endCol = Math.min(startCol + Math.ceil(CW / TILE) + 2, COLS)

  for (let r = 0; r < ROWS; r++) {
    for (let c = startCol; c < endCol; c++) {
      const t = gs.tiles[r][c]
      if (t === E) continue
      drawTile(ctx, t, c * TILE - cam, r * TILE)
    }
  }

  // Enemies
  for (const en of gs.enemies) {
    if (!en.alive) continue
    const ex = Math.floor(en.x - cam), ey = Math.floor(en.y)
    if (en.squished) {
      ctx.fillStyle = '#c84c0c'
      ctx.fillRect(ex, ey + en.h - 8, en.w, 8)
    } else {
      // Body
      ctx.fillStyle = '#c84c0c'
      ctx.beginPath()
      ctx.ellipse(ex + 12, ey + 14, 11, 11, 0, 0, Math.PI * 2); ctx.fill()
      // Head/cap darker top
      ctx.fillStyle = '#a03000'
      ctx.fillRect(ex + 2, ey, en.w - 4, 10)
      // Feet
      ctx.fillStyle = '#502000'
      ctx.fillRect(ex, ey + en.h - 6, 8, 6)
      ctx.fillRect(ex + en.w - 8, ey + en.h - 6, 8, 6)
      // Eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(ex + 8, ey + 8, 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex + 16, ey + 8, 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(ex + 9, ey + 9, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex + 17, ey + 9, 2, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Player
  const p = gs.player
  if (!p.dead || Math.floor(p.deadTimer * 10) % 2 === 0) {
    const px = Math.floor(p.x - cam), py = Math.floor(p.y)
    const pw = p.w
    // Shoes
    ctx.fillStyle = '#502000'; ctx.fillRect(px, py + p.h - 5, pw, 5)
    // Overalls
    ctx.fillStyle = '#0060a8'; ctx.fillRect(px, py + 14, pw, p.h - 14 - 5)
    // Shirt
    ctx.fillStyle = '#e03c28'; ctx.fillRect(px + 2, py + 8, pw - 4, 8)
    // Face
    ctx.fillStyle = '#fac090'; ctx.fillRect(px + 5, py + 6, pw - 10, 8)
    // Hat
    ctx.fillStyle = '#e03c28'
    ctx.fillRect(px + 2, py, pw - 4, 8)   // hat top
    ctx.fillRect(px, py + 6, pw, 3)        // hat brim
  }

  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, CW, 34)
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(`SCORE  ${gs.score}`, 12, 17)
  ctx.textAlign = 'right'
  ctx.fillText(`COINS  ${gs.coins}`, CW - 12, 17)

  // Win / Game Over overlays
  if (gs.won || gs.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, CW, CH)
    ctx.fillStyle = gs.won ? '#ffd700' : '#fff'
    ctx.font = 'bold 38px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(gs.won ? 'YOU WIN!' : 'GAME OVER', CW / 2, CH / 2 - 24)
    ctx.fillStyle = '#fff'; ctx.font = '15px monospace'
    ctx.fillText(`Score: ${gs.score}`, CW / 2, CH / 2 + 14)
    ctx.fillStyle = '#aaa'; ctx.font = '12px monospace'
    ctx.fillText('Press R to play again', CW / 2, CH / 2 + 42)
  }
}

// -- Component --
export default function Mario() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const gsRef = useRef(null)
  const keysRef = useRef({ left: false, right: false, jumpPressed: false })
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)

  useEffect(() => {
    gsRef.current = initState()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function loop(ts) {
      const dt = Math.min((ts - (lastTsRef.current ?? ts)) / 1000, 0.05)
      lastTsRef.current = ts
      update(gsRef.current, dt, keysRef.current)
      render(ctx, gsRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const keys = keysRef.current

    function onDown(e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault()
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true
      if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'z') && !e.repeat) keys.jumpPressed = true
      if (e.key === 'r' || e.key === 'R') { gsRef.current = initState(); lastTsRef.current = null }
    }

    function onUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div className="scanlines" />
      <div className="grain" />
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{ imageRendering: 'pixelated', border: '1px solid rgba(204,0,0,0.4)', boxShadow: '0 0 16px rgba(204,0,0,0.15)', position: 'relative', zIndex: 10 }}
      />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span className="retro-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(232,232,224,0.25)' }}>← → / A D: move</span>
        <span className="retro-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(232,232,224,0.25)' }}>↑ / Space: jump</span>
        <span className="retro-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(232,232,224,0.25)' }}>R: restart</span>
        <button className="btn-horror-ghost" style={{ fontSize: '0.6rem', padding: '0.3rem 0.6rem' }} onClick={() => navigate('/')}>
          ← Home
        </button>
      </div>
    </div>
  )
}
