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
        <li v-for="item in items" :key="item.id" @click="viewItem(item)" class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-200 relative cursor-pointer">
          <div class="absolute top-4 left-0 w-1 h-8 bg-green-400 rounded-r"></div>
          <div class="ml-2">
            <div class="text-xs text-green-600 font-bold mb-1 uppercase tracking-wide">Topic</div>
            <div class="text-gray-800 font-medium text-lg">
              <a v-if="item.link" :href="item.link" target="_blank" @click.stop class="hover:text-green-600 hover:underline">{{ item.name || item.topic }}</a>
              <span v-else>{{ item.name || item.topic }}</span>
            </div>
            <div class="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-3">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ item.date }}
              </span>
              <span v-if="item.speaker" class="flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs border border-green-100">
                🎤 {{ item.speaker }}
              </span>
              <span v-if="item.role" class="flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                👤 {{ item.role }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showModal = false">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white">{{ selectedItem?.name || selectedItem?.topic }}</h3>
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
                <p class="text-xs text-gray-500 uppercase">類型</p>
                <p class="font-medium">{{ selectedItem?.type || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">講者</p>
                <p class="font-medium">{{ selectedItem?.speaker || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">角色</p>
                <p class="font-medium">{{ selectedItem?.role || '-' }}</p>
              </div>
            </div>
            <div v-if="selectedItem?.notes">
              <p class="text-xs text-gray-500 uppercase mb-1">筆記/心得</p>
              <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">{{ selectedItem.notes }}</p>
            </div>
            <div v-if="selectedItem?.participants?.length">
              <p class="text-xs text-gray-500 uppercase mb-1">參與者</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(p, i) in selectedItem.participants" :key="i" class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {{ p }}
                </span>
              </div>
            </div>
            <div v-if="selectedItem?.link">
              <a :href="selectedItem.link" target="_blank" class="text-green-600 hover:underline text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                開啟連結
              </a>
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
    const querySnapshot = await getDocs(collection(db, "forums"));
    this.items = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
</script>

