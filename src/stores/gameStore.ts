import { create } from 'zustand'

export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  score: number
  level: number
  timeElapsed: number
}

export interface GameActions {
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  stopGame: () => void
  updateScore: (points: number) => void
  setLevel: (level: number) => void
  updateTime: (deltaTime: number) => void
  resetGame: () => void
}

export const useGameStore = create<GameState & GameActions>((set) => ({
  isPlaying: false,
  isPaused: false,
  score: 0,
  level: 1,
  timeElapsed: 0,

  startGame: () =>
    set({
      isPlaying: true,
      isPaused: false
    }),

  pauseGame: () =>
    set({
      isPaused: true
    }),

  resumeGame: () =>
    set({
      isPaused: false
    }),

  stopGame: () =>
    set({
      isPlaying: false,
      isPaused: false
    }),

  updateScore: (points) =>
    set((state) => ({
      score: state.score + points
    })),

  setLevel: (level) =>
    set({
      level
    }),

  updateTime: (deltaTime) =>
    set((state) => ({
      timeElapsed: state.timeElapsed + deltaTime
    })),

  resetGame: () =>
    set({
      isPlaying: false,
      isPaused: false,
      score: 0,
      level: 1,
      timeElapsed: 0
    })
}))
