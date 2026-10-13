const { useState: useStateVG, useEffect: useEffectVG } = React;

const COLOR_VIBRACION_1 = "#6366f1";
const COLOR_VIBRACION_2 = "#a855f7";
const COLOR_GAS_1 = "#f59e0b";
const COLOR_GAS_2 = "#ea580c";

/** [{valor, fechaHora}, ...] -> [[timestampMs, valor], ...] que espera ApexCharts en ejes de tipo "datetime". */
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

/** Fila compacta con mín/máx/promedio, debajo del título de cada gráfica. */
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

function opcionesLinea(titulo, unidad, colores, annotations) {
  return {
    chart: { animations: { easing: "easeinout", speed: 400 }, foreColor: "#8fa6bd" },
    title: { text: titulo, style: { fontSize: "14px", fontWeight: 600, color: "#e7eef5" } },
    colors: colores,
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(148, 197, 217, 0.14)", strokeDashArray: 3 },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: {
      title: { text: unidad },
      labels: { formatter: (v) => (v == null ? "" : v.toFixed(1)), style: { fontFamily: "ui-monospace, Consolas, monospace" } },
    },
    tooltip: { x: { format: "HH:mm:ss" }, theme: "dark" },
    legend: { show: colores.length > 1, position: "top", labels: { colors: "#e7eef5" } },
    noData: { text: "Esperando lecturas...", style: { color: "#8fa6bd" } },
    ...(annotations ? { annotations } : {}),
  };
}

/** Pantalla de gráficas de líneas para Vibración (1 y 2 combinadas) y Gas (1 y 2 por separado, distinta unidad). */
function GraficasVibracionGas() {
  const [cargando, setCargando] = useStateVG(true);
  const [error, setError] = useStateVG("");
  const [series, setSeries] = useStateVG({ vibracion: [], gas1: [], gas2: [] });
  const [unidades, setUnidades] = useStateVG({ vibracion: "", gas1: "", gas2: "" });
  const [statsVibracion, setStatsVibracion] = useStateVG({ v1: null, v2: null });
  const [statsGas1, setStatsGas1] = useStateVG(null);
  const [statsGas2, setStatsGas2] = useStateVG(null);
  const [sensoresClave, setSensoresClave] = useStateVG({});

  async function cargar() {
    try {
      const sensores = await Api.listarSensores();
      const porClave = Object.fromEntries(sensores.map((s) => [s.claveVariable, s]));
      setSensoresClave(porClave);

      const v1 = porClave["vibracion_1"];
      const v2 = porClave["vibracion_2"];
      const g1 = porClave["gas_1"];
      const g2 = porClave["gas_2"];

      const [histV1, histV2, histG1, histG2] = await Promise.all([
        v1 ? Api.historialSensor(v1.id) : Promise.resolve([]),
        v2 ? Api.historialSensor(v2.id) : Promise.resolve([]),
        g1 ? Api.historialSensor(g1.id) : Promise.resolve([]),
        g2 ? Api.historialSensor(g2.id) : Promise.resolve([]),
      ]);

      setSeries({
        vibracion: [
          { name: "Vibración 1", data: aPuntosDeTiempo(histV1) },
          { name: "Vibración 2", data: aPuntosDeTiempo(histV2) },
        ],
        gas1: [{ name: "Gas 1" + (g1 && g1.subtipo ? ` (${g1.subtipo})` : ""), data: aPuntosDeTiempo(histG1) }],
        gas2: [{ name: "Gas 2" + (g2 && g2.subtipo ? ` (${g2.subtipo})` : ""), data: aPuntosDeTiempo(histG2) }],
      });
      setUnidades({
        vibracion: (histV1[0] || histV2[0] || {}).unidadMedida || "mm/s",
        gas1: (histG1[0] || {}).unidadMedida || "",
        gas2: (histG2[0] || {}).unidadMedida || "",
      });
      setStatsVibracion({ v1: estadisticas(histV1), v2: estadisticas(histV2) });
      setStatsGas1(estadisticas(histG1));
      setStatsGas2(estadisticas(histG2));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectVG(() => {
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const v1 = sensoresClave["vibracion_1"];
  const v2 = sensoresClave["vibracion_2"];
  const g1 = sensoresClave["gas_1"];
  const g2 = sensoresClave["gas_2"];

  return (
    <div>
      <div className="contenido-header">
        <h1>Vibración y Gases</h1>
        <p>Tendencia de las últimas lecturas recibidas por MQTT (se actualiza cada 5 segundos).</p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="cargando">Cargando historial...</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="tarjeta">
            <ApexChartBox
              type="line"
              series={series.vibracion}
              options={opcionesLinea(
                "Vibración (1 y 2)",
                unidades.vibracion,
                [COLOR_VIBRACION_1, COLOR_VIBRACION_2],
                anotacionesUmbral([v1, v2].filter(Boolean), "#a855f7")
              )}
            />
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {statsVibracion.v1 && (
                <div>
                  <span style={{ fontSize: 12, color: "var(--panel-texto-secundario)" }}>Vibración 1</span>
                  <FilaEstadisticas stats={statsVibracion.v1} unidad={unidades.vibracion} />
                </div>
              )}
              {statsVibracion.v2 && (
                <div>
                  <span style={{ fontSize: 12, color: "var(--panel-texto-secundario)" }}>Vibración 2</span>
                  <FilaEstadisticas stats={statsVibracion.v2} unidad={unidades.vibracion} />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tarjeta">
              <ApexChartBox
                type="line"
                series={series.gas1}
                options={opcionesLinea("Gas 1", unidades.gas1, [COLOR_GAS_1], anotacionesUmbral([g1].filter(Boolean), COLOR_GAS_1))}
              />
              <FilaEstadisticas stats={statsGas1} unidad={unidades.gas1} />
            </div>
            <div className="tarjeta">
              <ApexChartBox
                type="line"
                series={series.gas2}
                options={opcionesLinea("Gas 2", unidades.gas2, [COLOR_GAS_2], anotacionesUmbral([g2].filter(Boolean), COLOR_GAS_2))}
              />
              <FilaEstadisticas stats={statsGas2} unidad={unidades.gas2} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.GraficasVibracionGas = GraficasVibracionGas;
