const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function getDeviceId(): string {
  let id = localStorage.getItem('kanji_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('kanji_device_id', id)
  }
  return id
}

export const deviceId = getDeviceId()

interface SessionPayload {
  score: number
  coinsEarned: number
  typeBreakdown: Record<string, { correct: number; total: number }>
}

export async function saveSession(payload: SessionPayload) {
  try {
    const res = await fetch(`${BASE}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, ...payload }),
    })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

interface AdvicePayload {
  score: number
  total: number
  bestType: string
  worstType: string
  comparedToYesterday: string
}

export async function fetchAdvice(payload: AdvicePayload): Promise<string> {
  try {
    const res = await fetch(`${BASE}/api/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      return data.advice
    }
  } catch {
    // fall through
  }
  return 'よくがんばったね！また明日もチャレンジしよう！🐥'
}
