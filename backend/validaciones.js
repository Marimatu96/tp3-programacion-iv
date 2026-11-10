import { body, param, validationResult } from "express-validator";
import passport from "passport";

// Middleware de Passport: exige un token JWT válido
export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Validación del registro de usuarios
export const validarRegistro = [
  body("nombre")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre es obligatorio (máximo 100 caracteres)"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .isLength({ max: 100 })
    .withMessage("El email admite hasta 100 caracteres"),
  body("contrasena")
    .isLength({ min: 8, max: 72 })
    .withMessage("La contraseña debe tener entre 8 y 72 caracteres"),
];

// Validación del inicio de sesión
export const validarLogin = [
  body("email").trim().isEmail().withMessage("El email no es válido"),
  body("contrasena").notEmpty().withMessage("La contraseña es obligatoria"),
];

// Middleware que responde 400 si alguna validación falló
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un entero positivo");

export const validarVehiculo = [
  body("marca")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("La marca es obligatoria (máximo 50 caracteres)"),
  body("modelo")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El modelo es obligatorio (máximo 50 caracteres)"),
  body("patente")
    .trim()
    .toUpperCase()
    .matches(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .withMessage("Patente inválida (formatos: ABC123 o AB123CD)"),
  body("anio")
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage("El año no es válido"),
  body("capacidadCarga")
    .isFloat({ gt: 0 })
    .withMessage("La capacidad de carga debe ser un número mayor a 0"),
];