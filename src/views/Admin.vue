<template>
  <div class="min-h-screen bg-gray-50 font-sans flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg hidden md:block fixed h-full z-10">
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-2xl font-extrabold text-primary-600 tracking-tight">Admin Panel</h1>
      </div>
      <nav class="mt-6 px-4 space-y-2">
        <a href="#projects" class="flex items-center px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors duration-200">
          <span class="font-medium">Projects</span>
        </a>
        <a href="#routines" class="flex items-center px-4 py-3 text-gray-600 hover:bg-secondary-50 hover:text-secondary-600 rounded-lg transition-colors duration-200">
          <span class="font-medium">Routines</span>
        </a>
        <a href="#forums" class="flex items-center px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-accent-purple rounded-lg transition-colors duration-200">
          <span class="font-medium">Forums</span>
        </a>
        <div class="pt-6 mt-6 border-t border-gray-100">
          <router-link to="/" class="flex items-center px-4 py-3 text-gray-500 hover:text-gray-800 transition-colors duration-200">
            <span class="font-medium">Back to Home</span>
          </router-link>
          <button @click="logout" class="w-full text-left flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 p-8">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
          <p class="text-gray-500 mt-1">Welcome back, Admin.</p>
        </div>
        <div class="md:hidden">
          <!-- Mobile menu button placeholder -->
          <button class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </header>

      <div class="space-y-12">
        <section id="projects" class="scroll-mt-8">
          <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-primary-500 rounded-full mr-3"></div>
            <h3 class="text-2xl font-bold text-gray-800">Projects</h3>
          </div>
          <AdminProjectList />
        </section>

        <section id="routines" class="scroll-mt-8">
          <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-secondary-500 rounded-full mr-3"></div>
            <h3 class="text-2xl font-bold text-gray-800">Routines</h3>
          </div>
          <AdminRoutineList />
        </section>

        <section id="forums" class="scroll-mt-8">
          <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-accent-purple rounded-full mr-3"></div>
            <h3 class="text-2xl font-bold text-gray-800">Forums</h3>
          </div>
          <AdminForumList />
        </section>

        <section id="events" class="scroll-mt-8">
           <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-accent-pink rounded-full mr-3"></div>
            <h3 class="text-2xl font-bold text-gray-800">Events</h3>
          </div>
          <AdminEventList />
        </section>

        <section id="coordination" class="scroll-mt-8">
           <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-accent-yellow rounded-full mr-3"></div>
            <h3 class="text-2xl font-bold text-gray-800">Coordination</h3>
          </div>
          <AdminCoordinationList />
        </section>
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
