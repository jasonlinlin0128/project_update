<template>
  <div class="space-y-8">
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex items-center space-x-3 border border-gray-100">
        <div class="p-3 rounded-xl" :class="stat.iconBg">
          <span class="text-2xl">{{ stat.icon }}</span>
        </div>
        <div>
          <p class="text-xs md:text-sm text-gray-500 font-medium">{{ stat.label }}</p>
          <p class="text-xl md:text-2xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Alert Section: Risk & Upcoming -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div class="text-xs text-red-600 mt-1">{{ p.riskReason }}</div>
            </div>
            <span class="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">{{ p.status }}</span>
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
              <div class="text-xs text-yellow-700 mt-1">{{ formatDateRange(p) }} • {{ p.owner || '未指派' }}</div>
            </div>
            <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">剩 {{ p.daysLeft }} 天</span>
          </div>
          <div v-if="upcomingProjects.length === 0" class="text-center py-6 text-gray-400 text-sm">
            <span class="text-4xl">📭</span>
            <p class="mt-2">7 天內沒有到期專案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recently Completed & Workload -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div class="text-xs text-green-700 mt-1">{{ p.department || '未分類' }} • {{ p.owner || '未指派' }}</div>
            </div>
            <span class="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">✓ 完成</span>
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
                <div class="h-4 rounded-full transition-all duration-500" :class="getWorkloadColor(index)" :style="{ width: dept.percentage + '%' }"></div>
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

    <!-- Project Status Distribution -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span class="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
        專案狀態分佈
      </h3>
      <div class="flex flex-wrap gap-4">
        <div v-for="(count, status) in statusCounts" :key="status" class="flex items-center bg-gray-50 rounded-lg px-4 py-3">
          <span :class="getStatusBadgeClass(status)" class="w-3 h-3 rounded-full mr-2"></span>
          <span class="text-sm text-gray-600 mr-2">{{ status }}</span>
          <span class="text-lg font-bold text-gray-800">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReadOnlyDashboard',
  props: {
    projects: { type: Array, default: () => [] },
    routines: { type: Array, default: () => [] },
    forums: { type: Array, default: () => [] },
    events: { type: Array, default: () => [] },
    coordination: { type: Array, default: () => [] }
  },
  computed: {
    stats() {
      const completed = this.projects.filter(p => p.status === '已完成' || p.progress === 100).length;
      const active = this.projects.filter(p => p.status !== '已完成' && p.status !== '已終止').length;
      return [
        { label: '總專案數', value: this.projects.length, icon: '📊', iconBg: 'bg-blue-50' },
        { label: '進行中', value: active, icon: '🚀', iconBg: 'bg-yellow-50' },
        { label: '已完成', value: completed, icon: '✅', iconBg: 'bg-green-50' },
        { label: '需關注', value: this.overdueProjects.length, icon: '⚠️', iconBg: 'bg-red-50' }
      ];
    },
    
    statusCounts() {
      const counts = {};
      this.projects.forEach(p => {
        const status = p.status || '規劃中';
        counts[status] = (counts[status] || 0) + 1;
      });
      return counts;
    },
    
    overdueProjects() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.projects
        .filter(p => p.status !== '已完成' && p.status !== '已終止')
        .map(p => {
          let riskReason = null;
          
          if (p.dueDate) {
            const due = new Date(p.dueDate);
            if (due < today) {
              riskReason = `已逾期 ${Math.floor((today - due) / (1000 * 60 * 60 * 24))} 天`;
            }
          }
          
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
    
    upcomingProjects() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
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
    
    recentlyCompleted() {
      return this.projects.filter(p => p.status === '已完成' || p.progress === 100);
    },
    
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
      return sorted.map(d => ({ ...d, percentage: (d.count / maxCount) * 100 }));
    }
  },
  methods: {
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
    
    getStatusBadgeClass(status) {
      const classes = {
        '規劃中': 'bg-blue-500',
        '開發中': 'bg-yellow-500',
        '測試中': 'bg-purple-500',
        '已完成': 'bg-green-500',
        '已終止': 'bg-gray-500'
      };
      return classes[status] || 'bg-gray-400';
    }
  }
}
</script>
