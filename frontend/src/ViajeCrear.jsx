import { useNavigate } from "react-router";
import { useAuth } from "./Auth";
import { leerError } from "./errores";
import { ViajeForm } from "./ViajeForm";

export function ViajeCrear() {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const guardar = async (datos) => {
    try {
      const response = await fetchAuth("http://localhost:3000/viajes", {
        method: "POST",
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

  return (
    <>
      <h2>Registrar viaje</h2>
      <ViajeForm onGuardar={guardar} textoBoton="Registrar" />
    </>
  );
}