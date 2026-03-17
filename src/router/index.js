import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import AdminView from '../views/Admin.vue'
import LoginView from '../views/Login.vue'
import ReadOnlyView from '../views/ReadOnlyView.vue'
import RoutineTrackerView from '../views/RoutineTracker.vue'
import { auth } from '../firebase'

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
    component: RoutineTrackerView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router

