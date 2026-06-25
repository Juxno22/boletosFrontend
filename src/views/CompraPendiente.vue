<template>
  <div class="resultado container">
    <div class="resultado-card card">
      <div class="resultado-icono">⏳</div>
      <h1 class="resultado-titulo">Pago en proceso</h1>
      <p class="resultado-sub">
        Mercado Pago está validando la operación. No capturamos ni almacenamos datos de tarjeta en esta página.
      </p>

      <div v-if="idCompra" class="folio-box card">
        <p class="folio-label">Número de folio</p>
        <p class="folio-num">#{{ idCompra }}</p>
        <p class="folio-hint">Guarda este número para dar seguimiento a tu compra.</p>
      </div>

      <div v-if="compra" class="estado-box">
        <span class="badge" :class="`badge-${compra.estado}`">{{ etiquetaEstado(compra.estado) }}</span>
        <p v-if="compra.reserva_expira_at">Reserva activa hasta: {{ formatFecha(compra.reserva_expira_at) }}</p>
      </div>

      <div class="alert alert-info" style="margin: 1.5rem 0; text-align:left">
        <strong>¿Qué sigue?</strong><br>
        Cuando Mercado Pago confirme el pago, el backend generará los boletos automáticamente. Usa el botón para consultar nuevamente el estado.
      </div>

      <div class="resultado-acciones">
        <button v-if="puedeConsultar" class="btn btn-dorado" :disabled="cargando" @click="consultarCompra">
          {{ cargando ? 'Consultando…' : 'Actualizar estado' }}
        </button>
        <router-link to="/" class="btn btn-outline">Volver al inicio</router-link>
        <a href="https://www.instagram.com/diagsa_automotriz/" target="_blank" rel="noopener" class="btn btn-outline">
          Contactar soporte
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { obtenerCompraPublica } from '@/services/api'

export default {
  name: 'CompraPendiente',
  data () {
    return { compra: null, cargando: false }
  },
  computed: {
    idCompra () { return this.$route.query.compra },
    token () { return this.$route.query.token },
    puedeConsultar () { return this.idCompra && this.token }
  },
  async created () {
    await this.consultarCompra()
  },
  methods: {
    async consultarCompra () {
      if (!this.puedeConsultar) return
      this.cargando = true
      try {
        const { data } = await obtenerCompraPublica(this.idCompra, this.token)
        if (data.ok) {
          this.compra = data.compra
          if (data.compra.estado === 'aprobado') {
            this.$router.replace({ path: '/compra-exitosa', query: { compra: this.idCompra, token: this.token } })
          }
        }
      } catch {
        this.compra = null
      } finally {
        this.cargando = false
      }
    },
    etiquetaEstado (estado) {
      const mapa = { pendiente: 'Pendiente', en_proceso: 'En proceso', aprobado: 'Aprobado', rechazado: 'Rechazado', cancelado: 'Cancelado' }
      return mapa[estado] || estado
    },
    formatFecha (iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    }
  }
}
</script>

<style scoped>
.resultado { padding: 5rem 1.25rem; max-width: 640px; }
.resultado-card { text-align: center; padding: 2.6rem 2rem; }
.resultado-icono { width: 76px; height: 76px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.35rem; border-radius: 24px; background: var(--dorado-suave); font-size: 2.7rem; animation: floatSoft 1.8s ease-in-out infinite; }
@keyframes floatSoft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.resultado-titulo { font-size: clamp(1.9rem, 4vw, 3rem); margin-bottom: 0.75rem; }
.resultado-sub { color: var(--gris); max-width: 500px; margin: 0 auto 1.5rem; font-size: 1rem; line-height: 1.65; }
.folio-box { display: inline-block; padding: 1rem 1.5rem; margin: 0 auto 1rem; }
.folio-label { font-size: 0.82rem; color: var(--gris); letter-spacing: -0.01em; }
.folio-num { font-family: var(--fuente-display); font-size: 2rem; color: var(--rojo); margin: 0.25rem 0; letter-spacing: -0.055em; }
.folio-hint, .estado-box p { font-size: 0.82rem; color: var(--gris); }
.estado-box { margin: 1rem 0; }
.resultado-acciones { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }
</style>
