<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-purple-500">
    <div class="bg-purple-50 px-6 py-4 border-b border-purple-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center w-full md:w-auto">
        <h3 class="text-lg font-bold text-purple-800 flex items-center whitespace-nowrap">
          <span class="bg-purple-200 text-purple-700 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </span>
          專案進度追蹤
        </h3>
      </div>
      
      <div class="flex items-center gap-2 w-full md:w-auto">
        <div class="relative flex-grow md:flex-grow-0">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input v-model="searchQuery" type="text" placeholder="搜尋專案..." class="pl-9 pr-4 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-48">
        </div>
        <select v-model="statusFilter" class="py-2 px-3 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-600">
          <option value="">所有狀態</option>
          <option value="進行中">進行中</option>
          <option value="已完成">已完成</option>
          <option value="延遲">延遲</option>
        </select>
        <span class="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-2 rounded-lg whitespace-nowrap">
          {{ filteredProjects.length }} 個
        </span>
      </div>
    </div>
    
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th class="py-4 px-6 font-semibold">專案名稱</th>
            <th class="py-4 px-6 font-semibold">負責人/部門</th>
            <th class="py-4 px-6 font-semibold">時程</th>
            <th class="py-4 px-6 font-semibold">優先級</th>
            <th class="py-4 px-6 font-semibold w-1/4">進度</th>
            <th class="py-4 px-6 font-semibold">狀態</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm">
          <tr v-for="p in filteredProjects" :key="p.id" class="border-b border-gray-100 hover:bg-purple-50 transition duration-150">
            <td class="py-4 px-6 font-bold text-gray-800">
              {{ p.name }}
              <div v-if="p.description" class="text-xs text-gray-400 font-normal mt-1">{{ p.description }}</div>
            </td>
            <td class="py-4 px-6">
              <div class="font-medium text-gray-700">{{ p.owner }}</div>
              <span class="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs">{{ p.department }}</span>
            </td>
            <td class="py-4 px-6 text-xs text-gray-500">
              <div>{{ p.startTime }}</div>
              <div>↓</div>
              <div>{{ p.dueDate }}</div>
            </td>
            <td class="py-4 px-6">
              <span :class="{'text-red-600 bg-red-100': p.priority === '高', 'text-yellow-600 bg-yellow-100': p.priority === '中', 'text-green-600 bg-green-100': p.priority === '低'}" class="px-2 py-1 rounded text-xs font-medium">
                {{ p.priority }}
              </span>
            </td>
            <td class="py-4 px-6">
              <div class="flex items-center">
                <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div class="bg-purple-600 h-2.5 rounded-full transition-all duration-500" :style="{width: p.progress + '%'}"></div>
                </div>
                <span class="text-xs font-bold text-purple-700">{{ p.progress }}%</span>
              </div>
            </td>
            <td class="py-4 px-6">
              <span :class="{'bg-green-100 text-green-700': p.status === '進行中', 'bg-gray-100 text-gray-600': p.status === '已完成', 'bg-yellow-100 text-yellow-700': p.status === '延遲'}" class="px-3 py-1 rounded-full text-xs font-bold border border-opacity-20" :style="{borderColor: 'currentColor'}">
                {{ p.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden p-4 space-y-4">
      <div v-for="p in filteredProjects" :key="p.id" class="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-gray-800 text-lg">{{ p.name }}</h4>
            <div v-if="p.description" class="text-xs text-gray-500 mt-1">{{ p.description }}</div>
          </div>
          <span :class="{'bg-green-100 text-green-700': p.status === '進行中', 'bg-gray-100 text-gray-600': p.status === '已完成', 'bg-yellow-100 text-yellow-700': p.status === '延遲'}" class="px-2 py-1 rounded text-xs font-bold">
            {{ p.status }}
          </span>
        </div>
        
        <div class="flex items-center text-sm text-gray-600 mb-3">
          <span class="bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">{{ p.department }}</span>
          <span v-if="p.owner" class="mr-2">👤 {{ p.owner }}</span>
          <span :class="{'text-red-600 bg-red-50': p.priority === '高', 'text-yellow-600 bg-yellow-50': p.priority === '中', 'text-green-600 bg-green-50': p.priority === '低'}" class="px-2 py-0.5 rounded text-xs font-medium">
            {{ p.priority }}
          </span>
        </div>

        <div class="mb-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>進度</span>
            <span class="font-bold text-purple-700">{{ p.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full transition-all duration-500" :style="{width: p.progress + '%'}"></div>
          </div>
        </div>

        <div class="flex justify-between text-xs text-gray-400 border-t pt-2">
          <div>開始: {{ p.startTime }}</div>
          <div>截止: {{ p.dueDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";
export default {
  data(){ return { 
    projects:[],
    searchQuery: '',
    statusFilter: ''
  }},
  computed: {
    filteredProjects() {
      return this.projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                              (p.owner && p.owner.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.department && p.department.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStatus = this.statusFilter ? p.status === this.statusFilter : true;
        return matchesSearch && matchesStatus;
      });
    }
  },
  async mounted(){
    const querySnapshot = await getDocs(collection(db, "projects"));
    this.projects = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }
}
</script>
