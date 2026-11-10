import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";
import { useCargar } from "./useCargar";
import { leerError } from "./errores";
import { formatearFechaHora } from "./fechas";

const API = "http://localhost:3000";

export function Viajes() {
  const { fetchAuth } = useAuth();
  const [modo, setModo] = useState("todos"); // todos | vehiculo | conductor
  const [seleccion, setSeleccion] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [errorBaja, setErrorBaja] = useState(null);

  const vehiculos = useCargar(`${API}/vehiculos`);
  const conductores = useCargar(`${API}/conductores`);

  const parametro = modo === "vehiculo" ? "vehiculoId" : "conductorId";
  const hayFiltro = modo !== "todos" && seleccion !== "";
  const consulta = hayFiltro ? `?${parametro}=${seleccion}` : "";

  const viajes = useCargar(
    modo === "todos" || hayFiltro ? `${API}/viajes${consulta}` : null,
    recarga,
  );
  const totales = useCargar(
    hayFiltro ? `${API}/viajes/kilometros${consulta}` : null,
    recarga,
  );

  const opciones =
    modo === "vehiculo"
      ? (vehiculos.datos ?? []).map((v) => ({
          id: v.id,
          texto: `${v.patente} - ${v.marca} ${v.modelo}`,
        }))
      : (conductores.datos ?? []).map((c) => ({
          id: c.id,
          texto: `${c.apellido}, ${c.nombre}`,
        }));

  const cambiarModo = (e) => {
    setModo(e.target.value);
    setSeleccion("");
    setErrorBaja(null);
  };

  const eliminar = async (viaje) => {
    if (
      !window.confirm(`¿Eliminar el viaje ${viaje.origen} → ${viaje.destino}?`)
    ) {
      return;
    }

    try {
      const response = await fetchAuth(`${API}/viajes/${viaje.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setErrorBaja(await leerError(response));
        return;
      }
      setErrorBaja(null);
      setRecarga((r) => r + 1);
    } catch (err) {
      setErrorBaja(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor"
          : err.message,
      );
    }
  };

  const error =
    errorBaja ||
    vehiculos.error ||
    conductores.error ||
    viajes.error ||
    totales.error;

  return (
    <>
      <div className="cabecera">
        <h2>Viajes</h2>
        <Link className="enlace-boton" to="/viajes/crear">
          Registrar viaje
        </Link>
      </div>

      <div className="filtros">
        <div>
          <label htmlFor="modo">Consultar por:</label>
          <select id="modo" value={modo} onChange={cambiarModo}>
            <option value="todos">Todos los viajes</option>
            <option value="vehiculo">Vehículo</option>
            <option value="conductor">Conductor</option>
          </select>
        </div>

        {modo !== "todos" && (
          <div>
            <label htmlFor="seleccion">
              {modo === "vehiculo" ? "Vehículo:" : "Conductor:"}
            </label>
            <select
              id="seleccion"
              value={seleccion}
              onChange={(e) => setSeleccion(e.target.value)}
            >
              <option value="">Seleccioná...</option>
              {opciones.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.texto}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {totales.datos && (
        <p className="resumen">
          Total recorrido:{" "}
          <strong>
            {Number(totales.datos.totalKilometros).toLocaleString("es-AR")} km
          </strong>{" "}
          en {totales.datos.cantidadViajes}{" "}
          {totales.datos.cantidadViajes === 1 ? "viaje" : "viajes"}.
        </p>
      )}

      {modo !== "todos" && !hayFiltro && (
        <p>
          Elegí un {modo === "vehiculo" ? "vehículo" : "conductor"} para ver su
          historial y el total de kilómetros.
        </p>
      )}

      {viajes.cargando && <p>Cargando...</p>}

      {viajes.datos && viajes.datos.length === 0 && (
        <p>No hay viajes registrados para esta consulta.</p>
      )}

      {viajes.datos && viajes.datos.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Km</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.datos.map((v) => (
                <tr key={v.id}>
                  <td>{formatearFechaHora(v.fechaSalida)}</td>
                  <td>{formatearFechaHora(v.fechaLlegada)}</td>
                  <td>{v.vehiculo}</td>
                  <td>{v.conductor}</td>
                  <td>{v.origen}</td>
                  <td>{v.destino}</td>
                  <td>{v.kilometros}</td>
                  <td>{v.observaciones || "-"}</td>
                  <td>
                    <div className="acciones">
                      <Link className="enlace-boton" to={`/viajes/${v.id}`}>
                        Modificar
                      </Link>
                      <button
                        className="boton-peligro"
                        onClick={() => eliminar(v)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}