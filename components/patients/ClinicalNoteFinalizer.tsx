"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ClinicalNoteFinalizerProps = {
  noteId: string;
};

export function ClinicalNoteFinalizer({
  noteId,
}: ClinicalNoteFinalizerProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFinalize() {
    const confirmed = window.confirm(
      "Deseja finalizar esta nota clínica? Depois de finalizada, ela não poderá mais ser editada. Correções posteriores deverão ser registradas por adendo.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: finalizedNote, error: updateError } = await supabase
        .from("clinical_notes")
        .update({
          status: "finalized",
        })
        .eq("id", noteId)
        .eq("status", "draft")
        .select("id, status, finalized_at")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!finalizedNote) {
        throw new Error(
          "A nota não pôde ser finalizada. Verifique sua permissão e o status atual.",
        );
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível finalizar a nota clínica.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3">
      {error && (
        <p
          className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        className="rounded-xl border border-[#A8786A] px-4 py-2.5 text-sm font-semibold text-[#A8786A] transition hover:bg-[#A8786A]/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={handleFinalize}
        type="button"
      >
        {isSubmitting ? "Finalizando..." : "Finalizar nota"}
      </button>
    </div>
  );
}