const { useState } = React;

function Login({ onLogin, irARegistro }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = await Api.login(email, password);
      onLogin(respuesta.token, respuesta.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-badge">
            <Icons.Logo size={20} />
          </div>
          <div className="auth-logo-texto">MinaTech IoT</div>
        </div>
        <div className="auth-subtitulo">
          Ingresa con tu cuenta para monitorear los equipos y sensores.
        </div>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Correo electronico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@minatech.com"
              required
            />
          </div>
          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="boton-primario" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="enlace-auth">
          ¿No tienes cuenta?{" "}
          <button type="button" onClick={irARegistro}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

window.Login = Login;
