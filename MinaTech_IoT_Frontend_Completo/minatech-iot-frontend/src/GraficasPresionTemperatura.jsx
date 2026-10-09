const { useState: useStatePT, useEffect: useEffectPT } = React;

const COLOR_PRESION_1 = "#0ea5e9";
const COLOR_PRESION_2 = "#0284c7";
const COLOR_TEMPERATURA_1 = "#ef4444";
const COLOR_TEMPERATURA_2 = "#f97316";

function aPuntosDeTiempo(historial) {
  return (historial || []).map((h) => [new Date(h.fechaHora).getTime(), h.valor]);
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

function opcionesGauge(nombre, datos, color) {
  return {
    chart: { animations: { easing: "easeinout", speed: 400 } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "55%" },
        track: { background: "#f1f5f9" },
        dataLabels: {
          name: { text: nombre, fontSize: "13px", color: "#64748b", offsetY: -8 },
          value: {
            fontSize: "22px",
            fontWeight: 700,
            color: "#1e293b",
            offsetY: 4,
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

  async function cargar() {
    try {
      const sensores = await Api.listarSensores();
      const porClave = Object.fromEntries(sensores.map((s) => [s.claveVariable, s]));

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

  const opcionesArea = {
    chart: { animations: { easing: "easeinout", speed: 400 } },
    title: { text: "Temperatura (1 y 2)", style: { fontSize: "14px", fontWeight: 600, color: "#1e293b" } },
    colors: [COLOR_TEMPERATURA_1, COLOR_TEMPERATURA_2],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: { title: { text: unidadTemp }, labels: { formatter: (v) => (v == null ? "" : v.toFixed(1)) } },
    tooltip: { x: { format: "HH:mm:ss" } },
    legend: { show: true, position: "top" },
    noData: { text: "Esperando lecturas..." },
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
          </div>
        </div>
      )}
    </div>
  );
}

window.GraficasPresionTemperatura = GraficasPresionTemperatura;
