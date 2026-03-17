<template>
  <div>
    <!-- Progress summary card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center gap-5">
      <div class="flex-1">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span class="font-medium text-gray-700">今日進度</span>
          <span>{{ completedCount }} / {{ todayItems.length }} 完成</span>
        </div>
        <div class="bg-gray-100 rounded-full h-3">
          <div
            class="bg-indigo-500 rounded-full h-3 transition-all duration-500"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
      <div class="text-center flex-shrink-0">
        <div class="text-3xl font-extrabold text-indigo-600">{{ progressPercent }}%</div>
        <div class="text-xs text-gray-400 mt-0.5">完成率</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="todayItems.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div class="text-5xl mb-3">🎉</div>
      <p class="text-gray-400">今天沒有例行公事！</p>
    </div>

    <!-- Items grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="item in sortedTodayItems"
        :key="item.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
        :class="isCompleted(item) ? 'opacity-70' : ''"
      >
        <!-- Card header -->
        <div class="p-5 flex items-start gap-4">
          <div
            class="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
            :style="{ backgroundColor: item.color || '#6366f1' }"
          ></div>

          <div class="flex-1 min-w-0">
            <div
              class="font-semibold text-gray-800"
              :class="isCompleted(item) ? 'line-through text-gray-400' : ''"
            >
              {{ item.title }}
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-1.5">
              <span v-if="item.startTime" class="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                🕐 {{ item.startTime }}{{ item.endTime ? ' – ' + item.endTime : '' }}
              </span>
              <span class="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{{ frequencyLabel(item) }}</span>
              <span
                v-if="isActive(item) && !isCompleted(item)"
                class="text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full"
              >⚡ 進行中</span>
            </div>
          </div>

          <!-- Complete button -->
          <button
            @click="toggleComplete(item)"
            class="flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all"
            :class="isCompleted(item)
              ? 'bg-green-500 border-green-500 text-white shadow-sm'
              : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'"
            :title="isCompleted(item) ? '點擊取消完成' : '標記為完成'"
          >
            <svg v-if="isCompleted(item)" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>

        <!-- Note area (shown when completed) -->
        <div v-if="isCompleted(item)" class="px-5 pb-4 border-t border-gray-50 pt-3">
          <label class="text-xs text-gray-400 font-medium block mb-1.5">完成備註（選填）</label>
          <textarea
            :value="getNote(item)"
            @change="saveNote(item, $event.target.value)"
            placeholder="記錄一下今天的狀況..."
            rows="2"
            class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-gray-600 transition"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import {
  collection, getDocs, doc,
  setDoc, deleteDoc
} from 'firebase/firestore'

export default {
  name: 'RoutineTodayTab',
  data() {
    return {
      loading: true,
      allRoutines: [],
      completions: {}
    }
  },
  computed: {
    todayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    },
    todayItems() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return this.allRoutines.filter(item => this.getTasksForDate(item, today))
    },
    sortedTodayItems() {
      return [...this.todayItems].sort((a, b) => {
        const ta = a.startTime || '99:99'
        const tb = b.startTime || '99:99'
        return ta.localeCompare(tb)
      })
    },
    completedCount() {
      return this.todayItems.filter(item => this.isCompleted(item)).length
    },
    progressPercent() {
      if (this.todayItems.length === 0) return 0
      return Math.round((this.completedCount / this.todayItems.length) * 100)
    }
  },
  async mounted() {
    await this.fetchRoutines()
    await this.fetchCompletions()
    this.loading = false
  },
  methods: {
    // ── Ported from AdminRoutineList.vue ──────────────────────────────
    getTasksForDate(item, date) {
      const itemStartDate = new Date(item.startDate)
      const targetDate = new Date(date)
      itemStartDate.setHours(0, 0, 0, 0)
      targetDate.setHours(0, 0, 0, 0)
      if (targetDate < itemStartDate) return false
      if (item.endDate) {
        const itemEndDate = new Date(item.endDate)
        itemEndDate.setHours(0, 0, 0, 0)
        if (targetDate > itemEndDate) return false
      }
      const diffTime = Math.abs(targetDate - itemStartDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (item.frequencyType === 'Daily') return diffDays % (item.interval || 1) === 0
      if (item.frequencyType === 'Weekly') {
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        if (diffWeeks % (item.interval || 1) !== 0) return false
        return (item.daysOfWeek || [1]).includes(targetDate.getDay())
      }
      if (item.frequencyType === 'Monthly') {
        if (targetDate.getDate() !== item.monthDay) return false
        const monthDiff = (targetDate.getFullYear() - itemStartDate.getFullYear()) * 12
          + (targetDate.getMonth() - itemStartDate.getMonth())
        return monthDiff % (item.interval || 1) === 0
      }
      if (item.frequencyType === 'Rotation') {
        let cycleLength = item.rotationInterval || 1
        if (item.rotationUnit === 'weeks') cycleLength *= 7
        return diffDays % cycleLength === 0
      }
      if (item.frequencyType === 'Once') return targetDate.getTime() === itemStartDate.getTime()
      return false
    },
    // ─────────────────────────────────────────────────────────────────
    isActive(item) {
      if (!item.startTime) return false
      const now = new Date()
      const [sh, sm] = item.startTime.split(':').map(Number)
      const start = new Date(); start.setHours(sh, sm, 0, 0)
      if (item.endTime) {
        const [eh, em] = item.endTime.split(':').map(Number)
        const end = new Date(); end.setHours(eh, em, 0, 0)
        return now >= start && now <= end
      }
      return Math.abs(now - start) < 30 * 60 * 1000
    },
    completionDocId(item) {
      return `${item.id}_${this.todayStr}`
    },
    isCompleted(item) {
      return !!this.completions[item.id]
    },
    getNote(item) {
      return this.completions[item.id]?.note || ''
    },
    async fetchRoutines() {
      const snap = await getDocs(collection(db, 'routines'))
      this.allRoutines = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id, ...data,
          interval: data.interval || 1,
          daysOfWeek: data.daysOfWeek ?? (data.weekDay !== undefined ? [data.weekDay] : [1]),
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          color: data.color || '#6366f1'
        }
      })
    },
    async fetchCompletions() {
      const today = this.todayStr
      const snap = await getDocs(collection(db, 'routine_completions'))
      snap.docs.forEach(d => {
        const data = d.data()
        if (data.date === today) {
          this.completions[data.routineId] = data
        }
      })
    },
    async toggleComplete(item) {
      const docId = this.completionDocId(item)
      const ref = doc(db, 'routine_completions', docId)
      if (this.isCompleted(item)) {
        await deleteDoc(ref)
        const updated = { ...this.completions }
        delete updated[item.id]
        this.completions = updated
      } else {
        const data = {
          routineId: item.id,
          date: this.todayStr,
          completed: true,
          completedAt: new Date().toISOString(),
          note: ''
        }
        await setDoc(ref, data)
        this.completions = { ...this.completions, [item.id]: data }
      }
    },
    async saveNote(item, note) {
      const docId = this.completionDocId(item)
      const ref = doc(db, 'routine_completions', docId)
      const existing = this.completions[item.id] || {}
      const updated = { ...existing, note }
      await setDoc(ref, updated, { merge: true })
      this.completions = { ...this.completions, [item.id]: updated }
    },
    frequencyLabel(item) {
      const map = { Daily: '每天', Weekly: '每週', Monthly: '每月', Rotation: '輪值', Once: '單次' }
      return map[item.frequencyType] || ''
    }
  }
}
</script>
