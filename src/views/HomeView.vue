<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        歡迎使用專案管理系統
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        多功能整合儀表板，讓您輕鬆管理專案、任務和活動
      </p>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">總專案數</p>
            <p class="text-3xl font-bold text-blue-600">{{ projectCount }}</p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
            <i class="fas fa-project-diagram text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">進行中專案</p>
            <p class="text-3xl font-bold text-orange-600">{{ inProgressCount }}</p>
          </div>
          <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded-full">
            <i class="fas fa-spinner text-2xl text-orange-600 dark:text-orange-400"></i>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">已完成專案</p>
            <p class="text-3xl font-bold text-green-600">{{ completedCount }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900 p-4 rounded-full">
            <i class="fas fa-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">完成率</p>
            <p class="text-3xl font-bold text-purple-600">{{ completionRate }}%</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
            <i class="fas fa-chart-line text-2xl text-purple-600 dark:text-purple-400"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速導航 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        to="/projects"
        class="card hover:shadow-xl transition-shadow cursor-pointer group"
      >
        <div class="flex items-center space-x-4">
          <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg group-hover:scale-110 transition-transform">
            <i class="fas fa-project-diagram text-3xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">AI 專案管理</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">管理您的專案進度</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/tasks"
        class="card hover:shadow-xl transition-shadow cursor-pointer group"
      >
        <div class="flex items-center space-x-4">
          <div class="bg-green-100 dark:bg-green-900 p-4 rounded-lg group-hover:scale-110 transition-transform">
            <i class="fas fa-tasks text-3xl text-green-600 dark:text-green-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">例行任務</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">追蹤日常工作</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/sharing"
        class="card hover:shadow-xl transition-shadow cursor-pointer group"
      >
        <div class="flex items-center space-x-4">
          <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg group-hover:scale-110 transition-transform">
            <i class="fas fa-users text-3xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">分享會管理</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">組織分享活動</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/events"
        class="card hover:shadow-xl transition-shadow cursor-pointer group"
      >
        <div class="flex items-center space-x-4">
          <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg group-hover:scale-110 transition-transform">
            <i class="fas fa-calendar text-3xl text-orange-600 dark:text-orange-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">活動參與</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">記錄參與的活動</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/contacts"
        class="card hover:shadow-xl transition-shadow cursor-pointer group"
      >
        <div class="flex items-center space-x-4">
          <div class="bg-cyan-100 dark:bg-cyan-900 p-4 rounded-lg group-hover:scale-110 transition-transform">
            <i class="fas fa-briefcase text-3xl text-cyan-600 dark:text-cyan-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">企業接洽</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">管理商業聯繫</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Loading 状态 -->
    <LoadingSpinner v-if="loading" text="載入資料中..." />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/projects'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const projectStore = useProjectStore()
const { projects, loading } = storeToRefs(projectStore)

// 计算统计数据
const projectCount = computed(() => projects.value.length)

const inProgressCount = computed(() => {
  return projects.value.filter(p => p.status === '進行中' || p.status === 'in-progress').length
})

const completedCount = computed(() => {
  return projects.value.filter(p => p.status === '已完成' || p.status === 'completed').length
})

const completionRate = computed(() => {
  if (projectCount.value === 0) return 0
  return Math.round((completedCount.value / projectCount.value) * 100)
})

onMounted(() => {
  projectStore.loadProjects()
})
</script>
