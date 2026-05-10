import { z } from "zod";
const phoneDigits = z
  .string()
  .trim()
  .min(8, { message: "Número de WhatsApp incompleto" })
  .max(20, { message: "Número demasiado largo" })
  .regex(/^[0-9\s-]+$/, { message: "Solo dígitos, espacios o guiones" });
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "El nombre es obligatorio" }),
    lastName: z.string().trim().min(1, { message: "El apellido es obligatorio" }),
    gender: z.string().trim().min(1, { message: "Selecciona el sexo" }),
    birthDate: z.string().min(1, { message: "La fecha de nacimiento es obligatoria" }),
    email: z.email({ message: "Correo electrónico no válido" }),
    whatsappDialCode: z.string().min(1),
    whatsappNationalNumber: phoneDigits,
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .max(128, { message: "Contraseña demasiado larga" }),
    confirmPassword: z.string().min(1, { message: "Confirma la contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
