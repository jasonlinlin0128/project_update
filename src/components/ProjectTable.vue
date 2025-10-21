<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">專案名稱</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">負責部門</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">開始時間</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">截止日期</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">優先級</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">進度</th>
          <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="p in projects"
          :key="p.id"
          class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <td class="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{{ p.name || '-' }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ p.department || '-' }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ formatDate(p.startTime) }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ formatDate(p.dueDate) }}</td>
          <td class="px-4 py-3">
            <span :class="getPriorityClass(p.priority)">
              {{ p.priority || '-' }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center space-x-2">
              <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                <div
                  class="bg-emerald-500 h-2 rounded-full transition-all"
                  :style="{ width: (p.progress || 0) + '%' }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[45px]">{{ p.progress || 0 }}%</span>
            </div>
          </td>
          <td class="px-4 py-3">
            <span :class="getStatusClass(p.status)">
              {{ p.status || '-' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/projects'

// 只读取数据，不加载数据
const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getPriorityClass = (priority) => {
  const classes = {
    '高': 'px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-sm font-medium',
    '中': 'px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-sm font-medium',
    '低': 'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm font-medium',
  }
  return classes[priority] || 'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm'
}

const getStatusClass = (status) => {
  const classes = {
    '進行中': 'px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm font-medium',
    'in-progress': 'px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm font-medium',
    '已完成': 'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm font-medium',
    'completed': 'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm font-medium',
    '待審查': 'px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-sm font-medium',
    '規劃中': 'px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm font-medium',
    'planning': 'px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm font-medium',
  }
  return classes[status] || 'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm'
}
</script>

<style scoped>
table {
  border-spacing: 0;
}
</style>
