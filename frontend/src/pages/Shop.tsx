import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { THEMES } from '../lib/themes'
import type { ThemeId } from '../types'

const THEME_ORDER: ThemeId[] = ['beach', 'forest', 'mountain', 'space', 'castle']

export default function Shop() {
  const navigate = useNavigate()
  const { coins, activeTheme, ownedThemes, buyTheme, setActiveTheme } = useGameStore()

  const handleBuy = (themeId: ThemeId, price: number) => {
    const ok = buyTheme(themeId, price)
    if (!ok) alert('コインがたりないよ！クイズに答えてあつめよう！')
    else setActiveTheme(themeId)
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-20 overflow-y-auto bg-slate-50">
      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-slate-400 text-lg">←</button>
          <h2 className="text-slate-800 text-xl font-black">背景ショップ</h2>
        </div>
        <p className="text-slate-400 text-xs font-medium">貯めたコインでホーム画面を着せ替えよう！</p>

        {/* 現在のテーマ */}
        <div className="bg-white border border-slate-100 rounded-[28px] p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-bold mb-2">使っているテーマ</div>
          <div
            className="h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-700 shadow-inner"
            style={{ background: THEMES[activeTheme].gradient }}
          >
            {THEMES[activeTheme].emoji} {THEMES[activeTheme].name}
          </div>
        </div>

        {/* 商品リスト */}
        <div className="grid grid-cols-2 gap-3">
          {THEME_ORDER.map((themeId) => {
            const theme = THEMES[themeId]
            const isOwned = ownedThemes.includes(themeId)
            const isActive = activeTheme === themeId
            const canBuy = coins >= theme.price

            return (
              <div
                key={themeId}
                className={`bg-white border-2 rounded-[24px] overflow-hidden shadow-sm flex flex-col ${isActive ? 'border-indigo-500' : 'border-slate-100'}`}
              >
                <div className="h-16 flex items-center justify-center" style={{ background: theme.gradient }}>
                  <span className="text-3xl">{theme.emoji}</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="font-extrabold text-slate-700 text-xs">{theme.name}</div>
                  <div className="flex justify-between items-center">
                    {isActive ? (
                      <span className="text-indigo-600 text-xs font-black bg-indigo-50 px-2.5 py-1 rounded-full">✓ つかい中</span>
                    ) : isOwned ? (
                      <button
                        onClick={() => setActiveTheme(themeId)}
                        className="bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-full"
                      >
                        つかう
                      </button>
                    ) : (
                      <div className="flex flex-col items-end gap-1 w-full">
                        <span className="text-amber-600 font-extrabold text-xs">🪙 {theme.price}</span>
                        <button
                          onClick={() => handleBuy(themeId, theme.price)}
                          className={`text-white font-bold text-xs px-3.5 py-1.5 rounded-full ${canBuy ? 'bg-indigo-600' : 'bg-slate-300 cursor-not-allowed'}`}
                          disabled={!canBuy}
                        >
                          {canBuy ? '買う' : 'コイン不足'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
