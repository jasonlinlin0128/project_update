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
        <div class="mt-6">
          <router-link to="/admin" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-1">
            進入管理後台
          </router-link>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Project Table Section (Full Width) -->
      <div class="mb-8 transform transition hover:scale-[1.01] duration-300">
        <ProjectTable/>
      </div>

      <!-- Grid Section (Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="transform transition hover:scale-[1.02] duration-300">
          <RoutineList/>
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
    </main>
  </div>
</template>

<script>
import ProjectTable from '../components/ProjectTable.vue'
import RoutineList from '../components/RoutineList.vue'
import ForumList from '../components/ForumList.vue'
import EventList from '../components/EventList.vue'
import CoordinationList from '../components/CoordinationList.vue'

export default {
  name: 'HomeView',
  components: {
    ProjectTable,
    RoutineList,
    ForumList,
    EventList,
    CoordinationList
  }
}
</script>
