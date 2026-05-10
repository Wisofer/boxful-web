import Image from "next/image";
import type { ReactNode } from "react";
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] min-w-0 grid-cols-1 bg-[var(--boxful-auth-layout-root)] lg:grid-cols-2">
      <section className="flex min-w-0 items-center justify-center bg-[var(--boxful-auth-layout-root)] px-6 py-10 lg:min-h-[100dvh] lg:px-10 xl:px-12">
        <div className="w-full min-w-0">{children}</div>
      </section>
      <aside className="relative hidden min-w-0 flex-col items-center justify-center bg-[var(--boxful-auth-layout-aside)] px-8 py-14 lg:flex lg:min-h-[100dvh] lg:px-12">
        <Image
          src="/images/boxful.png"
          alt="boxful"
          width={480}
          height={74}
          priority
          sizes="(max-width: 1024px) 0vw, 45vw"
          className="h-auto w-full max-w-[min(90%,440px)] select-none"
        />
      </aside>
    </div>
  );
}
