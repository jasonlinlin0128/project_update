<template>
  <div class="ios-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800 flex items-center">
        <span class="text-2xl mr-2">📋</span>
        內部會議
      </h3>
      <span class="text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{{ items.length }} 筆紀錄</span>
    </div>
    <div class="space-y-3">
      <div v-for="item in recentItems" :key="item.id" @click="viewItem(item)" class="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer group">
        <div :class="getTypeIconBg(item.type)" class="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
          <span class="text-lg">{{ getTypeIcon(item.type) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-500 flex items-center gap-2">
            <span>{{ formatDate(item.date) }}</span>
            <span v-if="item.attachments && item.attachments.length > 0" class="text-blue-500">📎 {{ item.attachments.length }}</span>
          </div>
        </div>
        <span :class="getTypeClass(item.type)" class="px-2 py-1 rounded-lg text-xs font-medium">
          {{ getTypeLabel(item.type) }}
        </span>
      </div>
      <div v-if="items.length === 0" class="text-center py-8 text-gray-400">
        <span class="text-4xl">📋</span>
        <p class="mt-2 text-sm">尚無會議紀錄</p>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showModal && selectedItem" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
          <div class="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 class="text-lg font-bold text-gray-800">會議詳情</h3>
            <button @click="showModal = false" class="p-2 hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div class="flex items-center gap-3">
              <div :class="getTypeIconBg(selectedItem.type)" class="w-12 h-12 rounded-xl flex items-center justify-center">
                <span class="text-2xl">{{ getTypeIcon(selectedItem.type) }}</span>
              </div>
              <div>
                <h4 class="font-bold text-gray-800">{{ selectedItem.name }}</h4>
                <p class="text-sm text-gray-500">{{ formatDate(selectedItem.date) }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-xs text-gray-500">類型</p>
                <span :class="getTypeClass(selectedItem.type)" class="px-2 py-1 rounded-lg text-xs font-medium mt-1 inline-block">{{ getTypeLabel(selectedItem.type) }}</span>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-xs text-gray-500">與會人員</p>
                <p class="font-medium text-gray-800">{{ selectedItem.attendees || '-' }}</p>
              </div>
            </div>
            <div v-if="selectedItem.agenda" class="bg-indigo-50 p-3 rounded-lg">
              <p class="text-xs text-indigo-600 mb-1">📋 會議議程</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedItem.agenda }}</p>
            </div>
            <div v-if="selectedItem.summary" class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">📝 會議摘要</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedItem.summary }}</p>
            </div>
            <div v-if="selectedItem.decisions" class="bg-green-50 p-3 rounded-lg">
              <p class="text-xs text-green-600 mb-1">✅ 決議事項</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedItem.decisions }}</p>
            </div>
            <div v-if="selectedItem.attachments && selectedItem.attachments.length > 0">
              <p class="text-xs text-gray-500 mb-2">📎 附件</p>
              <div class="space-y-2">
                <a v-for="file in selectedItem.attachments" :key="file.id" :href="file.url" target="_blank" class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-sm text-blue-600">
                  📄 {{ file.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  data() {
    return {
      items: [],
      showModal: false,
      selectedItem: null
    }
  },
  computed: {
    recentItems() {
      return [...this.items]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "meetings"));
    this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  methods: {
    viewItem(item) {
      this.selectedItem = item;
      this.showModal = true;
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    },
    getTypeLabel(type) {
      const labels = { progress: '進度報告', requirement: '需求評估', other: '其他' };
      return labels[type] || '其他';
    },
    getTypeIcon(type) {
      const icons = { progress: '📊', requirement: '📝', other: '📌' };
      return icons[type] || '📌';
    },
    getTypeIconBg(type) {
      const bgs = { progress: 'bg-indigo-100', requirement: 'bg-purple-100', other: 'bg-gray-100' };
      return bgs[type] || 'bg-gray-100';
    },
    getTypeClass(type) {
      const classes = {
        progress: 'bg-indigo-100 text-indigo-700',
        requirement: 'bg-purple-100 text-purple-700',
        other: 'bg-gray-100 text-gray-700'
      };
      return classes[type] || classes.other;
    }
  }
}
</script>
