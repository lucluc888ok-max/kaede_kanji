import { Routes, Route, useLocation } from 'react-router-dom'
import { useGameStore } from './store/gameStore'
import { THEMES } from './lib/themes'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import History from './pages/History'
import Shop from './pages/Shop'

const HIDE_NAV = ['/quiz', '/result']

export default function App() {
  const { pathname } = useLocation()
  const { activeTheme } = useGameStore()
  const theme = THEMES[activeTheme]
  const hideNav = HIDE_NAV.includes(pathname)

  return (
    <div className={`phone-frame ${theme.cssClass} transition-all duration-500`}>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  )
}
