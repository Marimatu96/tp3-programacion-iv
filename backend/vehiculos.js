import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT_VEHICULO =
  "SELECT id, marca, modelo, patente, anio, capacidad_carga AS capacidadCarga FROM vehiculos";

// GET /vehiculos: listado
router.get("/", validarAutenticacion, async (req, res) => {
  try {
    const [vehiculos] = await db.execute(SELECT_VEHICULO + " ORDER BY id");
    res.json(vehiculos);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// GET /vehiculos/:id: detalle
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [vehiculos] = await db.execute(SELECT_VEHICULO + " WHERE id = ?", [
        Number(req.params.id),
      ]);
      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }
      res.json(vehiculos[0]);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// POST /vehiculos: alta
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { marca, modelo, patente, anio, capacidadCarga } = req.body;
      const [result] = await db.execute(
        "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)",
        [marca, modelo, patente, anio, capacidadCarga],
      );
      res
        .status(201)
        .json({ id: result.insertId, marca, modelo, patente, anio, capacidadCarga });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ mensaje: "La patente ya está registrada" });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// PUT /vehiculos/:id: modificación
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { marca, modelo, patente, anio, capacidadCarga } = req.body;
      const [result] = await db.execute(
        "UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?",
        [marca, modelo, patente, anio, capacidadCarga, id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }
      res.json({ id, marca, modelo, patente, anio, capacidadCarga });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ mensaje: "La patente ya está registrada" });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// DELETE /vehiculos/:id: baja
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const [result] = await db.execute("DELETE FROM vehiculos WHERE id = ?", [
        Number(req.params.id),
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }
      res.status(204).send();
    } catch (e) {
      if (e.code === "ER_ROW_IS_REFERENCED_2") {
        return res
          .status(400)
          .json({ mensaje: "No se puede eliminar: el vehículo tiene viajes registrados" });
      }
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

export default router;