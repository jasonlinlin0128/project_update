import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, set, get } from 'firebase/database'

export const useSharingStore = defineStore('sharing', () => {
  // State
  const sessions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const sessionCount = computed(() => sessions.value.length)

  const sessionsByDate = computed(() => {
    return [...sessions.value].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA // 最新的在前
    })
  })

  // Actions
  async function loadSessions() {
    loading.value = true
    error.value = null

    try {
      const snapshot = await get(dbRef(realtimeDb, 'sharingSessions'))
      const data = snapshot.val()

      if (data && Object.keys(data).length > 0) {
        sessions.value = Object.values(data)
        console.log('✅ 載入分享會:', sessions.value.length, '場')
      } else {
        sessions.value = []
        console.log('📝 分享會資料庫為空')
      }
    } catch (err) {
      console.error('❌ 載入分享會失敗:', err)
      error.value = '無法載入分享會資料'
      sessions.value = []
    } finally {
      loading.value = false
    }
  }

  async function addSession(session) {
    try {
      const newId = sessions.value.length > 0
        ? Math.max(...sessions.value.map(s => s.id)) + 1
        : 1

      const newSession = {
        ...session,
        id: newId,
        createdAt: new Date().toISOString()
      }

      sessions.value.push(newSession)
      await set(dbRef(realtimeDb, 'sharingSessions'), sessions.value)

      console.log('✅ 新增分享會成功')
      return { success: true, session: newSession }
    } catch (err) {
      console.error('❌ 新增分享會失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function updateSession(id, updates) {
    try {
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index] = {
          ...sessions.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        await set(dbRef(realtimeDb, 'sharingSessions'), sessions.value)
        console.log('✅ 更新分享會成功')
        return { success: true }
      }
      return { success: false, error: 'Session not found' }
    } catch (err) {
      console.error('❌ 更新分享會失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function deleteSession(id) {
    try {
      sessions.value = sessions.value.filter(s => s.id !== id)
      await set(dbRef(realtimeDb, 'sharingSessions'), sessions.value)
      console.log('✅ 刪除分享會成功')
      return { success: true }
    } catch (err) {
      console.error('❌ 刪除分享會失敗:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    sessions,
    loading,
    error,
    sessionCount,
    sessionsByDate,
    loadSessions,
    addSession,
    updateSession,
    deleteSession
  }
})
