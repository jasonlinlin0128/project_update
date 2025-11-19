<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-green-500 h-full flex flex-col">
    <div class="bg-green-50 px-6 py-4 border-b border-green-100">
      <h3 class="text-lg font-bold text-green-800 flex items-center">
        <span class="bg-green-200 text-green-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </span>
        參與論壇 / 分享會
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-gray-50">
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.id" class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-200 relative">
          <div class="absolute top-4 left-0 w-1 h-8 bg-green-400 rounded-r"></div>
          <div class="ml-2">
            <div class="text-xs text-green-600 font-bold mb-1 uppercase tracking-wide">Topic</div>
            <div class="text-gray-800 font-medium text-lg">{{ item.topic }}</div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ item.date }}
            </div>
          </div>
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
    const querySnapshot = await getDocs(collection(db, "forums"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
</script>
