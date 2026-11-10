import { useNavigate } from "react-router";
import { useAuth } from "./Auth";
import { leerError } from "./errores";
import { VehiculoForm } from "./VehiculoForm";

export function VehiculoCrear() {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const guardar = async (datos) => {
    try {
      const response = await fetchAuth("http://localhost:3000/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!response.ok) {
        return { ok: false, mensaje: await leerError(response) };
      }
      navigate("/vehiculos");
      return { ok: true };
    } catch {
      return { ok: false, mensaje: "No se pudo conectar con el servidor" };
    }
  };

  return (
    <>
      <h2>Nuevo vehículo</h2>
      <VehiculoForm onGuardar={guardar} textoBoton="Crear" />
    </>
  );
}