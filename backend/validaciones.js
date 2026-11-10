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

export const validarConductor = [
  body("nombre")
    .trim()
    .matches(/^[\p{L} '-]{1,50}$/u)
    .withMessage("El nombre es obligatorio: solo letras, hasta 50 caracteres"),
  body("apellido")
    .trim()
    .matches(/^[\p{L} '-]{1,50}$/u)
    .withMessage("El apellido es obligatorio: solo letras, hasta 50 caracteres"),
  body("numeroDocumento")
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage("El número de documento debe tener 7 u 8 dígitos"),
  body("numeroLicencia")
    .trim()
    .isAlphanumeric()
    .isLength({ min: 5, max: 20 })
    .withMessage("El número de licencia debe ser alfanumérico (5 a 20 caracteres)"),
  body("fechaAltaLicencia")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de alta debe tener formato AAAA-MM-DD"),
  body("fechaVencimientoLicencia")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de vencimiento debe tener formato AAAA-MM-DD")
    .custom((vencimiento, { req }) => vencimiento > req.body.fechaAltaLicencia)
    .withMessage("El vencimiento debe ser posterior a la fecha de alta"),
];