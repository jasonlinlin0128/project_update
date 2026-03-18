<template>
  <div class="card h-full flex flex-col overflow-hidden border-t-4 border-accent-yellow hover:shadow-lg transition-shadow duration-300">
    <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-yellow-800 flex items-center">
        <span class="bg-yellow-200 text-yellow-700 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </span>
        活動接洽
      </h3>
    </div>
    
    <div class="p-4 flex-grow bg-white">
      <div class="space-y-3">
        <div v-for="item in items" :key="item.id" @click="viewItem(item)" class="group bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-accent-yellow transition-all duration-300 cursor-pointer">
          <div>
            <div class="font-bold text-gray-800 text-lg group-hover:text-accent-yellow transition-colors">{{ item.name }}</div>
            <div class="text-sm text-gray-500 flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ item.contact }}
            </div>
          </div>
          <div>
            <span :class="{'bg-green-100 text-green-700 border-green-200': item.status === '已完成' || item.status === '已成交', 'bg-yellow-100 text-yellow-700 border-yellow-200': item.status === '接洽中' || item.status === '評估中', 'bg-blue-100 text-blue-700 border-blue-200': item.status === '初步接觸', 'bg-red-100 text-red-700 border-red-200': item.status === '失敗' || item.status === '未成交'}" class="px-3 py-1 rounded-full text-xs font-bold border">
              {{ item.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showModal = false">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 flex justify-between items-center">
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
                <p class="text-xs text-gray-500 uppercase">聯絡人</p>
                <p class="font-medium">{{ selectedItem?.contact || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">狀態</p>
                <span :class="{'bg-green-100 text-green-700': selectedItem?.status === '已成交', 'bg-yellow-100 text-yellow-700': selectedItem?.status === '接洽中', 'bg-red-100 text-red-700': selectedItem?.status === '未成交'}" class="px-2 py-1 rounded text-xs font-medium">
                  {{ selectedItem?.status || '-' }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">階段</p>
                <p class="font-medium">{{ selectedItem?.stage || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">組織</p>
                <p class="font-medium">{{ selectedItem?.organization || '-' }}</p>
              </div>
            </div>
            <div v-if="selectedItem?.email || selectedItem?.phone" class="grid grid-cols-2 gap-4">
              <div v-if="selectedItem?.email">
                <p class="text-xs text-gray-500 uppercase">Email</p>
                <a :href="'mailto:' + selectedItem.email" class="text-blue-600 hover:underline text-sm">{{ selectedItem.email }}</a>
              </div>
              <div v-if="selectedItem?.phone">
                <p class="text-xs text-gray-500 uppercase">電話</p>
                <a :href="'tel:' + selectedItem.phone" class="text-blue-600 hover:underline text-sm">{{ selectedItem.phone }}</a>
              </div>
            </div>
            <div v-if="selectedItem?.notes">
              <p class="text-xs text-gray-500 uppercase mb-1">備註</p>
              <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">{{ selectedItem.notes }}</p>
            </div>
            <div v-if="selectedItem?.timeline?.length">
              <p class="text-xs text-gray-500 uppercase mb-2">溝通時間軸</p>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div v-for="(entry, i) in selectedItem.timeline" :key="i" class="flex items-start gap-2 text-sm">
                  <span class="text-gray-400">{{ entry.date }}</span>
                  <span class="text-gray-600">{{ entry.content }}</span>
                </div>
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
    const querySnapshot = await getDocs(collection(db, "coordination"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
</script>

