import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, set, get } from 'firebase/database'

export const useEventStore = defineStore('events', () => {
  // State
  const events = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const eventCount = computed(() => events.value.length)

  const eventsByDate = computed(() => {
    return [...events.value].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA
    })
  })

  // Actions
  async function loadEvents() {
    loading.value = true
    error.value = null

    try {
      const snapshot = await get(dbRef(realtimeDb, 'events'))
      const data = snapshot.val()

      if (data && Object.keys(data).length > 0) {
        events.value = Object.values(data)
        console.log('✅ 載入活動:', events.value.length, '個活動')
      } else {
        events.value = []
        console.log('📝 活動資料庫為空')
      }
    } catch (err) {
      console.error('❌ 載入活動失敗:', err)
      error.value = '無法載入活動資料'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  async function addEvent(event) {
    try {
      const newId = events.value.length > 0
        ? Math.max(...events.value.map(e => e.id)) + 1
        : 1

      const newEvent = {
        ...event,
        id: newId,
        createdAt: new Date().toISOString()
      }

      events.value.push(newEvent)
      await set(dbRef(realtimeDb, 'events'), events.value)

      console.log('✅ 新增活動成功')
      return { success: true, event: newEvent }
    } catch (err) {
      console.error('❌ 新增活動失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function updateEvent(id, updates) {
    try {
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = {
          ...events.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        await set(dbRef(realtimeDb, 'events'), events.value)
        console.log('✅ 更新活動成功')
        return { success: true }
      }
      return { success: false, error: 'Event not found' }
    } catch (err) {
      console.error('❌ 更新活動失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function deleteEvent(id) {
    try {
      events.value = events.value.filter(e => e.id !== id)
      await set(dbRef(realtimeDb, 'events'), events.value)
      console.log('✅ 刪除活動成功')
      return { success: true }
    } catch (err) {
      console.error('❌ 刪除活動失敗:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    events,
    loading,
    error,
    eventCount,
    eventsByDate,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent
  }
})
