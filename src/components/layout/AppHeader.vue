<template>
  <header class="glass sticky top-0 z-40 shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo 和標題 -->
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            多功能整合儀表板
          </h1>
        </div>

        <!-- 右側工具列 -->
        <div class="flex items-center space-x-4">
          <!-- 同步狀態 -->
          <div id="sync-status" class="flex items-center text-sm">
            <i
              :class="[
                'fas mr-2',
                isConnected ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'
              ]"
            ></i>
            <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
              {{ syncStatus }}
            </span>
          </div>

          <!-- 主題切換按鈕 -->
          <button
            @click="themeStore.toggleDarkMode()"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="切換深色模式"
          >
            <i :class="['fas', isDarkMode ? 'fa-sun' : 'fa-moon']"></i>
          </button>

          <!-- 顏色主題選擇器 -->
          <div class="relative" ref="colorThemeDropdown">
            <button
              @click="showColorThemes = !showColorThemes"
              class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="選擇顏色主題"
            >
              <i class="fas fa-palette"></i>
            </button>

            <!-- 顏色主題下拉選單 -->
            <div
              v-show="showColorThemes"
              class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 min-w-[200px]"
            >
              <p class="text-xs text-gray-500 mb-2">選擇主題顏色</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="(theme, key) in themeStore.themeColors"
                  :key="key"
                  @click="selectTheme(key)"
                  :class="[
                    'flex flex-col items-center p-2 rounded-lg transition',
                    currentTheme === key ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                >
                  <div
                    class="w-8 h-8 rounded-full mb-1"
                    :style="{ backgroundColor: theme.primary }"
                  ></div>
                  <span class="text-xs">{{ theme.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 導航標籤 -->
      <nav class="mt-4 flex space-x-2 overflow-x-auto">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="dashboard-tab whitespace-nowrap"
          active-class="active"
        >
          <i :class="['fas', route.icon, 'mr-2']"></i>
          {{ route.name }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { useFirebase } from '@/composables/useFirebase'

const themeStore = useThemeStore()
const { isDarkMode, currentTheme } = storeToRefs(themeStore)
const { isConnected, syncStatus } = useFirebase()

const showColorThemes = ref(false)
const colorThemeDropdown = ref(null)

const navRoutes = [
  { path: '/', name: '首頁', icon: 'fa-home' },
  { path: '/projects', name: 'AI 專案', icon: 'fa-project-diagram' },
  { path: '/tasks', name: '例行任務', icon: 'fa-tasks' },
  { path: '/sharing', name: '分享會', icon: 'fa-users' },
  { path: '/events', name: '活動參與', icon: 'fa-calendar' },
  { path: '/contacts', name: '企業接洽', icon: 'fa-briefcase' }
]

const selectTheme = (theme) => {
  themeStore.setColorTheme(theme)
  showColorThemes.value = false
}

// 點擊外部關閉下拉選單
const handleClickOutside = (event) => {
  if (colorThemeDropdown.value && !colorThemeDropdown.value.contains(event.target)) {
    showColorThemes.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dashboard-tab {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-secondary);
}

.dashboard-tab:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.dashboard-tab.active {
  color: var(--theme-primary);
  border-bottom-color: var(--theme-primary);
  font-weight: 600;
}
</style>
