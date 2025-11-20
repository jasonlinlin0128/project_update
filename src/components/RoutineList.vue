<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-blue-500 h-full flex flex-col">
    <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
      <h3 class="text-lg font-bold text-blue-800 flex items-center">
        <span class="bg-blue-200 text-blue-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </span>
        例行公事
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-gray-50">
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.id" class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center hover:shadow-md transition duration-200 transform hover:-translate-y-0.5">
          <div class="flex-shrink-0 mr-3">
            <div class="h-6 w-6 rounded-full border-2 border-blue-400 flex items-center justify-center text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="flex-grow">
            <div class="text-gray-700 font-medium">{{ item.name || item.title }}</div>
            <div class="text-xs text-gray-500 flex items-center mt-1">
              <span class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded mr-2" v-if="item.frequency">{{ item.frequency }}</span>
              <span v-if="item.assignee">👤 {{ item.assignee }}</span>
            </div>
          </div>
          <span :class="{'text-green-600': item.status === '正常', 'text-yellow-600': item.status !== '正常'}" class="text-xs font-bold px-2 py-1 bg-gray-100 rounded">
            {{ item.status }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return { items: [] }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "routines"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
</script>
