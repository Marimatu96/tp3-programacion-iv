import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT_CONDUCTOR =
  "SELECT id, nombre, apellido, " +
  "numero_documento AS numeroDocumento, " +
  "numero_licencia AS numeroLicencia, " +
  "fecha_alta_licencia AS fechaAltaLicencia, " +
  "fecha_vencimiento_licencia AS fechaVencimientoLicencia " +
  "FROM conductores";

// Traduce un error de clave duplicada a un mensaje claro
function mensajeDuplicado(e) {
  return e.sqlMessage.includes("numero_licencia")
    ? "El número de licencia ya está registrado"
    : "El número de documento ya está registrado";
}

// GET /conductores: listado
router.get("/", validarAutenticacion, async (req, res) => {
  try {
    const [conductores] = await db.execute(SELECT_CONDUCTOR + " ORDER BY id");
    res.json(conductores);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// GET /conductores/:id: detalle
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [conductores] = await db.execute(SELECT_CONDUCTOR + " WHERE id = ?", [
        Number(req.params.id),
      ]);
      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }
      res.json(conductores[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// POST /conductores: alta
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      } = req.body;
      const [result] = await db.execute(
        "INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?,?,?,?,?,?)",
        [nombre, apellido, numeroDocumento, numeroLicencia, fechaAltaLicencia, fechaVencimientoLicencia],
      );
      res.status(201).json({
        id: result.insertId,
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ mensaje: mensajeDuplicado(e) });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// PUT /conductores/:id: modificación
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      } = req.body;
      const [result] = await db.execute(
        "UPDATE conductores SET nombre=?, apellido=?, numero_documento=?, numero_licencia=?, fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?",
        [nombre, apellido, numeroDocumento, numeroLicencia, fechaAltaLicencia, fechaVencimientoLicencia, id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }
      res.json({
        id,
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ mensaje: mensajeDuplicado(e) });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// DELETE /conductores/:id: baja
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [result] = await db.execute("DELETE FROM conductores WHERE id = ?", [
        Number(req.params.id),
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }
      res.status(204).send();
    } catch (e) {
      if (e.code === "ER_ROW_IS_REFERENCED_2") {
        return res
          .status(400)
          .json({ mensaje: "No se puede eliminar: el conductor tiene viajes registrados" });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

export default router;