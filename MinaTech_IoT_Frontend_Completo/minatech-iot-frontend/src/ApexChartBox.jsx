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

  // Actualizar los datos cuando cambian (sin recrear el gráfico).
  // Se usa updateOptions (no solo updateSeries) para que también se
  // refresque cualquier texto calculado con un "formatter" (por ejemplo
  // el número grande que se ve en el centro de un gauge) — ese texto
  // depende de los props más recientes, y updateSeries por sí solo no
  // lo vuelve a recalcular, solo mueve la barra/línea.
  // Sin arreglo de dependencias a propósito: options y series son objetos
  // nuevos en cada actualización de datos, así que esto corre justo
  // cuando el padre trae datos nuevos (cada N segundos), no en cada
  // render sin motivo.
  useEffectApex(() => {
    if (chartRef.current) {
      chartRef.current.updateOptions({ ...options, series }, false, true, true);
    }
  });

  return <div ref={contenedorRef}></div>;
}

window.ApexChartBox = ApexChartBox;
