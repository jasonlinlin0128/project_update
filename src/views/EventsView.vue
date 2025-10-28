<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">活動參與管理</h2>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增活動
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" text="載入活動資料..." />

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
      <span class="text-red-700 dark:text-red-400">{{ error }}</span>
      <button @click="eventStore.loadEvents()" class="ml-4 text-red-600 dark:text-red-400 underline">
        重試
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="eventsByDate.length === 0" class="text-center py-12">
      <i class="fas fa-calendar text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">目前沒有活動記錄</p>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增第一個活動
      </button>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in eventsByDate"
        :key="event.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <!-- Event Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {{ event.name }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(event.date) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="editEvent(event)"
              class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="編輯"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="deleteEvent(event)"
              class="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="刪除"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Event Details -->
        <div class="space-y-2 mb-4">
          <div v-if="event.organizer" class="flex items-center gap-2 text-sm">
            <i class="fas fa-building text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ event.organizer }}</span>
          </div>
          <div v-if="event.location" class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ event.location }}</span>
          </div>
          <div v-if="event.participants" class="flex items-center gap-2 text-sm">
            <i class="fas fa-users text-gray-400"></i>
            <span class="text-gray-700 dark:text-gray-300">{{ event.participants }} 人參與</span>
          </div>
          <div v-if="event.status" class="flex items-center gap-2 text-sm">
            <i class="fas fa-info-circle text-gray-400"></i>
            <span
              :class="{
                'text-green-600 dark:text-green-400': event.status === 'completed',
                'text-blue-600 dark:text-blue-400': event.status === 'ongoing',
                'text-yellow-600 dark:text-yellow-400': event.status === 'planned',
                'text-red-600 dark:text-red-400': event.status === 'cancelled'
              }"
            >
              {{ getStatusText(event.status) }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="event.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ event.description }}
        </p>

        <!-- Type Badge -->
        <div v-if="event.type" class="flex flex-wrap gap-2">
          <span
            :class="[
              'px-2 py-1 text-xs rounded',
              getTypeBadgeClass(event.type)
            ]"
          >
            {{ getTypeText(event.type) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || editingEvent"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {{ editingEvent ? '編輯活動' : '新增活動' }}
        </h3>

        <form @submit.prevent="saveEvent">
          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              活動名稱 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="eventForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入活動名稱"
            />
          </div>

          <!-- Date -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="eventForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              活動類型
            </label>
            <select
              v-model="eventForm.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="conference">研討會</option>
              <option value="workshop">工作坊</option>
              <option value="seminar">講座</option>
              <option value="networking">交流活動</option>
              <option value="competition">競賽</option>
              <option value="other">其他</option>
            </select>
          </div>

          <!-- Status -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              狀態
            </label>
            <select
              v-model="eventForm.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="planned">規劃中</option>
              <option value="ongoing">進行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>

          <!-- Organizer -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主辦單位
            </label>
            <input
              v-model="eventForm.organizer"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入主辦單位"
            />
          </div>

          <!-- Location -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地點
            </label>
            <input
              v-model="eventForm.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入活動地點"
            />
          </div>

          <!-- Participants -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              參與人數
            </label>
            <input
              v-model.number="eventForm.participants"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入參與人數"
            />
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              活動描述
            </label>
            <textarea
              v-model="eventForm.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入活動描述"
            ></textarea>
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
              {{ editingEvent ? '儲存' : '新增' }}
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
import { useEventStore } from '@/stores/events'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const eventStore = useEventStore()
const { events, loading, error, eventsByDate } = storeToRefs(eventStore)

const showAddModal = ref(false)
const editingEvent = ref(null)
const eventForm = ref({
  name: '',
  date: '',
  type: 'conference',
  status: 'planned',
  organizer: '',
  location: '',
  participants: 0,
  description: ''
})

// Load events on mount
onMounted(() => {
  eventStore.loadEvents()
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

function getStatusText(status) {
  const statusMap = {
    planned: '規劃中',
    ongoing: '進行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

function getTypeText(type) {
  const typeMap = {
    conference: '研討會',
    workshop: '工作坊',
    seminar: '講座',
    networking: '交流活動',
    competition: '競賽',
    other: '其他'
  }
  return typeMap[type] || type
}

function getTypeBadgeClass(type) {
  const classMap = {
    conference: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    workshop: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    seminar: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    networking: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    competition: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
  }
  return classMap[type] || classMap.other
}

function editEvent(event) {
  editingEvent.value = event
  eventForm.value = {
    name: event.name,
    date: event.date,
    type: event.type || 'conference',
    status: event.status || 'planned',
    organizer: event.organizer || '',
    location: event.location || '',
    participants: event.participants || 0,
    description: event.description || ''
  }
}

async function deleteEvent(event) {
  if (confirm(`確定要刪除活動「${event.name}」嗎？`)) {
    await eventStore.deleteEvent(event.id)
  }
}

async function saveEvent() {
  if (editingEvent.value) {
    // Update existing event
    await eventStore.updateEvent(editingEvent.value.id, eventForm.value)
  } else {
    // Add new event
    await eventStore.addEvent(eventForm.value)
  }
  closeModal()
}

function closeModal() {
  showAddModal.value = false
  editingEvent.value = null
  eventForm.value = {
    name: '',
    date: '',
    type: 'conference',
    status: 'planned',
    organizer: '',
    location: '',
    participants: 0,
    description: ''
  }
}
</script>
