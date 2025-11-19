<template>
  <div class="card h-full flex flex-col overflow-hidden border-t-4 border-secondary-500 hover:shadow-lg transition-shadow duration-300">
    <div class="bg-secondary-50 px-6 py-4 border-b border-secondary-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-secondary-800 flex items-center">
        <span class="bg-secondary-200 text-secondary-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </span>
        Routines
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-white">
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.id" class="group flex items-center p-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-secondary-100">
          <div class="flex-shrink-0 mr-4">
            <div class="h-8 w-8 rounded-full bg-secondary-100 text-secondary-500 flex items-center justify-center group-hover:bg-secondary-500 group-hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <span class="text-gray-700 font-medium group-hover:text-secondary-700 transition-colors duration-200">{{ item.name }}</span>
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
