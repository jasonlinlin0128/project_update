<template>
  <div>
    <!-- Stats row -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="p-2 bg-green-50 rounded-xl"><span class="text-2xl">✅</span></div>
        <div>
          <p class="text-xs text-gray-500 font-medium">本月完成</p>
          <p class="text-2xl font-bold text-gray-800">{{ monthCompletedCount }} 項</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="p-2 bg-indigo-50 rounded-xl"><span class="text-2xl">📊</span></div>
        <div>
          <p class="text-xs text-gray-500 font-medium">每日平均完成率</p>
          <p class="text-2xl font-bold text-indigo-600">{{ monthAvgPercent }}%</p>
        </div>
      </div>
    </div>

    <!-- Calendar card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <!-- Month nav -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button @click="prevMonth" class="p-2 rounded-full hover:bg-gray-100 transition">
          <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="font-bold text-gray-700 text-base">{{ currentYear }}年 {{ currentMonth + 1 }}月</span>
        <button @click="nextMonth" class="p-2 rounded-full hover:bg-gray-100 transition">
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
      <div class="grid grid-cols-7 gap-y-1 p-3">
        <div
          v-for="(cell, i) in calendarCells"
          :key="i"
          @click="cell.inMonth && selectDate(cell.date)"
          class="flex flex-col items-center py-1.5 rounded-xl transition"
          :class="[
            cell.inMonth ? 'cursor-pointer hover:bg-indigo-50' : 'opacity-0 pointer-events-none',
            selectedDate && cell.inMonth && isSameDay(cell.date, selectedDate) ? 'bg-indigo-50' : ''
          ]"
        >
          <span
            class="text-sm w-8 h-8 flex items-center justify-center rounded-full font-medium"
            :class="isToday(cell.date)
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-gray-700'"
          >{{ cell.day }}</span>
          <div
            v-if="cell.inMonth && getDayStats(cell.date).total > 0"
            class="w-5 h-1.5 rounded-full mt-0.5"
            :class="getDayColor(cell.date)"
          ></div>
          <div v-else class="w-5 h-1.5 mt-0.5"></div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 px-5 py-3 border-t border-gray-50 text-xs text-gray-500">
        <span class="flex items-center gap-1.5"><span class="w-3 h-1.5 bg-green-400 rounded-full inline-block"></span>全部完成</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-1.5 bg-amber-400 rounded-full inline-block"></span>部分完成</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-1.5 bg-red-400 rounded-full inline-block"></span>未完成</span>
      </div>
    </div>

    <!-- Selected day detail -->
    <div v-if="selectedDate" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="font-bold text-gray-800 mb-4">
        {{ selectedDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }) }}
        <span class="text-sm font-normal text-gray-400 ml-2">完成紀錄</span>
      </h3>
      <div v-if="loading" class="text-gray-400 text-sm text-center py-4">載入中...</div>
      <div v-else-if="selectedDayItems.length === 0" class="text-gray-400 text-sm text-center py-4">當天無例行公事</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="item in selectedDayItems"
          :key="item.id"
          class="flex items-start gap-3 p-3 rounded-xl border"
          :class="isCompletedOn(item, selectedDate) ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'"
        >
          <span class="text-lg flex-shrink-0 mt-0.5">{{ isCompletedOn(item, selectedDate) ? '✅' : '⬜' }}</span>
          <div class="min-w-0">
            <p class="text-sm font-medium" :class="isCompletedOn(item, selectedDate) ? 'text-gray-700' : 'text-gray-400'">
              {{ item.startTime ? item.startTime + '  ' : '' }}{{ item.title }}
            </p>
            <p v-if="getNoteOn(item, selectedDate)" class="text-xs text-gray-400 mt-0.5 truncate">
              {{ getNoteOn(item, selectedDate) }}
            </p>
          </div>
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
      completionsByDate: {}
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
    isSameDay(a, b) {
      if (!a || !b) return false
      return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
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
        const key = data.date
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
