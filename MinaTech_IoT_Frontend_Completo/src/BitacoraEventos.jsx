const { useState: useStateBit, useEffect: useEffectBit } = React;

const ICONO_POR_TIPO_EVENTO = {
  ALERTA: "Alerta",
  EQUIPO_NUEVO: "Equipo",
  SENSOR_NUEVO: "Sensor",
};

const CLASE_MARCADOR_POR_TIPO = {
  ALERTA: "tipo-alerta",
  EQUIPO_NUEVO: "tipo-equipo",
  SENSOR_NUEVO: "tipo-sensor",
};

function formatearFechaEvento(valor) {
  if (!valor) return "—";
  try {
    return new Date(valor).toLocaleString("es-PE");
  } catch (e) {
    return valor;
  }
}

/**
 * Línea de tiempo que combina, en un solo feed cronológico, las alertas de
 * riesgo generadas y los equipos/sensores detectados por primera vez
 * (automáticamente por MQTT o dados de alta a mano) — el típico "feed de
 * actividad" de un sistema IoT para reconstruir "qué pasó" sin saltar
 * entre las pantallas de Alertas y Equipos/Sensores.
 */
function BitacoraEventos() {
  const [eventos, setEventos] = useStateBit([]);
  const [cargando, setCargando] = useStateBit(true);
  const [error, setError] = useStateBit("");
  const primeraCargaHecha = React.useRef(false);

  async function cargar() {
    setError("");
    if (!primeraCargaHecha.current) {
      setCargando(true);
    }
    try {
      const datos = await Api.eventos(150);
      setEventos(datos);
      primeraCargaHecha.current = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectBit(() => {
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div>
      <div className="contenido-header">
        <h1>Bitácora de Eventos</h1>
        <p>
          Línea de tiempo con las alertas generadas y los equipos/sensores detectados por primera vez (se actualiza
          cada 5 segundos).
        </p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      <div className="tarjeta">
        {cargando ? (
          <div className="cargando">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="texto-vacio">Todavía no hay eventos registrados.</div>
        ) : (
          <div className="linea-tiempo">
            {eventos.map((ev, i) => {
              const Icono = Icons[ICONO_POR_TIPO_EVENTO[ev.tipo]] || Icons.Reloj;
              return (
                <div className="evento-fila" key={`${ev.tipo}-${ev.equipoId}-${ev.sensorId}-${ev.fecha}-${i}`}>
                  <div className={`evento-marcador ${CLASE_MARCADOR_POR_TIPO[ev.tipo] || ""}`}>
                    <Icono size={16} />
                  </div>
                  <div className="evento-cuerpo">
                    <div className="evento-fila-top">
                      <div className="evento-titulo">{ev.titulo}</div>
                      <div className="evento-fecha">{formatearFechaEvento(ev.fecha)}</div>
                    </div>
                    <div className="evento-descripcion">{ev.descripcion}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

window.BitacoraEventos = BitacoraEventos;
