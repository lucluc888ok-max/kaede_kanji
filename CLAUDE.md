# 漢字学習ゲーム — CLAUDE.md

## プロジェクト概要

小学3年生向けの漢字学習Webアプリ（PWA）。
選択式クイズ＋ゲーミフィケーションで楽しく漢字を定着させる。

- **対象**: 小学3年生（8〜9歳）
- **プラットフォーム**: スマホ向けPWA（Android Chrome推奨）
- **1セット**: 20問、目安20分以内
- **手書き入力**: Phase 2以降（現フェーズは選択式のみ）

---

## インフラ構成

```
GitHub
├── /frontend   → Vercel（自動デプロイ）
└── /backend    → Railway（自動デプロイ）
```

### フロントエンド（Vercel）
- リポジトリをVercelに接続し、mainブランチへのpushで自動デプロイ
- 環境変数: `VITE_API_URL`（RailwayのバックエンドURL）

### バックエンド（Railway）
- GitHubリポジトリと接続し、mainブランチへのpushで自動デプロイ
- 環境変数: `ANTHROPIC_API_KEY`（Claude API呼び出し用）
- 環境変数: `DATABASE_URL`（PostgreSQL接続文字列、Railway内部で自動付与）

---

## 技術スタック

### フロントエンド
```
React + TypeScript + Vite（PWA）
├── vite-plugin-pwa        # PWA化（オフライン対応・ホーム画面追加）
├── React Router v6        # 画面遷移
├── Tailwind CSS           # スタイリング
├── Zustand                # グローバル状態管理（コイン・セッション）
├── React Query            # APIフェッチ・キャッシュ
└── IndexedDB（idb）       # 問題データ・成績のローカルキャッシュ
```

### バックエンド
```
Node.js + Express + TypeScript
├── Prisma ORM             # DBアクセス
├── PostgreSQL             # 成績・コイン・コレクション永続化（Railway提供）
├── Anthropic SDK          # Claude APIアドバイス生成
└── cors / helmet          # セキュリティ基本設定
```

---

## ディレクトリ構成

```
kanji-game/
├── CLAUDE.md
├── frontend/                        # Vercelデプロイ対象
│   ├── public/
│   │   └── manifest.json            # PWAマニフェスト
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx             # ホーム画面
│   │   │   ├── Quiz.tsx             # クイズ画面
│   │   │   ├── Result.tsx           # 結果・アドバイス画面
│   │   │   ├── History.tsx          # 成績履歴画面
│   │   │   └── Shop.tsx             # ショップ画面
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx     # 問題表示
│   │   │   ├── ChoiceButton.tsx     # 選択肢ボタン
│   │   │   ├── CoinDisplay.tsx      # コイン残高
│   │   │   └── ProgressBar.tsx      # 進捗バー
│   │   ├── data/
│   │   │   └── questions.json       # 問題データ（Claude Codeが生成）
│   │   ├── lib/
│   │   │   ├── api.ts               # バックエンドAPIクライアント
│   │   │   ├── localCache.ts        # IndexedDB操作
│   │   │   └── scoring.ts           # スコア計算ロジック
│   │   └── store/
│   │       └── gameStore.ts         # Zustandストア
│   ├── vite.config.ts
│   └── package.json
│
└── backend/                         # Railwayデプロイ対象
    ├── src/
    │   ├── index.ts                 # Expressエントリーポイント
    │   ├── routes/
    │   │   ├── sessions.ts          # 成績保存・取得API
    │   │   ├── coins.ts             # コイン残高API
    │   │   ├── shop.ts              # ショップAPI
    │   │   └── advice.ts            # Claude APIアドバイスAPI
    │   ├── lib/
    │   │   └── claude.ts            # Anthropic SDKクライアント
    │   └── prisma/
    │       └── schema.prisma        # DBスキーマ
    └── package.json
```

---

## データベーススキーマ（Prisma）

```prisma
// backend/src/prisma/schema.prisma

model User {
  id           String    @id @default(cuid())
  deviceId     String    @unique   // ブラウザのfingerprintで代替（ログイン不要）
  coins        Int       @default(0)
  ownedScenes  String[]  @default([])
  activeScene  String    @default("scene_default")
  sessions     Session[]
  createdAt    DateTime  @default(now())
}

model Session {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  score           Int
  total           Int      @default(20)
  coinsEarned     Int
  typeBreakdown   Json     // { reading: {correct,total}, fill: {...}, ... }
  createdAt       DateTime @default(now())
}
```

---

## API設計

### POST /api/sessions
セッション結果を保存し、獲得コインを加算する。

```typescript
// Request
{ deviceId: string, score: number, coinsEarned: number, typeBreakdown: object }

// Response
{ sessionId: string, totalCoins: number }
```

### GET /api/sessions/:deviceId
過去のセッション履歴を取得する（最大90件）。

### GET /api/coins/:deviceId
現在のコイン残高を取得する。

### POST /api/shop/buy
風景を購入する。

```typescript
// Request
{ deviceId: string, sceneId: string, price: number }

// Response
{ success: boolean, remainingCoins: number }
```

### POST /api/advice
Claude APIでアドバイスを生成して返す。

```typescript
// Request
{ score: number, total: number, bestType: string, worstType: string, comparedToYesterday: string }

// Response
{ advice: string }
```

---

## 問題タイプ（5種類）

### Type 1: 音訓読み
```json
{
  "type": "reading",
  "question": "「学」の読み方はどれ？",
  "choices": ["まなぶ", "がく", "かく", "さく"],
  "answer": 0,
  "kanji": "学",
  "grade": 3
}
```

### Type 2: 空欄補充
```json
{
  "type": "fill",
  "question": "「___が光る」に入る漢字は？",
  "choices": ["星", "晴", "生", "青"],
  "answer": 0,
  "hint": "夜空にある",
  "grade": 3
}
```

### Type 3: 送り仮名
```json
{
  "type": "okurigana",
  "question": "正しい送り仮名はどれ？",
  "stem": "走",
  "choices": ["走る", "走ける", "走く", "走れ"],
  "answer": 0,
  "grade": 3
}
```

### Type 4: 似た漢字
```json
{
  "type": "similar",
  "question": "「すえ」と読む漢字はどれ？",
  "choices": ["末", "未", "木", "本"],
  "answer": 0,
  "explanation": "「末」は横棒の下が長い",
  "grade": 3
}
```

### Type 5: 部首選択
```json
{
  "type": "bushu",
  "question": "「さんずい」はどれ？",
  "choices": ["氵", "冫", "彡", "シ"],
  "answer": 0,
  "bushu_name": "さんずい",
  "grade": 3
}
```

---

## 問題データ生成仕様

`frontend/src/data/questions.json` はClaude Codeが以下の仕様で生成する。

- 小学3年生配当漢字200字をすべてカバー
- 各タイプ（1〜5）ごとに最低40問、合計200問以上
- 不正解の選択肢は「惜しい」ものを選ぶ（無関係なものはNG）
- `grade: 3` フィールドを全問に付与
- 将来の学年拡張に備えて `grade` フィールドで管理

```
# Claude Codeへの依頼プロンプト
「frontend/src/data/questions.jsonを小学3年生配当漢字200字をもとに生成してください。仕様はCLAUDE.mdのとおりです」
```

---

## ゲームフロー

```
ホーム画面
  └─ 「あそぶ」タップ
       └─ クイズ画面（20問）
            ├─ 問題表示（タイプ1〜5がランダム混在）
            ├─ 4択ボタン表示
            ├─ 正解 → コイン+10、アニメーション演出
            ├─ 不正解 → 正解を表示、コイン変化なし
            └─ 20問完了
                 └─ 結果画面
                      ├─ スコア表示（例: 16/20）
                      ├─ AIアドバイス（POST /api/advice）
                      ├─ 結果をPOST /api/sessionsで保存
                      └─ ホームへ戻る
```

---

## スコアリング仕様

```typescript
// frontend/src/lib/scoring.ts

const COIN_PER_CORRECT = 10;

const TYPE_BONUS: Record<string, number> = {
  reading: 0,
  fill: 5,
  okurigana: 5,
  similar: 10,
  bushu: 10,
};

interface SessionResult {
  date: string;
  score: number;
  total: number;          // 常に20
  coinsEarned: number;
  typeBreakdown: Record<string, { correct: number; total: number }>;
}
```

---

## ショップ仕様

| 風景ID | 名前 | 価格 |
|--------|------|------|
| scene_beach | 夏のビーチ | 50コイン |
| scene_forest | 秋の森 | 80コイン |
| scene_mountain | 雪山 | 120コイン |
| scene_space | 宇宙 | 200コイン |
| scene_castle | お城 | 300コイン |

- 購入済み風景はホーム画面の背景として設定できる
- 初期背景は `scene_default`（無料）

---

## PWA設定

```json
// frontend/public/manifest.json
{
  "name": "漢字チャレンジ",
  "short_name": "漢字",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [...]
}
```

- `vite-plugin-pwa` でService Workerを自動生成
- 問題データ（questions.json）はService Workerでキャッシュ → オフラインでもクイズ可能
- APIが届かない場合はアドバイスを固定メッセージにフォールバック

---

## 画面仕様

### ホーム画面
- 背景: 購入済み風景
- コイン残高表示（右上）
- 「あそぶ」ボタン（大きく中央）
- 「せいせき」「ショップ」ボタン

### クイズ画面
- 上部: 進捗バー（20問中何問目か）
- 中央: 問題文（フォント最小18px、小3が読める大きさ）
- 下部: 4択ボタン（縦並び、タップしやすい最小高さ48px）
- 正解時: 緑フラッシュ + コイン獲得アニメーション
- 不正解時: 赤フラッシュ + 正解ハイライト

### 結果画面
- スコア表示（大きく中央）
- 獲得コイン数
- AIアドバイス（吹き出し形式）
- 「もう一度」「ホームへ」ボタン

### 成績履歴画面
- 過去7日間のスコアグラフ
- タイプ別正答率（5種類）
- 昨日との比較コメント

---

## 実装順序（Phase 1）

1. `frontend/src/data/questions.json` の生成
2. バックエンド（Express + Prisma）のセットアップ
3. Railway + PostgreSQL の接続確認
4. フロントエンド基本画面（ホーム・クイズ・結果）
5. スコア計算 + APIへの保存
6. Claude APIアドバイス連携
7. 成績履歴画面
8. ショップ画面
9. PWA設定（manifest + Service Worker）
10. Vercelデプロイ確認

---

## 注意事項

- `deviceId` はログイン不要のためブラウザの `crypto.randomUUID()` で生成しlocalStorageに保存
- フォントサイズ最小18px、ボタン最小高さ48px（小3の指サイズ考慮）
- 漢字表示には必要に応じてルビ（`<ruby>`タグ）を付与
- APIオフライン時はアドバイスをスキップし固定メッセージを表示
- CORS設定: バックエンドはVercelのドメインのみ許可

