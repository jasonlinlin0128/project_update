<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">分享會管理</h2>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增分享會
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" text="載入分享會資料..." />

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
      <span class="text-red-700 dark:text-red-400">{{ error }}</span>
      <button @click="sharingStore.loadSessions()" class="ml-4 text-red-600 dark:text-red-400 underline">
        重試
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="sessionsByDate.length === 0" class="text-center py-12">
      <i class="fas fa-users text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">目前沒有分享會記錄</p>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增第一場分享會
      </button>
    </div>

    <!-- Sessions Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="session in sessionsByDate"
        :key="session.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <!-- Session Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {{ session.title }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(session.date) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="editSession(session)"
              class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="編輯"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="deleteSession(session)"
              class="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="刪除"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Session Details -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-user text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ session.speaker || '未指定講者' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-users text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ session.participants || 0 }} 人參與</span>
          </div>
          <div v-if="session.location" class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ session.location }}</span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="session.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ session.description }}
        </p>

        <!-- Tags -->
        <div v-if="session.tags && session.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="tag in session.tags"
            :key="tag"
            class="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || editingSession"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {{ editingSession ? '編輯分享會' : '新增分享會' }}
        </h3>

        <form @submit.prevent="saveSession">
          <!-- Title -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分享會主題 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="sessionForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入分享會主題"
            />
          </div>

          <!-- Date -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="sessionForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Speaker -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              講者
            </label>
            <input
              v-model="sessionForm.speaker"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入講者姓名"
            />
          </div>

          <!-- Location -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地點
            </label>
            <input
              v-model="sessionForm.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入分享會地點"
            />
          </div>

          <!-- Participants -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              參與人數
            </label>
            <input
              v-model.number="sessionForm.participants"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入參與人數"
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述
            </label>
            <textarea
              v-model="sessionForm.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入分享會描述"
            ></textarea>
          </div>

          <!-- Tags -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              標籤（用逗號分隔）
            </label>
            <input
              v-model="tagsInput"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例如: AI, 技術分享, 工作坊"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 btn-primary"
            >
              {{ editingSession ? '儲存' : '新增' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSharingStore } from '@/stores/sharing'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const sharingStore = useSharingStore()
const { sessions, loading, error, sessionsByDate } = storeToRefs(sharingStore)

const showAddModal = ref(false)
const editingSession = ref(null)
const tagsInput = ref('')
const sessionForm = ref({
  title: '',
  date: '',
  speaker: '',
  location: '',
  participants: 0,
  description: '',
  tags: []
})

// Load sessions on mount
onMounted(() => {
  sharingStore.loadSessions()
})

// Methods
function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function editSession(session) {
  editingSession.value = session
  sessionForm.value = {
    title: session.title,
    date: session.date,
    speaker: session.speaker || '',
    location: session.location || '',
    participants: session.participants || 0,
    description: session.description || '',
    tags: session.tags || []
  }
  tagsInput.value = (session.tags || []).join(', ')
}

async function deleteSession(session) {
  if (confirm(`確定要刪除分享會「${session.title}」嗎？`)) {
    await sharingStore.deleteSession(session.id)
  }
}

async function saveSession() {
  // Process tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const sessionData = {
    ...sessionForm.value,
    tags
  }

  if (editingSession.value) {
    // Update existing session
    await sharingStore.updateSession(editingSession.value.id, sessionData)
  } else {
    // Add new session
    await sharingStore.addSession(sessionData)
  }
  closeModal()
}

function closeModal() {
  showAddModal.value = false
  editingSession.value = null
  tagsInput.value = ''
  sessionForm.value = {
    title: '',
    date: '',
    speaker: '',
    location: '',
    participants: 0,
    description: '',
    tags: []
  }
}
</script>
