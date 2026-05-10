"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import {
  App,
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FieldError } from "@/components/forms";
import { FormFullscreenBusy } from "@/components/ui";
import { FORM_FULLSCREEN_MESSAGES } from "@/constants/form-feedback-copy";
import { ROUTES } from "@/constants/routes";
import auth from "@/features/auth/auth-shared.module.css";
import { useNavigateWithPending } from "@/hooks/use-navigate-with-pending";
import { setStoredAccessToken } from "@/lib/auth-token";
import { authLogin, authRegister } from "@/services/auth";
import { registerSchema, type RegisterValues } from "@/validations/register";
import { getApiErrorMessage } from "@/utils/api-error";
import styles from "./register-screen.module.css";
dayjs.locale("es");
const GENDER_OPTIONS = [
  { value: "female", label: "Mujer" },
  { value: "male", label: "Hombre" },
  { value: "other", label: "Otro" },
  { value: "unspecified", label: "Prefiero no decir" },
];
const DIAL_OPTIONS = [{ value: "+503", label: "503" }];
function formatWhatsAppConfirm(dial: string, national: string): string {
  const code = dial.replace(/\D/g, "") || "503";
  const raw = national.replace(/\D/g, "");
  const formatted =
    raw.length >= 8 ? `${raw.slice(0, 4)} ${raw.slice(4, 8)}` : national.trim() || raw;
  return `+${code} ${formatted}`;
}
export function RegisterScreen() {
  const { message } = App.useApp();
  const { navigate, navPending } = useNavigateWithPending();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [registerBusy, setRegisterBusy] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      birthDate: "",
      email: "",
      whatsappDialCode: "+503",
      whatsappNationalNumber: "",
      password: "",
      confirmPassword: "",
    },
  });
  const dialWatch = useWatch({ control, name: "whatsappDialCode" });
  const nationalWatch = useWatch({ control, name: "whatsappNationalNumber" });
  const confirmPhoneDisplay = useMemo(
    () => formatWhatsAppConfirm(dialWatch ?? "+503", nationalWatch ?? ""),
    [dialWatch, nationalWatch],
  );
  const openConfirm = (): void => {
    setConfirmOpen(true);
  };
  const closeConfirm = (): void => {
    setConfirmOpen(false);
  };
  const onValid = (): void => {
    openConfirm();
  };
  const onConfirmAccept = async (): Promise<void> => {
    const vals = getValues();
    setRegisterBusy(true);
    try {
      const email = vals.email.trim();
      await authRegister({
        name: `${vals.firstName.trim()} ${vals.lastName.trim()}`.trim(),
        email,
        password: vals.password,
      });
      closeConfirm();
      const session = await authLogin({
        email,
        password: vals.password,
      });
      setStoredAccessToken(session.access_token);
      message.success("Cuenta creada. ¡Bienvenido!");
      navigate(ROUTES.crearOrden);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    } finally {
      setRegisterBusy(false);
    }
  };
  const overlayBusy = registerBusy || navPending;
  return (
    <>
      <FormFullscreenBusy
        spinning={overlayBusy}
        description={FORM_FULLSCREEN_MESSAGES.registerSubmit}
      />
      <div className="mx-auto w-full max-w-form-register">
        <header className={styles.header}>
          <Link
            href={ROUTES.login}
            className={styles.backLink}
            aria-label="Volver al inicio de sesión"
          >
            <ArrowLeftOutlined className="text-lg" />
          </Link>
          <div className={styles.titleCol}>
            <Typography.Title level={2} className={auth.title}>
              Cuéntanos de ti
            </Typography.Title>
            <span className={auth.subtitle}>Completa la información de registro</span>
          </div>
        </header>

        <form
          noValidate
          className="text-left"
          onSubmit={(e) => void handleSubmit(onValid)(e)}
        >
          <Row gutter={[16, 24]}>
            <Col xs={24} md={12}>
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-firstName" className={auth.labelBold}>
                      Nombre
                    </label>
                    <Input
                      {...field}
                      id="reg-firstName"
                      autoComplete="given-name"
                      placeholder="Digita tu nombre"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-firstName-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-firstName-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-lastName" className={auth.labelBold}>
                      Apellido
                    </label>
                    <Input
                      {...field}
                      id="reg-lastName"
                      autoComplete="family-name"
                      placeholder="Digita tu apellido"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-lastName-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-lastName-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={12}>
              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-gender" className={auth.labelBold}>
                      Sexo
                    </label>
                    <Select
                      id="reg-gender"
                      {...field}
                      value={field.value || undefined}
                      placeholder="Seleccionar"
                      size="large"
                      options={GENDER_OPTIONS}
                      className={`mt-2 w-full ${auth.selectField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-gender-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-gender-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-birthDate" className={auth.labelBold}>
                      Fecha de nacimiento
                    </label>
                    <DatePicker
                      id="reg-birthDate"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) => field.onChange(d ? d.format("YYYY-MM-DD") : "")}
                      placeholder="Seleccionar"
                      size="large"
                      format="DD/MM/YYYY"
                      className={`mt-2 ${styles.dateFullWidth}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-birthDate-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-birthDate-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={12}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-email" className={auth.labelBold}>
                      Correo electrónico
                    </label>
                    <Input
                      {...field}
                      id="reg-email"
                      autoComplete="email"
                      placeholder="Digita tu correo"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-email-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-email-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <div>
                <span className={auth.labelBold}>Número de whatsapp</span>
                <Space.Compact block className="mt-2 w-full">
                  <Controller
                    name="whatsappDialCode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value}
                        size="large"
                        options={DIAL_OPTIONS}
                        className={styles.dialSelect}
                        aria-label="Código de país"
                      />
                    )}
                  />
                  <Controller
                    name="whatsappNationalNumber"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id="reg-whatsapp"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="7777 7777"
                        size="large"
                        className={`${styles.whatsappInput} min-w-0 flex-1 ${auth.inputField}`}
                        status={
                          fieldState.error
                            ? "error"
                            : errors.whatsappNationalNumber
                              ? "error"
                              : undefined
                        }
                        aria-invalid={
                          fieldState.error || errors.whatsappNationalNumber
                            ? true
                            : undefined
                        }
                        aria-describedby={
                          errors.whatsappNationalNumber?.message
                            ? "reg-whatsapp-error"
                            : undefined
                        }
                      />
                    )}
                  />
                </Space.Compact>
                {errors.whatsappNationalNumber?.message ? (
                  <FieldError
                    id="reg-whatsapp-error"
                    message={errors.whatsappNationalNumber.message}
                  />
                ) : null}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-password" className={auth.labelBold}>
                      Contraseña
                    </label>
                    <Input.Password
                      {...field}
                      id="reg-password"
                      autoComplete="new-password"
                      placeholder="Digita contraseña"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-password-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-password-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="reg-confirmPassword" className={auth.labelBold}>
                      Repetir contraseña
                    </label>
                    <Input.Password
                      {...field}
                      id="reg-confirmPassword"
                      autoComplete="new-password"
                      placeholder="Digita contraseña"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-invalid={fieldState.error ? true : undefined}
                      aria-describedby={
                        fieldState.error ? "reg-confirmPassword-error" : undefined
                      }
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="reg-confirmPassword-error"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
          </Row>

          <div className={auth.submitWrap}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-solid text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${auth.submitButton}`}
            >
              Siguiente
            </button>
          </div>
        </form>

        <Modal
          open={confirmOpen}
          onCancel={closeConfirm}
          footer={null}
          centered
          width={400}
          destroyOnHidden
          title={null}
          closable
        >
          <div className="pt-2 text-center">
            <ExclamationCircleFilled className={styles.modalIcon} />
            <Typography.Title level={4} className={styles.modalTitle}>
              Confirmar número de teléfono
            </Typography.Title>
            <p className={styles.modalBody}>
              Está seguro de que desea continuar con el número{" "}
              <strong className="font-bold text-[#1a1c29]">
                {confirmPhoneDisplay}
              </strong>
              ?
            </p>
            <div className={styles.modalFooter}>
              <Button
                size="large"
                className={styles.modalBtnDefault}
                onClick={closeConfirm}
              >
                Cancelar
              </Button>
              <Button
                size="large"
                className={styles.modalBtnPrimary}
                loading={registerBusy}
                onClick={() => void onConfirmAccept()}
              >
                Aceptar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
