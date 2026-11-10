import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Home() {
  const { isAuthenticated, nombre } = useAuth();

  return (
    <>
      <h1>Gestión de transporte</h1>
      <p>
        Aplicación para registrar los vehículos de una empresa de transporte,
        sus conductores y los viajes realizados.
      </p>
      {isAuthenticated ? (
        <p>Bienvenido/a, {nombre}.</p>
      ) : (
        <p>
          Para acceder a la gestión, <Link to="/login">iniciá sesión</Link>.
        </p>
      )}
    </>
  );
}