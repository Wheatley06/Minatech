const { useState: useStateApp, useEffect: useEffectApp } = React;

// --------------------------------------------------------------------
// App completa: autenticación (Login / Registro) + layout + navegación +
// las 4 pantallas internas (Dashboard, Registro de Sensor, Alertas de
// Riesgo y Plan de Mantenimiento), todas conectadas al backend real.
// --------------------------------------------------------------------

function App() {
  const [sesion, setSesion] = useStateApp(null);
  const [vistaAuth, setVistaAuth] = useStateApp("login"); // "login" | "registro"
  const [pagina, setPagina] = useStateApp("dashboard");

  useEffectApp(() => {
    try {
      const raw = localStorage.getItem("minatech_sesion");
      if (raw) setSesion(JSON.parse(raw));
    } catch (e) {
      // sesión corrupta o inexistente: se ignora, queda sin iniciar sesión
    }
  }, []);

  function manejarLogin(token, usuario) {
    localStorage.setItem("minatech_sesion", JSON.stringify({ token, usuario }));
    setSesion({ token, usuario });
    setPagina("dashboard");
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
    <Layout usuario={sesion.usuario} paginaActual={pagina} irA={setPagina} cerrarSesion={manejarLogout}>
      {pagina === "dashboard" && <Dashboard />}
      {pagina === "sensores" && <RegistroSensor />}
      {pagina === "alertas" && <AlertasRiesgo />}
      {pagina === "mantenimiento" && <PlanMantenimiento />}
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
