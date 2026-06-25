<template>
  <div class="resultado container">
    <div class="resultado-card card">
      <div class="resultado-icono exito"><span>✅</span></div>

      <h1 class="resultado-titulo">Compra recibida</h1>
      <p class="resultado-sub">
        Mercado Pago procesa la transacción. Los boletos aparecen solo cuando el backend recibe la confirmación oficial de pago aprobado.
      </p>

      <div v-if="cargando" class="estado-carga">
        <div class="spinner"></div>
        <p>Confirmando pago con la referencia segura…</p>
      </div>

      <div v-else-if="compra" class="compra-detalle">
        <div class="ornamento"><span>✦</span></div>
        <h2 class="detalle-titulo">Detalles de tu compra</h2>

        <div class="info-grid-sm">
          <div class="info-row"><span class="info-key">Folio</span><span class="info-val">#{{ compra.id_compra }}</span></div>
          <div class="info-row"><span class="info-key">Comprador</span><span class="info-val">{{ compra.nombre_comprador }}</span></div>
          <div class="info-row"><span class="info-key">Teléfono</span><span class="info-val">{{ compra.telefono_comprador || '—' }}</span></div>
          <div class="info-row">
            <span class="info-key">Estado</span>
            <span><span class="badge" :class="`badge-${compra.estado}`">{{ etiquetaEstado(compra.estado) }}</span></span>
          </div>
          <div class="info-row"><span class="info-key">Total</span><span class="info-val monto">${{ formatPrecio(compra.monto_total) }} MXN</span></div>
        </div>

        <div v-if="detalles.length" class="detalle-boletos">
          <h3 class="boletos-titulo">Resumen</h3>
          <div class="detalle-linea" v-for="d in detalles" :key="d.id_detalle">
            <span>{{ d.nombre_tipo_boleto }} × {{ d.cantidad }}</span>
            <strong>${{ formatPrecio(d.subtotal) }}</strong>
          </div>
        </div>

        <div v-if="boletos.length" class="acciones-pdf card">
          <div>
            <strong>PDF listo para descargar</strong>
            <p>Descarga el PDF y envíalo por WhatsApp al número registrado. Para ingresar se podrá solicitar identificación del comprador.</p>
          </div>
          <div class="pdf-actions">
            <a class="btn btn-dorado" :href="pdfHref" target="_blank" rel="noopener">Descargar PDF</a>
            <a v-if="whatsappUrl" class="btn btn-outline" :href="whatsappUrl" target="_blank" rel="noopener">Enviar por WhatsApp</a>
          </div>
        </div>

        <div v-if="boletos.length" class="boletos-lista">
          <h3 class="boletos-titulo">🎫 Tus boletos</h3>
          <div class="boleto-item" v-for="b in boletos" :key="b.id_boleto">
            <div class="qr-box">
              <img v-if="b.qr_data_url" :src="b.qr_data_url" :alt="`QR ${b.codigo_boleto}`">
            </div>
            <div class="boleto-info">
              <span class="boleto-codigo">{{ b.codigo_boleto }}</span>
              <p class="boleto-hint">
                {{ b.numero_asiento ? `Reservado #${b.numero_asiento} · válido para ${b.personas_incluidas || 4} personas` : 'Acceso general individual' }}
              </p>
              <p class="boleto-hint">Titular: {{ b.titular_nombre || compra.nombre_comprador }}</p>
              <p class="boleto-hint strong">Intransferible. Presentar identificación oficial del comprador.</p>
            </div>
            <span class="badge" :class="b.usado ? 'badge-cancelado' : 'badge-aprobado'">
              {{ b.usado ? 'Usado' : 'Válido' }}
            </span>
          </div>
        </div>

        <div v-else class="pendiente-nota alert alert-info">
          <strong>⏳ Confirmación en proceso</strong><br>
          Si Mercado Pago aún está notificando el pago, tus boletos y el PDF aparecerán aquí en cuanto el backend reciba la confirmación oficial.
        </div>
      </div>

      <div v-else class="alert alert-info">
        No pudimos consultar la compra con esta referencia. Conserva tu comprobante de Mercado Pago y contacta al soporte del evento.
      </div>

      <div class="resultado-acciones">
        <button v-if="puedeReintentar" class="btn btn-outline" @click="cargarCompra">Actualizar estado</button>
        <router-link to="/" class="btn btn-dorado">Volver al inicio</router-link>
        <router-link to="/boletos" class="btn btn-outline">Comprar más boletos</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { obtenerCompraPublica, urlPdfCompraPublica } from '@/services/api'

export default {
  name: 'CompraExitosa',
  data () {
    return { compra: null, detalles: [], boletos: [], cargando: false, pdfUrl: null, whatsappUrl: null }
  },
  computed: {
    idCompra () { return this.$route.query.compra },
    token () { return this.$route.query.token },
    puedeReintentar () { return this.idCompra && this.token },
    pdfHref () { return this.pdfUrl || (this.idCompra && this.token ? urlPdfCompraPublica(this.idCompra, this.token) : '#') }
  },
  async created () {
    await this.cargarCompra()
  },
  methods: {
    async cargarCompra () {
      if (!this.idCompra || !this.token) return
      this.cargando = true
      try {
        const { data } = await obtenerCompraPublica(this.idCompra, this.token)
        if (data.ok) {
          this.compra = data.compra
          this.detalles = data.detalles || []
          this.boletos = data.boletos || []
          this.pdfUrl = data.pdf_url || null
          this.whatsappUrl = data.whatsapp_url || null
        }
      } catch {
        // Se muestra mensaje genérico.
      } finally {
        this.cargando = false
      }
    },
    etiquetaEstado (estado) {
      const mapa = { pendiente: 'Pendiente', en_proceso: 'En proceso', aprobado: 'Aprobado', rechazado: 'Rechazado', cancelado: 'Cancelado' }
      return mapa[estado] || estado
    },
    formatPrecio (n) {
      return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.resultado { padding: 5rem 1.25rem; max-width: 960px; }
.resultado-card { text-align: center; padding: 2.6rem 2rem; }
.resultado-icono { width: 76px; height: 76px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.35rem; border-radius: 24px; background: #ecfdf3; font-size: 2.7rem; animation: pop 0.36s ease; }
@keyframes pop { 0% { transform: scale(0.78); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.resultado-titulo { font-size: clamp(2rem, 4.5vw, 3.4rem); margin-bottom: 0.75rem; }
.resultado-sub { color: var(--gris); max-width: 640px; margin: 0 auto 1.5rem; font-size: 1rem; line-height: 1.65; }
.estado-carga p { color: var(--gris); }
.compra-detalle { text-align: left; }
.detalle-titulo { font-size: 1.2rem; text-align: center; margin-bottom: 1.25rem; }
.info-grid-sm { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.25rem; }
.info-row, .detalle-linea { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.72rem 0; border-bottom: 1px solid var(--borde); font-size: 0.92rem; }
.info-key { color: var(--gris); }
.info-val { font-weight: 700; color: var(--crema); text-align: right; }
.info-val.monto { font-family: var(--fuente-display); color: var(--rojo); letter-spacing: -0.04em; }
.detalle-boletos { margin: 1.25rem 0; }
.boletos-lista { margin-top: 1.25rem; }
.boletos-titulo { font-size: 1.05rem; margin-bottom: 0.75rem; }
.acciones-pdf { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin: 1rem 0; background: linear-gradient(135deg, rgba(236,253,243,0.9), rgba(255,255,255,0.72)); }
.acciones-pdf p { color: var(--gris); font-size: 0.86rem; margin-top: 0.25rem; }
.pdf-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: flex-end; }
.boleto-item { display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; align-items: center; gap: 1rem; background: rgba(255,255,255,0.72); border: 1px solid var(--borde); border-radius: 18px; padding: 0.8rem 1rem; margin-bottom: 0.75rem; }
.qr-box { width: 92px; height: 92px; border-radius: 14px; background: #fff; border: 1px solid var(--borde); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.qr-box img { width: 84px; height: 84px; object-fit: contain; }
.boleto-info { min-width: 0; }
.boleto-codigo { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.92rem; color: var(--crema); letter-spacing: -0.01em; font-weight: 800; }
.boleto-hint { color: var(--gris); font-size: 0.78rem; margin-top: 0.2rem; }
.boleto-hint.strong { color: var(--rojo-oscuro); font-weight: 700; }
.pendiente-nota { text-align: left; margin-top: 1rem; font-size: 0.9rem; }
.resultado-acciones { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
@media (max-width: 760px) { .acciones-pdf { flex-direction: column; align-items: flex-start; } .boleto-item { grid-template-columns: 1fr; } }
</style>
