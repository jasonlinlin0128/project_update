import { ref, onMounted } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, onValue, off } from 'firebase/database'

/**
 * Firebase 连接状态 Composable
 */
export function useFirebase() {
  const isConnected = ref(false)
  const syncStatus = ref('連接中...')

  onMounted(() => {
    // 监听 Firebase 连接状态
    const connectedRef = dbRef(realtimeDb, '.info/connected')

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        isConnected.value = true
        syncStatus.value = '雲端已連線'
        console.log('✅ Firebase 已連線')
      } else {
        isConnected.value = false
        syncStatus.value = '離線模式'
        console.log('⚠️ Firebase 離線')
      }
    })

    // 组件卸载时清理
    return () => {
      off(connectedRef)
    }
  })

  return {
    isConnected,
    syncStatus
  }
}

/**
 * Firebase 实时数据监听 Composable
 */
export function useRealtimeData(path) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  let unsubscribe = null

  const startListening = () => {
    loading.value = true
    error.value = null

    const dataRef = dbRef(realtimeDb, path)

    unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        data.value = snapshot.val()
        loading.value = false
      },
      (err) => {
        console.error('Firebase 監聽失敗:', err)
        error.value = err.message
        loading.value = false
      }
    )
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  onMounted(() => {
    startListening()
  })

  return {
    data,
    loading,
    error,
    startListening,
    stopListening
  }
}
