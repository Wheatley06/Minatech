# MinaTech IoT - Frontend (completo)

React "sin build" (React + Babel vía CDN, sin npm install) conectado al
backend Spring Boot. Incluye las 6 pantallas: Login, Registro, Dashboard
general, Registro de Sensor, Alertas de Riesgo y Plan de Mantenimiento.

## Como probarlo
1. Levanta el backend (NetBeans o `mvn spring-boot:run`) en `http://localhost:8080`.
   Usa el zip `MinaTech_IoT_Backend_Entregable.zip`, que ya incluye los
   endpoints de equipos/sensores/alertas/planes/dashboard.
2. Abre `index.html` directamente en el navegador (doble clic), o sírvelo
   con cualquier servidor estático.
3. Regístrate, inicia sesión y navega por el sidebar.

Si el backend corre en otra URL (no `http://localhost:8080`), cambia la
constante `BASE_URL` en `src/api.js`.

## Estructura
- `index.html` – carga React/Babel desde CDN y todos los componentes, en orden.
- `src/api.js` – cliente HTTP único hacia el backend (login, registro,
  equipos, sensores, alertas, planes, dashboard). Agrega automáticamente
  el header `Authorization: Bearer <token>` guardado tras el login.
- `src/icons.js` – set de iconos SVG propios (sin dependencias externas).
- `src/styles.css` – estilos de toda la plataforma.
- `src/Login.jsx` / `src/Registro.jsx` – autenticación.
- `src/Layout.jsx` – sidebar + navegación entre pantallas.
- `src/Dashboard.jsx` – última lectura de cada sensor (Vibración 1/2,
  Gas 1/2, Presión 1/2, Temperatura 1/2, según los sensores que existan);
  se refresca sola cada 15s.
- `src/RegistroSensor.jsx` – alta de sensores (elige equipo + variable
  MQTT) y tabla con los ya registrados.
- `src/AlertasRiesgo.jsx` – lista de alertas con filtro Pendientes/Todas
  y botón para marcarlas como atendidas.
- `src/PlanMantenimiento.jsx` – alta de planes de mantenimiento
  (preventivo/correctivo) y tabla con los programados.
- `src/App.jsx` – arma todo y maneja la sesión (guardada en
  `localStorage`) y la navegación entre pantallas.

## Notas
- No se usó `npm install` porque el entorno donde se generó este
  proyecto no tenía acceso a los registros de paquetes. React, ReactDOM
  y Babel se cargan desde CDN (unpkg) y el navegador transpila el JSX al
  vuelo; para el usuario final no hay ninguna diferencia. Si más
  adelante se quiere migrar a Vite/Create-React-App con `npm install`,
  los componentes de `src/` se pueden reutilizar casi tal cual.
- El Dashboard lista un sensor por fila de `/api/dashboard` (una fila
  por sensor con su última lectura); si un equipo aún no mandó
  telemetría MQTT, el sensor aparece con "Sin datos" hasta que llegue.
- Equipos mecánicos no tienen pantalla de alta manual todavía: se crean
  automáticamente al llegar la primera telemetría MQTT de cada uno (ver
  `TelemetriaService` en el backend). Los selectores de equipo en
  "Registro de Sensor" y "Plan de Mantenimiento" solo muestran los que
  ya existan.
