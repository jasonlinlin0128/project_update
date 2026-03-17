<template>
  <div class="min-h-screen bg-gray-100 font-sans pb-12">
    <!-- Hero Section -->
    <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg mb-8">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
          公司專案動態儀表板
        </h1>
        <p class="text-lg text-indigo-100 max-w-2xl mx-auto">
          即時掌握專案進度、活動與團隊動態
        </p>
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/admin" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-1">
            進入管理後台
          </router-link>
          <div class="text-indigo-200 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最後更新：{{ lastUpdated }}
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="(stat, index) in stats" :key="index" class="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center space-x-3 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div class="p-3 rounded-xl" :class="stat.iconBg">
            <span class="text-2xl">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-500 font-medium">{{ stat.label }}</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Project Table Section (Full Width) -->
      <div class="mb-8 transform transition hover:scale-[1.01] duration-300">
        <ProjectTable/>
      </div>

      <!-- Grid Section (Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="transform transition hover:scale-[1.02] duration-300 relative">
          <RoutineList/>
          <router-link
            to="/routines"
            class="absolute top-4 right-4 text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 z-10 bg-blue-50 px-2 py-1 rounded-lg"
          >
            開啟追蹤器 →
          </router-link>
        </div>
        <div class="transform transition hover:scale-[1.02] duration-300">
          <MeetingList/>
        </div>
        <div class="transform transition hover:scale-[1.02] duration-300">
          <ForumList/>
        </div>
        <div class="transform transition hover:scale-[1.02] duration-300">
          <EventList/>
        </div>
        <div class="transform transition hover:scale-[1.02] duration-300">
          <CoordinationList/>
        </div>
      </div>

      <!-- Auto-refresh Indicator -->
      <div class="mt-8 text-center text-gray-400 text-sm flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        資料每 30 秒自動刷新
      </div>
    </main>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import ProjectTable from '../components/ProjectTable.vue'
import RoutineList from '../components/RoutineList.vue'
import MeetingList from '../components/MeetingList.vue'
import ForumList from '../components/ForumList.vue'
import EventList from '../components/EventList.vue'
import CoordinationList from '../components/CoordinationList.vue'

export default {
  name: 'HomeView',
  components: {
    ProjectTable,
    RoutineList,
    MeetingList,
    ForumList,
    EventList,
    CoordinationList
  },
  data() {
    return {
      stats: [
        { label: '總專案數', value: 0, icon: '📊', iconBg: 'bg-blue-50' },
        { label: '開發中', value: 0, icon: '🟡', iconBg: 'bg-yellow-50' },
        { label: '已上線', value: 0, icon: '🟢', iconBg: 'bg-green-50' },
        { label: '需求確認中', value: 0, icon: '🔵', iconBg: 'bg-indigo-50' }
      ],
      lastUpdated: '',
      refreshInterval: null
    }
  },
  async mounted() {
    await this.fetchStats();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchStats();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async fetchStats() {
      try {
        const projectsSnap = await getDocs(collection(db, 'projects'));
        const projects = projectsSnap.docs.map(d => d.data());

        this.stats[0].value = projects.length;
        // 開發中
        this.stats[1].value = projects.filter(p => p.status === '開發中').length;
        // 已上線 (新) 或 已完成 (舊)
        this.stats[2].value = projects.filter(p => p.status === '已上線' || p.status === '已完成').length;
        // 需求確認中 (新) 或 規劃中 (舊)
        this.stats[3].value = projects.filter(p => p.status === '需求確認中' || p.status === '規劃中').length;

        this.lastUpdated = new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
  }
}
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

