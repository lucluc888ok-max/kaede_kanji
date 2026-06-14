import { Router } from 'express'
import { generateAdvice } from '../lib/claude'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { score, total, bestType, worstType, comparedToYesterday } = req.body
    if (score === undefined || !total) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const advice = await generateAdvice({
      score,
      total,
      bestType: bestType ?? 'reading',
      worstType: worstType ?? 'bushu',
      comparedToYesterday: comparedToYesterday ?? '初めて',
    })

    return res.json({ advice })
  } catch (e) {
    console.error(e)
    // API失敗時はフォールバックメッセージ
    return res.json({ advice: 'よくがんばったね！また明日もチャレンジしよう！🐥' })
  }
})

export default router
