<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-2xl font-bold text-gray-800 flex items-center">
        <span class="bg-primary-100 text-primary-600 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          </svg>
        </span>
        Projects
      </h3>
      <span class="bg-primary-100 text-primary-700 px-4 py-1 rounded-full text-sm font-medium">
        {{ projects.length }} Active
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="p in projects" :key="p.id" class="card p-6 hover:border-primary-400 group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-1" :title="p.name">{{ p.name }}</h4>
            <span :class="{'text-red-600 bg-red-50': p.priority === '高', 'text-yellow-600 bg-yellow-50': p.priority === '中', 'text-green-600 bg-green-50': p.priority === '低'}" class="px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
              {{ p.priority }}
            </span>
          </div>
          
          <p class="text-sm text-gray-500 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ p.department }}
          </p>

          <div class="mb-5">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span class="font-bold text-primary-600">{{ p.progress }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-500 shadow-sm" :style="{width: p.progress + '%'}"></div>
            </div>
          </div>

          <div class="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-4">
            <div class="flex items-center" title="Due Date">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
               <span>{{ p.dueDate }}</span>
            </div>
             <span :class="{'text-green-600 bg-green-50 px-2 py-0.5 rounded': p.status === '進行中', 'text-gray-500 bg-gray-50 px-2 py-0.5 rounded': p.status === '已完成', 'text-red-500 bg-red-50 px-2 py-0.5 rounded': p.status === '延遲'}" class="font-medium">
              {{ p.status }}
            </span>
          </div>
        </div>
      </div>
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
