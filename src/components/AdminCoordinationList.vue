<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">活動接洽管理</h2>
        <p class="text-gray-500 text-sm mt-1">追蹤與外部單位、企業的合作接洽進度</p>
      </div>
      <div class="flex gap-2">
        <ExportButton :data="items" type="coordination" filename="活動接洽" />
        <button @click="openAddModal" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增接洽
        </button>
      </div>
    </div>

    <!-- Pipeline Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div v-for="stage in pipelineStages" :key="stage.value" 
           @click="statusFilter = statusFilter === stage.value ? '' : stage.value"
           :class="['rounded-xl p-4 cursor-pointer transition-all border-2', 
                   statusFilter === stage.value ? 'border-yellow-500 shadow-md' : 'border-transparent hover:shadow-sm',
                   stage.bgClass]">
        <div class="flex items-center justify-between">
          <span class="text-2xl">{{ stage.icon }}</span>
          <span class="text-2xl font-bold" :class="stage.textClass">{{ getCountByStatus(stage.value) }}</span>
        </div>
        <p class="text-sm mt-1" :class="stage.textClass">{{ stage.label }}</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
      <div class="relative flex-1 w-full">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜尋單位名稱、聯絡人..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500/20 text-gray-700 placeholder-gray-400 outline-none transition-all">
      </div>
      <button v-if="statusFilter" @click="statusFilter = ''" class="text-sm text-gray-500 hover:text-gray-700">
        清除篩選
      </button>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <th class="py-4 px-6">活動/單位名稱</th>
              <th class="py-4 px-6">聯絡人</th>
              <th class="py-4 px-6">階段</th>
              <th class="py-4 px-6">最後聯絡</th>
              <th class="py-4 px-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50/80 transition-colors group">
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-800">{{ item.name }}</div>
                <div class="text-xs text-gray-500 mt-1" v-if="item.email || item.phone">
                  {{ item.email }} {{ item.phone ? '| ' + item.phone : '' }}
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-xs text-yellow-700 font-bold">
                    {{ item.contact ? item.contact.charAt(0) : '?' }}
                  </div>
                  <span class="text-gray-700">{{ item.contact }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span :class="getStatusClass(item.status)" class="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                  {{ getStatusIcon(item.status) }} {{ item.status }}
                </span>
              </td>
              <td class="py-4 px-6">
                <div v-if="item.timeline && item.timeline.length > 0" class="text-sm text-gray-600">
                  {{ formatDate(item.timeline[item.timeline.length - 1].date) }}
                </div>
                <div v-else class="text-gray-400 text-sm">-</div>
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
              <td colspan="5" class="py-12 text-center text-gray-400">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-4xl mb-3">🤝</span>
                  <p>沒有找到符合的接洽紀錄</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Detail Modal with Timeline -->
    <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewModal = false"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-yellow-500 to-amber-600">
          <h3 class="text-lg font-bold text-white">{{ viewingItem?.name }}</h3>
          <button @click="showViewModal = false" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-6" v-if="viewingItem">
          <!-- Status & Contact Info -->
          <div class="flex gap-2 flex-wrap">
            <span :class="getStatusClass(viewingItem.status)" class="px-3 py-1 rounded-full text-sm font-bold">
              {{ getStatusIcon(viewingItem.status) }} {{ viewingItem.status }}
            </span>
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">👤 {{ viewingItem.contact }}</span>
          </div>

          <div v-if="viewingItem.email || viewingItem.phone" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">聯絡資訊</p>
            <p v-if="viewingItem.email" class="text-gray-700">📧 {{ viewingItem.email }}</p>
            <p v-if="viewingItem.phone" class="text-gray-700">📞 {{ viewingItem.phone }}</p>
          </div>

          <div v-if="viewingItem.notes" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">備註</p>
            <p class="text-gray-700 whitespace-pre-wrap">{{ viewingItem.notes }}</p>
          </div>

          <!-- Communication Timeline -->
          <div>
            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              📅 溝通紀錄
              <button @click="showAddTimelineEntry = !showAddTimelineEntry" class="text-sm font-normal text-yellow-600 hover:text-yellow-800">
                + 新增
              </button>
            </h4>
            
            <!-- Add Timeline Entry -->
            <div v-if="showAddTimelineEntry" class="bg-yellow-50 rounded-xl p-4 mb-4 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <input v-model="newTimelineEntry.date" type="date" class="px-3 py-2 border rounded-lg text-sm">
                <select v-model="newTimelineEntry.type" class="px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="call">📞 通話</option>
                  <option value="email">📧 Email</option>
                  <option value="meeting">🤝 會議</option>
                  <option value="other">📝 其他</option>
                </select>
              </div>
              <textarea v-model="newTimelineEntry.content" placeholder="溝通內容..." class="w-full px-3 py-2 border rounded-lg text-sm" rows="2"></textarea>
              <div class="flex justify-end gap-2">
                <button @click="showAddTimelineEntry = false" class="text-sm text-gray-500">取消</button>
                <button @click="addTimelineEntry" class="text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg">新增</button>
              </div>
            </div>

            <div v-if="viewingItem.timeline && viewingItem.timeline.length > 0" class="space-y-3">
              <div v-for="(entry, index) in [...viewingItem.timeline].reverse()" :key="index" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm" :class="getTimelineIconBg(entry.type)">
                    {{ getTimelineIcon(entry.type) }}
                  </div>
                  <div v-if="index < viewingItem.timeline.length - 1" class="w-0.5 h-full bg-gray-200 mt-1"></div>
                </div>
                <div class="flex-1 pb-4">
                  <div class="flex justify-between items-start">
                    <p class="text-sm font-medium text-gray-800">{{ formatDate(entry.date) }}</p>
                    <span class="text-xs text-gray-400">{{ getTimelineLabel(entry.type) }}</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ entry.content }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400 text-sm">
              尚無溝通紀錄
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? '編輯接洽' : '新增接洽' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">活動/單位名稱</label>
            <input v-model="form.name" placeholder="例如：某某科技公司" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">聯絡人</label>
              <input v-model="form.contact" placeholder="姓名" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">階段</label>
              <select v-model="form.status" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all bg-white">
                <option v-for="stage in pipelineStages" :key="stage.value" :value="stage.value">
                  {{ stage.icon }} {{ stage.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="form.email" type="email" placeholder="email@example.com" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">電話</label>
              <input v-model="form.phone" placeholder="0912-345-678" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea v-model="form.notes" placeholder="備註事項..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all h-20 resize-none"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
          <button @click="saveItem" :disabled="isLoading" class="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
      statusFilter: '',
      showModal: false,
      showViewModal: false,
      showAddTimelineEntry: false,
      isEditing: false,
      editingId: null,
      viewingItem: null,
      pipelineStages: [
        { value: '初步接觸', label: '初步接觸', icon: '👋', bgClass: 'bg-gray-50', textClass: 'text-gray-600' },
        { value: '接洽中', label: '接洽中', icon: '💬', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700' },
        { value: '評估中', label: '評估中', icon: '🤔', bgClass: 'bg-blue-50', textClass: 'text-blue-700' },
        { value: '已成交', label: '已成交', icon: '🎉', bgClass: 'bg-green-50', textClass: 'text-green-700' },
        { value: '未成交', label: '未成交', icon: '❌', bgClass: 'bg-red-50', textClass: 'text-red-700' }
      ],
      newTimelineEntry: {
        date: new Date().toISOString().split('T')[0],
        type: 'call',
        content: ''
      },
      form: this.getEmptyForm()
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                              (item.contact && item.contact.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStatus = this.statusFilter ? item.status === this.statusFilter : true;
        return matchesSearch && matchesStatus;
      });
    }
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    getEmptyForm() {
      return {
        name: '',
        contact: '',
        email: '',
        phone: '',
        status: '初步接觸',
        notes: '',
        timeline: []
      };
    },
    getCountByStatus(status) {
      return this.items.filter(i => i.status === status).length;
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    },
    getStatusIcon(status) {
      const stage = this.pipelineStages.find(s => s.value === status);
      return stage ? stage.icon : '📋';
    },
    getTimelineIcon(type) {
      const icons = { call: '📞', email: '📧', meeting: '🤝', other: '📝' };
      return icons[type] || '📝';
    },
    getTimelineLabel(type) {
      const labels = { call: '通話', email: 'Email', meeting: '會議', other: '其他' };
      return labels[type] || '其他';
    },
    getTimelineIconBg(type) {
      const bgs = { call: 'bg-green-100', email: 'bg-blue-100', meeting: 'bg-yellow-100', other: 'bg-gray-100' };
      return bgs[type] || 'bg-gray-100';
    },
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "coordination"));
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            email: data.email || '',
            phone: data.phone || '',
            timeline: data.timeline || [],
            status: data.status || '初步接觸'
          };
        });
      } finally {
        this.isLoading = false;
      }
    },
    viewItem(item) {
      this.viewingItem = { ...item };
      this.showViewModal = true;
      this.showAddTimelineEntry = false;
    },
    async addTimelineEntry() {
      const toast = useToast();
      if (!this.newTimelineEntry.content.trim()) {
        toast.warning('請輸入溝通內容');
        return;
      }
      
      const entry = { ...this.newTimelineEntry };
      this.viewingItem.timeline = this.viewingItem.timeline || [];
      this.viewingItem.timeline.push(entry);
      
      try {
        await updateDoc(doc(db, "coordination", this.viewingItem.id), {
          timeline: this.viewingItem.timeline
        });
        await this.fetchItems();
        this.newTimelineEntry = { date: new Date().toISOString().split('T')[0], type: 'call', content: '' };
        this.showAddTimelineEntry = false;
        toast.success('新增成功');
      } catch (error) {
        console.error("Error adding timeline entry:", error);
        toast.error('新增失敗');
      }
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
    async saveItem() {
      const toast = useToast();
      if (!this.form.name) {
        toast.warning('請輸入名稱');
        return;
      }
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "coordination", this.editingId), this.form);
        } else {
          await addDoc(collection(db, "coordination"), this.form);
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
      if (confirm('確定要刪除此接洽紀錄嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "coordination", id));
          await this.fetchItems();
        } finally {
          this.isLoading = false;
        }
      }
    },
    getStatusClass(status) {
      const classes = {
        '初步接觸': 'bg-gray-100 text-gray-700',
        '接洽中': 'bg-yellow-100 text-yellow-700',
        '評估中': 'bg-blue-100 text-blue-700',
        '已成交': 'bg-green-100 text-green-700',
        '未成交': 'bg-red-100 text-red-700'
      };
      return classes[status] || 'bg-gray-100 text-gray-600';
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
