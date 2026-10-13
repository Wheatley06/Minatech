const { useState: useStateApp, useEffect: useEffectApp } = React;

// --------------------------------------------------------------------
// App completa: autenticación (Login / Registro) + layout + navegación +
// las 4 pantallas internas (Dashboard, Registro de Sensor, Alertas de
// Riesgo y Plan de Mantenimiento), todas conectadas al backend real.
// --------------------------------------------------------------------

const PAGINAS_VALIDAS = ["dashboard", "sensores", "mapa", "alertas", "bitacora", "mantenimiento"];
const CLAVE_PAGINA = "minatech_pagina";

/** Lee la última pestaña visitada (si hay una guardada y sigue siendo válida), para que un refresh de la página (F5) no te regrese siempre al Dashboard. */
function paginaInicial() {
  try {
    const guardada = localStorage.getItem(CLAVE_PAGINA);
    return PAGINAS_VALIDAS.includes(guardada) ? guardada : "dashboard";
  } catch (e) {
    return "dashboard";
  }
}

function App() {
  const [sesion, setSesion] = useStateApp(null);
  const [vistaAuth, setVistaAuth] = useStateApp("login"); // "login" | "registro"
  const [pagina, setPaginaState] = useStateApp(paginaInicial);

  useEffectApp(() => {
    try {
      const raw = localStorage.getItem("minatech_sesion");
      if (raw) setSesion(JSON.parse(raw));
    } catch (e) {
      // sesión corrupta o inexistente: se ignora, queda sin iniciar sesión
    }
  }, []);

  function irA(nuevaPagina) {
    setPaginaState(nuevaPagina);
    try {
      localStorage.setItem(CLAVE_PAGINA, nuevaPagina);
    } catch (e) {
      // localStorage no disponible: la navegación sigue funcionando, solo
      // no se recuerda la pestaña entre recargas.
    }
  }

  function manejarLogin(token, usuario) {
    localStorage.setItem("minatech_sesion", JSON.stringify({ token, usuario }));
    setSesion({ token, usuario });
    irA("dashboard");
  }

  function manejarLogout() {
    localStorage.removeItem("minatech_sesion");
    setSesion(null);
    setVistaAuth("login");
  }

  if (!sesion) {
    return vistaAuth === "login" ? (
      <Login onLogin={manejarLogin} irARegistro={() => setVistaAuth("registro")} />
    ) : (
      <Registro irALogin={() => setVistaAuth("login")} />
    );
  }

  return (
    <Layout usuario={sesion.usuario} paginaActual={pagina} irA={irA} cerrarSesion={manejarLogout}>
      {pagina === "dashboard" && <Dashboard />}
      {pagina === "sensores" && <RegistroSensor />}
      {pagina === "mapa" && <MapaEquipos />}
      {pagina === "alertas" && <AlertasRiesgo />}
      {pagina === "bitacora" && <BitacoraEventos />}
      {pagina === "mantenimiento" && <PlanMantenimiento />}
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
