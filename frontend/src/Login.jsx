import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Login() {
  const { error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();
  const { state } = useLocation();

  const validar = () => {
    const nuevos = {};
    if (!email.trim()) {
      nuevos.email = "El email es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nuevos.email = "El email no tiene un formato válido";
    }
    if (!contrasena) {
      nuevos.contrasena = "La contraseña es obligatoria";
    }
    return nuevos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    const res = await login(email.trim(), contrasena);
    if (res.success) {
      navigate("/");
    }
  };

  return (
    <>
      <h2>Ingresar</h2>
      {state?.registrado && (
        <p className="exito">Cuenta creada. Ya podés ingresar.</p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errores.email && <p className="error">{errores.email}</p>}

        <label htmlFor="contrasena">Contraseña:</label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        {errores.contrasena && <p className="error">{errores.contrasena}</p>}

        {error && <p className="error">{error}</p>}

        <div className="acciones">
          <button type="submit">Ingresar</button>
          <Link to="/">
            <button type="button">Volver</button>
          </Link>
        </div>
      </form>
      <p>
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </>
  );
}