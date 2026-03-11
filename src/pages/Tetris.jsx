import { useEffect, useReducer, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const COLS = 10
const ROWS = 20

const PIECES = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-400' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-400' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-400' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-400' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-400' },
]

const LINE_SCORES = [0, 100, 300, 500, 800]

function randomPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)]
  return {
    shape: p.shape,
    color: p.color,
    x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
  }
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function rotate(shape) {
  const rows = shape.length
  const cols = shape[0].length
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  )
}

function isValid(board, piece, dx = 0, dy = 0, shape = null) {
  const s = shape || piece.shape
  const nx = piece.x + dx
  const ny = piece.y + dy
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue
      const x = nx + c
      const y = ny + r
      if (x < 0 || x >= COLS || y >= ROWS) return false
      if (y >= 0 && board[y][x]) return false
    }
  }
  return true
}

function placePiece(board, piece) {
  const b = board.map((row) => [...row])
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue
      const x = piece.x + c
      const y = piece.y + r
      if (y >= 0) b[y][x] = piece.color
    }
  }
  return b
}

function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => !cell))
  const cleared = ROWS - remaining.length
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null))
  return { board: [...empty, ...remaining], cleared }
}

function dropInterval(level) {
  return Math.max(80, 800 - (level - 1) * 70)
}

function init() {
  return {
    board: emptyBoard(),
    current: randomPiece(),
    next: randomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
  }
}

function reducer(state, action) {
  if (state.gameOver && action.type !== 'RESET') return state

  switch (action.type) {
    case 'MOVE': {
      if (!isValid(state.board, state.current, action.dx, action.dy)) return state
      return {
        ...state,
        current: { ...state.current, x: state.current.x + action.dx, y: state.current.y + action.dy },
      }
    }
    case 'ROTATE': {
      const rotated = rotate(state.current.shape)
      if (!isValid(state.board, state.current, 0, 0, rotated)) return state
      return { ...state, current: { ...state.current, shape: rotated } }
    }
    case 'DROP':
    case 'HARD_DROP': {
      let piece = state.current
      if (action.type === 'HARD_DROP') {
        while (isValid(state.board, piece, 0, 1)) piece = { ...piece, y: piece.y + 1 }
      } else {
        if (isValid(state.board, piece, 0, 1)) {
          return { ...state, current: { ...piece, y: piece.y + 1 } }
        }
      }
      const placed = placePiece(state.board, piece)
      const { board, cleared } = clearLines(placed)
      const score = state.score + LINE_SCORES[cleared] * state.level
      const lines = state.lines + cleared
      const level = Math.floor(lines / 10) + 1
      const current = state.next
      if (!isValid(board, current)) return { ...state, board: placed, gameOver: true }
      return { ...state, board, current, next: randomPiece(), score, lines, level }
    }
    case 'RESET':
      return init()
    default:
      return state
  }
}

export default function Tetris() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, null, init)

  useEffect(() => {
    if (state.gameOver) return
    const id = setInterval(() => dispatch({ type: 'DROP' }), dropInterval(state.level))
    return () => clearInterval(id)
  }, [state.gameOver, state.level])

  useEffect(() => {
    function onKey(e) {
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); dispatch({ type: 'MOVE', dx: -1, dy: 0 }); break
        case 'ArrowRight': e.preventDefault(); dispatch({ type: 'MOVE', dx: 1, dy: 0 }); break
        case 'ArrowDown':  e.preventDefault(); dispatch({ type: 'DROP' }); break
        case 'ArrowUp':    e.preventDefault(); dispatch({ type: 'ROTATE' }); break
        case ' ':          e.preventDefault(); dispatch({ type: 'HARD_DROP' }); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Merge current piece into display board
  const display = state.board.map((row) => [...row])
  if (!state.gameOver) {
    for (let r = 0; r < state.current.shape.length; r++) {
      for (let c = 0; c < state.current.shape[r].length; c++) {
        if (!state.current.shape[r][c]) continue
        const x = state.current.x + c
        const y = state.current.y + r
        if (y >= 0) display[y][x] = state.current.color
      }
    }
  }

  // Ghost piece
  let ghost = state.current
  if (!state.gameOver) {
    while (isValid(state.board, ghost, 0, 1)) ghost = { ...ghost, y: ghost.y + 1 }
  }

  // Next piece preview (4x4 grid)
  const nextGrid = Array.from({ length: 4 }, () => Array(4).fill(null))
  const ns = state.next.shape
  const ro = Math.floor((4 - ns.length) / 2)
  const co = Math.floor((4 - ns[0].length) / 2)
  ns.forEach((row, r) => row.forEach((cell, c) => {
    if (cell) nextGrid[r + ro][c + co] = state.next.color
  }))

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="flex gap-8 items-start">

        {/* Board */}
        <div className="border border-neutral-700">
          {display.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const isGhost = !cell && !state.gameOver && ghost.shape.some((gr, ri) =>
                  gr.some((gc, ci) => gc && ghost.x + ci === c && ghost.y + ri === r)
                )
                return (
                  <div
                    key={c}
                    className={`w-7 h-7 border border-neutral-800 ${
                      cell ? cell : isGhost ? 'bg-neutral-700' : 'bg-neutral-900'
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5 w-28">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Score</p>
            <p className="text-white text-2xl font-mono">{state.score}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Lines</p>
            <p className="text-white text-xl font-mono">{state.lines}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Level</p>
            <p className="text-white text-xl font-mono">{state.level}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Next</p>
            {nextGrid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div key={c} className={`w-5 h-5 ${cell || 'bg-transparent'}`} />
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {state.gameOver && (
              <p className="text-red-400 text-sm font-semibold">Game over</p>
            )}
            {state.gameOver && (
              <Button size="sm" onClick={() => dispatch({ type: 'RESET' })}>
                Play again
              </Button>
            )}
            <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white bg-transparent" onClick={() => navigate('/')}>
              Quit
            </Button>
          </div>

          <div className="text-neutral-600 text-xs space-y-1">
            <p>← → move</p>
            <p>↑ rotate</p>
            <p>↓ soft drop</p>
            <p>space hard drop</p>
          </div>
        </div>

      </div>
    </div>
  )
}
