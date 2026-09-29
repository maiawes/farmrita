"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ClinicOption = {
  id: string;
  name: string;
};

type PatientFormProps = {
  clinics: ClinicOption[];
};

export function PatientForm({ clinics }: PatientFormProps) {
  const router = useRouter();

  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!clinicId) {
      setError("Nenhuma clínica autorizada foi encontrada.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Informe um nome válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase.from("patients").insert({
        clinic_id: clinicId,
        full_name: fullName.trim(),
        preferred_name: preferredName.trim() || null,
        birth_date: birthDate || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      setFullName("");
      setPreferredName("");
      setBirthDate("");
      setEmail("");
      setPhone("");

      setSuccess("Paciente fictício cadastrado com sucesso.");

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível cadastrar o paciente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (clinics.length === 0) {
    return (
      <p className="rounded-xl border border-[#A8786A]/30 bg-[#A8786A]/10 p-4 text-sm text-[#7f5147]">
        Nenhuma clínica autorizada está disponível para cadastro.
      </p>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-[#3f4433]">
        Clínica
        <select
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setClinicId(event.target.value)}
          value={clinicId}
        >
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-[#3f4433]">
        Nome completo
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setFullName(event.target.value)}
          required
          type="text"
          value={fullName}
        />
      </label>

      <label className="block text-sm font-medium text-[#3f4433]">
        Nome preferido
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setPreferredName(event.target.value)}
          type="text"
          value={preferredName}
        />
      </label>

      <label className="block text-sm font-medium text-[#3f4433]">
        Data de nascimento
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setBirthDate(event.target.value)}
          type="date"
          value={birthDate}
        />
      </label>

      <label className="block text-sm font-medium text-[#3f4433]">
        E-mail
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>

      <label className="block text-sm font-medium text-[#3f4433]">
        Telefone
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none focus:border-[#A8786A]"
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          value={phone}
        />
      </label>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          {success}
        </p>
      )}

      <button
        className="w-full rounded-xl bg-[#3f4433] px-4 py-3 font-semibold text-[#EDE7DC] transition hover:bg-[#32372a] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Salvando..." : "Cadastrar paciente"}
      </button>
    </form>
  );
}
