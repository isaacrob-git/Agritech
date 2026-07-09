# AgriTech: CosechaDirecta

**Plataforma B2B de Comercio Agrícola**

Conexión Directa del Campo al Comercio

- Marketplace B2B donde agricultores de las regiones productoras venden directamente a comercios en las capitales.
- Tokenizacion de activos del ramo agropecuario 
- Logística colaborativa terrestre (aprovechando flotas de fletes subutilizadas).
- Financiamiento de insumos agrícolas basados en contratos de compra futuros de los comercios.


---

## Tech Stack

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000?logo=mongoose)
![JWT](https://img.shields.io/badge/JWT-auth-000000?logo=jsonwebtoken)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript)

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express 5, MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken) + bcrypt |
| **Frontend** | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| **Fonts** | Inter (Google Fonts) |
| **PDF** | `window.print()` via `window.open()` |
| **Files** | Multer |

---

## Features

### Agricultor
- Publicar productos agrícolas con precio, cantidad y ubicación
- Recibir y gestionar pedidos de comercios (aceptar/rechazar)
- Tokenizar cosechas como activos digitales para respaldo financiero
- Solicitar financiamiento usando tokens como garantía
- Aceptar/rechazar contratos a futuro propuestos por comercios
- Publicar viajes de carga y asignar transportistas
- Tracking de pedidos en tiempo real
- Imprimir PDF: Facturas, Contratos, Comprobantes, Órdenes de transporte

### Comercio
- Explorar catálogo de productos disponibles
- Realizar pedidos al por mayor
- Proponer contratos a futuro a agricultores (precio fijo, volumen acordado)
- Tracking de pedidos con estado del viaje asociado
- Historial de compras y contratos
- Imprimir PDF: Facturas y Contratos

### Transportista
- Ver viajes disponibles publicados por agricultores
- Aceptar viajes y asignarse como transportista
- Actualizar tracking del viaje (7 estados + ubicación)
- Historial de viajes completados
- Imprimir PDF: Comprobante de viaje

### Administrador
- CRUD completo de todas las entidades (usuarios, productos, pedidos, contratos, tokens, viajes, financiamientos)
- Cambio de contraseña de cualquier usuario
- Soft/hard delete con verificación de dependencias
- Dashboard con estadísticas globales

---

## Arquitectura

```
Cliente (HTML + JS + Tailwind)
       │
       │ fetch() con Bearer JWT
       ▼
API REST (Express 5)
       │
       ├── /api/auth           → AuthController
       ├── /api/products       → ProductController
       ├── /api/orders         → OrderController
       ├── /api/contracts      → ContractController
       ├── /api/tokens         → AssetTokenController
       ├── /api/financiamiento → FinancingController
       ├── /api/trips          → TripController
       └── /api/admin          → AdminController
       │
       ▼
MongoDB (Mongoose ODM)
  ├── User
  ├── Product
  ├── Order
  ├── Contract
  ├── AssetToken
  ├── Financing
  └── Trip
```

---

## Instalación

### Requisitos

- Node.js 18+
- MongoDB 7+ corriendo en `localhost:27017`
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd CosechaDirecta

# 2. Instalar dependencias
cd server
npm install

# 3. Configurar variables de entorno
echo "JWT_SECRET=supersecreto123" > .env

# 4. Iniciar MongoDB (si no está corriendo)
mongod

# 5. Iniciar el servidor
npm start
# o con nodemon
npm run dev
```

El servidor se levanta en `http://localhost:3000`.

> **Nota:** El frontend es HTML estático. Abre `client/index.html` en tu navegador o sírvelo con cualquier servidor estático.

---

## Estructura del proyecto

```
CosechaDirecta/
├── client/                         # Frontend (HTML estático)
│   ├── index.html                  # Landing page pública
│   ├── login.html                  # Inicio de sesión
│   ├── register.html               # Registro de usuarios
│   ├── main-user.html              # Página principal post-login
│   ├── marketplace.html            # Catálogo de productos
│   ├── dashboard/
│   │   ├── agricultor.html         # Dashboard Agricultor
│   │   ├── comercio.html           # Dashboard Comercio
│   │   ├── transportista.html      # Dashboard Transportista
│   │   └── admin.html              # Dashboard Administrador
│   └── assets/
│       ├── css/
│       ├── js/
│       │   ├── api.js              # API_URL global
│       │   ├── login.js            # Lógica de login
│       │   ├── auth.js             # Verificación de sesión
│       │   └── dashboard.js        # Lógica de dashboard unificado
│       └── img/
│
├── server/                         # Backend (Node.js + Express)
│   ├── server.js                   # Entry point
│   ├── app.js                      # Configuración Express
│   ├── .env                        # Variables de entorno
│   ├── config/
│   │   └── db.js                   # Conexión MongoDB
│   ├── models/
│   │   ├── User.js                 # agricultor, comercio, transportista, admin
│   │   ├── Product.js              # disponible, vendido
│   │   ├── Order.js                # 6 estados + viaje asociado
│   │   ├── Contract.js             # 8 estados + token + historial
│   │   ├── AssetToken.js           # 5 estados + financiado + split
│   │   ├── Financing.js            # 4 estados + historial
│   │   └── Trip.js                 # 7 estados + tracking geográfico
│   ├── controllers/
│   │   ├── authController.js       # register, login
│   │   ├── productController.js    # CRUD productos
│   │   ├── orderController.js      # Órdenes por rol, cambio de estado
│   │   ├── contractController.js   # CRUD + aceptar/rechazar/cancelar
│   │   ├── assetTokenController.js # Generar, split, consultar
│   │   ├── financingController.js  # Solicitar, aprobar, rechazar
│   │   ├── tripController.js       # Crear, asignar, tracking
│   │   └── adminController.js      # CRUD global + password
│   ├── routes/
│   │   └── *.js                    # 1 por controlador
│   └── middleware/
│       ├── authMiddleware.js        # JWT protect
│       └── upload.js                # Multer
│
└── package.json
```

---

## API Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| GET | `/api/auth/agricultores` | ❌ | Listar agricultores |

### Productos — `/api/products`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | ❌ | Productos disponibles |
| GET | `/api/products/me` | ✅ | Mis productos (agricultor) |
| POST | `/api/products` | ✅ | Crear producto |
| DELETE | `/api/products/:id` | ✅ | Eliminar producto |

### Pedidos — `/api/orders`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/orders` | ✅ | Crear pedido |
| GET | `/api/orders/comercio` | ✅ | Mis pedidos (comercio) |
| GET | `/api/orders/agricultor` | ✅ | Pedidos recibidos (agricultor) |
| PUT | `/api/orders/:id` | ✅ | Actualizar estado del pedido |

### Contratos — `/api/contracts`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/contracts` | ✅ | Crear contrato |
| GET | `/api/contracts/comercio` | ✅ | Mis contratos (comercio) |
| GET | `/api/contracts/agricultor` | ✅ | Contratos recibidos (agricultor) |
| GET | `/api/contracts/:id` | ✅ | Contrato por ID |
| PUT | `/api/contracts/:id/aceptar` | ✅ | Aceptar contrato |
| PUT | `/api/contracts/:id/rechazar` | ✅ | Rechazar contrato |
| PUT | `/api/contracts/:id/estado` | ✅ | Avanzar estado |
| PUT | `/api/contracts/:id/cancelar` | ✅ | Cancelar contrato |

### Tokens — `/api/tokens`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/tokens` | ❌ | Todos los tokens disponibles |
| POST | `/api/tokens/generate` | ✅ | Generar token desde producto |
| GET | `/api/tokens/mis-tokens` | ✅ | Mis tokens |
| GET | `/api/tokens/:codigo` | ❌ | Token por código |
| PUT | `/api/tokens/:id/estado` | ✅ | Actualizar estado |
| POST | `/api/tokens/:id/split` | ✅ | Dividir token |

### Financiamiento — `/api/financiamiento`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/financiamiento` | ✅ | Solicitar financiamiento |
| GET | `/api/financiamiento` | ✅ | Mis financiamientos |
| GET | `/api/financiamiento/pendientes` | ✅ | Solicitudes pendientes |
| PUT | `/api/financiamiento/:id/aprobar` | ✅ | Aprobar solicitud |
| PUT | `/api/financiamiento/:id/rechazar` | ✅ | Rechazar solicitud |

### Viajes — `/api/trips`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/trips` | ✅ | Crear viaje (agricultor) |
| GET | `/api/trips/disponibles` | ✅ | Viajes disponibles (transportista) |
| GET | `/api/trips/mis-viajes` | ✅ | Mis viajes (transportista) |
| GET | `/api/trips/mis-pedidos` | ✅ | Pedidos con viaje (agricultor) |
| GET | `/api/trips/:id` | ✅ | Viaje por ID |
| PUT | `/api/trips/:id/asignar` | ✅ | Asignarse un viaje |
| PUT | `/api/trips/:id/estado` | ✅ | Actualizar estado + tracking |

### Admin — `/api/admin` (rol: admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | Listar usuarios |
| GET | `/api/admin/productos` | Listar productos |
| GET | `/api/admin/pedidos` | Listar pedidos |
| GET | `/api/admin/contratos` | Listar contratos |
| GET | `/api/admin/tokens` | Listar tokens |
| GET | `/api/admin/viajes` | Listar viajes |
| GET | `/api/admin/financiamientos` | Listar financiamientos |
| PUT | `/api/admin/usuarios/:id` | Actualizar usuario |
| PUT | `/api/admin/usuarios/:id/password` | Cambiar contraseña |
| PUT | `/api/admin/productos/:id` | Actualizar producto |
| PUT | `/api/admin/pedidos/:id` | Actualizar pedido |
| PUT | `/api/admin/contratos/:id` | Actualizar contrato |
| PUT | `/api/admin/tokens/:id` | Actualizar token |
| PUT | `/api/admin/viajes/:id` | Actualizar viaje |
| PUT | `/api/admin/financiamientos/:id` | Actualizar financiamiento |
| DELETE | `/api/admin/usuarios/:id` | Desactivar usuario |
| DELETE | `/api/admin/productos/:id` | Eliminar producto |
| DELETE | `/api/admin/pedidos/:id` | Cancelar pedido |
| DELETE | `/api/admin/contratos/:id` | Cancelar contrato |
| DELETE | `/api/admin/tokens/:id` | Eliminar token |
| DELETE | `/api/admin/viajes/:id` | Eliminar viaje |
| DELETE | `/api/admin/financiamientos/:id` | Eliminar financiamiento |

---

## Modelos de datos

| Modelo | Colección | Campos clave |
|--------|-----------|-------------|
| **User** | `users` | `codigo`, `nombre`, `email`, `password`, `rol` (agricultor/comercio/transportista/admin) |
| **Product** | `products` | `nombre`, `cantidad`, `precioKg`, `ubicacion`, `agricultor` (ref), `estado` (disponible/vendido) |
| **Order** | `orders` | `producto` (ref), `comercio` (ref), `agricultor` (ref), `cantidad`, `estado` (6), `viaje` (ref) |
| **Contract** | `contracts` | `codigo`, `comercio` (ref), `agricultor` (ref), `nombreProducto`, `cantidadKg`, `precioAcordado`, `fechaEntrega`, `token` (ref), `estado` (8), `historial` |
| **AssetToken** | `assettokens` | `codigo`, `producto`/`contrato` (ref), `nombreActivo`, `cantidad`, `propietario` (ref), `financiado`, `estado` (5), `historial` |
| **Financing** | `financings` | `agricultor` (ref), `token` (ref), `valorEstimado`, `montoSolicitado`, `interes`, `plazoDias`, `estado` (4), `historial` |
| **Trip** | `trips` | `codigo`, `agricultor` (ref), `transportista` (ref), `origen`, `destino`, `cargaTotalKg`, `pago`, `pedidos` (ref[]), `estado` (7), `tracking` |

---

## Dashboards por rol

| Rol | URL | Contenido |
|-----|-----|-----------|
| Agricultor | `client/dashboard/agricultor.html` | Dashboard, Mis productos, Pedidos, Tokens, Financiamientos, Contratos, Viajes, Perfil |
| Comercio | `client/dashboard/comercio.html` | Dashboard, Marketplace, Mis pedidos, Contratos, Perfil |
| Transportista | `client/dashboard/transportista.html` | Dashboard, Viajes disponibles, Mis viajes, Historial, Perfil |
| Admin | `client/dashboard/admin.html` | Dashboard, Usuarios, Productos, Pedidos, Contratos, Tokens, Viajes, Financiamientos |

**Flujo de navegación:**
1. Usuario inicia sesión en `login.html`
2. Login exitoso → redirige a `main-user.html`
3. `main-user.html` → botón "Acceder al Dashboard" → redirige al dashboard según `user.rol`
4. `index.html` con sesión activa → redirige a `main-user.html`

---

## Autenticación

- El login devuelve un JWT y un objeto `user` con `{ id, codigo, nombre, email, rol }`
- El token se almacena en `localStorage` bajo la clave `token`
- El usuario se almacena en `localStorage` bajo la clave `user`
- Todas las rutas protegidas requieren header: `Authorization: Bearer <token>`
- Middleware `protect` verifica el JWT y adjunta `req.user = { id, rol }`
- Las rutas de admin verifican adicionalmente `req.user.rol === "admin"`

---

## Flujo de trabajo completo

```
1. Agricultor crea producto → disponible en marketplace
2. Comercio ve producto y crea pedido → estado "pendiente"
3. Agricultor acepta pedido → "aceptado" (descuenta stock)
4. Agricultor publica viaje con los pedidos aceptados
5. Transportista ve viaje disponible y se asigna
6. Transportista actualiza tracking: carga_recogida → en_camino → llegó_a_destino → entregado
7. Pedido se marca "entregado" automáticamente

Alternativa: Contratos a futuro
1. Comercio propone contrato con precio fijo y fecha de entrega
2. Agricultor acepta → se genera token de respaldo automáticamente
3. Agricultor puede solicitar financiamiento usando el token como garantía
4. Admin aprueba/rechaza el financiamiento
```

---

## Próximas mejoras

- [ ] Pasarela de pagos integrada
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Módulo de calificaciones y reputación
- [ ] App móvil (React Native)
- [ ] Dashboard con gráficos (Chart.js)

---

## Autores

Isaac Lara C.I: 28.408.847

Edgarimar Malaspina C.I: 32.249.664

Mariangela Pinto C.I: 23.952.199

Sección "2"

Proyecto realizado con fines de aprendizaje y práctica en programación web para la asignatura Traductores e Interpretes dictada por el Prof. Cesar Montilla
