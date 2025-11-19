<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-red-500 h-full flex flex-col">
    <div class="bg-red-50 px-6 py-4 border-b border-red-100">
      <h3 class="text-lg font-bold text-red-800 flex items-center">
        <span class="bg-red-200 text-red-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </span>
        活動參與
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-gray-50">
      <div class="space-y-4">
        <div v-for="item in items" :key="item.id" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200 group">
          <div class="flex">
            <div class="bg-red-100 text-red-600 p-3 flex flex-col items-center justify-center min-w-[80px]">
              <span class="text-xs font-bold uppercase">Date</span>
              <span class="text-sm font-bold">{{ item.date }}</span>
            </div>
            <div class="p-3 flex-grow">
              <h4 class="text-gray-800 font-bold group-hover:text-red-600 transition">{{ item.name }}</h4>
              <div class="text-sm text-gray-500 flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ item.location }}
              </div>
            </div>
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
    const querySnapshot = await getDocs(collection(db, "events"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
</script>
