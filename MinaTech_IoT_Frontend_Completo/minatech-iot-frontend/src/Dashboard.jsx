const { useState: useStateDash, useEffect: useEffectDash } = React;

const ICONO_POR_TIPO = {
  VIBRACION: "Vibracion",
  GAS: "Gas",
  PRESION: "Presion",
  TEMPERATURA: "Temperatura",
};

const COLOR_POR_TIPO = {
  VIBRACION: "#6366f1",
  GAS: "#f59e0b",
  PRESION: "#0ea5e9",
  TEMPERATURA: "#ef4444",
};

function badgeEstadoSimulacion(estado) {
  if (!estado) return { clase: "badge-sin-datos", texto: "Sin datos" };
  const mapa = {
    NORMAL: { clase: "badge-normal", texto: "Normal" },
    ALERTA: { clase: "badge-alerta", texto: "Alerta" },
    ADVERTENCIA: { clase: "badge-advertencia", texto: "Advertencia" },
    CRITICO: { clase: "badge-critico", texto: "Crítico" },
  };
  return mapa[estado.toUpperCase()] || { clase: "badge-alerta", texto: estado };
}

function formatearFechaHora(valor) {
  if (!valor) return "Sin lecturas aún";
  try {
    return new Date(valor).toLocaleString("es-PE");
  } catch (e) {
    return valor;
  }
}

function Dashboard() {
  const [lecturas, setLecturas] = useStateDash([]);
  const [cargando, setCargando] = useStateDash(true);
  const [error, setError] = useStateDash("");

  async function cargar() {
    setError("");
    try {
      const datos = await Api.dashboard();
      setLecturas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectDash(() => {
    cargar();
    // Refresco automático cada 15s para reflejar la telemetría MQTT entrante.
    const intervalo = setInterval(cargar, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div>
      <div className="contenido-header">
        <h1>Dashboard general</h1>
        <p>Última lectura conocida de cada sensor registrado (se actualiza cada 15 segundos).</p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="cargando">Cargando lecturas...</div>
      ) : lecturas.length === 0 ? (
        <div className="tarjeta texto-vacio">
          Aún no hay sensores registrados. Ve a "Registro de Sensor" para dar de alta el primero,
          o espera a que llegue telemetría MQTT (los sensores se crean automáticamente).
        </div>
      ) : (
        <div className="grilla-dashboard">
          {lecturas.map((l) => {
            const Icono = Icons[ICONO_POR_TIPO[l.tipoSensor]] || Icons.Sensor;
            const badge = badgeEstadoSimulacion(l.estadoSimulacion);
            return (
              <div className="tarjeta-variable" key={l.sensorId}>
                <div className="tarjeta-variable-top">
                  <div>
                    <div className="tarjeta-variable-nombre">{l.sensorNombre}</div>
                    <div style={{ fontSize: 12, color: "var(--texto-secundario)" }}>
                      {l.equipoNombre || "Sin equipo"}
                    </div>
                  </div>
                  <div
                    className="tarjeta-variable-icono"
                    style={{ background: COLOR_POR_TIPO[l.tipoSensor] || "#64748b" }}
                  >
                    <Icono size={18} />
                  </div>
                </div>

                <div>
                  <span className="tarjeta-variable-valor">
                    {l.valor !== null && l.valor !== undefined ? l.valor : "--"}
                  </span>
                  {l.unidadMedida && <span className="tarjeta-variable-unidad">{l.unidadMedida}</span>}
                </div>

                <div className="tarjeta-variable-footer">
                  <span className={`badge ${badge.clase}`}>{badge.texto}</span>
                  <div style={{ marginTop: 8 }}>{formatearFechaHora(l.fechaHora)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
