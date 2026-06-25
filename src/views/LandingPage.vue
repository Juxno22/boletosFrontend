<template>
  <div class="landing">

    <!-- ===================== HERO / BANNER ===================== -->
    <section class="hero">
      <!-- Contenedor del banner 1920x800 -->
      <div class="hero-banner img-placeholder" style="width:100%; aspect-ratio:1920/800; max-height:600px;">
        <div class="hero-banner">
          <img :src="imagenes.bannerJaripeo" alt="Baile jaripeo aniversario Diagsa Automotriz" class="hero-banner-img">
        </div>
      </div>

      <!-- Overlay con info encima del banner -->
      <div class="hero-overlay">
        <div class="container hero-content">
          <!-- Logo del evento 300x150 -->
          <div class="evento-logo img-placeholder" style="width:300px; height:150px;">
            <div class="evento-logo">
              <img :src="imagenes.logoEvento" alt="Logo del evento" class="evento-logo-img">
            </div>
          </div>

          <div class="hero-text" v-if="evento">
            <p class="hero-eyebrow">Aniversario · 22 años</p>
            <h1 class="hero-title">{{ evento.nombre }}</h1>
            <div class="ornamento"><span>✦</span></div>
            <div class="hero-meta">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <div>
                  <span class="meta-label">Fecha</span>
                  <span class="meta-val">{{ formatFecha(evento.fecha_evento) }}</span>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <div>
                  <span class="meta-label">Hora</span>
                  <span class="meta-val">{{ formatHora(evento.fecha_evento) }}</span>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <div>
                  <span class="meta-label">Lugar</span>
                  <span class="meta-val">{{ evento.lugar }}</span>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📸</span>
                <div>
                  <span class="meta-label">Diagsa Instagram</span>
                  <p class="footer-social">
                    <a href="https://www.instagram.com/diagsa_automotriz/" target="_blank" rel="noopener">
                      @diagsa_automotriz
                    </a>
                  </p>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📸</span>
                <div>
                  <span class="meta-label">Diagsa Facebook</span>
                  <p class="footer-social">
                    <a href="https://www.facebook.com/DIAGSAUTOMOTRIZ" target="_blank" rel="noopener">
                      @DIAGSAUTOMOTRIZ
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <router-link to="/boletos" class="btn btn-dorado btn-hero">
              🎫 Comprar Boletos
            </router-link>
          </div>

          <!-- Skeleton mientras carga -->
          <div v-else-if="cargando" class="hero-text">
            <div class="skel skel-h1"></div>
            <div class="skel skel-text"></div>
            <div class="skel skel-text short"></div>
          </div>

          <div v-else class="hero-text">
            <p class="alert alert-error">No se pudo cargar la información del evento.</p>
            <button class="btn btn-outline" @click="cargarEvento">Reintentar</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ARTISTAS ===================== -->
    <section class="artistas container">
      <div class="ornamento"><span>✦</span></div>
      <h2 class="section-title">En Escena</h2>

      <!-- Grupo principal -->
      <div class="artista-principal">
        <div class="artista-img img-placeholder" style="width:100%;max-width:800px;height:500px; margin:0 auto;">
          <div class="artista-img">
            <img :src="imagenes.grupoPrincipal" alt="Grupo principal del evento" class="artista-img-real">
          </div>
        </div>
        <div class="artista-info">
          <p class="artista-eyebrow">Grupo estelar</p>
          <h3 class="artista-nombre">{{ evento?.grupo_principal || 'Los Huracanes del Norte' }}</h3>
          <p class="artista-desc">Los norteños más tumbados del corrido. Una noche que no se olvida.</p>
          <a :href="evento?.instagram_grupo_principal || 'https://www.instagram.com/loshuracanesdelnorte/'"
            target="_blank" rel="noopener" class="btn btn-outline">
            📸 Ver en Instagram
          </a>
        </div>
      </div>

      <!-- Ranchos invitados -->
      <div class="ornamento"><span>✦</span></div>
      <h3 class="section-subtitle">Ranchos invitados</h3>
      <div class="ranchos-grid">
        <div class="rancho-card card" v-for="(rancho, index) in ranchosConRedes" :key="`${rancho.nombre}-${index}`">
          <div class="rancho-img">
            <img :src="imagenes.ranchos[index % imagenes.ranchos.length]" :alt="rancho.nombre" class="rancho-img-real">
          </div>
          <div class="rancho-body">
            <p class="rancho-label">Participación especial</p>
            <p class="rancho-nombre">{{ rancho.nombre }}</p>
            <div v-if="tieneRedes(rancho)" class="rancho-socials">
              <a v-if="rancho.instagram" :href="normalizarRedSocial(rancho.instagram, 'instagram')" target="_blank"
                rel="noopener noreferrer" class="rancho-social-link">
                Instagram
              </a>
              <a v-if="rancho.facebook" :href="normalizarRedSocial(rancho.facebook, 'facebook')" target="_blank"
                rel="noopener noreferrer" class="rancho-social-link">
                Facebook
              </a>
              <a v-if="rancho.tiktok" :href="normalizarRedSocial(rancho.tiktok, 'tiktok')" target="_blank"
                rel="noopener noreferrer" class="rancho-social-link">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!ranchosConRedes.length" class="ranchos-empty">
        Los ranchos invitados se publicarán próximamente.
      </p>
    </section>
    <!-- ===================== TIPOS DE BOLETO (preview) ===================== -->
    <section class="boletos-preview" v-if="tiposBoleto.length">
      <div class="container">
        <div class="ornamento"><span>✦</span></div>
        <h2 class="section-title">Tipos de Boleto</h2>
        <div class="boletos-grid">
          <div class="boleto-card card" v-for="tipo in tiposBoleto" :key="tipo.id_tipo_boleto">
            <div class="boleto-header">
              <h4 class="boleto-nombre">{{ tipo.nombre }}</h4>
              <span class="boleto-precio">${{ formatPrecio(tipo.precio) }}</span>
            </div>
            <p class="boleto-desc">{{ tipo.descripcion }}</p>
            <p class="boleto-stock" :class="{ agotado: tipo.cantidad_restante === 0 }">
              <span v-if="tipo.cantidad_restante > 0">{{ tipo.cantidad_restante }} disponibles</span>
              <span v-else>Agotado</span>
            </p>
          </div>
        </div>
        <div class="boletos-cta">
          <router-link to="/boletos" class="btn btn-dorado btn-lg">
            🎫 Comprar mis boletos
          </router-link>
        </div>
      </div>
    </section>

    <!-- ===================== INFO DEL EVENTO ===================== -->
    <section class="info-evento container" v-if="evento">
      <div class="ornamento"><span>✦</span></div>
      <h2 class="section-title">Información del Evento</h2>
      <div class="info-grid">
        <div class="info-card card">
          <span class="info-icon">📅</span>
          <h4>Fecha</h4>
          <p>{{ formatFecha(evento.fecha_evento) }}</p>
        </div>
        <div class="info-card card">
          <span class="info-icon">⏰</span>
          <h4>Horario</h4>
          <p>{{ formatHora(evento.fecha_evento) }} hrs</p>
        </div>
        <div class="info-card card">
          <span class="info-icon">📍</span>
          <h4>Lugar</h4>
          <p>{{ evento.lugar }}</p>
        </div>
        <div class="info-card card">
          <span class="info-icon">📸</span>
          <h4>Instagram</h4>
          <a :href="evento.instagram_evento" target="_blank" rel="noopener">@diagsa_automotriz</a>
        </div>
      </div>

      <div class="evento-desc card" v-if="evento.descripcion">
        <p>{{ evento.descripcion }}</p>
      </div>
    </section>

  </div>
</template>

<script>
import { obtenerEvento } from '@/services/api'

import bannerJaripeo from '@/assets/img/banner.jpg'
import logoEvento from '@/assets/img/evento.jpg'
import grupoPrincipal from '@/assets/img/huracanes.jpg'
import rancho1 from '@/assets/img/cementerio.png'
import rancho2 from '@/assets/img/sanAntonio.png'

export default {
  name: 'LandingPage',
  data() {
    return {
      evento: null,
      tiposBoleto: [],
      cargando: true,
      error: null,

      imagenes: {
        bannerJaripeo,
        logoEvento,
        grupoPrincipal,
        ranchos: [
          rancho1,
          rancho2
        ]
      }
    }
  },
  computed: {
    ranchosInvitados() {
      const texto = String(this.evento?.ranchos_invitados || '')
        .replace(/^ranchos invitados?:/i, '')
        .trim()

      if (!texto) return []

      return texto
        .split(/,|\sy\s/i)
        .map((rancho) => rancho.trim())
        .filter(Boolean)
    },

    ranchosConRedes() {
      const json = this.evento?.ranchos_redes_json

      if (json) {
        try {
          const ranchos = JSON.parse(json)

          if (Array.isArray(ranchos)) {
            return ranchos
              .map((rancho) => ({
                nombre: String(rancho.nombre || '').trim(),
                instagram: String(rancho.instagram || '').trim(),
                facebook: String(rancho.facebook || '').trim(),
                tiktok: String(rancho.tiktok || '').trim()
              }))
              .filter((rancho) => rancho.nombre)
          }
        } catch (error) {
          console.warn('No se pudo leer ranchos_redes_json:', error)
        }
      }

      return this.ranchosInvitados.map((nombre) => ({
        nombre,
        instagram: '',
        facebook: '',
        tiktok: ''
      }))
    }
  },
  async created() {
    await this.cargarEvento()
  },
  methods: {
    tieneRedes(rancho) {
      return Boolean(rancho?.instagram || rancho?.facebook || rancho?.tiktok)
    },

    normalizarRedSocial(valor, tipo) {
      const texto = String(valor || '').trim()

      if (!texto) return '#'
      if (/^https?:\/\//i.test(texto)) return texto

      const usuario = texto.replace(/^@/, '')

      const bases = {
        instagram: 'https://www.instagram.com/',
        facebook: 'https://www.facebook.com/',
        tiktok: 'https://www.tiktok.com/@'
      }

      return `${bases[tipo] || 'https://'}${usuario}`
    },
    async cargarEvento() {
      this.cargando = true
      this.error = null
      try {
        const { data } = await obtenerEvento()
        if (data.ok) {
          this.evento = data.evento
          this.tiposBoleto = data.tipos_boleto
        } else {
          this.error = data.mensaje
        }
      } catch (e) {
        this.error = 'Error de conexión con el servidor.'
      } finally {
        this.cargando = false
      }
    },
    formatFecha(iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatHora(iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatPrecio(precio) {
      return Number(precio || 0).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: min(72vh, 720px);
  border-bottom: 1px solid var(--borde);
}

.hero-banner {
  width: 100%;
  max-height: 640px;
  border-radius: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 20%, rgba(255, 25, 47, 0.16), transparent 24rem),
    linear-gradient(90deg, rgba(245, 245, 247, 0.98) 0%, rgba(245, 245, 247, 0.84) 48%, rgba(245, 245, 247, 0.26) 100%);
  display: flex;
  align-items: center;
}

.hero-content {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.evento-logo {
  width: min(300px, 76vw) !important;
  height: 136px !important;
  margin-bottom: 1.35rem;
  border-radius: 26px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: rgba(255, 25, 47, 0.09);
  color: var(--rojo-oscuro);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: -0.01em;
  margin-bottom: 0.85rem;
}

.hero-title {
  max-width: 760px;
  font-size: clamp(2.25rem, 6vw, 5.2rem);
  color: var(--crema);
  line-height: 0.96;
  letter-spacing: -0.065em;
  text-shadow: none;
}

.hero .ornamento {
  justify-content: flex-start;
  margin: 1.5rem 0 1.25rem;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 1.35rem 0 1.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 64px;
  padding: 0.75rem 0.95rem;
  border: 1px solid var(--borde);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(18px);
}

.meta-icon {
  font-size: 1.25rem;
}

.meta-label {
  display: block;
  font-size: 0.72rem;
  color: var(--gris);
  text-transform: none;
  letter-spacing: -0.01em;
}

.meta-val {
  display: block;
  max-width: 280px;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--crema);
  text-transform: capitalize;
}

.btn-hero {
  min-height: 52px;
  padding: 0.95rem 1.6rem;
  font-size: 1rem;
}

.artistas {
  padding: 5.25rem 1.25rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.8rem);
  text-align: center;
  margin-bottom: 2.75rem;
}

.section-subtitle {
  font-size: clamp(1.45rem, 3vw, 2.2rem);
  text-align: center;
  margin-bottom: 2rem;
  color: var(--crema);
}

.artista-principal {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 4rem;
}

.artista-img {
  border-radius: 34px;
  height: 500px !important;
}

.artista-info {
  padding: 1rem 0;
}

.artista-eyebrow,
.rancho-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--rojo);
  margin-bottom: 0.55rem;
}

.artista-nombre {
  font-size: clamp(2rem, 4vw, 3.35rem);
  color: var(--crema);
  margin-bottom: 1rem;
}

.artista-desc {
  color: var(--gris);
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
  line-height: 1.65;
  max-width: 520px;
}

.ranchos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.rancho-card {
  overflow: hidden;
}

.rancho-img {
  border-radius: 24px;
}

.rancho-body {
  padding-top: 1rem;
}

.rancho-nombre {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--crema);
}

.ranchos-empty {
  text-align: center;
  color: var(--gris);
  font-weight: 600;
}

.boletos-preview {
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 25, 47, 0.08), transparent 30rem),
    #ffffff;
  padding: 5rem 0;
  border-top: 1px solid var(--borde);
  border-bottom: 1px solid var(--borde);
}

.boletos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.boleto-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.boleto-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 25, 47, 0.18);
  box-shadow: var(--sombra-dorada);
}

.boleto-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.boleto-nombre {
  font-size: 1.08rem;
  color: var(--crema);
}

.boleto-precio {
  font-family: var(--fuente-display);
  font-size: 1.15rem;
  font-weight: 760;
  color: var(--rojo);
  white-space: nowrap;
  letter-spacing: -0.04em;
}

.boleto-desc {
  font-size: 0.9rem;
  color: var(--gris);
  margin-bottom: 0.85rem;
  line-height: 1.55;
}

.boleto-stock {
  display: inline-flex;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: #ecfdf3;
  color: #17733a;
  font-size: 0.78rem;
  font-weight: 700;
}

.boleto-stock.agotado {
  background: #fff0f1;
  color: var(--rojo-oscuro);
}

.boletos-cta {
  text-align: center;
}

.btn-lg {
  padding: 0.95rem 1.75rem;
  font-size: 1rem;
}

.info-evento {
  padding: 5rem 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
  text-align: left;
  padding: 1.35rem;
}

.info-icon {
  font-size: 1.8rem;
}

.info-card h4 {
  font-size: 0.88rem;
  color: var(--gris);
  margin: 0;
  text-transform: none;
  letter-spacing: -0.01em;
}

.info-card p,
.info-card a {
  font-size: 1rem;
  color: var(--crema);
  font-weight: 650;
}

.evento-desc {
  text-align: center;
  color: var(--gris);
  line-height: 1.75;
  font-size: 1rem;
}

.skel {
  background: linear-gradient(90deg, #eeeeef 25%, #ffffff 50%, #eeeeef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.45s infinite;
  border-radius: 18px;
  margin-bottom: 0.75rem;
}

.footer-social a {
  font-size: 0.86rem;
  color: var(--crema);
  font-weight: 600;
}

.footer-social a:hover {
  color: var(--rojo);
}

.skel-h1 {
  height: 3.5rem;
  width: 70%;
}

.skel-text {
  height: 1rem;
  width: 90%;
}

.skel-text.short {
  width: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
    display: flex;
    flex-direction: column;
  }

  .hero-banner {
    max-height: 260px;
  }

  .hero-overlay {
    position: relative;
    background: #f5f5f7;
  }

  .hero-content {
    padding-top: 2rem;
    padding-bottom: 2.5rem;
  }

  .hero-title {
    font-size: clamp(2rem, 12vw, 3.35rem);
  }

  .hero .ornamento {
    justify-content: center;
  }

  .hero-meta {
    flex-direction: column;
  }

  .meta-item {
    width: 100%;
  }

  .artistas {
    padding: 4rem 1rem;
  }

  .artista-principal {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .artista-img {
    height: 320px !important;
  }

  .ranchos-grid {
    grid-template-columns: 1fr;
  }

  .info-evento {
    padding: 4rem 1rem;
  }
}

.hero-banner {
  width: 100%;
  aspect-ratio: 1920 / 800;
  max-height: 600px;
  overflow: hidden;
}

.hero-banner-img,
.evento-logo-img,
.artista-img-real,
.rancho-img-real {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.evento-logo {
  width: min(300px, 76vw);
  height: 136px;
  margin-bottom: 1.35rem;
  border-radius: 26px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
}

.evento-logo-img {
  object-fit: contain;
  padding: 1rem;
}

.artista-img {
  width: 100%;
  max-width: 800px;
  height: 500px;
  margin: 0 auto;
  border-radius: 34px;
  overflow: hidden;
}

.rancho-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 340px;
  border-radius: 24px;
  overflow: hidden;
}

.rancho-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.9rem;
}

.rancho-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0.42rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 25, 47, 0.08);
  border: 1px solid rgba(255, 25, 47, 0.16);
  color: var(--rojo);
  font-family: var(--fuente-cuerpo);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.rancho-social-link:hover {
  transform: translateY(-1px);
  background: rgba(255, 25, 47, 0.12);
  border-color: rgba(255, 25, 47, 0.28);
  color: var(--rojo-oscuro);
}
</style>
