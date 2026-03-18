<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">活動參與管理</h2>
        <p class="text-gray-500 text-sm mt-1">管理外部活動、展覽與研討會的參與紀錄</p>
      </div>
      <div class="flex gap-2">
        <ExportButton :data="items" type="events" filename="活動參與" />
        <button @click="openAddModal" class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增活動
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p class="text-sm text-gray-500">總活動</p>
        <p class="text-2xl font-bold text-gray-800">{{ items.length }}</p>
      </div>
      <div class="bg-pink-50 rounded-xl p-4 border border-pink-100">
        <p class="text-sm text-pink-600">本月活動</p>
        <p class="text-2xl font-bold text-pink-700">{{ thisMonthCount }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4 border border-green-100">
        <p class="text-sm text-green-600">總花費</p>
        <p class="text-2xl font-bold text-green-700">${{ totalCost.toLocaleString() }}</p>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p class="text-sm text-blue-600">即將舉行</p>
        <p class="text-2xl font-bold text-blue-700">{{ upcomingCount }}</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
      <div class="relative flex-1 w-full">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜尋活動名稱、地點..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500/20 text-gray-700 placeholder-gray-400 outline-none transition-all">
      </div>
      <div class="flex gap-2">
        <button @click="timeFilter = ''" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', timeFilter === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">全部</button>
        <button @click="timeFilter = 'upcoming'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', timeFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100']">即將舉行</button>
        <button @click="timeFilter = 'past'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', timeFilter === 'past' ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100']">已結束</button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <th class="py-4 px-6">日期</th>
              <th class="py-4 px-6">活動名稱</th>
              <th class="py-4 px-6">地點</th>
              <th class="py-4 px-6">時間</th>
              <th class="py-4 px-6">費用</th>
              <th class="py-4 px-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50/80 transition-colors group">
              <td class="py-4 px-6 whitespace-nowrap">
                <div class="text-gray-600 font-medium">{{ formatDate(item.date) }}</div>
                <span v-if="isUpcoming(item.date)" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">即將</span>
              </td>
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-800">{{ item.name }}</div>
                <div class="text-xs text-gray-500 mt-1 flex items-center gap-1" v-if="item.organizer">
                  🏢 {{ item.organizer }}
                </div>
                <div v-if="item.takeaways" class="text-xs text-green-600 mt-1 flex items-center gap-1">
                  📝 有心得紀錄
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-1 text-gray-600">
                  📍 {{ item.location }}
                </div>
              </td>
              <td class="py-4 px-6">
                <div v-if="item.startTime || item.endTime" class="text-gray-600 text-sm">
                  ⏰ {{ item.startTime || '-' }} ~ {{ item.endTime || '-' }}
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="py-4 px-6">
                <span v-if="item.cost" class="font-medium text-green-600">${{ Number(item.cost).toLocaleString() }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="viewItem(item)" class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="檢視">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="openEditModal(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="編輯">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteItem(item.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="刪除">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-400">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-4xl mb-3">📅</span>
                  <p>沒有找到符合的活動</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Detail Modal -->
    <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewModal = false"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-pink-500 to-rose-600">
          <h3 class="text-lg font-bold text-white">{{ viewingItem?.name }}</h3>
          <button @click="showViewModal = false" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4" v-if="viewingItem">
          <div class="flex gap-2 flex-wrap">
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">📅 {{ formatDate(viewingItem.date) }}</span>
            <span class="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm">📍 {{ viewingItem.location }}</span>
            <span v-if="viewingItem.cost" class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">💰 ${{ Number(viewingItem.cost).toLocaleString() }}</span>
          </div>

          <div v-if="viewingItem.organizer" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">主辦單位</p>
            <p class="font-medium text-gray-800">{{ viewingItem.organizer }}</p>
          </div>

          <div v-if="viewingItem.startTime || viewingItem.endTime" class="bg-yellow-50 rounded-xl p-4">
            <p class="text-xs text-yellow-600 mb-1">活動時間</p>
            <p class="font-medium text-gray-800">⏰ {{ viewingItem.startTime || '-' }} ~ {{ viewingItem.endTime || '-' }}</p>
          </div>

          <div v-if="viewingItem.agenda" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">活動議程</p>
            <p class="text-gray-700 whitespace-pre-wrap">{{ viewingItem.agenda }}</p>
          </div>

          <div v-if="viewingItem.relatedProject" class="bg-blue-50 rounded-xl p-4">
            <p class="text-xs text-blue-500 mb-1">相關專案</p>
            <p class="font-medium text-blue-700">{{ viewingItem.relatedProject }}</p>
          </div>

          <div v-if="viewingItem.takeaways" class="bg-green-50 rounded-xl p-4">
            <p class="text-xs text-green-600 mb-1">心得/收穫</p>
            <p class="text-gray-700 whitespace-pre-wrap">{{ viewingItem.takeaways }}</p>
          </div>

          <div v-if="viewingItem.link">
            <a :href="viewingItem.link" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
              🔗 開啟活動連結
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? '編輯活動' : '新增活動' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">活動名稱</label>
            <input v-model="form.name" placeholder="例如：Computex 2025" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input v-model="form.date" type="date" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">費用 (選填)</label>
              <input v-model.number="form.cost" type="number" placeholder="0" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">地點</label>
            <input v-model="form.location" placeholder="例如：南港展覽館" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">主辦單位</label>
            <input v-model="form.organizer" placeholder="例如：TAITRA" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
              <input v-model="form.startTime" type="time" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
              <input v-model="form.endTime" type="time" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
            </div>
          </div>

          <!-- Agenda -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">活動議程</label>
            <textarea v-model="form.agenda" rows="3" placeholder="09:00 報到
10:00 開幕式
11:00 專題演講..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">相關專案</label>
            <input v-model="form.relatedProject" placeholder="此活動與哪個專案有關？" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">活動連結</label>
            <input v-model="form.link" placeholder="https://..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">心得/收穫</label>
            <textarea v-model="form.takeaways" rows="3" placeholder="記錄參加後的心得、學到的東西、待辦事項..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
          <button @click="saveItem" :disabled="isLoading" class="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isEditing ? '儲存變更' : '確認新增' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import ExportButton from './ExportButton.vue';
import { useToast } from './ToastContainer.vue';

export default {
  components: {
    ExportButton
  },
  data() {
    return {
      items: [],
      isLoading: false,
      searchQuery: '',
      timeFilter: '',
      showModal: false,
      showViewModal: false,
      isEditing: false,
      editingId: null,
      viewingItem: null,
      newParticipant: '',
      form: this.getEmptyForm()
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) || 
               (item.location && item.location.toLowerCase().includes(query));
        
        if (this.timeFilter === 'upcoming') {
          return matchesSearch && this.isUpcoming(item.date);
        } else if (this.timeFilter === 'past') {
          return matchesSearch && !this.isUpcoming(item.date);
        }
        return matchesSearch;
      });
    },
    thisMonthCount() {
      const now = new Date();
      return this.items.filter(i => {
        if (!i.date) return false;
        const d = new Date(i.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
    },
    totalCost() {
      return this.items.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
    },
    upcomingCount() {
      return this.items.filter(i => this.isUpcoming(i.date)).length;
    }
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    getEmptyForm() {
      return {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        organizer: '',
        cost: 0,
        agenda: '',
        relatedProject: '',
        link: '',
        takeaways: ''
      };
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    isUpcoming(dateStr) {
      if (!dateStr) return false;
      const eventDate = new Date(dateStr);
      eventDate.setHours(23, 59, 59);
      return eventDate >= new Date();
    },
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            participants: data.participants || [],
            cost: data.cost || 0,
            takeaways: data.takeaways || '',
            relatedProject: data.relatedProject || '',
            link: data.link || ''
          };
        });
      } finally {
        this.isLoading = false;
      }
    },
    viewItem(item) {
      this.viewingItem = item;
      this.showViewModal = true;
    },
    openAddModal() {
      this.isEditing = false;
      this.editingId = null;
      this.form = this.getEmptyForm();
      this.showModal = true;
    },
    openEditModal(item) {
      this.isEditing = true;
      this.editingId = item.id;
      this.form = { ...this.getEmptyForm(), ...item };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.form = this.getEmptyForm();
    },
    addParticipant() {
      if (this.newParticipant.trim()) {
        this.form.participants.push(this.newParticipant.trim());
        this.newParticipant = '';
      }
    },
    async saveItem() {
      const toast = useToast();
      if (!this.form.name) {
        toast.warning('請輸入活動名稱');
        return;
      }
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "events", this.editingId), this.form);
        } else {
          await addDoc(collection(db, "events"), this.form);
        }
        await this.fetchItems();
        toast.success('儲存成功');
        this.closeModal();
      } catch (error) {
        console.error("Error saving item:", error);
        toast.error('儲存失敗');
      } finally {
        this.isLoading = false;
      }
    },
    async deleteItem(id) {
      if (confirm('確定要刪除此活動嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "events", id));
          await this.fetchItems();
        } finally {
          this.isLoading = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
