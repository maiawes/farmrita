import Link from "next/link";
import { notFound } from "next/navigation";

import { ClinicalNoteAddendumForm } from "@/components/patients/ClinicalNoteAddendumForm";
import { ClinicalNoteEditor } from "@/components/patients/ClinicalNoteEditor";
import { ClinicalNoteFinalizer } from "@/components/patients/ClinicalNoteFinalizer";
import { ClinicalNoteForm } from "@/components/patients/ClinicalNoteForm";
import { ClinicalProcedureForm } from "@/components/patients/ClinicalProcedureForm";
import { EncounterForm } from "@/components/patients/EncounterForm";
import { DemoModeNotice } from "@/components/DemoModeNotice";
import { demoClinic, getDemoPatient, getDemoPatientActivity } from "@/lib/demo-data";
import { isLocalDemoMode } from "@/lib/development";
import { createClient } from "@/lib/supabase/server";

type PatientPageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function PatientPage({
  params,
}: PatientPageProps) {
  const { patientId } = await params;

  if (isLocalDemoMode()) {
    const patient = getDemoPatient(patientId);
    if (!patient) notFound();

    const { encounters, notes } = getDemoPatientActivity(patientId);
    const formatDateTime = (value: string) =>
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));

    return (
      <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-4 border-b border-[#A8786A]/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A8786A]">{demoClinic.name}</p>
              <h1 className="mt-2 text-3xl font-semibold">{patient.full_name}</h1>
              {patient.preferred_name && <p className="mt-2 text-sm text-[#6d6d62]">Nome preferido: {patient.preferred_name}</p>}
            </div>
            <Link className="text-sm font-medium text-[#A8786A] hover:underline" href="/patients">Voltar para pacientes</Link>
          </header>

          <div className="mt-6"><DemoModeNotice /></div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Status", "Ativa"],
              ["Atendimentos", String(encounters.length)],
              ["Notas clínicas", String(notes.length)],
              ["Último registro", notes[0] ? new Date(notes[0].created_at).toLocaleDateString("pt-BR") : "Nenhum"],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5" key={label}>
                <p className="text-xs uppercase tracking-wide text-[#6d6d62]">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
            <section className="h-fit rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
              <h2 className="text-lg font-semibold">Dados cadastrais</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="font-medium">Data de nascimento</dt><dd className="mt-1 text-[#6d6d62]">{new Date(`${patient.birth_date}T12:00:00`).toLocaleDateString("pt-BR")}</dd></div>
                <div><dt className="font-medium">E-mail</dt><dd className="mt-1 text-[#6d6d62]">{patient.email}</dd></div>
                <div><dt className="font-medium">Telefone</dt><dd className="mt-1 text-[#6d6d62]">{patient.phone}</dd></div>
                <div><dt className="font-medium">Clínica</dt><dd className="mt-1 text-[#6d6d62]">{demoClinic.name}</dd></div>
                <div><dt className="font-medium">Cadastro demonstrativo</dt><dd className="mt-1 text-[#6d6d62]">{new Date(patient.created_at).toLocaleDateString("pt-BR")}</dd></div>
              </dl>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Atendimentos</h2>
                  <span className="text-sm text-[#6d6d62]">{encounters.length} registro(s)</span>
                </div>
                <div className="mt-4 space-y-3">
                  {encounters.map((encounter) => (
                    <article className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4" key={encounter.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{formatDateTime(encounter.started_at)}</p>
                        <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs">{encounter.status === "completed" ? "Concluído" : "Em andamento"}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#6d6d62]">Profissional: {encounter.professional_name}</p>
                      <p className="mt-2 text-sm leading-6">{encounter.administrative_notes}</p>
                      {encounter.completed_at && <p className="mt-2 text-xs text-[#6d6d62]">Encerrado em {formatDateTime(encounter.completed_at)}</p>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Notas clínicas e procedimentos</h2>
                  <span className="text-sm text-[#6d6d62]">{notes.length} nota(s)</span>
                </div>
                <div className="mt-4 space-y-4">
                  {notes.map((note) => (
                    <article className="rounded-xl border border-[#cfc7ba] bg-white/70 p-5" key={note.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{formatDateTime(note.created_at)}</p>
                          <p className="mt-1 text-xs text-[#6d6d62]">Autoria demonstrativa: {note.author_name}</p>
                        </div>
                        <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs">{note.status === "finalized" ? "Finalizada" : "Rascunho"}</span>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{note.note_text}</p>
                      {note.finalized_at && <p className="mt-2 text-xs text-[#6d6d62]">Finalizada em {formatDateTime(note.finalized_at)}</p>}
                      <div className="mt-4 rounded-xl bg-[#f8f4ed] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">Procedimento demonstrativo</p>
                        <p className="mt-2 text-sm font-medium">{note.procedure_summary}</p>
                        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          <div><dt className="text-xs text-[#6d6d62]">Região</dt><dd className="mt-1">{note.region}</dd></div>
                          <div><dt className="text-xs text-[#6d6d62]">Produtos associados</dt><dd className="mt-1">{note.products.length ? note.products.join(", ") : "Nenhum"}</dd></div>
                        </dl>
                        <p className="mt-3 text-sm text-[#6d6d62]">{note.observations}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select(
      `
        id,
        clinic_id,
        full_name,
        preferred_name,
        birth_date,
        email,
        phone,
        status,
        created_at,
        updated_at
      `,
    )
    .eq("id", patientId)
    .maybeSingle();

  if (patientError || !patient) {
    notFound();
  }

  const { data: canWriteClinicalNotes } = await supabase.rpc(
    "has_clinic_permission",
    {
      target_clinic_id: patient.clinic_id,
      required_permission: "clinical_notes.write",
    },
  );

  const { data: encounters } = await supabase
    .from("encounters")
    .select(
      `
        id,
        status,
        started_at,
        completed_at,
        administrative_notes,
        professional_id
      `,
    )
    .eq("patient_id", patient.id)
    .order("started_at", {
      ascending: false,
    });

  const { data: clinicalNotes } = await supabase
    .from("clinical_notes")
    .select(
      `
        id,
        encounter_id,
        author_id,
        note_text,
        amends_note_id,
        status,
        finalized_at,
        created_at,
        updated_at
      `,
    )
    .eq("patient_id", patient.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#A8786A]/40 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {patient.full_name}
              </h1>

              {patient.preferred_name && (
                <p className="mt-2 text-sm text-[#6d6d62]">
                  Nome preferido: {patient.preferred_name}
                </p>
              )}
            </div>

            <Link
              className="text-sm font-medium text-[#A8786A] hover:underline"
              href="/patients"
            >
              Voltar para pacientes
            </Link>
          </div>
        </header>

        <p className="mt-5 text-sm text-[#A8786A]">
          Ambiente de desenvolvimento. Utilize somente dados fictícios.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <h2 className="text-lg font-semibold">
              Dados cadastrais
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-medium">
                  Data de nascimento
                </dt>

                <dd className="mt-1 text-[#6d6d62]">
                  {patient.birth_date ?? "Não informada"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">
                  E-mail
                </dt>

                <dd className="mt-1 text-[#6d6d62]">
                  {patient.email ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">
                  Telefone
                </dt>

                <dd className="mt-1 text-[#6d6d62]">
                  {patient.phone ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">
                  Status
                </dt>

                <dd className="mt-1 text-[#6d6d62]">
                  {patient.status}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <h2 className="text-lg font-semibold">
              Atendimentos
            </h2>

            <p className="mt-2 text-sm text-[#6d6d62]">
              {encounters?.length ?? 0} atendimento(s)
            </p>

            <div className="mt-4">
              {user && canWriteClinicalNotes ? (
                <EncounterForm
                  clinicId={patient.clinic_id}
                  patientId={patient.id}
                  professionalId={user.id}
                />
              ) : (
                <p className="rounded-xl border border-[#cfc7ba] bg-white/50 p-3 text-xs leading-5 text-[#6d6d62]">
                  Seu perfil não possui permissão clínica para abrir
                  atendimentos.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {encounters && encounters.length > 0 ? (
                encounters.map((encounter) => (
                  <article
                    className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4"
                    key={encounter.id}
                  >
                    <p className="font-medium">
                      {new Date(encounter.started_at).toLocaleString("pt-BR")}
                    </p>

                    <p className="mt-1 text-sm text-[#6d6d62]">
                      Status: {encounter.status}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#6d6d62]">
                  Nenhum atendimento registrado.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
            <h2 className="text-lg font-semibold">
              Notas clínicas
            </h2>

            <p className="mt-2 text-sm text-[#6d6d62]">
              {clinicalNotes?.length ?? 0} nota(s) visível(is)
            </p>

            <div className="mt-4">
              {user && canWriteClinicalNotes ? (
                <ClinicalNoteForm
                  authorId={user.id}
                  clinicId={patient.clinic_id}
                  encounters={(encounters ?? []).map((encounter) => ({
                    id: encounter.id,
                    status: encounter.status,
                    startedAt: encounter.started_at,
                  }))}
                  patientId={patient.id}
                />
              ) : (
                <p className="rounded-xl border border-[#cfc7ba] bg-white/50 p-3 text-xs leading-5 text-[#6d6d62]">
                  Seu perfil não possui permissão clínica para criar notas.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {clinicalNotes && clinicalNotes.length > 0 ? (
                clinicalNotes.map((note) => (
                  <article
                    className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4"
                    key={note.id}
                  >
                    <p className="font-medium">
                      {new Date(note.created_at).toLocaleString("pt-BR")}
                    </p>

                    <p className="mt-1 text-sm text-[#6d6d62]">
                      Status: {note.status}
                    </p>

                    {note.status === "finalized" ? (
                      <details className="mt-3 rounded-xl border border-[#cfc7ba] bg-white/60">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#A8786A]">
                          Abrir nota finalizada
                        </summary>

                        <div className="border-t border-[#cfc7ba] px-4 py-4">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-[#3f4433]">
                            {note.note_text}
                          </p>

                          {note.finalized_at && (
                            <p className="mt-3 text-xs text-[#6d6d62]">
                              Finalizada em:{" "}
                              {new Date(note.finalized_at).toLocaleString(
                                "pt-BR",
                              )}
                            </p>
                          )}

                          {note.amends_note_id && (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#A8786A]">
                              Adendo
                            </p>
                          )}
                        </div>
                      </details>
                    ) : (
                      <>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#3f4433]">
                          {note.note_text}
                        </p>

                        {note.amends_note_id && (
                          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#A8786A]">
                            Adendo
                          </p>
                        )}
                      </>
                    )}

                    {note.status === "draft" &&
  user?.id === note.author_id &&
  canWriteClinicalNotes && (
    <div className="mt-3 space-y-4">
      <div className="space-y-2">
        <ClinicalNoteEditor
          initialText={note.note_text}
          noteId={note.id}
        />

        <ClinicalNoteFinalizer noteId={note.id} />
      </div>

      <ClinicalProcedureForm
        clinicId={patient.clinic_id}
        clinicalNoteId={note.id}
        encounterId={note.encounter_id}
        patientId={patient.id}
      />
    </div>
  )}

                    {note.status === "finalized" &&
                      user &&
                      canWriteClinicalNotes && (
                        <div className="mt-3">
                          <ClinicalNoteAddendumForm
                            authorId={user.id}
                            clinicId={patient.clinic_id}
                            encounterId={note.encounter_id}
                            parentNoteId={note.id}
                            patientId={patient.id}
                          />
                        </div>
                      )}
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#6d6d62]">
                  Nenhuma nota clínica disponível.
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-[#cfc7ba] bg-white/60 p-6">
          <h2 className="text-xl font-semibold">
            Prontuário e procedimentos
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6d6d62]">
            Nesta área entraremos com Novo Atendimento, Nova Nota Clínica e
            Adicionar Procedimento, incluindo os desenhos anatômicos estéticos
            de rosto e corpo, produto utilizado, lote, data, intercorrências e
            observações.
          </p>
        </section>
      </div>
    </main>
  );
}
