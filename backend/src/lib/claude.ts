import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AdviceParams {
  score: number
  total: number
  bestType: string
  worstType: string
  comparedToYesterday: string
}

const TYPE_LABELS: Record<string, string> = {
  reading: '読みかた',
  fill: '空欄補充',
  okurigana: '送り仮名',
  similar: 'にた漢字',
  bushu: '部首',
}

export async function generateAdvice(params: AdviceParams): Promise<string> {
  const { score, total, bestType, worstType, comparedToYesterday } = params

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: `あなたは小学3年生向け漢字学習アプリ「ルビ先生」（🐥ひよこのキャラクター）です。
子供が喜ぶやさしい言葉で、短く（3文以内）アドバイスをしてください。
・ひらがな多め、難しい漢字にはルビをふる
・「〜だよ！」「〜しよう！」口調
・励ます内容にする
・最後に🐥をつける`,
    messages: [
      {
        role: 'user',
        content: `せいせき: ${score}/${total}問せいかい
得意タイプ: ${TYPE_LABELS[bestType] ?? bestType}
苦手タイプ: ${TYPE_LABELS[worstType] ?? worstType}
昨日との比較: ${comparedToYesterday}

このせいせきへのアドバイスをください。`,
      },
    ],
  })

  const block = message.content[0]
  return block.type === 'text' ? block.text : 'よくがんばったね！🐥'
}
