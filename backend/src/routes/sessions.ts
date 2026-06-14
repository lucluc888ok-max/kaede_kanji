import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// セッション保存 & コイン加算
router.post('/', async (req, res) => {
  try {
    const { deviceId, score, coinsEarned, typeBreakdown } = req.body
    if (!deviceId || score === undefined || coinsEarned === undefined) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const user = await prisma.user.upsert({
      where: { deviceId },
      update: { coins: { increment: coinsEarned } },
      create: { deviceId, coins: coinsEarned },
    })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        score,
        coinsEarned,
        typeBreakdown: typeBreakdown ?? {},
      },
    })

    return res.json({ sessionId: session.id, totalCoins: user.coins })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
})

// 履歴取得（最大90件）
router.get('/:deviceId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { deviceId: req.params.deviceId },
      include: { sessions: { orderBy: { createdAt: 'desc' }, take: 90 } },
    })
    if (!user) return res.json({ sessions: [] })
    return res.json({ sessions: user.sessions })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
})

export default router
