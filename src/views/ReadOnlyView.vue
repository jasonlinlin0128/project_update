<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">載入中...</p>
      </div>
    </div>

    <!-- Invalid/Expired Token -->
    <div v-else-if="!isValid" class="min-h-screen flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">連結無效或已過期</h2>
        <p class="text-gray-500 mb-6">此 Magic Link 已失效，請聯繫管理員取得新連結。</p>
        <a href="/" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
          返回首頁
        </a>
      </div>
    </div>

    <!-- Valid Token: Show Dashboard -->
    <div v-else>
      <!-- Header -->
      <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">公司專案動態儀表板</h1>
              <p class="text-indigo-100 text-sm mt-1">唯讀模式 • {{ linkName }}</p>
            </div>
            <div class="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="text-sm font-medium">唯讀檢視</span>
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

        <!-- Forums Tab -->
        <ReadOnlyList v-else-if="activeTab === 'forums'" :items="forums" title="論壇/分享會" :columns="forumColumns" />

        <!-- Events Tab -->
        <ReadOnlyList v-else-if="activeTab === 'events'" :items="events" title="活動參與" :columns="eventColumns" />

        <!-- Coordination Tab -->
        <ReadOnlyList v-else-if="activeTab === 'coordination'" :items="coordination" title="活動接洽" :columns="coordinationColumns" />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-100 border-t border-gray-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          最後更新時間：{{ lastUpdated }} • 此連結為唯讀模式
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, query, where } from "firebase/firestore"
import ReadOnlyDashboard from '../components/ReadOnlyDashboard.vue'
import ReadOnlyProjects from '../components/ReadOnlyProjects.vue'
import ReadOnlyList from '../components/ReadOnlyList.vue'

export default {
  name: 'ReadOnlyView',
  components: {
    ReadOnlyDashboard,
    ReadOnlyProjects,
    ReadOnlyList
  },
  data() {
    return {
      isLoading: true,
      isValid: false,
      linkName: '',
      activeTab: 'dashboard',
      lastUpdated: '',
      projects: [],
      routines: [],
      forums: [],
      events: [],
      coordination: [],
      tabs: [
        { id: 'dashboard', name: '總覽', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>' },
        { id: 'projects', name: '專案進度', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>' },
        { id: 'routines', name: '例行公事', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' },
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
  async created() {
    await this.validateToken();
  },
  methods: {
    async validateToken() {
      const token = this.$route.params.token;
      
      try {
        // Check if token exists and is valid
        const q = query(collection(db, "magicLinks"), where("token", "==", token));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          this.isValid = false;
          this.isLoading = false;
          return;
        }

        const linkData = querySnapshot.docs[0].data();
        
        // Check expiration
        if (linkData.expiresAt) {
          const expiresDate = linkData.expiresAt.toDate ? linkData.expiresAt.toDate() : new Date(linkData.expiresAt);
          if (expiresDate < new Date()) {
            this.isValid = false;
            this.isLoading = false;
            return;
          }
        }

        this.isValid = true;
        this.linkName = linkData.name;

        // Load all data
        await this.loadAllData();
        
        this.lastUpdated = new Date().toLocaleString('zh-TW');
        this.isLoading = false;

      } catch (error) {
        console.error("Error validating token:", error);
        this.isValid = false;
        this.isLoading = false;
      }
    },
    async loadAllData() {
      try {
        // Fetch all collections in parallel
        const [projectsSnap, routinesSnap, forumsSnap, eventsSnap, coordinationSnap] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "routines")),
          getDocs(collection(db, "forums")),
          getDocs(collection(db, "events")),
          getDocs(collection(db, "coordination"))
        ]);

        this.projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.routines = routinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.forums = forumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.coordination = coordinationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }
}
</script>
