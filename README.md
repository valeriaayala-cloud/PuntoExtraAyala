# FlyAway – Frontend

Aplicación web en React 19 + TypeScript + Vite para la API de reserva de vuelos **Fly Away** (Laboratorio Semana 14 – CS2031 UTEC).

Autora: **Valeria Ayala**

## Requisitos

- Node.js 20.19+ o 22.12+
- JDK 26 (para el backend)
- Backend del curso corriendo en `http://localhost:8080`

## Cómo correrlo

1. Levantar el backend (en su carpeta):

   ```bash
   mvnw spring-boot:run
   ```

2. En esta carpeta, instalar dependencias y levantar el frontend:

   ```bash
   npm install
   npm run dev
   ```

3. Abrir `http://localhost:5173`.

Usuario de prueba: `ana.garcia@utec.edu.pe` / `Password1`

## Funcionalidades

- **Registro** con validación de campos vacíos y mensajes de error del backend.
- **Login** con JWT guardado en `localStorage`, opción para mostrar la contraseña y nombre del usuario en la barra.
- **Búsqueda de vuelos** por número, aerolínea y rango de fechas de salida.
- **Reserva** con ventana de confirmación antes de reservar; muestra el ID de la reserva o el error (vuelo pasado, horario superpuesto).
- **Mis viajes**: lista de reservas del usuario y detalle de cada una.
- **Cerrar sesión** y rutas protegidas.

## Diseño

Paleta propia en azul marino y naranja, barra de navegación oscura y textos adaptados.