<template>
  <div class="notification-manager">
    <!-- 通知狀態卡片 -->
    <div class="ios-card p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center"
             :class="isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
          <i class="fas fa-bell text-xl"></i>
        </div>
        <div>
          <h3 class="font-semibold text-lg">推播通知</h3>
          <p class="text-sm text-gray-500">
            {{ statusText }}
          </p>
        </div>
      </div>

      <!-- 權限狀態 -->
      <div v-if="!isSupported" class="text-amber-600 bg-amber-50 rounded-lg p-4 mb-4">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        您的瀏覽器不支援推播通知
      </div>

      <div v-else-if="permission === 'denied'" class="text-red-600 bg-red-50 rounded-lg p-4 mb-4">
        <i class="fas fa-times-circle mr-2"></i>
        通知權限已被封鎖，請在瀏覽器設定中允許通知
      </div>

      <!-- 操作按鈕 -->
      <div v-else class="space-y-3">
        <button
          v-if="!isEnabled"
          @click="enableNotifications"
          :disabled="isLoading"
          class="w-full ios-btn-primary flex items-center justify-center gap-2"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-bell"></i>
          {{ isLoading ? '啟用中...' : '啟用推播通知' }}
        </button>

        <button
          v-else
          @click="disableNotifications"
          :disabled="isLoading"
          class="w-full ios-btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-2"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-bell-slash"></i>
          {{ isLoading ? '處理中...' : '停用推播通知' }}
        </button>
      </div>

      <!-- 通知類型設定 -->
      <div v-if="isEnabled" class="mt-6 pt-6 border-t border-gray-200">
        <h4 class="font-medium mb-4">通知類型</h4>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <span class="text-gray-700">專案更新</span>
            <input type="checkbox" v-model="settings.projectUpdates" @change="saveSettings" class="ios-toggle">
          </label>
          <label class="flex items-center justify-between">
            <span class="text-gray-700">例行任務提醒</span>
            <input type="checkbox" v-model="settings.routineReminders" @change="saveSettings" class="ios-toggle">
          </label>
          <label class="flex items-center justify-between">
            <span class="text-gray-700">活動通知</span>
            <input type="checkbox" v-model="settings.eventNotifications" @change="saveSettings" class="ios-toggle">
          </label>
          <label class="flex items-center justify-between">
            <span class="text-gray-700">接洽進度</span>
            <input type="checkbox" v-model="settings.coordinationUpdates" @change="saveSettings" class="ios-toggle">
          </label>
        </div>
      </div>

      <!-- 測試按鈕 -->
      <div v-if="isEnabled" class="mt-4">
        <button
          @click="sendTestNotification"
          class="text-sm text-indigo-600 hover:text-indigo-700"
        >
          <i class="fas fa-paper-plane mr-1"></i>
          發送測試通知
        </button>
      </div>
    </div>

    <!-- iOS 提示 -->
    <div v-if="isIOS && !isStandalone" class="ios-card p-4 mt-4 bg-blue-50 border-blue-200">
      <div class="flex gap-3">
        <i class="fas fa-info-circle text-blue-500 mt-1"></i>
        <div>
          <p class="font-medium text-blue-800">iOS 用戶提示</p>
          <p class="text-sm text-blue-700 mt-1">
            若要接收推播通知，請先點擊 Safari 分享按鈕 
            <i class="fas fa-share-square"></i>，
            然後選擇「加入主畫面」。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, messaging, getToken, onMessage } from '@/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 🔑 VAPID Key - 需要從 Firebase Console 取得
// Firebase Console → 專案設定 → Cloud Messaging → Web 設定 → 產生金鑰對
const VAPID_KEY = 'BJFkE669ZB7pc5oGfrl8Qzyu1Pu5MaWbynViKQIn41fp3IaBv2lCESX0Kn_d9t4pCa79jHjKyLlhGeXzqToTDcM';

export default {
  name: 'NotificationManager',
  data() {
    return {
      isLoading: false,
      isEnabled: false,
      permission: 'default',
      fcmToken: null,
      settings: {
        projectUpdates: true,
        routineReminders: true,
        eventNotifications: true,
        coordinationUpdates: true
      }
    };
  },
  computed: {
    isSupported() {
      return 'Notification' in window && 'serviceWorker' in navigator && messaging !== null;
    },
    isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone === true;
    },
    statusText() {
      if (!this.isSupported) return '不支援';
      if (this.permission === 'denied') return '已封鎖';
      if (this.isEnabled) return '已啟用';
      return '未啟用';
    }
  },
  async mounted() {
    this.permission = Notification.permission;
    await this.checkCurrentStatus();
    this.setupForegroundListener();
  },
  methods: {
    async checkCurrentStatus() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'notificationTokens', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.isEnabled = true;
          this.fcmToken = docSnap.data().token;
          this.settings = docSnap.data().settings || this.settings;
        }
      } catch (e) {
        console.error('檢查通知狀態失敗:', e);
      }
    },

    async enableNotifications() {
      if (!this.isSupported) return;

      this.isLoading = true;
      try {
        // 1. 請求通知權限
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        if (permission !== 'granted') {
          throw new Error('通知權限未獲授權');
        }

        // 2. 註冊 Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker 已註冊:', registration);

        // 3. 取得 FCM Token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) {
          throw new Error('無法取得 FCM Token');
        }

        console.log('FCM Token:', token);
        this.fcmToken = token;

        // 4. 儲存 Token 到 Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, 'notificationTokens', user.uid), {
            token: token,
            settings: this.settings,
            createdAt: new Date(),
            platform: this.isIOS ? 'ios' : 'android/web',
            userAgent: navigator.userAgent
          });
        }

        this.isEnabled = true;
        
        // 顯示成功通知
        new Notification('通知已啟用 ✓', {
          body: '您將收到專案儀表板的推播通知',
          icon: '/icons/icon-192x192.png'
        });

      } catch (error) {
        console.error('啟用通知失敗:', error);
        alert('啟用通知失敗: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async disableNotifications() {
      this.isLoading = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          await deleteDoc(doc(db, 'notificationTokens', user.uid));
        }
        this.isEnabled = false;
        this.fcmToken = null;
      } catch (error) {
        console.error('停用通知失敗:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async saveSettings() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && this.fcmToken) {
        try {
          await setDoc(doc(db, 'notificationTokens', user.uid), {
            token: this.fcmToken,
            settings: this.settings,
            updatedAt: new Date()
          }, { merge: true });
        } catch (e) {
          console.error('儲存設定失敗:', e);
        }
      }
    },

    setupForegroundListener() {
      if (!messaging) return;
      
      // 當 App 在前景時接收訊息
      onMessage(messaging, (payload) => {
        console.log('收到前景訊息:', payload);
        
        // 顯示瀏覽器通知
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || '專案儀表板', {
            body: payload.notification?.body,
            icon: '/icons/icon-192x192.png'
          });
        }
      });
    },

    sendTestNotification() {
      if (Notification.permission === 'granted') {
        new Notification('測試通知 🎉', {
          body: '如果您看到這則通知，表示推播功能運作正常！',
          icon: '/icons/icon-192x192.png',
          tag: 'test'
        });
      }
    }
  }
};
</script>

<style scoped>
.ios-toggle {
  appearance: none;
  width: 51px;
  height: 31px;
  background: #e5e5ea;
  border-radius: 31px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.ios-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.3s;
}

.ios-toggle:checked {
  background: #34c759;
}

.ios-toggle:checked::before {
  transform: translateX(20px);
}
</style>
