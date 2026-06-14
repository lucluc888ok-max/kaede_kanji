import type { Question } from '../types'
import rawQuestions from '../data/questions.json'

const all = rawQuestions as Question[]

// grade/termでフィルタ（grade未満 or grade一致でterm以下）
export function getActiveQuestions(grade: number, term: number): Question[] {
  return all.filter(
    (q) => q.grade < grade || (q.grade === grade && q.term <= term)
  )
}

// 20問ランダム抽出（タイプバランスを考慮）
export function pickQuizQuestions(grade: number, term: number): Question[] {
  const active = getActiveQuestions(grade, term)
  const byType: Record<string, Question[]> = {}
  for (const q of active) {
    if (!byType[q.type]) byType[q.type] = []
    byType[q.type].push(q)
  }

  const types = Object.keys(byType)
  const perType = Math.floor(20 / types.length)
  const picked: Question[] = []

  for (const type of types) {
    const shuffled = [...byType[type]].sort(() => Math.random() - 0.5)
    picked.push(...shuffled.slice(0, perType))
  }

  // 残り枠を補充
  const remaining = [...active]
    .filter((q) => !picked.includes(q))
    .sort(() => Math.random() - 0.5)
  while (picked.length < 20 && remaining.length > 0) {
    picked.push(remaining.pop()!)
  }

  return picked.sort(() => Math.random() - 0.5)
}

// 現在の設定（2学期以降に変更するだけでOK）
export const CURRENT_GRADE = 3
export const CURRENT_TERM = 1
