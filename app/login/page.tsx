"use client";

import { FormEvent, useState } from "react";

import { BrandMark } from "@/components/branding/BrandMark";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const next = new URLSearchParams(window.location.search).get("next");

      window.location.assign(
        next?.startsWith("/") && !next.startsWith("//") ? next : "/",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível iniciar a sessão.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#3f4433] px-6 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-[#EDE7DC]/30 bg-[#EDE7DC] p-8 shadow-2xl">
        <div className="mb-10">
          <BrandMark subtitle="CÁSSIA CLINICAL" />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#31362a]">
            Entrar na sua conta
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
            O acesso é somente por convite da organização.
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

          <label className="block text-sm font-medium text-[#3f4433]">
            Senha

            <div className="relative mt-2">
              <input
                className="w-full rounded-xl border border-[#cfc7ba] bg-white/70 px-4 py-3 pr-12 text-[#31362a] outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />

              <button
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#6d6d62] transition hover:text-[#3f4433]"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5.3 9 5.3a15.9 15.9 0 01-2.2 2.8M6.6 6.7C4.3 8.2 3 10.3 3 10.3S6.5 16 12 16a9.4 9.4 0 003.1-.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

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
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <a
          className="mt-5 block text-center text-sm font-medium text-[#A8786A] hover:underline"
          href="/forgot-password"
        >
          Esqueci minha senha
        </a>

        <p className="mt-8 border-t border-[#cfc7ba] pt-5 text-center text-xs leading-5 text-[#777468]">
          Ambiente protegido. Não use dados reais de pacientes neste ambiente
          de desenvolvimento.
        </p>
      </section>
    </main>
  );
}