<template>
  <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans">
    <!-- Header -->
    <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex-shrink-0">
      <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/admin" class="flex items-center gap-1 text-indigo-200 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="text-sm">返回</span>
        </router-link>
        <div class="text-center">
          <h1 class="text-base font-bold">工作日誌</h1>
          <p class="text-indigo-200 text-xs">{{ today }}</p>
        </div>
        <div class="w-16"></div>
      </div>
    </header>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full" ref="messagesContainer">
      <!-- Welcome / loading state -->
      <div v-if="messages.length === 0 && !isLoading" class="text-center text-gray-400 dark:text-gray-500 py-12">
        <div class="text-4xl mb-3">📓</div>
        <p class="text-sm">正在啟動日誌助理...</p>
      </div>

      <!-- Messages -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="mb-4 flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- Claude avatar -->
        <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mr-2 mt-1">
          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">🤖</div>
        </div>

        <!-- Bubble -->
        <div
          class="max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          :class="msg.role === 'user'
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-600 rounded-bl-md'"
        >
          {{ msg.content }}
        </div>

        <!-- User avatar -->
        <div v-if="msg.role === 'user'" class="flex-shrink-0 ml-2 mt-1">
          <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm text-white">👤</div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isLoading" class="flex justify-start mb-4">
        <div class="flex-shrink-0 mr-2 mt-1">
          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">🤖</div>
        </div>
        <div class="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <!-- Save Journal Button (shown when journal is ready) -->
    <div v-if="journalReady && !savedMarkdown" class="flex-shrink-0 px-4 pb-2 max-w-2xl mx-auto w-full">
      <button
        @click="saveJournal"
        :disabled="isSaving"
        class="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-md"
      >
        <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
        </svg>
        <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ isSaving ? '儲存中...' : '儲存日誌' }}
      </button>
    </div>

    <!-- Download Button (after save) -->
    <div v-if="savedMarkdown" class="flex-shrink-0 px-4 pb-2 max-w-2xl mx-auto w-full">
      <div class="flex gap-2">
        <div class="flex-1 py-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl font-semibold text-center text-sm flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          已儲存至 Firestore
        </div>
        <button
          @click="downloadMarkdown"
          class="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition text-sm flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          下載 .md
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <!-- Note: use `vercel dev` for local development (npm run serve won't proxy /api routes) -->
    <div class="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 max-w-2xl mx-auto w-full">
      <div class="flex gap-2 items-end">
        <textarea
          v-model="inputText"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="輸入訊息... (Enter 送出)"
          rows="1"
          class="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          :disabled="isLoading || isSaving || !!savedMarkdown"
          style="max-height: 120px; overflow-y: auto;"
          ref="inputField"
          @input="autoResize"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputText.trim() || isLoading || isSaving || !!savedMarkdown"
          class="flex-shrink-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl flex items-center justify-center transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// Max messages sent to API during chat (to avoid token limits)
const MAX_CHAT_HISTORY = 20

export default {
  name: 'JournalChat',
  data() {
    return {
      messages: [],
      inputText: '',
      isLoading: false,
      isSaving: false,
      journalReady: false,
      savedMarkdown: null,
      today: '',
      currentUser: null
    }
  },
  created() {
    this.today = this.getTodayDate()
  },
  async mounted() {
    // Auth guard — router-level guard handles the main redirect,
    // this ensures we have the user object for token-based API calls
    const user = await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe()
        resolve(user)
      })
    })
    if (!user) {
      this.$router.push({ name: 'Login', query: { redirect: '/journal' } })
      return
    }
    this.currentUser = user
    await this.startConversation()
  },
  methods: {
    async getAuthHeaders() {
      const token = await this.currentUser.getIdToken()
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    },

    async startConversation() {
      this.isLoading = true
      try {
        const headers = await this.getAuthHeaders()
        const response = await fetch('/api/journal-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: [{ role: 'user', content: '開始記錄今天的工作日誌' }],
            action: 'chat',
            date: this.today
          })
        })
        const data = await response.json()
        if (data.content) {
          this.messages.push({ role: 'assistant', content: data.content })
          this.checkJournalReady(data.content)
        }
      } catch (error) {
        console.error('Failed to start conversation:', error)
        this.messages.push({
          role: 'assistant',
          content: '你好！今天工作辛苦了。請告訴我，今天主要完成了什麼工作呢？'
        })
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.isLoading || this.isSaving) return

      this.messages.push({ role: 'user', content: text })
      this.inputText = ''
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.style.height = 'auto'
        }
      })

      this.isLoading = true
      this.scrollToBottom()

      try {
        // Cap history sent to API to avoid token limits during chat
        const recentMessages = this.messages.slice(-MAX_CHAT_HISTORY)
        const headers = await this.getAuthHeaders()
        const response = await fetch('/api/journal-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: recentMessages.map(m => ({ role: m.role, content: m.content })),
            action: 'chat',
            date: this.today
          })
        })
        const data = await response.json()
        if (data.content) {
          this.messages.push({ role: 'assistant', content: data.content })
          this.checkJournalReady(data.content)
        }
      } catch (error) {
        console.error('Send message error:', error)
        this.messages.push({
          role: 'assistant',
          content: '抱歉，發生了錯誤，請再試一次。'
        })
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    checkJournalReady(content) {
      if (content.includes('日誌已整理完成')) {
        this.journalReady = true
      }
    },

    async saveJournal() {
      this.isSaving = true
      try {
        // Send full conversation history to generate accurate markdown
        const headers = await this.getAuthHeaders()
        const response = await fetch('/api/journal-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: this.messages.map(m => ({ role: m.role, content: m.content })),
            action: 'save',
            date: this.today
          })
        })
        const data = await response.json()
        if (!data.content) throw new Error('No markdown received')

        const markdown = data.content

        // Use date as document ID to prevent duplicates (overwrites same-day journal)
        await setDoc(doc(db, 'work_journals', this.today), {
          date: this.today,
          markdown,
          conversation: this.messages.map(m => ({ role: m.role, content: m.content })),
          createdAt: serverTimestamp(),
          synced: false
        })

        this.savedMarkdown = markdown
        this.messages.push({
          role: 'assistant',
          content: '✅ 日誌已成功儲存！你可以下載 .md 檔案或等待自動同步到 Obsidian。'
        })
      } catch (error) {
        console.error('Save journal error:', error)
        this.messages.push({
          role: 'assistant',
          content: '❌ 儲存失敗，請再試一次。'
        })
      } finally {
        this.isSaving = false
        this.scrollToBottom()
      }
    },

    downloadMarkdown() {
      if (!this.savedMarkdown) return
      const blob = new Blob([this.savedMarkdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.today}.md`
      a.click()
      URL.revokeObjectURL(url)
    },

    getTodayDate() {
      const formatter = new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const parts = formatter.formatToParts(new Date())
      const year = parts.find(p => p.type === 'year').value
      const month = parts.find(p => p.type === 'month').value
      const day = parts.find(p => p.type === 'day').value
      return `${year}-${month}-${day}`
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    autoResize(event) {
      const el = event.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }
}
</script>
