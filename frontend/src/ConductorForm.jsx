import { useState } from "react";
import { Link } from "react-router";

const NOMBRE = /^[\p{L} '-]{1,50}$/u;

const VACIO = {
  nombre: "",
  apellido: "",
  numeroDocumento: "",
  numeroLicencia: "",
  fechaAltaLicencia: "",
  fechaVencimientoLicencia: "",
};

export function ConductorForm({ inicial = VACIO, onGuardar, textoBoton }) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const nuevos = {};

    if (!datos.nombre.trim()) {
      nuevos.nombre = "El nombre es obligatorio";
    } else if (!NOMBRE.test(datos.nombre.trim())) {
      nuevos.nombre = "Solo letras, hasta 50 caracteres";
    }

    if (!datos.apellido.trim()) {
      nuevos.apellido = "El apellido es obligatorio";
    } else if (!NOMBRE.test(datos.apellido.trim())) {
      nuevos.apellido = "Solo letras, hasta 50 caracteres";
    }

    if (!datos.numeroDocumento.trim()) {
      nuevos.numeroDocumento = "El número de documento es obligatorio";
    } else if (!/^\d{7,8}$/.test(datos.numeroDocumento.trim())) {
      nuevos.numeroDocumento = "Debe tener 7 u 8 dígitos, sin puntos";
    }

    if (!datos.numeroLicencia.trim()) {
      nuevos.numeroLicencia = "El número de licencia es obligatorio";
    } else if (!/^[A-Za-z0-9]{5,20}$/.test(datos.numeroLicencia.trim())) {
      nuevos.numeroLicencia = "Debe ser alfanumérico (5 a 20 caracteres)";
    }

    if (!datos.fechaAltaLicencia) {
      nuevos.fechaAltaLicencia = "La fecha de alta es obligatoria";
    }

    if (!datos.fechaVencimientoLicencia) {
      nuevos.fechaVencimientoLicencia = "La fecha de vencimiento es obligatoria";
    } else if (
      datos.fechaAltaLicencia &&
      datos.fechaVencimientoLicencia <= datos.fechaAltaLicencia
    ) {
      nuevos.fechaVencimientoLicencia =
        "El vencimiento debe ser posterior a la fecha de alta";
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
    const res = await onGuardar({
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      numeroDocumento: datos.numeroDocumento.trim(),
      numeroLicencia: datos.numeroLicencia.trim(),
      fechaAltaLicencia: datos.fechaAltaLicencia,
      fechaVencimientoLicencia: datos.fechaVencimientoLicencia,
    });
    setGuardando(false);

    if (!res.ok) {
      setErrorServidor(res.mensaje);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="nombre">Nombre:</label>
      <input id="nombre" name="nombre" value={datos.nombre} onChange={cambiar} />
      {errores.nombre && <p className="error">{errores.nombre}</p>}

      <label htmlFor="apellido">Apellido:</label>
      <input
        id="apellido"
        name="apellido"
        value={datos.apellido}
        onChange={cambiar}
      />
      {errores.apellido && <p className="error">{errores.apellido}</p>}

      <label htmlFor="numeroDocumento">Número de documento:</label>
      <input
        id="numeroDocumento"
        name="numeroDocumento"
        value={datos.numeroDocumento}
        onChange={cambiar}
      />
      {errores.numeroDocumento && (
        <p className="error">{errores.numeroDocumento}</p>
      )}

      <label htmlFor="numeroLicencia">Número de licencia:</label>
      <input
        id="numeroLicencia"
        name="numeroLicencia"
        value={datos.numeroLicencia}
        onChange={cambiar}
      />
      {errores.numeroLicencia && (
        <p className="error">{errores.numeroLicencia}</p>
      )}

      <label htmlFor="fechaAltaLicencia">Fecha de alta de la licencia:</label>
      <input
        id="fechaAltaLicencia"
        name="fechaAltaLicencia"
        type="date"
        value={datos.fechaAltaLicencia}
        onChange={cambiar}
      />
      {errores.fechaAltaLicencia && (
        <p className="error">{errores.fechaAltaLicencia}</p>
      )}

      <label htmlFor="fechaVencimientoLicencia">
        Fecha de vencimiento de la licencia:
      </label>
      <input
        id="fechaVencimientoLicencia"
        name="fechaVencimientoLicencia"
        type="date"
        value={datos.fechaVencimientoLicencia}
        onChange={cambiar}
      />
      {errores.fechaVencimientoLicencia && (
        <p className="error">{errores.fechaVencimientoLicencia}</p>
      )}

      {errorServidor && <p className="error">{errorServidor}</p>}

      <div className="acciones">
        <button type="submit" disabled={guardando}>
          {textoBoton}
        </button>
        <Link to="/conductores">
          <button type="button">Cancelar</button>
        </Link>
      </div>
    </form>
  );
}