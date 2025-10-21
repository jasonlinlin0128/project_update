<template>
  <div class="container mx-auto px-4 py-8">
    <div class="card max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">🔥 Firebase 連接測試</h2>

      <!-- 环境变量检查 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">1. 環境變量檢查</h3>
        <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <p><strong>API Key:</strong> {{ envCheck.apiKey ? '✅ 已配置' : '❌ 未配置' }}</p>
          <p><strong>Project ID:</strong> {{ envCheck.projectId ? '✅ 已配置' : '❌ 未配置' }}</p>
          <p><strong>Database URL:</strong> {{ envCheck.databaseUrl ? '✅ 已配置' : '❌ 未配置' }}</p>
        </div>
      </div>

      <!-- Firebase 连接状态 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">2. Firebase 連接狀態</h3>
        <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <p><strong>連接狀態:</strong>
            <span v-if="isConnected === null" class="text-yellow-600">⏳ 檢測中...</span>
            <span v-else-if="isConnected" class="text-green-600">✅ 已連接</span>
            <span v-else class="text-red-600">❌ 未連接</span>
          </p>
        </div>
      </div>

      <!-- 数据读取测试 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">3. 數據讀取測試</h3>
        <button @click="testDataRead" class="btn-primary mb-3">
          <i class="fas fa-play mr-2"></i>測試讀取專案數據
        </button>
        <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <p><strong>狀態:</strong> {{ dataTest.status }}</p>
          <p><strong>專案數量:</strong> {{ dataTest.count }}</p>
          <p v-if="dataTest.error" class="text-red-600"><strong>錯誤:</strong> {{ dataTest.error }}</p>
          <div v-if="dataTest.data && dataTest.data.length > 0" class="mt-2">
            <p><strong>前 3 個專案:</strong></p>
            <ul class="list-disc list-inside">
              <li v-for="(project, idx) in dataTest.data.slice(0, 3)" :key="idx">
                {{ project.name }} (ID: {{ project.id }})
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 完整诊断 -->
      <div>
        <h3 class="text-lg font-semibold mb-2">4. 完整診斷資訊</h3>
        <button @click="copyDiagnostics" class="btn-secondary mb-3">
          <i class="fas fa-copy mr-2"></i>複製診斷資訊
        </button>
        <textarea
          v-model="diagnostics"
          class="w-full h-32 p-2 border rounded font-mono text-xs"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, get } from 'firebase/database'

const envCheck = ref({
  apiKey: false,
  projectId: false,
  databaseUrl: false
})

const isConnected = ref(null)
const dataTest = ref({
  status: '尚未測試',
  count: 0,
  data: null,
  error: null
})

// 检查环境变量
const checkEnv = () => {
  envCheck.value = {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    databaseUrl: !!import.meta.env.VITE_FIREBASE_DATABASE_URL
  }
}

// 检查 Firebase 连接
const checkConnection = async () => {
  try {
    // 尝试读取连接状态
    const connectedRef = dbRef(realtimeDb, '.info/connected')
    const snapshot = await get(connectedRef)
    isConnected.value = snapshot.val() === true
  } catch (error) {
    console.error('連接檢查失敗:', error)
    isConnected.value = false
  }
}

// 测试数据读取
const testDataRead = async () => {
  dataTest.value.status = '⏳ 讀取中...'
  dataTest.value.error = null

  try {
    const snapshot = await get(dbRef(realtimeDb, 'projects'))
    const data = snapshot.val()

    if (data && Object.keys(data).length > 0) {
      const projectsArray = Object.values(data)
      dataTest.value.status = '✅ 讀取成功'
      dataTest.value.count = projectsArray.length
      dataTest.value.data = projectsArray
    } else {
      dataTest.value.status = '⚠️ 數據庫為空'
      dataTest.value.count = 0
      dataTest.value.data = []
    }
  } catch (error) {
    dataTest.value.status = '❌ 讀取失敗'
    dataTest.value.error = error.message
    console.error('數據讀取失敗:', error)
  }
}

// 诊断信息
const diagnostics = computed(() => {
  return `Firebase 診斷報告
==================

環境變量:
- API Key: ${envCheck.value.apiKey ? '已配置' : '未配置'}
- Project ID: ${envCheck.value.projectId ? '已配置' : '未配置'}
- Database URL: ${envCheck.value.databaseUrl ? '已配置' : '未配置'}

連接狀態: ${isConnected.value === null ? '檢測中' : isConnected.value ? '已連接' : '未連接'}

數據讀取:
- 狀態: ${dataTest.value.status}
- 專案數量: ${dataTest.value.count}
${dataTest.value.error ? `- 錯誤: ${dataTest.value.error}` : ''}

瀏覽器: ${navigator.userAgent}
時間: ${new Date().toLocaleString('zh-TW')}
`
})

const copyDiagnostics = async () => {
  try {
    await navigator.clipboard.writeText(diagnostics.value)
    alert('診斷資訊已複製到剪貼板')
  } catch (err) {
    alert('複製失敗，請手動選擇文字複製')
  }
}

onMounted(() => {
  checkEnv()
  checkConnection()
})
</script>
