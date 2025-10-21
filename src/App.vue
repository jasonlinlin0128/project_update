<template>
  <div id="app" :class="{ 'dark': isDarkMode }">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容区 -->
    <main class="min-h-screen gradient-bg">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from './components/layout/AppHeader.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局样式 */
#app {
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 深色模式全局样式 */
.dark {
  color-scheme: dark;
}
</style>
