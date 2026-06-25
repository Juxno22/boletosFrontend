<template>
  <div class="seleccion container">
    <div class="page-header">
      <div class="ornamento"><span>✦</span></div>
      <h1>Compra segura de boletos</h1>
      <p class="page-sub" v-if="evento">{{ evento.nombre }}</p>
      <div class="trust-strip">
        <span>🔒 Pago 100% en Mercado Pago</span>
        <span>🧾 Folio seguro de compra</span>
        <span>🎫 Inventario protegido</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="centered">
      <div class="spinner"></div>
      <p class="loading-text">Cargando disponibilidad…</p>
    </div>

    <!-- Error al cargar -->
    <div v-else-if="errorCarga" class="centered">
      <div class="alert alert-error">{{ errorCarga }}</div>
      <button class="btn btn-outline" style="margin-top:1rem" @click="cargarEvento">Reintentar</button>
    </div>

    <!-- Contenido principal -->
    <div v-else class="seleccion-grid">

      <!-- Panel izquierdo: tipos de boleto + formulario -->
      <div class="panel-izq">

        <!-- Tipos de boleto -->
        <section class="seccion card">
          <div class="secure-panel">
            <div>
              <strong>Venta protegida</strong>
              <p>Reservamos tu selección por tiempo limitado mientras Mercado Pago procesa la transacción.</p>
            </div>
            <span class="secure-pill">{{ reservaTexto }}</span>
          </div>
          <h2 class="seccion-titulo">🎫 Elige tus Boletos</h2>

          <div v-if="!tiposBoleto.length" class="alert alert-info">
            No hay tipos de boleto activos para este evento. Revisa que los boletos estén vinculados al evento activo
            desde la base de datos o desde el panel admin.
          </div>

          <div v-for="tipo in tiposBoleto" :key="tipo.id_tipo_boleto" class="tipo-boleto"
            :class="{ 'tipo-agotado': tipo.cantidad_restante === 0 }">
            <div class="tipo-info">
              <div class="tipo-top">
                <h3 class="tipo-nombre">{{ tipo.nombre }}</h3>
                <span class="tipo-precio">{{ precioTipoTexto(tipo) }}</span>
              </div>
              <p class="tipo-desc">{{ tipo.descripcion }}</p>
              <p class="tipo-stock"
                :class="{ 'stock-bajo': tipo.cantidad_restante <= 10 && tipo.cantidad_restante > 0 }">
                <span v-if="tipo.cantidad_restante > 0">{{ tipo.cantidad_restante }} disponibles</span>
                <span v-else class="agotado-label">🚫 Agotado</span>
              </p>

              <div v-if="esTipoReservado(tipo)" class="mapa-reservado">
                <div class="mapa-head">
                  <div>
                    <strong>Selecciona tus lugares reservados</strong>
                    <p>Elige figuras disponibles. Las marcadas con X no se pueden comprar.</p>
                  </div>
                  <button class="btn btn-outline btn-mini" type="button" @click="cargarMapaReservado(tipo)">
                    Actualizar mapa
                  </button>
                </div>

                <div class="mapa-leyenda mapa-leyenda-zonas">
                  <span><i class="leyenda-dot zona-amarillo"></i>Amarillo · $6,000</span>
                  <span><i class="leyenda-dot zona-rojo"></i>Rojo · $7,800</span>
                  <span><i class="leyenda-dot zona-verde"></i>Verde · $9,000</span>
                  <span><i class="leyenda-dot seleccionado"></i>Seleccionado</span>
                  <span><i class="leyenda-dot no-disponible"></i>Adquirido / apartado</span>
                </div>

                <div v-if="cargandoMapa[tipo.id_tipo_boleto]" class="mapa-loading">
                  <div class="spinner mini-spinner"></div>
                  <p>Cargando mapa…</p>
                </div>

                <div v-else-if="erroresMapa[tipo.id_tipo_boleto]" class="alert alert-error mapa-error">
                  {{ erroresMapa[tipo.id_tipo_boleto] }}
                </div>

                <div v-else class="seat-map" role="group" :aria-label="`Mapa de ${tipo.nombre}`">
                  <button v-for="asiento in asientosMapa(tipo)" :key="asiento.id_asiento || asiento.numero"
                    type="button" class="seat-shape" :class="[
                      `figura-${asiento.figura || 'circulo'}`,
                      `seat-zona-${asiento.color_zona || 'verde'}`,
                      estadoAsientoClase(tipo, asiento)
                    ]" :disabled="!asientoDisponible(asiento)" :title="tituloAsiento(asiento)"
                    @click="toggleAsiento(tipo, asiento)">
                    <span v-if="asientoDisponible(asiento)">{{ asiento.numero }}</span>
                    <span v-else class="seat-x">×</span>
                  </button>
                </div>

                <div class="mapa-seleccion">
                  <strong>{{ asientosSeleccionadosTipo(tipo).length }}</strong>
                  <span>lugar(es) seleccionado(s)</span>
                  <small v-if="asientosSeleccionadosTipo(tipo).length">
                    {{ resumenAsientosSeleccionados(tipo) }}
                  </small>
                </div>
              </div>
            </div>

            <div class="tipo-control tipo-control-reservado" v-if="esTipoReservado(tipo) && tipo.cantidad_restante > 0">
              <span class="qty-val">{{ cantidades[tipo.id_tipo_boleto] || 0 }}</span>
              <span class="qty-label">seleccionado(s)</span>
            </div>

            <div class="tipo-control" v-else-if="tipo.cantidad_restante > 0">
              <button class="qty-btn" @click="decrementar(tipo.id_tipo_boleto)"
                :disabled="!cantidades[tipo.id_tipo_boleto]">−</button>
              <span class="qty-val">{{ cantidades[tipo.id_tipo_boleto] || 0 }}</span>
              <button class="qty-btn" @click="incrementar(tipo.id_tipo_boleto, tipo.cantidad_restante)"
                :disabled="(cantidades[tipo.id_tipo_boleto] || 0) >= tipo.cantidad_restante || totalBoletos >= maxBoletosOrden">+</button>
            </div>
          </div>
        </section>

        <!-- Formulario comprador -->
        <section class="seccion card" v-if="hayBoletos">
          <h2 class="seccion-titulo">👤 Tus Datos</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre completo *</label>
              <input id="nombre" v-model.trim="comprador.nombre" :class="{ error: errores.nombre }" type="text"
                placeholder="Juan Pérez García" autocomplete="name" />
              <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono para WhatsApp / PDF *</label>
              <input id="telefono" v-model.trim="comprador.telefono" :class="{ error: errores.telefono }" type="tel"
                placeholder="2221234567" autocomplete="tel" />
              <span v-if="errores.telefono" class="error-msg">{{ errores.telefono }}</span>
            </div>
          </div>
          <p class="identificacion-nota">
            El PDF de tus boletos se entregará con este número. Para ingresar al evento se podrá solicitar identificación oficial del comprador.
          </p>
        </section>

      </div>

      <!-- Panel derecho: resumen + pago -->
      <div class="panel-der">
        <div class="resumen card" :class="{ 'resumen-sticky': true }">
          <h2 class="seccion-titulo">🧾 Resumen</h2>

          <div v-if="!hayBoletos" class="resumen-vacio">
            <span class="vacio-icon">🎫</span>
            <p>Selecciona al menos un boleto para continuar.</p>
          </div>

          <div v-else>
            <div class="resumen-lineas">
              <div v-for="tipo in boletosSeleccionados" :key="tipo.id_tipo_boleto" class="resumen-linea">
                <div class="rl-info">
                  <span class="rl-nombre">{{ tipo.nombre }}</span>
                  <span class="rl-qty">× {{ tipo.cantidad }}</span>
                  <span v-if="tipo.asientos && tipo.asientos.length" class="rl-asientos">
                    Lugares: {{ numerosAsientosResumen(tipo) }}
                  </span>
                </div>
                <span class="rl-subtotal">${{ formatPrecio(tipo.subtotal) }}</span>
              </div>
            </div>

            <div class="resumen-divider"></div>

            <div class="resumen-total">
              <span>Total</span>
              <span class="total-monto">${{ formatPrecio(total) }} <small>MXN</small></span>
            </div>

            <div class="limite-nota" v-if="totalBoletos >= maxBoletosOrden">
              Máximo {{ maxBoletosOrden }} boletos por operación.
            </div>

            <!-- Error de pago -->
            <div v-if="errorPago" class="alert alert-error" style="margin-top:1rem">
              {{ errorPago }}
            </div>

            <button class="btn btn-dorado btn-pagar" :disabled="procesando || !formValido" @click="pagar">
              <span v-if="procesando">Procesando…</span>
              <span v-else>💳 Pagar con Mercado Pago</span>
            </button>

            <div class="checkout-security">
              <div class="checkout-row"><span>🔐</span>
                <p>No capturamos datos de tarjeta en esta página.</p>
              </div>
              <div class="checkout-row"><span>✅</span>
                <p>El cobro, validación y autorización se realizan directamente en Mercado Pago.</p>
              </div>
              <div class="checkout-row"><span>⏱️</span>
                <p>Tu selección se aparta durante {{ reservaTexto.toLowerCase() }} para evitar sobreventa.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info del evento compacta -->
        <div class="evento-mini card" v-if="evento">
          <div class="evento-mini-item">
            <span>📅</span>
            <span>{{ formatFecha(evento.fecha_evento) }}</span>
          </div>
          <div class="evento-mini-item">
            <span>⏰</span>
            <span>{{ formatHora(evento.fecha_evento) }} hrs</span>
          </div>
          <div class="evento-mini-item">
            <span>📍</span>
            <span>{{ evento.lugar }}</span>
          </div>
        </div>
      </div>

    </div>

    <div v-if="procesando" class="processing-overlay">
      <div class="processing-card card">
        <div class="spinner"></div>
        <h2>Preparando pago seguro</h2>
        <p>{{ mensajeProcesando }}</p>
        <div class="processing-steps">
          <span>1. Validando disponibilidad</span>
          <span>2. Reservando boletos</span>
          <span>3. Redirigiendo a Mercado Pago</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { obtenerEvento, crearPreferencia, obtenerMapaAsientos } from '@/services/api'

export default {
  name: 'SeleccionBoletos',
  data() {
    return {
      evento: null,
      tiposBoleto: [],
      cantidades: {},
      comprador: { nombre: '', telefono: '' },
      errores: {},
      cargando: true,
      errorCarga: null,
      errorPago: null,
      procesando: false,
      mensajeProcesando: 'No cierres esta ventana. Te llevaremos al checkout oficial de Mercado Pago.',
      mapasAsientos: {},
      asientosSeleccionados: {},
      cargandoMapa: {},
      erroresMapa: {}
    }
  },
  computed: {
    maxBoletosOrden() {
      const n = Number(process.env.VUE_APP_MAX_TICKETS_PER_ORDER || 10)
      return Number.isInteger(n) && n > 0 ? n : 10
    },
    hayBoletos() {
      return Object.values(this.cantidades).some(v => v > 0)
    },
    boletosSeleccionados() {
      return this.tiposBoleto
        .filter(t => this.cantidades[t.id_tipo_boleto] > 0)
        .map(t => {
          const cantidad = this.cantidades[t.id_tipo_boleto]

          if (this.esTipoReservado(t)) {
            const numeros = this.asientosSeleccionados[t.id_tipo_boleto] || []
            const asientos = numeros
              .map(numero => this.obtenerAsientoPorNumero(t, numero))
              .filter(Boolean)
              .sort((a, b) => a.numero - b.numero)

            return {
              ...t,
              cantidad: asientos.length,
              asientos,
              subtotal: asientos.reduce((s, asiento) => s + Number(asiento.precio || 0), 0)
            }
          }

          return {
            ...t,
            cantidad,
            asientos: undefined,
            subtotal: Number(t.precio) * cantidad
          }
        })
    },
    total() {
      return this.boletosSeleccionados.reduce((s, t) => s + t.subtotal, 0)
    },
    totalBoletos() {
      return this.boletosSeleccionados.reduce((s, t) => s + t.cantidad, 0)
    },
    reservaTexto() {
      return '15 minutos'
    },
    formValido() {
      return (
        this.hayBoletos &&
        this.totalBoletos <= this.maxBoletosOrden &&
        this.comprador.nombre.length >= 3 &&
        /^\d{10,15}$/.test(String(this.comprador.telefono || '').replace(/\D/g, ''))
      )
    }
  },
  async created() {
    await this.cargarEvento()
  },
  methods: {
    async cargarEvento() {
      this.cargando = true;
      this.errorCarga = null;

      try {
        const { data } = await obtenerEvento();

        if (data.ok) {
          this.evento = data.evento;
          this.tiposBoleto = data.tipos_boleto || [];

          const cant = {};
          const selected = {};

          this.tiposBoleto.forEach((tipo) => {
            cant[tipo.id_tipo_boleto] = 0;
            selected[tipo.id_tipo_boleto] = [];
          });

          this.cantidades = cant;
          this.asientosSeleccionados = selected;

          await Promise.all(
            this.tiposBoleto
              .filter((tipo) => this.esTipoReservado(tipo))
              .map((tipo) => this.cargarMapaReservado(tipo))
          );
        } else {
          this.errorCarga = data.mensaje;
        }
      } catch (error) {
        this.errorCarga = 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
      } finally {
        this.cargando = false;
      }
    },
    esTipoReservado(tipo) {
      const nombre = String(tipo?.nombre || '').toLowerCase();

      return (
        Number(tipo?.requiere_asientos || 0) === 1 ||
        nombre.includes('reservado') ||
        nombre.includes('vip')
      );
    },
    asientosMapa(tipo) {
      return this.mapasAsientos[tipo.id_tipo_boleto] || []
    },
    asientosSeleccionadosTipo(tipo) {
      return this.asientosSeleccionados[tipo.id_tipo_boleto] || []
    },
    obtenerAsientoPorNumero(tipo, numero) {
      return this.asientosMapa(tipo).find(asiento => Number(asiento.numero) === Number(numero)) || null
    },
    resumenAsientosSeleccionados(tipo) {
      return this.asientosSeleccionadosTipo(tipo)
        .map(numero => this.obtenerAsientoPorNumero(tipo, numero))
        .filter(Boolean)
        .sort((a, b) => a.numero - b.numero)
        .map(asiento => `${asiento.numero} ($${this.formatPrecio(asiento.precio)})`)
        .join(', ')
    },
    numerosAsientosResumen(tipo) {
      return (tipo.asientos || [])
        .map(asiento => asiento.numero)
        .sort((a, b) => a - b)
        .join(', ')
    },
    precioTipoTexto(tipo) {
      if (this.esTipoReservado(tipo)) {
        const asientos = this.asientosMapa(tipo)
        const precios = asientos.length
          ? asientos.filter(a => a.estado === 'disponible').map(a => Number(a.precio || 0)).filter(Boolean)
          : [Number(tipo.precio || tipo.precio_min_asiento || 0)].filter(Boolean)

        const min = precios.length ? Math.min(...precios) : Number(tipo.precio || 0)
        const max = precios.length ? Math.max(...precios) : Number(tipo.precio_max_asiento || min)

        if (min && max && min !== max) return `$${this.formatPrecio(min)} - $${this.formatPrecio(max)} MXN`
        return `$${this.formatPrecio(min || tipo.precio)} MXN`
      }

      return `$${this.formatPrecio(tipo.precio)} MXN`
    },
    async cargarMapaReservado(tipo) {
      if (!tipo?.id_tipo_boleto) return
      this.cargandoMapa = { ...this.cargandoMapa, [tipo.id_tipo_boleto]: true }
      this.erroresMapa = { ...this.erroresMapa, [tipo.id_tipo_boleto]: null }
      try {
        const { data } = await obtenerMapaAsientos(tipo.id_tipo_boleto)
        if (data.ok) {
          const asientos = data.asientos || []
          this.mapasAsientos = { ...this.mapasAsientos, [tipo.id_tipo_boleto]: asientos }
          const disponibles = asientos.filter(asiento => asiento.estado === 'disponible').length
          this.tiposBoleto = this.tiposBoleto.map(item => (
            item.id_tipo_boleto === tipo.id_tipo_boleto
              ? { ...item, cantidad_restante: disponibles, cantidad_disponible: asientos.length }
              : item
          ))
        } else {
          this.erroresMapa = { ...this.erroresMapa, [tipo.id_tipo_boleto]: data.mensaje || 'No se pudo cargar el mapa.' }
        }
      } catch (e) {
        this.erroresMapa = { ...this.erroresMapa, [tipo.id_tipo_boleto]: e.response?.data?.mensaje || 'No se pudo cargar el mapa de reservados.' }
      } finally {
        this.cargandoMapa = { ...this.cargandoMapa, [tipo.id_tipo_boleto]: false }
      }
    },
    asientoDisponible(asiento) {
      return asiento?.estado === 'disponible'
    },
    estadoAsientoClase(tipo, asiento) {
      if (this.asientoSeleccionado(tipo, asiento.numero)) return 'seat-seleccionado'
      if (asiento.estado === 'disponible') return 'seat-disponible'
      return 'seat-no-disponible'
    },
    asientoSeleccionado(tipo, numero) {
      return this.asientosSeleccionadosTipo(tipo).includes(Number(numero))
    },
    tituloAsiento(asiento) {
      const estado = asiento.estado === 'disponible' ? 'Disponible' : 'No disponible'
      const zona = asiento.zona || 'Zona reservada'
      const precio = asiento.precio ? ` · $${this.formatPrecio(asiento.precio)} MXN` : ''
      return `Lugar ${asiento.numero} · ${zona}${precio} · ${estado}`
    },
    toggleAsiento(tipo, asiento) {
      if (!this.asientoDisponible(asiento)) return
      const id = tipo.id_tipo_boleto
      const numero = Number(asiento.numero)
      const actuales = [...(this.asientosSeleccionados[id] || [])]
      const existe = actuales.includes(numero)

      let siguientes
      if (existe) {
        siguientes = actuales.filter(n => n !== numero)
      } else {
        if (this.totalBoletos >= this.maxBoletosOrden) {
          this.errorPago = `Puedes seleccionar máximo ${this.maxBoletosOrden} boletos por operación.`
          return
        }
        siguientes = [...actuales, numero].sort((a, b) => a - b)
      }

      this.errorPago = null
      this.asientosSeleccionados = { ...this.asientosSeleccionados, [id]: siguientes }
      this.cantidades = { ...this.cantidades, [id]: siguientes.length }
    },
    incrementar(id, max) {
      const actual = this.cantidades[id] || 0
      if (this.totalBoletos >= this.maxBoletosOrden) {
        this.errorPago = `Puedes seleccionar máximo ${this.maxBoletosOrden} boletos por operación.`
        return
      }
      if (actual < max) {
        this.errorPago = null
        this.cantidades = { ...this.cantidades, [id]: actual + 1 }
      }
    },
    decrementar(id) {
      const actual = this.cantidades[id] || 0
      if (actual > 0) {
        this.cantidades = { ...this.cantidades, [id]: actual - 1 }
      }
    },
    validarForm() {
      const e = {}
      if (!this.comprador.nombre || this.comprador.nombre.length < 3) {
        e.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).'
      }
      const tel = String(this.comprador.telefono || '').replace(/\D/g, '')
      if (!tel || !/^\d{10,15}$/.test(tel)) {
        e.telefono = 'Ingresa un teléfono válido. Lo usaremos para entregar tu PDF por WhatsApp.'
      }
      if (!this.hayBoletos) {
        e.boletos = 'Selecciona al menos un boleto.'
      }
      if (this.totalBoletos > this.maxBoletosOrden) {
        e.boletos = `Puedes comprar máximo ${this.maxBoletosOrden} boletos por operación.`
      }
      this.errores = e
      if (e.boletos) this.errorPago = e.boletos
      return Object.keys(e).length === 0
    },
    async pagar() {
      if (!this.validarForm()) return
      this.procesando = true
      this.errorPago = null
      this.mensajeProcesando = 'Validando inventario en tiempo real…'
      try {
        const payload = {
          id_evento: this.evento.id_evento,
          comprador: {
            nombre: this.comprador.nombre,
            telefono: this.comprador.telefono || undefined
          },
          boletos: this.boletosSeleccionados.map(t => ({
            id_tipo_boleto: t.id_tipo_boleto,
            cantidad: t.cantidad,
            asientos: t.asientos ? t.asientos.map(asiento => asiento.numero) : undefined
          }))
        }
        const { data } = await crearPreferencia(payload)
        if (data.ok) {
          this.mensajeProcesando = 'Inventario reservado. Abriendo checkout oficial de Mercado Pago…'
          sessionStorage.setItem('ultima_compra_diagsa', JSON.stringify({ id: data.id_compra, token: data.public_token }))
          const checkoutUrl = data.checkout_url || data.checkout_url_sandbox
          if (!checkoutUrl) throw new Error('Mercado Pago no devolvió una URL de checkout.')
          window.location.href = checkoutUrl
        } else {
          this.errorPago = data.mensaje || 'No se pudo crear la preferencia de pago.'
        }
      } catch (e) {
        const msg = e.response?.data?.mensaje
        this.errorPago = msg || 'Error al conectar con el servidor de pagos. Intenta de nuevo.'
      } finally {
        this.procesando = false
      }
    },
    formatFecha(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    },
    formatHora(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    },
    formatPrecio(n) {
      return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.seleccion {
  padding: 4rem 1.25rem 5rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.trust-strip {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.2rem;
}

.trust-strip span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.75rem;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--crema-suave);
  font-size: 0.82rem;
  font-weight: 650;
}

.secure-panel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(23, 115, 58, 0.18);
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(236, 253, 243, 0.9), rgba(255, 255, 255, 0.72));
}

.secure-panel strong {
  color: #17733a;
  letter-spacing: -0.02em;
}

.secure-panel p {
  color: var(--gris);
  font-size: 0.86rem;
  margin-top: 0.2rem;
}

.secure-pill {
  flex-shrink: 0;
  padding: 0.34rem 0.72rem;
  border-radius: 999px;
  background: #ffffff;
  color: #17733a;
  font-size: 0.8rem;
  font-weight: 760;
  border: 1px solid rgba(23, 115, 58, 0.16);
}

.checkout-security {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--borde);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.62);
}

.checkout-row {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.82rem;
  color: var(--gris);
  line-height: 1.45;
}

.processing-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(245, 245, 247, 0.78);
  backdrop-filter: blur(22px);
}

.processing-card {
  width: min(100%, 480px);
  text-align: center;
  padding: 2rem;
}

.processing-card h2 {
  font-size: 1.45rem;
  margin-bottom: 0.5rem;
}

.processing-card p {
  color: var(--gris);
  line-height: 1.55;
}

.processing-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.2rem;
  text-align: left;
}

.processing-steps span {
  padding: 0.7rem 0.85rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--borde);
  color: var(--crema-suave);
  font-size: 0.86rem;
  font-weight: 650;
}

.page-header h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  margin-bottom: 0.65rem;
}

.page-sub {
  font-size: 1rem;
  color: var(--gris);
  max-width: 620px;
  margin: 0 auto;
}

.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
}

.loading-text {
  color: var(--gris);
  margin-top: 0.5rem;
}

.seleccion-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 1.25rem;
  align-items: start;
}

.panel-izq,
.panel-der {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.seccion {
  margin-bottom: 0;
}

.seccion-titulo {
  font-size: 1.16rem;
  color: var(--crema);
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--borde);
  letter-spacing: -0.01em;
}

.tipo-boleto {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--borde);
}

.tipo-boleto:last-child {
  border-bottom: none;
}

.tipo-agotado {
  opacity: 0.52;
}

.tipo-info {
  flex: 1;
  min-width: 0;
}

.tipo-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.tipo-nombre {
  font-size: 1.06rem;
  color: var(--crema);
  margin: 0;
  letter-spacing: -0.01em;
}

.tipo-precio {
  font-family: var(--fuente-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--rojo);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.tipo-desc {
  font-size: 0.9rem;
  color: var(--gris);
  margin-bottom: 0.38rem;
  line-height: 1.45;
}

.tipo-stock {
  display: inline-flex;
  padding: 0.26rem 0.58rem;
  border-radius: 999px;
  background: #ecfdf3;
  color: #17733a;
  font-size: 0.78rem;
  font-weight: 700;
}

.tipo-stock.stock-bajo {
  background: #fff7dc;
  color: #926200;
}

.agotado-label {
  color: var(--rojo-oscuro);
}

.tipo-control {
  display: flex;
  align-items: center;
  gap: 0.48rem;
  flex-shrink: 0;
  padding: 0.25rem;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.tipo-control-reservado {
  flex-direction: column;
  border-radius: 20px;
  padding: 0.7rem 0.85rem;
  min-width: 108px;
}

.qty-label {
  color: var(--gris);
  font-size: 0.72rem;
  line-height: 1;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: #ffffff;
  color: var(--crema);
  border-radius: 999px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.16s ease;
  line-height: 1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.qty-btn:hover:not(:disabled) {
  background: var(--rojo);
  color: #ffffff;
  transform: scale(1.03);
}

.qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.qty-val {
  min-width: 28px;
  text-align: center;
  font-weight: 760;
  font-size: 1.02rem;
  color: var(--crema);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resumen-sticky {
  position: sticky;
  top: 86px;
}

.resumen {
  border-color: rgba(255, 25, 47, 0.18);
  box-shadow: 0 26px 70px rgba(255, 25, 47, 0.12);
}

.resumen-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: var(--gris);
  text-align: center;
  font-size: 0.92rem;
}

.vacio-icon {
  font-size: 2.4rem;
}

.resumen-lineas {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.resumen-linea {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.rl-info {
  display: flex;
  flex-direction: column;
}

.rl-nombre {
  font-size: 0.92rem;
  color: var(--crema);
  font-weight: 650;
}

.rl-qty,
.rl-asientos {
  font-size: 0.8rem;
  color: var(--gris);
}

.rl-subtotal {
  font-weight: 760;
  color: var(--crema);
  font-size: 0.96rem;
  white-space: nowrap;
}

.resumen-divider {
  height: 1px;
  background: var(--borde);
  margin: 1rem 0;
}

.resumen-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.25rem;
  font-weight: 760;
  font-size: 1rem;
  color: var(--crema);
}

.total-monto {
  font-family: var(--fuente-display);
  font-size: 1.55rem;
  color: var(--rojo);
  letter-spacing: -0.01em;
}

.total-monto small {
  font-size: 0.72rem;
  color: var(--gris);
  letter-spacing: 0;
}

.btn-pagar {
  width: 100%;
  padding: 1rem;
  font-size: 0.98rem;
  margin-bottom: 1rem;
}

.limite-nota {
  padding: 0.7rem 0.85rem;
  margin-bottom: 1rem;
  border-radius: 16px;
  background: #fff7dc;
  color: #926200;
  font-size: 0.84rem;
  font-weight: 650;
}

.evento-mini {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.2rem;
}

.evento-mini-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.86rem;
  color: var(--gris);
}

.mapa-reservado {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(245, 245, 247, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.mapa-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.mapa-head strong {
  color: var(--crema);
  letter-spacing: -0.01em;
}

.mapa-head p {
  color: var(--gris);
  font-size: 0.84rem;
  margin-top: 0.2rem;
}

.btn-mini {
  min-height: 34px;
  padding: 0.45rem 0.75rem;
  font-size: 0.78rem;
}

.mapa-leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.9rem;
}

.mapa-leyenda span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--gris);
  font-size: 0.75rem;
  font-weight: 650;
}

.leyenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.leyenda-dot.disponible {
  background: #22c55e;
}

.leyenda-dot.zona-amarillo {
  background: #facc15;
}

.leyenda-dot.zona-rojo {
  background: #ef233c;
}

.leyenda-dot.zona-verde {
  background: #22c55e;
}

.leyenda-dot.seleccionado {
  background: var(--rojo);
}

.leyenda-dot.no-disponible {
  background: #d1d5db;
}

.seat-map {
  display: grid;
  grid-template-columns: repeat(20, 40px);
  grid-auto-rows: 40px;
  gap: 0.45rem;
  padding: 0.9rem;
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 25, 47, 0.07), transparent 18rem),
    rgba(255, 255, 255, 0.7);
  border: 1px solid var(--borde);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.seat-shape {
  position: relative;
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.96);
  background: #22c55e;
  color: #ffffff;
  font-family: var(--fuente-display);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, outline-color 0.16s ease;
}

.seat-shape:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.figura-circulo {
  border-radius: 999px;
}

.figura-cuadrado {
  border-radius: 9px;
}

.figura-rombo {
  border-radius: 8px;
  transform: rotate(45deg);
}

.figura-rombo span {
  transform: rotate(-45deg);
}

.figura-hexagono {
  clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%);
}

.seat-zona-amarillo.seat-disponible {
  background: linear-gradient(145deg, #fef08a, #facc15);
  color: #5f4200;
  text-shadow: none;
}

.seat-zona-rojo.seat-disponible {
  background: linear-gradient(145deg, #ff4d62, #ef233c);
}

.seat-zona-verde.seat-disponible {
  background: linear-gradient(145deg, #16a34a, #22c55e);
}

.seat-seleccionado {
  outline: 4px solid rgba(255, 25, 47, 0.42);
  outline-offset: 2px;
  box-shadow: 0 12px 28px rgba(255, 25, 47, 0.30);
  transform: scale(1.04);
}

.seat-no-disponible {
  background: #e5e7eb !important;
  color: var(--rojo);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.95;
  text-shadow: none;
}

.seat-x {
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 800;
}

.mapa-seleccion {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: baseline;
  margin-top: 0.9rem;
  padding: 0.7rem 0.85rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--borde);
  color: var(--gris);
  font-size: 0.85rem;
}

.mapa-seleccion strong {
  color: var(--rojo);
  font-size: 1.05rem;
}

.mapa-seleccion small {
  width: 100%;
  color: var(--crema);
  font-weight: 650;
}

.mapa-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--gris);
}

.mini-spinner {
  width: 24px;
  height: 24px;
  margin: 0;
}

.mapa-error {
  margin: 0.6rem 0;
}

.identificacion-nota { margin-top: 0.85rem; color: var(--gris); font-size: 0.84rem; line-height: 1.5; }
@media (max-width: 900px) {
  .seleccion {
    padding-top: 3rem;
  }

  .seleccion-grid {
    grid-template-columns: 1fr;
  }

  .resumen-sticky {
    position: static;
  }

  .panel-der {
    order: -1;
  }

  .tipo-boleto {
    align-items: flex-start;
    flex-direction: column;
  }

  .tipo-control {
    align-self: flex-start;
  }

  .secure-panel {
    flex-direction: column;
  }

  .secure-pill {
    align-self: flex-start;
  }

  .seat-map {
    grid-template-columns: repeat(20, 38px);
    grid-auto-rows: 38px;
  }

  .seat-shape {
    width: 38px;
    height: 38px;
    font-size: 0.78rem;
  }

  .mapa-head {
    flex-direction: column;
  }
}
</style>
