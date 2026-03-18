<template>
  <div class="ios-card mb-6">
    <div class="ios-card-header flex justify-between items-center">
      <h3 class="ios-title-3">專案進度管理</h3>
      <div class="flex space-x-2">
        <ExportButton :data="projects" type="projects" filename="專案列表" />
        <button @click="openTemplateModal" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          範本
        </button>
        <button @click="openAddModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-medium shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增專案
        </button>
      </div>
    </div>
    <div class="ios-card-body">
    
    <!-- Search and Filter -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div class="relative w-full md:w-64">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜尋專案..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm">
      </div>
      <select v-model="statusFilter" class="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600 w-full md:w-auto shadow-sm">
        <option value="">所有狀態</option>
        <option value="規劃中">規劃中</option>
        <option value="開發中">開發中</option>
        <option value="測試中">測試中</option>
        <option value="已完成">已完成</option>
        <option value="已終止">已終止</option>
      </select>
    </div>

    <!-- List -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
            <th class="py-4 px-4">專案名稱</th>
            <th class="py-4 px-4">需求單位</th>
            <th class="py-4 px-4">受益對象</th>
            <th class="py-4 px-4">專案負責人</th>
            <th class="py-4 px-4">階段</th>
            <th class="py-4 px-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="p in filteredProjects" :key="p.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
            <td class="py-4 px-4 font-medium text-gray-800">{{ p.name }}</td>
            <td class="py-4 px-4">{{ p.requestingUnit || p.proposerUnit || '-' }}</td>
            <td class="py-4 px-4">{{ p.beneficiaries || p.department || '-' }}</td>
            <td class="py-4 px-4">{{ p.projectOwner || p.owner || '-' }}</td>
            <td class="py-4 px-4">
              <span :class="{
                'bg-blue-100 text-blue-700': p.status === '需求確認中' || p.status === '規劃中',
                'bg-yellow-100 text-yellow-700': p.status === '開發中',
                'bg-purple-100 text-purple-700': p.status === '內測中' || p.status === '測試中',
                'bg-green-100 text-green-700': p.status === '已上線' || p.status === '已完成',
                'bg-gray-200 text-gray-700': p.status === '已終止'
              }" class="py-1 px-3 rounded-full text-xs font-bold inline-block min-w-[70px] text-center">
                {{ p.status }}
              </span>
            </td>
            <td class="py-4 px-4 text-center">
              <div class="flex justify-center space-x-2">
                <button @click="viewProject(p)" class="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50" title="檢視">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="openEditModal(p)" class="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50" title="編輯">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteProject(p.id)" class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50" title="刪除">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0">
            <td colspan="6" class="py-8 text-center text-gray-400">
              <div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>沒有找到符合條件的專案</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <!-- Add/Edit Modal - Using Teleport to render at body level -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container" @click.stop>
          <!-- Modal Header with Step Indicator -->
          <div class="p-5 border-b border-gray-100 bg-gray-50">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">{{ isPreview ? '提案預覽' : (isEditing ? '編輯專案' : '新增專案提案') }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Step Progress Bar -->
          <div v-if="!isPreview" class="flex items-center justify-between">
            <div v-for="(tab, index) in tabs" :key="tab.id" class="flex items-center flex-1">
              <div class="flex flex-col items-center flex-1">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer',
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 
                    (tabIndex > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')
                  ]"
                  @click="goToTab(index)"
                >
                  <svg v-if="tabIndex > index" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="text-xs mt-1 text-gray-500 hidden sm:block">{{ tab.name }}</span>
              </div>
              <div v-if="index < tabs.length - 1" :class="['flex-1 h-1 mx-2', tabIndex > index ? 'bg-green-500' : 'bg-gray-200']"></div>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0 && !isPreview" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-red-700">
                <p class="font-medium mb-1">請填寫以下必填欄位：</p>
                <ul class="list-disc list-inside">
                  <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- AI Assistant Button -->
          <div v-if="!isPreview && activeTab === 'basic'" class="mb-6">
            <button @click="showAIModal = true" class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center text-sm font-medium shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              ✨ AI 輔助填寫 - 用口語描述你的需求
            </button>
          </div>

          <!-- Preview Mode -->
          <div v-if="isPreview" class="space-y-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-blue-700">請確認以下資訊是否正確，確認後點擊「確認送出」完成提案。</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <h4 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">基本資訊</h4>
              </div>
              <PreviewField label="專案名稱" :value="formData.name" required />
              <PreviewField label="需求單位" :value="formData.requestingUnit" required />
              <PreviewField label="需求聯絡人" :value="formData.requestContact" />
              <PreviewField label="受益對象" :value="formData.beneficiaries" />
              <PreviewField label="專案負責人" :value="formData.projectOwner" />
              <PreviewField label="協作成員" :value="formData.collaborators" />
              <PreviewField label="目前階段" :value="formData.status" />
            </div>

            <div class="grid grid-cols-1 gap-4 mt-6">
              <h4 class="text-lg font-bold text-gray-800 border-b pb-2">問題與現況</h4>
              <PreviewField label="為什麼需要這個專案" :value="formData.importance" required fullWidth />
              <PreviewField label="現況描述" :value="formData.currentSituation" fullWidth />
              <PreviewField label="困難點" :value="formData.painPoints" fullWidth />
              <PreviewField label="跨單位問題" :value="formData.crossUnitIssues" fullWidth />
              <PreviewField label="嘗試過的解決方案" :value="formData.triedSolutions" fullWidth />
            </div>

            <div class="grid grid-cols-1 gap-4 mt-6">
              <h4 class="text-lg font-bold text-gray-800 border-b pb-2">目標與效益</h4>
              <PreviewField label="專案目標" :value="formData.goals" required fullWidth />
              <PreviewField label="預期功能" :value="formData.expectedFeatures" fullWidth />
              <PreviewField label="主要使用者" :value="formData.keyUsers" fullWidth />
              <PreviewField label="預期效益" :value="formData.expectedBenefits" fullWidth />
              <PreviewField label="關鍵成功指標" :value="formData.kpi" fullWidth />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div class="col-span-2">
                <h4 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">時程與資源</h4>
              </div>
              <PreviewField label="預估時程" :value="formData.estimatedTimeline" />
              <PreviewField label="開始日期" :value="formData.startTime" />
              <PreviewField label="截止日期" :value="formData.dueDate" />
              <PreviewField label="相關資源" :value="formData.resources" fullWidth />
              <PreviewField label="潛在風險" :value="formData.risks" fullWidth />
              <PreviewField label="其他備註" :value="formData.description" fullWidth />
            </div>
          </div>

          <!-- Tab Content: Basic Info -->
          <div v-else-if="activeTab === 'basic'" class="space-y-6 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">專案名稱 <span class="text-red-500">*</span></label>
                <input v-model="formData.name" :class="['ios-input w-full', hasError('name') ? 'border-red-500 ring-1 ring-red-500' : '']" placeholder="請輸入專案名稱">
              </div>
              
              <!-- 需求方資訊 -->
              <div class="col-span-2 pt-4">
                <h4 class="text-sm font-bold text-gray-600 uppercase tracking-wide">需求方資訊</h4>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">需求單位 <span class="text-red-500">*</span></label>
                <input v-model="formData.requestingUnit" :class="['ios-input w-full', hasError('requestingUnit') ? 'border-red-500 ring-1 ring-red-500' : '']" placeholder="提出需求的部門">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">需求聯絡人</label>
                <input v-model="formData.requestContact" class="ios-input w-full" placeholder="主要對接窗口">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">受益對象</label>
                <input v-model="formData.beneficiaries" class="ios-input w-full" placeholder="誰會使用這個工具/系統？">
                <p class="text-xs text-gray-500 mt-1">說明這個專案完成後，誰是主要使用者或受益者</p>
              </div>
              
              <!-- 執行方資訊 -->
              <div class="col-span-2 pt-4">
                <h4 class="text-sm font-bold text-gray-600 uppercase tracking-wide">執行方資訊</h4>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">專案負責人</label>
                <input v-model="formData.projectOwner" class="ios-input w-full" placeholder="你或團隊的負責人">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">協作成員</label>
                <input v-model="formData.collaborators" class="ios-input w-full" placeholder="其他參與開發的人（選填）">
              </div>
              
              <!-- 狀態 -->
              <div class="col-span-2 pt-4">
                <h4 class="text-sm font-bold text-gray-600 uppercase tracking-wide">專案狀態</h4>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">目前階段</label>
                <select v-model="formData.status" class="ios-input w-full">
                  <option value="需求確認中">🔵 需求確認中</option>
                  <option value="開發中">🟡 開發中</option>
                  <option value="內測中">🟣 內測中</option>
                  <option value="已上線">🟢 已上線</option>
                  <option value="已終止">⚪ 已終止/擱置</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tab Content: Problem & Situation -->
          <div v-else-if="activeTab === 'problem'" class="space-y-6 animate-fade-in">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">為什麼需要這個專案? (重要性) <span class="text-red-500">*</span></label>
              <textarea v-model="formData.importance" rows="3" :class="['ios-input w-full', hasError('importance') ? 'border-red-500 ring-1 ring-red-500' : '']" placeholder="請說明這個問題的重要性，以及它如何影響到單位運作或公司目標。"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">問題情境描述 - 現況 (Who/How/What)</label>
              <textarea v-model="formData.currentSituation" rows="3" class="ios-input w-full" placeholder="目前是誰、用什麼方法、在做什麼事？"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">困難點</label>
              <textarea v-model="formData.painPoints" rows="3" class="ios-input w-full" placeholder="這個做法導致了什麼不便、錯誤或時間浪費？"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">跨單位問題 (選填)</label>
              <textarea v-model="formData.crossUnitIssues" rows="2" class="ios-input w-full" placeholder="這個問題如何在您和「相關單位」之間發生？"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">嘗試過的解決方案</label>
              <textarea v-model="formData.triedSolutions" rows="2" class="ios-input w-full" placeholder="有沒有嘗試過其他解決方案？"></textarea>
            </div>
          </div>

          <!-- Tab Content: Goals & Benefits -->
          <div v-else-if="activeTab === 'goals'" class="space-y-6 animate-fade-in">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">專案目標 <span class="text-red-500">*</span></label>
              <textarea v-model="formData.goals" rows="3" :class="['ios-input w-full', hasError('goals') ? 'border-red-500 ring-1 ring-red-500' : '']" placeholder="希望達到什麼具體成果？(例如：將 A 流程時間從 3 天縮短到 1 天)"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">預期功能或理想流程</label>
              <textarea v-model="formData.expectedFeatures" rows="4" class="ios-input w-full" placeholder="請盡量描述您想像中的功能或流程。(例如：我希望系統能自動寄送通知給B單位)"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">主要使用者</label>
              <input v-model="formData.keyUsers" class="ios-input w-full" placeholder="這個工具/流程未來會由哪些「單位」的哪些「角色」使用？">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">預期提升效益</label>
                <textarea v-model="formData.expectedBenefits" rows="3" class="ios-input w-full" placeholder="(可量化) 例：減少 50% 人工錯誤。&#10;(不可量化) 例：提升客戶滿意度。"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">關鍵成功指標 (KPI)</label>
                <textarea v-model="formData.kpi" rows="3" class="ios-input w-full" placeholder="您會如何衡量這個專案是否成功？"></textarea>
              </div>
            </div>
          </div>

          <!-- Tab Content: Timeline & Resources -->
          <div v-else-if="activeTab === 'timeline'" class="space-y-6 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">預估時程</label>
                <input v-model="formData.estimatedTimeline" class="ios-input w-full" placeholder="您希望這個專案在什麼時候完成？">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                <input v-model="formData.startTime" type="date" class="ios-input w-full">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <input v-model="formData.dueDate" type="date" class="ios-input w-full">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">相關資源需求</label>
              <textarea v-model="formData.resources" rows="3" class="ios-input w-full" placeholder="執行此專案是否需要特定資源？ (例如：特定人員的投入、預算、硬體設備)"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">潛在風險評估</label>
              <textarea v-model="formData.risks" rows="3" class="ios-input w-full" placeholder="執行此專案可能遇到什麼阻礙？ (例如：舊系統資料無法轉移、人員抗拒)"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">其他備註</label>
              <textarea v-model="formData.description" rows="3" class="ios-input w-full" placeholder="其他補充說明"></textarea>
            </div>
            <!-- 附件上傳 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">相關附件</label>
              <FileUploader 
                :files="formData.attachments || []"
                :storagePath="`projects/${editingId || 'new'}`"
                @update:files="formData.attachments = $event"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer with Navigation -->
        <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-between">
          <div>
            <button v-if="!isPreview && tabIndex > 0" @click="prevStep" class="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              上一步
            </button>
            <button v-if="isPreview" @click="isPreview = false" class="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              返回編輯
            </button>
          </div>
          <div class="flex space-x-3">
            <button @click="closeModal" class="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium">取消</button>
            <!-- 暫存草稿按鈕 - 在所有非預覽步驟都顯示 -->
            <button v-if="!isPreview" @click="saveDraft" class="px-5 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              暫存草稿
            </button>
            <button v-if="!isPreview && tabIndex < tabs.length - 1" @click="nextStep" class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center">
              下一步
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button v-else-if="!isPreview" @click="saveProject" class="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium shadow-md flex items-center">
              <span v-if="isLoading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              儲存並送出
            </button>
            <button v-else @click="saveProject" class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center">
              <span v-if="isLoading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isEditing ? '儲存變更' : '確認送出' }}
            </button>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- View Project Modal -->
    <ProjectDetailModal 
      v-if="showViewModal" 
      :project="selectedProject" 
      @close="showViewModal = false" 
    />

    <!-- Template Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-xl font-bold text-gray-800">選擇範本</h3>
          <button @click="showTemplateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          <button 
            v-for="template in templates" 
            :key="template.id"
            @click="applyTemplate(template)"
            class="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <h4 class="font-medium text-gray-800">{{ template.name }}</h4>
            <p class="text-sm text-gray-500 mt-1">{{ template.description }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- AI Assistant Modal -->
    <div v-if="showAIModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600">
          <h3 class="text-xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI 輔助填寫
          </h3>
          <button @click="showAIModal = false" class="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <p class="text-gray-600 mb-4">請用口語描述你想做的專案，AI 會幫你自動填寫表單欄位。</p>
          <textarea 
            v-model="aiPrompt" 
            rows="6" 
            class="ios-input w-full" 
            placeholder="例如：我們採購部每個月要手動對帳，很容易出錯，希望能有自動化系統..."
          ></textarea>
          <div class="mt-4 flex justify-end space-x-3">
            <button @click="showAIModal = false" class="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium">取消</button>
            <button @click="generateWithAI" :disabled="isAILoading || !aiPrompt.trim()" class="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-colors font-medium shadow-md flex items-center disabled:opacity-50">
              <svg v-if="isAILoading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isAILoading ? '生成中...' : '生成內容' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog 
      :show="showDeleteConfirm"
      title="刪除專案"
      :message="`確定要刪除「${deleteTargetName}」嗎？此操作無法復原。`"
      confirmText="刪除"
      type="danger"
      @confirm="confirmDeleteProject"
      @cancel="showDeleteConfirm = false"
    />

  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import ProjectDetailModal from './ProjectDetailModal.vue';
import PreviewField from './PreviewField.vue';
import ExportButton from './ExportButton.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import FileUploader from './FileUploader.vue';
import { useToast } from './ToastContainer.vue';

export default {
  components: {
    ProjectDetailModal,
    PreviewField,
    ExportButton,
    ConfirmDialog,
    FileUploader
  },
  data() {
    return {
      projects: [],
      isLoading: false,
      showModal: false,
      showViewModal: false,
      showTemplateModal: false,
      showAIModal: false,
      showDeleteConfirm: false,
      deleteTargetId: null,
      deleteTargetName: '',
      isEditing: false,
      isPreview: false,
      editingId: null,
      activeTab: 'basic',
      searchQuery: '',
      statusFilter: '',
      validationErrors: [],
      errorFields: [],
      selectedProject: null,
      aiPrompt: '',
      isAILoading: false,
      relatedDeptInput: '',
      tabs: [
        { id: 'basic', name: '基本資訊' },
        { id: 'problem', name: '問題與現況' },
        { id: 'goals', name: '目標與效益' },
        { id: 'timeline', name: '時程與資源' }
      ],
      templates: [
        { 
          id: 'process', 
          name: '流程優化專案', 
          description: '適用於改善現有作業流程',
          data: {
            importance: '目前流程效率低落，影響團隊生產力',
            goals: '優化流程，提升效率30%',
            expectedBenefits: '減少人工作業時間，降低錯誤率'
          }
        },
        { 
          id: 'system', 
          name: '系統開發專案', 
          description: '適用於新系統或功能開發',
          data: {
            importance: '現有系統無法滿足業務需求',
            goals: '開發新系統以支援業務擴展',
            expectedBenefits: '提升作業效率，支援業務成長'
          }
        },
        { 
          id: 'automation', 
          name: '自動化專案', 
          description: '適用於將手動作業自動化',
          data: {
            importance: '手動作業耗時且容易出錯',
            currentSituation: '目前由人工手動處理',
            painPoints: '耗費大量人力且容易出錯',
            goals: '將作業自動化，減少人工介入',
            expectedBenefits: '節省人力成本，提高準確度'
          }
        }
      ],
      formData: this.getEmptyForm()
    }
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                              (p.projectOwner && p.projectOwner.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.owner && p.owner.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.requestingUnit && p.requestingUnit.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.proposerUnit && p.proposerUnit.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.beneficiaries && p.beneficiaries.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStatus = this.statusFilter ? p.status === this.statusFilter : true;
        return matchesSearch && matchesStatus;
      });
    },
    tabIndex() {
      return this.tabs.findIndex(t => t.id === this.activeTab);
    }
  },
  async mounted() {
    await this.fetchProjects();
  },
  methods: {
    getEmptyForm() {
      return {
        name: '',
        // 需求方資訊
        requestingUnit: '',    // 需求單位
        requestContact: '',    // 需求聯絡人
        beneficiaries: '',     // 受益對象（誰會用這個工具）
        // 執行方資訊
        projectOwner: '',      // 專案負責人
        collaborators: '',     // 協作成員（選填）
        // 狀態（里程碑制）
        status: '需求確認中',  // 需求確認中→開發中→內測中→已上線→已終止
        // 專案背景
        importance: '',
        currentSituation: '',
        painPoints: '',
        crossUnitIssues: '',
        triedSolutions: '',
        // 目標與效益
        goals: '',
        expectedFeatures: '',
        keyUsers: '',
        expectedBenefits: '',
        kpi: '',
        estimatedTimeline: '',
        // 時程
        startTime: '',
        dueDate: '',
        // 資源與風險
        resources: '',
        risks: '',
        description: '',
        attachments: []
      };
    },
    async fetchProjects() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } finally {
        this.isLoading = false;
      }
    },
    openAddModal() {
      this.isEditing = false;
      this.isPreview = false;
      this.editingId = null;
      this.formData = this.getEmptyForm();
      this.activeTab = 'basic';
      this.validationErrors = [];
      this.errorFields = [];
      this.showModal = true;
    },
    openEditModal(project) {
      this.isEditing = true;
      this.isPreview = false;
      this.editingId = project.id;
      this.formData = { ...this.getEmptyForm(), ...project };
      this.activeTab = 'basic';
      this.validationErrors = [];
      this.errorFields = [];
      this.showModal = true;
    },
    viewProject(project) {
      this.selectedProject = project;
      this.showViewModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.isPreview = false;
      this.formData = this.getEmptyForm();
      this.validationErrors = [];
      this.errorFields = [];
    },
    openTemplateModal() {
      this.showTemplateModal = true;
    },
    applyTemplate(template) {
      this.formData = { ...this.getEmptyForm(), ...template.data };
      this.showTemplateModal = false;
      this.openAddModal();
      // Re-apply template data after modal opens
      this.$nextTick(() => {
        this.formData = { ...this.formData, ...template.data };
      });
    },
    goToTab(index) {
      this.activeTab = this.tabs[index].id;
    },
    nextStep() {
      if (this.tabIndex < this.tabs.length - 1) {
        this.activeTab = this.tabs[this.tabIndex + 1].id;
      }
    },
    prevStep() {
      if (this.tabIndex > 0) {
        this.activeTab = this.tabs[this.tabIndex - 1].id;
      }
    },
    validateForm() {
      this.validationErrors = [];
      this.errorFields = [];
      
      if (!this.formData.name.trim()) {
        this.validationErrors.push('專案名稱');
        this.errorFields.push('name');
      }
      if (!this.formData.requestingUnit || !this.formData.requestingUnit.trim()) {
        this.validationErrors.push('需求單位');
        this.errorFields.push('requestingUnit');
      }
      
      return this.validationErrors.length === 0;
    },
    hasError(field) {
      return this.errorFields.includes(field);
    },
    showPreview() {
      if (this.validateForm()) {
        this.isPreview = true;
      } else {
        // Go to the first tab with an error
        if (this.errorFields.includes('name') || this.errorFields.includes('requestingUnit')) {
          this.activeTab = 'basic';
        }
      }
    },
    // 暫存草稿 - 不需要完整驗證，只需要專案名稱
    async saveDraft() {
      const toast = useToast();
      if (!this.formData.name || !this.formData.name.trim()) {
        toast.warning('請至少輸入專案名稱');
        return;
      }
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "projects", this.editingId), this.formData);
        } else {
          const docRef = await addDoc(collection(db, "projects"), this.formData);
          // 設為編輯模式，這樣後續可以繼續編輯
          this.isEditing = true;
          this.editingId = docRef.id;
        }
        await this.fetchProjects();
        toast.success('草稿已儲存', '可繼續編輯或關閉視窗');
      } catch (error) {
        console.error("Error saving draft:", error);
        toast.error('儲存失敗', '請稍後再試');
      } finally {
        this.isLoading = false;
      }
    },
    async saveProject() {
      const toast = useToast();
      if (!this.validateForm()) return;
      
      this.isLoading = true;
      try {
        if (this.isEditing) {
          await updateDoc(doc(db, "projects", this.editingId), this.formData);
        } else {
          await addDoc(collection(db, "projects"), this.formData);
        }
        await this.fetchProjects();
        toast.success('專案已儲存');
        this.closeModal();
      } catch (error) {
        console.error("Error saving project:", error);
        toast.error('儲存失敗', '請稍後再試');
      } finally {
        this.isLoading = false;
      }
    },
    deleteProject(id) {
      const project = this.projects.find(p => p.id === id);
      this.deleteTargetId = id;
      this.deleteTargetName = project?.name || '此專案';
      this.showDeleteConfirm = true;
    },
    async confirmDeleteProject() {
      this.showDeleteConfirm = false;
      if (!this.deleteTargetId) return;
      
      this.isLoading = true;
      try {
        await deleteDoc(doc(db, "projects", this.deleteTargetId));
        await this.fetchProjects();
      } finally {
        this.isLoading = false;
        this.deleteTargetId = null;
        this.deleteTargetName = '';
      }
    },
    async generateWithAI() {
      if (!this.aiPrompt.trim()) return;
      
      this.isAILoading = true;
      
      // Simulate AI response (replace with actual Gemini API call)
      setTimeout(() => {
        // Parse the prompt and fill in fields
        const prompt = this.aiPrompt.toLowerCase();
        
        this.formData.importance = this.aiPrompt;
        
        if (prompt.includes('自動') || prompt.includes('手動')) {
          this.formData.currentSituation = '目前由人工手動處理相關作業';
          this.formData.painPoints = '手動作業耗時、容易出錯、難以追蹤';
          this.formData.goals = '將作業自動化，減少人工介入，提高效率';
          this.formData.expectedBenefits = '減少人工作業時間50%，降低錯誤率90%';
        }
        
        if (prompt.includes('對帳') || prompt.includes('財務') || prompt.includes('採購')) {
          this.formData.proposerUnit = '採購部';
          this.formData.keyUsers = '採購人員、財務人員';
        }
        
        if (prompt.includes('錯誤') || prompt.includes('出錯')) {
          this.formData.painPoints = '現有流程容易產生錯誤，需要花費大量時間檢核';
          this.formData.expectedBenefits = '降低錯誤率，減少重工時間';
        }
        
        this.isAILoading = false;
        this.showAIModal = false;
        this.aiPrompt = '';
      }, 1500);
    },
    addRelatedDept() {
      const val = this.relatedDeptInput.trim();
      if (val && !this.formData.relatedDepartments.includes(val)) {
        this.formData.relatedDepartments.push(val);
      }
      this.relatedDeptInput = '';
    },
    removeRelatedDept(index) {
      this.formData.relatedDepartments.splice(index, 1);
    }
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal 固定在視窗中央 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 56rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.3s ease-out;
}
</style>
