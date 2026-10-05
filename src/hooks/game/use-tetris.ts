// Tetris game hook
import { useState, useEffect, useCallback, useRef, useMemo } from 'preact/hooks'

// Constants

export const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
} as const

export type TetrominoType = keyof typeof TETROMINOS
type Board = (string | null)[][]
type Piece = { type: TetrominoType; shape: number[][]; x: number; y: number }

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

const INITIAL_SPEED = 800
const SPEED_INCREMENT = 50
const MIN_SPEED = 100
const WALL_KICKS = [-1, 1, -2, 2]
const LINE_POINTS = [0, 100, 300, 500, 800]
const PIECE_TYPES = Object.keys(TETROMINOS) as TetrominoType[]

export const musicPlaylist = Array.from({ length: 5 }, (_, i) => ({
  url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
  title: `SoundHelix Song ${i + 1}`,
}))

// Utilities

const emptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))

const randomPiece = (): TetrominoType =>
  PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]

const copyShape = (t: TetrominoType): number[][] =>
  TETROMINOS[t].shape.map((r) => [...r])

const inBounds = (x: number, y: number) =>
  x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT

/** Iterate filled cells in a shape. */
const eachCell = (shape: number[][], fn: (r: number, c: number) => void) => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) fn(r, c)
}

const rotateMatrix = (m: number[][]): number[][] =>
  Array.from({ length: m[0].length }, (_, i) =>
    Array.from({ length: m.length }, (_, j) => m[m.length - 1 - j][i])
  )

const isColliding = (shape: number[][], x: number, y: number, board: Board): boolean => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) {
        const nx = x + c, ny = y + r
        if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT || (ny >= 0 && board[ny][nx]))
          return true
      }
  return false
}

/** Builds display board: locked cells + ghost piece + active piece. */
const buildDisplayBoard = (board: Board, piece: Piece | null): Board => {
  if (!piece) return board
  const d = [...board]

  const { type, shape, x, y } = piece
  const color = TETROMINOS[type].color

  const touchRow = (rowIndex: number) => {
    if (d[rowIndex] === board[rowIndex]) d[rowIndex] = [...board[rowIndex]]
  }

  // Ghost piece
  let ghostY = y
  while (!isColliding(shape, x, ghostY + 1, board)) ghostY++
  if (ghostY !== y)
    eachCell(shape, (r, c) => {
      const by = ghostY + r, bx = x + c
      if (inBounds(bx, by) && !board[by][bx]) {
        touchRow(by)
        d[by][bx] = 'ghost'
      }
    })

  // Active piece
  eachCell(shape, (r, c) => {
    const by = y + r, bx = x + c
    if (inBounds(bx, by)) {
      touchRow(by)
      d[by][bx] = color
    }
  })

  return d
}

// Hook

export function useTetris() {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<TetrominoType>(randomPiece)
  const [score, setScore] = useState(0)
  const [, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const lastMoveRef = useRef(0)
  const lastDropRef = useRef(0)

  const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * SPEED_INCREMENT)

  const displayBoard = useMemo(
    () => buildDisplayBoard(board, currentPiece),
    [board, currentPiece]
  )

  // Core: place piece, clear lines, spawn next

  const placePieceAndSpawn = useCallback(
    (pieceType: TetrominoType, shape: number[][], px: number, py: number) => {
      const nb = [...board]
      const color = TETROMINOS[pieceType].color

      eachCell(shape, (r, c) => {
        const ny = py + r, nx = px + c
        if (inBounds(nx, ny)) {
          if (nb[ny] === board[ny]) nb[ny] = [...board[ny]]
          nb[ny][nx] = color
        }
      })

      let cleared = 0
      const final = nb.filter((row) => {
        if (row.every(Boolean)) { cleared++; return false }
        return true
      })
      while (final.length < BOARD_HEIGHT)
        final.unshift(Array(BOARD_WIDTH).fill(null))

      if (cleared > 0) {
        setScore((s) => s + LINE_POINTS[cleared] * level)
        setLines((prev) => {
          const n = prev + cleared, nl = Math.floor(n / 10) + 1
          if (nl > level) setLevel(nl)
          return n
        })
      }

      setBoard(final)

      const newShape = copyShape(nextPiece)
      const startX = Math.floor((BOARD_WIDTH - newShape[0].length) / 2)

      if (isColliding(newShape, startX, 0, final)) {
        setGameOver(true)
        setCurrentPiece(null)
      } else {
        setCurrentPiece({ type: nextPiece, shape: newShape, x: startX, y: 0 })
        setNextPiece(randomPiece())
      }
    },
    [board, nextPiece, level]
  )

  // Move actions

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return
      const nx = currentPiece.x + dx, ny = currentPiece.y + dy
      if (!isColliding(currentPiece.shape, nx, ny, board))
        setCurrentPiece((p) => (p ? { ...p, x: nx, y: ny } : null))
      else if (dy > 0)
        placePieceAndSpawn(currentPiece.type, currentPiece.shape, currentPiece.x, currentPiece.y)
    },
    [currentPiece, board, gameOver, isPaused, placePieceAndSpawn]
  )

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return
    const rotated = rotateMatrix(currentPiece.shape)
    if (!isColliding(rotated, currentPiece.x, currentPiece.y, board)) {
      setCurrentPiece((p) => (p ? { ...p, shape: rotated } : null))
      return
    }
    for (const kick of WALL_KICKS)
      if (!isColliding(rotated, currentPiece.x + kick, currentPiece.y, board)) {
        setCurrentPiece((p) => (p ? { ...p, shape: rotated, x: p.x + kick } : null))
        return
      }
  }, [currentPiece, board, gameOver, isPaused])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return
    let y = currentPiece.y
    while (!isColliding(currentPiece.shape, currentPiece.x, y + 1, board)) y++
    placePieceAndSpawn(currentPiece.type, currentPiece.shape, currentPiece.x, y)
  }, [currentPiece, board, gameOver, isPaused, placePieceAndSpawn])

  // Lifecycle

  const startGame = useCallback(() => {
    setBoard(emptyBoard())
    setScore(0); setLines(0); setLevel(1)
    setGameOver(false); setIsStarted(true); setIsPaused(false)
    const type = randomPiece()
    const shape = copyShape(type)
    setCurrentPiece({ type, shape, x: Math.floor((BOARD_WIDTH - shape[0].length) / 2), y: 0 })
    setNextPiece(randomPiece())
  }, [])

  const togglePause = useCallback(() => {
    if (isStarted && !gameOver) setIsPaused((p) => !p)
  }, [isStarted, gameOver])

  // Game loop

  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return
    const id = setInterval(() => movePiece(0, 1), speed)
    return () => clearInterval(id)
  }, [isStarted, gameOver, isPaused, movePiece, speed])

  // Keyboard

  useEffect(() => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => movePiece(-1, 0), KeyA: () => movePiece(-1, 0),
      ArrowRight: () => movePiece(1, 0), KeyD: () => movePiece(1, 0),
      ArrowDown: () => movePiece(0, 1), KeyS: () => movePiece(0, 1),
      ArrowUp: () => rotatePiece(), KeyW: () => rotatePiece(),
      Space: () => hardDrop(),
      KeyP: () => togglePause(), Escape: () => togglePause(),
    }
    const onKey = (e: KeyboardEvent) => {
      if (!isStarted || gameOver) {
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); startGame() }
        return
      }
      if (actions[e.code]) { e.preventDefault(); actions[e.code]() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isStarted, gameOver, movePiece, rotatePiece, hardDrop, togglePause, startGame])

  // Touch

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const start = touchRef.current
      if (!start || !isStarted || gameOver || isPaused) return
      const { clientX, clientY } = e.touches[0]
      const dx = clientX - start.x, dy = clientY - start.y, now = Date.now()

      if (Math.abs(dx) > 30 && now - lastMoveRef.current > 100) {
        movePiece(dx > 0 ? 1 : -1, 0)
        touchRef.current = { x: clientX, y: start.y }
        lastMoveRef.current = now
      }
      if (dy > 30 && now - lastDropRef.current > 50) {
        movePiece(0, 1)
        touchRef.current = { x: start.x, y: clientY }
        lastDropRef.current = now
      }
    },
    [isStarted, gameOver, isPaused, movePiece]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchRef.current
      if (!start) return
      const { clientX, clientY } = e.changedTouches[0]
      const dx = clientX - start.x, dy = clientY - start.y
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) rotatePiece()
      if (dy > 100 && Math.abs(dx) < 50) hardDrop()
      touchRef.current = null
    },
    [rotatePiece, hardDrop]
  )

  // Music

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio()
      a.volume = 0.5
      a.crossOrigin = 'anonymous'
      a.onended = () => setCurrentTrackIndex((i) => (i + 1) % musicPlaylist.length)
      a.onerror = () => setCurrentTrackIndex((i) => (i + 1) % musicPlaylist.length)
      audioRef.current = a
    }
    return audioRef.current
  }

  useEffect(() => { ensureAudio() }, [])

  useEffect(() => {
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.src = musicPlaylist[currentTrackIndex].url
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    }
    // Only auto-play on track change, not on isMusicPlaying toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex])

  const toggleMusic = useCallback(() => {
    const a = ensureAudio()
    if (isMusicPlaying) {
      a.pause()
      setIsMusicPlaying(false)
    } else {
      a.src = musicPlaylist[currentTrackIndex].url
      a.load()
      a.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          setCurrentTrackIndex((i) => (i + 1) % musicPlaylist.length)
          setIsMusicPlaying(false)
        })
    }
  }, [isMusicPlaying, currentTrackIndex])

  return { displayBoard, nextPiece, score, level, gameOver, isPaused, isStarted, isMusicPlaying, currentTrackIndex, startGame, togglePause, toggleMusic, handleTouchStart, handleTouchMove, handleTouchEnd }
}
