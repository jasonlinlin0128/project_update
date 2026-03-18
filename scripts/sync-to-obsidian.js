/**
 * sync-to-obsidian.js
 *
 * 從 Firestore 讀取未同步的工作日誌，寫入 Obsidian WorkJournal 資料夾。
 *
 * 使用方式：
 *   node scripts/sync-to-obsidian.js
 *
 * 前置設定：
 *   1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. 將下載的 JSON 存為 scripts/firebase-service-account.json
 */

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// === 設定 ===
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'firebase-service-account.json')
// Override via OBSIDIAN_VAULT_PATH env var, or edit this default path
const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'C:\\Users\\user\\Desktop\\Obsidian\\WorkJournal'

// === 初始化 Firebase Admin ===
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ 找不到 firebase-service-account.json')
  console.error('   請前往 Firebase Console → Project Settings → Service Accounts → Generate new private key')
  console.error('   並將下載的 JSON 存為：', SERVICE_ACCOUNT_PATH)
  process.exit(1)
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function syncToObsidian() {
  console.log('🔄 開始同步工作日誌...')
  console.log('   Obsidian 路徑：', OBSIDIAN_VAULT_PATH)

  // 確保目標資料夾存在
  if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
    fs.mkdirSync(OBSIDIAN_VAULT_PATH, { recursive: true })
    console.log('📁 已建立 Obsidian WorkJournal 資料夾')
  }

  // 讀取未同步的日誌
  const snapshot = await db.collection('work_journals')
    .where('synced', '==', false)
    .orderBy('date')
    .get()

  if (snapshot.empty) {
    console.log('✅ 沒有需要同步的日誌')
    return
  }

  console.log(`📋 找到 ${snapshot.size} 筆未同步日誌`)

  const batch = db.batch()
  let successCount = 0
  let errorCount = 0

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const { date, markdown } = data

    if (!date || !markdown) {
      console.warn(`⚠️  跳過 ${doc.id}：缺少 date 或 markdown`)
      continue
    }

    const filePath = path.join(OBSIDIAN_VAULT_PATH, `${date}.md`)

    try {
      fs.writeFileSync(filePath, markdown, 'utf8')
      console.log(`✅ 已寫入：${date}.md`)

      // 標記為已同步
      batch.update(doc.ref, {
        synced: true,
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      successCount++
    } catch (err) {
      console.error(`❌ 寫入 ${date}.md 失敗：`, err.message)
      errorCount++
    }
  }

  // 批次更新 Firestore
  if (successCount > 0) {
    await batch.commit()
  }

  console.log(`\n📊 同步完成：成功 ${successCount} 筆，失敗 ${errorCount} 筆`)
}

syncToObsidian().catch(err => {
  console.error('❌ 同步失敗：', err)
  process.exit(1)
})
