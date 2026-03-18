<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-gray-800">允許名單管理</h3>
      <span class="text-sm text-gray-500">僅列出的 Email 可登入後台</span>
    </div>
    
    <div class="p-6">
      <!-- Add New Email -->
      <div class="flex gap-3 mb-8">
        <input 
          v-model="newEmail" 
          type="email" 
          placeholder="輸入 Gmail 地址 (例如: user@gmail.com)" 
          class="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          @keyup.enter="addEmail"
        >
        <button 
          @click="addEmail" 
          :disabled="!isValidEmail || loading"
          class="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          新增
        </button>
      </div>

      <!-- Whitelist Table -->
      <div v-if="isLoadingList" class="text-center py-8 text-gray-500">
        載入中...
      </div>
      <div v-else-if="whitelist.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
        目前沒有允許名單，請新增您的 Email 以確保下次能登入。
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-gray-400 text-sm border-b border-gray-100">
              <th class="py-3 font-medium pl-4">Email</th>
              <th class="py-3 font-medium">加入時間</th>
              <th class="py-3 font-medium text-right pr-4">操作</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr v-for="user in whitelist" :key="user.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 pl-4 font-medium text-gray-800">{{ user.email }}</td>
              <td class="py-3 text-sm">{{ formatDate(user.createdAt) }}</td>
              <td class="py-3 text-right pr-4">
                <button 
                  @click="removeEmail(user.id, user.email)" 
                  class="text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  移除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

export default {
  name: 'AdminWhitelist',
  data() {
    return {
      newEmail: '',
      whitelist: [],
      loading: false,
      isLoadingList: true
    }
  },
  computed: {
    isValidEmail() {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newEmail);
    }
  },
  async mounted() {
    await this.fetchWhitelist();
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return '-';
      return new Date(timestamp.seconds * 1000).toLocaleDateString('zh-TW');
    },
    async fetchWhitelist() {
      this.isLoadingList = true;
      try {
        const q = query(collection(db, "whitelisted_users"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        this.whitelist = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching whitelist: ", error);
        // If collection doesn't exist or index missing, it might fail gracefully or throw
        // For now, assume it works or returns empty
      } finally {
        this.isLoadingList = false;
      }
    },
    async addEmail() {
      if (!this.isValidEmail) return;
      
      this.loading = true;
      try {
        // Check if already exists (client-side check for simplicity, ideally server-side or query)
        const exists = this.whitelist.some(u => u.email.toLowerCase() === this.newEmail.toLowerCase());
        if (exists) {
          alert("此 Email 已經在名單中");
          this.loading = false;
          return;
        }

        await addDoc(collection(db, "whitelisted_users"), {
          email: this.newEmail.toLowerCase(),
          createdAt: serverTimestamp()
        });
        
        this.newEmail = '';
        await this.fetchWhitelist();
        alert("新增成功！");
      } catch (error) {
        console.error("Error adding email: ", error);
        alert("新增失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },
    async removeEmail(id, email) {
      if (!confirm(`確定要移除 ${email} 嗎？此用戶將無法再登入後台。`)) return;
      
      try {
        await deleteDoc(doc(db, "whitelisted_users", id));
        await this.fetchWhitelist();
      } catch (error) {
        console.error("Error removing email: ", error);
        alert("移除失敗");
      }
    }
  }
}
</script>
