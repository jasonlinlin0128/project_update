<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm max-w-sm animate-slide-in"
          :class="toastClass(toast.type)"
        >
          <span class="text-xl">{{ toastIcon(toast.type) }}</span>
          <div class="flex-1">
            <p class="font-medium">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-sm opacity-80">{{ toast.message }}</p>
          </div>
          <button @click="remove(toast.id)" class="p-1 hover:bg-white/20 rounded-lg transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { ref } from 'vue';

// Global state
const toasts = ref([]);
let toastId = 0;

// Export functions for use anywhere
export function useToast() {
  const show = (options) => {
    const id = ++toastId;
    const toast = {
      id,
      title: typeof options === 'string' ? options : options.title,
      message: options.message || '',
      type: options.type || 'info',
      duration: options.duration || 3000
    };
    
    toasts.value.push(toast);
    
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration);
    }
    
    return id;
  };
  
  const success = (title, message) => show({ title, message, type: 'success' });
  const error = (title, message) => show({ title, message, type: 'error' });
  const warning = (title, message) => show({ title, message, type: 'warning' });
  const info = (title, message) => show({ title, message, type: 'info' });
  
  return { show, success, error, warning, info };
}

function remove(id) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

export default {
  name: 'ToastContainer',
  setup() {
    return { toasts, remove };
  },
  methods: {
    toastClass(type) {
      const classes = {
        success: 'bg-green-500/95 text-white',
        error: 'bg-red-500/95 text-white',
        warning: 'bg-yellow-500/95 text-white',
        info: 'bg-blue-500/95 text-white'
      };
      return classes[type] || classes.info;
    },
    toastIcon(type) {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[type] || icons.info;
    }
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.animate-slide-in {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
