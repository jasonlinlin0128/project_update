<template>
  <div class="card h-full flex flex-col overflow-hidden border-t-4 border-accent-purple hover:shadow-lg transition-shadow duration-300">
    <div class="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-purple-800 flex items-center">
        <span class="bg-purple-200 text-purple-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </span>
        Forums
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-white">
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.id" class="group relative bg-white p-4 rounded-xl border border-gray-100 hover:border-accent-purple hover:shadow-md transition-all duration-300">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-accent-purple rounded-l-xl transition-colors duration-300"></div>
          <div class="pl-3">
            <div class="text-xs font-bold text-accent-purple uppercase tracking-wider mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Topic</div>
            <h4 class="text-gray-800 font-bold text-lg mb-2 group-hover:text-accent-purple transition-colors">{{ item.topic }}</h4>
            <div class="flex items-center text-sm text-gray-500">
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
