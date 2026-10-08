const { useState: useStatePlan, useEffect: useEffectPlan } = React;

function badgeEstadoPlan(estado) {
  const mapa = {
    PROGRAMADO: { clase: "badge-sin-datos", texto: "Programado" },
    EN_PROCESO: { clase: "badge-alerta", texto: "En proceso" },
    COMPLETADO: { clase: "badge-normal", texto: "Completado" },
    CANCELADO: { clase: "badge-critico", texto: "Cancelado" },
  };
  return mapa[estado] || { clase: "badge-sin-datos", texto: estado };
}

function fechaDeHoy() {
  return new Date().toISOString().slice(0, 10);
}

function PlanMantenimiento() {
  const [equipos, setEquipos] = useStatePlan([]);
  const [planes, setPlanes] = useStatePlan([]);
  const [cargando, setCargando] = useStatePlan(true);
  const [error, setError] = useStatePlan("");
  const [exito, setExito] = useStatePlan("");
  const [guardando, setGuardando] = useStatePlan(false);

  const [form, setForm] = useStatePlan({
    equipoMecanicoId: "",
    tipoMantenimiento: "PREVENTIVO",
    fechaProgramada: fechaDeHoy(),
    responsable: "",
    descripcion: "",
  });

  async function cargarTodo() {
    setError("");
    try {
      const [listaEquipos, listaPlanes] = await Promise.all([Api.listarEquipos(), Api.listarPlanes()]);
      setEquipos(listaEquipos);
      setPlanes(listaPlanes);
      if (listaEquipos.length > 0 && !form.equipoMecanicoId) {
        setForm((prev) => ({ ...prev, equipoMecanicoId: String(listaEquipos[0].id) }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectPlan(() => {
    cargarTodo();
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
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
      await Api.crearPlan({
        equipoMecanicoId: Number(form.equipoMecanicoId),
        tipoMantenimiento: form.tipoMantenimiento,
        fechaProgramada: form.fechaProgramada,
        responsable: form.responsable,
        descripcion: form.descripcion || null,
      });
      setExito("Plan de mantenimiento registrado correctamente.");
      setForm((prev) => ({ ...prev, responsable: "", descripcion: "", fechaProgramada: fechaDeHoy() }));
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
        <h1>Plan de Mantenimiento</h1>
        <p>Programa mantenimiento preventivo o correctivo para un equipo mecánico.</p>
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

              <div className="campo">
                <label>Tipo de mantenimiento</label>
                <select
                  value={form.tipoMantenimiento}
                  onChange={(e) => actualizar("tipoMantenimiento", e.target.value)}
                >
                  <option value="PREVENTIVO">Preventivo</option>
                  <option value="CORRECTIVO">Correctivo</option>
                </select>
              </div>

              <div className="campo">
                <label>Fecha programada</label>
                <input
                  type="date"
                  value={form.fechaProgramada}
                  onChange={(e) => actualizar("fechaProgramada", e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Responsable</label>
                <input
                  value={form.responsable}
                  onChange={(e) => actualizar("responsable", e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Descripción (opcional)</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => actualizar("descripcion", e.target.value)}
                />
              </div>

              <button className="boton-primario" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Registrar plan"}
              </button>
            </form>
          )}
        </div>

        <div className="tarjeta">
          <div className="barra-acciones">
            <strong>Planes programados</strong>
          </div>
          {cargando ? (
            <div className="cargando">Cargando...</div>
          ) : planes.length === 0 ? (
            <div className="texto-vacio">Aún no hay planes de mantenimiento.</div>
          ) : (
            <div className="tabla-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map((p) => {
                    const badge = badgeEstadoPlan(p.estado);
                    return (
                      <tr key={p.id}>
                        <td>{p.equipoNombre || "—"}</td>
                        <td>{p.tipoMantenimiento === "PREVENTIVO" ? "Preventivo" : "Correctivo"}</td>
                        <td>{p.fechaProgramada}</td>
                        <td>{p.responsable}</td>
                        <td><span className={`badge ${badge.clase}`}>{badge.texto}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.PlanMantenimiento = PlanMantenimiento;
