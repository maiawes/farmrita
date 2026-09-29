"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type EncounterOption = {
  id: string;
  status: string;
  startedAt: string;
};

type ClinicalNoteFormProps = {
  clinicId: string;
  patientId: string;
  authorId: string;
  encounters: EncounterOption[];
};

export function ClinicalNoteForm({
  clinicId,
  patientId,
  authorId,
  encounters,
}: ClinicalNoteFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [encounterId, setEncounterId] = useState(
    encounters.find((encounter) => encounter.status === "open")?.id ??
      encounters[0]?.id ??
      "",
  );
  const selectedEncounterId =
  encounterId ||
  encounters.find((encounter) => encounter.status === "open")?.id ||
  encounters[0]?.id ||
  "";
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const trimmedNote = noteText.trim();

  if (!selectedEncounterId) {
      setError("Selecione um atendimento.");
      return;
    }

    if (!trimmedNote) {
      setError("Digite o conteúdo da nota clínica.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from("clinical_notes")
        .insert({
          clinic_id: clinicId,
          patient_id: patientId,
          encounter_id: selectedEncounterId,
          author_id: authorId,
          note_text: trimmedNote,
          status: "draft",
        });

      if (insertError) {
        throw insertError;
      }

      setNoteText("");
      setIsOpen(false);

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível criar a nota clínica.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (encounters.length === 0) {
    return (
      <p className="rounded-xl border border-[#cfc7ba] bg-white/50 p-3 text-xs leading-5 text-[#6d6d62]">
        Abra um atendimento antes de criar uma nota clínica.
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button
        className="rounded-xl bg-[#3f4433] px-4 py-2.5 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Nova nota clínica
      </button>
    );
  }

  return (
    <form
      className="rounded-xl border border-[#cfc7ba] bg-white/70 p-4"
      onSubmit={handleSubmit}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Nova nota clínica</h3>

          <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
            A nota será salva inicialmente como rascunho.
          </p>
        </div>

        <button
          className="text-sm font-medium text-[#A8786A] hover:underline"
          onClick={() => {
            setError(null);
            setIsOpen(false);
          }}
          type="button"
        >
          Cancelar
        </button>
      </div>

      <label className="mt-4 block text-sm font-medium text-[#3f4433]">
        Atendimento
        <select
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          onChange={(event) => setEncounterId(event.target.value)}
          required
          value={selectedEncounterId}
        >
          {encounters.map((encounter) => (
            <option key={encounter.id} value={encounter.id}>
              {new Date(encounter.startedAt).toLocaleString("pt-BR")} ·{" "}
              {encounter.status}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-[#3f4433]">
        Nota clínica
        <textarea
          className="mt-2 min-h-48 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={50000}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder="Registre aqui a evolução e as informações clínicas pertinentes ao atendimento."
          required
          value={noteText}
        />
      </label>

      {error && (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        className="mt-4 w-full rounded-xl bg-[#3f4433] px-4 py-3 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Salvando..." : "Salvar como rascunho"}
      </button>
    </form>
  );
}