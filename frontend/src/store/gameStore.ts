import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, SessionResult, ThemeId, QuestionType } from '../types'

interface QuizSession {
  questions: Question[]
  currentIndex: number
  correctCount: number
  answers: boolean[]
  typeBreakdown: Record<QuestionType, { correct: number; total: number }>
}

interface GameStore {
  // 永続化データ
  coins: number
  activeTheme: ThemeId
  ownedThemes: ThemeId[]
  sessions: SessionResult[]

  // クイズ一時状態（永続化しない）
  quiz: QuizSession | null

  // アクション
  startQuiz: (questions: Question[]) => void
  answerQuestion: (isCorrect: boolean, coinsEarned: number) => void
  nextQuestion: () => void
  finishQuiz: () => SessionResult
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  buyTheme: (themeId: ThemeId, price: number) => boolean
  setActiveTheme: (themeId: ThemeId) => void
}

const COIN_PER_CORRECT = 10
const COIN_PER_WRONG = 20
const QUIZ_LENGTH = 20

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      coins: 0,
      activeTheme: 'default',
      ownedThemes: ['default'],
      sessions: [],
      quiz: null,

      startQuiz: (questions) => {
        const sliced = questions.slice(0, QUIZ_LENGTH)
        set({
          quiz: {
            questions: sliced,
            currentIndex: 0,
            correctCount: 0,
            answers: [],
            typeBreakdown: {
              reading: { correct: 0, total: 0 },
              fill: { correct: 0, total: 0 },
              okurigana: { correct: 0, total: 0 },
              similar: { correct: 0, total: 0 },
              bushu: { correct: 0, total: 0 },
              douon: { correct: 0, total: 0 },
              context: { correct: 0, total: 0 },
              compound: { correct: 0, total: 0 },
              antonym: { correct: 0, total: 0 },
              ondoku: { correct: 0, total: 0 },
            },
          },
        })
      },

      answerQuestion: (isCorrect, coinsEarned) => {
        const { quiz } = get()
        if (!quiz) return
        const q = quiz.questions[quiz.currentIndex]
        const td = { ...quiz.typeBreakdown }
        td[q.type] = {
          correct: td[q.type].correct + (isCorrect ? 1 : 0),
          total: td[q.type].total + 1,
        }
        set((s) => ({
          coins: Math.max(0, s.coins + coinsEarned),
          quiz: quiz
            ? {
                ...quiz,
                correctCount: quiz.correctCount + (isCorrect ? 1 : 0),
                answers: [...quiz.answers, isCorrect],
                typeBreakdown: td,
              }
            : null,
        }))
      },

      nextQuestion: () => {
        const { quiz } = get()
        if (!quiz) return
        set({ quiz: { ...quiz, currentIndex: quiz.currentIndex + 1 } })
      },

      finishQuiz: () => {
        const { quiz } = get()
        if (!quiz) throw new Error('no quiz')
        const result: SessionResult = {
          date: new Date().toISOString(),
          score: quiz.correctCount,
          total: quiz.questions.length,
          coinsEarned: quiz.correctCount * COIN_PER_CORRECT,
          typeBreakdown: quiz.typeBreakdown,
        }
        set((s) => ({
          sessions: [result, ...s.sessions].slice(0, 90),
          quiz: null,
        }))
        return result
      },

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount) => {
        const { coins } = get()
        if (coins < amount) return false
        set((s) => ({ coins: s.coins - amount }))
        return true
      },

      buyTheme: (themeId, price) => {
        const { ownedThemes, spendCoins } = get()
        if (ownedThemes.includes(themeId)) return false
        if (!spendCoins(price)) return false
        set((s) => ({ ownedThemes: [...s.ownedThemes, themeId] }))
        return true
      },

      setActiveTheme: (themeId) => set({ activeTheme: themeId }),
    }),
    {
      name: 'kanji-game-store',
      partialize: (s) => ({
        coins: s.coins,
        activeTheme: s.activeTheme,
        ownedThemes: s.ownedThemes,
        sessions: s.sessions,
      }),
    }
  )
)

export const COIN_PER_CORRECT_EXPORT = COIN_PER_CORRECT
export const COIN_PER_WRONG_EXPORT = COIN_PER_WRONG
