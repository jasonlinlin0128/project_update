<template>
  <aside class="w-64 bg-[#2B2D2E] text-gray-300 flex flex-col h-full transition-all duration-300 font-sans">
    <!-- Workspace Selector -->
    <div class="p-4 border-b border-gray-700 flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition">
      <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
        J
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-bold text-white truncate">Jason's Workspace</h2>
        <p class="text-xs text-gray-500 truncate">Free Plan</p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 space-y-1">
      <div class="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Favorites
      </div>
      
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        @click="$emit('change-tab', tab.id)"
        :class="['w-full flex items-center px-4 py-2 text-sm font-medium transition-colors border-l-4', activeTab === tab.id ? 'bg-[#3E4143] text-white border-purple-500' : 'border-transparent hover:bg-[#3E4143] hover:text-white']"
      >
        <span class="mr-3" v-html="tab.icon"></span>
        {{ tab.name }}
      </button>


    </nav>

    <!-- User Profile / Bottom Actions -->
    <div class="p-4 border-t border-gray-700 bg-[#2B2D2E]">
      <button @click="$emit('logout')" class="w-full flex items-center px-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar',
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true
    }
  },
  emits: ['change-tab', 'logout']
}
</script>
