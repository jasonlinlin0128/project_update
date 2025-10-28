import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, set, get, remove, update } from 'firebase/database'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const allTasks = computed(() => {
    const result = []
    Object.keys(tasks.value).forEach(category => {
      Object.values(tasks.value[category] || {}).forEach(task => {
        result.push({ ...task, category })
      })
    })
    return result
  })

  const tasksByCategory = computed(() => (category) => {
    return Object.values(tasks.value[category] || {})
  })

  const taskCount = computed(() => allTasks.value.length)

  // Actions
  async function loadTasks() {
    loading.value = true
    error.value = null

    try {
      const snapshot = await get(dbRef(realtimeDb, 'routineTasks'))
      const data = snapshot.val()

      if (data) {
        tasks.value = data
        console.log('✅ 載入例行任務')
      } else {
        tasks.value = {}
        console.log('📝 例行任務資料庫為空')
      }
    } catch (err) {
      console.error('❌ 載入例行任務失敗:', err)
      error.value = '無法載入例行任務'
      tasks.value = {}
    } finally {
      loading.value = false
    }
  }

  async function addTask(category, task) {
    try {
      if (!tasks.value[category]) {
        tasks.value[category] = {}
      }

      const taskId = Date.now().toString()
      const newTask = {
        id: taskId,
        ...task,
        createdAt: new Date().toISOString()
      }

      tasks.value[category][taskId] = newTask
      await set(dbRef(realtimeDb, 'routineTasks'), tasks.value)

      console.log('✅ 新增任務成功')
      return { success: true, task: newTask }
    } catch (err) {
      console.error('❌ 新增任務失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function updateTask(category, taskId, updates) {
    try {
      if (tasks.value[category] && tasks.value[category][taskId]) {
        tasks.value[category][taskId] = {
          ...tasks.value[category][taskId],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        await set(dbRef(realtimeDb, 'routineTasks'), tasks.value)
        console.log('✅ 更新任務成功')
        return { success: true }
      }
      return { success: false, error: 'Task not found' }
    } catch (err) {
      console.error('❌ 更新任務失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function deleteTask(category, taskId) {
    try {
      if (tasks.value[category] && tasks.value[category][taskId]) {
        delete tasks.value[category][taskId]
        await set(dbRef(realtimeDb, 'routineTasks'), tasks.value)
        console.log('✅ 刪除任務成功')
        return { success: true }
      }
      return { success: false, error: 'Task not found' }
    } catch (err) {
      console.error('❌ 刪除任務失敗:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    tasks,
    loading,
    error,
    allTasks,
    tasksByCategory,
    taskCount,
    loadTasks,
    addTask,
    updateTask,
    deleteTask
  }
})
