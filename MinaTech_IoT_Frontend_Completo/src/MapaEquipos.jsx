const { useState: useStateMapa, useEffect: useEffectMapa } = React;

// Mismo umbral de "lectura fresca" que usa el Dashboard (20s), pero con
// nombre propio: cada archivo .jsx se carga como un <script> clásico
// separado y comparte el ámbito global del navegador, así que una
// constante de nivel superior con el mismo nombre en dos archivos
// chocaría ("ya declarada").
const UMBRAL_FRESCO_MS_MAPA = 20000;

function esFrescaParaMapa(fechaHora) {
  if (!fechaHora) return false;
  const edadMs = Date.now() - new Date(fechaHora).getTime();
  return edadMs >= 0 && edadMs <= UMBRAL_FRESCO_MS_MAPA;
}

/** Cuenta, por equipo, cuántos de sus sensores siguen transmitiendo, a partir de las lecturas del Dashboard. */
function calcularConectividad(lecturas) {
  const porEquipo = new Map();
  for (const l of lecturas) {
    if (l.equipoId == null) continue;
    if (!porEquipo.has(l.equipoId)) {
      porEquipo.set(l.equipoId, { total: 0, frescos: 0 });
    }
    const entrada = porEquipo.get(l.equipoId);
    entrada.total += 1;
    if (esFrescaParaMapa(l.fechaHora)) entrada.frescos += 1;
  }
  return porEquipo;
}

function estadoDeConectividad(conteo) {
  if (!conteo || conteo.total === 0) return "sin-senal";
  if (conteo.frescos === conteo.total) return "todo-bien";
  if (conteo.frescos === 0) return "sin-senal";
  return "parcial";
}

/**
 * Plano esquemático (no un mapa geográfico real) con los equipos
 * mecánicos posicionados según las coordenadas 0-100 que se configuran en
 * "Equipos y Sensores", coloreados según cuántos de sus sensores siguen
 * transmitiendo. Patrón típico de dashboards IoT industriales: ver de un
 * vistazo dónde están los problemas de conectividad, no solo leerlos en
 * una tabla.
 */
function MapaEquipos() {
  const [equipos, setEquipos] = useStateMapa([]);
  const [lecturas, setLecturas] = useStateMapa([]);
  const [cargando, setCargando] = useStateMapa(true);
  const [error, setError] = useStateMapa("");

  async function cargar() {
    try {
      const [listaEquipos, listaLecturas] = await Promise.all([Api.listarEquipos(), Api.dashboard()]);
      setEquipos(listaEquipos);
      setLecturas(listaLecturas);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectMapa(() => {
    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const conectividad = calcularConectividad(lecturas);
  const posicionados = equipos.filter((eq) => eq.posX != null && eq.posY != null);
  const sinPosicion = equipos.filter((eq) => eq.posX == null || eq.posY == null);

  return (
    <div>
      <div className="contenido-header">
        <h1>Mapa de Equipos</h1>
        <p>
          Ubicación esquemática de los equipos mecánicos, coloreada según cuántos de sus sensores siguen
          transmitiendo (se actualiza cada 10 segundos).
        </p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="cargando">Cargando equipos...</div>
      ) : equipos.length === 0 ? (
        <div className="tarjeta texto-vacio">
          Aún no hay equipos registrados. Ve a "Equipos y Sensores" para dar de alta uno, o espera a que llegue
          telemetría MQTT.
        </div>
      ) : (
        <div className="tarjeta">
          <div className="plano-equipos">
            {posicionados.map((eq) => {
              const estado = estadoDeConectividad(conectividad.get(eq.id));
              return (
                <div
                  key={eq.id}
                  className={`nodo-equipo ${estado}`}
                  style={{ left: `${eq.posX}%`, top: `${eq.posY}%` }}
                  title={`${eq.nombre} — ${eq.tipoEquipo || "sin tipo"}`}
                >
                  <span className="nodo-equipo-punto" />
                  <span className="nodo-equipo-etiqueta">{eq.nombre}</span>
                </div>
              );
            })}
          </div>

          <div className="plano-leyenda">
            <span><span className="punto" style={{ background: "#22c55e" }} /> Todos los sensores en línea</span>
            <span><span className="punto" style={{ background: "#f59e0b" }} /> Algunos sensores sin señal</span>
            <span><span className="punto" style={{ background: "#ef4444" }} /> Sin señal / sin sensores</span>
          </div>

          {sinPosicion.length > 0 && (
            <>
              <div className="barra-acciones" style={{ marginTop: 20 }}>
                <strong>Equipos sin posición asignada</strong>
              </div>
              <div className="grilla-sin-posicion">
                {sinPosicion.map((eq) => {
                  const estado = estadoDeConectividad(conectividad.get(eq.id));
                  return (
                    <div key={eq.id} className={`chip-equipo ${estado}`}>
                      <span className="chip-equipo-punto" />
                      <span className="chip-equipo-nombre">{eq.nombre}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: 10 }}>
                Asígnales una posición X/Y en "Equipos y Sensores" → "Equipos mecánicos" para ubicarlos en el plano.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

window.MapaEquipos = MapaEquipos;
