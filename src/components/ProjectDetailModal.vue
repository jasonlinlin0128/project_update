<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div class="modal-backdrop" @click.self="close">
        <div class="modal-content">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ project.name }}</h2>
                <p class="text-sm text-gray-500">專案詳細資訊</p>
              </div>
            </div>
            <button @click="close" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content - Scrollable -->
          <div class="overflow-y-auto flex-1 px-6 py-6 space-y-6">
            
            <!-- Status & Progress Bar -->
            <div class="flex items-center gap-3">
              <span :class="{
                'bg-blue-100 text-blue-700': project.status === '規劃中',
                'bg-yellow-100 text-yellow-700': project.status === '開發中',
                'bg-purple-100 text-purple-700': project.status === '測試中',
                'bg-green-100 text-green-700': project.status === '已完成',
                'bg-gray-200 text-gray-700': project.status === '已終止'
              }" class="px-3 py-1 rounded-full text-xs font-bold">
                {{ project.status || '規劃中' }}
              </span>
              <div class="flex-1"></div>
              <div class="text-sm text-gray-500">
                進度：<span class="font-bold text-blue-600">{{ project.progress || 0 }}%</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                   :style="{width: (project.progress || 0) + '%'}"></div>
            </div>

            <!-- Section 1: 基本資訊 -->
            <section class="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                基本資訊
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailField v-if="project.proposerUnit" label="主要提案單位" :value="project.proposerUnit" />
                <DetailField v-if="project.proposerContact" label="提案聯絡人" :value="project.proposerContact" />
                <DetailField v-if="project.department" label="負責部門" :value="project.department" />
                <DetailField v-if="project.owner" label="負責人" :value="project.owner" />
                <DetailField v-if="project.startTime" label="開始時間" :value="project.startTime" />
                <DetailField v-if="project.dueDate" label="截止日期" :value="project.dueDate" />
                <DetailField v-if="project.relatedUnits" label="相關單位" :value="project.relatedUnits" class="md:col-span-2" />
              </div>
            </section>

            <!-- Section 2: 專案背景 -->
            <section class="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                專案背景
              </h3>
              <DetailField v-if="project.importance" label="為什麼需要這個專案" :value="project.importance" />
              <DetailField v-if="project.currentSituation" label="現況描述" :value="project.currentSituation" />
              <DetailField v-if="project.painPoints" label="困難點" :value="project.painPoints" />
              <DetailField v-if="project.crossUnitIssues" label="跨單位問題" :value="project.crossUnitIssues" />
              <DetailField v-if="project.triedSolutions" label="嘗試過的解決方案" :value="project.triedSolutions" />
            </section>

            <!-- Section 3: 期望目標與效益 -->
            <section class="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                期望目標與效益
              </h3>
              <DetailField v-if="project.goals" label="專案目標" :value="project.goals" />
              <DetailField v-if="project.expectedFeatures" label="期望功能或流程" :value="project.expectedFeatures" />
              <DetailField v-if="project.keyUsers" label="主要使用者" :value="project.keyUsers" />
              <DetailField v-if="project.expectedBenefits" label="預期提升效益" :value="project.expectedBenefits" />
              <DetailField v-if="project.kpi" label="關鍵成功指標 (KPI)" :value="project.kpi" />
              <DetailField v-if="project.estimatedTimeline" label="預估時程" :value="project.estimatedTimeline" />
            </section>

            <!-- Section 4: 資源與風險 -->
            <section class="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                資源與風險評估
              </h3>
              <DetailField v-if="project.resources" label="所需資源" :value="project.resources" />
              <DetailField v-if="project.risks" label="潛在風險" :value="project.risks" />
            </section>

            <!-- Legacy Description -->
            <section v-if="project.description" class="bg-gray-50 rounded-xl p-5 space-y-2">
              <h3 class="text-lg font-bold text-gray-800">其他說明</h3>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ project.description }}</p>
            </section>

          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import DetailField from './DetailField.vue';

export default {
  name: 'ProjectDetailModal',
  components: {
    DetailField
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  },
  mounted() {
    document.body.style.overflow = 'hidden';
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* 固定在視窗中央的背景遮罩 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

/* Modal 內容容器 */
.modal-content {
  position: relative;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 56rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modal-slide 0.2s ease;
}

@keyframes modal-slide {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

