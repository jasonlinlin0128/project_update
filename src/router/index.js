import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import AdminView from '../views/Admin.vue'
import LoginView from '../views/Login.vue'
import ReadOnlyView from '../views/ReadOnlyView.vue'
import RoutineTrackerView from '../views/RoutineTracker.vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

// 等待 Firebase Auth 初始化完成（解決硬重整時 currentUser 為 null 的 race condition）
const authReady = new Promise(resolve => {
  const unsubscribe = onAuthStateChanged(auth, user => {
    unsubscribe()
    resolve(user)
  })
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/view/:token',
    name: 'ReadOnlyView',
    component: ReadOnlyView
  },
  {
    path: '/routines',
    name: 'RoutineTracker',
    component: RoutineTrackerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/journal',
    name: 'JournalChat',
    component: () => import('../views/JournalChat.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = await authReady

  if (requiresAuth && !currentUser) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

