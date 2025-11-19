<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-yellow-500 h-full flex flex-col">
    <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
      <h3 class="text-lg font-bold text-yellow-800 flex items-center">
        <span class="bg-yellow-200 text-yellow-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </span>
        活動接洽
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-gray-50">
      <div class="space-y-3">
        <div v-for="item in items" :key="item.id" class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition duration-200">
          <div>
            <div class="font-bold text-gray-800">{{ item.name }}</div>
            <div class="text-sm text-gray-500 flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ item.contact }}
            </div>
          </div>
          <div>
            <span :class="{'bg-green-100 text-green-700 border-green-200': item.status === '已完成', 'bg-yellow-100 text-yellow-700 border-yellow-200': item.status === '接洽中', 'bg-red-100 text-red-700 border-red-200': item.status === '失敗'}" class="px-3 py-1 rounded-full text-xs font-bold border">
              {{ item.status }}
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
  data() {
    return { items: [] }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "coordination"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
</script>
