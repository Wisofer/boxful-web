"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { App, Input, Typography } from "antd";
import Link from "next/link";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { FormFullscreenBusy } from "@/components/ui";
import { FORM_FULLSCREEN_MESSAGES } from "@/constants/form-feedback-copy";
import { ROUTES } from "@/constants/routes";
import { useNavigateWithPending } from "@/hooks/use-navigate-with-pending";
import { setStoredAccessToken } from "@/lib/auth-token";
import { authLogin } from "@/services/auth";
import { loginSchema, type LoginValues } from "@/validations/login";
import { getApiErrorMessage } from "@/utils/api-error";
import styles from "./login-screen.module.css";
export function LoginScreen() {
  const { message } = App.useApp();
  const { navigate, navPending } = useNavigateWithPending();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const onValid: SubmitHandler<LoginValues> = async (values) => {
    try {
      const res = await authLogin({
        email: values.email.trim(),
        password: values.password.trim(),
      });
      setStoredAccessToken(res.access_token);
      message.success("Sesión iniciada");
      navigate(ROUTES.crearOrden);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };
  const loginBusy = isSubmitting || navPending;
  return (
    <>
      <FormFullscreenBusy
        spinning={loginBusy}
        description={FORM_FULLSCREEN_MESSAGES.loginSubmit}
      />
      <div className={`mx-auto w-full max-w-form ${styles.loginWrap}`}>
        <Typography.Title level={2} className={styles.loginTitle}>
          Bienvenido
        </Typography.Title>
        <span className={styles.loginLead}>Por favor ingresa tus credenciales</span>

        <form
          noValidate
          className={`text-left ${styles.loginShell}`}
          onSubmit={(e) => void handleSubmit(onValid)(e)}
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <div className={styles.fieldBlock}>
                <label htmlFor="login-email" className={styles.loginLabel}>
                  Correo electrónico
                </label>
                <Input
                  {...field}
                  id="login-email"
                  autoComplete="email"
                  variant="outlined"
                  placeholder="Digita tu correo"
                  size="large"
                  className={styles.loginControlGap}
                  status={fieldState.error ? "error" : undefined}
                  aria-invalid={fieldState.error ? true : undefined}
                  aria-describedby={fieldState.error ? "login-email-error" : undefined}
                />
                {fieldState.error?.message ? (
                  <Typography.Text
                    id="login-email-error"
                    type="danger"
                    className="mt-1 block text-[13px]"
                    role="alert"
                  >
                    {fieldState.error.message}
                  </Typography.Text>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label htmlFor="login-password" className={styles.loginLabel}>
                  Contraseña
                </label>
                <Input.Password
                  {...field}
                  id="login-password"
                  autoComplete="current-password"
                  variant="outlined"
                  placeholder="Digita tu contraseña"
                  size="large"
                  className={styles.loginControlGap}
                  status={fieldState.error ? "error" : undefined}
                  aria-invalid={fieldState.error ? true : undefined}
                  aria-describedby={
                    fieldState.error ? "login-password-error" : undefined
                  }
                />
                {fieldState.error?.message ? (
                  <Typography.Text
                    id="login-password-error"
                    type="danger"
                    className="mt-1 block text-[13px]"
                    role="alert"
                  >
                    {fieldState.error.message}
                  </Typography.Text>
                ) : null}
              </div>
            )}
          />

          <div className={styles.submitWrap}>
            <button
              type="submit"
              disabled={loginBusy}
              className={`inline-flex cursor-pointer items-center justify-center rounded-lg border border-solid text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles.submitButton}`}
            >
              Iniciar sesión
            </button>
          </div>
        </form>

        <Typography.Text className={styles.footer}>
          ¿Necesitas una cuenta?{" "}
          <Link href={ROUTES.registro} className={styles.footerLink}>
            Regístrate aquí
          </Link>
        </Typography.Text>
      </div>
    </>
  );
}
