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
          <tr v-for="item in items" :key="item.id" class="border-b border-gray-200 hover:bg-gray-50">
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
      newItem: { title: '', frequency: '', assignee: '', status: '正常' }
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
