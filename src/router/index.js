import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首頁 - 專案儀表板' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: 'AI 專案管理' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TasksView.vue'),
    meta: { title: '例行任務' }
  },
  {
    path: '/sharing',
    name: 'Sharing',
    component: () => import('@/views/SharingView.vue'),
    meta: { title: '分享會管理' }
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('@/views/EventsView.vue'),
    meta: { title: '活動參與' }
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/views/ContactsView.vue'),
    meta: { title: '企業接洽' }
  },
  {
    path: '/diagnostics',
    name: 'Diagnostics',
    component: () => import('@/views/DiagnosticsView.vue'),
    meta: { title: 'Firebase 診斷' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '頁面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守衛 - 更新頁面標題
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '專案管理系統'
  next()
})

export default router
