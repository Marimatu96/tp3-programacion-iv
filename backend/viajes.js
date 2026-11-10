import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarViaje,
  validarFiltrosViajes,
  validarFiltroKilometros,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Un viaje con los datos del vehículo y del conductor (JOIN)
const SELECT_VIAJE =
  "SELECT v.id, v.vehiculo_id AS vehiculoId, " +
  "CONCAT(ve.marca, ' ', ve.modelo, ' (', ve.patente, ')') AS vehiculo, " +
  "v.conductor_id AS conductorId, " +
  "CONCAT(c.apellido, ', ', c.nombre) AS conductor, " +
  "v.fecha_salida AS fechaSalida, v.fecha_llegada AS fechaLlegada, " +
  "v.origen, v.destino, v.kilometros, v.observaciones " +
  "FROM viajes v " +
  "JOIN vehiculos ve ON v.vehiculo_id = ve.id " +
  "JOIN conductores c ON v.conductor_id = c.id";

// Verifica que existan el vehículo y el conductor, y que la licencia
// del conductor estuviera vigente el día de la salida.
// Devuelve null si está todo bien, o { status, mensaje } si hay un problema.
async function verificarReferencias(vehiculoId, conductorId, fechaSalida) {
  const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [
    vehiculoId,
  ]);
  if (vehiculos.length === 0) {
    return { status: 400, mensaje: "El vehículo indicado no existe" };
  }

  const [conductores] = await db.execute(
    "SELECT fecha_alta_licencia AS alta, fecha_vencimiento_licencia AS vencimiento FROM conductores WHERE id = ?",
    [conductorId],
  );
  if (conductores.length === 0) {
    return { status: 400, mensaje: "El conductor indicado no existe" };
  }

  const dia = fechaSalida.slice(0, 10);
  const { alta, vencimiento } = conductores[0];
  if (dia < alta || dia > vencimiento) {
    return {
      status: 403,
      mensaje: "La licencia del conductor no estaba vigente en la fecha de salida",
    };
  }
  return null;
}

// GET /viajes: historial (opcionalmente filtrado por vehículo y/o conductor)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    try {
      const filtros = [];
      const parametros = [];
      const { vehiculoId, conductorId } = req.query;

      if (vehiculoId) {
        filtros.push("v.vehiculo_id = ?");
        parametros.push(Number(vehiculoId));
      }
      if (conductorId) {
        filtros.push("v.conductor_id = ?");
        parametros.push(Number(conductorId));
      }

      let sql = SELECT_VIAJE;
      if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
      }
      sql += " ORDER BY v.fecha_salida DESC";

      const [viajes] = await db.execute(sql, parametros);
      res.json(viajes);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// GET /viajes/kilometros?vehiculoId=1 o ?conductorId=1: total de km
// (va ANTES de "/:id", si no Express tomaría "kilometros" como un id)
router.get(
  "/kilometros",
  validarAutenticacion,
  validarFiltroKilometros,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { vehiculoId, conductorId } = req.query;
      const columna = vehiculoId ? "vehiculo_id" : "conductor_id";
      const valor = Number(vehiculoId || conductorId);

      const [filas] = await db.execute(
        `SELECT COALESCE(SUM(kilometros), 0) AS totalKilometros, COUNT(*) AS cantidadViajes FROM viajes WHERE ${columna} = ?`,
        [valor],
      );
      res.json(filas[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// GET /viajes/:id: detalle
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [viajes] = await db.execute(SELECT_VIAJE + " WHERE v.id = ?", [
        Number(req.params.id),
      ]);
      if (viajes.length === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }
      res.json(viajes[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// POST /viajes: registro de un viaje
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        vehiculoId,
        conductorId,
        fechaSalida,
        fechaLlegada,
        origen,
        destino,
        kilometros,
        observaciones,
      } = req.body;

      const problema = await verificarReferencias(vehiculoId, conductorId, fechaSalida);
      if (problema) {
        return res.status(problema.status).json({ mensaje: problema.mensaje });
      }

      const [result] = await db.execute(
        "INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES (?,?,?,?,?,?,?,?)",
        [
          vehiculoId,
          conductorId,
          fechaSalida.replace("T", " "),
          fechaLlegada.replace("T", " "),
          origen,
          destino,
          kilometros,
          observaciones ?? null,
        ],
      );

      const [viajes] = await db.execute(SELECT_VIAJE + " WHERE v.id = ?", [
        result.insertId,
      ]);
      res.status(201).json(viajes[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// PUT /viajes/:id: modificación
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        vehiculoId,
        conductorId,
        fechaSalida,
        fechaLlegada,
        origen,
        destino,
        kilometros,
        observaciones,
      } = req.body;

      const problema = await verificarReferencias(vehiculoId, conductorId, fechaSalida);
      if (problema) {
        return res.status(problema.status).json({ mensaje: problema.mensaje });
      }

      const [result] = await db.execute(
        "UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, origen=?, destino=?, kilometros=?, observaciones=? WHERE id=?",
        [
          vehiculoId,
          conductorId,
          fechaSalida.replace("T", " "),
          fechaLlegada.replace("T", " "),
          origen,
          destino,
          kilometros,
          observaciones ?? null,
          id,
        ],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }

      const [viajes] = await db.execute(SELECT_VIAJE + " WHERE v.id = ?", [id]);
      res.json(viajes[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// DELETE /viajes/:id: baja
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [result] = await db.execute("DELETE FROM viajes WHERE id = ?", [
        Number(req.params.id),
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }
      res.status(204).send();
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

export default router;