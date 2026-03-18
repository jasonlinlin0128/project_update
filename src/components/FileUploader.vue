<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div 
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
      :class="[
        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
        isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      ]"
    >
      <input 
        ref="fileInput" 
        type="file" 
        :accept="acceptTypes"
        multiple 
        class="hidden" 
        @change="handleFileSelect"
      >
      <div class="flex flex-col items-center gap-2">
        <div :class="['w-12 h-12 rounded-full flex items-center justify-center', isDragging ? 'bg-blue-100' : 'bg-gray-100']">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p class="text-sm text-gray-600">
          <span class="text-blue-600 font-medium">點擊上傳</span> 或拖曳檔案到此處
        </p>
        <p class="text-xs text-gray-400">支援 PDF、Word、Excel、圖片 (最大 50MB)</p>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="space-y-2">
      <div v-for="(file, index) in uploadingFiles" :key="index" class="bg-gray-50 rounded-lg p-3">
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ getFileIcon(file.type) }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 truncate">{{ file.name }}</p>
            <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div class="bg-blue-500 h-1.5 rounded-full transition-all" :style="{ width: file.progress + '%' }"></div>
            </div>
          </div>
          <span class="text-xs text-gray-500">{{ file.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-gray-700">已上傳檔案 ({{ files.length }})</p>
      <div class="grid gap-2">
        <div 
          v-for="file in files" 
          :key="file.id" 
          class="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition group"
        >
          <span class="text-2xl">{{ getFileIcon(file.type) }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-400">{{ formatFileSize(file.size) }} • {{ formatDate(file.uploadedAt) }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <a 
              :href="file.url" 
              target="_blank" 
              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="下載"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button 
              @click.stop="deleteFile(file)"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="刪除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage } from '../firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export default {
  name: 'FileUploader',
  props: {
    files: {
      type: Array,
      default: () => []
    },
    storagePath: {
      type: String,
      required: true
    }
  },
  emits: ['update:files', 'file-uploaded', 'file-deleted'],
  data() {
    return {
      isDragging: false,
      uploading: false,
      uploadingFiles: [],
      acceptTypes: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp'
    };
  },
  methods: {
    handleDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files);
      this.uploadFiles(files);
    },
    handleFileSelect(e) {
      const files = Array.from(e.target.files);
      this.uploadFiles(files);
      e.target.value = ''; // Reset input
    },
    async uploadFiles(files) {
      const validFiles = files.filter(f => this.validateFile(f));
      if (validFiles.length === 0) return;
      
      this.uploading = true;
      this.uploadingFiles = validFiles.map(f => ({ 
        name: f.name, 
        type: f.type, 
        progress: 0 
      }));
      
      const uploadedFiles = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        try {
          const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const fileRef = storageRef(storage, `${this.storagePath}/${fileId}_${file.name}`);
          
          const uploadTask = uploadBytesResumable(fileRef, file);
          
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.uploadingFiles[i].progress = progress;
              },
              (error) => reject(error),
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                uploadedFiles.push({
                  id: fileId,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  url: url,
                  path: fileRef.fullPath,
                  uploadedAt: new Date().toISOString()
                });
                resolve();
              }
            );
          });
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
      
      this.uploading = false;
      this.uploadingFiles = [];
      
      if (uploadedFiles.length > 0) {
        this.$emit('update:files', [...this.files, ...uploadedFiles]);
        this.$emit('file-uploaded', uploadedFiles);
      }
    },
    validateFile(file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png', 'image/jpeg', 'image/gif', 'image/webp'
      ];
      
      if (file.size > maxSize) {
        alert(`檔案 "${file.name}" 超過 50MB 限制`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`檔案類型 "${file.type}" 不支援`);
        return false;
      }
      
      return true;
    },
    async deleteFile(file) {
      if (!confirm(`確定要刪除 "${file.name}" 嗎？`)) return;
      
      try {
        if (file.path) {
          const fileRef = storageRef(storage, file.path);
          await deleteObject(fileRef);
        }
        
        const newFiles = this.files.filter(f => f.id !== file.id);
        this.$emit('update:files', newFiles);
        this.$emit('file-deleted', file);
      } catch (error) {
        console.error('Delete error:', error);
        // Still remove from list if storage delete fails
        const newFiles = this.files.filter(f => f.id !== file.id);
        this.$emit('update:files', newFiles);
      }
    },
    getFileIcon(type) {
      if (type?.includes('pdf')) return '📄';
      if (type?.includes('word') || type?.includes('document')) return '📝';
      if (type?.includes('excel') || type?.includes('sheet')) return '📊';
      if (type?.includes('powerpoint') || type?.includes('presentation')) return '📽️';
      if (type?.includes('image')) return '🖼️';
      return '📎';
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('zh-TW');
    }
  }
}
</script>
