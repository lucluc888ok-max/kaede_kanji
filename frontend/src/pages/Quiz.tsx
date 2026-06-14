import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore, COIN_PER_WRONG_EXPORT as COIN_PER_WRONG } from '../store/gameStore'
import type { QuestionType } from '../types'

const TYPE_LABELS: Record<QuestionType, string> = {
  reading: '📖 よみかた',
  fill: '📝 あてはまる漢字',
  okurigana: '✍️ 送り仮名',
  similar: '🔍 にた漢字',
  bushu: '🏛️ 部首',
  douon: '🔤 同じよみの漢字',
  context: '📜 文の中の漢字',
  compound: '🔗 熟語完成',
  antonym: '↔️ 反対の意味',
  ondoku: '🔊 音読み・訓読み',
}
const LETTERS = ['A', 'B', 'C', 'D']
const COIN_PER_CORRECT = 10
const TIMER_SECONDS = 15

export default function Quiz() {
  const navigate = useNavigate()
  const { quiz, answerQuestion, nextQuestion, finishQuiz } = useGameStore()

  const [selected, setSelected] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

  useEffect(() => {
    if (!quiz) navigate('/')
  }, [quiz, navigate])

  const currentIndex = quiz?.currentIndex ?? 0

  // タイマーリセット（問題が変わるたび）
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS)
  }, [currentIndex])

  // カウントダウン
  useEffect(() => {
    if (!quiz) return
    if (selected !== null) return // 回答済みは止める
    if (timeLeft <= 0) {
      // 時間切れ：強制的に不正解
      setSelected(-1)
      setShowFeedback(true)
      answerQuestion(false, -COIN_PER_WRONG)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, selected, quiz, answerQuestion])

  if (!quiz) return null

  const { questions } = quiz
  const q = questions[currentIndex]
  const total = questions.length
  const progress = ((currentIndex + 1) / total) * 100
  const isCorrect = selected === q.answer
  const isDone = selected !== null
  const isTimeout = selected === -1

  const handleSelect = (idx: number) => {
    if (isDone) return
    setSelected(idx)
    setShowFeedback(true)
    answerQuestion(idx === q.answer, idx === q.answer ? COIN_PER_CORRECT : -COIN_PER_WRONG)
  }

  const handleNext = () => {
    setSelected(null)
    setShowHint(false)
    setShowFeedback(false)
    setTimeLeft(TIMER_SECONDS)
    if (currentIndex + 1 >= total) {
      finishQuiz()
      navigate('/result')
    } else {
      nextQuestion()
    }
  }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100
  const timerColor = timeLeft > 8 ? 'bg-emerald-400' : timeLeft > 4 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pb-6 overflow-y-auto bg-white/50">
      {/* 進捗ヘッダー */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-slate-400 text-xs font-bold">問題 {currentIndex + 1} / {total}</span>
          <span className="text-indigo-600 text-xs font-black bg-indigo-50 px-2 py-0.5 rounded-full">{TYPE_LABELS[q.type]}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        {/* タイマーバー */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${isDone ? 0 : timerPct}%` }}
          />
        </div>
        <div className="text-right text-xs font-bold mt-0.5" style={{ color: timeLeft <= 4 ? '#f87171' : '#94a3b8' }}>
          {isDone ? '' : `⏱ ${timeLeft}秒`}
        </div>
      </div>

      {/* 問題カード */}
      <div className="my-auto py-4">
        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm relative">
          <button
            onClick={() => setShowHint((v) => !v)}
            className="absolute -top-3 right-6 bg-amber-100 border-2 border-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
          >
            💡 ヒント
          </button>
          <div className="text-slate-400 text-xs font-bold mb-3 tracking-wide">もんだい</div>
          <div
            className="text-slate-800 text-xl font-bold leading-relaxed"
            dangerouslySetInnerHTML={{ __html: q.question }}
          />
          {showHint && (
            <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 flex items-start gap-1.5">
              <span>💡</span><span>{q.hint}</span>
            </div>
          )}
        </div>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {q.choices.map((choice, idx) => {
          let cls = 'btn-3d btn-white w-full rounded-2xl py-3.5 px-5 text-left flex items-center shadow-sm'
          if (isDone) {
            if (idx === q.answer) {
              cls = 'w-full rounded-2xl py-3.5 px-5 text-left flex items-center bg-emerald-50 border-2 border-emerald-300 text-emerald-800 shadow-sm pop-in'
            } else if (idx === selected) {
              cls = 'w-full rounded-2xl py-3.5 px-5 text-left flex items-center bg-rose-50 border-2 border-rose-300 text-rose-800 shadow-sm'
            } else {
              cls = 'w-full rounded-2xl py-3.5 px-5 text-left flex items-center bg-white border-2 border-slate-100 shadow-sm opacity-50'
            }
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={isDone}>
              <span className="w-7 h-7 bg-indigo-50 text-indigo-600 font-black text-xs rounded-full flex items-center justify-center mr-4 border border-indigo-100 shrink-0">
                {isDone && idx === q.answer ? '✓' : LETTERS[idx]}
              </span>
              <span className="text-xl font-bold">{choice}</span>
              {isDone && idx === q.answer && (
                <span className="ml-auto text-amber-500 font-black text-sm">+{COIN_PER_CORRECT} 🪙</span>
              )}
            </button>
          )
        })}
      </div>

      {/* フィードバックパネル */}
      {showFeedback && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-slate-100 rounded-t-[36px] shadow-2xl z-20 slide-up" style={{ maxWidth: 412, margin: '0 auto' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{isCorrect ? '🎉' : isTimeout ? '⏰' : '💡'}</span>
            <h4 className={`text-lg font-black ${isCorrect ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isCorrect ? '正解！すごい！' : isTimeout ? '時間切れ！' : 'おしかった！'}
            </h4>
            <span className={`ml-auto font-black text-sm px-3 py-1 rounded-full ${isCorrect ? 'text-amber-500 bg-amber-50' : 'text-red-400 bg-red-50'}`}>
              {isCorrect ? `+${COIN_PER_CORRECT} 🪙` : `-${COIN_PER_WRONG} 🪙`}
            </span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">{q.explanation}</p>
          <button onClick={handleNext} className="btn-3d btn-indigo w-full rounded-2xl py-3 text-sm font-bold tracking-wider">
            {currentIndex + 1 >= total ? 'けっかをみる 🎊' : 'つぎへすすむ →'}
          </button>
        </div>
      )}
    </div>
  )
}
