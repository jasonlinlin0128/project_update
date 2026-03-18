<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancel"></div>
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-scale-in overflow-hidden">
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', iconBgClass]">
              <span class="text-2xl">{{ icon }}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
              <p class="text-gray-600 mt-1">{{ message }}</p>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button 
            @click="cancel" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="confirm" 
            :class="['px-4 py-2 rounded-xl font-medium transition', confirmClass]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    show: Boolean,
    title: { type: String, default: '確認' },
    message: { type: String, default: '確定要執行此操作嗎？' },
    confirmText: { type: String, default: '確定' },
    cancelText: { type: String, default: '取消' },
    type: { type: String, default: 'danger' } // danger, warning, info
  },
  emits: ['confirm', 'cancel'],
  computed: {
    icon() {
      const icons = { danger: '⚠️', warning: '⚡', info: 'ℹ️' };
      return icons[this.type] || icons.info;
    },
    iconBgClass() {
      const classes = { danger: 'bg-red-100', warning: 'bg-yellow-100', info: 'bg-blue-100' };
      return classes[this.type] || classes.info;
    },
    confirmClass() {
      const classes = {
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        info: 'bg-blue-500 hover:bg-blue-600 text-white'
      };
      return classes[this.type] || classes.info;
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
