<template>
  <div class="animate-pulse">
    <!-- Card skeleton -->
    <div v-if="type === 'card'" class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div v-else-if="type === 'table'" class="bg-white rounded-2xl overflow-hidden">
      <div class="border-b border-gray-100 p-4">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="i in rows" :key="i" class="p-4 flex items-center space-x-4">
          <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div class="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Chart skeleton -->
    <div v-else-if="type === 'chart'" class="bg-white rounded-2xl p-6">
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div class="h-48 bg-gray-200 rounded"></div>
    </div>

    <!-- Stat cards skeleton -->
    <div v-else-if="type === 'stats'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4">
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else class="space-y-3">
      <div v-for="i in rows" :key="i" class="bg-white rounded-xl p-4 flex items-center space-x-3">
        <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'list',
      validator: (v) => ['card', 'table', 'chart', 'stats', 'list'].includes(v)
    },
    rows: {
      type: Number,
      default: 5
    }
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
