<template>
  <div class="relative">
    <div class="relative">
      <input 
        v-model="query"
        @focus="showResults = true"
        @input="search"
        type="text"
        placeholder="全域搜尋..."
        class="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
      >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
        <span class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block"></span>
      </span>
    </div>
    
    <!-- Results Dropdown -->
    <div v-if="showResults && (results.length > 0 || query.length >= 2)" 
         class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50">
      
      <div v-if="results.length === 0 && query.length >= 2 && !isSearching" class="p-4 text-center text-gray-400 text-sm">
        找不到 "{{ query }}" 相關結果
      </div>
      
      <div v-for="(group, key) in groupedResults" :key="key">
        <div class="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
          {{ groupLabels[key] }} ({{ group.length }})
        </div>
        <div 
          v-for="item in group.slice(0, 5)" 
          :key="item.id"
          @click="selectResult(key, item)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50"
        >
          <span class="text-xl">{{ groupIcons[key] }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 truncate">{{ item.name || item.title }}</p>
            <p class="text-xs text-gray-400 truncate">{{ getSubtext(key, item) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Click outside to close -->
    <div v-if="showResults" class="fixed inset-0 z-40" @click="showResults = false"></div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default {
  name: 'GlobalSearch',
  data() {
    return {
      query: '',
      results: [],
      isSearching: false,
      showResults: false,
      searchTimeout: null,
      groupLabels: {
        projects: '專案',
        routines: '例行公事',
        forums: '論壇/分享',
        events: '活動',
        coordination: '接洽'
      },
      groupIcons: {
        projects: '📊',
        routines: '📝',
        forums: '💬',
        events: '🎉',
        coordination: '🤝'
      }
    };
  },
  computed: {
    groupedResults() {
      const groups = {};
      for (const result of this.results) {
        if (!groups[result._type]) {
          groups[result._type] = [];
        }
        groups[result._type].push(result);
      }
      return groups;
    }
  },
  methods: {
    search() {
      clearTimeout(this.searchTimeout);
      
      if (this.query.length < 2) {
        this.results = [];
        return;
      }
      
      this.searchTimeout = setTimeout(async () => {
        this.isSearching = true;
        this.results = [];
        
        const collections = ['projects', 'routines', 'forums', 'events', 'coordination'];
        const q = this.query.toLowerCase();
        
        try {
          for (const coll of collections) {
            const snapshot = await getDocs(collection(db, coll));
            const matches = snapshot.docs
              .map(doc => ({ id: doc.id, _type: coll, ...doc.data() }))
              .filter(item => {
                const searchFields = [
                  item.name, item.title, item.contact, 
                  item.speaker, item.location, item.description,
                  item.notes, item.owner, item.department
                ].filter(Boolean);
                return searchFields.some(f => f.toLowerCase().includes(q));
              });
            this.results.push(...matches);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          this.isSearching = false;
        }
      }, 300);
    },
    getSubtext(type, item) {
      switch (type) {
        case 'projects': return `${item.department || ''} • ${item.status || ''}`;
        case 'routines': return item.frequencyType || '';
        case 'forums': return `${item.date || ''} • ${item.type === 'internal' ? '內部' : '外部'}`;
        case 'events': return `${item.date || ''} • ${item.location || ''}`;
        case 'coordination': return `${item.contact || ''} • ${item.status || ''}`;
        default: return '';
      }
    },
    selectResult(type, item) {
      this.showResults = false;
      this.query = '';
      this.$emit('select', { type, item });
    }
  }
}
</script>
