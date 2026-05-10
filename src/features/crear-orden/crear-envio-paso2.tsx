"use client";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  LeftOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { App, Button, Input, Modal, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FieldError } from "@/components/forms";
import { FormFullscreenBusy, PageCard } from "@/components/ui";
import { FORM_FULLSCREEN_MESSAGES } from "@/constants/form-feedback-copy";
import {
  CREAR_ORDEN_EDIT_QUERY,
  crearOrdenEditHref,
  historialDetailHref,
  ROUTES,
} from "@/constants/routes";
import auth from "@/features/auth/auth-shared.module.css";
import { DashboardPageHeader } from "@/layouts/dashboard-page-header";
import { CrearUnEnvioHeaderTitle } from "@/layouts/dashboard-top-bar";
import { useNavigateWithPending } from "@/hooks/use-navigate-with-pending";
import { clearEntireCrearEnvioFlowDrafts } from "@/lib/clear-crear-envio-flow";
import {
  clearDraftEditOrderPackages,
  loadDraftEditOrderPackages,
  saveDraftEditOrderPackages,
} from "@/lib/draft-edit-order-packages";
import { clearEditOrderSession, loadEditOrderSession } from "@/lib/edit-order-session";
import {
  clearDraftCrearEnvioPaso1,
  loadDraftCrearEnvioPaso1,
} from "@/lib/draft-order-step1";
import { createOrder, patchOrder } from "@/services/orders";
import {
  packageRowSchema,
  packagesStepSchema,
  type PackagesStepValues,
} from "@/validations/create-order";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  buildCreateOrderBody,
  buildPatchOrderBodyFromCrearForms,
} from "@/utils/map-create-order-body";
import { CrearOrdenHero } from "./crear-orden-hero";
import styles from "./crear-envio-paso2.module.css";
function PackageBoxGlyph() {
  return (
    <svg
      className={styles.packageBoxSvg}
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3 20 8 12 13 4 8 12 3z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M4 8v9l8 5v-9L4 8z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M12 13 20 8v9l-8 5v-9z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}
type DraftRow = {
  weightLb: string;
  contents: string;
  length: string;
  width: string;
  height: string;
};
const emptyDraft: DraftRow = {
  weightLb: "",
  contents: "",
  length: "",
  width: "",
  height: "",
};
function parseNumericField(raw: string): number | "" {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  const n = Number(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : "";
}
function unitSuffix(children: ReactNode): ReactNode {
  return <span aria-hidden>{children}</span>;
}
export function CrearEnvioPaso2() {
  const searchParams = useSearchParams();
  const editOrderId = searchParams.get(CREAR_ORDEN_EDIT_QUERY)?.trim();
  const { message } = App.useApp();
  const { navigate, navPending } = useNavigateWithPending();
  const [draft, setDraft] = useState<DraftRow>(emptyDraft);
  const [draftFieldErrors, setDraftFieldErrors] = useState<
    Partial<Record<keyof DraftRow, string>>
  >({});
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishedAsEdit, setFinishedAsEdit] = useState(false);
  const [savedEditOrderId, setSavedEditOrderId] = useState<string | null>(null);
  const packagesSeededRef = useRef(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PackagesStepValues>({
    resolver: zodResolver(packagesStepSchema) as Resolver<PackagesStepValues>,
    defaultValues: { packages: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });
  useLayoutEffect(() => {
    if (!editOrderId || packagesSeededRef.current) return undefined;
    const seed = loadDraftEditOrderPackages();
    if (seed?.length) {
      reset({ packages: seed });
    }
    packagesSeededRef.current = true;
    return undefined;
  }, [editOrderId, reset]);
  const setDraftField = (key: keyof DraftRow, value: string): void => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDraftFieldErrors((e) => ({ ...e, [key]: undefined }));
  };
  const addPackageFromDraft = (): void => {
    const parsed = packageRowSchema.safeParse({
      weightLb: draft.weightLb,
      contents: draft.contents,
      length: draft.length,
      width: draft.width,
      height: draft.height,
    });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setDraftFieldErrors({
        weightLb: fe.weightLb?.[0],
        contents: fe.contents?.[0],
        length: fe.length?.[0],
        width: fe.width?.[0],
        height: fe.height?.[0],
      });
      return;
    }
    append(parsed.data);
    setDraft(emptyDraft);
    setDraftFieldErrors({});
  };
  const onValid: SubmitHandler<PackagesStepValues> = async (data) => {
    const paso1 = loadDraftCrearEnvioPaso1();
    if (!paso1) {
      message.error(
        "Falta la información del primer paso. Completa la orden desde el inicio.",
      );
      navigate(editOrderId ? crearOrdenEditHref(editOrderId) : ROUTES.crearOrden);
      return;
    }
    try {
      if (editOrderId) {
        const sess = loadEditOrderSession();
        if (!sess || sess.orderId !== editOrderId) {
          message.error(
            "Sesión de edición perdida o inválida. Volvé al historial e intentá de nuevo.",
          );
          navigate(ROUTES.misEnviosHistorial);
          return;
        }
        await patchOrder(
          editOrderId,
          buildPatchOrderBodyFromCrearForms(paso1, data.packages, sess.collectedAmount),
        );
        setSavedEditOrderId(editOrderId);
        clearEntireCrearEnvioFlowDrafts();
        setFinishedAsEdit(true);
      } else {
        await createOrder(buildCreateOrderBody(paso1, data.packages));
        clearDraftCrearEnvioPaso1();
        clearDraftEditOrderPackages();
        clearEditOrderSession();
        setSavedEditOrderId(null);
        setFinishedAsEdit(false);
      }
      setFinishModalOpen(true);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };
  const packagesRootMessage =
    typeof errors.packages?.message === "string" ? errors.packages.message : undefined;
  const stepBusy = isSubmitting || navPending;
  return (
    <>
      <FormFullscreenBusy
        spinning={stepBusy}
        description={FORM_FULLSCREEN_MESSAGES.crearOrdenStepBusy}
      />

      <DashboardPageHeader title={<CrearUnEnvioHeaderTitle />} />

      <div className={styles.heroPage}>
        <div className={styles.heroMax}>
          <CrearOrdenHero isEditingOrder={Boolean(editOrderId)} variant="hero" />

          <PageCard className={styles.stepCard}>
            <Typography.Text className={styles.cardSectionTitle}>
              Agrega tus productos
            </Typography.Text>

            <form
              noValidate
              className="text-left"
              onSubmit={(e) => void handleSubmit(onValid)(e)}
            >
              <div className={styles.draftPanel}>
                <div className={styles.draftFields}>
                  <div
                    className={`${styles.weightFieldSmall} ${styles.weightFieldInner}`}
                  >
                    <label htmlFor="draft-w" className={styles.label}>
                      Peso en libras
                    </label>
                    <Input
                      id="draft-w"
                      size="large"
                      inputMode="decimal"
                      suffix={unitSuffix("libras")}
                      placeholder="Ej. 3"
                      value={draft.weightLb}
                      onChange={(e) => setDraftField("weightLb", e.target.value)}
                      className={`mt-2 ${styles.fieldShell} ${styles.weightField} ${auth.inputField}`}
                      status={draftFieldErrors.weightLb ? "error" : undefined}
                    />
                    {draftFieldErrors.weightLb ? (
                      <FieldError
                        id="draft-w-err"
                        message={draftFieldErrors.weightLb}
                      />
                    ) : null}
                  </div>

                  <div className={styles.contentField}>
                    <label htmlFor="draft-c" className={styles.label}>
                      Contenido
                    </label>
                    <Input
                      id="draft-c"
                      size="large"
                      placeholder="Ej. iPhone 14 pro Max"
                      value={draft.contents}
                      onChange={(e) => setDraftField("contents", e.target.value)}
                      className={`mt-2 ${styles.fieldShell} ${auth.inputField}`}
                      status={draftFieldErrors.contents ? "error" : undefined}
                    />
                    {draftFieldErrors.contents ? (
                      <FieldError
                        id="draft-c-err"
                        message={draftFieldErrors.contents}
                      />
                    ) : null}
                  </div>

                  <div className={styles.iconCol}>
                    <span className={styles.iconSpacer} aria-hidden />
                    <span className={styles.packIcon}>
                      <PackageBoxGlyph />
                    </span>
                  </div>

                  <div className={`${styles.dimGroup} ${styles.dimGroupConnected}`}>
                    <div className={`${styles.dimField} ${styles.dimFieldWide}`}>
                      <label htmlFor="draft-l" className={styles.label}>
                        Largo
                      </label>
                      <Input
                        id="draft-l"
                        size="large"
                        inputMode="decimal"
                        suffix={unitSuffix("cm")}
                        placeholder="0"
                        value={draft.length}
                        onChange={(e) => setDraftField("length", e.target.value)}
                        className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                        status={draftFieldErrors.length ? "error" : undefined}
                      />
                      {draftFieldErrors.length ? (
                        <FieldError
                          id="draft-l-err"
                          message={draftFieldErrors.length}
                        />
                      ) : null}
                    </div>
                    <div className={`${styles.dimField} ${styles.dimFieldWide}`}>
                      <label htmlFor="draft-h" className={styles.label}>
                        Alto
                      </label>
                      <Input
                        id="draft-h"
                        size="large"
                        inputMode="decimal"
                        suffix={unitSuffix("cm")}
                        placeholder="0"
                        value={draft.height}
                        onChange={(e) => setDraftField("height", e.target.value)}
                        className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                        status={draftFieldErrors.height ? "error" : undefined}
                      />
                      {draftFieldErrors.height ? (
                        <FieldError
                          id="draft-h-err"
                          message={draftFieldErrors.height}
                        />
                      ) : null}
                    </div>
                    <div className={`${styles.dimField} ${styles.dimFieldWide}`}>
                      <label htmlFor="draft-wd" className={styles.label}>
                        Ancho
                      </label>
                      <Input
                        id="draft-wd"
                        size="large"
                        inputMode="decimal"
                        suffix={unitSuffix("cm")}
                        placeholder="0"
                        value={draft.width}
                        onChange={(e) => setDraftField("width", e.target.value)}
                        className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                        status={draftFieldErrors.width ? "error" : undefined}
                      />
                      {draftFieldErrors.width ? (
                        <FieldError
                          id="draft-wd-err"
                          message={draftFieldErrors.width}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className={styles.draftActions}>
                  <Button
                    type="default"
                    size="large"
                    htmlType="button"
                    disabled={stepBusy}
                    className={styles.addButton}
                    onClick={(e) => {
                      e.preventDefault();
                      addPackageFromDraft();
                    }}
                  >
                    Agregar +
                  </Button>
                </div>
              </div>

              {packagesRootMessage ? (
                <div className={styles.packagesRootErr}>
                  <FieldError id="packages-root-err" message={packagesRootMessage} />
                </div>
              ) : null}

              <div className={styles.packagesList}>
                {fields.map((pkg, index) => (
                  <div key={pkg.id} className={styles.packageCard}>
                    <div className={styles.pkgRow}>
                      <div className={styles.pkgWeight}>
                        <label htmlFor={`pkg-${pkg.id}-w`} className={styles.label}>
                          Peso en libras
                        </label>
                        <Controller
                          name={`packages.${index}.weightLb`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <Input
                                id={`pkg-${pkg.id}-w`}
                                size="large"
                                inputMode="decimal"
                                suffix={unitSuffix("libras")}
                                className={`mt-2 ${styles.fieldShell} ${styles.weightField} ${styles.weightFieldInner} ${auth.inputField}`}
                                value={
                                  field.value === undefined ? "" : String(field.value)
                                }
                                onChange={(e) =>
                                  field.onChange(parseNumericField(e.target.value))
                                }
                                status={fieldState.error ? "error" : undefined}
                              />
                              {fieldState.error?.message ? (
                                <FieldError
                                  id={`pkg-${pkg.id}-w-e`}
                                  message={fieldState.error.message}
                                />
                              ) : null}
                            </>
                          )}
                        />
                      </div>

                      <div className={styles.pkgContents}>
                        <label htmlFor={`pkg-${pkg.id}-c`} className={styles.label}>
                          Contenido
                        </label>
                        <Controller
                          name={`packages.${index}.contents`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <Input
                                {...field}
                                id={`pkg-${pkg.id}-c`}
                                size="large"
                                className={`mt-2 ${styles.fieldShell} ${auth.inputField}`}
                                status={fieldState.error ? "error" : undefined}
                              />
                              {fieldState.error?.message ? (
                                <FieldError
                                  id={`pkg-${pkg.id}-c-e`}
                                  message={fieldState.error.message}
                                />
                              ) : null}
                            </>
                          )}
                        />
                      </div>

                      <div className={`${styles.pkgIconMid}`}>
                        <span className={styles.iconSpacer} aria-hidden />
                        <span className={styles.pkgIconMidInner} aria-hidden>
                          <PackageBoxGlyph />
                        </span>
                      </div>

                      <div
                        className={`${styles.pkgDimsWrap} ${styles.pkgDimsConnected}`}
                      >
                        <div className={`${styles.pkgDim} ${styles.dimFieldWide}`}>
                          <label htmlFor={`pkg-${pkg.id}-l`} className={styles.label}>
                            Largo
                          </label>
                          <Controller
                            name={`packages.${index}.length`}
                            control={control}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  id={`pkg-${pkg.id}-l`}
                                  size="large"
                                  inputMode="decimal"
                                  suffix={unitSuffix("cm")}
                                  className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                                  value={
                                    field.value === undefined ? "" : String(field.value)
                                  }
                                  onChange={(e) =>
                                    field.onChange(parseNumericField(e.target.value))
                                  }
                                  status={fieldState.error ? "error" : undefined}
                                />
                                {fieldState.error?.message ? (
                                  <FieldError
                                    id={`pkg-${pkg.id}-l-e`}
                                    message={fieldState.error.message}
                                  />
                                ) : null}
                              </>
                            )}
                          />
                        </div>
                        <div className={`${styles.pkgDim} ${styles.dimFieldWide}`}>
                          <label htmlFor={`pkg-${pkg.id}-hh`} className={styles.label}>
                            Alto
                          </label>
                          <Controller
                            name={`packages.${index}.height`}
                            control={control}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  id={`pkg-${pkg.id}-hh`}
                                  size="large"
                                  inputMode="decimal"
                                  suffix={unitSuffix("cm")}
                                  className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                                  value={
                                    field.value === undefined ? "" : String(field.value)
                                  }
                                  onChange={(e) =>
                                    field.onChange(parseNumericField(e.target.value))
                                  }
                                  status={fieldState.error ? "error" : undefined}
                                />
                                {fieldState.error?.message ? (
                                  <FieldError
                                    id={`pkg-${pkg.id}-hh-e`}
                                    message={fieldState.error.message}
                                  />
                                ) : null}
                              </>
                            )}
                          />
                        </div>
                        <div className={`${styles.pkgDim} ${styles.dimFieldWide}`}>
                          <label htmlFor={`pkg-${pkg.id}-wd`} className={styles.label}>
                            Ancho
                          </label>
                          <Controller
                            name={`packages.${index}.width`}
                            control={control}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  id={`pkg-${pkg.id}-wd`}
                                  size="large"
                                  inputMode="decimal"
                                  suffix={unitSuffix("cm")}
                                  className={`mt-2 ${styles.fieldShell} ${styles.dimFieldInner} ${auth.inputField}`}
                                  value={
                                    field.value === undefined ? "" : String(field.value)
                                  }
                                  onChange={(e) =>
                                    field.onChange(parseNumericField(e.target.value))
                                  }
                                  status={fieldState.error ? "error" : undefined}
                                />
                                {fieldState.error?.message ? (
                                  <FieldError
                                    id={`pkg-${pkg.id}-wd-e`}
                                    message={fieldState.error.message}
                                  />
                                ) : null}
                              </>
                            )}
                          />
                        </div>
                      </div>

                      <div className={styles.pkgDel}>
                        <Button
                          type="default"
                          size="large"
                          aria-label={`Eliminar producto ${index + 1}`}
                          icon={<DeleteOutlined />}
                          className={styles.deleteSquare}
                          htmlType="button"
                          onClick={(e) => {
                            e.preventDefault();
                            remove(index);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {fields.length === 0 ? (
                <Typography.Text className={styles.emptyHint}>
                  Agrega al menos un producto para continuar.
                </Typography.Text>
              ) : null}

              <div className={styles.footerBar}>
                <Button
                  size="large"
                  disabled={stepBusy}
                  icon={<LeftOutlined />}
                  className={styles.backButton}
                  htmlType="button"
                  onClick={() => {
                    if (editOrderId) {
                      saveDraftEditOrderPackages(getValues("packages"));
                      navigate(crearOrdenEditHref(editOrderId));
                      return;
                    }
                    navigate(ROUTES.crearOrden);
                  }}
                >
                  Regresar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  disabled={stepBusy}
                  icon={<SendOutlined />}
                  iconPlacement="end"
                  className={styles.submitButton}
                >
                  {editOrderId ? "Guardar cambios" : "Enviar"}
                </Button>
              </div>
            </form>
          </PageCard>
        </div>
      </div>

      <Modal
        open={finishModalOpen}
        centered
        width={440}
        footer={null}
        onCancel={() => setFinishModalOpen(false)}
        destroyOnHidden
        closable
        styles={{
          root: { borderRadius: 16, padding: "8px 8px 12px" },
          body: { padding: "20px 24px 28px" },
        }}
      >
        <div className="pt-1">
          <div className={styles.modalIconWrap}>
            <span className={styles.modalIconOuter} aria-hidden>
              <span className={styles.modalIcon}>
                <CheckCircleOutlined />
              </span>
            </span>
          </div>
          <Typography.Title level={4} className={styles.modalTitle}>
            {finishedAsEdit ? (
              <>
                Cambios <span className={styles.modalTitleEm}>guardados</span>
              </>
            ) : (
              <>
                Orden <span className={styles.modalTitleEm}>enviada</span>
              </>
            )}
          </Typography.Title>
          <Typography.Paragraph className={styles.modalBody}>
            {finishedAsEdit
              ? "Actualizamos la orden en el servidor. Podés revisar el detalle en el historial o seguir corrigiendo otra orden."
              : "La orden ha sido creada y enviada. Podés revisar el detalle en el historial o crear otra desde el inicio."}
          </Typography.Paragraph>
          <div className={styles.modalActions}>
            {finishedAsEdit && savedEditOrderId ? (
              <Button
                size="large"
                className={styles.modalOutlineBtn}
                onClick={() => {
                  setFinishModalOpen(false);
                  navigate(historialDetailHref(savedEditOrderId));
                }}
              >
                Ver en historial
              </Button>
            ) : (
              <Button
                size="large"
                className={styles.modalOutlineBtn}
                onClick={() => {
                  setFinishModalOpen(false);
                  navigate(ROUTES.misEnviosHistorial);
                }}
              >
                Ir al historial
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              className="min-w-[132px] !h-11 !rounded-lg !font-semibold"
              onClick={() => {
                setFinishModalOpen(false);
                navigate(ROUTES.crearOrden);
              }}
            >
              {finishedAsEdit ? "Cerrar" : "Crear otra"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
