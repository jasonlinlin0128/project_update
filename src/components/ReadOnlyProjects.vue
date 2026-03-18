<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100">
      <h2 class="text-lg font-bold text-gray-800 flex items-center">
        <span class="text-2xl mr-2">📊</span> 專案進度總覽
      </h2>
      <p class="text-sm text-gray-500 mt-1">點擊專案名稱查看詳細資訊</p>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
            <th class="py-4 px-6">專案名稱</th>
            <th class="py-4 px-6">提案單位</th>
            <th class="py-4 px-6">負責部門</th>
            <th class="py-4 px-6">負責人</th>
            <th class="py-4 px-6">進度</th>
            <th class="py-4 px-6">狀態</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="p in projects" :key="p.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" @click="viewProject(p)">
            <td class="py-4 px-6 font-medium text-blue-600 hover:text-blue-800 hover:underline">{{ p.name }}</td>
            <td class="py-4 px-6">{{ p.proposerUnit || '-' }}</td>
            <td class="py-4 px-6">{{ p.department || '-' }}</td>
            <td class="py-4 px-6">{{ p.owner || '-' }}</td>
            <td class="py-4 px-6">
              <div class="flex items-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: p.progress + '%' }"></div>
                </div>
                <span class="text-xs font-medium">{{ p.progress }}%</span>
              </div>
            </td>
            <td class="py-4 px-6">
              <span :class="getStatusClass(p.status)" class="py-1 px-3 rounded-full text-xs font-bold inline-block min-w-[60px] text-center">
                {{ p.status }}
              </span>
            </td>
          </tr>
          <tr v-if="projects.length === 0">
            <td colspan="6" class="py-8 text-center text-gray-400">
              暫無專案資料
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Project Detail Modal -->
    <ProjectDetailModal 
      v-if="showModal" 
      :project="selectedProject" 
      @close="showModal = false" 
    />
  </div>
</template>

<script>
import ProjectDetailModal from './ProjectDetailModal.vue';

export default {
  name: 'ReadOnlyProjects',
  components: {
    ProjectDetailModal
  },
  props: {
    projects: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showModal: false,
      selectedProject: null
    }
  },
  methods: {
    getStatusClass(status) {
      const classes = {
        '規劃中': 'bg-blue-100 text-blue-700',
        '開發中': 'bg-yellow-100 text-yellow-700',
        '測試中': 'bg-purple-100 text-purple-700',
        '已完成': 'bg-green-100 text-green-700',
        '已終止': 'bg-gray-200 text-gray-700'
      };
      return classes[status] || 'bg-gray-100 text-gray-600';
    },
    viewProject(project) {
      this.selectedProject = project;
      this.showModal = true;
    }
  }
}
</script>
