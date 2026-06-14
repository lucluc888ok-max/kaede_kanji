import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { THEMES } from '../lib/themes'
import { pickQuizQuestions, CURRENT_GRADE, CURRENT_TERM } from '../lib/questions'

export default function Home() {
  const navigate = useNavigate()
  const { activeTheme, sessions, startQuiz } = useGameStore()
  const theme = THEMES[activeTheme]
  const latest = sessions[0]

  const handlePlay = () => {
    const questions = pickQuizQuestions(CURRENT_GRADE, CURRENT_TERM)
    startQuiz(questions)
    navigate('/quiz')
  }

  return (
    <div className={`flex-1 flex flex-col justify-between px-6 pb-6 overflow-y-auto ${theme.cssClass}`}>
      {/* マスコット＋タイトル */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 flex-1">
        <div className="relative w-full flex justify-center mb-4">
          <span className="absolute text-5xl opacity-20 left-6 top-0 float-item" style={{ animationDelay: '0.5s' }}>☁️</span>
          <span className="absolute text-4xl opacity-10 right-10 top-4 float-item" style={{ animationDelay: '1.5s' }}>☁️</span>
          <div className="relative z-10 w-28 h-28 bg-white/80 backdrop-blur rounded-[36px] border-4 border-amber-200 flex items-center justify-center shadow-lg shadow-indigo-100/50 float-item">
            <span className="text-6xl">🐣</span>
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
              ルビ先生
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-slate-800 text-3xl font-black tracking-tight" style={{ lineHeight: 1.3 }}>
            <ruby>漢字<rt className="text-[10px] text-indigo-400">かんじ</rt></ruby>チャレンジ！
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">小学3年生の漢字をマスターしよう！</p>
        </div>
      </div>

      {/* アクション */}
      <div className="space-y-4">
        <button
          onClick={handlePlay}
          className="btn-3d btn-yellow w-full rounded-[24px] py-4 px-6 flex items-center justify-center gap-3 shadow-lg shadow-amber-200/50"
        >
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-black tracking-wider">あそぶ（20問）</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/history')} className="btn-3d btn-white rounded-[20px] py-3.5 flex flex-col items-center justify-center gap-1 shadow-sm">
            <span className="text-xl">📊</span>
            <span className="text-sm font-bold text-slate-700">せいせき</span>
          </button>
          <button onClick={() => navigate('/shop')} className="btn-3d btn-white rounded-[20px] py-3.5 flex flex-col items-center justify-center gap-1 shadow-sm">
            <span className="text-xl">🏪</span>
            <span className="text-sm font-bold text-slate-700">ショップ</span>
          </button>
        </div>

        {/* 直近記録 or 今日の目標 */}
        <div className="bg-white/80 border border-slate-100 rounded-[24px] p-4 flex items-center justify-between shadow-sm">
          {latest ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="text-xs text-slate-400 font-bold">さいきんのきろく</div>
                  <div className="text-sm font-bold text-slate-700">{latest.score} / {latest.total}問せいかい</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-500 font-bold">+{latest.coinsEarned} 🪙</div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="text-xs text-slate-400 font-bold">今日の目標</div>
                  <div className="text-sm font-bold text-slate-700">はじめてのクイズにちょうせん！</div>
                </div>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded-full">Lv.1</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
