<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">AI 專案管理</h2>
      <button class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增專案
      </button>
    </div>

    <!-- Loading 状态 -->
    <LoadingSpinner v-if="loading" text="載入專案資料..." />

    <!-- 错误状态 -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
      <span class="text-red-700 dark:text-red-400">{{ error }}</span>
      <button @click="projectStore.loadProjects()" class="ml-4 text-red-600 dark:text-red-400 underline">
        重試
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="projects.length === 0" class="text-center py-12">
      <i class="fas fa-folder-open text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">目前沒有專案</p>
      <button class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增第一個專案
      </button>
    </div>

    <!-- 专案表格 -->
    <div v-else>
      <ProjectTable />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/projects'
import ProjectTable from '@/components/ProjectTable.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const projectStore = useProjectStore()
const { projects, loading, error } = storeToRefs(projectStore)

onMounted(() => {
  projectStore.loadProjects()
})
</script>
