import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/tailwind.css'
import './assets/css/ios.css'
import { auth } from './firebase'
import { onAuthStateChanged } from "firebase/auth";
import { migrateLegacyData } from './migrateLegacyData'

console.log('🚀 Main.js starting...');

// 註冊 PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('✅ Service Worker 已註冊:', registration.scope);
            })
            .catch((error) => {
                console.warn('⚠️ Service Worker 註冊失敗:', error);
            });
    });
}

// Migrate legacy data from old system on startup
migrateLegacyData().then(() => {
    console.log('Legacy data migration complete, mounting app...');
});

// Mount immediately to ensure UI shows up
createApp(App).use(router).mount('#app');
console.log('✅ App mounted immediately');

onAuthStateChanged(auth, (user) => {
    console.log('👤 Auth state changed:', user ? 'Logged in' : 'Logged out');
});

