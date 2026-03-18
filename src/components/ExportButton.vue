<template>
  <div class="relative">
    <button 
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition font-medium text-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      匯出
    </button>
    
    <div v-if="showDropdown" class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
      <button @click="exportCSV" class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl">
        📄 CSV 格式
      </button>
      <button @click="exportExcel" class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-xl">
        📊 Excel 格式
      </button>
    </div>
    
    <!-- Click outside to close -->
    <div v-if="showDropdown" class="fixed inset-0 z-0" @click="showDropdown = false"></div>
  </div>
</template>

<script>
import { downloadCSV, downloadExcel, exportConfigs } from '../utils/exportData.js';

export default {
  name: 'ExportButton',
  props: {
    data: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: (v) => ['projects', 'routines', 'forums', 'events', 'coordination'].includes(v)
    },
    filename: {
      type: String,
      default: 'export'
    }
  },
  data() {
    return {
      showDropdown: false
    };
  },
  methods: {
    exportCSV() {
      const columns = exportConfigs[this.type];
      downloadCSV(this.data, columns, this.filename);
      this.showDropdown = false;
    },
    exportExcel() {
      const columns = exportConfigs[this.type];
      downloadExcel(this.data, columns, this.filename);
      this.showDropdown = false;
    }
  }
}
</script>
