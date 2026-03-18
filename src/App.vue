<template>
  <div id="app" :class="['font-sans antialiased min-h-screen transition-colors duration-300', isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900']">
    <router-view/>
    <ToastContainer />
  </div>
</template>

<script>
import ToastContainer from './components/ToastContainer.vue';
import { ref, provide, onMounted, watch } from 'vue';

export default {
  name: 'App',
  components: {
    ToastContainer
  },
  setup() {
    const isDark = ref(false);
    
    // Load saved theme
    onMounted(() => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark.value = true;
      }
    });
    
    // Save theme when changed
    watch(isDark, (newVal) => {
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      // Update document class for Tailwind dark mode
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    
    const toggleDark = () => {
      isDark.value = !isDark.value;
    };
    
    // Provide to all children
    provide('isDark', isDark);
    provide('toggleDark', toggleDark);
    
    return { isDark };
  }
}
</script>

<style>
/* Dark mode utility classes */
.dark .bg-white {
  background-color: #1f2937 !important;
}
.dark .bg-gray-50,
.dark .bg-gray-50\/50 {
  background-color: #111827 !important;
}
.dark .bg-gray-100 {
  background-color: #1f2937 !important;
}
.dark .text-gray-800 {
  color: #f3f4f6 !important;
}
.dark .text-gray-700 {
  color: #d1d5db !important;
}
.dark .text-gray-600 {
  color: #9ca3af !important;
}
.dark .text-gray-500 {
  color: #6b7280 !important;
}
.dark .text-gray-400 {
  color: #9ca3af !important;
}
.dark .border-gray-100 {
  border-color: #374151 !important;
}
.dark .border-gray-200 {
  border-color: #374151 !important;
}
.dark .border-gray-300 {
  border-color: #4b5563 !important;
}
.dark .shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
}
.dark input,
.dark textarea,
.dark select {
  background-color: #374151 !important;
  border-color: #4b5563 !important;
  color: #f3f4f6 !important;
}
.dark input::placeholder,
.dark textarea::placeholder {
  color: #9ca3af !important;
}
/* Dark mode for tables */
.dark table {
  background-color: #1f2937 !important;
}
.dark thead {
  background-color: #111827 !important;
}
.dark thead th {
  color: #9ca3af !important;
}
.dark tbody tr {
  border-color: #374151 !important;
}
.dark tbody td {
  color: #d1d5db !important;
}
.dark .hover\:bg-gray-50:hover {
  background-color: #374151 !important;
}
/* Dark mode for ios-card */
.dark .ios-card {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}
.dark .ios-card-header {
  background-color: #111827 !important;
  border-color: #374151 !important;
}
.dark .ios-card-body {
  background-color: #1f2937 !important;
}
.dark .ios-title-3 {
  color: #f3f4f6 !important;
}
/* Dark mode for modals */
.dark .fixed .bg-white {
  background-color: #1f2937 !important;
}
</style>
