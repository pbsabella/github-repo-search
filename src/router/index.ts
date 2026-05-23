import { createRouter, createWebHistory } from 'vue-router'
import SearchDashboard from '../views/SearchDashboard.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: SearchDashboard,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
