// Firebase Messaging Service Worker
// 這個檔案必須放在 public/ 根目錄才能正常運作

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 配置（與 src/firebase.js 相同）
firebase.initializeApp({
    apiKey: "AIzaSyBlOglfZtVNC3wkH8FzxPRWpZjbioOisKA",
    authDomain: "project-update-ab874.firebaseapp.com",
    projectId: "project-update-ab874",
    storageBucket: "project-update-ab874.firebasestorage.app",
    messagingSenderId: "149051930119",
    appId: "1:149051930119:web:fa2be596b9c047fdb4dca2"
});

const messaging = firebase.messaging();

// 處理背景訊息（當 App 不在前景時）
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 收到背景訊息:', payload);

    const notificationTitle = payload.notification?.title || '專案儀表板';
    const notificationOptions = {
        body: payload.notification?.body || '您有新的通知',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: payload.data?.tag || 'default',
        data: {
            url: payload.data?.url || '/',
            ...payload.data
        },
        // 讓通知震動（手機）
        vibrate: [100, 50, 100],
        // 通知不會自動關閉
        requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 處理通知點擊事件
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 通知被點擊:', event.notification.tag);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    // 嘗試聚焦到已開啟的視窗，否則開啟新視窗
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // 找到已開啟的視窗
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // 沒有開啟的視窗，開啟新的
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Service Worker 安裝事件
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker 安裝中...');
    self.skipWaiting(); // 立即啟用新版本
});

// Service Worker 啟用事件
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker 已啟用');
    event.waitUntil(clients.claim()); // 立即接管所有頁面
});

// ── Routine Notification Scheduler ───────────────────────────────────
const scheduledTimers = []

self.addEventListener('message', async (event) => {
  if (event.data?.type !== 'SCHEDULE_ROUTINE_NOTIFICATIONS') return

  // Clear previous timers
  scheduledTimers.forEach(t => clearTimeout(t))
  scheduledTimers.length = 0

  try {
    // Fetch today's routines from Firestore REST API (no SDK in SW)
    const projectId = 'project-update-ab874'
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/routines`
    const res = await fetch(url)
    const json = await res.json()
    const docs = json.documents || []

    const now = new Date()
    const todayDayOfWeek = now.getDay()  // 0=日, 1=一 ... 6=六

    docs.forEach(doc => {
      const fields = doc.fields || {}
      const startTime = fields.startTime?.stringValue
      const title = fields.title?.stringValue
      const frequencyType = fields.frequencyType?.stringValue

      // Only schedule tasks with a startTime
      if (!startTime || !title) return
      if (!['Daily', 'Weekly', 'Rotation'].includes(frequencyType)) return

      // For Weekly routines, check if today is a valid day
      if (frequencyType === 'Weekly') {
        const daysOfWeek = (fields.daysOfWeek?.arrayValue?.values || [])
          .map(v => Number(v.integerValue ?? v.doubleValue))
        if (!daysOfWeek.includes(todayDayOfWeek)) return
      }

      const [h, m] = startTime.split(':').map(Number)
      const notifTime = new Date()
      notifTime.setHours(h, m - 5, 0, 0)  // 5 minutes before

      const delay = notifTime - now
      if (delay < 0) return  // already passed

      const timer = setTimeout(() => {
        self.registration.showNotification(`⏰ 即將開始：${title}`, {
          body: `${startTime} 的例行公事將在 5 分鐘後開始`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: `routine-${title}`,
          vibrate: [100, 50, 100],
          data: { url: '/routines' }
        })
      }, delay)

      scheduledTimers.push(timer)
    })

    console.log(`[SW] Scheduled ${scheduledTimers.length} routine notifications for today`)
  } catch (e) {
    console.warn('[SW] Failed to schedule routine notifications:', e)
  }
})
// ─────────────────────────────────────────────────────────────────────
