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

  return (
    <div
      className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-4 p-4 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button onClick={() => navigate('/')} className="text-neutral-400 hover:text-white text-sm">← Home</button>
        <h1 className="text-white font-bold text-lg">Pixel Art</h1>
        <button onClick={handleExport} className="text-neutral-400 hover:text-white text-sm">Export PNG</button>
      </div>

      {/* Canvas */}
      <div
        className="border border-neutral-600 cursor-crosshair"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{ width: CELL, height: CELL, backgroundColor: cell, boxSizing: 'border-box', border: '0.5px solid rgba(100,100,100,0.2)' }}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-2xl">
        {/* Tools */}
        <div className="flex gap-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                tool === t.id
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="px-3 py-1.5 rounded text-sm font-medium bg-neutral-700 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1.5 rounded text-sm font-medium bg-neutral-700 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30"
            >
              Redo
            </button>
            <button
              onClick={() => pushHistory(makeGrid())}
              className="px-3 py-1.5 rounded text-sm font-medium bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Palette + custom color */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pencil') }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded transition-transform ${color === c && tool === 'pencil' ? 'ring-2 ring-white scale-110' : 'hover:scale-110'}`}
            />
          ))}
          <label className="ml-1 flex flex-col items-center gap-0.5">
            <input
              type="color"
              value={color}
              onChange={e => { setColor(e.target.value); setTool('pencil') }}
              className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-neutral-500 text-xs">custom</span>
          </label>
        </div>
      </div>
    </div>
  )
}
