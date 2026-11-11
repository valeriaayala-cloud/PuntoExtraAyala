# Fly Away – Frontend

SPA en React 19 + TypeScript + Vite que consume la API de reserva de vuelos **Fly Away** (backend Spring Boot del laboratorio de la semana 14).

## Requisitos

- Node.js 20.19+ o 22.12+
- Backend corriendo en `http://localhost:8080` (JDK 26)

## Cómo correrlo

1. Levanta el backend (en su carpeta):

   ```bash
   ./mvnw spring-boot:run
   ```

2. En esta carpeta instala dependencias y levanta el frontend:

   ```bash
   npm install
   npm run dev
   ```

3. Abre `http://localhost:5173`.

Para probar sin registrarte: `ana.garcia@utec.edu.pe` / `Password1`.

Otros scripts: `npm run build` (type-check + build de producción) y `npm run lint`.

## Funcionalidades

| Funcionalidad | Ruta | Endpoint |
|---------------|------|----------|
| Registro con validación de campos vacíos y errores del backend; redirige al login | `/register` | `POST /users/register` |
| Login, guarda el JWT en `localStorage` (`token`) y muestra el nombre del usuario | `/login` | `POST /auth/login`, `GET /users/current` |
| Búsqueda por número de vuelo, aerolínea y rango de fechas de salida; mensaje si no hay resultados | `/search` | `GET /flights/search` |
| Botón "Reservar" (solo con sesión), muestra el ID de reserva o el error (vuelo pasado, horario superpuesto) | `/search` | `POST /flights/book` |
| Mis reservas: IDs guardados en `localStorage` por usuario (`bookings:<email>`) | `/bookings` (protegida) | `GET /flights/book/{id}` |
| Detalle de una reserva | `/bookings/:id` (protegida) | `GET /flights/book/{id}` |
| Cerrar sesión y rutas protegidas; ante un `403` se limpia el token y se vuelve al login | — | — |

## Estructura

```
src/
├── api.ts                  # Axios: baseURL, token en cada request, manejo de 403, errorMessage()
├── types.ts                # Tipos de las respuestas del backend
├── auth/
│   ├── authContextValue.ts # Contexto de autenticación
│   ├── AuthProvider.tsx    # Token + usuario actual, login() y logout()
│   └── useAuth.ts          # Hook para leer el contexto
├── components/
│   ├── Navbar.tsx          # Navegación, nombre del usuario y logout
│   ├── ProtectedRoute.tsx  # Redirige a /login si no hay token
│   ├── Alert.tsx           # Mensajes de éxito / error / info
│   └── BookingCard.tsx     # Detalle de una reserva
├── pages/
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── SearchPage.tsx      # Búsqueda + reserva
│   ├── BookingsPage.tsx    # Mis reservas
│   └── BookingDetailPage.tsx
└── utils/
    ├── format.ts           # Fechas legibles y conversión datetime-local → ISO-8601
    └── bookingStorage.ts   # IDs de reservas por usuario en localStorage
```

## Notas

- Las fechas del filtro se convierten con `toISOString()`; enviar el valor crudo del input hace que el backend responda `500`.
- El backend es en memoria: al reiniciarlo se borran usuarios y reservas. "Mis reservas" limpia los IDs que ya no existen.
