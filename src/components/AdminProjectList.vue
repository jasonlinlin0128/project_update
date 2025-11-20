<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h3 class="text-xl font-bold mb-4 text-gray-800">專案進度管理</h3>
    
    <!-- Add Form -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
      <input v-model="newProject.name" placeholder="專案名稱" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newProject.owner" placeholder="負責人" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newProject.department" placeholder="負責部門" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newProject.startTime" type="date" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <input v-model="newProject.dueDate" type="date" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <select v-model="newProject.priority" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
        <option>高</option>
        <option>中</option>
        <option>低</option>
      </select>
      <input v-model.number="newProject.progress" type="number" placeholder="進度(%)" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
      <select v-model="newProject.status" class="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none">
        <option>進行中</option>
        <option>已完成</option>
        <option>延遲</option>
      </select>
      <textarea v-model="newProject.description" placeholder="詳細說明" class="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none md:col-span-3 lg:col-span-4" rows="2"></textarea>
      <button @click="addProject" :disabled="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center md:col-span-3 lg:col-span-4">
        <span v-if="isLoading">處理中...</span>
        <span v-else>新增專案</span>
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div class="relative w-full md:w-64">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜尋專案..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full">
      </div>
      <select v-model="statusFilter" class="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600 w-full md:w-auto">
        <option value="">所有狀態</option>
        <option value="進行中">進行中</option>
        <option value="已完成">已完成</option>
        <option value="延遲">延遲</option>
      </select>
    </div>

    <!-- List -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6">專案名稱</th>
            <th class="py-3 px-6">負責部門</th>
            <th class="py-3 px-6">進度</th>
            <th class="py-3 px-6">狀態</th>
            <th class="py-3 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="p in filteredProjects" :key="p.id" class="border-b border-gray-200 hover:bg-gray-50">
            <!-- Editing Mode -->
            <template v-if="editingId === p.id">
              <td class="py-3 px-6">
                <input v-model="editForm.name" class="border p-1 rounded w-full mb-1" placeholder="名稱">
                <textarea v-model="editForm.description" class="border p-1 rounded w-full text-xs" placeholder="說明" rows="2"></textarea>
              </td>
              <td class="py-3 px-6">
                <input v-model="editForm.owner" class="border p-1 rounded w-full mb-1" placeholder="負責人">
                <input v-model="editForm.department" class="border p-1 rounded w-full" placeholder="部門">
              </td>
              <td class="py-3 px-6"><input v-model.number="editForm.progress" type="number" class="border p-1 rounded w-20"></td>
              <td class="py-3 px-6">
                <select v-model="editForm.status" class="border p-1 rounded">
                  <option>進行中</option>
                  <option>已完成</option>
                  <option>延遲</option>
                </select>
              </td>
              <td class="py-3 px-6 text-center">
                <button @click="updateProject(p.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 text-xs mb-1 block w-full">儲存</button>
                <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-xs block w-full">取消</button>
              </td>
            </template>

            <!-- View Mode -->
            <template v-else>
              <td class="py-3 px-6 font-medium">{{ p.name }}</td>
              <td class="py-3 px-6">{{ p.department }}</td>
              <td class="py-3 px-6">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: p.progress + '%' }"></div>
                </div>
                <span class="text-xs">{{ p.progress }}%</span>
              </td>
              <td class="py-3 px-6">
                <span :class="{'bg-green-200 text-green-600': p.status === '已完成', 'bg-yellow-200 text-yellow-600': p.status === '進行中', 'bg-red-200 text-red-600': p.status === '延遲'}" class="py-1 px-3 rounded-full text-xs">
                  {{ p.status }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button @click="startEdit(p)" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fas fa-edit"></i> 編輯</button>
                <button @click="deleteProject(p.id)" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i> 刪除</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      projects: [],
      isLoading: false,
      editingId: null,
      editForm: {},
      newProject: {
        name: '',
        owner: '',
        department: '',
        startTime: '',
        dueDate: '',
        priority: '中',
        progress: 0,
        status: '進行中',
        description: ''
      },
      searchQuery: '',
      statusFilter: ''
    }
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                              (p.owner && p.owner.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                              (p.department && p.department.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStatus = this.statusFilter ? p.status === this.statusFilter : true;
        return matchesSearch && matchesStatus;
      });
    }
  },
  async mounted() {
    await this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      this.isLoading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } finally {
        this.isLoading = false;
      }
    },
    async addProject() {
      if (!this.newProject.name) return alert('請輸入專案名稱');
      this.isLoading = true;
      try {
        await addDoc(collection(db, "projects"), this.newProject);
        this.newProject = { name: '', owner: '', department: '', startTime: '', dueDate: '', priority: '中', progress: 0, status: '進行中', description: '' };
        await this.fetchProjects();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteProject(id) {
      if (confirm('確定要刪除嗎？')) {
        this.isLoading = true;
        try {
          await deleteDoc(doc(db, "projects", id));
          await this.fetchProjects();
        } finally {
          this.isLoading = false;
        }
      }
    },
    startEdit(project) {
      this.editingId = project.id;
      this.editForm = { ...project };
    },
    cancelEdit() {
      this.editingId = null;
      this.editForm = {};
    },
    async updateProject(id) {
      this.isLoading = true;
      try {
        await updateDoc(doc(db, "projects", id), this.editForm);
        this.editingId = null;
        await this.fetchProjects();
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>
