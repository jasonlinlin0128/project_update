<template>
  <div class="space-y-8">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white rounded-2xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="p-4 rounded-xl" :class="stat.iconBg">
          <span class="text-3xl" v-html="stat.icon"></span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium mb-1">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Alert Section: Risk & Upcoming -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Risk Warning -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-500">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">⚠️</span> 風險警示
          </h3>
          <span class="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">{{ overdueProjects.length }} 個需關注</span>
        </div>
        <div class="space-y-3">
          <div v-for="p in overdueProjects.slice(0, 5)" :key="p.id" class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ p.name }}</div>
              <div class="text-xs text-red-600 mt-1">
                {{ p.riskReason }}
              </div>
            </div>
            <span class="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">
              {{ p.status }}
            </span>
          </div>
          <div v-if="overdueProjects.length === 0" class="text-center py-6 text-gray-400 text-sm">
            <span class="text-4xl">✨</span>
            <p class="mt-2">太好了！目前沒有風險專案</p>
          </div>
        </div>
      </div>

      <!-- Upcoming Deadlines -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">📅</span> 即將到期 (7天內)
          </h3>
          <span class="text-xs font-medium bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">{{ upcomingProjects.length }} 個</span>
        </div>
        <div class="space-y-3">
          <div v-for="p in upcomingProjects.slice(0, 5)" :key="p.id" class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ p.name }}</div>
              <div class="text-xs text-yellow-700 mt-1">
                {{ formatDateRange(p) }} • {{ p.owner || '未指派' }}
              </div>
            </div>
            <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">
              剩 {{ p.daysLeft }} 天
            </span>
          </div>
          <div v-if="upcomingProjects.length === 0" class="text-center py-6 text-gray-400 text-sm">
            <span class="text-4xl">📭</span>
            <p class="mt-2">7 天內沒有到期專案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recently Completed & Workload -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recently Completed -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">🏆</span> 近期完成
          </h3>
          <span class="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">{{ recentlyCompleted.length }} 個</span>
        </div>
        <div class="space-y-3">
          <div v-for="p in recentlyCompleted.slice(0, 5)" :key="p.id" class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ p.name }}</div>
              <div class="text-xs text-green-700 mt-1">
                {{ p.department || '未分類' }} • {{ p.owner || '未指派' }}
              </div>
            </div>
            <span class="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">
              ✓ 完成
            </span>
          </div>
          <div v-if="recentlyCompleted.length === 0" class="text-center py-6 text-gray-400 text-sm">
            <p>近期沒有完成的專案</p>
          </div>
        </div>
      </div>

      <!-- Department Workload -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span class="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
          部門負責專案數
        </h3>
        <div class="space-y-3">
          <div v-for="(dept, index) in departmentWorkload" :key="index" class="flex items-center">
            <span class="w-24 text-sm text-gray-600 truncate">{{ dept.name || '未分類' }}</span>
            <div class="flex-1 mx-3">
              <div class="bg-gray-100 rounded-full h-4 overflow-hidden">
                <div class="h-4 rounded-full transition-all duration-500" 
                     :class="getWorkloadColor(index)"
                     :style="{ width: dept.percentage + '%' }"></div>
              </div>
            </div>
            <span class="text-sm font-bold text-gray-700 w-8 text-right">{{ dept.count }}</span>
          </div>
          <div v-if="departmentWorkload.length === 0" class="text-center py-6 text-gray-400 text-sm">
            <p>暫無資料</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Project Status Chart -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          專案狀態分佈
        </h3>
        <div class="h-64 relative">
          <Pie v-if="projectChartData" :data="projectChartData" :options="chartOptions" />
          <div v-else class="flex items-center justify-center h-full text-gray-400">Loading...</div>
        </div>
      </div>

      <!-- Overview Bar Chart -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
          各項事務統計
        </h3>
        <div class="h-64 relative">
          <Bar v-if="overviewChartData" :data="overviewChartData" :options="chartOptions" />
          <div v-else class="flex items-center justify-center h-full text-gray-400">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Recent Items Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Routines -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">📝</span> 近期例行公事
          </h3>
          <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ routines.length }} 筆</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in routines.slice(0, 5)" :key="item.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
            <div>
              <div class="font-medium text-gray-800">{{ item.title }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.frequency }} • {{ item.assignee }}</div>
            </div>
            <span :class="item.status === '正常' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded-lg text-xs font-medium">
              {{ item.status }}
            </span>
          </div>
          <div v-if="routines.length === 0" class="text-center py-8 text-gray-400 text-sm">暫無資料</div>
        </div>
      </div>

      <!-- Recent Forums -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">💬</span> 近期論壇/分享會
          </h3>
          <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ forums.length }} 筆</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in forums.slice(0, 5)" :key="item.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
            <div>
              <div class="font-medium text-gray-800">{{ item.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.date }} • {{ item.role }}</div>
            </div>
          </div>
          <div v-if="forums.length === 0" class="text-center py-8 text-gray-400 text-sm">暫無資料</div>
        </div>
      </div>

      <!-- Recent Events -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">🎉</span> 近期活動參與
          </h3>
          <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ events.length }} 筆</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in events.slice(0, 5)" :key="item.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
            <div>
              <div class="font-medium text-gray-800">{{ item.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.date }} • {{ item.location }}</div>
            </div>
          </div>
          <div v-if="events.length === 0" class="text-center py-8 text-gray-400 text-sm">暫無資料</div>
        </div>
      </div>

      <!-- Recent Coordination -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">🤝</span> 近期活動接洽
          </h3>
          <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ coordination.length }} 筆</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in coordination.slice(0, 5)" :key="item.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
            <div>
              <div class="font-medium text-gray-800">{{ item.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.contact }}</div>
            </div>
            <span :class="getStatusClass(item.status)" class="px-2 py-1 rounded-lg text-xs font-medium">
              {{ item.status }}
            </span>
          </div>
          <div v-if="coordination.length === 0" class="text-center py-8 text-gray-400 text-sm">暫無資料</div>
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
        { label: '總專案數', value: 0, icon: '📊', iconBg: 'bg-blue-50 text-blue-600' },
        { label: '進行中', value: 0, icon: '🚀', iconBg: 'bg-yellow-50 text-yellow-600' },
        { label: '已完成', value: 0, icon: '✅', iconBg: 'bg-green-50 text-green-600' },
        { label: '需關注', value: 0, icon: '⚠️', iconBg: 'bg-red-50 text-red-600' }
      ],
      projects: [],
      routines: [],
      forums: [],
      events: [],
      coordination: [],
      projectChartData: null,
      overviewChartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    }
  },
  computed: {
    // 逾期或風險專案
    overdueProjects() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.projects
        .filter(p => p.status !== '已完成' && p.status !== '已終止')
        .map(p => {
          let riskReason = null;
          
          // 檢查是否逾期
          if (p.dueDate) {
            const due = new Date(p.dueDate);
            if (due < today) {
              riskReason = `已逾期 ${Math.floor((today - due) / (1000 * 60 * 60 * 24))} 天`;
            }
          }
          
          // 檢查進度落後
          if (!riskReason && p.startTime && p.dueDate && p.progress !== undefined) {
            const start = new Date(p.startTime);
            const due = new Date(p.dueDate);
            const totalDays = (due - start) / (1000 * 60 * 60 * 24);
            const elapsedDays = (today - start) / (1000 * 60 * 60 * 24);
            const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100);
            
            if (p.progress < expectedProgress - 20) {
              riskReason = `進度落後 (應 ${Math.round(expectedProgress)}%, 實 ${p.progress}%)`;
            }
          }
          
          return { ...p, riskReason };
        })
        .filter(p => p.riskReason);
    },
    
    // 7 天內到期
    upcomingProjects() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const in7Days = new Date(today);
      in7Days.setDate(in7Days.getDate() + 7);
      
      return this.projects
        .filter(p => p.status !== '已完成' && p.status !== '已終止' && p.dueDate)
        .map(p => {
          const due = new Date(p.dueDate);
          const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          return { ...p, daysLeft };
        })
        .filter(p => p.daysLeft > 0 && p.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft);
    },
    
    // 最近完成
    recentlyCompleted() {
      return this.projects.filter(p => p.status === '已完成' || p.progress === 100);
    },
    
    // 部門工作量
    departmentWorkload() {
      const deptCounts = {};
      this.projects
        .filter(p => p.status !== '已完成' && p.status !== '已終止')
        .forEach(p => {
          const dept = p.department || '未分類';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
      
      const sorted = Object.entries(deptCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      
      const maxCount = sorted.length > 0 ? sorted[0].count : 1;
      return sorted.map(d => ({
        ...d,
        percentage: (d.count / maxCount) * 100
      }));
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
        this.projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const completedProjects = this.projects.filter(p => p.status === '已完成' || p.progress === 100).length
        const activeProjects = this.projects.filter(p => p.status !== '已完成' && p.status !== '已終止').length

        // Fetch Routines
        const routinesSnapshot = await getDocs(collection(db, 'routines'))
        this.routines = routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Fetch Forums
        const forumsSnapshot = await getDocs(collection(db, 'forums'))
        this.forums = forumsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Fetch Events
        const eventsSnapshot = await getDocs(collection(db, 'events'))
        this.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Fetch Coordination
        const coordinationSnapshot = await getDocs(collection(db, 'coordination'))
        this.coordination = coordinationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Update Stats
        this.stats[0].value = this.projects.length
        this.stats[1].value = activeProjects
        this.stats[2].value = completedProjects
        this.stats[3].value = this.overdueProjects.length

        // Update Project Chart - by status
        const statusCounts = {};
        this.projects.forEach(p => {
          const status = p.status || '規劃中';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        this.projectChartData = {
          labels: Object.keys(statusCounts),
          datasets: [{
            backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#6B7280'],
            data: Object.values(statusCounts),
            borderWidth: 0
          }]
        }

        // Update Overview Chart
        this.overviewChartData = {
          labels: ['專案', '例行', '論壇', '活動', '接洽'],
          datasets: [{
            label: '數量',
            backgroundColor: ['#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#EAB308'],
            data: [this.projects.length, this.routines.length, this.forums.length, this.events.length, this.coordination.length],
            borderRadius: 6
          }]
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    },
    
    formatDateRange(project) {
      const start = project.startTime;
      const end = project.dueDate;
      
      if (start && end) {
        return `${this.formatDate(start)} → ${this.formatDate(end)}`;
      } else if (start) {
        return `${this.formatDate(start)} 起（進行中）`;
      } else if (end) {
        return `預計 ${this.formatDate(end)} 完成`;
      }
      return '時程待定';
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    },
    
    getWorkloadColor(index) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
      return colors[index % colors.length];
    },
    
    getStatusClass(status) {
      if (status === '接洽中') return 'bg-yellow-100 text-yellow-700';
      if (status === '已完成') return 'bg-green-100 text-green-700';
      if (status === '已接洽') return 'bg-blue-100 text-blue-700';
      return 'bg-gray-100 text-gray-600';
    }
  }
}
</script>
