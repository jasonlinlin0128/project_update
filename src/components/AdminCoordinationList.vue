<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
    <h3 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
      <span class="w-2 h-8 bg-accent-yellow rounded-full mr-3"></span>
      活動接洽管理
    </h3>
    
    <!-- Add Form -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <input v-model="newItem.name" placeholder="活動/單位名稱" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow outline-none transition">
      <input v-model="newItem.contact" placeholder="聯絡人" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow outline-none transition">
      <input v-model="newItem.status" placeholder="接洽狀態" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow outline-none transition">
      <button @click="addItem" :disabled="isLoading" class="bg-accent-yellow text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition flex items-center justify-center font-medium shadow-sm hover:shadow">
        <span v-if="isLoading">處理中...</span>
        <span v-else>新增接洽</span>
      </button>
    </div>

    <!-- List -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
            <th class="py-4 px-6">活動/單位名稱</th>
            <th class="py-4 px-6">聯絡人</th>
            <th class="py-4 px-6">狀態</th>
            <th class="py-4 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <tr v-for="item in items" :key="item.id" class="border-b border-gray-100 hover:bg-yellow-50 transition duration-150">
            <template v-if="editingId === item.id">
              <td class="py-4 px-6"><input v-model="editForm.name" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-yellow outline-none"></td>
              <td class="py-4 px-6"><input v-model="editForm.contact" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-yellow outline-none"></td>
              <td class="py-4 px-6"><input v-model="editForm.status" class="border p-2 rounded w-full focus:ring-2 focus:ring-accent-yellow outline-none"></td>
              <td class="py-4 px-6 text-center">
                <button @click="updateItem(item.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition">儲存</button>
                <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">取消</button>
              </td>
            </template>
            <template v-else>
              <td class="py-4 px-6 font-bold text-gray-800">{{ item.name }}</td>
              <td class="py-4 px-6">{{ item.contact }}</td>
              <td class="py-4 px-6">
                <span :class="{'bg-green-100 text-green-700': item.status === '已完成', 'bg-yellow-100 text-yellow-700': item.status === '接洽中', 'bg-red-100 text-red-700': item.status === '失敗'}" class="py-1 px-3 rounded-full text-xs font-bold">
                  {{ item.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <button @click="startEdit(item)" class="text-accent-yellow hover:text-yellow-700 mr-3 transition"><i class="fas fa-edit"></i> 編輯</button>
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
      newItem: { name: '', contact: '', status: '接洽中' }
    }
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "coordination"));
        this.items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } finally {
        this.isLoading = false;
      }
    },
    async addItem() {
      if (!this.newItem.name) return alert('請輸入名稱');
      this.isLoading = true;
      try {
        await addDoc(collection(db, "coordination"), this.newItem);
        this.newItem = { name: '', contact: '', status: '接洽中' };
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteItem(id) {
      if (confirm('確定要刪除嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "coordination", id));
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
        await updateDoc(doc(db, "coordination", id), this.editForm);
        this.editingId = null;
        await this.fetchItems();
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>
