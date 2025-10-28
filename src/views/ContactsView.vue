<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">企業接洽管理</h2>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增企業接洽
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" text="載入企業接洽資料..." />

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
      <span class="text-red-700 dark:text-red-400">{{ error }}</span>
      <button @click="contactStore.loadContacts()" class="ml-4 text-red-600 dark:text-red-400 underline">
        重試
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="contactsByDate.length === 0" class="text-center py-12">
      <i class="fas fa-briefcase text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">目前沒有企業接洽記錄</p>
      <button @click="showAddModal = true" class="btn-primary">
        <i class="fas fa-plus mr-2"></i>
        新增第一筆企業接洽
      </button>
    </div>

    <!-- Contacts Table -->
    <div v-else class="card overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">企業名稱</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">聯絡人</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">聯絡方式</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">接洽日期</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">狀態</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contact in contactsByDate"
            :key="contact.id"
            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Company Name -->
            <td class="py-3 px-4">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ contact.companyName }}
              </div>
              <div v-if="contact.industry" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ contact.industry }}
              </div>
            </td>

            <!-- Contact Person -->
            <td class="py-3 px-4">
              <div class="text-gray-700 dark:text-gray-300">
                {{ contact.contactPerson || '-' }}
              </div>
              <div v-if="contact.position" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ contact.position }}
              </div>
            </td>

            <!-- Contact Info -->
            <td class="py-3 px-4">
              <div v-if="contact.email" class="text-sm text-gray-700 dark:text-gray-300">
                <i class="fas fa-envelope text-gray-400 mr-1"></i>
                {{ contact.email }}
              </div>
              <div v-if="contact.phone" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <i class="fas fa-phone text-gray-400 mr-1"></i>
                {{ contact.phone }}
              </div>
            </td>

            <!-- Date -->
            <td class="py-3 px-4 text-gray-700 dark:text-gray-300">
              {{ formatDate(contact.date) }}
            </td>

            <!-- Status -->
            <td class="py-3 px-4">
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  getStatusBadgeClass(contact.status)
                ]"
              >
                {{ getStatusText(contact.status) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-3 px-4">
              <div class="flex gap-2">
                <button
                  @click="viewContact(contact)"
                  class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="查看詳情"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  @click="editContact(contact)"
                  class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="編輯"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="deleteContact(contact)"
                  class="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="刪除"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- View Details Modal -->
    <div
      v-if="viewingContact"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeViewModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">企業接洽詳情</h3>
          <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">企業名稱</label>
            <p class="text-gray-900 dark:text-white font-medium">{{ viewingContact.companyName }}</p>
          </div>

          <div v-if="viewingContact.industry">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">產業類別</label>
            <p class="text-gray-900 dark:text-white">{{ viewingContact.industry }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">聯絡人</label>
              <p class="text-gray-900 dark:text-white">{{ viewingContact.contactPerson || '-' }}</p>
            </div>
            <div v-if="viewingContact.position">
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">職位</label>
              <p class="text-gray-900 dark:text-white">{{ viewingContact.position }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="viewingContact.email">
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p class="text-gray-900 dark:text-white">{{ viewingContact.email }}</p>
            </div>
            <div v-if="viewingContact.phone">
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">電話</label>
              <p class="text-gray-900 dark:text-white">{{ viewingContact.phone }}</p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">接洽日期</label>
            <p class="text-gray-900 dark:text-white">{{ formatDate(viewingContact.date) }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">狀態</label>
            <p class="text-gray-900 dark:text-white">{{ getStatusText(viewingContact.status) }}</p>
          </div>

          <div v-if="viewingContact.notes">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">備註</label>
            <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ viewingContact.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || editingContact"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {{ editingContact ? '編輯企業接洽' : '新增企業接洽' }}
        </h3>

        <form @submit.prevent="saveContact">
          <!-- Company Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              企業名稱 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="contactForm.companyName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入企業名稱"
            />
          </div>

          <!-- Industry -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              產業類別
            </label>
            <input
              v-model="contactForm.industry"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例如: 科技、製造、金融"
            />
          </div>

          <!-- Contact Person & Position -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡人
              </label>
              <input
                v-model="contactForm.contactPerson"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="聯絡人姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                職位
              </label>
              <input
                v-model="contactForm.position"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="職位"
              />
            </div>
          </div>

          <!-- Email & Phone -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                v-model="contactForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                電話
              </label>
              <input
                v-model="contactForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="02-1234-5678"
              />
            </div>
          </div>

          <!-- Date -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              接洽日期 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="contactForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Status -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              狀態
            </label>
            <select
              v-model="contactForm.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="initial">初次接洽</option>
              <option value="followup">持續追蹤</option>
              <option value="negotiating">洽談中</option>
              <option value="successful">合作成功</option>
              <option value="declined">婉拒合作</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              備註
            </label>
            <textarea
              v-model="contactForm.notes"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入備註內容"
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
              {{ editingContact ? '儲存' : '新增' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useContactStore } from '@/stores/contacts'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const contactStore = useContactStore()
const { contacts, loading, error, contactsByDate } = storeToRefs(contactStore)

const showAddModal = ref(false)
const editingContact = ref(null)
const viewingContact = ref(null)
const contactForm = ref({
  companyName: '',
  industry: '',
  contactPerson: '',
  position: '',
  email: '',
  phone: '',
  date: '',
  status: 'initial',
  notes: ''
})

// Load contacts on mount
onMounted(() => {
  contactStore.loadContacts()
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
    initial: '初次接洽',
    followup: '持續追蹤',
    negotiating: '洽談中',
    successful: '合作成功',
    declined: '婉拒合作'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status) {
  const classMap = {
    initial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    followup: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    negotiating: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    successful: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    declined: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classMap[status] || classMap.initial
}

function viewContact(contact) {
  viewingContact.value = contact
}

function closeViewModal() {
  viewingContact.value = null
}

function editContact(contact) {
  editingContact.value = contact
  contactForm.value = {
    companyName: contact.companyName,
    industry: contact.industry || '',
    contactPerson: contact.contactPerson || '',
    position: contact.position || '',
    email: contact.email || '',
    phone: contact.phone || '',
    date: contact.date,
    status: contact.status || 'initial',
    notes: contact.notes || ''
  }
}

async function deleteContact(contact) {
  if (confirm(`確定要刪除「${contact.companyName}」的接洽記錄嗎？`)) {
    await contactStore.deleteContact(contact.id)
  }
}

async function saveContact() {
  if (editingContact.value) {
    // Update existing contact
    await contactStore.updateContact(editingContact.value.id, contactForm.value)
  } else {
    // Add new contact
    await contactStore.addContact(contactForm.value)
  }
  closeModal()
}

function closeModal() {
  showAddModal.value = false
  editingContact.value = null
  contactForm.value = {
    companyName: '',
    industry: '',
    contactPerson: '',
    position: '',
    email: '',
    phone: '',
    date: '',
    status: 'initial',
    notes: ''
  }
}
</script>
