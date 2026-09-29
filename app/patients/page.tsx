import Link from "next/link";

import { PatientForm } from "@/components/patients/PatientForm";
import { DemoModeNotice } from "@/components/DemoModeNotice";
import { demoClinic, demoPatients } from "@/lib/demo-data";
import { isLocalDemoMode } from "@/lib/development";
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage() {
  if (isLocalDemoMode()) {
    return (
      <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-[#A8786A]/40 pb-6">
            <h1 className="text-3xl font-semibold">Pacientes e prontuários</h1>
            <p className="mt-3 text-sm leading-6 text-[#6d6d62]">
              Consulte os dados cadastrais, atendimentos e notas clínicas de cada paciente.
            </p>
          </header>
          <div className="mt-6">
            <DemoModeNotice />
          </div>
          <section className="mt-6 rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Pacientes cadastrados</h2>
                <p className="mt-1 text-sm text-[#6d6d62]">{demoClinic.name}</p>
              </div>
              <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-sm">{demoPatients.length} pacientes</span>
            </div>
            <div className="mt-5 space-y-3">
              {demoPatients.map((patient) => (
                <article className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4" key={patient.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link className="font-semibold hover:text-[#A8786A] hover:underline" href={`/patients/${patient.id}`}>
                        {patient.full_name}
                      </Link>
                      {patient.preferred_name && <p className="mt-1 text-sm text-[#6d6d62]">Nome preferido: {patient.preferred_name}</p>}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">Ativa</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#6d6d62] sm:grid-cols-3">
                    <p>{patient.email}</p><p>{patient.phone}</p><p>Nascimento: {patient.birth_date}</p>
                  </div>
                  <Link className="mt-4 inline-block text-sm font-semibold text-[#A8786A] hover:underline" href={`/patients/${patient.id}`}>Abrir prontuário →</Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: clinics, error: clinicsError } = await supabase
    .from("clinics")
    .select("id, name")
    .order("name");

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select(
      `
        id,
        clinic_id,
        full_name,
        preferred_name,
        birth_date,
        status,
        created_at
      `,
    )
    .order("full_name");

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#A8786A]/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Pacientes e prontuários</h1>
            <p className="mt-2 text-sm text-[#6d6d62]">
              Dados cadastrais e histórico clínico em um só lugar.
            </p>
          </div>
        </header>

        <p className="mt-5 text-sm text-[#A8786A]">
          Ambiente de desenvolvimento. Utilize somente pacientes fictícios.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <h2 className="text-xl font-semibold">
              Novo paciente
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
              Cadastre somente dados fictícios nesta fase.
            </p>

            <div className="mt-6">
              {clinicsError ? (
                <p className="text-sm text-red-700">
                  Não foi possível consultar as clínicas autorizadas.
                </p>
              ) : (
                <PatientForm clinics={clinics ?? []} />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Pacientes cadastrados
              </h2>

              <span className="text-sm text-[#6d6d62]">
                {patients?.length ?? 0}
              </span>
            </div>

            {patientsError ? (
              <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                Não foi possível consultar os pacientes autorizados.
              </p>
            ) : patients && patients.length > 0 ? (
              <div className="mt-6 space-y-3">
                {patients.map((patient) => (
                  <article
                    className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4"
                    key={patient.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">
                          <Link
                            className="transition hover:text-[#A8786A] hover:underline"
                            href={`/patients/${patient.id}`}
                          >
                            {patient.full_name}
                          </Link>
                        </h3>

                        {patient.preferred_name && (
                          <p className="mt-1 text-sm text-[#6d6d62]">
                            Nome preferido: {patient.preferred_name}
                          </p>
                        )}
                      </div>

                      <span className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">
                        {patient.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-[#6d6d62]">
                      <p>
                        Clínica:{" "}
                        {clinics?.find(
                          (clinic) => clinic.id === patient.clinic_id,
                        )?.name ?? "Clínica não encontrada"}
                      </p>

                      {patient.birth_date && (
                        <p>
                          Nascimento: {patient.birth_date}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#6d6d62]">
                Nenhum paciente fictício cadastrado.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
