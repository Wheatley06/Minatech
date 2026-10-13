const PAGINAS = [
  { id: "dashboard", titulo: "Dashboard general", icono: "Dashboard" },
  { id: "sensores", titulo: "Equipos y Sensores", icono: "Equipo" },
  { id: "mapa", titulo: "Mapa de Equipos", icono: "Mapa" },
  { id: "alertas", titulo: "Alertas de Riesgo", icono: "Alerta" },
  { id: "bitacora", titulo: "Bitácora de Eventos", icono: "Reloj" },
  { id: "mantenimiento", titulo: "Plan de Mantenimiento", icono: "Llave2" },
];

function Layout({ usuario, paginaActual, irA, cerrarSesion, children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-badge">
            <Icons.Logo size={18} />
          </div>
          <div className="sidebar-logo-texto">MinaTech IoT</div>
        </div>

        <nav className="sidebar-nav">
          {PAGINAS.map((pagina) => {
            const Icono = Icons[pagina.icono];
            return (
              <button
                key={pagina.id}
                className={pagina.id === paginaActual ? "activo" : ""}
                onClick={() => irA(pagina.id)}
              >
                <Icono size={18} />
                {pagina.titulo}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-usuario">
            <strong>{usuario.nombres} {usuario.apellidos}</strong>
            <span>{formatearRol(usuario.rol)}</span>
          </div>
          <button className="boton-salir" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="contenido">{children}</main>
    </div>
  );
}

function formatearRol(rol) {
  const mapa = {
    MINERO_OPERADOR: "Minero / Operador",
    JEFE_OPERACIONES: "Jefe de Operaciones",
    ADMINISTRADOR: "Administrador",
  };
  return mapa[rol] || rol;
}

window.Layout = Layout;
