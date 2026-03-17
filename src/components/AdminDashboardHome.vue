<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border-l-4" :class="stat.borderColor">
        <div class="p-3 rounded-lg" :class="stat.iconBg">
          <span class="text-2xl" v-html="stat.icon"></span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Project Status Chart -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">專案狀態分佈</h3>
        <div class="h-64 relative">
          <Pie v-if="projectChartData" :data="projectChartData" :options="chartOptions" />
          <div v-else class="flex items-center justify-center h-full text-gray-400">Loading...</div>
        </div>
      </div>

      <!-- Overview Bar Chart -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">各項事務統計</h3>
        <div class="h-64 relative">
          <Bar v-if="overviewChartData" :data="overviewChartData" :options="chartOptions" />
          <div v-else class="flex items-center justify-center h-full text-gray-400">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'AdminDashboardHome',
  components: {
    Pie,
    Bar
  },
  data() {
    return {
      stats: [
        { label: '總專案數', value: 0, icon: '📊', borderColor: 'border-blue-500', iconBg: 'bg-blue-100' },
        { label: '例行公事', value: 0, icon: '📝', borderColor: 'border-orange-500', iconBg: 'bg-orange-100' },
        { label: '論壇文章', value: 0, icon: '💬', borderColor: 'border-purple-500', iconBg: 'bg-purple-100' },
        { label: '活動參與', value: 0, icon: '📅', borderColor: 'border-pink-500', iconBg: 'bg-pink-100' }
      ],
      projectChartData: null,
      overviewChartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        // Fetch Projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'))
        const projects = projectsSnapshot.docs.map(doc => doc.data())
        const completedProjects = projects.filter(p => p.progress === 100).length
        const activeProjects = projects.length - completedProjects

        // Fetch Routines
        const routinesSnapshot = await getDocs(collection(db, 'routines'))
        
        // Fetch Forums
        const forumsSnapshot = await getDocs(collection(db, 'forums'))

        // Fetch Events
        const eventsSnapshot = await getDocs(collection(db, 'events'))

        // Update Stats
        this.stats[0].value = projects.length
        this.stats[1].value = routinesSnapshot.size
        this.stats[2].value = forumsSnapshot.size
        this.stats[3].value = eventsSnapshot.size

        // Update Project Chart
        this.projectChartData = {
          labels: ['進行中', '已完成'],
          datasets: [{
            backgroundColor: ['#3B82F6', '#10B981'],
            data: [activeProjects, completedProjects]
          }]
        }

        // Update Overview Chart
        this.overviewChartData = {
          labels: ['專案', '例行', '論壇', '活動'],
          datasets: [{
            label: '數量',
            backgroundColor: ['#3B82F6', '#F97316', '#8B5CF6', '#EC4899'],
            data: [projects.length, routinesSnapshot.size, forumsSnapshot.size, eventsSnapshot.size]
          }]
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
  }
}
</script>
