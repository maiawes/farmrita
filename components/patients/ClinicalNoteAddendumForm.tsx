"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ClinicalNoteAddendumFormProps = {
  parentNoteId: string;
  clinicId: string;
  patientId: string;
  encounterId: string;
  authorId: string;
};

export function ClinicalNoteAddendumForm({
  parentNoteId,
  clinicId,
  patientId,
  encounterId,
  authorId,
}: ClinicalNoteAddendumFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const trimmedNote = noteText.trim();

    if (!trimmedNote) {
      setError("Digite o conteúdo do adendo.");
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
          encounter_id: encounterId,
          author_id: authorId,
          note_text: trimmedNote,
          status: "draft",
          amends_note_id: parentNoteId,
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
          : "Não foi possível criar o adendo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        className="text-sm font-medium text-[#A8786A] hover:underline"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Criar adendo
      </button>
    );
  }

  return (
    <form
      className="mt-3 rounded-xl border border-[#cfc7ba] bg-white/80 p-4"
      onSubmit={handleSubmit}
    >
      <h3 className="font-semibold">
        Novo adendo
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
        O adendo será registrado como uma nova nota em rascunho. A nota
        original permanecerá inalterada.
      </p>

      <label className="mt-4 block text-sm font-medium text-[#3f4433]">
        Conteúdo do adendo
        <textarea
          className="mt-2 min-h-40 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={50000}
          onChange={(event) => setNoteText(event.target.value)}
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

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="rounded-xl bg-[#3f4433] px-4 py-2.5 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Salvar adendo como rascunho"}
        </button>

        <button
          className="rounded-xl border border-[#cfc7ba] px-4 py-2.5 text-sm font-medium text-[#6d6d62] transition hover:bg-white"
          disabled={isSubmitting}
          onClick={() => {
            setError(null);
            setNoteText("");
            setIsOpen(false);
          }}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}