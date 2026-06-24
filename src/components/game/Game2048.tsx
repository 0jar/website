// 2048 - React component for Astro
// Ported from Next.js v4

import { useEffect, useCallback, useState } from 'preact/hooks'
import { t as i18nT } from '@/i18n/client'
import { useGame2048, getTileColor, getFontSize } from '@/hooks/game/use-game-2048'

const keyMap: Record<string, 'left' | 'right' | 'up' | 'down'> = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
}

export default function Game2048() {
  const t = useCallback((key: string, fallback?: string): string => {
    const fullKey = `2048.${key}`
    const translated = i18nT(fullKey)
    return translated === fullKey ? (fallback ?? fullKey) : translated
  }, [])

  const {
    board, score, bestScore, gameOver, gameWon, history,
    isAnimating, undoMove, processMove, resetGame, continueGame,
  } = useGame2048()

  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon || gameOver) return

      const dir = keyMap[e.code]
      if (dir) {
        e.preventDefault()
        processMove(dir)
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        undoMove()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameWon, gameOver, processMove, undoMove])

  const mobileDirs = [
    null, { dir: 'up', icon: '↑', label: t('moveUp', 'Move up') }, null,
    { dir: 'left', icon: '←', label: t('moveLeft', 'Move left') },
    { dir: 'down', icon: '↓', label: t('moveDown', 'Move down') },
    { dir: 'right', icon: '→', label: t('moveRight', 'Move right') }
  ] as const

  const scoreBlocks = [
    { label: t('score', 'Score'), value: score },
    { label: t('best', 'Best'), value: bestScore },
  ]

  const instructions = [
    { keys: ['←', 'A'], label: t('moveLeft', 'Move left') },
    { keys: ['→', 'D'], label: t('moveRight', 'Move right') },
    { keys: ['↑', 'W'], label: t('moveUp', 'Move up') },
    { keys: ['↓', 'S'], label: t('moveDown', 'Move down') },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title', '2048')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description', 'Join the tiles, get to 2048!')}
          </p>
        </header>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8">
          <main className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2" aria-live="polite">
              {scoreBlocks.map(({ label, value }) => (
                <div key={label} className="bg-card border rounded-lg p-3 text-center min-w-[120px]">
                  <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border rounded-lg p-4 relative" role="region" aria-label={t('title', '2048')}>
              <div className="grid grid-cols-4 gap-2 bg-muted rounded-lg p-2 w-[min(80vw,340px)]">
                {board.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}-${cell}`}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center transition-all duration-150 animate-pop
                        ${getTileColor(cell, isDark)} ${getFontSize(cell)}
                      `}
                      aria-hidden="true"
                    >
                      {cell > 0 && <span className="font-bold">{cell}</span>}
                    </div>
                  ))
                )}
              </div>

              {(gameOver || gameWon) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg animate-fade-in z-10">
                  {gameWon && <span className="text-4xl mb-2" aria-hidden="true">🏆</span>}
                  <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${gameWon ? 'text-green-500' : 'text-red-500'}`}>
                    {gameWon ? t('youWin', 'You win!') : t('gameOver', 'Game Over!')}
                  </h2>
                  <p className="text-base md:text-lg mb-4">
                    {gameWon ? t('currentScore', 'Current score') : t('finalScore', 'Final score')}: <span className="font-bold">{score}</span>
                  </p>
                  <div className="flex gap-3">
                    {gameWon && (
                      <button onClick={continueGame} className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium">
                        {t('keepPlaying', 'Keep playing')}
                      </button>
                    )}
                    <button onClick={resetGame} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">
                      {gameWon ? t('newGame', 'New game') : t('tryAgain', 'Try again')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <nav className="md:hidden flex justify-center" aria-label="Mobile controls">
              <div className="grid grid-cols-3 gap-2">
                {mobileDirs.map((item, idx) => item ? (
                  <button
                    key={item.dir}
                    type="button"
                    onClick={() => processMove(item.dir)}
                    disabled={gameOver || gameWon || isAnimating}
                    aria-label={item.label}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold"
                  >
                    <span aria-hidden="true">{item.icon}</span>
                  </button>
                ) : <div key={`empty-${idx}`} />)}
              </div>
            </nav>

            <div className="flex gap-2 w-full">
              <button
                onClick={undoMove}
                disabled={history.length === 0 || isAnimating}
                aria-label={t('undo', 'Undo')}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {t('undo', 'Undo')}
              </button>
              <button
                onClick={resetGame}
                aria-label={t('newGame', 'New game')}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('newGame', 'New game')}
              </button>
            </div>
          </main>

          <aside className="bg-card border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t('howToPlay', 'How to play')}</h2>
            <div className="space-y-3 text-muted-foreground">
              {[1, 2, 3, 4].map((num) => (
                <p key={num} className={num === 4 ? "text-sm" : ""}>
                  {t(`instructions${num}`)}
                </p>
              ))}
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">{t('controls', 'Controls')}</h3>
            <ul className="space-y-2">
              {instructions.map(({ keys, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {keys.map((k) => (
                      <kbd key={k} className="inline-flex w-8 h-8 bg-primary text-primary-foreground text-xs items-center justify-center rounded font-sans font-semibold">
                        {k}
                      </kbd>
                    ))}
                  </div>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-muted-foreground md:hidden">
              {t('touchInstructions')}
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
