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

  async function cargar() {
    setError("");
    setCargando(true);
    try {
      const datos = await Api.listarAlertas(soloPendientes);
      setAlertas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectAl(() => {
    cargar();
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
        <p>Alertas generadas automáticamente cuando una lectura MQTT llega con estado distinto de NORMAL.</p>
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
                        {!a.atendida && (
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
