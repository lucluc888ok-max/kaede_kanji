import { Router } from 'express'
import { prisma } from '../lib/prisma'

const VALID_SCENES = ['beach', 'forest', 'mountain', 'space', 'castle']
const PRICES: Record<string, number> = {
  beach: 50, forest: 80, mountain: 120, space: 200, castle: 300,
}

const router = Router()

router.post('/buy', async (req, res) => {
  try {
    const { deviceId, sceneId, price } = req.body
    if (!deviceId || !sceneId || price === undefined) {
      return res.status(400).json({ error: 'missing fields' })
    }
    if (!VALID_SCENES.includes(sceneId) || PRICES[sceneId] !== price) {
      return res.status(400).json({ error: 'invalid scene or price' })
    }

    const user = await prisma.user.findUnique({ where: { deviceId } })
    if (!user) return res.status(404).json({ error: 'user not found' })
    if (user.coins < price) return res.status(400).json({ error: 'insufficient coins' })
    if (user.ownedScenes.includes(sceneId)) {
      return res.status(400).json({ error: 'already owned' })
    }

    const updated = await prisma.user.update({
      where: { deviceId },
      data: {
        coins: { decrement: price },
        ownedScenes: { push: sceneId },
        activeScene: sceneId,
      },
    })

    return res.json({ success: true, remainingCoins: updated.coins })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
})

export default router
