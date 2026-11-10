import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";
import { leerError } from "./errores";

export function Vehiculos() {
  const { fetchAuth } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    fetchAuth("http://localhost:3000/vehiculos")
      .then(async (response) => {
        if (!response.ok) throw new Error(await leerError(response));
        return response.json();
      })
      .then((datos) => {
        if (cancelado) return;
        setVehiculos(datos);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof TypeError
            ? "No se pudo conectar con el servidor"
            : err.message,
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [fetchAuth, recarga]);

  const eliminar = async (vehiculo) => {
    if (!window.confirm(`¿Eliminar el vehículo ${vehiculo.patente}?`)) return;

    try {
      const response = await fetchAuth(
        `http://localhost:3000/vehiculos/${vehiculo.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setError(await leerError(response));
        return;
      }
      setRecarga((r) => r + 1);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor"
          : err.message,
      );
    }
  };

  return (
    <>
      <div className="cabecera">
        <h2>Vehículos</h2>
        <Link className="enlace-boton" to="/vehiculos/crear">
          Nuevo vehículo
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {!cargando && vehiculos.length === 0 && !error && (
        <p>No hay vehículos registrados.</p>
      )}

      {vehiculos.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Patente</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Capacidad (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.patente}</td>
                  <td>{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>{v.anio}</td>
                  <td>{v.capacidadCarga}</td>
                  <td>
                    <div className="acciones">
                      <Link className="enlace-boton" to={`/vehiculos/${v.id}`}>
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