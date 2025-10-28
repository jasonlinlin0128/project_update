<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">例行任務管理</h2>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增例行任務
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" text="載入例行任務..." />

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
      <span class="text-red-700 dark:text-red-400">{{ error }}</span>
      <button @click="taskStore.loadTasks()" class="ml-4 text-red-600 dark:text-red-400 underline">
        重試
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filter Buttons -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          @click="currentFilter = 'all'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors',
                   currentFilter === 'all'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          全部任務 ({{ allTasks.length }})
        </button>
        <button
          @click="currentFilter = 'daily'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors',
                   currentFilter === 'daily'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          每日任務 ({{ tasksByCategory('daily').length }})
        </button>
        <button
          @click="currentFilter = 'threeWeeks'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors',
                   currentFilter === 'threeWeeks'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          三週任務 ({{ tasksByCategory('threeWeeks').length }})
        </button>
        <button
          @click="currentFilter = 'monthly'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors',
                   currentFilter === 'monthly'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          每月任務 ({{ tasksByCategory('monthly').length }})
        </button>
        <button
          @click="currentFilter = 'bimonthly'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors',
                   currentFilter === 'bimonthly'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          雙月任務 ({{ tasksByCategory('bimonthly').length }})
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTasks.length === 0" class="text-center py-12">
        <i class="fas fa-tasks text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 mb-4">目前沒有{{ getCategoryName(currentFilter) }}</p>
        <button @click="showAddModal = true" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          新增任務
        </button>
      </div>

      <!-- Tasks List -->
      <div v-else class="grid gap-4">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start gap-4">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleTaskComplete(task)"
              class="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />

            <!-- Task Content -->
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <h3
                    :class="['text-lg font-semibold',
                             task.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-white']"
                  >
                    {{ task.title }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ task.description || '無描述' }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <button
                    @click="editTask(task)"
                    class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="編輯"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteTask(task)"
                    class="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="刪除"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Task Metadata -->
              <div class="flex flex-wrap gap-3 mt-3 text-sm">
                <span class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-folder"></i>
                  {{ getCategoryName(task.category) }}
                </span>
                <span v-if="task.deadline" class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(task.deadline) }}
                </span>
                <span
                  v-if="task.completed"
                  class="inline-flex items-center gap-1 text-green-600 dark:text-green-400"
                >
                  <i class="fas fa-check-circle"></i>
                  已完成
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || editingTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {{ editingTask ? '編輯任務' : '新增任務' }}
        </h3>

        <form @submit.prevent="saveTask">
          <!-- Title -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任務標題 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入任務標題"
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任務描述
            </label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入任務描述"
            ></textarea>
          </div>

          <!-- Category -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任務類型 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="taskForm.category"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="daily">每日任務</option>
              <option value="threeWeeks">三週任務</option>
              <option value="monthly">每月任務</option>
              <option value="bimonthly">雙月任務</option>
            </select>
          </div>

          <!-- Deadline -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              截止日期
            </label>
            <input
              v-model="taskForm.deadline"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Completed -->
          <div class="mb-6">
            <label class="flex items-center gap-2">
              <input
                v-model="taskForm.completed"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">已完成</span>
            </label>
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
              {{ editingTask ? '儲存' : '新增' }}
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
import { useTaskStore } from '@/stores/tasks'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const taskStore = useTaskStore()
const { tasks, loading, error, allTasks, tasksByCategory } = storeToRefs(taskStore)

const currentFilter = ref('all')
const showAddModal = ref(false)
const editingTask = ref(null)
const taskForm = ref({
  title: '',
  description: '',
  category: 'daily',
  deadline: '',
  completed: false
})

// Load tasks on mount
onMounted(() => {
  taskStore.loadTasks()
})

// Computed
const filteredTasks = computed(() => {
  if (currentFilter.value === 'all') {
    return allTasks.value
  }
  return tasksByCategory.value(currentFilter.value)
})

// Methods
function getCategoryName(category) {
  const names = {
    all: '任務',
    daily: '每日任務',
    threeWeeks: '三週任務',
    monthly: '每月任務',
    bimonthly: '雙月任務'
  }
  return names[category] || '任務'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

async function toggleTaskComplete(task) {
  await taskStore.updateTask(task.category, task.id, {
    completed: !task.completed
  })
}

function editTask(task) {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    category: task.category,
    deadline: task.deadline || '',
    completed: task.completed || false
  }
}

async function deleteTask(task) {
  if (confirm(`確定要刪除任務「${task.title}」嗎？`)) {
    await taskStore.deleteTask(task.category, task.id)
  }
}

async function saveTask() {
  if (editingTask.value) {
    // Update existing task
    await taskStore.updateTask(editingTask.value.category, editingTask.value.id, taskForm.value)
  } else {
    // Add new task
    await taskStore.addTask(taskForm.value.category, taskForm.value)
  }
  closeModal()
}

function closeModal() {
  showAddModal.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    category: 'daily',
    deadline: '',
    completed: false
  }
}
</script>
