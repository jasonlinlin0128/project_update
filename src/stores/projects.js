import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, set, get, remove, update } from 'firebase/database'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const projectCount = computed(() => projects.value.length)

  const projectsByStatus = computed(() => {
    return projects.value.reduce((acc, project) => {
      const status = project.status || '未分類'
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(project)
      return acc
    }, {})
  })

  const getProjectById = computed(() => {
    return (id) => projects.value.find(p => p.id === id)
  })

  // Actions
  async function loadProjects() {
    loading.value = true
    error.value = null

    try {
      const snapshot = await get(dbRef(realtimeDb, 'projects'))
      const data = snapshot.val()

      if (data && Object.keys(data).length > 0) {
        projects.value = Object.values(data).sort((a, b) => a.id - b.id)
        console.log('✅ 載入專案資料:', projects.value.length, '個專案')
      } else {
        projects.value = []
        console.log('📝 專案資料庫為空')
      }
    } catch (err) {
      console.error('❌ 載入專案失敗:', err)
      error.value = '無法載入專案資料'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  async function addProject(project) {
    loading.value = true
    error.value = null

    try {
      const newId = projects.value.length > 0
        ? Math.max(...projects.value.map(p => p.id)) + 1
        : 1

      const newProject = {
        ...project,
        id: newId,
        createdAt: new Date().toISOString()
      }

      await set(dbRef(realtimeDb, `projects/${newId}`), newProject)
      projects.value.push(newProject)

      console.log('✅ 專案新增成功:', newProject.name)
      return { success: true, project: newProject }
    } catch (err) {
      console.error('❌ 新增專案失敗:', err)
      error.value = '無法新增專案'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, updates) {
    loading.value = true
    error.value = null

    try {
      await update(dbRef(realtimeDb, `projects/${id}`), {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updates }
      }

      console.log('✅ 專案更新成功:', id)
      return { success: true }
    } catch (err) {
      console.error('❌ 更新專案失敗:', err)
      error.value = '無法更新專案'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null

    try {
      await remove(dbRef(realtimeDb, `projects/${id}`))
      projects.value = projects.value.filter(p => p.id !== id)

      console.log('✅ 專案刪除成功:', id)
      return { success: true }
    } catch (err) {
      console.error('❌ 刪除專案失敗:', err)
      error.value = '無法刪除專案'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    projects,
    loading,
    error,
    // Getters
    projectCount,
    projectsByStatus,
    getProjectById,
    // Actions
    loadProjects,
    addProject,
    updateProject,
    deleteProject
  }
})
