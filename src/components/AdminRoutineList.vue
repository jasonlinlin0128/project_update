<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h3 class="text-xl font-bold mb-4 text-gray-800">例行公事管理</h3>
    
    <!-- Add Form -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
      <input v-model="newItem.title" placeholder="事項名稱" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newItem.frequency" placeholder="頻率 (如: 每週)" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newItem.assignee" placeholder="負責人" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newItem.status" placeholder="狀態" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <button @click="addItem" :disabled="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center">
        <span v-if="isLoading">處理中...</span>
        <span v-else>新增事項</span>
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div class="relative w-full md:w-64">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜尋事項..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full">
      </div>
      <select v-model="statusFilter" class="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600 w-full md:w-auto">
        <option value="">所有狀態</option>
        <option value="正常">正常</option>
        <option value="異常">異常</option>
      </select>
    </div>

    <!-- List -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6">事項名稱</th>
            <th class="py-3 px-6">頻率</th>
            <th class="py-3 px-6">狀態</th>
            <th class="py-3 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="item in filteredItems" :key="item.id" class="border-b border-gray-200 hover:bg-gray-50">
            <template v-if="editingId === item.id">
              <td class="py-3 px-6"><input v-model="editForm.title" class="border p-1 rounded w-full"></td>
              <td class="py-3 px-6"><input v-model="editForm.frequency" class="border p-1 rounded w-full"></td>
              <td class="py-3 px-6"><input v-model="editForm.assignee" class="border p-1 rounded w-full" placeholder="負責人"></td>
              <td class="py-3 px-6"><input v-model="editForm.status" class="border p-1 rounded w-full"></td>
              <td class="py-3 px-6 text-center">
                <button @click="updateItem(item.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">儲存</button>
                <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">取消</button>
              </td>
            </template>
            <template v-else>
              <td class="py-3 px-6 font-medium">{{ item.title }}</td>
              <td class="py-3 px-6">
                <div>{{ item.frequency }}</div>
                <div class="text-xs text-gray-500">{{ item.assignee }}</div>
              </td>
              <td class="py-3 px-6">
                <span :class="{'bg-green-200 text-green-600': item.status === '正常', 'bg-yellow-200 text-yellow-600': item.status !== '正常'}" class="py-1 px-3 rounded-full text-xs">
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button @click="startEdit(item)" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fas fa-edit"></i> 編輯</button>
                <button @click="deleteItem(item.id)" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i> 刪除</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      items: [],
      isLoading: false,
      editingId: null,
      editForm: {},
      newItem: { title: '', frequency: '', assignee: '', status: '正常' },
      searchQuery: '',
      statusFilter: ''
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                              (item.assignee && item.assignee.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStatus = this.statusFilter ? item.status === this.statusFilter : true;
        return matchesSearch && matchesStatus;
      });
    }
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "routines"));
        this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } finally {
        this.isLoading = false;
      }
    },
    async addItem() {
      if (!this.newItem.title) return alert('請輸入事項名稱');
      this.isLoading = true;
      try {
        await addDoc(collection(db, "routines"), this.newItem);
        this.newItem = { title: '', frequency: '', assignee: '', status: '正常' };
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteItem(id) {
      if (confirm('確定要刪除嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "routines", id));
          await this.fetchItems();
        } finally {
          this.isLoading = false;
        }
      }
    },
    startEdit(item) {
      this.editingId = item.id;
      this.editForm = { ...item };
    },
    cancelEdit() {
      this.editingId = null;
      this.editForm = {};
    },
    async updateItem(id) {
      this.isLoading = true;
      try {
        await updateDoc(doc(db, "routines", id), this.editForm);
        this.editingId = null;
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>
