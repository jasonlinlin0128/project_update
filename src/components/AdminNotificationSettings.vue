<template>
  <div>
    <!-- PWA Push Notifications -->
    <NotificationManager class="mb-6" />

    <!-- Email Notification Settings -->
    <div class="ios-card mb-6">
      <div class="ios-card-header flex justify-between items-center">
        <h3 class="ios-title-3">Email 通知設定</h3>
      </div>
      <div class="ios-card-body">
      <!-- Info Banner -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm text-yellow-700">
          <p class="font-medium mb-1">功能開發中</p>
          <p>Email 通知功能需要後端服務（Firebase Cloud Functions）支援。目前您可以設定通知偏好，完整功能將在後續版本啟用。</p>
        </div>
      </div>

      <!-- Notification Settings Form -->
      <div class="space-y-6">
        <!-- Email Recipients -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">通知收件者</label>
          <div class="space-y-2">
            <div v-for="(email, index) in settings.recipients" :key="index" class="flex items-center space-x-2">
              <input 
                v-model="settings.recipients[index]" 
                type="email" 
                class="ios-input flex-1" 
                placeholder="輸入 Email 地址"
              >
              <button 
                @click="removeRecipient(index)" 
                class="text-red-500 hover:text-red-700 p-2"
                v-if="settings.recipients.length > 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <button @click="addRecipient" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新增收件者
            </button>
          </div>
        </div>

        <!-- Notification Frequency -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">報告頻率</label>
          <select v-model="settings.frequency" class="ios-input w-full md:w-64">
            <option value="daily">每天</option>
            <option value="weekly">每週</option>
            <option value="biweekly">每兩週</option>
            <option value="monthly">每月</option>
          </select>
        </div>

        <!-- Notification Types -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">通知內容</label>
          <div class="space-y-3">
            <label class="flex items-center">
              <input type="checkbox" v-model="settings.includeProjects" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="ml-2 text-sm text-gray-700">專案進度摘要</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="settings.includeRoutines" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="ml-2 text-sm text-gray-700">例行公事狀態</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="settings.includeEvents" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="ml-2 text-sm text-gray-700">活動與接洽更新</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="settings.includeAlerts" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="ml-2 text-sm text-gray-700">異常警報（例行公事逾期等）</span>
            </label>
          </div>
        </div>

        <!-- Send Day -->
        <div v-if="settings.frequency !== 'daily'">
          <label class="block text-sm font-medium text-gray-700 mb-2">發送時間</label>
          <select v-model="settings.sendDay" class="ios-input w-full md:w-64">
            <option value="monday">週一</option>
            <option value="tuesday">週二</option>
            <option value="wednesday">週三</option>
            <option value="thursday">週四</option>
            <option value="friday">週五</option>
          </select>
        </div>

        <!-- Save Button -->
        <div class="pt-4 border-t border-gray-100">
          <button 
            @click="saveSettings" 
            :disabled="isSaving"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 flex items-center"
          >
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving ? '儲存中...' : '儲存設定' }}
          </button>
        </div>
      </div>

      <!-- Success Toast -->
      <div v-if="showToast" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-up z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        設定已儲存！
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { doc, getDoc, setDoc } from "firebase/firestore";
import NotificationManager from './NotificationManager.vue';

export default {
  name: 'AdminNotificationSettings',
  components: {
    NotificationManager
  },
  data() {
    return {
      settings: {
        recipients: [''],
        frequency: 'weekly',
        sendDay: 'monday',
        includeProjects: true,
        includeRoutines: true,
        includeEvents: true,
        includeAlerts: true
      },
      isSaving: false,
      showToast: false
    }
  },
  async mounted() {
    await this.loadSettings();
  },
  methods: {
    async loadSettings() {
      try {
        const docRef = doc(db, "settings", "notifications");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.settings = { ...this.settings, ...docSnap.data() };
          if (!this.settings.recipients || this.settings.recipients.length === 0) {
            this.settings.recipients = [''];
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    },
    async saveSettings() {
      this.isSaving = true;
      try {
        // Filter out empty emails
        const cleanedSettings = {
          ...this.settings,
          recipients: this.settings.recipients.filter(email => email.trim() !== '')
        };
        
        await setDoc(doc(db, "settings", "notifications"), cleanedSettings);
        
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      } catch (error) {
        console.error("Error saving notification settings:", error);
        alert("儲存失敗，請稍後再試");
      } finally {
        this.isSaving = false;
      }
    },
    addRecipient() {
      this.settings.recipients.push('');
    },
    removeRecipient(index) {
      this.settings.recipients.splice(index, 1);
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
