import { useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { leerError } from "./errores";

// Pide datos (GET) a la API con el token de la sesión.
// Si url es null, no pide nada. Cambiar "recarga" fuerza una nueva petición.
export function useCargar(url, recarga = 0) {
  const { fetchAuth } = useAuth();
  const [resultado, setResultado] = useState({
    clave: null,
    datos: null,
    error: null,
  });
  const clave = `${url}|${recarga}`;

  useEffect(() => {
    if (!url) return;
    let cancelado = false;

    fetchAuth(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(await leerError(response));
        return response.json();
      })
      .then((datos) => {
        if (!cancelado) setResultado({ clave, datos, error: null });
      })
      .catch((err) => {
        if (cancelado) return;
        const error =
          err instanceof TypeError
            ? "No se pudo conectar con el servidor"
            : err.message;
        setResultado({ clave, datos: null, error });
      });

    return () => {
      cancelado = true;
    };
  }, [url, clave, fetchAuth]);

  // El resultado guardado solo vale si corresponde a la petición actual
  const vigente = resultado.clave === clave;
  return {
    datos: vigente ? resultado.datos : null,
    error: vigente ? resultado.error : null,
    cargando: Boolean(url) && !vigente,
  };
}