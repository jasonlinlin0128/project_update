<template>
  <div class="min-h-screen bg-gray-100 font-sans pb-12">
    <!-- Header (matches Home.vue style) -->
    <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg mb-8">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <!-- Back link -->
        <router-link to="/" class="inline-flex items-center gap-1 text-indigo-200 hover:text-white text-sm transition mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回儀表板
        </router-link>
        <h1 class="text-3xl font-extrabold tracking-tight mb-1">例行公事追蹤器</h1>
        <p class="text-indigo-200 text-sm">{{ todayLabel }}</p>
        <!-- Tab pills -->
        <div class="flex gap-2 mt-5 flex-wrap">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-5 py-2 rounded-full text-sm font-semibold transition"
            :class="activeTab === tab.id
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-indigo-200 hover:bg-white/20'"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <RoutineTodayTab v-if="activeTab === 'today'" />
      <RoutineCalendarTab v-else-if="activeTab === 'calendar'" />

      <!-- Management tab -->
      <div v-else-if="activeTab === 'manage'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Admin link card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div class="text-5xl mb-4">⚙️</div>
          <h2 class="text-lg font-bold text-gray-800 mb-2">管理例行公事</h2>
          <p class="text-gray-500 text-sm mb-6">新增、編輯、刪除例行公事項目請到管理後台</p>
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            前往管理後台
          </router-link>
        </div>

        <!-- Notification card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-indigo-50 rounded-xl">
              <span class="text-2xl">🔔</span>
            </div>
            <div>
              <h2 class="font-bold text-gray-800">推播通知</h2>
              <p class="text-xs text-gray-400">任務開始前 5 分鐘提醒</p>
            </div>
          </div>

          <div v-if="notifStatus === 'granted'" class="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            推播通知已啟用
          </div>

          <div v-else-if="notifStatus === 'denied'" class="text-sm text-red-500 bg-red-50 rounded-xl p-3">
            <p class="font-semibold mb-1">通知已被封鎖</p>
            <p class="text-xs">請到 iPhone 設定 → Safari → 通知 手動開啟</p>
          </div>

          <div v-else>
            <p class="text-sm text-gray-500 mb-4">開啟後，到達任務時間前 5 分鐘會收到提醒通知。<br>需先將本頁加入 iPhone 主畫面。</p>
            <button
              @click="requestNotification"
              class="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              開啟推播通知
            </button>
          </div>
        </div>
      </div>
    </main>
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
        { id: 'today', icon: '🗂️', label: '今日' },
        { id: 'calendar', icon: '📅', label: '月曆' },
        { id: 'manage', icon: '⚙️', label: '管理' }
      ]
    }
  },
  computed: {
    todayLabel() {
      return new Date().toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      })
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
