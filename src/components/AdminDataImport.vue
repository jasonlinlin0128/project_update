<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">資料批次匯入</h2>
        <p class="text-gray-500 text-sm mt-1">一鍵匯入預設專案資料</p>
      </div>
    </div>

    <!-- Import Projects -->
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 class="font-bold text-lg text-gray-800 mb-4">📊 待匯入專案 ({{ projects.length }} 個)</h3>
      
      <div class="max-h-96 overflow-y-auto mb-4">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="py-2 px-3 text-left">#</th>
              <th class="py-2 px-3 text-left">專案名稱</th>
              <th class="py-2 px-3 text-left">提案單位</th>
              <th class="py-2 px-3 text-left">狀態</th>
              <th class="py-2 px-3 text-left">進度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in projects" :key="i" class="border-b border-gray-100">
              <td class="py-2 px-3 text-gray-500">{{ i + 1 }}</td>
              <td class="py-2 px-3 font-medium">{{ p.name }}</td>
              <td class="py-2 px-3 text-gray-600">{{ p.proposerUnit }}</td>
              <td class="py-2 px-3">
                <span :class="{
                  'bg-green-100 text-green-700': p.status === '已完成',
                  'bg-blue-100 text-blue-700': p.status === '開發中',
                  'bg-purple-100 text-purple-700': p.status === '測試中',
                  'bg-gray-100 text-gray-700': p.status === '已終止'
                }" class="px-2 py-0.5 rounded-full text-xs">{{ p.status }}</span>
              </td>
              <td class="py-2 px-3">{{ p.progress }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex gap-3">
        <button 
          @click="importProjects" 
          :disabled="isImporting || importedProjects"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2"
        >
          <span v-if="isImporting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>🚀</span>
          {{ importedProjects ? '已匯入完成' : isImporting ? '匯入中...' : '一鍵匯入專案' }}
        </button>
        
        <span v-if="importedProjects" class="text-green-600 flex items-center gap-2">
          ✅ 已成功匯入 {{ projects.length }} 個專案
        </span>
      </div>
    </div>

    <!-- Import Log -->
    <div v-if="logs.length > 0" class="bg-gray-900 rounded-2xl p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
      <div v-for="(log, i) in logs" :key="i">{{ log }}</div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore";

export default {
  name: 'AdminDataImport',
  data() {
    return {
      isImporting: false,
      importedProjects: false,
      logs: [],
      projects: [
        { name: "會議記錄逐字稿及重點整理工具", proposerUnit: "薪桉/技術部", department: "技術部", owner: "薪桉", startTime: "2025-04-30", dueDate: "2025-05-26", status: "已完成", progress: 100, importance: "提升會議效率，自動產出逐字稿與重點整理", goals: "開發會議記錄自動化工具" },
        { name: "Teams Bot建置", proposerUnit: "佳賢/自主", department: "自主開發", owner: "佳賢", startTime: "2025-05-30", dueDate: "2025-06-04", status: "已完成", progress: 100, importance: "建置 Teams 自動化機器人", goals: "Teams Bot 上線運作" },
        { name: "電控找料小幫手", proposerUnit: "電控部", department: "電控部", owner: "", startTime: "", dueDate: "", status: "已終止", progress: 0, importance: "協助電控部快速查找料件", goals: "開發找料輔助工具" },
        { name: "物管備料數位化", proposerUnit: "王偉全/生管", department: "生管", owner: "王偉全", startTime: "2025-08-19", dueDate: "2025-09-19", status: "已終止", progress: 0, importance: "物管備料流程數位轉型", goals: "數位化備料管理流程" },
        { name: "壓鑄機SCADA整合系統", proposerUnit: "胡協理/電控", department: "電控部", owner: "胡協理", startTime: "2025-08-25", dueDate: "", status: "開發中", progress: 50, importance: "整合壓鑄機監控系統", goals: "建立 SCADA 整合平台" },
        { name: "檢驗SOP呈現優化", proposerUnit: "薛瑞文/品保", department: "品保部", owner: "薛瑞文", startTime: "2025-09-03", dueDate: "", status: "開發中", progress: 30, importance: "優化檢驗 SOP 呈現方式", goals: "提升 SOP 易讀性與可操作性" },
        { name: "加工部日報表數位化", proposerUnit: "林昆弘/加工", department: "加工部", owner: "林昆弘", startTime: "2025-09-11", dueDate: "2025-09-30", status: "已完成", progress: 100, importance: "加工部日報表數位轉型", goals: "開發完成並通過 User 測試" },
        { name: "MasterCAM外掛程式開發", proposerUnit: "林昆弘/加工", department: "加工部", owner: "林昆弘", startTime: "2025-09-11", dueDate: "", status: "開發中", progress: 40, importance: "開發 MasterCAM 專用外掛", goals: "擴展 MasterCAM 功能" },
        { name: "NFC工廠夜間巡檢", proposerUnit: "淑惠姊/管理部", department: "管理部", owner: "淑惠姊", startTime: "2025-06-09", dueDate: "2025-07-29", status: "測試中", progress: 90, importance: "建立 NFC 夜間巡檢系統", goals: "開發完成，待廠長驗收" },
        { name: "SimHope專案協作平台", proposerUnit: "明燕/軍品業務", department: "軍品業務", owner: "明燕", startTime: "", dueDate: "", status: "測試中", progress: 95, importance: "專案協作平台開發", goals: "開發完成，待 User 驗收" },
        { name: "檔案時間編輯小工具", proposerUnit: "家汝/技術部、光志/管理部", department: "技術部", owner: "家汝", startTime: "2025-11-18", dueDate: "2025-11-19", status: "已完成", progress: 100, importance: "快速編輯檔案時間戳記", goals: "開發檔案時間編輯工具" },
        { name: "社交工程網站建立", proposerUnit: "光志/管理部", department: "管理部", owner: "光志", startTime: "2025-11-19", dueDate: "2025-11-19", status: "已完成", progress: 100, importance: "建立社交工程測試網站", goals: "完成社交工程測試網站" }
      ]
    }
  },
  methods: {
    async importProjects() {
      this.isImporting = true;
      this.logs = [];
      this.logs.push('📦 開始匯入專案...');
      
      for (const p of this.projects) {
        try {
          await addDoc(collection(db, "projects"), {
            ...p,
            createdAt: new Date().toISOString()
          });
          this.logs.push(`✅ ${p.name}`);
        } catch (error) {
          this.logs.push(`❌ ${p.name}: ${error.message}`);
        }
      }
      
      this.logs.push('');
      this.logs.push('🎉 匯入完成！請前往「專案進度」頁面查看。');
      this.isImporting = false;
      this.importedProjects = true;
    }
  }
}
</script>
