import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/:deviceId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { deviceId: req.params.deviceId },
      select: { coins: true },
    })
    return res.json({ coins: user?.coins ?? 0 })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
})

export default router
