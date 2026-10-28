const { useState: useStateMapa, useEffect: useEffectMapa } = React;

// Mismo umbral de "lectura fresca" que usa el Dashboard (20s), pero con
// nombre propio: cada archivo .jsx se carga como un <script> clásico
// separado y comparte el ámbito global del navegador, así que una
// constante de nivel superior con el mismo nombre en dos archivos
// chocaría ("ya declarada").
const UMBRAL_FRESCO_MS_MAPA = 20000;

function esFrescaParaMapa(fechaHora) {
  if (!fechaHora) return false;
  const edadMs = Date.now() - new Date(fechaHora).getTime();
  return edadMs >= 0 && edadMs <= UMBRAL_FRESCO_MS_MAPA;
}

/** Cuenta, por equipo, cuántos de sus sensores siguen transmitiendo, a partir de las lecturas del Dashboard. */
function calcularConectividad(lecturas) {
  const porEquipo = new Map();
  for (const l of lecturas) {
    if (l.equipoId == null) continue;
    if (!porEquipo.has(l.equipoId)) {
      porEquipo.set(l.equipoId, { total: 0, frescos: 0 });
    }
    const entrada = porEquipo.get(l.equipoId);
    entrada.total += 1;
    if (esFrescaParaMapa(l.fechaHora)) entrada.frescos += 1;
  }
  return porEquipo;
}

function estadoDeConectividad(conteo) {
  if (!conteo || conteo.total === 0) return "sin-senal";
  if (conteo.frescos === conteo.total) return "todo-bien";
  if (conteo.frescos === 0) return "sin-senal";
  return "parcial";
}


/**
 * Devuelve la altura (px) que queda desde el borde superior del elemento
 * hasta el final de la ventana, menos "reserva" (leyenda + margenes de
 * abajo). Se recalcula al cambiar el tamaño de la ventana, asi el mapa
 * siempre llena el espacio restante sin importar la pantalla.
 */
function useAlturaRestante(ref, reserva, minimo) {
  const [altura, setAltura] = useStateMapa(minimo);
  useEffectMapa(() => {
    function calcular() {
      if (!ref.current) return;
      const arriba = ref.current.getBoundingClientRect().top;
      setAltura(Math.max(minimo, Math.round(window.innerHeight - arriba - reserva)));
    }
    calcular();
    window.addEventListener("resize", calcular);
    // un segundo calculo tras pintar, por si el encabezado cambia de alto al cargar
    const t = setTimeout(calcular, 150);
    return () => {
      window.removeEventListener("resize", calcular);
      clearTimeout(t);
    };
  });
  return altura;
}

// Capas base del Mapa Satelital: servidores de teselas publicos, gratis y
// sin API key (a diferencia de Google Maps). Mismo enfoque que el "worldmap"
// de Node-RED: un selector de capas con satelite, calles, relieve, etc.
const CLAVE_CAPA_MAPA = "minatech_capa_mapa";
const COLOR_CONECTIVIDAD = { "todo-bien": "#22c55e", parcial: "#f59e0b", "sin-senal": "#ef4444" };

function crearCapasBase() {
  return {
    "Satélite (Esri)": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics" }
    ),
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }),
    "Relieve (OpenTopoMap)": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: "&copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap (CC-BY-SA)",
    }),
    // Esri solo publica este relieve hasta el zoom 9 (a partir de ~10 km de escala ya no hay teselas): con maxNativeZoom Leaflet
    // amplia esas teselas en vez de mostrar el mapa en blanco al acercarse mas.
    "Terreno (Esri)": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, maxNativeZoom: 9, attribution: "Tiles &copy; Esri &mdash; USGS, NOAA" }
    ),
    "Calles (Esri)": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Tiles &copy; Esri" }
    ),
    // Mismo servidor Esri que ya funciona con Satelite/Calles (el de CARTO fallaba).
    "Oscuro (Esri)": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, maxNativeZoom: 16, attribution: "Tiles &copy; Esri &mdash; HERE, Garmin, FAO, NOAA, USGS" }
    ),
  };
}

function MapaSatelital({ equipos, conectividad }) {
  const contenedorRef = React.useRef(null);
  const mapaRef = React.useRef(null);
  const marcadoresRef = React.useRef(null);
  const ajustadoRef = React.useRef(false);
  const registroRef = React.useRef(new Map());
  const puntosRef = React.useRef([]); // coordenadas actuales de los equipos, para el boton "centrar"

  // Crea el mapa una sola vez (y lo destruye al cambiar de vista).
  useEffectMapa(() => {
    if (typeof L === "undefined" || !contenedorRef.current) return undefined;

    const capas = crearCapasBase();
    let nombreInicial = "Satélite (Esri)";
    try {
      const guardada = localStorage.getItem(CLAVE_CAPA_MAPA);
      if (guardada && capas[guardada]) nombreInicial = guardada;
    } catch (e) {
      // sin localStorage: se usa la capa por defecto
    }

    const mapa = L.map(contenedorRef.current, { center: [-15.84, -70.02], zoom: 5, zoomControl: true });
    capas[nombreInicial].addTo(mapa);
    L.control.layers(capas, null, { position: "topright", collapsed: true }).addTo(mapa);
    L.control.scale({ imperial: false }).addTo(mapa);
    mapa.on("baselayerchange", (ev) => {
      try {
        localStorage.setItem(CLAVE_CAPA_MAPA, ev.name);
      } catch (e) {
        // ignorar
      }
    });

    // Boton dentro del mapa para volver a encuadrar todos los equipos cuando
    // el usuario se aleja demasiado.
    const BotonCentrar = L.Control.extend({
      options: { position: "topleft" },
      onAdd() {
        const contenedor = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        const boton = L.DomUtil.create("a", "boton-centrar-equipos", contenedor);
        boton.href = "#";
        boton.title = "Centrar en mis equipos";
        boton.setAttribute("role", "button");
        boton.setAttribute("aria-label", "Centrar en mis equipos");
        boton.textContent = "◎";
        L.DomEvent.disableClickPropagation(contenedor);
        L.DomEvent.on(boton, "click", (ev) => {
          L.DomEvent.preventDefault(ev);
          const puntos = puntosRef.current;
          if (puntos.length === 1) {
            mapa.setView(puntos[0], Math.max(mapa.getZoom(), 15));
          } else if (puntos.length > 1) {
            mapa.fitBounds(L.latLngBounds(puntos), { padding: [60, 60], maxZoom: 16 });
          }
        });
        return contenedor;
      },
    });
    new BotonCentrar().addTo(mapa);

    // Si el contenedor cambia de tamaño (ventana, altura calculada), Leaflet debe recalcular.
    let observador = null;
    if (typeof ResizeObserver !== "undefined") {
      observador = new ResizeObserver(() => mapa.invalidateSize());
      observador.observe(contenedorRef.current);
    }

    marcadoresRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    ajustadoRef.current = false;
    return () => {
      if (observador) observador.disconnect();
      mapa.remove();
      mapaRef.current = null;
      registroRef.current = new Map();
    };
  }, []);

  // Sincroniza los marcadores con los equipos SIN destruirlos en cada
  // refresco: cada equipo conserva su marcador (por id) y solo se actualiza
  // su posicion, color y texto. Asi la ubicacion no parpadea ni desaparece y
  // un popup abierto no se cierra cuando llegan datos nuevos.
  useEffectMapa(() => {
    const mapa = mapaRef.current;
    const grupo = marcadoresRef.current;
    if (!mapa || !grupo) return;
    const registro = registroRef.current;

    const conCoordenadas = equipos.filter((eq) => eq.latitud != null && eq.longitud != null);
    const idsActuales = new Set(conCoordenadas.map((eq) => eq.id));

    // Quita los marcadores de equipos que ya no tienen coordenadas.
    registro.forEach((marcador, id) => {
      if (!idsActuales.has(id)) {
        grupo.removeLayer(marcador);
        registro.delete(id);
      }
    });

    const puntos = [];
    conCoordenadas.forEach((eq) => {
      const estado = estadoDeConectividad(conectividad.get(eq.id));
      const color = COLOR_CONECTIVIDAD[estado];
      const posicion = [eq.latitud, eq.longitud];
      const textoEstado =
        estado === "todo-bien"
          ? "todos los sensores en línea"
          : estado === "parcial"
          ? "algunos sensores sin señal"
          : "sin señal";

      let marcador = registro.get(eq.id);
      if (!marcador) {
        // circleMarker se dibuja en el propio canvas/SVG de Leaflet: no
        // depende de imagenes ni de CSS externo para verse siempre.
        marcador = L.circleMarker(posicion, { radius: 9, weight: 3, color: "#0a141f", fillOpacity: 1 });
        marcador.bindTooltip(eq.nombre, { permanent: true, direction: "right", offset: [10, 0], className: "etiqueta-equipo-mapa" });
        marcador.bindPopup("");
        grupo.addLayer(marcador);
        registro.set(eq.id, marcador);
      } else {
        marcador.setLatLng(posicion);
        marcador.setTooltipContent(eq.nombre);
      }
      marcador.setStyle({ fillColor: color });

      const nodo = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.textContent = eq.nombre;
      const detalle = document.createElement("div");
      detalle.textContent = `${eq.tipoEquipo || "sin tipo"} — ${textoEstado}`;
      nodo.appendChild(titulo);
      nodo.appendChild(detalle);
      marcador.getPopup().setContent(nodo);

      puntos.push(posicion);
    });

    puntosRef.current = puntos;

    // Solo la primera vez que hay puntos encuadra todos los equipos; en los
    // refrescos siguientes respeta el zoom/posicion que el usuario ya movio.
    if (!ajustadoRef.current && puntos.length > 0) {
      mapa.fitBounds(L.latLngBounds(puntos), { padding: [60, 60], maxZoom: 16 });
      ajustadoRef.current = true;
    }
  }, [equipos, conectividad]);

  return <div ref={contenedorRef} className="mapa-satelital" />;
}

/**
 * Plano esquemático (no un mapa geográfico real) con los equipos
 * mecánicos posicionados según las coordenadas 0-100 que se configuran en
 * "Equipos y Sensores", coloreados según cuántos de sus sensores siguen
 * transmitiendo. Patrón típico de dashboards IoT industriales: ver de un
 * vistazo dónde están los problemas de conectividad, no solo leerlos en
 * una tabla.
 */
function MapaEquipos() {
  const [equipos, setEquipos] = useStateMapa([]);
  const [lecturas, setLecturas] = useStateMapa([]);
  const [cargando, setCargando] = useStateMapa(true);
  const [error, setError] = useStateMapa("");
  // "plano" (esquemático, por defecto) | "satelital" (mapa geográfico real)
  const [vista, setVista] = useStateMapa("plano");
  const visorRef = React.useRef(null);
  // 110 px de reserva: leyenda + relleno de la tarjeta + margen inferior de la pagina.
  const alturaVisor = useAlturaRestante(visorRef, 110, 460);

  async function cargar() {
    try {
      const [listaEquipos, listaLecturas] = await Promise.all([Api.listarEquipos(), Api.dashboard()]);
      setEquipos(listaEquipos);
      setLecturas(listaLecturas);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffectMapa(() => {
    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const conectividad = calcularConectividad(lecturas);
  const posicionados = equipos.filter((eq) => eq.posX != null && eq.posY != null);
  const sinPosicion = equipos.filter((eq) => eq.posX == null || eq.posY == null);

  return (
    <div className="pagina-ancha">
      <div
        className="contenido-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <h1>Mapa de Equipos</h1>
          <p>
            {vista === "plano"
              ? "Ubicación esquemática de los equipos mecánicos, coloreada según cuántos de sus sensores siguen transmitiendo (se actualiza cada 10 segundos)."
              : "Ubicación geográfica real de los equipos. Usa el selector de capas (arriba a la derecha del mapa) para cambiar entre satélite, calles, relieve y más."}
          </p>
        </div>
        <button className="filtro-boton" onClick={() => setVista(vista === "plano" ? "satelital" : "plano")}>
          {vista === "plano" ? "🛰️ Cambiar a Mapa Satelital" : "🗺️ Cambiar a Plano de la mina"}
        </button>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="cargando">Cargando equipos...</div>
      ) : equipos.length === 0 ? (
        <div className="tarjeta texto-vacio">
          Aún no hay equipos registrados. Ve a "Equipos y Sensores" para dar de alta uno, o espera a que llegue
          telemetría MQTT.
        </div>
      ) : (
        <div className="tarjeta">
          {vista === "satelital" ? (
            <>
              <div ref={visorRef} className="visor-mapa" style={{ height: alturaVisor }}>
                <MapaSatelital equipos={equipos} conectividad={conectividad} />
              </div>
              <div className="plano-leyenda">
                <span><span className="punto" style={{ background: "#22c55e" }} /> Todos los sensores en línea</span>
                <span><span className="punto" style={{ background: "#f59e0b" }} /> Algunos sensores sin señal</span>
                <span><span className="punto" style={{ background: "#ef4444" }} /> Sin señal / sin sensores</span>
              </div>
              {equipos.some((eq) => eq.latitud == null || eq.longitud == null) && (
                <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: 10 }}>
                  Sin coordenadas (no aparecen en este mapa):{" "}
                  {equipos.filter((eq) => eq.latitud == null || eq.longitud == null).map((eq) => eq.nombre).join(", ")}.
                  Asígnales latitud y longitud en "Equipos y Sensores" → "Equipos mecánicos".
                </div>
              )}
            </>
          ) : (
            <>
          <div ref={visorRef} className="visor-mapa" style={{ height: alturaVisor }}>
          <div className="plano-equipos">
            {posicionados.map((eq) => {
              const estado = estadoDeConectividad(conectividad.get(eq.id));
              return (
                <div
                  key={eq.id}
                  className={`nodo-equipo ${estado}`}
                  style={{ left: `${eq.posX}%`, top: `${eq.posY}%` }}
                  title={`${eq.nombre} — ${eq.tipoEquipo || "sin tipo"}`}
                >
                  <span className="nodo-equipo-punto" />
                  <span className="nodo-equipo-etiqueta">{eq.nombre}</span>
                </div>
              );
            })}
          </div>
          </div>

          <div className="plano-leyenda">
            <span><span className="punto" style={{ background: "#22c55e" }} /> Todos los sensores en línea</span>
            <span><span className="punto" style={{ background: "#f59e0b" }} /> Algunos sensores sin señal</span>
            <span><span className="punto" style={{ background: "#ef4444" }} /> Sin señal / sin sensores</span>
          </div>

          {sinPosicion.length > 0 && (
            <>
              <div className="barra-acciones" style={{ marginTop: 20 }}>
                <strong>Equipos sin posición asignada</strong>
              </div>
              <div className="grilla-sin-posicion">
                {sinPosicion.map((eq) => {
                  const estado = estadoDeConectividad(conectividad.get(eq.id));
                  return (
                    <div key={eq.id} className={`chip-equipo ${estado}`}>
                      <span className="chip-equipo-punto" />
                      <span className="chip-equipo-nombre">{eq.nombre}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "var(--panel-texto-secundario)", marginTop: 10 }}>
                Asígnales una posición X/Y en "Equipos y Sensores" → "Equipos mecánicos" para ubicarlos en el plano.
              </div>
            </>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

window.MapaEquipos = MapaEquipos;
