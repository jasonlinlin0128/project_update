<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" @click="close"></div>

        <!-- Modal panel -->
        <div class="relative inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-macos-modal"
             @click.stop>
          
          <!-- Header -->
          <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ task.name }}</h3>
                  <p class="text-sm text-gray-500">{{ task.category }}</p>
                </div>
              </div>
              <button @click="close" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
            
            <!-- Status & Progress -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="macos-card p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div class="text-sm text-gray-600 mb-1">狀態</div>
                <div class="flex items-center gap-2">
                  <span :class="{
                    'status-active': task.status === '正常',
                    'status-delayed': task.status === '延遲',
                    'status-pending': task.status === '暫停'
                  }">{{ task.status || '正常' }}</span>
                  <span :class="{
                    'bg-red-50 text-red-600': task.priority === '高',
                    'bg-yellow-50 text-yellow-600': task.priority === '中',
                    'bg-green-50 text-green-600': task.priority === '低'
                  }" class="px-2 py-0.5 rounded text-xs font-medium">
                    {{ task.priority || '中' }}
                  </span>
                </div>
              </div>
              
              <div class="macos-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <div class="text-sm text-gray-600 mb-1">完成率</div>
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                           :style="{width: (task.completionRate || 100) + '%'}"></div>
                    </div>
                  </div>
                  <span class="font-bold text-green-600">{{ task.completionRate || 100 }}%</span>
                </div>
              </div>
              
              <div class="macos-card p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <div class="text-sm text-gray-600 mb-1">連續成功</div>
                <div class="text-2xl font-bold text-purple-600">{{ task.consecutiveSuccess || 0 }} 次</div>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="macos-card p-4 mb-6">
              <h4 class="font-bold text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                基本資訊
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">執行頻率：</span>
                  <span class="font-medium">{{ task.frequency }}</span>
                </div>
                <div>
                  <span class="text-gray-500">預估工時：</span>
                  <span class="font-medium">{{ task.estimatedTime || '未設定' }}</span>
                </div>
                <div>
                  <span class="text-gray-500">負責人：</span>
                  <span class="font-medium">{{ task.assignee }}</span>
                </div>
                <div v-if="task.backupAssignee">
                  <span class="text-gray-500">備援負責人：</span>
                  <span class="font-medium">{{ task.backupAssignee }}</span>
                </div>
                <div v-if="task.department">
                  <span class="text-gray-500">部門：</span>
                  <span class="font-medium">{{ task.department }}</span>
                </div>
                <div v-if="task.nextDueDate">
                  <span class="text-gray-500">下次執行：</span>
                  <span class="font-medium text-blue-600">{{ formatDate(task.nextDueDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="task.description" class="macos-card p-4 mb-6">
              <h4 class="font-bold text-gray-700 mb-2">📝 說明</h4>
              <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ task.description }}</p>
            </div>

            <!-- Checklist -->
            <div v-if="task.checklistItems && task.checklistItems.length > 0" class="macos-card p-4 mb-6">
              <h4 class="font-bold text-gray-700 mb-3">✅ 檢核項目</h4>
              <ul class="space-y-2">
                <li v-for="(item, index) in task.checklistItems" :key="index" 
                    class="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Notes & Risks -->
            <div v-if="task.notes || task.riskNote" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div v-if="task.notes" class="macos-card p-4 bg-blue-50">
                <h4 class="font-bold text-blue-700 mb-2 text-sm">💡 備註</h4>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.notes }}</p>
              </div>
              <div v-if="task.riskNote" class="macos-card p-4 bg-yellow-50">
                <h4 class="font-bold text-yellow-700 mb-2 text-sm">⚠️ 風險提醒</h4>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.riskNote }}</p>
              </div>
            </div>

            <!-- SOP Link -->
            <div v-if="task.sopLink" class="macos-card p-4 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <a :href="task.sopLink" target="_blank" 
                 class="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                查看 SOP 文件
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <!-- Execution History -->
            <div class="macos-card p-4">
              <h4 class="font-bold text-gray-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                執行歷史
              </h4>
              
              <div v-if="history && history.length > 0" class="space-y-3">
                <div v-for="record in history.slice(0, 10)" :key="record.id" 
                     class="flex items-start border-l-2 border-green-400 pl-4 py-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span :class="{
                        'text-green-600': record.status === '完成',
                        'text-yellow-600': record.status === '延遲完成',
                        'text-red-600': record.status === '失敗',
                        'text-gray-600': record.status === '跳過'
                      }" class="font-medium text-sm">
                        {{ record.status }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ formatDateTime(record.completedAt) }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-600">
                      <span>👤 {{ record.completedBy }}</span>
                      <span v-if="record.actualDuration" class="ml-3">⏱️ {{ record.actualDuration }}</span>
                    </div>
                    <p v-if="record.notes" class="text-xs text-gray-500 mt-1">{{ record.notes }}</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">尚無執行記錄</p>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div class="flex justify-end gap-3">
              <button @click="close" class="macos-button-secondary">
                關閉
              </button>
              <button v-if="task.sopLink" @click="openSOP" class="macos-button-primary">
                📖 查看 SOP
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default {
  name: 'RoutineDetailModal',
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      history: []
    };
  },
  watch: {
    async isOpen(newVal) {
      if (newVal && this.task.id) {
        await this.loadHistory();
      }
      // Lock body scroll when modal is open
      document.body.style.overflow = newVal ? 'hidden' : '';
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  },
  methods: {
    close() {
      this.$emit('close');
    },
    openSOP() {
      if (this.task.sopLink) {
        window.open(this.task.sopLink, '_blank');
      }
    },
    async loadHistory() {
      if (!this.task.id) return;
      
      try {
        const historyRef = collection(db, `routines/${this.task.id}/history`);
        const q = query(historyRef, orderBy('completedAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        
        this.history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Failed to load history:', error);
        this.history = [];
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-TW', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
