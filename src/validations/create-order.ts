import { z } from "zod";
export const crearEnvioPaso1Schema = z
  .object({
    pickupAddress: z
      .string()
      .trim()
      .min(1, { message: "La dirección de recolección es obligatoria" }),
    pickupDate: z.string().min(1, { message: "Selecciona la fecha programada" }),
    senderFirstNames: z
      .string()
      .trim()
      .min(1, { message: "Los nombres son obligatorios" }),
    senderLastNames: z
      .string()
      .trim()
      .min(1, { message: "Los apellidos son obligatorios" }),
    senderEmail: z.email({ message: "Correo electrónico no válido" }),
    senderPhoneDialCode: z.string().min(1),
    senderPhoneNational: z.string().trim().min(8, { message: "Teléfono incompleto" }),
    recipientAddress: z
      .string()
      .trim()
      .min(1, { message: "La dirección del destinatario es obligatoria" }),
    departmentId: z.string().min(1, { message: "Selecciona departamento" }),
    municipalityId: z.string().min(1, { message: "Selecciona municipio" }),
    referencePoint: z.string(),
    instructions: z.string(),
    codEnabled: z.boolean(),
    codAmount: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.codEnabled) return;
    const raw = data.codAmount.trim();
    if (!raw) {
      ctx.addIssue({
        code: "custom",
        message: "Indica el monto a cobrar",
        path: ["codAmount"],
      });
      return;
    }
    const n = Number(raw.replace(",", "."));
    if (Number.isNaN(n) || n < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Monto inválido",
        path: ["codAmount"],
      });
    }
  });
export type CrearEnvioPaso1Values = z.infer<typeof crearEnvioPaso1Schema>;
export const packageRowSchema = z.object({
  weightLb: z.coerce.number().positive({ message: "Peso inválido" }),
  contents: z
    .string()
    .trim()
    .min(1, { message: "Describe el contenido" })
    .max(2000, { message: "Contenido demasiado largo (máx. 2000 caracteres)" }),
  length: z.coerce.number().positive({ message: "Largo inválido" }),
  width: z.coerce.number().positive({ message: "Ancho inválido" }),
  height: z.coerce.number().positive({ message: "Alto inválido" }),
});
export const packagesStepSchema = z.object({
  packages: z
    .array(packageRowSchema)
    .min(1, { message: "Agrega al menos un producto" }),
});
export type PackageRowValues = z.infer<typeof packageRowSchema>;
export type PackagesStepValues = z.infer<typeof packagesStepSchema>;
