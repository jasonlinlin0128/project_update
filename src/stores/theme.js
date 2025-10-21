import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(false)
  const currentTheme = ref('blue')

  // 主題配色定義
  const themeColors = {
    blue: {
      name: '藍色',
      primary: '#3730a3',
      secondary: '#60a5fa',
      status: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
    },
    violet: {
      name: '紫色',
      primary: '#6d28d9',
      secondary: '#a78bfa',
      status: ['#ede9fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9']
    },
    amber: {
      name: '琥珀',
      primary: '#b45309',
      secondary: '#fbbf24',
      status: ['#fef3c7', '#fde68a', '#fbbf24', '#f59e0b', '#d97706', '#b45309']
    },
    emerald: {
      name: '翡翠綠',
      primary: '#047857',
      secondary: '#34d399',
      status: ['#d1fae5', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857']
    },
    cyan: {
      name: '青色',
      primary: '#0e7490',
      secondary: '#22d3ee',
      status: ['#cffafe', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
    },
    rose: {
      name: '玫瑰紅',
      primary: '#be123c',
      secondary: '#fb7185',
      status: ['#ffe4e6', '#fecdd3', '#fb7185', '#f43f5e', '#e11d48', '#be123c']
    }
  }

  // Actions
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
  }

  function setColorTheme(theme) {
    if (themeColors[theme]) {
      currentTheme.value = theme
      applyTheme()
    }
  }

  function applyTheme() {
    const root = document.documentElement
    const body = document.body

    // 應用深色/淺色模式
    if (isDarkMode.value) {
      body.classList.add('dark-theme')
      root.classList.add('dark')
    } else {
      body.classList.remove('dark-theme')
      root.classList.remove('dark')
    }

    // 應用主題顏色
    const colors = themeColors[currentTheme.value]
    if (colors) {
      root.style.setProperty('--theme-primary', colors.primary)
      root.style.setProperty('--theme-secondary', colors.secondary)

      colors.status.forEach((color, index) => {
        root.style.setProperty(`--status-${index + 1}`, color)
      })
    }

    // 保存到 localStorage
    localStorage.setItem('theme-mode', isDarkMode.value ? 'dark' : 'light')
    localStorage.setItem('color-theme', currentTheme.value)
  }

  function initTheme() {
    // 從 localStorage 讀取保存的主題設置
    const savedMode = localStorage.getItem('theme-mode')
    const savedTheme = localStorage.getItem('color-theme')

    if (savedMode === 'dark') {
      isDarkMode.value = true
    }

    if (savedTheme && themeColors[savedTheme]) {
      currentTheme.value = savedTheme
    }

    applyTheme()
  }

  // 監聽主題變化
  watch([isDarkMode, currentTheme], () => {
    applyTheme()
  })

  return {
    // State
    isDarkMode,
    currentTheme,
    themeColors,
    // Actions
    toggleDarkMode,
    setColorTheme,
    initTheme
  }
})
