<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
    <h3 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
      <span class="w-2 h-8 bg-accent-pink rounded-full mr-3"></span>
      活動參與管理
    </h3>
    
    <!-- Add Form -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <input v-model="newItem.name" placeholder="活動名稱" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink outline-none transition">
      <input v-model="newItem.date" type="date" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink outline-none transition">
      <input v-model="newItem.location" placeholder="地點" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink outline-none transition">
      <button @click="addItem" :disabled="isLoading" class="bg-accent-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 transition flex items-center justify-center font-medium shadow-sm hover:shadow">
        <span v-if="isLoading">處理中...</span>
        <span v-else>新增活動</span>
      </button>
    </div>

    <!-- List -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
            <th class="py-4 px-6">日期</th>
            <th class="py-4 px-6">活動名稱</th>
            <th class="py-4 px-6">地點</th>
            <th class="py-4 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <tr v-for="item in items" :key="item.id" class="border-b border-gray-100 hover:bg-pink-50 transition duration-150">
            <template v-if="editingId === item.id">
              <td class="py-4 px-6"><input v-model="editForm.date" type="date" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-pink outline-none"></td>
              <td class="py-4 px-6"><input v-model="editForm.name" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-pink outline-none"></td>
              <td class="py-4 px-6"><input v-model="editForm.location" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-pink outline-none"></td>
              <td class="py-4 px-6 text-center">
                <button @click="updateItem(item.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition">儲存</button>
                <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">取消</button>
              </td>
            </template>
            <template v-else>
              <td class="py-4 px-6">{{ item.date }}</td>
              <td class="py-4 px-6 font-bold text-gray-800">{{ item.name }}</td>
              <td class="py-4 px-6 text-gray-500">{{ item.location }}</td>
              <td class="py-4 px-6 text-center">
                <button @click="startEdit(item)" class="text-accent-pink hover:text-pink-700 mr-3 transition"><i class="fas fa-edit"></i> 編輯</button>
                <button @click="deleteItem(item.id)" class="text-red-500 hover:text-red-700 transition"><i class="fas fa-trash"></i> 刪除</button>
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
      newItem: { name: '', date: '', location: '' }
    }
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } finally {
        this.isLoading = false;
      }
    },
    async addItem() {
      if (!this.newItem.name) return alert('請輸入活動名稱');
      this.isLoading = true;
      try {
        await addDoc(collection(db, "events"), this.newItem);
        this.newItem = { name: '', date: '', location: '' };
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteItem(id) {
      if (confirm('確定要刪除嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "events", id));
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
        await updateDoc(doc(db, "events", id), this.editForm);
        this.editingId = null;
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>
