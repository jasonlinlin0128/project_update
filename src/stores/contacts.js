import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { realtimeDb } from '@/firebase'
import { ref as dbRef, set, get } from 'firebase/database'

export const useContactStore = defineStore('contacts', () => {
  // State
  const contacts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const contactCount = computed(() => contacts.value.length)

  const contactsByDate = computed(() => {
    return [...contacts.value].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA
    })
  })

  // Actions
  async function loadContacts() {
    loading.value = true
    error.value = null

    try {
      const snapshot = await get(dbRef(realtimeDb, 'contacts'))
      const data = snapshot.val()

      if (data && Object.keys(data).length > 0) {
        contacts.value = Object.values(data)
        console.log('✅ 載入企業接洽:', contacts.value.length, '筆')
      } else {
        contacts.value = []
        console.log('📝 企業接洽資料庫為空')
      }
    } catch (err) {
      console.error('❌ 載入企業接洽失敗:', err)
      error.value = '無法載入企業接洽資料'
      contacts.value = []
    } finally {
      loading.value = false
    }
  }

  async function addContact(contact) {
    try {
      const newId = contacts.value.length > 0
        ? Math.max(...contacts.value.map(c => c.id)) + 1
        : 1

      const newContact = {
        ...contact,
        id: newId,
        createdAt: new Date().toISOString()
      }

      contacts.value.push(newContact)
      await set(dbRef(realtimeDb, 'contacts'), contacts.value)

      console.log('✅ 新增企業接洽成功')
      return { success: true, contact: newContact }
    } catch (err) {
      console.error('❌ 新增企業接洽失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function updateContact(id, updates) {
    try {
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = {
          ...contacts.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        await set(dbRef(realtimeDb, 'contacts'), contacts.value)
        console.log('✅ 更新企業接洽成功')
        return { success: true }
      }
      return { success: false, error: 'Contact not found' }
    } catch (err) {
      console.error('❌ 更新企業接洽失敗:', err)
      return { success: false, error: err.message }
    }
  }

  async function deleteContact(id) {
    try {
      contacts.value = contacts.value.filter(c => c.id !== id)
      await set(dbRef(realtimeDb, 'contacts'), contacts.value)
      console.log('✅ 刪除企業接洽成功')
      return { success: true }
    } catch (err) {
      console.error('❌ 刪除企業接洽失敗:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    contacts,
    loading,
    error,
    contactCount,
    contactsByDate,
    loadContacts,
    addContact,
    updateContact,
    deleteContact
  }
})
