<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">例行公事行事曆</h2>
        <p class="text-gray-500 text-sm mt-1">追蹤您的每日、每週、每月例行事項</p>
      </div>
      <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增事項
      </button>
    </div>

    <!-- Today's Tasks Panel -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">📋</span>
          <div>
            <h3 class="text-xl font-bold">今日待辦</h3>
            <p class="text-blue-100 text-sm">{{ formatTodayDate }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold">{{ todayTasks.length }}</p>
          <p class="text-blue-100 text-sm">項任務</p>
        </div>
      </div>
      
      <div v-if="todayTasks.length > 0" class="space-y-2">
        <div v-for="task in todayTasks" :key="task.id + '-today'" 
             class="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-between hover:bg-white/20 transition">
          <div class="flex items-center gap-3 flex-1">
            <button @click="toggleTaskComplete(task)" 
                    :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all', 
                            isTaskCompletedToday(task) ? 'bg-green-400 border-green-400' : 'border-white/50 hover:border-white']">
              <svg v-if="isTaskCompletedToday(task)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <div :class="isTaskCompletedToday(task) ? 'line-through opacity-60' : ''">
              <p class="font-medium">{{ task.title }}</p>
              <p v-if="task.startTime" class="text-sm text-blue-100">{{ task.startTime }}{{ task.endTime ? ' - ' + task.endTime : '' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="getCurrentAssignee(task)" class="bg-white/20 px-2 py-1 rounded-lg text-xs">
              👤 {{ getCurrentAssignee(task) }}
            </span>
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: task.color }"></div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-blue-100">
        <span class="text-4xl">🎉</span>
        <p class="mt-2">今天沒有待辦事項！</p>
      </div>
    </div>

    <!-- Overdue/Missed Tasks Warning -->
    <div v-if="overdueTasks.length > 0" class="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div class="flex-1">
          <h4 class="font-bold text-red-800">有 {{ overdueTasks.length }} 項任務未完成</h4>
          <div class="mt-2 space-y-1">
            <div v-for="task in overdueTasks.slice(0, 3)" :key="task.id + '-overdue'" class="text-sm text-red-700 flex justify-between">
              <span>{{ task.title }}</span>
              <span class="text-red-500">{{ formatOverdueDate(task.missedDate) }}</span>
            </div>
            <p v-if="overdueTasks.length > 3" class="text-sm text-red-500">還有 {{ overdueTasks.length - 3 }} 項...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Calendar Header -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 class="text-lg font-bold text-gray-800">{{ currentYear }}年 {{ currentMonth + 1 }}月</h3>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button @click="goToToday" class="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition">
          回到今天
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        <div v-for="day in weekDays" :key="day" class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
          {{ day }}
        </div>
      </div>
      <div class="grid grid-cols-7 auto-rows-fr bg-white">
        <div 
          v-for="(date, index) in calendarDays" 
          :key="index" 
          class="min-h-[120px] border-b border-r border-gray-100 p-2 relative group transition-colors hover:bg-gray-50/50"
          :class="{'bg-gray-50/30 text-gray-400': !date.isCurrentMonth, 'bg-blue-50/50': isToday(date.date)}"
        >
          <div class="flex justify-between items-start mb-1">
            <span 
              class="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
              :class="{
                'bg-blue-600 text-white shadow-sm': isToday(date.date),
                'text-gray-700': !isToday(date.date) && date.isCurrentMonth
              }"
            >
              {{ date.day }}
            </span>
          </div>
          
          <!-- Tasks for this day -->
          <div class="space-y-1">
            <div 
              v-for="task in getTasksForDate(date.date)" 
              :key="task.id"
              @click="openEditModal(task)"
              class="px-2 py-1 rounded-md text-xs font-medium cursor-pointer truncate transition-all hover:scale-[1.02] border-l-2 shadow-sm"
              :style="{ 
                backgroundColor: task.color + '20', 
                color: task.color,
                borderColor: task.color
              }"
            >
              <div class="flex items-center gap-1">
                <span v-if="isTaskCompletedOnDate(task, date.date)" class="text-green-500">✓</span>
                <span v-if="task.startTime" class="text-[10px] opacity-80">{{ task.startTime }}</span>
                <span class="truncate ml-1" :class="isTaskCompletedOnDate(task, date.date) ? 'line-through opacity-60' : ''">{{ task.title }}</span>
              </div>
              <!-- Current Assignee -->
              <div v-if="getAssigneeForDate(task, date.date)" class="text-[10px] opacity-70 mt-0.5">
                👤 {{ getAssigneeForDate(task, date.date) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? '編輯事項' : '新增事項' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <!-- Title & Color -->
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">事項名稱</label>
              <input v-model="form.title" placeholder="例如：每週會議" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">標籤顏色</label>
              <div class="flex gap-2 items-center h-[42px]">
                <button 
                  v-for="color in colors" 
                  :key="color"
                  @click="form.color = color"
                  class="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-1"
                  :class="form.color === color ? 'ring-gray-400 scale-110' : 'ring-transparent'"
                  :style="{ backgroundColor: color }"
                ></button>
              </div>
            </div>
          </div>

          <!-- Frequency & Interval -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">頻率</label>
              <select v-model="form.frequencyType" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white">
                <option value="Daily">每天</option>
                <option value="Weekly">每週</option>
                <option value="Monthly">每月</option>
                <option value="Rotation">輪值</option>
                <option value="Once">單次</option>
              </select>
            </div>
            <div v-if="form.frequencyType !== 'Once' && form.frequencyType !== 'Rotation'">
              <label class="block text-sm font-medium text-gray-700 mb-1">重複間隔</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 text-sm">每</span>
                <input v-model.number="form.interval" type="number" min="1" class="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center">
                <span class="text-gray-500 text-sm">{{ getFrequencyUnit(form.frequencyType) }}</span>
              </div>
            </div>
          </div>

          <!-- Rotation Settings -->
          <div v-if="form.frequencyType === 'Rotation'" class="bg-purple-50 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2 text-purple-700 font-medium">
              <span>🔄</span> 輪值設定
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">輪值週期</label>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-sm">每</span>
                  <input v-model.number="form.rotationInterval" type="number" min="1" class="w-16 px-3 py-2 border border-gray-200 rounded-xl text-center">
                  <select v-model="form.rotationUnit" class="px-3 py-2 border border-gray-200 rounded-xl bg-white">
                    <option value="days">天</option>
                    <option value="weeks">週</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">輪值順序 (按順序輪流)</label>
              <div class="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded-xl min-h-[42px] bg-white">
                <span v-for="(p, index) in form.rotationOrder" :key="index" class="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                  {{ index + 1 }}. {{ p }}
                  <button @click="removeRotationPerson(index)" class="text-purple-400 hover:text-red-500">×</button>
                </span>
                <input 
                  v-model="newRotationPerson" 
                  @keydown.enter.prevent="addRotationPerson" 
                  placeholder="+ 新增人員 (按 Enter)" 
                  class="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                >
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
              <input v-model="form.startDate" type="date" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">結束日期 (選填)</label>
              <input v-model="form.endDate" type="date" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
              <input v-model="form.startTime" type="time" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
              <input v-model="form.endTime" type="time" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
          </div>

          <!-- Weekly Specific: Multi-day Selection -->
          <div v-if="form.frequencyType === 'Weekly'">
            <label class="block text-sm font-medium text-gray-700 mb-1">重複日</label>
            <div class="flex gap-2 flex-wrap">
              <button 
                v-for="(day, index) in weekDayLabels" 
                :key="index"
                @click="toggleWeekDay(index)"
                class="w-9 h-9 rounded-full text-xs font-medium transition-all border"
                :class="form.daysOfWeek.includes(index) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              >
                {{ day }}
              </button>
            </div>
          </div>

          <!-- Monthly Specific -->
          <div v-if="form.frequencyType === 'Monthly'">
            <label class="block text-sm font-medium text-gray-700 mb-1">每月幾號</label>
            <input v-model.number="form.monthDay" type="number" min="1" max="31" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
          </div>

          <!-- Participants (for non-rotation) -->
          <div v-if="form.frequencyType !== 'Rotation'">
            <label class="block text-sm font-medium text-gray-700 mb-1">共同參與者</label>
            <div class="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded-xl min-h-[42px]">
              <span v-for="(p, index) in form.participants" :key="index" class="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                {{ p }}
                <button @click="removeParticipant(index)" class="text-gray-400 hover:text-red-500">×</button>
              </span>
              <input 
                v-model="newParticipant" 
                @keydown.enter.prevent="addParticipant" 
                @blur="addParticipant"
                placeholder="+ 新增 (按 Enter)" 
                class="flex-1 bg-transparent outline-none text-sm min-w-[100px]"
              >
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">詳細描述</label>
            <textarea v-model="form.description" rows="2" placeholder="備註、連結或詳細內容..." class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
          <button v-if="isEditing" @click="deleteItem(editingId)" class="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition">
            刪除
          </button>
          <div v-else></div>
          
          <div class="flex gap-3">
            <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
            <button @click="saveItem" :disabled="isLoading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isEditing ? '儲存變更' : '確認新增' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      items: [],
      completedTasks: {}, // { 'taskId-YYYY-MM-DD': true }
      isLoading: false,
      showModal: false,
      isEditing: false,
      editingId: null,
      currentDate: new Date(),
      weekDays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
      weekDayLabels: ['日', '一', '二', '三', '四', '五', '六'],
      colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'],
      newParticipant: '',
      newRotationPerson: '',
      form: this.getEmptyForm()
    }
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonth() {
      return this.currentDate.getMonth();
    },
    formatTodayDate() {
      const today = new Date();
      return today.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' });
    },
    todayTasks() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.getTasksForDate(today);
    },
    overdueTasks() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const results = [];
      
      // Check past 7 days for incomplete tasks
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        const tasksForDay = this.getTasksForDate(checkDate);
        tasksForDay.forEach(task => {
          if (!this.isTaskCompletedOnDate(task, checkDate)) {
            results.push({ ...task, missedDate: new Date(checkDate) });
          }
        });
      }
      
      return results;
    },
    calendarDays() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      
      const days = [];
      
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({
          day: daysInPrevMonth - i,
          isCurrentMonth: false,
          date: new Date(year, month - 1, daysInPrevMonth - i)
        });
      }
      
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          isCurrentMonth: true,
          date: new Date(year, month, i)
        });
      }
      
      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          date: new Date(year, month + 1, i)
        });
      }
      
      return days;
    }
  },
  async mounted() {
    await this.fetchItems();
    this.loadCompletedTasks();
  },
  methods: {
    getEmptyForm() {
      return {
        title: '',
        frequencyType: 'Once',
        interval: 1,
        startTime: '',
        endTime: '',
        daysOfWeek: [1],
        monthDay: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        color: '#3B82F6',
        participants: [],
        rotationOrder: [],
        rotationInterval: 1,
        rotationUnit: 'weeks'
      };
    },
    getFrequencyUnit(type) {
      const units = { 'Daily': '天', 'Weekly': '週', 'Monthly': '月', 'Yearly': '年' };
      return units[type] || '';
    },
    loadCompletedTasks() {
      const saved = localStorage.getItem('completedRoutineTasks');
      if (saved) {
        this.completedTasks = JSON.parse(saved);
      }
    },
    saveCompletedTasks() {
      localStorage.setItem('completedRoutineTasks', JSON.stringify(this.completedTasks));
    },
    getTaskDateKey(task, date) {
      const d = new Date(date);
      return `${task.id}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },
    isTaskCompletedToday(task) {
      const today = new Date();
      return this.isTaskCompletedOnDate(task, today);
    },
    isTaskCompletedOnDate(task, date) {
      const key = this.getTaskDateKey(task, date);
      return !!this.completedTasks[key];
    },
    toggleTaskComplete(task) {
      const today = new Date();
      const key = this.getTaskDateKey(task, today);
      
      if (this.completedTasks[key]) {
        delete this.completedTasks[key];
      } else {
        this.completedTasks[key] = true;
      }
      
      this.saveCompletedTasks();
    },
    formatOverdueDate(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) return '昨天';
      if (diff <= 7) return `${diff} 天前`;
      return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    },
    getCurrentAssignee(task) {
      const today = new Date();
      return this.getAssigneeForDate(task, today);
    },
    getAssigneeForDate(task, date) {
      if (task.frequencyType !== 'Rotation' || !task.rotationOrder || task.rotationOrder.length === 0) {
        return null;
      }
      
      const startDate = new Date(task.startDate);
      startDate.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      if (targetDate < startDate) return null;
      
      const diffTime = targetDate - startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let cycleLength = task.rotationInterval || 1;
      if (task.rotationUnit === 'weeks') {
        cycleLength *= 7;
      }
      
      const cycleIndex = Math.floor(diffDays / cycleLength);
      const assigneeIndex = cycleIndex % task.rotationOrder.length;
      
      return task.rotationOrder[assigneeIndex];
    },
    async fetchItems() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "routines"));
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            interval: data.interval || 1,
            daysOfWeek: data.daysOfWeek || (data.weekDay !== undefined ? [data.weekDay] : [1]),
            participants: data.participants || [],
            rotationOrder: data.rotationOrder || [],
            rotationInterval: data.rotationInterval || 1,
            rotationUnit: data.rotationUnit || 'weeks',
            color: data.color || '#3B82F6',
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            endDate: data.endDate || '',
            startTime: data.startTime || data.time || '',
            endTime: data.endTime || ''
          };
        });
      } finally {
        this.isLoading = false;
      }
    },
    getTasksForDate(date) {
      return this.items.filter(item => {
        const itemStartDate = new Date(item.startDate);
        const targetDate = new Date(date);
        
        itemStartDate.setHours(0,0,0,0);
        targetDate.setHours(0,0,0,0);
        
        if (targetDate < itemStartDate) return false;

        if (item.endDate) {
          const itemEndDate = new Date(item.endDate);
          itemEndDate.setHours(0,0,0,0);
          if (targetDate > itemEndDate) return false;
        }

        const diffTime = Math.abs(targetDate - itemStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (item.frequencyType === 'Daily') {
          return diffDays % item.interval === 0;
        }
        
        if (item.frequencyType === 'Weekly') {
          const oneWeek = 1000 * 60 * 60 * 24 * 7;
          const diffWeeks = Math.floor(diffTime / oneWeek);
          if (diffWeeks % item.interval !== 0) return false;
          return item.daysOfWeek.includes(targetDate.getDay());
        }
        
        if (item.frequencyType === 'Monthly') {
           if (targetDate.getDate() !== item.monthDay) return false;
           const monthDiff = (targetDate.getFullYear() - itemStartDate.getFullYear()) * 12 + (targetDate.getMonth() - itemStartDate.getMonth());
           return monthDiff % item.interval === 0;
        }
        
        if (item.frequencyType === 'Rotation') {
          // Rotation tasks show on their rotation interval
          let cycleLength = item.rotationInterval || 1;
          if (item.rotationUnit === 'weeks') {
            cycleLength *= 7;
          }
          return diffDays % cycleLength === 0;
        }
        
        if (item.frequencyType === 'Once') {
            return targetDate.getTime() === itemStartDate.getTime();
        }
        
        return false;
      });
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1);
    },
    goToToday() {
      this.currentDate = new Date();
    },
    openAddModal() {
      this.isEditing = false;
      this.editingId = null;
      this.form = this.getEmptyForm();
      this.showModal = true;
    },
    openEditModal(item) {
      this.isEditing = true;
      this.editingId = item.id;
      this.form = { ...this.getEmptyForm(), ...item };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.form = this.getEmptyForm();
    },
    toggleWeekDay(dayIndex) {
      const index = this.form.daysOfWeek.indexOf(dayIndex);
      if (index === -1) {
        this.form.daysOfWeek.push(dayIndex);
      } else {
        if (this.form.daysOfWeek.length > 1) {
          this.form.daysOfWeek.splice(index, 1);
        }
      }
    },
    addParticipant() {
      if (this.newParticipant.trim()) {
        this.form.participants.push(this.newParticipant.trim());
        this.newParticipant = '';
      }
    },
    removeParticipant(index) {
      this.form.participants.splice(index, 1);
    },
    addRotationPerson() {
      if (this.newRotationPerson.trim()) {
        this.form.rotationOrder.push(this.newRotationPerson.trim());
        this.newRotationPerson = '';
      }
    },
    removeRotationPerson(index) {
      this.form.rotationOrder.splice(index, 1);
    },
    async saveItem() {
      if (!this.form.title) return alert('請輸入事項名稱');
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "routines", this.editingId), this.form);
        } else {
          await addDoc(collection(db, "routines"), this.form);
        }
        await this.fetchItems();
        this.closeModal();
      } catch (error) {
        console.error("Error saving item:", error);
        alert('儲存失敗');
      } finally {
        this.isLoading = false;
      }
    },
    async deleteItem(id) {
      if (confirm('確定要刪除此事項嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "routines", id));
          await this.fetchItems();
          this.closeModal();
        } finally {
          this.isLoading = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
