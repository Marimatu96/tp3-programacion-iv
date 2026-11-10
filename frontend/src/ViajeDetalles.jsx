import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";
import { useCargar } from "./useCargar";
import { leerError } from "./errores";
import { aInputFechaHora } from "./fechas";
import { ViajeForm } from "./ViajeForm";

export function ViajeDetalles() {
  const { id } = useParams();
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const {
    datos: viaje,
    error,
    cargando,
  } = useCargar(`http://localhost:3000/viajes/${id}`);

  const guardar = async (datos) => {
    try {
      const response = await fetchAuth(`http://localhost:3000/viajes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!response.ok) {
        return { ok: false, mensaje: await leerError(response) };
      }
      navigate("/viajes");
      return { ok: true };
    } catch {
      return { ok: false, mensaje: "No se pudo conectar con el servidor" };
    }
  };

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/viajes">Volver al listado</Link>
      </>
    );
  }

  if (cargando || !viaje) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <h2>Modificar viaje</h2>
      <ViajeForm
        inicial={{
          vehiculoId: String(viaje.vehiculoId),
          conductorId: String(viaje.conductorId),
          fechaSalida: aInputFechaHora(viaje.fechaSalida),
          fechaLlegada: aInputFechaHora(viaje.fechaLlegada),
          origen: viaje.origen,
          destino: viaje.destino,
          kilometros: viaje.kilometros,
          observaciones: viaje.observaciones ?? "",
        }}
        onGuardar={guardar}
        textoBoton="Guardar cambios"
      />
    </>
  );
}