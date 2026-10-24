const { useState: useStateReg } = React;

function Registro({ irALogin }) {
  const [form, setForm] = useStateReg({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "MINERO_OPERADOR",
    dni: "",
    telefono: "",
    concesionMinera: "",
  });
  const [error, setError] = useStateReg("");
  const [exito, setExito] = useStateReg("");
  const [cargando, setCargando] = useStateReg(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);
    try {
      const payload = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
        rol: form.rol,
      };
      if (form.rol === "MINERO_OPERADOR") {
        payload.dni = form.dni;
        payload.telefono = form.telefono;
        payload.concesionMinera = form.concesionMinera;
      }
      await Api.registrar(payload);
      setExito("Cuenta creada correctamente. Ya puedes iniciar sesión.");
      setForm({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        rol: "MINERO_OPERADOR",
        dni: "",
        telefono: "",
        concesionMinera: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-badge">
            <Icons.Logo size={20} />
          </div>
          <div className="auth-logo-texto">MinaTech IoT</div>
        </div>
        <div className="auth-subtitulo">Crea tu cuenta para acceder a la plataforma.</div>

        {error && <div className="mensaje-error">{error}</div>}
        {exito && <div className="mensaje-exito">{exito}</div>}

        <form onSubmit={enviar}>
          <div className="fila-dos-columnas">
            <div className="campo">
              <label>Nombres</label>
              <input value={form.nombres} onChange={(e) => actualizar("nombres", e.target.value)} required />
            </div>
            <div className="campo">
              <label>Apellidos</label>
              <input value={form.apellidos} onChange={(e) => actualizar("apellidos", e.target.value)} required />
            </div>
          </div>

          <div className="campo">
            <label>Correo electronico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => actualizar("email", e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => actualizar("password", e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="campo">
            <label>Rol</label>
            <select value={form.rol} onChange={(e) => actualizar("rol", e.target.value)}>
              <option value="MINERO_OPERADOR">Minero / Operador</option>
              <option value="JEFE_OPERACIONES">Jefe de Operaciones</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          {form.rol === "MINERO_OPERADOR" && (
            <>
              <div className="fila-dos-columnas">
                <div className="campo">
                  <label>DNI</label>
                  <input value={form.dni} onChange={(e) => actualizar("dni", e.target.value)} required />
                </div>
                <div className="campo">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={(e) => actualizar("telefono", e.target.value)} required />
                </div>
              </div>
              <div className="campo">
                <label>Concesión minera</label>
                <input
                  value={form.concesionMinera}
                  onChange={(e) => actualizar("concesionMinera", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button className="boton-primario" type="submit" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="enlace-auth">
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={irALogin}>
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}

window.Registro = Registro;
