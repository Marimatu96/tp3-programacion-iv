import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";
import { leerError } from "./errores";
import { VehiculoForm } from "./VehiculoForm";

export function VehiculoDetalles() {
  const { id } = useParams();
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    fetchAuth(`http://localhost:3000/vehiculos/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await leerError(response));
        return response.json();
      })
      .then((datos) => {
        if (!cancelado) setVehiculo(datos);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof TypeError
            ? "No se pudo conectar con el servidor"
            : err.message,
        );
      });

    return () => {
      cancelado = true;
    };
  }, [id, fetchAuth]);

  const guardar = async (datos) => {
    try {
      const response = await fetchAuth(
        `http://localhost:3000/vehiculos/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        },
      );
      if (!response.ok) {
        return { ok: false, mensaje: await leerError(response) };
      }
      navigate("/vehiculos");
      return { ok: true };
    } catch {
      return { ok: false, mensaje: "No se pudo conectar con el servidor" };
    }
  };

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/vehiculos">Volver al listado</Link>
      </>
    );
  }

  if (!vehiculo) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <h2>Modificar vehículo</h2>
      <VehiculoForm
        inicial={{
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          patente: vehiculo.patente,
          anio: vehiculo.anio,
          capacidadCarga: vehiculo.capacidadCarga,
        }}
        onGuardar={guardar}
        textoBoton="Guardar cambios"
      />
    </>
  );
}