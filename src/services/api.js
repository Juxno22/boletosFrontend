import axios from 'axios'

const ADMIN_TOKEN_KEY = 'diagsa_admin_token'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getAdminToken()
  const isMapaPublico = config.url && config.url.includes('/api/boletos/mapa');
  const isAdminRoute = config.url && !isMapaPublico && (
    config.url.includes('/api/admin') ||
    config.url.includes('/api/compras') ||
    config.url.includes('/api/boletos')
  );

  if (token && isAdminRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      if (url.includes('/api/admin') || url.includes('/api/compras') || url.includes('/api/boletos')) {
        clearAdminToken()
      }
    }
    return Promise.reject(error)
  }
)

// Público
export const obtenerEvento = () => api.get('/api/evento')
export const crearPreferencia = (payload) => api.post('/api/crear-preferencia', payload)
export const obtenerMapaAsientos = (idTipoBoleto) => { return api.get(`/api/boletos/mapa/${idTipoBoleto}`); };
export const obtenerCompraPublica = (id, token) => api.get(`/api/compra-publica/${id}`, { params: { token } })
export const urlPdfCompraPublica = (id, token) => `${api.defaults.baseURL}/api/compra-publica/${encodeURIComponent(id)}/pdf?token=${encodeURIComponent(token)}`

// Admin auth
export const loginAdmin = (payload) => api.post('/api/admin/login', payload)
export const validarSesionAdmin = () => api.get('/api/admin/me')

// Admin gestión
export const obtenerDashboardAdmin = () => api.get('/api/admin/dashboard')
export const obtenerInventarioAdmin = () => api.get('/api/admin/inventario')
export const actualizarEventoAdmin = (id, payload) => api.put(`/api/admin/evento/${id}`, payload)
export const crearTipoBoletoAdmin = (payload) => api.post('/api/admin/tipos-boleto', payload)
export const actualizarTipoBoletoAdmin = (id, payload) => api.put(`/api/admin/tipos-boleto/${id}`, payload)
export const obtenerMapaReservadosAdmin = () => api.get('/api/admin/mapa-reservados')
export const actualizarAsientoAdmin = (id, payload) => api.put(`/api/admin/asientos/${id}`, payload)
export const crearVentaManualAdmin = (payload) => api.post('/api/admin/venta-manual', payload)

// Compras (admin)
export const listarCompras = (params = {}) => api.get('/api/compras', { params })
export const obtenerCompra = (id) => api.get(`/api/compras/${id}`)

// Boletos (admin)
export const marcarBoletoUsado = (id) => api.put(`/api/boletos/${id}/usar`)
export const buscarPorCodigo = (codigo, token = '') => api.get(`/api/boletos/codigo/${encodeURIComponent(codigo)}`, { params: token ? { token } : {} })

export default api
