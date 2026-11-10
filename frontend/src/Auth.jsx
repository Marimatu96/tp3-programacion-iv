import { createContext, useCallback, useContext, useState } from "react";

// Contexto para compartir el estado de autenticación
const AuthContext = createContext(null);

// Hook personalizado para acceder al contexto de auth
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, contrasena) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contrasena }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.mensaje || "No se pudo iniciar sesión");
      }

      setToken(session.token);
      setNombre(session.nombre);
      return { success: true };
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor"
          : err.message,
      );
      return { success: false };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setNombre(null);
    setError(null);
  }, []);

  // fetch que agrega el token; si el servidor responde 401 (token vencido
  // o inválido) se cierra la sesión
  const fetchAuth = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("No está iniciada la sesión");
      }

      const response = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout();
      }
      return response;
    },
    [token, logout],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        nombre,
        error,
        isAuthenticated: !!token,
        login,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};