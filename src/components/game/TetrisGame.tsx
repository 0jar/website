// Tetris - React component

import { t as i18nT } from '@/i18n/client'
import { useTetris, TETROMINOS, musicPlaylist, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/game/use-tetris'

// Shared styles
const overlayBase = 'absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg'
const btnPrimary = 'px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors'
const keyBadge = 'inline-flex w-8 h-8 bg-primary text-primary-foreground text-xs items-center justify-center rounded'

const cellClass = (cell: string | null) =>
  cell === 'ghost'
    ? 'aspect-square bg-slate-700/50 border border-slate-500/30'
    : cell
      ? `aspect-square ${cell} shadow-inner`
      : 'aspect-square bg-slate-900/50'

const CONTROLS: readonly { keys: string[]; label: string }[] = [
  { keys: ['←', 'A'], label: 'moveLeft' },
  { keys: ['→', 'D'], label: 'moveRight' },
  { keys: ['↓', 'S'], label: 'moveDown' },
  { keys: ['↑', 'W'], label: 'rotate' },
]

const RESET_ICON = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
const MUSIC_ICON = 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'

const Icon = ({ d }: { d: string }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

const Overlay = (props: any) => (
  <div className={`${overlayBase} animate-fade-in`} {...props} />
)

export default function TetrisGame() {
  const t = (key: string) => i18nT(`tetris.${key}`)

  const {
    displayBoard, nextPiece, score, level,
    gameOver, isPaused, isStarted,
    isMusicPlaying, currentTrackIndex,
    startGame, togglePause, toggleMusic,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  } = useTetris()

  const statusColor = gameOver ? 'text-red-500' : isPaused ? 'text-amber-500' : 'text-green-500'
  const statusText = gameOver ? t('gameOver') : isPaused ? t('paused') : isStarted ? t('playing') : t('ready')
  const nextShape = TETROMINOS[nextPiece]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8">
          {/* Game board */}
          <div className="bg-card border rounded-lg shadow-lg p-4 relative">
            <div className="relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <div
                className="grid gap-px bg-slate-800"
                style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`, width: 'min(80vw, 300px)', aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}` }}
              >
                {displayBoard.map((row, y) =>
                  row.map((cell, x) => <div key={`${x}-${y}`} className={cellClass(cell)} />)
                )}
              </div>

              {!isStarted && (
                  <Overlay>
                    <button onClick={startGame} className={`${btnPrimary} text-lg`}>{t('start')}</button>
                  </Overlay>
                )}
                {isPaused && (
                  <Overlay>
                    <p className="text-2xl font-bold mb-4">{t('pause')}</p>
                    <button onClick={togglePause} className={btnPrimary}>{t('resume')}</button>
                  </Overlay>
                )}
                {gameOver && (
                  <Overlay>
                    <p className="text-3xl font-bold mb-2 text-red-500">{t('gameOver')}</p>
                    <p className="text-xl mb-4">{t('score')}: {score}</p>
                    <button onClick={startGame} className={btnPrimary}>{t('playAgain')}</button>
                  </Overlay>
                )}
              </div>
          </div>

          {/* Info panels */}
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{t('gameInfo')}</h2>
              <div className="space-y-3">
                {(['score', 'level'] as const).map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{t(key)}:</span>
                    <span className="text-primary font-bold">{key === 'score' ? score : level}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="font-medium">{t('status')}:</span>
                  <span className={`font-bold ${statusColor}`}>{statusText}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">{t('next')}</p>
                <div className="flex justify-center">
                  <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${nextShape.shape[0].length}, 20px)` }}>
                    {nextShape.shape.map((row, y) =>
                      row.map((cell, x) => (
                        <div key={`next-${x}-${y}`} className={`w-5 h-5 ${cell ? nextShape.color : 'bg-transparent'}`} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{t('controls')}</h2>
              <div className="space-y-2">
                {CONTROLS.map(({ keys, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {keys.map((k) => <span key={k} className={keyBadge}>{k}</span>)}
                    </div>
                    <span>{t(label)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="inline-flex min-w-[65px] h-8 bg-primary text-primary-foreground text-xs items-center justify-center rounded px-2">{t('spacebar')}</span>
                  <span>{t('hardDrop')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={keyBadge}>P</span>
                  <span>{t('pauseGame')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={startGame} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Icon d={RESET_ICON} />
                {gameOver ? t('playAgain') : t('reset')}
              </button>
              <button onClick={toggleMusic} className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isMusicPlaying ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}>
                <Icon d={MUSIC_ICON} />
                {isMusicPlaying ? t('musicOn') : t('musicOff')}
              </button>
            </div>

            {isMusicPlaying && (
              <div className="text-sm text-muted-foreground">
                🎵 {t('nowPlaying')}: {musicPlaylist[currentTrackIndex].title}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
