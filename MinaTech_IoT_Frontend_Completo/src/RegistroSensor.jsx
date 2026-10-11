const { useState: useStateSen, useEffect: useEffectSen } = React;

const VARIABLES_CONOCIDAS = [
  "vibracion_1", "vibracion_2",
  "gas_1", "gas_2",
  "presion_1", "presion_2",
  "temperatura_1", "temperatura_2",
];

function RegistroSensor() {
  const [equipos, setEquipos] = useStateSen([]);
  const [sensores, setSensores] = useStateSen([]);
  const [cargando, setCargando] = useStateSen(true);
  const [error, setError] = useStateSen("");
  const [exito, setExito] = useStateSen("");
  const [guardando, setGuardando] = useStateSen(false);

  const [form, setForm] = useStateSen({
    nombre: "",
    claveVariable: "vibracion_1",
    tipoSensor: "VIBRACION",
    subtipo: "",
    ubicacion: "",
    umbralCritico: "",
    equipoMecanicoId: "",
  });

  async function cargarTodo() {
    setError("");
    try {
      const [listaEquipos, listaSensores] = await Promise.all([Api.listarEquipos(), Api.listarSensores()]);
      setEquipos(listaEquipos);
      setSensores(listaSensores);
      if (listaEquipos.length > 0 && !form.equipoMecanicoId) {
        setForm((prev) => ({ ...prev, equipoMecanicoId: String(listaEquipos[0].id) }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectSen(() => {
    cargarTodo();
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function alCambiarClaveVariable(valor) {
    const tipoInferido = valor.split("_")[0]?.toUpperCase();
    const tiposValidos = ["VIBRACION", "GAS", "PRESION", "TEMPERATURA"];
    setForm((prev) => ({
      ...prev,
      claveVariable: valor,
      tipoSensor: tiposValidos.includes(tipoInferido) ? tipoInferido : prev.tipoSensor,
    }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setExito("");
    if (!form.equipoMecanicoId) {
      setError("Selecciona un equipo mecánico.");
      return;
    }
    setGuardando(true);
    try {
      await Api.crearSensor({
        nombre: form.nombre,
        claveVariable: form.claveVariable,
        tipoSensor: form.tipoSensor,
        subtipo: form.subtipo || null,
        ubicacion: form.ubicacion || null,
        umbralCritico: form.umbralCritico ? Number(form.umbralCritico) : null,
        equipoMecanicoId: Number(form.equipoMecanicoId),
      });
      setExito("Sensor registrado correctamente.");
      setForm((prev) => ({ ...prev, nombre: "", subtipo: "", ubicacion: "", umbralCritico: "" }));
      cargarTodo();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="contenido-header">
        <h1>Registro de Sensor</h1>
        <p>Da de alta un sensor y asócialo a un equipo mecánico existente.</p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}
      {exito && <div className="mensaje-exito">{exito}</div>}

      <div className="dos-columnas-formulario">
        <div className="tarjeta">
          {equipos.length === 0 && !cargando ? (
            <div className="texto-vacio">
              Todavía no hay equipos mecánicos. Se crean automáticamente cuando llega la primera
              telemetría MQTT de cada equipo.
            </div>
          ) : (
            <form onSubmit={enviar}>
              <div className="campo">
                <label>Nombre del sensor</label>
                <input value={form.nombre} onChange={(e) => actualizar("nombre", e.target.value)} required />
              </div>

              <div className="campo">
                <label>Variable MQTT</label>
                <select value={form.claveVariable} onChange={(e) => alCambiarClaveVariable(e.target.value)}>
                  {VARIABLES_CONOCIDAS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Tipo de sensor</label>
                <select value={form.tipoSensor} onChange={(e) => actualizar("tipoSensor", e.target.value)}>
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
                    value={form.subtipo}
                    onChange={(e) => actualizar("subtipo", e.target.value)}
                    placeholder="ej. CH4, motor"
                  />
                </div>
                <div className="campo">
                  <label>Umbral crítico (opcional)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.umbralCritico}
                    onChange={(e) => actualizar("umbralCritico", e.target.value)}
                  />
                </div>
              </div>

              <div className="campo">
                <label>Ubicación (opcional)</label>
                <input value={form.ubicacion} onChange={(e) => actualizar("ubicacion", e.target.value)} />
              </div>

              <div className="campo">
                <label>Equipo mecánico</label>
                <select
                  value={form.equipoMecanicoId}
                  onChange={(e) => actualizar("equipoMecanicoId", e.target.value)}
                  required
                >
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nombre} (id {eq.id})
                    </option>
                  ))}
                </select>
              </div>

              <button className="boton-primario" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Registrar sensor"}
              </button>
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
                    <th>Tipo</th>
                    <th>Equipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sensores.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nombre}</td>
                      <td>{s.claveVariable}</td>
                      <td>{s.tipoSensor}</td>
                      <td>{s.equipoNombre || "—"}</td>
                      <td>{s.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.RegistroSensor = RegistroSensor;
