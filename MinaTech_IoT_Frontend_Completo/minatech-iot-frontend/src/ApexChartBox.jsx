const { useRef: useRefApex, useEffect: useEffectApex } = React;

/**
 * Envuelve ApexCharts (cargado por CDN en index.html, ver window.ApexCharts)
 * dentro de un componente React. ApexCharts es imperativo (se instancia
 * sobre un <div>, no es un componente de React), así que lo montamos una
 * vez vía useEffect y actualizamos solo las series/opciones cuando cambian,
 * en vez de recrear el gráfico en cada render (eso se ve mal: parpadea y
 * pierde las animaciones de transición entre valores).
 *
 * No se usa el paquete "react-apexcharts" porque es una dependencia npm
 * más, y aquí no tenemos paso de build (ver nota en index.html) — esta
 * envoltura de ~25 líneas cubre lo que necesitamos.
 */
function ApexChartBox({ options, series, type, height = 260 }) {
  const contenedorRef = useRefApex(null);
  const chartRef = useRefApex(null);

  // Montar el gráfico una sola vez.
  useEffectApex(() => {
    const chart = new ApexCharts(contenedorRef.current, {
      ...options,
      series,
      chart: { ...options.chart, type, height, toolbar: { show: false } },
    });
    chart.render();
    chartRef.current = chart;
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar solo los datos cuando cambian (sin recrear el gráfico).
  useEffectApex(() => {
    if (chartRef.current) {
      chartRef.current.updateSeries(series);
    }
  }, [series]);

  return <div ref={contenedorRef}></div>;
}

window.ApexChartBox = ApexChartBox;
