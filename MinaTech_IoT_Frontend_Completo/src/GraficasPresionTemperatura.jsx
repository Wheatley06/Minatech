const { useState: useStatePT, useEffect: useEffectPT } = React;

const COLOR_PRESION_1 = "#0ea5e9";
const COLOR_PRESION_2 = "#0284c7";
const COLOR_TEMPERATURA_1 = "#ef4444";
const COLOR_TEMPERATURA_2 = "#f97316";

function aPuntosDeTiempo(historial) {
  return (historial || []).map((h) => [new Date(h.fechaHora).getTime(), h.valor]);
}

/** Mín / máx / promedio de un historial reciente, para dar contexto al valor actual (patrón típico de dashboards IoT). */
function estadisticas(historial) {
  if (!historial || historial.length === 0) return null;
  const valores = historial.map((h) => h.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  return { min, max, promedio };
}

function FilaEstadisticas({ stats, unidad }) {
  if (!stats) return null;
  const fmt = (v) => `${v.toFixed(1)}${unidad ? " " + unidad : ""}`;
  return (
    <div className="stat-mini-fila">
      <span><span className="stat-mini-etiqueta">Mín</span> {fmt(stats.min)}</span>
      <span><span className="stat-mini-etiqueta">Máx</span> {fmt(stats.max)}</span>
      <span><span className="stat-mini-etiqueta">Prom</span> {fmt(stats.promedio)}</span>
    </div>
  );
}

/** Línea horizontal punteada en el umbral crítico del sensor, si está configurado (ver pantalla "Equipos y Sensores"). */
function anotacionesUmbral(sensores, color) {
  const lineas = sensores
    .filter((s) => s && s.umbralCritico != null)
    .map((s) => ({
      y: s.umbralCritico,
      borderColor: color,
      strokeDashArray: 5,
      label: {
        text: `Umbral ${s.nombre}`,
        style: { color: "#0a141f", background: color, fontSize: "11px" },
        position: "left",
      },
    }));
  return lineas.length > 0 ? { yaxis: lineas } : undefined;
}

/**
 * Arma los datos de un gauge (radialBar) a partir de la última lectura de
 * un sensor. Como todavía no hay un rango min/max configurable por sensor,
 * se usa el umbral crítico (si está definido al registrar el sensor) como
 * el 100% del gauge; si no está definido, se usa 1.5x el valor actual como
 * referencia, para que el gauge siempre tenga una escala razonable.
 */
function datosGauge(sensor, historial) {
  const ultima = historial && historial.length > 0 ? historial[historial.length - 1] : null;
  const valor = ultima ? ultima.valor : 0;
  const unidad = ultima ? ultima.unidadMedida : "";
  const max = sensor && sensor.umbralCritico ? sensor.umbralCritico : Math.max(valor * 1.5, 1);
  const porcentaje = Math.max(0, Math.min(100, Math.round((valor / max) * 100)));
  return { valor, unidad, max, porcentaje };
}

// Por encima de este % del umbral crítico, el arco del gauge pasa a ámbar;
// por encima de este otro, a rojo — así el color del instrumento ya avisa
// de la cercanía al umbral, no solo el número.
const UMBRAL_AMBAR = 75;
const UMBRAL_ROJO = 90;

function colorPorProximidadAUmbral(porcentaje, colorBase) {
  if (porcentaje >= UMBRAL_ROJO) return "#ef4444";
  if (porcentaje >= UMBRAL_AMBAR) return "#f59e0b";
  return colorBase;
}

function opcionesGauge(nombre, datos, color) {
  const colorArco = colorPorProximidadAUmbral(datos.porcentaje, color);
  return {
    chart: { animations: { easing: "easeinout", speed: 400 } },
    colors: [colorArco],
    plotOptions: {
      radialBar: {
        hollow: { size: "55%", background: "transparent" },
        track: { background: "rgba(148, 197, 217, 0.12)", strokeWidth: "100%" },
        dataLabels: {
          name: { text: nombre, fontSize: "13px", color: "#8fa6bd", offsetY: -8 },
          value: {
            fontSize: "22px",
            fontWeight: 700,
            color: "#e7eef5",
            offsetY: 4,
            fontFamily: "ui-monospace, Consolas, monospace",
            formatter: () => `${datos.valor}${datos.unidad ? " " + datos.unidad : ""}`,
          },
        },
      },
    },
    labels: [nombre],
  };
}

/** Pantalla de gauge para Presión (1 y 2) y área para Temperatura (1 y 2 combinadas, misma unidad). */
function GraficasPresionTemperatura() {
  const [cargando, setCargando] = useStatePT(true);
  const [error, setError] = useStatePT("");
  const [gaugeP1, setGaugeP1] = useStatePT(null);
  const [gaugeP2, setGaugeP2] = useStatePT(null);
  const [serieTemp, setSerieTemp] = useStatePT([]);
  const [unidadTemp, setUnidadTemp] = useStatePT("°C");
  const [statsTemp, setStatsTemp] = useStatePT({ t1: null, t2: null });
  const [sensoresClave, setSensoresClave] = useStatePT({});

  async function cargar() {
    try {
      const sensores = await Api.listarSensores();
      const porClave = Object.fromEntries(sensores.map((s) => [s.claveVariable, s]));
      setSensoresClave(porClave);

      const p1 = porClave["presion_1"];
      const p2 = porClave["presion_2"];
      const t1 = porClave["temperatura_1"];
      const t2 = porClave["temperatura_2"];

      const [histP1, histP2, histT1, histT2] = await Promise.all([
        p1 ? Api.historialSensor(p1.id) : Promise.resolve([]),
        p2 ? Api.historialSensor(p2.id) : Promise.resolve([]),
        t1 ? Api.historialSensor(t1.id) : Promise.resolve([]),
        t2 ? Api.historialSensor(t2.id) : Promise.resolve([]),
      ]);

      setGaugeP1(datosGauge(p1, histP1));
      setGaugeP2(datosGauge(p2, histP2));
      setSerieTemp([
        { name: "Temperatura 1" + (t1 && t1.subtipo ? ` (${t1.subtipo})` : ""), data: aPuntosDeTiempo(histT1) },
        { name: "Temperatura 2" + (t2 && t2.subtipo ? ` (${t2.subtipo})` : ""), data: aPuntosDeTiempo(histT2) },
      ]);
      setUnidadTemp((histT1[0] || histT2[0] || {}).unidadMedida || "°C");
      setStatsTemp({ t1: estadisticas(histT1), t2: estadisticas(histT2) });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectPT(() => {
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const t1 = sensoresClave["temperatura_1"];
  const t2 = sensoresClave["temperatura_2"];

  const opcionesArea = {
    chart: { animations: { easing: "easeinout", speed: 400 }, foreColor: "#8fa6bd" },
    title: { text: "Temperatura (1 y 2)", style: { fontSize: "14px", fontWeight: 600, color: "#e7eef5" } },
    colors: [COLOR_TEMPERATURA_1, COLOR_TEMPERATURA_2],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.04 } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(148, 197, 217, 0.14)", strokeDashArray: 3 },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: {
      title: { text: unidadTemp },
      labels: { formatter: (v) => (v == null ? "" : v.toFixed(1)), style: { fontFamily: "ui-monospace, Consolas, monospace" } },
    },
    tooltip: { x: { format: "HH:mm:ss" }, theme: "dark" },
    legend: { show: true, position: "top", labels: { colors: "#e7eef5" } },
    noData: { text: "Esperando lecturas...", style: { color: "#8fa6bd" } },
    ...(() => {
      const anotaciones = anotacionesUmbral([t1, t2].filter(Boolean), COLOR_TEMPERATURA_1);
      return anotaciones ? { annotations: anotaciones } : {};
    })(),
  };

  return (
    <div>
      <div className="contenido-header">
        <h1>Presión y Temperatura</h1>
        <p>Presión como medidor (gauge) sobre su umbral crítico; temperatura como tendencia en el tiempo.</p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="cargando">Cargando historial...</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tarjeta">
              {gaugeP1 && (
                <ApexChartBox
                  type="radialBar"
                  series={[gaugeP1.porcentaje]}
                  options={opcionesGauge("Presión 1", gaugeP1, COLOR_PRESION_1)}
                />
              )}
            </div>
            <div className="tarjeta">
              {gaugeP2 && (
                <ApexChartBox
                  type="radialBar"
                  series={[gaugeP2.porcentaje]}
                  options={opcionesGauge("Presión 2", gaugeP2, COLOR_PRESION_2)}
                />
              )}
            </div>
          </div>
          <div className="tarjeta">
            <ApexChartBox type="area" series={serieTemp} options={opcionesArea} />
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {statsTemp.t1 && (
                <div>
                  <span style={{ fontSize: 12, color: "var(--panel-texto-secundario)" }}>Temperatura 1</span>
                  <FilaEstadisticas stats={statsTemp.t1} unidad={unidadTemp} />
                </div>
              )}
              {statsTemp.t2 && (
                <div>
                  <span style={{ fontSize: 12, color: "var(--panel-texto-secundario)" }}>Temperatura 2</span>
                  <FilaEstadisticas stats={statsTemp.t2} unidad={unidadTemp} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.GraficasPresionTemperatura = GraficasPresionTemperatura;
