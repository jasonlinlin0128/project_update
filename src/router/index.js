import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import AdminView from '../views/Admin.vue'
import LoginView from '../views/Login.vue'
// import { auth } from '../firebase'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  // const currentUser = auth.currentUser

  // if (requiresAuth && !currentUser) {
  //   next('/login')
  // } else {
  next()
  // }
})

export default router
