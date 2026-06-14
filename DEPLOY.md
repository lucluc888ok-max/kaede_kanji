# デプロイ手順

## 構成

```
GitHub (monorepo)
├── frontend/   → Vercel
└── backend/    → Railway
```

---

## 1. GitHubリポジトリ作成

```bash
cd C:\Cursor\楓向け\01_漢字勉強アプリ
git init
git add .
git commit -m "initial commit"
# GitHubでリポジトリ作成後:
git remote add origin https://github.com/<your-name>/kanji-game.git
git push -u origin main
```

---

## 2. Railway（バックエンド）

1. [Railway](https://railway.app) にログイン
2. 「New Project」→「Deploy from GitHub repo」→ このリポジトリを選択
3. 「Root Directory」を `backend` に設定
4. 「Add Plugin」→ PostgreSQL を追加（DATABASE_URL は自動付与）
5. 環境変数を設定：

| 変数名 | 値 |
|--------|-----|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` |
| `PORT` | `3001` |

6. デプロイ完了後、発行されたURLをメモ（例: `https://kanji-backend.up.railway.app`）

---

## 3. Vercel（フロントエンド）

1. [Vercel](https://vercel.com) にログイン
2. 「Add New Project」→ このリポジトリを選択
3. 「Root Directory」を `frontend` に設定
4. 「Build Command」: `npm run build`
5. 「Output Directory」: `dist`
6. 環境変数を設定：

| 変数名 | 値 |
|--------|-----|
| `VITE_API_URL` | `https://kanji-backend.up.railway.app` |

7. デプロイ

---

## 4. DB マイグレーション（Railway）

Railway の「Shell」タブで実行：

```bash
npx prisma migrate deploy
```

---

## 2学期更新手順

[frontend/src/lib/questions.ts](frontend/src/lib/questions.ts) の2行を変更してプッシュするだけ：

```ts
export const CURRENT_GRADE = 3
export const CURRENT_TERM = 2  // 1 → 2 に変更
```

Vercel が自動デプロイします。
