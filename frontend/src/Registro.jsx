import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { leerError } from "./errores";

export function Registro() {
  const [datos, setDatos] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    repetir: "",
  });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  const cambiar = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const nuevos = {};

    if (!datos.nombre.trim()) {
      nuevos.nombre = "El nombre es obligatorio";
    } else if (datos.nombre.trim().length > 100) {
      nuevos.nombre = "El nombre admite hasta 100 caracteres";
    }

    if (!datos.email.trim()) {
      nuevos.email = "El email es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
      nuevos.email = "El email no tiene un formato válido";
    } else if (datos.email.trim().length > 100) {
      nuevos.email = "El email admite hasta 100 caracteres";
    }

    if (!datos.contrasena) {
      nuevos.contrasena = "La contraseña es obligatoria";
    } else if (datos.contrasena.length < 8 || datos.contrasena.length > 72) {
      nuevos.contrasena = "La contraseña debe tener entre 8 y 72 caracteres";
    }

    if (datos.repetir !== datos.contrasena) {
      nuevos.repetir = "Las contraseñas no coinciden";
    }

    return nuevos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor(null);

    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setGuardando(true);
    try {
      const response = await fetch("http://localhost:3000/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.nombre.trim(),
          email: datos.email.trim(),
          contrasena: datos.contrasena,
        }),
      });

      if (!response.ok) {
        setErrorServidor(await leerError(response));
        return;
      }

      navigate("/login", { state: { registrado: true } });
    } catch {
      setErrorServidor("No se pudo conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          name="nombre"
          value={datos.nombre}
          onChange={cambiar}
        />
        {errores.nombre && <p className="error">{errores.nombre}</p>}

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={datos.email}
          onChange={cambiar}
        />
        {errores.email && <p className="error">{errores.email}</p>}

        <label htmlFor="contrasena">Contraseña:</label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          value={datos.contrasena}
          onChange={cambiar}
        />
        {errores.contrasena && <p className="error">{errores.contrasena}</p>}

        <label htmlFor="repetir">Repetir contraseña:</label>
        <input
          id="repetir"
          name="repetir"
          type="password"
          value={datos.repetir}
          onChange={cambiar}
        />
        {errores.repetir && <p className="error">{errores.repetir}</p>}

        {errorServidor && <p className="error">{errorServidor}</p>}

        <div className="acciones">
          <button type="submit" disabled={guardando}>
            Registrarme
          </button>
          <Link to="/login">
            <button type="button">Cancelar</button>
          </Link>
        </div>
      </form>
    </>
  );
}