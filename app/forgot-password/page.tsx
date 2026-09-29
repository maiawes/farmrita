"use client";

import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const redirectTo = `${window.location.origin}/reset-password`;
      
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinir a senha.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível solicitar a recuperação de senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#3f4433] px-6 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-[#EDE7DC]/30 bg-[#EDE7DC] p-8 shadow-2xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-[#A8786A] text-2xl font-serif italic text-[#3f4433]">
            C
          </div>

          <h2 className="font-serif text-4xl italic tracking-tight text-[#3f4433]">
            Cássia
          </h2>

          <div className="mx-auto mt-3 h-px w-28 bg-[#A8786A]" />

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#6d6d62]">
            Clinical
          </p>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#31362a]">
            Recuperar senha
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
            Informe o e-mail da sua conta para receber as instruções de
            recuperação.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#3f4433]">
            E-mail
            <input
              className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white/70 px-4 py-3 text-[#31362a] outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          {message && (
            <p
              className="rounded-xl border border-[#3f4433]/20 bg-white/60 p-3 text-sm leading-6 text-[#3f4433]"
              role="status"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              className="rounded-xl border border-[#A8786A]/30 bg-[#A8786A]/10 p-3 text-sm text-[#7f5147]"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-[#3f4433] px-4 py-3 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        <a
          className="mt-5 block text-center text-sm font-medium text-[#A8786A] hover:underline"
          href="/login"
        >
          Voltar para o login
        </a>

        <p className="mt-8 border-t border-[#cfc7ba] pt-5 text-center text-xs leading-5 text-[#777468]">
          Ambiente protegido. Não use dados reais de pacientes neste ambiente
          de desenvolvimento.
        </p>
      </section>
    </main>
  );
}