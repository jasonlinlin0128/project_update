<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
    <h3 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
      <span class="w-2 h-8 bg-primary-500 rounded-full mr-3"></span>
      專案進度管理
    </h3>
    
    <!-- Add Form -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <input v-model="newProject.name" placeholder="專案名稱" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
      <input v-model="newProject.department" placeholder="負責部門" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
      <input v-model="newProject.startTime" type="date" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
      <input v-model="newProject.dueDate" type="date" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
      <select v-model="newProject.priority" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white">
        <option>高</option>
        <option>中</option>
        <option>低</option>
      </select>
      <input v-model.number="newProject.progress" type="number" placeholder="進度(%)" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
      <select v-model="newProject.status" class="border-gray-200 border p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white">
        <option>進行中</option>
        <option>已完成</option>
        <option>延遲</option>
      </select>
      <button @click="addProject" :disabled="isLoading" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center font-medium shadow-sm hover:shadow">
        <span v-if="isLoading">處理中...</span>
        <span v-else>新增專案</span>
      </button>
    </div>

    <!-- List -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
            <th class="py-4 px-6">專案名稱</th>
            <th class="py-4 px-6">負責部門</th>
            <th class="py-4 px-6 w-1/4">進度</th>
            <th class="py-4 px-6">狀態</th>
            <th class="py-4 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <tr v-for="p in projects" :key="p.id" class="border-b border-gray-100 hover:bg-primary-50 transition duration-150">
            <!-- Editing Mode -->
            <template v-if="editingId === p.id">
              <td class="py-4 px-6"><input v-model="editForm.name" class="border p-2 rounded w-full focus:ring-2 focus:ring-primary-500 outline-none"></td>
              <td class="py-4 px-6"><input v-model="editForm.department" class="border p-2 rounded w-full focus:ring-2 focus:ring-primary-500 outline-none"></td>
              <td class="py-4 px-6"><input v-model.number="editForm.progress" type="number" class="border p-2 rounded w-20 focus:ring-2 focus:ring-primary-500 outline-none"></td>
              <td class="py-4 px-6">
                <select v-model="editForm.status" class="border p-2 rounded focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>進行中</option>
                  <option>已完成</option>
                  <option>延遲</option>
                </select>
              </td>
              <td class="py-4 px-6 text-center">
                <button @click="updateProject(p.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition">儲存</button>
                <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">取消</button>
              </td>
            </template>

            <!-- View Mode -->
            <template v-else>
              <td class="py-4 px-6 font-bold text-gray-800">{{ p.name }}</td>
              <td class="py-4 px-6">{{ p.department }}</td>
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" :style="{ width: p.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-bold text-primary-700">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span :class="{'bg-green-100 text-green-700': p.status === '已完成', 'bg-primary-100 text-primary-700': p.status === '進行中', 'bg-red-100 text-red-700': p.status === '延遲'}" class="py-1 px-3 rounded-full text-xs font-bold">
                  {{ p.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <button @click="startEdit(p)" class="text-primary-500 hover:text-primary-700 mr-3 transition"><i class="fas fa-edit"></i> 編輯</button>
                <button @click="deleteProject(p.id)" class="text-red-500 hover:text-red-700 transition"><i class="fas fa-trash"></i> 刪除</button>
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
        department: '',
        startTime: '',
        dueDate: '',
        priority: '中',
        progress: 0,
        status: '進行中'
      }
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
        this.newProject = { name: '', department: '', startTime: '', dueDate: '', priority: '中', progress: 0, status: '進行中' };
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
