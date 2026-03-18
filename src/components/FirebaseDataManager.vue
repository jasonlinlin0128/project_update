<template>
  <div class="ios-card mb-6">
    <div class="ios-card-header">
      <div class="flex items-center justify-between">
        <h3 class="ios-title-3">🔍 Firebase 資料管理</h3>
        <div class="flex gap-2">
          <button @click="refreshAllData" class="ios-btn ios-btn-secondary ios-btn-sm">
            刷新資料
          </button>
          <button @click="triggerSeed" class="ios-btn ios-btn-primary ios-btn-sm">
            補充真實資料
          </button>
        </div>
      </div>
    </div>
    
    <div class="ios-card-body">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div class="text-sm text-gray-600 mb-1">例行公事</div>
          <div class="text-2xl font-bold text-blue-600">{{ routines.length }}</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <div class="text-sm text-gray-600 mb-1">論壇/分享會</div>
          <div class="text-2xl font-bold text-green-600">{{ forums.length }}</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div class="text-sm text-gray-600 mb-1">活動參與</div>
          <div class="text-2xl font-bold text-purple-600">{{ events.length }}</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
          <div class="text-sm text-gray-600 mb-1">活動接洽</div>
          <div class="text-2xl font-bold text-orange-600">{{ coordination.length }}</div>
        </div>
      </div>

      <!-- Data Grids -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Routines -->
        <div>
          <h4 class="ios-headline mb-3">📋 例行公事</h4>
          <div class="space-y-2">
            <div v-for="item in routines" :key="item.id" class="ios-list-item">
              <div class="font-medium">{{ item.title }}</div>
              <div class="ios-caption">{{ item.frequency }} • {{ item.assignee }}</div>
              <span :class="item.status === '正常' ? 'ios-status ios-status-green' : 'ios-status ios-status-red'">
                {{ item.status }}
              </span>
            </div>
            <div v-if="routines.length === 0" class="text-center py-8 text-gray-400">
              暫無資料
            </div>
          </div>
        </div>

        <!-- Forums -->
        <div>
          <h4 class="ios-headline mb-3">💬 論壇/分享會</h4>
          <div class="space-y-2">
            <div v-for="item in forums" :key="item.id" class="ios-list-item">
              <div class="font-medium">{{ item.name }}</div>
              <div class="ios-caption">{{ item.date }} • {{ item.role }}</div>
              <div v-if="item.speaker" class="ios-caption">講者：{{ item.speaker }}</div>
            </div>
            <div v-if="forums.length === 0" class="text-center py-8 text-gray-400">
              暫無資料
            </div>
          </div>
        </div>

        <!-- Events -->
        <div>
          <h4 class="ios-headline mb-3">🎉 活動參與</h4>
          <div class="space-y-2">
            <div v-for="item in events" :key="item.id" class="ios-list-item">
              <div class="font-medium">{{ item.name }}</div>
              <div class="ios-caption">{{ item.date }} • {{ item.location }}</div>
              <div v-if="item.organizer" class="ios-caption">主辦：{{ item.organizer }}</div>
            </div>
            <div v-if="events.length === 0" class="text-center py-8 text-gray-400">
              暫無資料
            </div>
          </div>
        </div>

        <!-- Coordination -->
        <div>
          <h4 class="ios-headline mb-3">🤝 活動接洽</h4>
          <div class="space-y-2">
            <div v-for="item in coordination" :key="item.id" class="ios-list-item">
              <div class="font-medium">{{ item.name }}</div>
              <div class="ios-caption">{{ item.contact }}</div>
              <span :class="getStatusClass(item.status)">{{ item.status }}</span>
            </div>
            <div v-if="coordination.length === 0" class="text-center py-8 text-gray-400">
              暫無資料
            </div>
          </div>
        </div>
      </div>

      <!-- Seed Status -->
      <div v-if="seedStatus" class="mt-6 p-4 rounded-lg" :class="seedStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'">
        {{ seedStatus.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";
import { migrateLegacyData } from '../migrateLegacyData';

export default {
  data() {
    return {
      routines: [],
      forums: [],
      events: [],
      coordination: [],
      seedStatus: null
    }
  },
  async mounted() {
    await this.refreshAllData();
  },
  methods: {
    async refreshAllData() {
      console.log('🔄 刷新所有資料...');
      
      try {
        const routinesSnapshot = await getDocs(collection(db, "routines"));
        this.routines = routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📋 Routines:', this.routines.length);

        const forumsSnapshot = await getDocs(collection(db, "forums"));
        this.forums = forumsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('💬 Forums:', this.forums.length);

        const eventsSnapshot = await getDocs(collection(db, "events"));
        this.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('🎉 Events:', this.events.length);

        const coordinationSnapshot = await getDocs(collection(db, "coordination"));
        this.coordination = coordinationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('🤝 Coordination:', this.coordination.length);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    },
    async triggerSeed() {
      this.seedStatus = { type: 'info', message: '⏳ 正在補充真實資料...' };
      
      try {
        await migrateLegacyData();
        this.seedStatus = { type: 'success', message: '✅ 真實資料補充完成！正在刷新...' };
        
        // 刷新資料以顯示最新內容
        setTimeout(async () => {
          await this.refreshAllData();
          this.seedStatus = null;
        }, 2000);
      } catch (error) {
        console.error('❌ Seed error:', error);
        this.seedStatus = { type: 'error', message: '❌ 資料補充失敗：' + error.message };
      }
    },
    getStatusClass(status) {
      if (status === '接洽中') return 'ios-status ios-status-orange';
      if (status === '已完成') return 'ios-status ios-status-green';
      return 'ios-status ios-status-gray';
    }
  }
}
</script>
