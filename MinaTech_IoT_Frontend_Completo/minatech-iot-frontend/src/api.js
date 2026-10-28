// ===========================================================================
// Cliente HTTP hacia el backend de MinaTech IoT (Spring Boot).
//
// IMPORTANTE: mientras el backend se ejecute localmente (NetBeans / mvn
// spring-boot:run), BASE_URL debe apuntar a "http://localhost:8080". Cuando
// el backend se despliegue en un servidor real, CAMBIAR este valor por la
// URL publica correspondiente (y ajustar tambien el CORS en
// SecurityConfig.java, que hoy acepta cualquier origen "*" para pruebas).
// ===========================================================================
const BASE_URL = "http://localhost:8080";

const STORAGE_KEY = "minatech_sesion";

function obtenerSesion() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Permisos por rol (deben coincidir con las reglas de SecurityConfig.java).
// El backend es quien realmente los hace cumplir; aqui solo se oculta la UI.
const ROLES_PERMITIDOS = {
  atenderAlertas: ["JEFE_OPERACIONES", "ADMINISTRADOR"],
  programarMantenimiento: ["JEFE_OPERACIONES", "ADMINISTRADOR"],
  administrarEquipos: ["ADMINISTRADOR"],
};

function tienePermiso(accion) {
  const sesion = obtenerSesion();
  const rol = sesion && sesion.usuario ? sesion.usuario.rol : null;
  return (ROLES_PERMITIDOS[accion] || []).includes(rol);
}

function guardarSesion(token, usuario) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, usuario }));
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Llama a un endpoint del backend. Agrega automaticamente el header
 * "Authorization: Bearer <token>" cuando hay una sesion guardada.
 * Lanza un Error con el mensaje devuelto por el backend (ErrorResponse)
 * cuando la respuesta no es 2xx.
 */
async function apiFetch(path, { method = "GET", body, autenticado = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const sesion = obtenerSesion();

  if (autenticado && sesion && sesion.token) {
    headers["Authorization"] = `Bearer ${sesion.token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(
      "No se pudo conectar con el backend. Verifica que este corriendo en " + BASE_URL
    );
  }

  if (respuesta.status === 204) {
    return null;
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    if (respuesta.status === 401 && autenticado) {
      cerrarSesion();
    }
    const mensaje = (datos && datos.mensaje) || `Error ${respuesta.status} al llamar ${path}`;
    throw new Error(mensaje);
  }

  return datos;
}

const Api = {
  login: (email, password) =>
    apiFetch("/api/auth/login", { method: "POST", body: { email, password }, autenticado: false }),

  registrar: (datos) =>
    apiFetch("/api/auth/registro", { method: "POST", body: datos, autenticado: false }),

  listarEquipos: () => apiFetch("/api/equipos"),
  crearEquipo: (datos) => apiFetch("/api/equipos", { method: "POST", body: datos }),
  actualizarEquipo: (id, datos) => apiFetch(`/api/equipos/${id}`, { method: "PUT", body: datos }),

  listarSensores: () => apiFetch("/api/sensores"),
  crearSensor: (datos) => apiFetch("/api/sensores", { method: "POST", body: datos }),
  actualizarSensor: (id, datos) => apiFetch(`/api/sensores/${id}`, { method: "PUT", body: datos }),
  historialSensor: (id, limite = 50) => apiFetch(`/api/sensores/${id}/lecturas?limite=${limite}`),

  listarAlertas: (soloPendientes) =>
    apiFetch(soloPendientes ? "/api/alertas?atendida=false" : "/api/alertas"),
  atenderAlerta: (id) => apiFetch(`/api/alertas/${id}/atender`, { method: "PATCH" }),

  listarPlanes: () => apiFetch("/api/planes"),
  crearPlan: (datos) => apiFetch("/api/planes", { method: "POST", body: datos }),

  dashboard: () => apiFetch("/api/dashboard"),

  eventos: (limite = 100) => apiFetch(`/api/eventos?limite=${limite}`),
};

/** Tamano de letra base + el aumento global (--aumento-letra de styles.css); para las graficas ApexCharts, que no leen CSS. */
function tamLetra(base) {
  const extra = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--aumento-letra")) || 0;
  return (base + extra) + "px";
}
