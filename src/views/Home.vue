<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-500">載入資料中...</p>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">AI導入專案進度報告</h1>
              <p class="text-indigo-100 text-sm mt-1">即時掌握專案進度、活動與團隊動態</p>
            </div>
            <div class="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-sm font-medium">{{ lastUpdated }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Tab Navigation -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors'
              ]"
            >
              <span class="mr-2" v-html="tab.icon"></span>
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Dashboard Tab -->
        <ReadOnlyDashboard
          v-if="activeTab === 'dashboard'"
          :projects="projects"
          :routines="routines"
          :forums="forums"
          :events="events"
          :coordination="coordination"
        />

        <!-- Projects Tab -->
        <ReadOnlyProjects v-else-if="activeTab === 'projects'" :projects="projects" />

        <!-- Routines Tab -->
        <ReadOnlyList v-else-if="activeTab === 'routines'" :items="routines" title="例行公事" :columns="routineColumns" />

        <!-- Meetings Tab -->
        <ReadOnlyList v-else-if="activeTab === 'meetings'" :items="meetings" title="會議" :columns="meetingColumns" />

        <!-- Forums Tab -->
        <ReadOnlyList v-else-if="activeTab === 'forums'" :items="forums" title="論壇/分享會" :columns="forumColumns" />

        <!-- Events Tab -->
        <ReadOnlyList v-else-if="activeTab === 'events'" :items="events" title="活動參與" :columns="eventColumns" />

        <!-- Coordination Tab -->
        <ReadOnlyList v-else-if="activeTab === 'coordination'" :items="coordination" title="活動接洽" :columns="coordinationColumns" />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-100 border-t border-gray-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            資料每 30 秒自動刷新
          </div>
          <div class="flex items-center gap-3">
            <router-link to="/journal" class="text-green-600 hover:text-green-700 hover:underline font-medium flex items-center gap-1">
              <span>📓</span> 工作日誌
            </router-link>
            <router-link to="/admin" class="text-indigo-500 hover:text-indigo-700 hover:underline font-medium">
              管理登入
            </router-link>
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import ReadOnlyDashboard from '../components/ReadOnlyDashboard.vue'
import ReadOnlyProjects from '../components/ReadOnlyProjects.vue'
import ReadOnlyList from '../components/ReadOnlyList.vue'

export default {
  name: 'HomeView',
  components: {
    ReadOnlyDashboard,
    ReadOnlyProjects,
    ReadOnlyList
  },
  data() {
    return {
      isLoading: true,
      activeTab: 'dashboard',
      lastUpdated: '',
      projects: [],
      routines: [],
      meetings: [],
      forums: [],
      events: [],
      coordination: [],
      refreshInterval: null,
      tabs: [
        { id: 'dashboard', name: '總覽', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>' },
        { id: 'projects', name: '專案進度', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>' },
        { id: 'routines', name: '例行公事', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' },
        { id: 'meetings', name: '會議', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' },
        { id: 'forums', name: '論壇/分享會', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' },
        { id: 'events', name: '活動參與', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>' },
        { id: 'coordination', name: '活動接洽', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>' }
      ],
      routineColumns: [
        { key: 'title', label: '標題' },
        { key: 'frequency', label: '頻率' },
        { key: 'assignee', label: '負責人' },
        { key: 'status', label: '狀態', type: 'status' }
      ],
      meetingColumns: [
        { key: 'title', label: '會議名稱' },
        { key: 'date', label: '日期' },
        { key: 'location', label: '地點' },
        { key: 'status', label: '狀態', type: 'status' }
      ],
      forumColumns: [
        { key: 'name', label: '名稱' },
        { key: 'date', label: '日期' },
        { key: 'role', label: '角色' }
      ],
      eventColumns: [
        { key: 'name', label: '活動名稱' },
        { key: 'date', label: '日期' },
        { key: 'location', label: '地點' }
      ],
      coordinationColumns: [
        { key: 'name', label: '名稱' },
        { key: 'contact', label: '聯絡人' },
        { key: 'status', label: '狀態', type: 'status' }
      ]
    }
  },
  async mounted() {
    await this.loadAllData();
    this.isLoading = false;
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadAllData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadAllData() {
      try {
        const [projectsSnap, routinesSnap, meetingsSnap, forumsSnap, eventsSnap, coordinationSnap] = await Promise.all([
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'routines')),
          getDocs(collection(db, 'meetings')),
          getDocs(collection(db, 'forums')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'coordination'))
        ]);

        this.projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.routines = routinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.meetings = meetingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.forums = forumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.coordination = coordinationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        this.lastUpdated = new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error loading data:', error);
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
