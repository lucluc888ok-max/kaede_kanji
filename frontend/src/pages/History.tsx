import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
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

export default function History() {
  const navigate = useNavigate()
  const { sessions } = useGameStore()

  // 過去7件のスコアグラフ用
  const recent7 = sessions.slice(0, 7).reverse()
  const maxScore = 20

  // タイプ別累計正答率（全セッション集計）
  const typeStats: Record<QuestionType, { correct: number; total: number }> = {
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
  }
  for (const s of sessions) {
    for (const [type, v] of Object.entries(s.typeBreakdown) as [QuestionType, { correct: number; total: number }][]) {
      typeStats[type].correct += v.correct
      typeStats[type].total += v.total
    }
  }

  const lastTwo = sessions.slice(0, 2)
  const diff = lastTwo.length === 2 ? lastTwo[0].score - lastTwo[1].score : null

  return (
    <div className="flex-1 flex flex-col px-6 pb-20 overflow-y-auto bg-slate-50">
      <div className="pt-4 space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-slate-400 text-lg">←</button>
          <h2 className="text-slate-800 text-xl font-black">学習のきろく</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-slate-500 text-sm">まだきろくがないよ。<br />クイズをやってみよう！</p>
            <button onClick={() => navigate('/')} className="mt-4 btn-3d btn-indigo px-6 py-2 rounded-xl text-sm font-bold">あそぶ</button>
          </div>
        ) : (
          <>
            {/* 棒グラフ */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-bold mb-4">ここ最近のせいせき</div>
              <div className="flex items-end justify-between gap-2 h-24">
                {recent7.map((s, i) => {
                  const isToday = i === recent7.length - 1
                  const h = Math.round((s.score / maxScore) * 100)
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '100%' }}>
                        <div
                          className={`w-full rounded-t-lg absolute bottom-0 ${isToday ? 'bg-amber-400' : 'bg-indigo-300'}`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${isToday ? 'text-amber-500' : 'text-slate-400'}`}>
                        {isToday ? '今日' : new Date(s.date).toLocaleDateString('ja', { weekday: 'short' })}
                      </span>
                    </div>
                  )
                })}
              </div>
              {diff !== null && (
                <div className={`mt-4 rounded-2xl p-3 flex items-center gap-2 ${diff >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <span>{diff >= 0 ? '📈' : '📉'}</span>
                  <span className={`text-xs font-bold leading-relaxed ${diff >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {diff > 0 ? `昨日の自分をこえたよ！+${diff}問` : diff === 0 ? '昨日と同じせいせきだよ！' : `昨日より${Math.abs(diff)}問少なかったよ。明日またがんばろう！`}
                  </span>
                </div>
              )}
            </div>

            {/* タイプ別正答率 */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-bold mb-3">タイプ別のせいとうりつ</div>
              <div className="space-y-3.5">
                {(Object.entries(typeStats) as [QuestionType, { correct: number; total: number }][]).map(([type, v]) => {
                  const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0
                  const color = pct >= 80 ? 'bg-indigo-400 text-indigo-600' : pct >= 50 ? 'bg-amber-400 text-amber-500' : 'bg-rose-400 text-rose-500'
                  const [barColor, textColor] = color.split(' ')
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <span className="text-slate-600">{TYPE_LABELS[type]}</span>
                        <span className={textColor + ' font-extrabold'}>{v.total > 0 ? `${pct}%` : '—'}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 記録リスト */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-bold mb-3">きろく</div>
              <div className="space-y-3">
                {sessions.slice(0, 10).map((s, i) => {
                  const stars = s.score / s.total === 1 ? 3 : s.score / s.total >= 0.6 ? 2 : 1
                  return (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <div className="text-slate-700 font-bold">{s.score} / {s.total}</div>
                        <div className="text-slate-400 text-xs">{new Date(s.date).toLocaleString('ja', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-500 text-sm font-bold">+{s.coinsEarned} 🪙</div>
                        <div>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
