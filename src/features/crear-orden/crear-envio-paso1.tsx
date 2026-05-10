"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { RightOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useSearchParams } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FieldError } from "@/components/forms";
import { FormFullscreenBusy, PageCard } from "@/components/ui";
import { FORM_FULLSCREEN_MESSAGES } from "@/constants/form-feedback-copy";
import { CREAR_ORDEN_EDIT_QUERY, crearOrdenAfterPaso1Href } from "@/constants/routes";
import auth from "@/features/auth/auth-shared.module.css";
import { DashboardPageHeader } from "@/layouts/dashboard-page-header";
import { CrearUnEnvioHeaderTitle } from "@/layouts/dashboard-top-bar";
import { SV_DEPARTMENTS, SV_MUNICIPALITIES } from "@/constants/sv-locations";
import { useNavigateWithPending } from "@/hooks/use-navigate-with-pending";
import {
  loadDraftCrearEnvioPaso1,
  saveDraftCrearEnvioPaso1,
} from "@/lib/draft-order-step1";
import {
  crearEnvioPaso1Schema,
  type CrearEnvioPaso1Values,
} from "@/validations/create-order";
import { CrearOrdenHero } from "./crear-orden-hero";
import styles from "./crear-envio-paso1.module.css";
dayjs.locale("es");
const DIAL_OPTIONS = [{ value: "+503", label: "503" }];
const CREAR_ENVIO_PASO1_EMPTY: CrearEnvioPaso1Values = {
  pickupAddress: "",
  pickupDate: "",
  senderFirstNames: "",
  senderLastNames: "",
  senderEmail: "",
  senderPhoneDialCode: "+503",
  senderPhoneNational: "",
  recipientAddress: "",
  departmentId: "",
  municipalityId: "",
  referencePoint: "",
  instructions: "",
  codEnabled: true,
  codAmount: "00.00",
};
export function CrearEnvioPaso1() {
  const searchParams = useSearchParams();
  const editOrderId = searchParams.get(CREAR_ORDEN_EDIT_QUERY)?.trim();
  const { modal } = App.useApp();
  const { navigate, navPending } = useNavigateWithPending();
  const defaultValues = useMemo((): CrearEnvioPaso1Values => {
    if (typeof window === "undefined") {
      return { ...CREAR_ENVIO_PASO1_EMPTY };
    }
    return loadDraftCrearEnvioPaso1() ?? { ...CREAR_ENVIO_PASO1_EMPTY };
  }, []);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CrearEnvioPaso1Values>({
    resolver: zodResolver(crearEnvioPaso1Schema),
    defaultValues,
  });
  const departmentId = useWatch({ control, name: "departmentId" });
  const codEnabled = useWatch({ control, name: "codEnabled" });
  const municipalityOptions = useMemo(
    () =>
      departmentId && SV_MUNICIPALITIES[departmentId]
        ? [...SV_MUNICIPALITIES[departmentId]]
        : [],
    [departmentId],
  );
  const onValid: SubmitHandler<CrearEnvioPaso1Values> = (values) => {
    const proceed = (): void => {
      saveDraftCrearEnvioPaso1(values);
      navigate(crearOrdenAfterPaso1Href(editOrderId));
    };
    const raw = values.codAmount.replace(",", ".").trim();
    const codNum = raw === "" ? 0 : Number(raw);
    if (values.codEnabled && Number.isFinite(codNum) && codNum <= 0) {
      modal.confirm({
        title: "Monto COD esperado en $0",
        content:
          "No informaste un monto esperado de contra entrega. Si después registrás otro recolectado, puede confundir con el esperado en $0. ¿Querés continuar igual o revisar el monto?",
        okText: "Continuar igual",
        cancelText: "Revisar monto",
        onOk: () => proceed(),
      });
      return;
    }
    proceed();
  };
  const stepBusy = isSubmitting || navPending;
  return (
    <>
      <FormFullscreenBusy
        spinning={stepBusy}
        description={FORM_FULLSCREEN_MESSAGES.crearOrdenStepBusy}
      />

      <DashboardPageHeader title={<CrearUnEnvioHeaderTitle />} />

      <CrearOrdenHero isEditingOrder={Boolean(editOrderId)} variant="compact" />

      <PageCard>
        <Typography.Text className={styles.sectionTitle}>
          Completa los datos
        </Typography.Text>

        <form
          noValidate
          className="text-left"
          onSubmit={(e) => void handleSubmit(onValid)(e)}
        >
          <Row gutter={[16, 24]}>
            <Col xs={24} lg={16}>
              <Controller
                name="pickupAddress"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-pickup" className={auth.labelBold}>
                      Dirección de recolección
                    </label>
                    <Input
                      {...field}
                      id="ce-pickup"
                      placeholder="Digita la dirección de recolección"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-pickup-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="ce-pickup-err"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} lg={8}>
              <Controller
                name="pickupDate"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-date" className={auth.labelBold}>
                      Fecha programada
                    </label>
                    <DatePicker
                      id="ce-date"
                      size="large"
                      className={`mt-2 w-full max-w-full [&_.ant-picker]:rounded-lg ${auth.inputField}`}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) => field.onChange(d ? d.format("YYYY-MM-DD") : "")}
                      format="DD/MM/YYYY"
                      placeholder="Seleccionar"
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-date-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-date-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <Controller
                name="senderFirstNames"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-fn" className={auth.labelBold}>
                      Nombres
                    </label>
                    <Input
                      {...field}
                      id="ce-fn"
                      autoComplete="given-name"
                      placeholder="Digita los nombres"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-fn-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-fn-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <Controller
                name="senderLastNames"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-ln" className={auth.labelBold}>
                      Apellidos
                    </label>
                    <Input
                      {...field}
                      id="ce-ln"
                      autoComplete="family-name"
                      placeholder="Digita los apellidos"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-ln-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-ln-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <Controller
                name="senderEmail"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-em" className={auth.labelBold}>
                      Correo electrónico
                    </label>
                    <Input
                      {...field}
                      id="ce-em"
                      autoComplete="email"
                      placeholder="Digita tu correo"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-em-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-em-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={12}>
              <span className={auth.labelBold}>Teléfono</span>
              <Space.Compact block className="mt-2 w-full">
                <Controller
                  name="senderPhoneDialCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      options={DIAL_OPTIONS}
                      className={`${styles.dialSelect} ${auth.selectField}`}
                      aria-label="Código de país"
                    />
                  )}
                />
                <Controller
                  name="senderPhoneNational"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id="ce-tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="0000 0000"
                      size="large"
                      className={`${styles.phoneInput} min-w-0 flex-1 ${auth.inputField}`}
                      status={
                        fieldState.error || errors.senderPhoneNational
                          ? "error"
                          : undefined
                      }
                      aria-describedby={
                        errors.senderPhoneNational?.message ? "ce-tel-err" : undefined
                      }
                    />
                  )}
                />
              </Space.Compact>
              {errors.senderPhoneNational?.message ? (
                <FieldError
                  id="ce-tel-err"
                  message={errors.senderPhoneNational.message}
                />
              ) : null}
            </Col>
            <Col xs={24} md={12}>
              <Controller
                name="recipientAddress"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-dest" className={auth.labelBold}>
                      Dirección del destinatario
                    </label>
                    <Input
                      {...field}
                      id="ce-dest"
                      placeholder="Digita la dirección del destinatario"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-dest-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-dest-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <Controller
                name="departmentId"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-depto" className={auth.labelBold}>
                      Departamento
                    </label>
                    <Select
                      {...field}
                      id="ce-depto"
                      value={field.value || undefined}
                      placeholder="Seleccionar"
                      size="large"
                      options={[...SV_DEPARTMENTS]}
                      className={`mt-2 w-full ${auth.selectField}`}
                      onChange={(v) => {
                        field.onChange(v);
                        setValue("municipalityId", "");
                      }}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-depto-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError
                        id="ce-depto-err"
                        message={fieldState.error.message}
                      />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <Controller
                name="municipalityId"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label htmlFor="ce-muni" className={auth.labelBold}>
                      Municipio
                    </label>
                    <Select
                      {...field}
                      id="ce-muni"
                      value={field.value || undefined}
                      placeholder="Seleccionar"
                      size="large"
                      options={municipalityOptions}
                      disabled={!departmentId}
                      className={`mt-2 w-full ${auth.selectField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-muni-err" : undefined}
                    />
                    {fieldState.error?.message ? (
                      <FieldError id="ce-muni-err" message={fieldState.error.message} />
                    ) : null}
                  </div>
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <Controller
                name="referencePoint"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="ce-ref" className={auth.labelBold}>
                      Punto de referencia
                    </label>
                    <Input
                      {...field}
                      id="ce-ref"
                      placeholder="Digita punto de referencia"
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                    />
                  </div>
                )}
              />
            </Col>

            <Col xs={24}>
              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="ce-ind" className={auth.labelBold}>
                      Indicaciones
                    </label>
                    <Input.TextArea
                      {...field}
                      id="ce-ind"
                      placeholder="Digita indicaciones para la entrega"
                      rows={3}
                      size="large"
                      className={`mt-2 ${auth.inputField}`}
                    />
                  </div>
                )}
              />
            </Col>
          </Row>

          <div className={styles.pceBox}>
            <div className={styles.pceRowTop}>
              <Typography.Text className={styles.pceTitle}>
                Pago contra entrega (PCE)
              </Typography.Text>
              <Controller
                name="codEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    className="[&.ant-switch-checked]:!bg-[#4ade80]"
                  />
                )}
              />
            </div>

            <div className={styles.pceRowBottom}>
              <Typography.Paragraph className={styles.pceHint}>
                Tu cliente paga el{" "}
                <strong className={styles.pceHintStrong}>monto que indiques</strong> al
                momento de la entrega.
              </Typography.Paragraph>
              <div className={styles.pceAmountWrap}>
                <Controller
                  name="codAmount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      disabled={!codEnabled}
                      prefix={<span>$</span>}
                      placeholder="00.00"
                      className={`${styles.amountInput} ${!codEnabled ? styles.amountInputDisabled : ""} ${auth.inputField}`}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={fieldState.error ? "ce-cod-err" : undefined}
                    />
                  )}
                />
              </div>
            </div>

            {errors.codAmount?.message ? (
              <FieldError id="ce-cod-err" message={errors.codAmount.message} />
            ) : null}
          </div>

          <div className={styles.footerActions}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              disabled={stepBusy}
              icon={<RightOutlined />}
              iconPlacement="end"
              className={styles.nextButton}
            >
              Siguiente
            </Button>
          </div>
        </form>
      </PageCard>
    </>
  );
}
