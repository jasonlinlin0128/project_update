<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-purple-500">
    <div class="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-purple-800 flex items-center">
        <span class="bg-purple-200 text-purple-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </span>
        專案進度追蹤
      </h3>
      <span class="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full">
        {{ projects.length }} 個進行中
      </span>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th class="py-4 px-6 font-semibold">專案名稱</th>
            <th class="py-4 px-6 font-semibold">負責部門</th>
            <th class="py-4 px-6 font-semibold">時程</th>
            <th class="py-4 px-6 font-semibold">優先級</th>
            <th class="py-4 px-6 font-semibold w-1/4">進度</th>
            <th class="py-4 px-6 font-semibold">狀態</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm">
          <tr v-for="p in projects" :key="p.id" class="border-b border-gray-100 hover:bg-purple-50 transition duration-150">
            <td class="py-4 px-6 font-bold text-gray-800">{{ p.name }}</td>
            <td class="py-4 px-6">
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
  </div>
</template>
<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";
export default {
  data(){ return { projects:[] }},
  async mounted(){
    const querySnapshot = await getDocs(collection(db, "projects"));
    this.projects = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }
}
</script>
