<template>
  <div class="login-admin container">
    <div class="login-shell card">
      <div class="login-badge">Admin seguro</div>
      <h1>Panel de boletos</h1>
      <p class="login-sub">
        Acceso restringido para gestión de compras, inventario y validación de boletos.
      </p>

      <form class="login-form" @submit.prevent="entrar">
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input
            id="usuario"
            v-model.trim="form.usuario"
            type="text"
            autocomplete="username"
            placeholder="admin"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••••••"
          />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button class="btn btn-dorado login-btn" :disabled="cargando || !form.password">
          <span v-if="cargando">Verificando acceso…</span>
          <span v-else>Entrar al panel</span>
        </button>
      </form>

      <div class="login-security">
        <span>🔐</span>
        <p>La contraseña se valida en el backend y el token de sesión no se publica en el build del frontend.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { loginAdmin, setAdminToken } from '@/services/api'

export default {
  name: 'LoginAdmin',
  data () {
    return {
      form: { usuario: 'admin', password: '' },
      cargando: false,
      error: null
    }
  },
  methods: {
    async entrar () {
      this.error = null
      this.cargando = true
      try {
        const { data } = await loginAdmin(this.form)
        if (data.ok && data.token) {
          setAdminToken(data.token)
          this.$router.replace(this.$route.query.redirect || '/admin')
        } else {
          this.error = data.mensaje || 'No se pudo iniciar sesión.'
        }
      } catch (e) {
        this.error = e.response?.data?.mensaje || 'Acceso denegado. Verifica tus credenciales.'
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.login-admin {
  min-height: calc(100vh - 210px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.25rem;
}
.login-shell {
  width: 100%;
  max-width: 480px;
  padding: 2.2rem;
}
.login-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.72rem;
  border-radius: 999px;
  background: #ecfdf3;
  color: #17733a;
  font-size: 0.78rem;
  font-weight: 760;
  margin-bottom: 1rem;
}
.login-shell h1 {
  font-size: clamp(2rem, 5vw, 3.4rem);
  margin-bottom: 0.7rem;
}
.login-sub {
  color: var(--gris);
  line-height: 1.65;
  margin-bottom: 1.4rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login-btn {
  width: 100%;
  margin-top: 0.25rem;
}
.login-security {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-top: 1.3rem;
  padding: 1rem;
  border-radius: 20px;
  background: rgba(255,255,255,0.72);
  border: 1px solid var(--borde);
  color: var(--gris);
  font-size: 0.86rem;
  line-height: 1.55;
}
</style>
