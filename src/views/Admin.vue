<template>
  <div class="min-h-screen bg-gray-50 font-sans flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg fixed h-full z-10 hidden md:flex flex-col transition-all duration-300">
      <div class="p-6 border-b border-gray-100 flex items-center justify-center">
        <h1 class="text-2xl font-bold text-primary-600 flex items-center">
          <span class="bg-primary-100 p-2 rounded-lg mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </span>
          Admin
        </h1>
      </div>
      
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id"
          :class="['w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium', activeTab === tab.id ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']"
        >
          <span class="mr-3" v-html="tab.icon"></span>
          {{ tab.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <router-link to="/" class="flex items-center px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          返回首頁
        </router-link>
        <button @click="logout" class="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          登出
        </button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <div class="md:hidden fixed w-full bg-white z-20 shadow-sm px-4 py-3 flex justify-between items-center">
      <h1 class="text-lg font-bold text-gray-800">管理後台</h1>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-600 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" @click="mobileMenuOpen = false"></div>
    <div :class="['fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h1 class="text-xl font-bold text-primary-600">Admin</h1>
        <button @click="mobileMenuOpen = false" class="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="p-4 space-y-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id; mobileMenuOpen = false"
          :class="['w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium', activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50']"
        >
          <span class="mr-3" v-html="tab.icon"></span>
          {{ tab.name }}
        </button>
        <div class="border-t border-gray-100 my-2 pt-2">
          <router-link to="/" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">返回首頁</router-link>
          <button @click="logout" class="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl">登出</button>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 p-6 pt-20 md:pt-6 transition-all duration-300">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-bold text-gray-800">{{ currentTabName }}</h2>
            <p class="text-gray-500 mt-1">管理您的{{ currentTabName }}資料</p>
          </div>
          <div class="hidden md:block text-sm text-gray-400">
            {{ currentDate }}
          </div>
        </div>

        <!-- Dynamic Content -->
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
import AdminDashboardHome from '../components/AdminDashboardHome.vue'
import AdminProjectList from '../components/AdminProjectList.vue'
import AdminRoutineList from '../components/AdminRoutineList.vue'
import AdminForumList from '../components/AdminForumList.vue'
import AdminEventList from '../components/AdminEventList.vue'
import AdminCoordinationList from '../components/AdminCoordinationList.vue'
import { auth } from '../firebase'
import { signOut } from "firebase/auth";

export default {
  name: 'AdminView',
  components: {
    AdminDashboardHome,
    AdminProjectList,
    AdminRoutineList,
    AdminForumList,
    AdminEventList,
    AdminCoordinationList
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
    async logout() {
      try {
        await signOut(auth);
        this.$router.push('/login');
      } catch (error) {
        console.error("Logout failed", error);
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
