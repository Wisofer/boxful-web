"use client";
import { HomeOutlined, LoginOutlined } from "@ant-design/icons";
import { Button, Result, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f5f5f5] px-6 py-12">
      <Link
        href={ROUTES.home}
        className="mb-8 inline-flex shrink-0"
        aria-label="Ir al inicio de boxful"
      >
        <Image
          src="/images/boxful.png"
          alt="boxful"
          width={220}
          height={34}
          priority
          className="h-[34px] w-auto"
        />
      </Link>

      <Result
        className="max-w-lg px-0 [&_.ant-result-extra]:mt-6"
        status="404"
        title="Página no encontrada"
        subTitle="La dirección no existe o cambió. Comprueba la URL o vuelve al inicio."
        extra={
          <Space size="middle" wrap className="justify-center">
            <Link href={ROUTES.home}>
              <Button type="primary" size="large" icon={<HomeOutlined />}>
                Ir al inicio
              </Button>
            </Link>
            <Link href={ROUTES.login}>
              <Button size="large" icon={<LoginOutlined />}>
                Iniciar sesión
              </Button>
            </Link>
          </Space>
        }
      />
    </main>
  );
}
