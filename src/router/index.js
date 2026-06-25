import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import SeleccionBoletos from '../views/SeleccionBoletos.vue'
import CompraExitosa from '../views/CompraExitosa.vue'
import CompraPendiente from '../views/CompraPendiente.vue'
import CompraFallida from '../views/CompraFallida.vue'
import PanelAdmin from '../views/PanelAdmin.vue'
import LoginAdmin from '../views/LoginAdmin.vue'
import { getAdminToken } from '../services/api'

const routes = [
  { path: '/', name: 'home', component: LandingPage },
  { path: '/boletos', name: 'boletos', component: SeleccionBoletos },
  { path: '/compra-exitosa', name: 'compra-exitosa', component: CompraExitosa },
  { path: '/compra-pendiente', name: 'compra-pendiente', component: CompraPendiente },
  { path: '/compra-fallida', name: 'compra-fallida', component: CompraFallida },
  { path: '/admin/login', name: 'admin-login', component: LoginAdmin, meta: { publicAdmin: true } },
  { path: '/admin', name: 'admin', component: PanelAdmin, meta: { requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !getAdminToken()) {
    return next({ name: 'admin-login', query: { redirect: to.fullPath } })
  }

  if (to.name === 'admin-login' && getAdminToken()) {
    return next({ name: 'admin' })
  }

  return next()
})

export default router
