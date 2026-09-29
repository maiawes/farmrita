"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type EncounterFormProps = {
  clinicId: string;
  patientId: string;
  professionalId: string;
};

export function EncounterForm({
  clinicId,
  patientId,
  professionalId,
}: EncounterFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [administrativeNotes, setAdministrativeNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from("encounters")
        .insert({
          clinic_id: clinicId,
          patient_id: patientId,
          professional_id: professionalId,
          administrative_notes: administrativeNotes.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      setAdministrativeNotes("");
      setIsOpen(false);

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível criar o atendimento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        className="rounded-xl bg-[#3f4433] px-4 py-2.5 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Novo atendimento
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
          <h3 className="font-semibold">
            Novo atendimento
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
            O atendimento será aberto com a data e hora atuais.
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
        Observação administrativa
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={2000}
          onChange={(event) => setAdministrativeNotes(event.target.value)}
          placeholder="Opcional. Não utilize este campo para anotações clínicas."
          value={administrativeNotes}
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
        {isSubmitting ? "Abrindo atendimento..." : "Abrir atendimento"}
      </button>
    </form>
  );
}