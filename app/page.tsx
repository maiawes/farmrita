import Link from "next/link";

import { DemoModeNotice } from "@/components/DemoModeNotice";
import { demoClinicalNotes, demoEncounters, demoPatients, demoProducts } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { isLocalDemoMode } from "@/lib/development";

export default async function HomePage() {
  if (isLocalDemoMode()) {
    return (
      <main className="min-h-screen bg-[#EDE7DC] px-6 py-12 text-[#3f4433]">
        <div className="mx-auto max-w-5xl">
          <header className="border-b border-[#A8786A]/40 pb-6">
            <h1 className="text-3xl font-semibold">Visão geral</h1>
            <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
              Um resumo demonstrativo da rotina clínica e dos insumos.
            </p>
          </header>

          <section className="mt-8">
            <DemoModeNotice />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Pacientes", demoPatients.length, "/patients"],
                ["Produtos", demoProducts.length, "/products"],
                ["Atendimentos", demoEncounters.length, "/patients"],
                ["Notas clínicas", demoClinicalNotes.length, "/patients"],
                ["Prancha facial", "4 vistas", "/demo/anatomical-diagrams"],
              ].map(([label, count, href]) => (
                <Link
                  className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  href={String(href)}
                  key={String(label)}
                >
                  <p className="text-sm text-[#6d6d62]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold">{count}</p>
                  <p className="mt-3 text-xs font-semibold text-[#A8786A]">Abrir módulo →</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Pacientes recentes</h2>
                  <Link className="text-sm text-[#A8786A] hover:underline" href="/patients">Ver todos</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {demoPatients.slice(0, 3).map((patient) => (
                    <Link className="block rounded-xl border border-[#cfc7ba] bg-white/70 p-4 hover:border-[#A8786A]" href={`/patients/${patient.id}`} key={patient.id}>
                      <p className="font-semibold">{patient.full_name}</p>
                      <p className="mt-1 text-sm text-[#6d6d62]">{patient.status === "active" ? "Ativa" : patient.status}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Estoque demonstrativo</h2>
                  <Link className="text-sm text-[#A8786A] hover:underline" href="/products">Ver catálogo</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {demoProducts.map((product) => (
                    <Link className="flex items-center justify-between gap-4 rounded-xl border border-[#cfc7ba] bg-white/70 p-4 hover:border-[#A8786A]" href={`/products/${product.id}`} key={product.id}>
                      <span className="font-medium">{product.name}</span>
                      <span className="shrink-0 text-sm text-[#6d6d62]">{product.lots.length} lote(s)</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clinics, error: clinicsError } = await supabase
    .from("clinics")
    .select("id, name, slug")
    .order("name");

  const clinicsWithPermissions = await Promise.all(
    (clinics ?? []).map(async (clinic) => {
      const [
        { data: canReadDashboard, error: dashboardPermissionError },
        { data: canReadPhotos, error: photosPermissionError },
      ] = await Promise.all([
        supabase.rpc("has_clinic_permission", {
          target_clinic_id: clinic.id,
          required_permission: "dashboard.read",
        }),
        supabase.rpc("has_clinic_permission", {
          target_clinic_id: clinic.id,
          required_permission: "photos.read",
        }),
      ]);

      return {
        ...clinic,
        canReadDashboard: Boolean(canReadDashboard),
        canReadPhotos: Boolean(canReadPhotos),
        dashboardPermissionError:
          dashboardPermissionError?.message ?? null,
        photosPermissionError:
          photosPermissionError?.message ?? null,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-12 text-[#3f4433]">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#A8786A]/40 pb-6">
          <h1 className="text-3xl font-semibold">Visão geral</h1>
          <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
            Acompanhe o estado de acesso e as permissões configuradas para a clínica.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
          <h2 className="text-xl font-semibold">
            Fundação técnica ativa
          </h2>

          <p className="mt-3 leading-7 text-[#6d6d62]">
            Usuário autenticado: {user ? "sim" : "não"}
          </p>

          {clinicsError ? (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Não foi possível consultar as clínicas autorizadas.
              </p>

              <p className="mt-2 font-mono text-xs">
                {clinicsError.message}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm font-semibold text-[#A8786A]">
                Clínicas liberadas pela RLS: {clinicsWithPermissions.length}
              </p>

              <div className="mt-3 space-y-3">
                {clinicsWithPermissions.map((clinic) => (
                  <div
                    className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4"
                    key={clinic.id}
                  >
                    <p className="font-semibold">{clinic.name}</p>

                    <p className="mt-1 text-sm text-[#6d6d62]">
                      {clinic.slug}
                    </p>

                    <div className="mt-4 space-y-2 text-sm font-medium">
                      <p>
                        dashboard.read:{" "}
                        <span
                          className={
                            clinic.canReadDashboard
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {clinic.canReadDashboard ? "permitido" : "negado"}
                        </span>
                      </p>

                      <p>
                        photos.read:{" "}
                        <span
                          className={
                            clinic.canReadPhotos
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {clinic.canReadPhotos ? "permitido" : "negado"}
                        </span>
                      </p>
                    </div>

                    {clinic.dashboardPermissionError && (
                      <p className="mt-2 font-mono text-xs text-red-700">
                        {clinic.dashboardPermissionError}
                      </p>
                    )}

                    {clinic.photosPermissionError && (
                      <p className="mt-2 font-mono text-xs text-red-700">
                        {clinic.photosPermissionError}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-[#A8786A]">
            Não utilize dados reais de pacientes neste ambiente.
          </p>
        </section>
      </div>
    </main>
  );
}
