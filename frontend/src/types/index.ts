export type QuestionType = 'reading' | 'fill' | 'okurigana' | 'similar' | 'bushu'

export interface Question {
  id: string
  type: QuestionType
  question: string
  choices: string[]
  answer: number
  hint: string
  explanation: string
  grade: number
  term: number
}

export interface SessionResult {
  date: string
  score: number
  total: number
  coinsEarned: number
  typeBreakdown: Record<QuestionType, { correct: number; total: number }>
}

export type ThemeId = 'default' | 'beach' | 'forest' | 'mountain' | 'space' | 'castle'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  cssClass: string
  price: number
  gradient: string
}
