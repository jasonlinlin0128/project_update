<template>
  <div class="ios-card mb-6">
    <div class="ios-card-header flex justify-between items-center">
      <h3 class="ios-title-3">Magic Link 管理</h3>
      <button @click="generateLink" :disabled="isGenerating" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-medium shadow-sm">
        <svg v-if="isGenerating" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        產生新連結
      </button>
    </div>
    <div class="ios-card-body">
      <!-- Info Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-blue-700">
          <p class="font-medium mb-1">什麼是 Magic Link？</p>
          <p>Magic Link 可讓老闆和主管<strong>無需登入</strong>即可查看儀表板。只需分享連結，對方就能以唯讀模式瀏覽所有資料。</p>
        </div>
      </div>

      <!-- Links Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
              <th class="py-4 px-6">連結名稱</th>
              <th class="py-4 px-6">建立時間</th>
              <th class="py-4 px-6">過期時間</th>
              <th class="py-4 px-6">狀態</th>
              <th class="py-4 px-6 text-center">操作</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr v-for="link in magicLinks" :key="link.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
              <td class="py-4 px-6 font-medium text-gray-800">{{ link.name }}</td>
              <td class="py-4 px-6">{{ formatDate(link.createdAt) }}</td>
              <td class="py-4 px-6">{{ link.expiresAt ? formatDate(link.expiresAt) : '永不過期' }}</td>
              <td class="py-4 px-6">
                <span :class="isExpired(link) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" class="py-1 px-3 rounded-full text-xs font-bold inline-block min-w-[60px] text-center">
                  {{ isExpired(link) ? '已過期' : '有效' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex justify-center space-x-2">
                  <button @click="copyLink(link)" class="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50" title="複製連結">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  <button @click="deleteLink(link.id)" class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50" title="刪除">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="magicLinks.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-400">
                <div class="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p>尚未建立任何 Magic Link</p>
                  <p class="text-sm mt-1">點擊「產生新連結」開始建立</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Copy Success Toast -->
      <div v-if="showCopyToast" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-up z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        連結已複製到剪貼簿！
      </div>
    </div>

    <!-- Generate Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-xl font-bold text-gray-800">產生 Magic Link</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">連結名稱 <span class="text-red-500">*</span></label>
            <input v-model="newLinkName" class="ios-input w-full" placeholder="例如：給老闆的連結">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">過期設定</label>
            <select v-model="expireDays" class="ios-input w-full">
              <option :value="0">永不過期</option>
              <option :value="7">7 天後過期</option>
              <option :value="30">30 天後過期</option>
              <option :value="90">90 天後過期</option>
            </select>
          </div>
        </div>
        <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button @click="showModal = false" class="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium">取消</button>
          <button @click="confirmGenerateLink" :disabled="!newLinkName.trim()" class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md disabled:opacity-50">
            產生連結
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";

export default {
  name: 'AdminMagicLinks',
  data() {
    return {
      magicLinks: [],
      isGenerating: false,
      showModal: false,
      showCopyToast: false,
      newLinkName: '',
      expireDays: 0
    }
  },
  async mounted() {
    await this.fetchLinks();
  },
  methods: {
    async fetchLinks() {
      try {
        const querySnapshot = await getDocs(collection(db, "magicLinks"));
        this.magicLinks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by creation date, newest first
        this.magicLinks.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      } catch (error) {
        console.error("Error fetching magic links:", error);
      }
    },
    generateLink() {
      this.newLinkName = '';
      this.expireDays = 0;
      this.showModal = true;
    },
    async confirmGenerateLink() {
      if (!this.newLinkName.trim()) return;

      this.isGenerating = true;
      this.showModal = false;

      try {
        const token = this.generateToken();
        const now = new Date();
        const expiresAt = this.expireDays > 0 
          ? Timestamp.fromDate(new Date(now.getTime() + this.expireDays * 24 * 60 * 60 * 1000))
          : null;

        await addDoc(collection(db, "magicLinks"), {
          name: this.newLinkName.trim(),
          token: token,
          createdAt: Timestamp.fromDate(now),
          expiresAt: expiresAt
        });

        await this.fetchLinks();
      } catch (error) {
        console.error("Error generating magic link:", error);
        alert("產生連結失敗，請稍後再試");
      } finally {
        this.isGenerating = false;
      }
    },
    generateToken() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    async deleteLink(id) {
      if (confirm('確定要刪除此連結嗎？刪除後使用該連結的人將無法存取。')) {
        try {
          await deleteDoc(doc(db, "magicLinks", id));
          await this.fetchLinks();
        } catch (error) {
          console.error("Error deleting magic link:", error);
        }
      }
    },
    copyLink(link) {
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/view/${link.token}`;
      
      navigator.clipboard.writeText(fullUrl).then(() => {
        this.showCopyToast = true;
        setTimeout(() => {
          this.showCopyToast = false;
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopyToast = true;
        setTimeout(() => {
          this.showCopyToast = false;
        }, 3000);
      });
    },
    formatDate(timestamp) {
      if (!timestamp) return '-';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    isExpired(link) {
      if (!link.expiresAt) return false;
      const expiresDate = link.expiresAt.toDate ? link.expiresAt.toDate() : new Date(link.expiresAt);
      return expiresDate < new Date();
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
