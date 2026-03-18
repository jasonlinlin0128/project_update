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
        <div v-for="item in items" :key="item.id" @click="viewItem(item)" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200 group cursor-pointer">
          <div class="flex">
            <div class="bg-red-100 text-red-600 p-3 flex flex-col items-center justify-center min-w-[80px]">
              <span class="text-xs font-bold uppercase">Date</span>
              <span class="text-sm font-bold">{{ item.date }}</span>
            </div>
            <div class="p-3 flex-grow">
              <h4 class="text-gray-800 font-bold group-hover:text-red-600 transition">{{ item.name }}</h4>
              <div class="text-sm text-gray-500 flex flex-col mt-1">
                <div class="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ item.location }}
                </div>
                <div v-if="item.organizer" class="flex items-center text-red-500 text-xs font-medium">
                  🏢 {{ item.organizer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showModal = false">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white">{{ selectedItem?.name }}</h3>
            <button @click="showModal = false" class="text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase">日期</p>
                <p class="font-medium">{{ selectedItem?.date || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">地點</p>
                <p class="font-medium">{{ selectedItem?.location || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">主辦單位</p>
                <p class="font-medium">{{ selectedItem?.organizer || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">費用</p>
                <p class="font-medium">{{ selectedItem?.cost ? '$' + selectedItem.cost : '-' }}</p>
              </div>
            </div>
            <div v-if="selectedItem?.startTime || selectedItem?.endTime" class="bg-yellow-50 p-3 rounded-lg">
              <p class="text-xs text-yellow-600 uppercase mb-1">活動時間</p>
              <p class="font-medium">⏰ {{ selectedItem?.startTime || '-' }} ~ {{ selectedItem?.endTime || '-' }}</p>
            </div>
            <div v-if="selectedItem?.agenda">
              <p class="text-xs text-gray-500 uppercase mb-1">活動議程</p>
              <p class="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{{ selectedItem.agenda }}</p>
            </div>
            <div v-if="selectedItem?.takeaways">
              <p class="text-xs text-gray-500 uppercase mb-1">心得/收穫</p>
              <p class="text-gray-700 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">{{ selectedItem.takeaways }}</p>
            </div>
            <div v-if="selectedItem?.relatedProject">
              <p class="text-xs text-gray-500 uppercase mb-1">相關專案</p>
              <p class="text-red-600">{{ selectedItem.relatedProject }}</p>
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
    return { 
      items: [],
      showModal: false,
      selectedItem: null
    }
  },
  methods: {
    viewItem(item) {
      this.selectedItem = item;
      this.showModal = true;
    }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "events"));
    this.items = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
</script>

