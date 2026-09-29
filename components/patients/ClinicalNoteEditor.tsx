"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ClinicalNoteEditorProps = {
  noteId: string;
  initialText: string;
};

export function ClinicalNoteEditor({
  noteId,
  initialText,
}: ClinicalNoteEditorProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const trimmedNote = noteText.trim();

    if (!trimmedNote) {
      setError("A nota clínica não pode ficar vazia.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: updatedNote, error: updateError } = await supabase
        .from("clinical_notes")
        .update({
          note_text: trimmedNote,
        })
        .eq("id", noteId)
        .eq("status", "draft")
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!updatedNote) {
        throw new Error(
          "O rascunho não pôde ser atualizado. Verifique sua permissão e o status da nota.",
        );
      }

      setNoteText(trimmedNote);
      setIsEditing(false);

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível atualizar a nota clínica.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        className="text-sm font-medium text-[#A8786A] hover:underline"
        onClick={() => {
          setError(null);
          setIsEditing(true);
        }}
        type="button"
      >
        Editar rascunho
      </button>
    );
  }

  return (
    <form
      className="mt-4 rounded-xl border border-[#cfc7ba] bg-white/80 p-4"
      onSubmit={handleSubmit}
    >
      <label className="block text-sm font-medium text-[#3f4433]">
        Nota clínica
        <textarea
          className="mt-2 min-h-48 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
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
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>

        <button
          className="rounded-xl border border-[#cfc7ba] px-4 py-2.5 text-sm font-medium text-[#6d6d62] transition hover:bg-white"
          disabled={isSubmitting}
          onClick={() => {
            setError(null);
            setNoteText(initialText);
            setIsEditing(false);
          }}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}