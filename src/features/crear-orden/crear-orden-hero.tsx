import { Typography } from "antd";
import styles from "./crear-orden-hero.module.css";
export type CrearOrdenHeroProps = {
  isEditingOrder: boolean;
  variant: "compact" | "hero";
};
function IntroCopy({ emphasizeClassName }: { emphasizeClassName: string }) {
  return (
    <>
      Dale una ventaja competitiva a tu negocio con entregas{" "}
      <strong className={emphasizeClassName}>el mismo día</strong> (Área Metropolitana)
      y <strong className={emphasizeClassName}>el día siguiente</strong> a nivel
      nacional.
    </>
  );
}
export function CrearOrdenHero({ isEditingOrder, variant }: CrearOrdenHeroProps) {
  const headline = isEditingOrder ? "Editá la orden" : "Crea una orden";
  if (variant === "compact") {
    return (
      <div className={styles.compactWrap}>
        <Typography.Title level={3} className={styles.introTitle}>
          {headline}
        </Typography.Title>
        <Typography.Paragraph className={styles.introText}>
          <IntroCopy emphasizeClassName="font-semibold text-[var(--boxful-text-strong)]" />
        </Typography.Paragraph>
      </div>
    );
  }
  return (
    <>
      <Typography.Title level={3} className={styles.heroHeadline}>
        {headline}
      </Typography.Title>
      <Typography.Paragraph className={styles.heroLead}>
        <IntroCopy emphasizeClassName={styles.heroEm} />
      </Typography.Paragraph>
    </>
  );
}
