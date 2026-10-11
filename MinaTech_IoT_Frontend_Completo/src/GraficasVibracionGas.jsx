const { useState: useStateVG, useEffect: useEffectVG } = React;

const COLOR_VIBRACION_1 = "#6366f1";
const COLOR_VIBRACION_2 = "#a855f7";
const COLOR_GAS_1 = "#f59e0b";
const COLOR_GAS_2 = "#ea580c";

/** [{valor, fechaHora}, ...] -> [[timestampMs, valor], ...] que espera ApexCharts en ejes de tipo "datetime". */
function aPuntosDeTiempo(historial) {
  return (historial || []).map((h) => [new Date(h.fechaHora).getTime(), h.valor]);
}

function opcionesLinea(titulo, unidad, colores) {
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
  };
}

/** Pantalla de gráficas de líneas para Vibración (1 y 2 combinadas) y Gas (1 y 2 por separado, distinta unidad). */
function GraficasVibracionGas() {
  const [cargando, setCargando] = useStateVG(true);
  const [error, setError] = useStateVG("");
  const [series, setSeries] = useStateVG({ vibracion: [], gas1: [], gas2: [] });
  const [unidades, setUnidades] = useStateVG({ vibracion: "", gas1: "", gas2: "" });

  async function cargar() {
    try {
      const sensores = await Api.listarSensores();
      const porClave = Object.fromEntries(sensores.map((s) => [s.claveVariable, s]));

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
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectVG(() => {
    cargar();
    const intervalo = setInterval(cargar, 1000);
    return () => clearInterval(intervalo);
  }, []);

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
              options={opcionesLinea("Vibración (1 y 2)", unidades.vibracion, [COLOR_VIBRACION_1, COLOR_VIBRACION_2])}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tarjeta">
              <ApexChartBox type="line" series={series.gas1} options={opcionesLinea("Gas 1", unidades.gas1, [COLOR_GAS_1])} />
            </div>
            <div className="tarjeta">
              <ApexChartBox type="line" series={series.gas2} options={opcionesLinea("Gas 2", unidades.gas2, [COLOR_GAS_2])} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.GraficasVibracionGas = GraficasVibracionGas;
