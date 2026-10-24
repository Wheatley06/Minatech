const { useState: useStateAl, useEffect: useEffectAl } = React;

function badgeNivelRiesgo(nivel) {
  const mapa = {
    BAJO: { clase: "badge-bajo", texto: "Bajo" },
    MEDIO: { clase: "badge-medio", texto: "Medio" },
    ALTO: { clase: "badge-alto", texto: "Alto" },
    CRITICO: { clase: "badge-critico", texto: "Crítico" },
  };
  return mapa[nivel] || { clase: "badge-sin-datos", texto: nivel };
}

function formatearFecha(valor) {
  if (!valor) return "—";
  try {
    return new Date(valor).toLocaleString("es-PE");
  } catch (e) {
    return valor;
  }
}

function AlertasRiesgo() {
  const [alertas, setAlertas] = useStateAl([]);
  const [soloPendientes, setSoloPendientes] = useStateAl(true);
  const [cargando, setCargando] = useStateAl(true);
  const [error, setError] = useStateAl("");
  const [atendiendoId, setAtendiendoId] = useStateAl(null);
  // Solo mostramos el estado "Cargando..." la primera vez (o al cambiar de
  // filtro). Los refrescos automáticos de ahí en adelante actualizan la
  // tabla en silencio, sin parpadear cada 1s.
  const primeraCargaHecha = React.useRef(false);

  async function cargar() {
    setError("");
    if (!primeraCargaHecha.current) {
      setCargando(true);
    }
    try {
      const datos = await Api.listarAlertas(soloPendientes);
      setAlertas(datos);
      primeraCargaHecha.current = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectAl(() => {
    primeraCargaHecha.current = false;
    cargar();
    // Refresco automático cada 1s. Como el backend ahora solo genera una
    // alerta por transición Normal -> Alerta (no una por cada mensaje MQTT
    // mientras el sensor se queda en el mismo estado), un intervalo corto
    // no inunda la tabla: simplemente hace que una alerta nueva aparezca
    // casi al instante de ocurrir.
    const intervalo = setInterval(cargar, 1000);
    return () => clearInterval(intervalo);
  }, [soloPendientes]);

  async function marcarAtendida(id) {
    setAtendiendoId(id);
    setError("");
    try {
      await Api.atenderAlerta(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setAtendiendoId(null);
    }
  }

  return (
    <div>
      <div className="contenido-header">
        <h1>Alertas de Riesgo</h1>
        <p>
          Una alerta nueva aparece cuando un sensor pasa de Normal a un estado de riesgo (se actualiza cada
          segundo); mientras siga en ese estado no se repite, hasta que vuelva a Normal y salte de nuevo.
        </p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      <div className="barra-acciones">
        <div className="filtros">
          <button
            className={`filtro-boton ${soloPendientes ? "activo" : ""}`}
            onClick={() => setSoloPendientes(true)}
          >
            Pendientes
          </button>
          <button
            className={`filtro-boton ${!soloPendientes ? "activo" : ""}`}
            onClick={() => setSoloPendientes(false)}
          >
            Todas
          </button>
        </div>
      </div>

      <div className="tarjeta">
        {cargando ? (
          <div className="cargando">Cargando alertas...</div>
        ) : alertas.length === 0 ? (
          <div className="texto-vacio">
            {soloPendientes ? "No hay alertas pendientes. 🎉" : "Todavía no se ha generado ninguna alerta."}
          </div>
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Sensor</th>
                  <th>Equipo</th>
                  <th>Lectura</th>
                  <th>Generada</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => {
                  const badge = badgeNivelRiesgo(a.nivelRiesgo);
                  return (
                    <tr key={a.id}>
                      <td><span className={`badge ${badge.clase}`}>{badge.texto}</span></td>
                      <td>{a.sensorNombre || "—"}</td>
                      <td>{a.equipoNombre || "—"}</td>
                      <td>
                        {a.valorLectura !== null && a.valorLectura !== undefined
                          ? `${a.valorLectura} ${a.unidadMedida || ""}`
                          : "—"}
                      </td>
                      <td>{formatearFecha(a.fechaGeneracion)}</td>
                      <td>
                        {a.atendida ? (
                          <span className="badge badge-normal">Atendida</span>
                        ) : (
                          <span className="badge badge-alerta">Pendiente</span>
                        )}
                      </td>
                      <td>
                        {!a.atendida && tienePermiso("atenderAlertas") && (
                          <button
                            className="boton-mini"
                            disabled={atendiendoId === a.id}
                            onClick={() => marcarAtendida(a.id)}
                          >
                            {atendiendoId === a.id ? "Guardando..." : "Marcar atendida"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

window.AlertasRiesgo = AlertasRiesgo;
