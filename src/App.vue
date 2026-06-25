<template>
  <div id="app-wrapper">
    <nav class="navbar">
      <div class="container navbar-inner">
        <router-link to="/" class="navbar-brand">
          <span class="brand-icon">🐂</span>
          <span>Diagsa Automotriz</span>
        </router-link>
        <div class="navbar-links">
          <router-link to="/">Inicio</router-link>
          <router-link to="/boletos">Boletos</router-link>
          <router-link to="/admin" class="link-admin">Admin</router-link>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <p class="footer-copy">
          © 2026 Diagsa Automotriz · Todos los derechos reservados
        </p>
        <p class="footer-social">
          <a href="https://www.instagram.com/diagsa_automotriz/" target="_blank" rel="noopener">
            📸 @diagsa_automotriz
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(24px);
  border-bottom: 1px solid var(--borde);
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--fuente-display);
  font-size: 1rem;
  font-weight: 760;
  color: var(--crema);
  text-decoration: none;
  letter-spacing: -0.03em;
}
.brand-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-size: 1.05rem;
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
}
.navbar-links a {
  padding: 0.48rem 0.82rem;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 650;
  color: var(--gris);
  text-transform: none;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}
.navbar-links a:hover,
.navbar-links a.router-link-active {
  background: #ffffff;
  color: var(--crema);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}
.navbar-links .link-admin {
  color: #8e8e93;
  font-size: 0.82rem;
}
.navbar-links .link-admin:hover {
  color: var(--rojo);
}

.footer {
  margin-top: 5rem;
  border-top: 1px solid var(--borde);
  padding: 2.25rem 0;
  background: rgba(255, 255, 255, 0.55);
}
.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  text-align: center;
}
.footer-copy {
  font-size: 0.84rem;
  color: var(--gris);
}
.footer-social a {
  font-size: 0.86rem;
  color: var(--crema);
  font-weight: 600;
}
.footer-social a:hover { color: var(--rojo); }

@media (max-width: 640px) {
  .navbar-inner { height: auto; min-height: 68px; gap: 0.75rem; flex-wrap: wrap; padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .navbar-links { width: 100%; justify-content: space-between; }
  .navbar-links a { font-size: 0.8rem; padding: 0.48rem 0.68rem; }
}
</style>
