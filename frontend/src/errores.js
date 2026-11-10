// Lee el mensaje de error de una respuesta fallida de la API.
// El backend devuelve { mensaje } y, si falló express-validator,
// además { errores: [{ msg }] }
export async function leerError(response) {
  try {
    const cuerpo = await response.json();
    if (cuerpo.errores?.length) {
      return cuerpo.errores.map((e) => e.msg).join(". ");
    }
    return cuerpo.mensaje || "Ocurrió un error";
  } catch {
    return "Ocurrió un error";
  }
}