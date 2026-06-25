<template>
  <div class="resultado container">
    <div class="resultado-card card">
      <div class="resultado-icono">❌</div>
      <h1 class="resultado-titulo">Pago no Completado</h1>
      <p class="resultado-sub">
        Tu pago no pudo ser procesado. No se realizó ningún cargo a tu cuenta.<br>
        Puedes intentarlo nuevamente o elegir otro método de pago.
      </p>

      <div v-if="idCompra" class="folio-box card">
        <p class="folio-label">Referencia</p>
        <p class="folio-num">#{{ idCompra }}</p>
      </div>

      <div class="alert alert-error" style="margin: 1.5rem 0; text-align:left">
        <strong>Posibles causas:</strong><br>
        • Fondos insuficientes en la cuenta.<br>
        • Límite de transacciones alcanzado.<br>
        • Datos de la tarjeta incorrectos.<br>
        • La transacción fue cancelada.
      </div>

      <div class="resultado-acciones">
        <router-link to="/boletos" class="btn btn-dorado">🔁 Intentar de nuevo</router-link>
        <router-link to="/" class="btn btn-outline">🏠 Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompraFallida',
  computed: {
    idCompra () { return this.$route.query.compra }
  }
}
</script>

<style scoped>
.resultado {
  padding: 5rem 1.25rem;
  max-width: 620px;
}
.resultado-card {
  text-align: center;
  padding: 2.6rem 2rem;
}
.resultado-icono {
  width: 76px;
  height: 76px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.35rem;
  border-radius: 24px;
  background: #fff0f1;
  font-size: 2.7rem;
  animation: none;
}
@keyframes floatSoft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.resultado-titulo {
  font-size: clamp(1.9rem, 4vw, 3rem);
  margin-bottom: 0.75rem;
}
.resultado-sub {
  color: var(--gris);
  max-width: 480px;
  margin: 0 auto 1.5rem;
  font-size: 1rem;
  line-height: 1.65;
}
.folio-box {
  display: inline-block;
  padding: 1rem 1.5rem;
  margin: 0 auto 1rem;
}
.folio-label {
  font-size: 0.82rem;
  color: var(--gris);
  text-transform: none;
  letter-spacing: -0.01em;
}
.folio-num {
  font-family: var(--fuente-display);
  font-size: 2rem;
  color: var(--rojo);
  margin: 0.25rem 0;
  letter-spacing: -0.055em;
}
.folio-hint { font-size: 0.82rem; color: var(--gris); }
.resultado-acciones {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}
</style>
