import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Layout() {
  const { isAuthenticated, nombre, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <main>
      <nav>
        <ul>
          <li className={pathname === "/" ? "active" : ""}>
            <Link to="/">Inicio</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="usuario">{nombre}</li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Salir
                </button>
              </li>
            </>
          ) : (
            <li className={pathname.startsWith("/login") ? "active" : ""}>
              <Link to="/login">Ingresar</Link>
            </li>
          )}
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}