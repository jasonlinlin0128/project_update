<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800">管理後台</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">返回首頁</router-link>
            <button @click="logout" class="text-red-600 hover:text-red-900 px-3 py-2 rounded-md text-sm font-medium">登出</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <AdminProjectList />
        <AdminRoutineList />
        <AdminForumList />
        <AdminEventList />
        <AdminCoordinationList />
      </div>
    </main>
  </div>
</template>

<script>
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
    AdminProjectList,
    AdminRoutineList,
    AdminForumList,
    AdminEventList,
    AdminCoordinationList
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
.admin-dashboard {
  padding: 20px;
}
</style>
