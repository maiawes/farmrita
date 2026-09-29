"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type AppShellProps = {
  children: ReactNode;
  demoMode: boolean;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: "home" | "patients" | "products" | "face";
};

const mainNavigation: NavigationItem[] = [
  { href: "/", label: "Visão geral", icon: "home" },
  { href: "/patients", label: "Pacientes e prontuários", icon: "patients" },
  { href: "/products", label: "Produtos e insumos", icon: "products" },
];

const demoNavigation: NavigationItem[] = [
  {
    href: "/demo/anatomical-diagrams",
    label: "Prancha facial",
    icon: "face",
  },
];

function Icon({ name }: { name: NavigationItem["icon"] }) {
  const common = {
    "aria-hidden": true as const,
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="m3.5 10 8.5-7 8.5 7v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
        <path d="M9 21v-7h6v7" />
      </svg>
    );
  }

  if (name === "patients") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.8 20c.5-3.2 2.6-5 6.2-5s5.7 1.8 6.2 5M16 5.5a3.4 3.4 0 0 1 0 6.5M17.2 15c2.4.5 3.7 2.1 4 5" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg {...common}>
        <path d="M4 7h16v13H4zM7 4h10v3H7zM8 11h8M8 15h5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M19.5 10.5c0 6-7.5 11-7.5 11s-7.5-5-7.5-11a7.5 7.5 0 1 1 15 0Z" />
      <path d="M9.5 10.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
    </svg>
  );
}

function pageTitle(pathname: string) {
  if (pathname === "/") return "Visão geral";
  if (pathname === "/patients") return "Pacientes e prontuários";
  if (pathname.startsWith("/patients/")) return "Prontuário da paciente";
  if (pathname === "/products") return "Produtos e insumos";
  if (pathname.startsWith("/products/")) return "Detalhes do produto";
  if (pathname.startsWith("/demo/anatomical-diagrams")) {
    return "Prancha facial";
  }
  return "Cássia Clinical";
}

function isAuthPage(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/")
  );
}

function NavigationLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavigationItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                active
                  ? "bg-[#f2eee6] text-[#3f4433] shadow-sm"
                  : "text-[#f2eee6]/75 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
              onClick={onNavigate}
            >
              <span className={active ? "text-[#A8786A]" : "text-[#d1b3a6]"}>
                <Icon name={item.icon} />
              </span>
              <span>{item.label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A8786A]"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarContent({
  pathname,
  demoMode,
  onNavigate,
}: {
  pathname: string;
  demoMode: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        aria-label="Cássia Clinical — visão geral"
        className="flex items-center gap-3 px-3 py-2"
        href="/"
        onClick={onNavigate}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4b9aa]/35 bg-white/10 font-serif text-2xl italic text-[#f2eee6]">
          C
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-[1.65rem] italic leading-none tracking-tight text-[#f7f1e8]">
            Cássia
          </span>
          <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#d4b9aa]">
            Clinical
          </span>
        </span>
      </Link>

      <div className="mx-3 mt-7 h-px bg-white/15" />

      <nav aria-label="Navegação principal" className="mt-7 flex-1 px-2">
        <p className="px-3 pb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d4b9aa]/75">
          Início
        </p>
        <NavigationLinks
          items={[mainNavigation[0]]}
          onNavigate={onNavigate}
          pathname={pathname}
        />

        <p className="mt-7 px-3 pb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d4b9aa]/75">
          Clínica
        </p>
        <NavigationLinks
          items={[mainNavigation[1]]}
          onNavigate={onNavigate}
          pathname={pathname}
        />

        <p className="mt-7 px-3 pb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d4b9aa]/75">
          Gestão
        </p>
        <NavigationLinks
          items={[mainNavigation[2]]}
          onNavigate={onNavigate}
          pathname={pathname}
        />

        {demoMode && (
          <>
            <p className="mt-7 px-3 pb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d4b9aa]/75">
              Ferramentas locais
            </p>
            <NavigationLinks
              items={demoNavigation}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          </>
        )}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-black/10 px-3 py-3">
        <p className="text-xs font-medium text-[#f2eee6]">
          {demoMode ? "Demonstração local" : "Gestão clínica"}
        </p>
        <p className="mt-1 text-[0.68rem] leading-5 text-[#f2eee6]/55">
          {demoMode
            ? "Dados fictícios · sem gravação"
            : "Prontuários e operação da clínica"}
        </p>
      </div>
    </>
  );
}

export function AppShell({ children, demoMode }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavigation, setMobileNavigation] = useState({
    open: false,
    path: "",
  });
  const isMobileNavigationVisible =
    mobileNavigation.open && mobileNavigation.path === pathname;

  useEffect(() => {
    if (!isMobileNavigationVisible) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavigation((current) => ({ ...current, open: false }));
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileNavigationVisible]);

  if (isAuthPage(pathname)) return children;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#34382d] md:flex">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[#3f4433] px-3 py-5 text-[#f2eee6] md:flex">
        <SidebarContent demoMode={demoMode} pathname={pathname} />
      </aside>

      {isMobileNavigationVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-black/45"
            onClick={() => setMobileNavigation((current) => ({ ...current, open: false }))}
            type="button"
          />
          <aside id="mobile-navigation" className="relative flex h-full w-[min(86vw,300px)] flex-col bg-[#3f4433] px-3 py-5 text-[#f2eee6] shadow-2xl">
            <div className="mb-3 flex justify-end px-2">
              <button
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-[#f2eee6]/75 hover:bg-white/10 hover:text-white"
                onClick={() => setMobileNavigation((current) => ({ ...current, open: false }))}
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
            <SidebarContent
              demoMode={demoMode}
              onNavigate={() => setMobileNavigation((current) => ({ ...current, open: false }))}
              pathname={pathname}
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-[#dfd8cc] bg-[#fbfaf7]/95 px-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileNavigationVisible}
              aria-label="Abrir menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7cc] bg-white text-[#3f4433] md:hidden"
              onClick={() => {
                setMobileNavigation({ open: true, path: pathname });
              }}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#3f4433]">
                {pageTitle(pathname)}
              </p>
              <p className="hidden text-[0.68rem] tracking-wide text-[#777468] sm:block">
                CÁSSIA CLINICAL <span className="px-1 text-[#A8786A]">/</span> {pageTitle(pathname)}
              </p>
            </div>
          </div>

          <span
            className={`ml-3 inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold ${
              demoMode
                ? "border-[#c79e8c]/50 bg-[#f3e7df] text-[#795344]"
                : "border-[#d6ddd0] bg-[#edf1e9] text-[#4e6044]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {demoMode ? "Demonstração" : "Clínica"}
          </span>
        </header>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
