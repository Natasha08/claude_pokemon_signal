import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const COLS = 32
const ROWS = 32
const CELL = 16

const PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00cc00', '#0000ff',
  '#ffff00', '#ff8800', '#ff00ff', '#00ffff', '#884400',
  '#ff9999', '#99ff99', '#9999ff', '#ffcc99', '#cc99ff',
  '#666666', '#999999', '#cccccc', '#003366', '#660033',
]

function makeGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill('#ffffff'))
}

function floodFill(grid, row, col, targetColor, fillColor) {
  if (targetColor === fillColor) return grid
  const next = grid.map(r => [...r])
  const stack = [[row, col]]
  while (stack.length) {
    const [r, c] = stack.pop()
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue
    if (next[r][c] !== targetColor) continue
    next[r][c] = fillColor
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1])
  }
  return next
}

export default function PixelArt() {
  const navigate = useNavigate()
  const [grid, setGrid] = useState(makeGrid)
  const [history, setHistory] = useState([makeGrid()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState('pencil') // pencil | eraser | fill
  const painting = useRef(false)

  function pushHistory(newGrid) {
    const next = history.slice(0, historyIndex + 1)
    next.push(newGrid)
    setHistory(next)
    setHistoryIndex(next.length - 1)
    setGrid(newGrid)
  }

  function undo() {
    if (historyIndex === 0) return
    const idx = historyIndex - 1
    setHistoryIndex(idx)
    setGrid(history[idx])
  }

  function redo() {
    if (historyIndex >= history.length - 1) return
    const idx = historyIndex + 1
    setHistoryIndex(idx)
    setGrid(history[idx])
  }

  const paint = useCallback((row, col) => {
    if (tool === 'fill') return
    const paintColor = tool === 'eraser' ? '#ffffff' : color
    setGrid(prev => {
      if (prev[row][col] === paintColor) return prev
      const next = prev.map(r => [...r])
      next[row][col] = paintColor
      return next
    })
  }, [tool, color])

  function handleMouseDown(row, col) {
    painting.current = true
    if (tool === 'fill') {
      pushHistory(floodFill(grid, row, col, grid[row][col], color))
    } else {
      paint(row, col)
    }
  }

  function handleMouseEnter(row, col) {
    if (!painting.current) return
    paint(row, col)
  }

  function handleMouseUp() {
    if (!painting.current) return
    painting.current = false
    if (tool !== 'fill') pushHistory(grid)
  }

  function handleExport() {
    const canvas = document.createElement('canvas')
    canvas.width = COLS
    canvas.height = ROWS
    const ctx = canvas.getContext('2d')
    grid.forEach((row, r) => row.forEach((cell, c) => {
      ctx.fillStyle = cell
      ctx.fillRect(c, r, 1, 1)
    }))
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'pixel-art.png'
    a.click()
  }

  const tools = [
    { id: 'pencil', label: '✏️ Pencil' },
    { id: 'eraser', label: '🧹 Eraser' },
    { id: 'fill',   label: '🪣 Fill' },
  ]

  const btnStyle = (active) => ({
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '0.4rem 0.75rem',
    border: active ? '1px solid #cc0000' : '1px solid rgba(0,229,255,0.25)',
    background: active ? 'rgba(204,0,0,0.12)' : 'transparent',
    color: active ? '#cc0000' : 'rgba(0,229,255,0.6)',
    textShadow: active ? '0 0 6px #cc0000' : 'none',
    boxShadow: active ? '0 0 8px rgba(204,0,0,0.3)' : 'none',
    cursor: 'pointer',
  })

  return (
    <div
      style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', userSelect: 'none' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="scanlines" />
      <div className="grain" />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 512 + 32 }}>
        <button className="btn-horror-ghost" style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', width: 'fit-content' }} onClick={() => navigate('/')}>← Home</button>
        <h1 className="retro-mono text-glow-red" style={{ fontSize: '0.75rem', letterSpacing: '0.4em', textTransform: 'uppercase', margin: 0 }}>Pixel Art</h1>
        <button className="btn-horror-ghost" style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', width: 'fit-content' }} onClick={handleExport}>Export PNG</button>
      </div>

      {/* Canvas */}
      <div
        style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, border: '1px solid rgba(204,0,0,0.3)', boxShadow: '0 0 12px rgba(204,0,0,0.1)', cursor: 'crosshair' }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{ width: CELL, height: CELL, backgroundColor: cell, boxSizing: 'border-box', border: '0.5px solid rgba(100,100,100,0.15)' }}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
            />
          ))
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 512 + 32 }}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {tools.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} style={btnStyle(tool === t.id)}>
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            {[['Undo', undo, historyIndex === 0], ['Redo', redo, historyIndex >= history.length - 1], ['Clear', () => pushHistory(makeGrid()), false]].map(([label, fn, disabled]) => (
              <button key={label} onClick={fn} disabled={disabled} style={{ ...btnStyle(false), opacity: disabled ? 0.3 : 1 }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Palette + custom color */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pencil') }}
              style={{
                width: 26, height: 26,
                backgroundColor: c,
                border: color === c && tool === 'pencil' ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 2,
                cursor: 'pointer',
                transform: color === c && tool === 'pencil' ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            />
          ))}
          <label style={{ marginLeft: '0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
            <input
              type="color"
              value={color}
              onChange={e => { setColor(e.target.value); setTool('pencil') }}
              style={{ width: 26, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
            />
            <span className="retro-mono" style={{ fontSize: '0.5rem', color: 'rgba(232,232,224,0.3)', letterSpacing: '0.1em' }}>custom</span>
          </label>
        </div>
      </div>
    </div>
  )
}
