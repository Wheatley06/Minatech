const { useState: useStateSen, useEffect: useEffectSen } = React;

const VARIABLES_CONOCIDAS = [
  "vibracion_1", "vibracion_2",
  "gas_1", "gas_2",
  "presion_1", "presion_2",
  "temperatura_1", "temperatura_2",
];

const ESTADOS_EQUIPO = [
  { valor: "OPERATIVO", texto: "Operativo" },
  { valor: "EN_MANTENIMIENTO", texto: "En mantenimiento" },
  { valor: "FUERA_DE_SERVICIO", texto: "Fuera de servicio" },
];

const FORM_EQUIPO_VACIO = {
  id: "",
  nombre: "",
  tipoEquipo: "",
  marca: "",
  modelo: "",
  estado: "OPERATIVO",
  posX: "",
  posY: "",
};

const FORM_SENSOR_VACIO = {
  nombre: "",
  claveVariable: "vibracion_1",
  tipoSensor: "VIBRACION",
  subtipo: "",
  ubicacion: "",
  umbralCritico: "",
  equipoMecanicoId: "",
};

/**
 * Panel de administración de "Equipos y Sensores". Antes era solo un
 * formulario de alta de sensores, pero en la práctica los equipos y
 * sensores ya se crean solos por telemetría MQTT (ver TelemetriaService),
 * así que esta pantalla pasó a cubrir lo que el flujo automático no
 * resuelve: corregir/completar sus datos (sobre todo el umbral crítico,
 * que alimenta los gauges de Presión) y dar de alta equipos o sensores
 * manualmente antes de que llegue telemetría real.
 */
function RegistroSensor() {
  const [seccion, setSeccion] = useStateSen("sensores"); // "sensores" | "equipos"

  const [equipos, setEquipos] = useStateSen([]);
  const [sensores, setSensores] = useStateSen([]);
  const [cargando, setCargando] = useStateSen(true);
  const [error, setError] = useStateSen("");
  const [exito, setExito] = useStateSen("");
  const [guardando, setGuardando] = useStateSen(false);

  const [formSensor, setFormSensor] = useStateSen(FORM_SENSOR_VACIO);
  const [sensorEditandoId, setSensorEditandoId] = useStateSen(null);

  const [formEquipo, setFormEquipo] = useStateSen(FORM_EQUIPO_VACIO);
  const [equipoEditandoId, setEquipoEditandoId] = useStateSen(null);

  async function cargarTodo() {
    setError("");
    try {
      const [listaEquipos, listaSensores] = await Promise.all([Api.listarEquipos(), Api.listarSensores()]);
      setEquipos(listaEquipos);
      setSensores(listaSensores);
      setFormSensor((prev) =>
        !sensorEditandoId && !prev.equipoMecanicoId && listaEquipos.length > 0
          ? { ...prev, equipoMecanicoId: String(listaEquipos[0].id) }
          : prev
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectSen(() => {
    cargarTodo();
  }, []);

  function limpiarMensajes() {
    setError("");
    setExito("");
  }

  // ---------------------------------------------------------------- Sensores

  function actualizarCampoSensor(campo, valor) {
    setFormSensor((prev) => ({ ...prev, [campo]: valor }));
  }

  function alCambiarClaveVariable(valor) {
    const tipoInferido = valor.split("_")[0]?.toUpperCase();
    const tiposValidos = ["VIBRACION", "GAS", "PRESION", "TEMPERATURA"];
    setFormSensor((prev) => ({
      ...prev,
      claveVariable: valor,
      tipoSensor: tiposValidos.includes(tipoInferido) ? tipoInferido : prev.tipoSensor,
    }));
  }

  function editarSensor(sensor) {
    limpiarMensajes();
    setSensorEditandoId(sensor.id);
    setFormSensor({
      nombre: sensor.nombre || "",
      claveVariable: sensor.claveVariable,
      tipoSensor: sensor.tipoSensor,
      subtipo: sensor.subtipo || "",
      ubicacion: sensor.ubicacion || "",
      umbralCritico: sensor.umbralCritico ?? "",
      equipoMecanicoId: String(sensor.equipoId || ""),
    });
  }

  function cancelarEdicionSensor() {
    setSensorEditandoId(null);
    setFormSensor((prev) => ({
      ...FORM_SENSOR_VACIO,
      equipoMecanicoId: equipos.length > 0 ? String(equipos[0].id) : "",
    }));
  }

  async function enviarSensor(e) {
    e.preventDefault();
    limpiarMensajes();
    if (!formSensor.equipoMecanicoId) {
      setError("Selecciona un equipo mecánico.");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre: formSensor.nombre,
        claveVariable: formSensor.claveVariable,
        tipoSensor: formSensor.tipoSensor,
        subtipo: formSensor.subtipo || null,
        ubicacion: formSensor.ubicacion || null,
        umbralCritico: formSensor.umbralCritico ? Number(formSensor.umbralCritico) : null,
        equipoMecanicoId: Number(formSensor.equipoMecanicoId),
      };
      if (sensorEditandoId) {
        await Api.actualizarSensor(sensorEditandoId, payload);
        setExito("Sensor actualizado correctamente.");
      } else {
        await Api.crearSensor(payload);
        setExito("Sensor registrado correctamente.");
      }
      cancelarEdicionSensor();
      cargarTodo();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // ----------------------------------------------------------------- Equipos

  function actualizarCampoEquipo(campo, valor) {
    setFormEquipo((prev) => ({ ...prev, [campo]: valor }));
  }

  function editarEquipo(equipo) {
    limpiarMensajes();
    setEquipoEditandoId(equipo.id);
    setFormEquipo({
      id: String(equipo.id),
      nombre: equipo.nombre || "",
      tipoEquipo: equipo.tipoEquipo || "",
      marca: equipo.marca || "",
      modelo: equipo.modelo || "",
      estado: equipo.estado || "OPERATIVO",
      posX: equipo.posX ?? "",
      posY: equipo.posY ?? "",
    });
  }

  function cancelarEdicionEquipo() {
    setEquipoEditandoId(null);
    setFormEquipo(FORM_EQUIPO_VACIO);
  }

  async function enviarEquipo(e) {
    e.preventDefault();
    limpiarMensajes();
    if (!equipoEditandoId && !formEquipo.id) {
      setError("Indica el id del equipo (debe coincidir con el \"equipo_id\" que usará por MQTT).");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre: formEquipo.nombre,
        tipoEquipo: formEquipo.tipoEquipo || null,
        marca: formEquipo.marca || null,
        modelo: formEquipo.modelo || null,
        estado: formEquipo.estado,
        posX: formEquipo.posX !== "" ? Number(formEquipo.posX) : null,
        posY: formEquipo.posY !== "" ? Number(formEquipo.posY) : null,
      };
      if (equipoEditandoId) {
        await Api.actualizarEquipo(equipoEditandoId, payload);
        setExito("Equipo actualizado correctamente.");
      } else {
        await Api.crearEquipo({ ...payload, id: Number(formEquipo.id) });
        setExito("Equipo registrado correctamente.");
      }
      cancelarEdicionEquipo();
      cargarTodo();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function formatearEstadoEquipo(estado) {
    return ESTADOS_EQUIPO.find((e) => e.valor === estado)?.texto || estado || "—";
  }

  return (
    <div>
      <div className="contenido-header">
        <h1>Equipos y Sensores</h1>
        <p>
          Equipos y sensores se crean solos al llegar su primera telemetría MQTT; aquí se corrigen o completan sus
          datos (umbral crítico, ubicación, etc.) y se pueden dar de alta manualmente.
        </p>
      </div>

      <div className="barra-acciones">
        <div className="filtros">
          <button
            className={`filtro-boton ${seccion === "sensores" ? "activo" : ""}`}
            onClick={() => setSeccion("sensores")}
          >
            Sensores
          </button>
          <button
            className={`filtro-boton ${seccion === "equipos" ? "activo" : ""}`}
            onClick={() => setSeccion("equipos")}
          >
            Equipos mecánicos
          </button>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}
      {exito && <div className="mensaje-exito">{exito}</div>}

      {seccion === "sensores" ? (
        <div className="dos-columnas-formulario">
          <div className="tarjeta">
            {equipos.length === 0 && !cargando ? (
              <div className="texto-vacio">
                Todavía no hay equipos mecánicos. Da de alta uno en la pestaña "Equipos mecánicos", o espera a que
                llegue telemetría MQTT (se crean automáticamente).
              </div>
            ) : (
              <form onSubmit={enviarSensor}>
                <strong>{sensorEditandoId ? "Editar sensor" : "Registrar sensor nuevo"}</strong>

                <div className="campo" style={{ marginTop: 16 }}>
                  <label>Nombre del sensor</label>
                  <input value={formSensor.nombre} onChange={(e) => actualizarCampoSensor("nombre", e.target.value)} required />
                </div>

                <div className="campo">
                  <label>Variable MQTT</label>
                  <select
                    value={formSensor.claveVariable}
                    onChange={(e) => alCambiarClaveVariable(e.target.value)}
                    disabled={!!sensorEditandoId}
                  >
                    {VARIABLES_CONOCIDAS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {sensorEditandoId && (
                    <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: 4 }}>
                      La variable MQTT no se puede cambiar: es la llave que enlaza la telemetría entrante con este sensor.
                    </div>
                  )}
                </div>

                <div className="campo">
                  <label>Tipo de sensor</label>
                  <select
                    value={formSensor.tipoSensor}
                    onChange={(e) => actualizarCampoSensor("tipoSensor", e.target.value)}
                    disabled={!!sensorEditandoId}
                  >
                    <option value="VIBRACION">Vibración</option>
                    <option value="GAS">Gas</option>
                    <option value="PRESION">Presión</option>
                    <option value="TEMPERATURA">Temperatura</option>
                  </select>
                </div>

                <div className="fila-dos-columnas">
                  <div className="campo">
                    <label>Subtipo (opcional)</label>
                    <input
                      value={formSensor.subtipo}
                      onChange={(e) => actualizarCampoSensor("subtipo", e.target.value)}
                      placeholder="ej. CH4, motor"
                    />
                  </div>
                  <div className="campo">
                    <label>Umbral crítico (opcional)</label>
                    <input
                      type="number"
                      step="any"
                      value={formSensor.umbralCritico}
                      onChange={(e) => actualizarCampoSensor("umbralCritico", e.target.value)}
                    />
                  </div>
                </div>

                <div className="campo">
                  <label>Ubicación (opcional)</label>
                  <input value={formSensor.ubicacion} onChange={(e) => actualizarCampoSensor("ubicacion", e.target.value)} />
                </div>

                <div className="campo">
                  <label>Equipo mecánico</label>
                  <select
                    value={formSensor.equipoMecanicoId}
                    onChange={(e) => actualizarCampoSensor("equipoMecanicoId", e.target.value)}
                    disabled={!!sensorEditandoId}
                    required
                  >
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nombre} (id {eq.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="boton-primario" type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : sensorEditandoId ? "Guardar cambios" : "Registrar sensor"}
                  </button>
                  {sensorEditandoId && (
                    <button type="button" className="boton-secundario" onClick={cancelarEdicionSensor}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="tarjeta">
            <div className="barra-acciones">
              <strong>Sensores registrados</strong>
            </div>
            {cargando ? (
              <div className="cargando">Cargando...</div>
            ) : sensores.length === 0 ? (
              <div className="texto-vacio">Aún no hay sensores registrados.</div>
            ) : (
              <div className="tabla-wrap">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Variable</th>
                      <th>Equipo</th>
                      <th>Umbral crítico</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensores.map((s) => (
                      <tr key={s.id}>
                        <td>{s.nombre}</td>
                        <td>{s.claveVariable}</td>
                        <td>{s.equipoNombre || "—"}</td>
                        <td>{s.umbralCritico ?? "—"}</td>
                        <td>{s.estado}</td>
                        <td>
                          <button className="boton-mini" onClick={() => editarSensor(s)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="dos-columnas-formulario">
          <div className="tarjeta">
            <form onSubmit={enviarEquipo}>
              <strong>{equipoEditandoId ? "Editar equipo" : "Registrar equipo nuevo"}</strong>

              <div className="campo" style={{ marginTop: 16 }}>
                <label>Id del equipo</label>
                <input
                  type="number"
                  value={formEquipo.id}
                  onChange={(e) => actualizarCampoEquipo("id", e.target.value)}
                  disabled={!!equipoEditandoId}
                  required={!equipoEditandoId}
                  placeholder="ej. 101"
                />
                {!equipoEditandoId && (
                  <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: 4 }}>
                    Debe coincidir con el "equipo_id" que ese equipo use en su telemetría MQTT.
                  </div>
                )}
              </div>

              <div className="campo">
                <label>Nombre</label>
                <input value={formEquipo.nombre} onChange={(e) => actualizarCampoEquipo("nombre", e.target.value)} required />
              </div>

              <div className="fila-dos-columnas">
                <div className="campo">
                  <label>Tipo de equipo (opcional)</label>
                  <input
                    value={formEquipo.tipoEquipo}
                    onChange={(e) => actualizarCampoEquipo("tipoEquipo", e.target.value)}
                    placeholder="ej. Perforadora"
                  />
                </div>
                <div className="campo">
                  <label>Estado</label>
                  <select value={formEquipo.estado} onChange={(e) => actualizarCampoEquipo("estado", e.target.value)}>
                    {ESTADOS_EQUIPO.map((e) => (
                      <option key={e.valor} value={e.valor}>{e.texto}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fila-dos-columnas">
                <div className="campo">
                  <label>Marca (opcional)</label>
                  <input value={formEquipo.marca} onChange={(e) => actualizarCampoEquipo("marca", e.target.value)} />
                </div>
                <div className="campo">
                  <label>Modelo (opcional)</label>
                  <input value={formEquipo.modelo} onChange={(e) => actualizarCampoEquipo("modelo", e.target.value)} />
                </div>
              </div>

              <div className="fila-dos-columnas">
                <div className="campo">
                  <label>Posición X en el mapa (0-100, opcional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formEquipo.posX}
                    onChange={(e) => actualizarCampoEquipo("posX", e.target.value)}
                    placeholder="ej. 30"
                  />
                </div>
                <div className="campo">
                  <label>Posición Y en el mapa (0-100, opcional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formEquipo.posY}
                    onChange={(e) => actualizarCampoEquipo("posY", e.target.value)}
                    placeholder="ej. 60"
                  />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: -8, marginBottom: 16 }}>
                Define dónde aparece este equipo en "Mapa de Equipos" (0 = izquierda/arriba, 100 = derecha/abajo). Si lo
                dejas vacío, aparece en la fila de equipos "sin posición" al pie del mapa.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="boton-primario" type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : equipoEditandoId ? "Guardar cambios" : "Registrar equipo"}
                </button>
                {equipoEditandoId && (
                  <button type="button" className="boton-secundario" onClick={cancelarEdicionEquipo}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="tarjeta">
            <div className="barra-acciones">
              <strong>Equipos registrados</strong>
            </div>
            {cargando ? (
              <div className="cargando">Cargando...</div>
            ) : equipos.length === 0 ? (
              <div className="texto-vacio">Aún no hay equipos registrados.</div>
            ) : (
              <div className="tabla-wrap">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Marca / Modelo</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipos.map((eq) => (
                      <tr key={eq.id}>
                        <td>{eq.id}</td>
                        <td>{eq.nombre}</td>
                        <td>{eq.tipoEquipo || "—"}</td>
                        <td>{[eq.marca, eq.modelo].filter(Boolean).join(" / ") || "—"}</td>
                        <td>{formatearEstadoEquipo(eq.estado)}</td>
                        <td>
                          <button className="boton-mini" onClick={() => editarEquipo(eq)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.RegistroSensor = RegistroSensor;
