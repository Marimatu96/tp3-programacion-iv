import { useState } from "react";
import { Link } from "react-router";
import { useCargar } from "./useCargar";

const API = "http://localhost:3000";

const VACIO = {
  vehiculoId: "",
  conductorId: "",
  fechaSalida: "",
  fechaLlegada: "",
  origen: "",
  destino: "",
  kilometros: "",
  observaciones: "",
};

export function ViajeForm({ inicial = VACIO, onGuardar, textoBoton }) {
  const vehiculos = useCargar(`${API}/vehiculos`);
  const conductores = useCargar(`${API}/conductores`);
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const nuevos = {};

    if (!datos.vehiculoId) nuevos.vehiculoId = "Elegí un vehículo";
    if (!datos.conductorId) nuevos.conductorId = "Elegí un conductor";

    if (!datos.fechaSalida) {
      nuevos.fechaSalida = "La fecha y hora de salida son obligatorias";
    }

    if (!datos.fechaLlegada) {
      nuevos.fechaLlegada = "La fecha y hora de llegada son obligatorias";
    } else if (datos.fechaSalida && datos.fechaLlegada < datos.fechaSalida) {
      nuevos.fechaLlegada = "La llegada no puede ser anterior a la salida";
    }

    if (!datos.origen.trim()) {
      nuevos.origen = "El origen es obligatorio";
    } else if (datos.origen.trim().length > 100) {
      nuevos.origen = "El origen admite hasta 100 caracteres";
    }

    if (!datos.destino.trim()) {
      nuevos.destino = "El destino es obligatorio";
    } else if (datos.destino.trim().length > 100) {
      nuevos.destino = "El destino admite hasta 100 caracteres";
    }

    if (String(datos.kilometros).trim() === "") {
      nuevos.kilometros = "Los kilómetros son obligatorios";
    } else if (Number(datos.kilometros) <= 0) {
      nuevos.kilometros = "Los kilómetros deben ser mayores a 0";
    }

    if (datos.observaciones.trim().length > 1000) {
      nuevos.observaciones = "Las observaciones admiten hasta 1000 caracteres";
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
      vehiculoId: Number(datos.vehiculoId),
      conductorId: Number(datos.conductorId),
      fechaSalida: datos.fechaSalida,
      fechaLlegada: datos.fechaLlegada,
      origen: datos.origen.trim(),
      destino: datos.destino.trim(),
      kilometros: Number(datos.kilometros),
      observaciones: datos.observaciones.trim() || null,
    });
    setGuardando(false);

    if (!res.ok) {
      setErrorServidor(res.mensaje);
    }
  };

  if (vehiculos.cargando || conductores.cargando) {
    return <p>Cargando...</p>;
  }

  if (vehiculos.error || conductores.error) {
    return <p className="error">{vehiculos.error || conductores.error}</p>;
  }

  if (vehiculos.datos.length === 0 || conductores.datos.length === 0) {
    return (
      <p>
        Para registrar un viaje primero tiene que haber al menos un{" "}
        <Link to="/vehiculos">vehículo</Link> y un{" "}
        <Link to="/conductores">conductor</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="vehiculoId">Vehículo:</label>
      <select
        id="vehiculoId"
        name="vehiculoId"
        value={datos.vehiculoId}
        onChange={cambiar}
      >
        <option value="">Seleccioná un vehículo...</option>
        {vehiculos.datos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.patente} - {v.marca} {v.modelo}
          </option>
        ))}
      </select>
      {errores.vehiculoId && <p className="error">{errores.vehiculoId}</p>}

      <label htmlFor="conductorId">Conductor:</label>
      <select
        id="conductorId"
        name="conductorId"
        value={datos.conductorId}
        onChange={cambiar}
      >
        <option value="">Seleccioná un conductor...</option>
        {conductores.datos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.apellido}, {c.nombre}
          </option>
        ))}
      </select>
      {errores.conductorId && <p className="error">{errores.conductorId}</p>}

      <label htmlFor="fechaSalida">Fecha y hora de salida:</label>
      <input
        id="fechaSalida"
        name="fechaSalida"
        type="datetime-local"
        value={datos.fechaSalida}
        onChange={cambiar}
      />
      {errores.fechaSalida && <p className="error">{errores.fechaSalida}</p>}

      <label htmlFor="fechaLlegada">Fecha y hora de llegada:</label>
      <input
        id="fechaLlegada"
        name="fechaLlegada"
        type="datetime-local"
        value={datos.fechaLlegada}
        onChange={cambiar}
      />
      {errores.fechaLlegada && <p className="error">{errores.fechaLlegada}</p>}

      <label htmlFor="origen">Origen:</label>
      <input
        id="origen"
        name="origen"
        value={datos.origen}
        onChange={cambiar}
      />
      {errores.origen && <p className="error">{errores.origen}</p>}

      <label htmlFor="destino">Destino:</label>
      <input
        id="destino"
        name="destino"
        value={datos.destino}
        onChange={cambiar}
      />
      {errores.destino && <p className="error">{errores.destino}</p>}

      <label htmlFor="kilometros">Kilómetros recorridos:</label>
      <input
        id="kilometros"
        name="kilometros"
        type="number"
        step="0.01"
        value={datos.kilometros}
        onChange={cambiar}
      />
      {errores.kilometros && <p className="error">{errores.kilometros}</p>}

      <label htmlFor="observaciones">Observaciones (opcional):</label>
      <textarea
        id="observaciones"
        name="observaciones"
        rows="3"
        value={datos.observaciones}
        onChange={cambiar}
      />
      {errores.observaciones && (
        <p className="error">{errores.observaciones}</p>
      )}

      {errorServidor && <p className="error">{errorServidor}</p>}

      <div className="acciones">
        <button type="submit" disabled={guardando}>
          {textoBoton}
        </button>
        <Link to="/viajes">
          <button type="button">Cancelar</button>
        </Link>
      </div>
    </form>
  );
}