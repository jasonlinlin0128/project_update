const Anthropic = require('@anthropic-ai/sdk')
const admin = require('firebase-admin')

// Initialize Firebase Admin once (serverless functions may reuse the instance)
if (!admin.apps.length) {
  // FIREBASE_SERVICE_ACCOUNT env var: JSON string of the service account key
  // Set in Vercel Dashboard → Environment Variables
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const JOURNAL_SYSTEM_PROMPT = `你是一位工作日誌助理，協助使用者用中文記錄每日工作內容。

你的任務是逐一詢問以下 7 個類別，若使用者說「沒有」或類似回應，則說「好的，跳過」並繼續問下一個：

1. 今日摘要 - 今天主要完成了什麼？
2. 論壇/出差 - 今天有參加論壇或出差嗎？
3. 廠商來訪 - 今天有廠商來訪嗎？
4. AI 開發 - 今天有進行 AI 相關開發工作嗎？
5. 需求訪談 - 今天有進行需求訪談嗎？
6. 其他事項 - 還有其他值得記錄的事情嗎？
7. 明日計劃 - 明天打算做什麼？

規則：
- 每次只問一個問題
- 等使用者回答後再問下一個
- 若使用者說沒有、無、沒、skip 等，記錄為「無」並跳過
- 全部問完後，說「感謝你的記錄！日誌已整理完成，你可以點擊下方按鈕儲存日誌。」
- 保持親切、簡潔的語氣，用繁體中文`

const SAVE_SYSTEM_PROMPT = `你是一位工作日誌整理助理。根據對話內容，產生 Obsidian 相容的 Markdown 格式工作日誌。

格式（嚴格遵守，只輸出 Markdown，不要有任何說明文字）：

---
date: {{DATE}}
type: work-journal
tags: [work-journal]
---

# 工作日誌 {{DATE}}

## 今日摘要
（從對話中整理，若無則填「無」）

## 論壇/出差
（從對話中整理，若無則填「無」）

## 廠商來訪
（從對話中整理，若無則填「無」）

## AI 開發
（從對話中整理，若無則填「無」）

## 需求訪談
（從對話中整理，若無則填「無」）

## 其他事項
（從對話中整理，若無則填「無」）

## 明日計劃
（從對話中整理，若無則填「無」）`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify Firebase ID token
  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!idToken) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  try {
    await admin.auth().verifyIdToken(idToken)
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const { messages, action, date } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' })
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const today = date || new Date().toLocaleDateString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')

    const systemPrompt = action === 'save'
      ? SAVE_SYSTEM_PROMPT.replace(/\{\{DATE\}\}/g, today)
      : JOURNAL_SYSTEM_PROMPT

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages
    })

    return res.status(200).json({
      content: response.content[0].text,
      usage: response.usage
    })
  } catch (error) {
    console.error('Claude API error:', error)
    return res.status(500).json({
      error: 'Failed to call Claude API',
      details: error.message
    })
  }
}
