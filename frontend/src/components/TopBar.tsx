import { useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

const TITLE_MAP: Record<string, string> = {
  '/': '漢字チャレンジ',
  '/quiz': 'クイズ中',
  '/result': 'けっか',
  '/history': 'せいせき',
  '/shop': '背景ショップ',
}

export default function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { coins } = useGameStore()

  return (
    <div className="flex justify-between items-center px-6 pt-5 pb-3 z-10 shrink-0">
      <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1.5 active:scale-95 transition-transform">
        <span className="text-2xl">✏️</span>
        <span className="font-black text-gray-700 tracking-wider text-base">{TITLE_MAP[pathname] ?? '漢字チャレンジ'}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white border-2 border-slate-100 rounded-full py-1 pl-2 pr-3.5 shadow-sm">
        <span className="text-xl pulse-gentle">🪙</span>
        <span className="text-slate-800 font-extrabold text-sm tracking-wide">{coins}</span>
      </div>
    </div>
  )
}
