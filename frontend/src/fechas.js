// "2030-03-15" -> "15/03/2030"
export function formatearFecha(fecha) {
  return fecha.split("-").reverse().join("/");
}

// Fecha de hoy en formato AAAA-MM-DD (hora local)
export function hoy() {
  return new Date().toLocaleDateString("sv-SE");
}

// "2026-11-01 08:00:00" -> "01/11/2026 08:00"
export function formatearFechaHora(fechaHora) {
  const [fecha, hora] = fechaHora.split(" ");
  return `${formatearFecha(fecha)} ${hora.slice(0, 5)}`;
}

// "2026-11-01 08:00:00" -> "2026-11-01T08:00" (formato de datetime-local)
export function aInputFechaHora(fechaHora) {
  return fechaHora.slice(0, 16).replace(" ", "T");
}