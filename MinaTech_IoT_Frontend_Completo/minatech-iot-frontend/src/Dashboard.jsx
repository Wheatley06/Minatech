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
  if (!estado) return { clase: "badge-sin-datos", texto: "Sin datos", sev: "" };
  const mapa = {
    NORMAL: { clase: "badge-normal", texto: "Normal", sev: "sev-normal" },
    ALERTA: { clase: "badge-alerta", texto: "Alerta", sev: "sev-alerta" },
    ADVERTENCIA: { clase: "badge-advertencia", texto: "Advertencia", sev: "sev-advertencia" },
    CRITICO: { clase: "badge-critico", texto: "Crítico", sev: "sev-critico" },
  };
  return mapa[estado.toUpperCase()] || { clase: "badge-alerta", texto: estado, sev: "sev-alerta" };
}

// Una lectura se considera "fresca" (el equipo sigue transmitiendo) si llegó
// dentro de los últimos 20s — un poco más que el intervalo de refresco del
// propio dashboard (15s), para no apagar el punto de vida entre un refresco
// y otro aunque el sensor siga reportando con normalidad.
const MS_LECTURA_FRESCA = 20000;

function esLecturaFresca(fechaHora) {
  if (!fechaHora) return false;
  const edadMs = Date.now() - new Date(fechaHora).getTime();
  return edadMs >= 0 && edadMs <= MS_LECTURA_FRESCA;
}

/**
 * Agrupa las lecturas del dashboard por equipo y cuenta cuántos de sus
 * sensores siguen "frescos" (transmitiendo), para un resumen rápido de
 * conectividad por equipo — típico de un panel IoT: no solo importa el
 * valor de cada sensor, sino si el equipo entero sigue reportando.
 */
function resumenConectividadPorEquipo(lecturas) {
  const porEquipo = new Map();
  for (const l of lecturas) {
    const clave = l.equipoNombre || "Sin equipo";
    if (!porEquipo.has(clave)) {
      porEquipo.set(clave, { nombre: clave, total: 0, frescos: 0 });
    }
    const entrada = porEquipo.get(clave);
    entrada.total += 1;
    if (esLecturaFresca(l.fechaHora)) {
      entrada.frescos += 1;
    }
  }
  return Array.from(porEquipo.values());
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
  // "tarjetas" (vista por defecto) | "vibracion-gas" | "presion-temp"
  const [vista, setVista] = useStateDash("tarjetas");
  // IDs de sensor cuyo valor cambió en el último refresco, para el destello
  // breve en su tarjeta. Se auto-limpia con un timeout (ver más abajo).
  const [destellos, setDestellos] = useStateDash({});
  const valoresPrevios = React.useRef({});

  async function cargar() {
    setError("");
    try {
      const datos = await Api.dashboard();

      const cambiados = [];
      for (const l of datos) {
        const anterior = valoresPrevios.current[l.sensorId];
        if (anterior !== undefined && anterior !== l.valor) {
          cambiados.push(l.sensorId);
        }
        valoresPrevios.current[l.sensorId] = l.valor;
      }
      if (cambiados.length > 0) {
        setDestellos((prev) => {
          const siguiente = { ...prev };
          cambiados.forEach((id) => (siguiente[id] = true));
          return siguiente;
        });
        setTimeout(() => {
          setDestellos((prev) => {
            const siguiente = { ...prev };
            cambiados.forEach((id) => delete siguiente[id]);
            return siguiente;
          });
        }, 900);
      }

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
    const intervalo = setInterval(cargar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  if (vista === "vibracion-gas") {
    return (
      <div>
        <BarraBotonesVista vista={vista} setVista={setVista} />
        <GraficasVibracionGas />
      </div>
    );
  }

  if (vista === "presion-temp") {
    return (
      <div>
        <BarraBotonesVista vista={vista} setVista={setVista} />
        <GraficasPresionTemperatura />
      </div>
    );
  }

  return (
    <div>
      <div
        className="contenido-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <h1>Dashboard general</h1>
          <p>Última lectura conocida de cada sensor registrado (se actualiza cada 15 segundos).</p>
        </div>
        <BotonesGraficas vista={vista} setVista={setVista} />
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
        <div>
          <div className="resumen-conectividad">
            {resumenConectividadPorEquipo(lecturas).map((eq) => {
              const estado = eq.frescos === eq.total ? "todo-bien" : eq.frescos === 0 ? "sin-senal" : "parcial";
              return (
                <div key={eq.nombre} className={`chip-equipo ${estado}`}>
                  <span className="chip-equipo-punto" />
                  <span className="chip-equipo-nombre">{eq.nombre}</span>
                  <span className="chip-equipo-conteo">{eq.frescos}/{eq.total} en línea</span>
                </div>
              );
            })}
          </div>

          <div className="grilla-dashboard">
          {lecturas.map((l) => {
            const Icono = Icons[ICONO_POR_TIPO[l.tipoSensor]] || Icons.Sensor;
            const badge = badgeEstadoSimulacion(l.estadoSimulacion);
            const fresca = esLecturaFresca(l.fechaHora);
            const claseTarjeta = ["tarjeta-variable", badge.sev, destellos[l.sensorId] ? "destello" : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <div className={claseTarjeta} key={l.sensorId}>
                <div className="tarjeta-variable-top">
                  <div>
                    <div className="tarjeta-variable-nombre">{l.sensorNombre}</div>
                    <div style={{ fontSize: "calc(12px + var(--aumento-letra))", color: "var(--panel-texto-secundario)" }}>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className={`pulso-dot ${fresca ? "vivo" : ""}`} title={fresca ? "Transmitiendo" : "Sin señal reciente"} />
                    <span className={`badge ${badge.clase}`}>{badge.texto}</span>
                  </span>
                  <div>{formatearFechaHora(l.fechaHora)}</div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Los 2 botones de gráficas, en la misma línea que el título "Dashboard general". */
function BotonesGraficas({ vista, setVista }) {
  return (
    <div className="filtros">
      <button className="filtro-boton" onClick={() => setVista("vibracion-gas")}>
        📈 Vibración y Gases
      </button>
      <button className="filtro-boton" onClick={() => setVista("presion-temp")}>
        🎛️ Presión y Temperatura
      </button>
    </div>
  );
}

/**
 * Barra de arriba cuando estás viendo una de las dos pantallas de
 * gráficas: a la izquierda, volver a las tarjetas; a la derecha, saltar
 * directo a la otra pantalla de gráficas sin pasar por el Dashboard.
 */
function BarraBotonesVista({ vista, setVista }) {
  const esVibracionGas = vista === "vibracion-gas";
  const otraVista = esVibracionGas ? "presion-temp" : "vibracion-gas";
  const etiquetaOtraVista = esVibracionGas ? "🎛️ Ver Presión y Temperatura" : "📈 Ver Vibración y Gases";

  return (
    <div className="barra-acciones">
      <button className="boton-secundario" onClick={() => setVista("tarjetas")}>
        ← Volver al Dashboard
      </button>
      <button className="filtro-boton" onClick={() => setVista(otraVista)}>
        {etiquetaOtraVista} →
      </button>
    </div>
  );
}

window.Dashboard = Dashboard;
