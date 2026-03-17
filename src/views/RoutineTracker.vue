<template>
  <div class="min-h-screen bg-gray-50 relative">
    <!-- Tab content -->
    <RoutineTodayTab v-if="activeTab === 'today'" />
    <RoutineCalendarTab v-else-if="activeTab === 'calendar'" />

    <!-- Management tab -->
    <div v-else-if="activeTab === 'manage'" class="pb-24">
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 pt-6 pb-8 text-white">
        <div class="text-2xl font-bold">管理例行公事</div>
        <div class="text-sm opacity-75 mt-1">在後台新增、編輯項目</div>
      </div>
      <div class="mx-4 -mt-4 bg-white rounded-2xl shadow-sm p-6 text-center">
        <div class="text-5xl mb-4">⚙️</div>
        <p class="text-gray-600 mb-6">例行公事的新增與管理在管理後台進行</p>
        <router-link
          to="/login"
          class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          前往管理後台
        </router-link>
      </div>

      <!-- Notification setup -->
      <div class="mx-4 mt-3 bg-white rounded-2xl shadow-sm p-4">
        <div class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔔</span> 推播通知設定
        </div>
        <div v-if="notifStatus === 'granted'" class="text-sm text-green-600">
          ✅ 推播通知已啟用
        </div>
        <div v-else-if="notifStatus === 'denied'" class="text-sm text-red-500">
          ❌ 通知已被封鎖，請到 iPhone 設定 → Safari → 通知 手動開啟
        </div>
        <div v-else class="flex flex-col gap-2">
          <p class="text-sm text-gray-500">開啟後，到達任務時間前 5 分鐘會收到提醒</p>
          <button
            @click="requestNotification"
            class="bg-indigo-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            開啟推播通知
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-area-bottom">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 flex flex-col items-center py-2 pt-3 text-xs transition-colors"
        :class="activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'"
      >
        <span class="text-xl mb-0.5">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<script>
import RoutineTodayTab from '../components/RoutineTodayTab.vue'
import RoutineCalendarTab from '../components/RoutineCalendarTab.vue'

export default {
  name: 'RoutineTracker',
  components: { RoutineTodayTab, RoutineCalendarTab },
  data() {
    return {
      activeTab: 'today',
      notifStatus: Notification.permission,
      tabs: [
        { id: 'today', icon: '🏠', label: '今日' },
        { id: 'calendar', icon: '📅', label: '月曆' },
        { id: 'manage', icon: '⚙️', label: '管理' }
      ]
    }
  },
  methods: {
    async requestNotification() {
      const result = await Notification.requestPermission()
      this.notifStatus = result
      if (result === 'granted') {
        this.scheduleNotifications()
      }
    },
    scheduleNotifications() {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_ROUTINE_NOTIFICATIONS'
        })
      }
    }
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
