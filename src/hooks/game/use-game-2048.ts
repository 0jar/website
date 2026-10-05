// 2048 game hook
import { useState, useEffect, useCallback } from 'preact/hooks'

// Types
export type GameBoard = number[][]
export type GameState = {
  board: GameBoard
  score: number
}
export type MoveResult = {
  newBoard: GameBoard
  score: number
}

export const createEmptyBoard = (): GameBoard =>
  Array(4)
    .fill(0)
    .map(() => Array(4).fill(0))

export const addRandomTile = (board: GameBoard): GameBoard => {
  const newBoard = board.map((row) => [...row])
  const emptyCells = []

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (newBoard[i][j] === 0) {
        emptyCells.push({ i, j })
      }
    }
  }

  if (emptyCells.length > 0) {
    const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    newBoard[i][j] = Math.random() < 0.9 ? 2 : 4
  }

  return newBoard
}

export const areEqual = (board1: GameBoard, board2: GameBoard): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board1[i][j] !== board2[i][j]) {
        return false
      }
    }
  }
  return true
}

export const hasValidMoves = (board: GameBoard): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return true
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const value = board[i][j]
      if (j < 3 && board[i][j + 1] === value) return true
      if (i < 3 && board[i + 1][j] === value) return true
    }
  }

  return false
}

export const hasWon = (board: GameBoard): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 2048) return true
    }
  }
  return false
}

function processLine(line: number[]): { result: number[]; score: number } {
  let filtered = line.filter((v) => v !== 0)
  let score = 0
  const merged = new Set<number>()

  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1] && !merged.has(i)) {
      filtered[i] *= 2
      score += filtered[i]
      filtered[i + 1] = 0
      merged.add(i)
    }
  }

  filtered = filtered.filter((v) => v !== 0)
  while (filtered.length < 4) filtered.push(0)
  return { result: filtered, score }
}

function getLine(board: GameBoard, index: number, vertical: boolean): number[] {
  return vertical ? [0, 1, 2, 3].map((i) => board[i][index]) : [...board[index]]
}

function setLine(board: GameBoard, index: number, vertical: boolean, line: number[]) {
  if (vertical) { for (let i = 0; i < 4; i++) board[i][index] = line[i] }
  else { board[index] = line }
}

// vertical=false for left/right, vertical=true for up/down, reverse=true for right/down
function move(board: GameBoard, vertical: boolean, reverse: boolean): MoveResult {
  const newBoard = board.map((row) => [...row])
  let score = 0

  for (let i = 0; i < 4; i++) {
    let line = getLine(newBoard, i, vertical)
    if (reverse) line.reverse()
    const { result, score: lineScore } = processLine(line)
    if (reverse) result.reverse()
    score += lineScore
    setLine(newBoard, i, vertical, result)
  }

  return { newBoard, score }
}

export const moveLeft = (board: GameBoard): MoveResult => move(board, false, false)
export const moveRight = (board: GameBoard): MoveResult => move(board, false, true)
export const moveUp = (board: GameBoard): MoveResult => move(board, true, false)
export const moveDown = (board: GameBoard): MoveResult => move(board, true, true)

export const getTileColor = (value: number, isDark: boolean): string => {
  const colors: Record<number, string> = {
    0: 'bg-transparent',
    2: isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800',
    4: isDark ? 'bg-blue-800 text-blue-100' : 'bg-blue-200 text-blue-800',
    8: isDark ? 'bg-cyan-700 text-cyan-100' : 'bg-cyan-300 text-cyan-900',
    16: isDark ? 'bg-teal-700 text-teal-100' : 'bg-teal-300 text-teal-900',
    32: isDark ? 'bg-green-700 text-green-100' : 'bg-green-300 text-green-900',
    64: isDark ? 'bg-lime-700 text-lime-100' : 'bg-lime-300 text-lime-900',
    128: isDark ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-300 text-yellow-900',
    256: isDark ? 'bg-amber-700 text-amber-100' : 'bg-amber-300 text-amber-900',
    512: isDark ? 'bg-orange-700 text-orange-100' : 'bg-orange-300 text-orange-900',
    1024: isDark ? 'bg-red-700 text-red-100' : 'bg-red-300 text-red-900',
    2048: isDark ? 'bg-purple-700 text-purple-100' : 'bg-purple-300 text-purple-900',
    4096: isDark ? 'bg-fuchsia-700 text-fuchsia-100' : 'bg-fuchsia-300 text-fuchsia-900',
    8192: isDark ? 'bg-pink-700 text-pink-100' : 'bg-pink-300 text-pink-900',
    16384: isDark ? 'bg-rose-700 text-rose-100' : 'bg-rose-300 text-rose-900',
    32768: isDark ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-300 text-indigo-900',
    65536: isDark ? 'bg-violet-700 text-violet-100' : 'bg-violet-300 text-violet-900',
  }
  return colors[value] || (isDark
    ? 'bg-gradient-to-br from-purple-700 to-pink-700 text-white'
    : 'bg-gradient-to-br from-purple-300 to-pink-300 text-purple-900')
}

export const getFontSize = (value: number): string => {
  if (value === 0) return 'text-2xl'
  const digits = Math.floor(Math.log10(value)) + 1
  if (digits <= 1) return 'text-2xl'
  if (digits === 2) return 'text-xl'
  if (digits === 3) return 'text-lg'
  if (digits === 4) return 'text-base'
  return 'text-sm'
}

export function useGame2048() {
  const [board, setBoard] = useState<GameBoard>(() => addRandomTile(createEmptyBoard()))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [hasWonBefore, setHasWonBefore] = useState(false)
  const [history, setHistory] = useState<GameState[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem('2048-best-score')
    return saved ? parseInt(saved) : 0
  })

  useEffect(() => {
    const currentHasWon = hasWon(board)
    const currentHasValidMoves = hasValidMoves(board)

    if (currentHasWon && !hasWonBefore) {
      queueMicrotask(() => {
        setGameWon(true)
        setHasWonBefore(true)
      })
    }

    if (!currentHasValidMoves) {
      queueMicrotask(() => {
        setGameOver(true)
      })
    }
  }, [board, hasWonBefore])

  useEffect(() => {
    if (score > bestScore) {
      queueMicrotask(() => {
        setBestScore(score)
        localStorage.setItem('2048-best-score', score.toString())
      })
    }
  }, [score, bestScore])

  const saveToHistory = useCallback((currentBoard: GameBoard, currentScore: number) => {
    setHistory((prev) => {
      const newHistory = [...prev, { board: currentBoard, score: currentScore }]
      if (newHistory.length > 20) {
        return newHistory.slice(-20)
      }
      return newHistory
    })
  }, [])

  const undoMove = useCallback(() => {
    if (history.length === 0 || isAnimating) return

    const previousState = history[history.length - 1]
    setBoard(previousState.board)
    setScore(previousState.score)
    setHistory((prev) => prev.slice(0, -1))

    if (gameOver) setGameOver(false)
  }, [history, isAnimating, gameOver])

  const processMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver || isAnimating) return

    let result: MoveResult | undefined

    switch (direction) {
      case 'left':
        result = moveLeft(board)
        break
      case 'right':
        result = moveRight(board)
        break
      case 'up':
        result = moveUp(board)
        break
      case 'down':
        result = moveDown(board)
        break
    }

    if (result && !areEqual(board, result.newBoard)) {
      saveToHistory(board, score)

      setIsAnimating(true)

      setScore((prevScore) => prevScore + result.score)

      setTimeout(() => {
        setBoard(addRandomTile(result.newBoard))
        setIsAnimating(false)
      }, 150)
    }
  }, [gameOver, isAnimating, board, score, saveToHistory])

  const resetGame = useCallback(() => {
    setBoard(addRandomTile(createEmptyBoard()))
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setHasWonBefore(false)
    setHistory([])
  }, [])

  const continueGame = useCallback(() => {
    setGameWon(false)
  }, [])

  return {
    board,
    score,
    bestScore,
    gameOver,
    gameWon,
    history,
    isAnimating,
    undoMove,
    processMove,
    resetGame,
    continueGame,
  }
}
