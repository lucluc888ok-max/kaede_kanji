import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { pickQuizQuestions, CURRENT_GRADE, CURRENT_TERM } from '../lib/questions'
import { saveSession, fetchAdvice } from '../lib/api'
import type { QuestionType } from '../types'

const TYPE_LABELS: Record<QuestionType, string> = {
  reading: '📖 読みかた',
  fill: '📝 空欄補充',
  okurigana: '✍️ 送り仮名',
  similar: '🔍 にた漢字',
  bushu: '🏛️ 部首',
  douon: '🔤 同じよみの漢字',
  context: '📜 文の中の漢字',
  compound: '🔗 熟語完成',
  antonym: '↔️ 反対の意味',
  ondoku: '🔊 音読み・訓読み',
}

export default function Result() {
  const navigate = useNavigate()
  const { sessions, startQuiz } = useGameStore()
  const latest = sessions[0]
  const initialized = useRef(false)
  const [advice, setAdvice] = useState<string>('よくがんばったね！🐥')
  const [adviceLoading, setAdviceLoading] = useState(true)

  useEffect(() => {
    if (!latest && !initialized.current) { navigate('/'); return }
    initialized.current = true
    if (!latest) return

    const { score, total, typeBreakdown } = latest

    // タイプ別正答率から得意・苦手を算出
    const rates = Object.entries(typeBreakdown)
      .filter(([, v]) => v.total > 0)
      .map(([type, v]) => ({ type, rate: v.correct / v.total }))
    const best = rates.sort((a, b) => b.rate - a.rate)[0]?.type ?? 'reading'
    const worst = rates.sort((a, b) => a.rate - b.rate)[0]?.type ?? 'bushu'

    // 昨日比
    const prev = sessions[1]
    const diff = prev ? score - prev.score : null
    const compared = diff === null ? '初めて' : diff > 0 ? `+${diff}問` : diff === 0 ? '同じ' : `${diff}問`

    // 並行してAPI呼び出し
    saveSession({ score, coinsEarned: latest.coinsEarned, typeBreakdown })
    fetchAdvice({ score, total, bestType: best, worstType: worst, comparedToYesterday: compared })
      .then((text) => setAdvice(text))
      .finally(() => setAdviceLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!latest) return null

  const { score, total, coinsEarned, typeBreakdown } = latest
  const ratio = score / total
  const stars = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1

  const handleRetry = () => {
    const questions = pickQuizQuestions(CURRENT_GRADE, CURRENT_TERM)
    startQuiz(questions)
    navigate('/quiz')
  }

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pb-6 overflow-y-auto" style={{ background: 'radial-gradient(circle at 50% 30%, #312e81 0%, #1e1b4b 100%)' }}>
      <div className="flex flex-col items-center pt-6 pb-4 flex-1 justify-center">
        {/* 星 */}
        <div className="flex gap-1 mb-3">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`pop-in ${i === 1 ? 'text-6xl -translate-y-2' : 'text-5xl'} ${i >= stars ? 'opacity-25' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
          ))}
        </div>

        <div className="text-center mb-1">
          <span className="text-xs text-slate-400 font-extrabold tracking-widest uppercase">RESULT</span>
          <h2 className="text-white text-2xl font-black">よくがんばったね！</h2>
        </div>

        {/* スコア */}
        <div className="bg-white/10 border border-white/20 rounded-[32px] px-8 py-5 text-center my-4 w-full max-w-[280px]">
          <div className="text-slate-400 text-xs font-bold mb-1">せいかいすう</div>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-white font-black text-5xl">{score}</span>
            <span className="text-slate-400 font-bold text-lg">/ {total}</span>
          </div>
          <div className="mt-2 text-xs bg-indigo-500/40 text-indigo-200 font-black py-1 px-3 rounded-full inline-block">
            正答率 {Math.round(ratio * 100)}%
          </div>
        </div>

        {/* コイン */}
        <div className="flex items-center gap-2 bg-amber-400/20 border-2 border-amber-400/40 rounded-full py-1.5 px-4 mb-4">
          <span className="text-xl">🪙</span>
          <span className="text-amber-300 font-black text-sm">合計 +{coinsEarned} コイン ゲット！</span>
        </div>

        {/* タイプ別 */}
        <div className="w-full bg-white/10 rounded-2xl p-4 mb-4">
          <div className="text-slate-400 text-xs mb-3">タイプ別せいせき</div>
          <div className="space-y-2">
            {(Object.entries(typeBreakdown) as [QuestionType, { correct: number; total: number }][])
              .filter(([, v]) => v.total > 0)
              .map(([type, v]) => {
                const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0
                const color = pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-slate-300 text-xs w-24 shrink-0">{TYPE_LABELS[type]}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-white text-xs w-10 text-right">{v.correct}/{v.total}</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* AIアドバイス */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2 ml-2">
            <span className="text-2xl">🐥</span>
            <span className="text-slate-400 text-xs font-bold">ルビ先生のアドバイス</span>
          </div>
          <div className="bubble text-xs text-slate-600 leading-relaxed font-medium min-h-[60px]">
            {adviceLoading ? (
              <span className="text-slate-400">ルビ先生が考えているよ…</span>
            ) : advice}
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <button onClick={handleRetry} className="btn-3d btn-yellow w-full rounded-2xl py-3.5 text-base font-bold tracking-wider">
          🔁 もういちどあそぶ
        </button>
        <button onClick={() => navigate('/')} className="btn-3d btn-white w-full rounded-2xl py-3.5 text-base font-bold tracking-wider">
          🏠 ホームにもどる
        </button>
      </div>
    </div>
  )
}
