# 🐂 Gran Jaripeo Diagsa – Frontend

Frontend en **Vue 3 (Composition-compatible Options API)** para el Gran Jaripeo del Aniversario 22 años de Diagsa Automotriz.

---

## Estructura del proyecto

```
frontend/
├── public/
│   └── index.html            # HTML raíz con fuentes de Google
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── global.css    # Variables de diseño, tokens, utilidades
│   ├── router/
│   │   └── index.js          # Rutas Vue Router
│   ├── services/
│   │   └── api.js            # Capa de consumo de API (axios)
│   ├── views/
│   │   ├── LandingPage.vue   # Página principal con banner, artistas, boletos
│   │   ├── SeleccionBoletos.vue  # Selección, formulario y botón de pago
│   │   ├── CompraExitosa.vue     # Regreso de MP: pago aprobado
│   │   ├── CompraPendiente.vue   # Regreso de MP: pago en proceso
│   │   ├── CompraFallida.vue     # Regreso de MP: pago rechazado/cancelado
│   │   └── PanelAdmin.vue        # Panel de administración con tabla y boletos
│   ├── App.vue               # Layout global: navbar + router-view + footer
│   └── main.js               # Entry point
├── .env.example              # Variables de entorno de ejemplo
├── .env                      # Variables locales (no subir a git)
├── babel.config.js
├── package.json
└── vue.config.js
```

---

## Requisitos

- **Node.js** 16+ (recomendado 18 LTS)
- **npm** 8+
- Backend corriendo en `http://localhost:3000` (o la URL que configures)

---

## Instalación y ejecución

```bash
# 1. Entrar a la carpeta
cd frontend

# 2. Copiar el archivo de variables de entorno
cp .env.example .env

# 3. Editar .env con tus valores reales (ver sección Variables de entorno)
#    nano .env  o  code .env

# 4. Instalar dependencias
npm install

# 5. Iniciar servidor de desarrollo
npm run serve
```

La app quedará disponible en **http://localhost:8080**

---

## Variables de entorno

Edita el archivo `.env` antes de iniciar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VUE_APP_API_URL` | URL base del backend Express | `http://localhost:3000` |
| `VUE_APP_ADMIN_API_KEY` | API key del panel de administración (misma que `ADMIN_API_KEY` en el backend) | `mi-clave-secreta` |

> ⚠️ **Importante:** Todas las variables deben empezar con `VUE_APP_` para que Vue CLI las exponga al navegador.

---

## Build para producción

```bash
npm run build
```

Los archivos estáticos quedan en la carpeta `dist/`. Súbelos a cualquier hosting estático (Netlify, Vercel, Firebase Hosting, S3, etc.) o sírvelos con Nginx/Apache.

---

## Rutas de la aplicación

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | `LandingPage` | Página principal del evento |
| `/boletos` | `SeleccionBoletos` | Selección de boletos y formulario de compra |
| `/compra-exitosa?compra=ID` | `CompraExitosa` | Confirmación de pago aprobado (regreso desde MP) |
| `/compra-pendiente?compra=ID` | `CompraPendiente` | Pago en proceso (regreso desde MP) |
| `/compra-fallida?compra=ID` | `CompraFallida` | Pago rechazado o cancelado (regreso desde MP) |
| `/admin` | `PanelAdmin` | Panel de administración (requiere `ADMIN_API_KEY`) |

---

## Endpoints del backend consumidos

| Método | Endpoint | Vista | Requiere admin |
|---|---|---|---|
| `GET` | `/api/evento` | Landing, Selección | No |
| `POST` | `/api/crear-preferencia` | Selección | No |
| `GET` | `/api/compras` | Panel Admin | Sí |
| `GET` | `/api/compras/:id` | Panel Admin, Éxito | Sí |
| `PUT` | `/api/boletos/:id/usar` | Panel Admin | Sí |
| `GET` | `/api/boletos/codigo/:codigo` | Panel Admin | Sí |

El header de administración se envía automáticamente:
```
x-admin-api-key: <VUE_APP_ADMIN_API_KEY>
```

---

## Flujo de compra completo

```
Landing Page
    └─ [Comprar Boletos] ──→ /boletos
                                ├─ Seleccionar cantidades (con validación de stock)
                                ├─ Llenar datos del comprador
                                └─ [Pagar con Mercado Pago]
                                        └─ POST /api/crear-preferencia
                                                └─ Redirección a checkout_url de MP
                                                        ├─ Aprobado  → /compra-exitosa?compra=ID
                                                        ├─ Pendiente → /compra-pendiente?compra=ID
                                                        └─ Fallido   → /compra-fallida?compra=ID
```

---

## Imágenes (contenedores vacíos)

Los contenedores de imagen están listos para reemplazar con `<img>` cuando tengas los archivos:

| Contenedor | Medidas | Ubicación |
|---|---|---|
| Banner principal | 1920 × 800 px | `LandingPage.vue` → `.hero-banner` |
| Logo del evento | 300 × 150 px | `LandingPage.vue` → `.evento-logo` |
| Imagen grupo principal | 800 × 600 px | `LandingPage.vue` → `.artista-img` |
| Rancho invitado 1 | 400 × 400 px | `LandingPage.vue` → `.rancho-img` (n=1) |
| Rancho invitado 2 | 400 × 400 px | `LandingPage.vue` → `.rancho-img` (n=2) |

Para reemplazar un contenedor, sustituye:
```html
<div class="img-placeholder ...">...</div>
```
por:
```html
<img src="/img/banner.jpg" alt="Banner Jaripeo" class="hero-banner-img" />
```

---

## Diseño

- **Paleta:** Negro profundo `#0D0A08` · Rojo torero `#C0272D` · Dorado `#C9972C`
- **Tipografía:** Cinzel (display/títulos) + Inter (cuerpo)
- **Mobile-first:** Breakpoints en 600px y 900px
- **Responsive:** Tabla del admin se adapta en pantallas pequeñas

---

## Notas de desarrollo

- El frontend **no guarda estado entre sesiones** — toda la información viene del backend.
- El panel `/admin` requiere que `VUE_APP_ADMIN_API_KEY` coincida exactamente con `ADMIN_API_KEY` del backend.
- Los boletos individuales solo se generan cuando el webhook de Mercado Pago notifica un pago `approved`. En modo sandbox/pruebas, verifica que el webhook esté configurado con ngrok u otro tunel.
