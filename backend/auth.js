import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { db } from "./db.js";
import {
  validarRegistro,
  validarLogin,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Configuración de Passport con estrategia JWT
export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, (payload, next) => {
      // Si llegamos acá, el token es válido y no venció
      next(null, payload);
    }),
  );
}

// POST /auth/registro
router.post(
  "/registro",
  validarRegistro,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, email, contrasena } = req.body;

      const [existentes] = await db.execute(
        "SELECT id FROM usuarios WHERE email = ?",
        [email],
      );
      if (existentes.length > 0) {
        return res.status(400).json({ mensaje: "El email ya está registrado" });
      }

      // La contraseña se guarda encriptada, nunca en texto plano
      const hash = await bcrypt.hash(contrasena, 10);

      const [result] = await db.execute(
        "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?,?,?)",
        [nombre, email, hash],
      );

      res.status(201).json({ id: result.insertId, nombre, email });
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },
);

// POST /auth/login
router.post("/login", validarLogin, verificarValidaciones, async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const [usuarios] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    // Mismo mensaje en ambos casos para no revelar si el email existe
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const passwordCorrecta = await bcrypt.compare(
      contrasena,
      usuarios[0].contrasena,
    );
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = jwt.sign({ userId: usuarios[0].id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({ token, nombre: usuarios[0].nombre, email: usuarios[0].email });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

export default router;