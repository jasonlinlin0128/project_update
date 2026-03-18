<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Firebase 資料檢視器</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Routines -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-bold mb-3">例行公事 ({{ routines.length }})</h3>
        <div v-for="item in routines" :key="item.id" class="mb-2 p-2 bg-gray-50 rounded">
          <div class="font-medium">{{ item.title }}</div>
          <div class="text-sm text-gray-600">{{ item.frequency }} - {{ item.assignee }}</div>
        </div>
      </div>

      <!-- Forums -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-bold mb-3">論壇/分享會 ({{ forums.length }})</h3>
        <div v-for="item in forums" :key="item.id" class="mb-2 p-2 bg-gray-50 rounded">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-sm text-gray-600">{{ item.date }} - {{ item.role }}</div>
        </div>
      </div>

      <!-- Events -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-bold mb-3">活動參與 ({{ events.length }})</h3>
        <div v-for="item in events" :key="item.id" class="mb-2 p-2 bg-gray-50 rounded">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-sm text-gray-600">{{ item.date }} - {{ item.location }}</div>
        </div>
      </div>

      <!-- Coordination -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-bold mb-3">活動接洽 ({{ coordination.length }})</h3>
        <div v-for="item in coordination" :key="item.id" class="mb-2 p-2 bg-gray-50 rounded">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-sm text-gray-600">{{ item.contact }} - {{ item.status }}</div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <button @click="refreshData" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        刷新資料
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      routines: [],
      forums: [],
      events: [],
      coordination: []
    }
  },
  async mounted() {
    await this.refreshData();
  },
  methods: {
    async refreshData() {
      console.log('🔍 檢查 Firebase 資料...');
      
      try {
        const routinesSnapshot = await getDocs(collection(db, "routines"));
        this.routines = routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📋 Routines:', this.routines);

        const forumsSnapshot = await getDocs(collection(db, "forums"));
        this.forums = forumsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('💬 Forums:', this.forums);

        const eventsSnapshot = await getDocs(collection(db, "events"));
        this.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('🎉 Events:', this.events);

        const coordinationSnapshot = await getDocs(collection(db, "coordination"));
        this.coordination = coordinationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('🤝 Coordination:', this.coordination);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    }
  }
}
</script>
