<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">論壇與分享會管理</h2>
        <p class="text-gray-500 text-sm mt-1">記錄參與或主辦的各類論壇、研討會與分享活動</p>
      </div>
      <div class="flex gap-2">
        <ExportButton :data="items" type="forums" filename="論壇分享會" />
        <button @click="openAddModal" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增紀錄
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p class="text-sm text-gray-500">總紀錄</p>
        <p class="text-2xl font-bold text-gray-800">{{ items.length }}</p>
      </div>
      <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <p class="text-sm text-purple-600">內部分享</p>
        <p class="text-2xl font-bold text-purple-700">{{ internalCount }}</p>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p class="text-sm text-blue-600">外部論壇</p>
        <p class="text-2xl font-bold text-blue-700">{{ externalCount }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4 border border-green-100">
        <p class="text-sm text-green-600">本月活動</p>
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
        <input v-model="searchQuery" type="text" placeholder="搜尋活動名稱、講者..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400 outline-none transition-all">
      </div>
      <div class="flex gap-2">
        <button @click="typeFilter = ''" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">全部</button>
        <button @click="typeFilter = 'internal'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === 'internal' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100']">內部分享</button>
        <button @click="typeFilter = 'external'" :class="['px-3 py-2 rounded-lg text-sm font-medium transition', typeFilter === 'external' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100']">外部論壇</button>
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
              <th class="py-4 px-6">名稱</th>
              <th class="py-4 px-6">角色</th>
              <th class="py-4 px-6">主講人</th>
              <th class="py-4 px-6">參與者</th>
              <th class="py-4 px-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50/80 transition-colors group">
              <td class="py-4 px-6 whitespace-nowrap">
                <div class="text-gray-600 font-medium">{{ formatDate(item.date) }}</div>
              </td>
              <td class="py-4 px-6">
                <span :class="item.type === 'internal' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'" class="px-2 py-1 rounded-lg text-xs font-medium border">
                  {{ item.type === 'internal' ? '內部分享' : '外部論壇' }}
                </span>
              </td>
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-800">{{ item.name }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <a v-if="item.link" :href="item.link" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    連結
                  </a>
                  <span v-if="item.attachments && item.attachments.length > 0" class="text-xs text-gray-400 flex items-center gap-1">
                    📎 {{ item.attachments.length }} 個附件
                  </span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium border border-purple-100">{{ item.role }}</span>
              </td>
              <td class="py-4 px-6">
                <div class="text-gray-600 text-sm">{{ item.speaker || '-' }}</div>
              </td>
              <td class="py-4 px-6">
                <div v-if="item.participants && item.participants.length > 0" class="flex -space-x-1">
                  <div v-for="(p, i) in item.participants.slice(0, 3)" :key="i" class="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600" :title="p">
                    {{ p.charAt(0) }}
                  </div>
                  <div v-if="item.participants.length > 3" class="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                    +{{ item.participants.length - 3 }}
                  </div>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
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
              <td colspan="7" class="py-12 text-center text-gray-400">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-4xl mb-3">💬</span>
                  <p>沒有找到符合的紀錄</p>
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
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600">
          <h3 class="text-lg font-bold text-white">{{ viewingItem?.name }}</h3>
          <button @click="showViewModal = false" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4" v-if="viewingItem">
          <div class="flex gap-2 flex-wrap">
            <span :class="viewingItem.type === 'internal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ viewingItem.type === 'internal' ? '內部分享' : '外部論壇' }}
            </span>
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{{ formatDate(viewingItem.date) }}</span>
            <span class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">{{ viewingItem.role }}</span>
          </div>

          <div v-if="viewingItem.speaker" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">主講人</p>
            <p class="font-medium text-gray-800">{{ viewingItem.speaker }}</p>
          </div>

          <div v-if="viewingItem.participants && viewingItem.participants.length > 0" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-2">參與者 ({{ viewingItem.participants.length }} 人)</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="(p, i) in viewingItem.participants" :key="i" class="bg-white px-2 py-1 rounded-lg text-sm text-gray-700 border">{{ p }}</span>
            </div>
          </div>

          <div v-if="viewingItem.notes" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">筆記/心得</p>
            <p class="text-gray-700 whitespace-pre-wrap">{{ viewingItem.notes }}</p>
          </div>

          <div v-if="viewingItem.attachments && viewingItem.attachments.length > 0" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-2">附件/簡報</p>
            <div class="space-y-2">
              <a v-for="(att, i) in viewingItem.attachments" :key="i" :href="att.url" target="_blank" class="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                📎 {{ att.name || att.url }}
              </a>
            </div>
          </div>

          <div v-if="viewingItem.link" class="flex">
            <a :href="viewingItem.link" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              開啟相關連結
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
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? '編輯紀錄' : '新增紀錄' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <!-- Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">活動類型</label>
            <div class="flex gap-3">
              <button @click="form.type = 'internal'" :class="['flex-1 py-3 rounded-xl font-medium transition border', form.type === 'internal' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300']">
                🏠 內部分享
              </button>
              <button @click="form.type = 'external'" :class="['flex-1 py-3 rounded-xl font-medium transition border', form.type === 'external' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300']">
                🌐 外部論壇
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名稱</label>
            <input v-model="form.name" placeholder="例如：AI 趨勢論壇" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input v-model="form.date" type="date" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">擔任角色</label>
              <select v-model="form.role" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-white">
                <option value="主辦">主辦</option>
                <option value="主講">主講</option>
                <option value="參與">參與</option>
                <option value="協辦">協辦</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">主講人</label>
            <input v-model="form.speaker" placeholder="輸入主講人姓名" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all">
          </div>

          <!-- Participants -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">參與者</label>
            <div class="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded-xl min-h-[42px]">
              <span v-for="(p, index) in form.participants" :key="index" class="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                {{ p }}
                <button @click="form.participants.splice(index, 1)" class="text-gray-400 hover:text-red-500">×</button>
              </span>
              <input 
                v-model="newParticipant" 
                @keydown.enter.prevent="addParticipant" 
                placeholder="+ 新增 (按 Enter)" 
                class="flex-1 bg-transparent outline-none text-sm min-w-[100px]"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">相關連結</label>
            <input v-model="form.link" placeholder="https://..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all">
          </div>

          <!-- Attachments -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">相關附件</label>
            <FileUploader 
              :files="form.uploadedFiles || []"
              :storagePath="`forums/${editingId || 'new'}`"
              @update:files="form.uploadedFiles = $event"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">筆記/心得</label>
            <textarea v-model="form.notes" rows="3" placeholder="記錄重點內容、心得或待辦事項..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
          <button @click="saveItem" :disabled="isLoading" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
      newParticipant: '',
      form: this.getEmptyForm()
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) || 
               (item.speaker && item.speaker.toLowerCase().includes(query));
        const matchesType = !this.typeFilter || item.type === this.typeFilter;
        return matchesSearch && matchesType;
      });
    },
    internalCount() {
      return this.items.filter(i => i.type === 'internal').length;
    },
    externalCount() {
      return this.items.filter(i => i.type === 'external').length;
    },
    thisMonthCount() {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      return this.items.filter(i => {
        if (!i.date) return false;
        const d = new Date(i.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
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
        role: '參與',
        speaker: '',
        link: '',
        type: 'internal',
        participants: [],
        attachments: [],
        uploadedFiles: [],
        notes: ''
      };
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "forums"));
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            type: data.type || 'external',
            participants: data.participants || [],
            attachments: data.attachments || [],
            notes: data.notes || ''
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
        toast.warning('請輸入名稱');
        return;
      }
      
      // Clean up empty attachments
      this.form.attachments = this.form.attachments.filter(a => a.url.trim());
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "forums", this.editingId), this.form);
        } else {
          await addDoc(collection(db, "forums"), this.form);
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
      if (confirm('確定要刪除此紀錄嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "forums", id));
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
