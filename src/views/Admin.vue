<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    <!-- Sidebar (Desktop) -->
    <AdminSidebar
      :active-tab="activeTab"
      :tabs="tabs"
      @change-tab="handleTabChange"
      @logout="logout"
      class="hidden md:flex"
    />

    <!-- Mobile Header -->
    <div class="md:hidden fixed w-full bg-[#2B2D2E] z-20 shadow-sm px-4 py-3 flex justify-between items-center text-white">
      <h1 class="text-lg font-bold">Jason's Workspace</h1>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-300 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" @click="mobileMenuOpen = false"></div>
    <div :class="['fixed inset-y-0 left-0 z-40 w-64 bg-[#2B2D2E] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
      <AdminSidebar :activeTab="activeTab" :tabs="tabs" @change-tab="handleTabChange($event); mobileMenuOpen = false" @logout="logout" />
    </div>

    <!-- Main Content -->
    <main class="flex-1 md:ml-0 p-0 transition-all duration-300 flex flex-col h-screen overflow-hidden">
      <!-- Top Bar (Breadcrumbs & Actions) -->
      <header class="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
        <span class="font-medium text-gray-800">{{ currentTabName }}</span>
        <div class="flex items-center space-x-4">
          <GlobalSearch @select="handleSearchSelect" class="hidden md:block" />
          <ThemeToggle />
          <button class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
            J
          </div>
        </div>
      </header>

      <!-- View Tabs (List, Board, etc.) -->
      <div class="h-12 border-b border-gray-200 flex items-center px-6 bg-white shrink-0 space-x-6">
        <button class="flex items-center h-full border-b-2 border-blue-500 text-blue-600 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'
import AdminDashboardHome from '../components/AdminDashboardHome.vue'
import AdminProjectList from '../components/AdminProjectList.vue'
import AdminRoutineList from '../components/AdminRoutineList.vue'
import AdminForumList from '../components/AdminForumList.vue'
import AdminEventList from '../components/AdminEventList.vue'
import AdminCoordinationList from '../components/AdminCoordinationList.vue'
import AdminMeetingList from '../components/AdminMeetingList.vue'
import AdminNotificationSettings from '../components/AdminNotificationSettings.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import GlobalSearch from '../components/GlobalSearch.vue'
import { auth } from '../firebase'
import { signOut } from "firebase/auth";

export default {
  name: 'AdminView',
  components: {
    AdminSidebar,
    AdminDashboardHome,
    AdminProjectList,
    AdminRoutineList,
    AdminForumList,
    AdminEventList,
    AdminCoordinationList,
    AdminMeetingList,
    AdminNotificationSettings,
    ThemeToggle,
    GlobalSearch
  },
  data() {
    return {
      activeTab: 'dashboard',
      mobileMenuOpen: false,
      tabs: [
        { 
          id: 'dashboard', 
          name: '儀表板總覽', 
          component: 'AdminDashboardHome',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>'
        },
        { 
          id: 'projects', 
          name: '專案進度', 
          component: 'AdminProjectList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>'
        },
        { 
          id: 'routines', 
          name: '例行公事', 
          component: 'AdminRoutineList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        },
        { 
          id: 'forums', 
          name: '論壇/分享會', 
          component: 'AdminForumList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>'
        },
        { 
          id: 'events', 
          name: '活動參與', 
          component: 'AdminEventList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>'
        },
        { 
          id: 'coordination', 
          name: '活動接洽', 
          component: 'AdminCoordinationList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>'
        },
        { 
          id: 'meetings', 
          name: '內部會議', 
          component: 'AdminMeetingList',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
        },
        { 
          id: 'notifications', 
          name: '通知設定', 
          component: 'AdminNotificationSettings',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>'
        }
      ]
    }
  },
  computed: {
    activeComponent() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.component : null;
    },
    currentTabName() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.name : '';
    },
    currentDate() {
      return new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  },
  methods: {
    handleTabChange(tabId) {
      if (tabId === 'routines') {
        this.$router.push('/routines')
      } else {
        this.activeTab = tabId
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.$router.push('/login');
      } catch (error) {
        console.error("Logout failed", error);
      }
    },
    handleSearchSelect({ type }) {
      // Navigate to the appropriate tab based on search result type
      const tabMap = {
        projects: 'projects',
        routines: 'routines',
        forums: 'forums',
        events: 'events',
        coordination: 'coordination'
      };
      if (tabMap[type]) {
        this.activeTab = tabMap[type];
      }
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
