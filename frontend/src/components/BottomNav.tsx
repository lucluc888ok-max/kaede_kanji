import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'ホーム', emoji: '🏠' },
  { path: '/history', label: 'せいせき', emoji: '📊' },
  { path: '/shop', label: 'ショップ', emoji: '🏪' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-[24px] shadow-lg flex justify-around items-center py-2 z-10 shrink-0">
      {TABS.map((tab) => {
        const isActive = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}
          >
            <span className="text-xl">{tab.emoji}</span>
            <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
