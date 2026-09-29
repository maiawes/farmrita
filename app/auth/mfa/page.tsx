"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string | null; status: string };

export default function MfaPage() {
  const [factor, setFactor] = useState<Factor | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFactors() {
      try {
        const supabase = createClient();
        const { data, error: listError } = await supabase.auth.mfa.listFactors();
        if (listError) throw listError;
        const verified = data.totp.find((item) => item.status === "verified");
        setFactor(verified ?? null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Não foi possível carregar o MFA.");
      }
    }

    void loadFactors();
  }, []);

  async function enroll() {
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "CÁSSIA Clinical",
      });
      if (enrollError) throw enrollError;
      setFactor({ id: data.id, friendly_name: data.friendly_name, status: "unverified" });
      setQrCode(data.totp.qr_code);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível iniciar o MFA.");
    }
  }

  async function verify() {
    if (!factor) return;
    setError(null);
    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      setMessage("MFA configurado com sucesso. Você pode voltar ao dashboard.");
      setQrCode(null);
      setFactor({ ...factor, status: "verified" });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Código MFA inválido.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="text-sm font-medium text-[#527963] hover:underline" href="/">← Voltar</Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Autenticação multifator</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Administradores devem configurar um aplicativo autenticador antes do uso em produção.</p>
        {factor?.status === "verified" && <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700" role="status">{message ?? "MFA já está configurado para esta conta."}</p>}
        {!factor && <button className="mt-8 w-full rounded-xl bg-[#283c34] px-4 py-3 text-sm font-semibold text-white" onClick={enroll} type="button">Configurar autenticador</button>}
        {qrCode && <div className="mt-6 space-y-4"><p className="text-sm text-slate-600">Escaneie o QR code no seu aplicativo autenticador e informe o código gerado.</p><Image alt="QR code para configurar o MFA" className="mx-auto size-48" height={192} src={qrCode} unoptimized width={192} /><input aria-label="Código MFA" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-center tracking-[0.35em] outline-none focus:ring-2 focus:ring-[#86a995]" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value)} placeholder="000000" value={code} /><button className="w-full rounded-xl bg-[#283c34] px-4 py-3 text-sm font-semibold text-white" onClick={verify} type="button">Verificar código</button></div>}
        {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
      </section>
    </main>
  );
}
