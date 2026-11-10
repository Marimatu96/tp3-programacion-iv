import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";
import { leerError } from "./errores";
import { ConductorForm } from "./ConductorForm";

export function ConductorDetalles() {
  const { id } = useParams();
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [conductor, setConductor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    fetchAuth(`http://localhost:3000/conductores/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await leerError(response));
        return response.json();
      })
      .then((datos) => {
        if (!cancelado) setConductor(datos);
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
        `http://localhost:3000/conductores/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        },
      );
      if (!response.ok) {
        return { ok: false, mensaje: await leerError(response) };
      }
      navigate("/conductores");
      return { ok: true };
    } catch {
      return { ok: false, mensaje: "No se pudo conectar con el servidor" };
    }
  };

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/conductores">Volver al listado</Link>
      </>
    );
  }

  if (!conductor) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <h2>Modificar conductor</h2>
      <ConductorForm
        inicial={{
          nombre: conductor.nombre,
          apellido: conductor.apellido,
          numeroDocumento: conductor.numeroDocumento,
          numeroLicencia: conductor.numeroLicencia,
          fechaAltaLicencia: conductor.fechaAltaLicencia,
          fechaVencimientoLicencia: conductor.fechaVencimientoLicencia,
        }}
        onGuardar={guardar}
        textoBoton="Guardar cambios"
      />
    </>
  );
}