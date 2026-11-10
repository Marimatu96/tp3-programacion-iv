// "2030-03-15" -> "15/03/2030"
export function formatearFecha(fecha) {
  return fecha.split("-").reverse().join("/");
}

// Fecha de hoy en formato AAAA-MM-DD (hora local)
export function hoy() {
  return new Date().toLocaleDateString("sv-SE");
}