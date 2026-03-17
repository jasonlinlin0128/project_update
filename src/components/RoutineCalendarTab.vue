<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 pt-6 pb-8 text-white">
      <div class="text-2xl font-bold">{{ currentYear }}年 {{ currentMonth + 1 }}月</div>
      <div class="flex gap-4 mt-2 text-sm opacity-85">
        <span>✅ 本月完成 {{ monthCompletedCount }} 項</span>
        <span>📊 平均 {{ monthAvgPercent }}%</span>
      </div>
    </div>

    <!-- Calendar card -->
    <div class="mx-4 -mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
      <!-- Month nav -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button @click="prevMonth" class="p-1.5 rounded-full hover:bg-gray-100 transition">
          <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="font-semibold text-gray-700">{{ currentYear }}年 {{ currentMonth + 1 }}月</span>
        <button @click="nextMonth" class="p-1.5 rounded-full hover:bg-gray-100 transition">
          <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Day headers -->
      <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 py-2 border-b border-gray-50">
        <div v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</div>
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 gap-y-1 p-2">
        <div
          v-for="(cell, i) in calendarCells"
          :key="i"
          @click="cell.inMonth && selectDate(cell.date)"
          class="flex flex-col items-center py-1 rounded-lg transition cursor-pointer"
          :class="[
            cell.inMonth ? 'hover:bg-gray-50' : 'opacity-0 pointer-events-none',
            isToday(cell.date) ? 'font-bold' : ''
          ]"
        >
          <span
            class="text-sm w-7 h-7 flex items-center justify-center rounded-full"
            :class="isToday(cell.date) ? 'bg-indigo-600 text-white' : 'text-gray-700'"
          >{{ cell.day }}</span>
          <!-- Completion bar -->
          <div
            v-if="cell.inMonth && getDayStats(cell.date).total > 0"
            class="w-5 h-1.5 rounded-full mt-0.5"
            :class="getDayColor(cell.date)"
          ></div>
          <div v-else class="w-5 h-1.5 mt-0.5"></div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 px-4 py-3 border-t border-gray-50 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="w-3 h-1.5 bg-green-400 rounded-full inline-block"></span>全部完成</span>
        <span class="flex items-center gap-1"><span class="w-3 h-1.5 bg-amber-400 rounded-full inline-block"></span>部分完成</span>
        <span class="flex items-center gap-1"><span class="w-3 h-1.5 bg-red-400 rounded-full inline-block"></span>未完成</span>
      </div>
    </div>

    <!-- Selected day detail -->
    <div v-if="selectedDate" class="mx-4 mt-3 bg-white rounded-2xl shadow-sm p-4">
      <div class="font-semibold text-gray-700 mb-3">
        {{ selectedDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }) }} 完成紀錄
      </div>
      <div v-if="loading" class="text-gray-400 text-sm text-center py-2">載入中...</div>
      <div v-else-if="selectedDayItems.length === 0" class="text-gray-400 text-sm text-center py-2">當天無例行公事</div>
      <div v-else class="space-y-2">
        <div
          v-for="item in selectedDayItems"
          :key="item.id"
          class="flex items-center gap-3 text-sm"
        >
          <span class="text-base">{{ isCompletedOn(item, selectedDate) ? '✅' : '⬜' }}</span>
          <span :class="isCompletedOn(item, selectedDate) ? 'text-gray-600' : 'text-gray-400'">
            {{ item.startTime ? item.startTime + ' ' : '' }}{{ item.title }}
          </span>
          <span v-if="getNoteOn(item, selectedDate)" class="text-gray-400 text-xs truncate flex-1">— {{ getNoteOn(item, selectedDate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: 'RoutineCalendarTab',
  data() {
    return {
      loading: false,
      currentDate: new Date(),
      selectedDate: null,
      allRoutines: [],
      completionsByDate: {}  // key: 'YYYY-M-D', value: { routineId: { note, ... } }
    }
  },
  computed: {
    currentYear() { return this.currentDate.getFullYear() },
    currentMonth() { return this.currentDate.getMonth() },
    calendarCells() {
      const year = this.currentYear
      const month = this.currentMonth
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const cells = []
      for (let i = 0; i < firstDay; i++) cells.push({ inMonth: false, day: '', date: null })
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ inMonth: true, day: d, date: new Date(year, month, d) })
      }
      while (cells.length % 7 !== 0) cells.push({ inMonth: false, day: '', date: null })
      return cells
    },
    selectedDayItems() {
      if (!this.selectedDate) return []
      const d = new Date(this.selectedDate)
      d.setHours(0, 0, 0, 0)
      return this.allRoutines.filter(item => this.getTasksForDate(item, d))
    },
    monthCompletedCount() {
      let count = 0
      Object.values(this.completionsByDate).forEach(dayMap => {
        count += Object.keys(dayMap).length
      })
      return count
    },
    monthAvgPercent() {
      const days = this.calendarCells.filter(c => c.inMonth && c.date <= new Date())
      if (days.length === 0) return 0
      const total = days.reduce((sum, c) => sum + (this.getDayStats(c.date).percent || 0), 0)
      return Math.round(total / days.length)
    }
  },
  async mounted() {
    await this.fetchRoutines()
    await this.fetchMonthCompletions()
    // Default: select today
    this.selectedDate = new Date()
    this.selectedDate.setHours(0, 0, 0, 0)
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
    dateKey(date) {
      if (!date) return ''
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    isToday(date) {
      if (!date) return false
      const t = new Date()
      return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear()
    },
    getDayStats(date) {
      if (!date) return { total: 0, completed: 0, percent: 0 }
      const d = new Date(date); d.setHours(0, 0, 0, 0)
      const items = this.allRoutines.filter(item => this.getTasksForDate(item, d))
      const total = items.length
      if (total === 0) return { total: 0, completed: 0, percent: 0 }
      const key = this.dateKey(date)
      const completed = Object.keys(this.completionsByDate[key] || {}).length
      return { total, completed, percent: Math.round((completed / total) * 100) }
    },
    getDayColor(date) {
      const { percent, total } = this.getDayStats(date)
      if (total === 0) return ''
      if (percent === 100) return 'bg-green-400'
      if (percent > 0) return 'bg-amber-400'
      return 'bg-red-400'
    },
    isCompletedOn(item, date) {
      if (!date) return false
      const key = this.dateKey(date)
      return !!(this.completionsByDate[key]?.[item.id])
    },
    getNoteOn(item, date) {
      if (!date) return ''
      const key = this.dateKey(date)
      return this.completionsByDate[key]?.[item.id]?.note || ''
    },
    async fetchRoutines() {
      const snap = await getDocs(collection(db, 'routines'))
      this.allRoutines = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id, ...data,
          interval: data.interval || 1,
          daysOfWeek: data.daysOfWeek ?? (data.weekDay !== undefined ? [data.weekDay] : [1]),
          startDate: data.startDate || new Date().toISOString().split('T')[0]
        }
      })
    },
    async fetchMonthCompletions() {
      const snap = await getDocs(collection(db, 'routine_completions'))
      const map = {}
      snap.docs.forEach(d => {
        const data = d.data()
        const key = data.date  // stored as 'YYYY-M-D'
        if (!map[key]) map[key] = {}
        map[key][data.routineId] = data
      })
      this.completionsByDate = map
    },
    async selectDate(date) {
      this.selectedDate = new Date(date)
      this.selectedDate.setHours(0, 0, 0, 0)
    },
    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1)
    }
  }
}
</script>
