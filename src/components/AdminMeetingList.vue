<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">內部會議紀錄</h2>
        <p class="text-gray-500 text-sm mt-1">記錄工作進度報告、需求評估會議等內部會議</p>
      </div>
      <div class="flex gap-2">
        <ExportButton :data="items" type="meetings" filename="內部會議" />
        <button @click="openAddModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增會議
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p class="text-sm text-gray-500">總會議</p>
        <p class="text-2xl font-bold text-gray-800">{{ items.length }}</p>
      </div>
      <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
        <p class="text-sm text-indigo-600">進度報告</p>
        <p class="text-2xl font-bold text-indigo-700">{{ progressCount }}</p>
      </div>
      <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <p class="text-sm text-purple-600">需求評估</p>
        <p class="text-2xl font-bold text-purple-700">{{ requirementCount }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4 border border-green-100">
        <p class="text-sm text-green-600">本月會議</p>
        <p class="text-2xl font-bold text-green-700">{{ thisMonthCount }}</p>
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
        <input v-model="searchQuery" type="text" placeholder="搜尋會議名稱、摘要..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-gray-700 placeholder-gray-400 outline-none transition-all">
      </div>
      <div class="flex gap-2 flex-wrap">
        <button @click="typeFilter = ''" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">全部</button>
        <button @click="typeFilter = 'progress'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === 'progress' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100']">進度報告</button>
        <button @click="typeFilter = 'requirement'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === 'requirement' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100']">需求評估</button>
        <button @click="typeFilter = 'other'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === 'other' ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100']">其他</button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <th class="py-4 px-6">日期</th>
              <th class="py-4 px-6">類型</th>
              <th class="py-4 px-6">會議名稱</th>
              <th class="py-4 px-6">與會人員</th>
              <th class="py-4 px-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50/80 transition-colors group">
              <td class="py-4 px-6 whitespace-nowrap">
                <div class="text-gray-600 font-medium">{{ formatDate(item.date) }}</div>
              </td>
              <td class="py-4 px-6">
                <span :class="getTypeClass(item.type)" class="px-2 py-1 rounded-lg text-xs font-medium border">
                  {{ getTypeLabel(item.type) }}
                </span>
              </td>
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-800">{{ item.name }}</div>
                <div v-if="item.summary" class="text-xs text-gray-500 mt-1 line-clamp-1">{{ item.summary }}</div>
                <div v-if="item.attachments && item.attachments.length > 0" class="text-xs text-blue-500 mt-1">📎 {{ item.attachments.length }} 個附件</div>
              </td>
              <td class="py-4 px-6">
                <div class="text-gray-600 text-sm">{{ item.attendees || '-' }}</div>
              </td>
              <td class="py-4 px-6">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button @click="viewItem(item)" class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="檢視">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="openEditModal(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="編輯">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteItem(item.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="刪除">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="5" class="py-12 text-center text-gray-400">
                <div class="text-4xl mb-2">📋</div>
                <p>尚無會議紀錄</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showViewModal = false">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 class="text-lg font-bold text-gray-800">會議詳情</h3>
          <button @click="showViewModal = false" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-4" v-if="viewingItem">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">會議名稱</p>
              <p class="font-medium text-gray-800">{{ viewingItem.name }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">日期</p>
              <p class="font-medium text-gray-800">{{ formatDate(viewingItem.date) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">類型</p>
              <span :class="getTypeClass(viewingItem.type)" class="px-2 py-1 rounded-lg text-xs font-medium border">{{ getTypeLabel(viewingItem.type) }}</span>
            </div>
            <div>
              <p class="text-xs text-gray-500">與會人員</p>
              <p class="font-medium text-gray-800">{{ viewingItem.attendees || '-' }}</p>
            </div>
          </div>
          <div v-if="viewingItem.agenda">
            <p class="text-xs text-gray-500 mb-1">會議議程</p>
            <p class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">{{ viewingItem.agenda }}</p>
          </div>
          <div v-if="viewingItem.summary">
            <p class="text-xs text-gray-500 mb-1">會議摘要</p>
            <p class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">{{ viewingItem.summary }}</p>
          </div>
          <div v-if="viewingItem.decisions">
            <p class="text-xs text-gray-500 mb-1">決議事項</p>
            <p class="text-gray-700 whitespace-pre-wrap bg-green-50 p-3 rounded-lg text-sm">{{ viewingItem.decisions }}</p>
          </div>
          <div v-if="viewingItem.attachments && viewingItem.attachments.length > 0">
            <p class="text-xs text-gray-500 mb-2">附件</p>
            <div class="space-y-2">
              <a v-for="file in viewingItem.attachments" :key="file.id" :href="file.url" target="_blank" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span class="text-xl">📎</span>
                <span class="text-sm text-blue-600 hover:underline">{{ file.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? '編輯會議' : '新增會議' }}</h3>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">會議名稱 *</label>
              <input v-model="form.name" class="ios-input w-full" placeholder="例如：12月份工作進度報告">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
              <input v-model="form.date" type="date" class="ios-input w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">類型</label>
              <select v-model="form.type" class="ios-input w-full">
                <option value="progress">進度報告</option>
                <option value="requirement">需求評估</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">與會人員</label>
              <input v-model="form.attendees" class="ios-input w-full" placeholder="例如：Jason、主管、IT部門">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">會議議程</label>
            <textarea v-model="form.agenda" rows="3" class="ios-input w-full" placeholder="1. 上週進度回顧&#10;2. 本週工作計畫&#10;3. 待解決問題"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">會議摘要</label>
            <textarea v-model="form.summary" rows="4" class="ios-input w-full" placeholder="重點討論內容與結論..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">決議事項</label>
            <textarea v-model="form.decisions" rows="3" class="ios-input w-full" placeholder="1. 決定事項一&#10;2. 決定事項二"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">附件</label>
            <FileUploader 
              :files="form.attachments" 
              @update:files="form.attachments = $event"
              storagePath="meetings"
            />
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
          <button @click="saveItem" :disabled="isLoading" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
import FileUploader from './FileUploader.vue';
import { useToast } from './ToastContainer.vue';

export default {
  components: {
    ExportButton,
    FileUploader
  },
  data() {
    return {
      items: [],
      isLoading: false,
      searchQuery: '',
      typeFilter: '',
      showModal: false,
      showViewModal: false,
      isEditing: false,
      editingId: null,
      viewingItem: null,
      form: this.getEmptyForm()
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              (i.summary && i.summary.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (i.attendees && i.attendees.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesType = this.typeFilter ? i.type === this.typeFilter : true;
        return matchesSearch && matchesType;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    progressCount() {
      return this.items.filter(i => i.type === 'progress').length;
    },
    requirementCount() {
      return this.items.filter(i => i.type === 'requirement').length;
    },
    thisMonthCount() {
      const now = new Date();
      return this.items.filter(i => {
        if (!i.date) return false;
        const d = new Date(i.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
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
        type: 'progress',
        attendees: '',
        agenda: '',
        summary: '',
        decisions: '',
        attachments: []
      };
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    getTypeLabel(type) {
      const labels = { progress: '進度報告', requirement: '需求評估', other: '其他' };
      return labels[type] || '其他';
    },
    getTypeClass(type) {
      const classes = {
        progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        requirement: 'bg-purple-100 text-purple-700 border-purple-200',
        other: 'bg-gray-100 text-gray-700 border-gray-200'
      };
      return classes[type] || classes.other;
    },
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "meetings"));
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            type: data.type || 'other',
            attachments: data.attachments || []
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
    async saveItem() {
      const toast = useToast();
      if (!this.form.name) {
        toast.warning('請輸入會議名稱');
        return;
      }
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "meetings", this.editingId), this.form);
        } else {
          await addDoc(collection(db, "meetings"), this.form);
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
      if (confirm('確定要刪除此會議紀錄嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "meetings", id));
          await this.fetchItems();
        } finally {
          this.isLoading = false;
        }
      }
    }
  }
}
</script>
