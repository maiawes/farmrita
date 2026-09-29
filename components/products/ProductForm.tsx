"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ClinicOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  clinics: ClinicOption[];
};

const categories = [
  "Produto injetável",
  "Produto tópico",
  "Seringa",
  "Agulha",
  "Cânula",
  "Soro",
  "Água para injeção",
  "Material descartável",
  "Cosmético",
  "Outro insumo",
];

const applicationTypes = [
  "Intradérmica",
  "Intramuscular",
  "Subcutânea",
  "Tópica",
  "Uso externo",
  "Material / insumo",
  "Outro",
];

const stockUnits = [
  "unidade",
  "mL",
  "mg",
  "g",
  "frasco",
  "ampola",
  "seringa",
  "agulha",
  "cânula",
  "bolsa",
  "caixa",
];

export function ProductForm({
  clinics,
}: ProductFormProps) {
  const router = useRouter();

  const [clinicId, setClinicId] = useState(
    clinics[0]?.id ?? "",
  );
  const [name, setName] = useState("");
  const [category, setCategory] = useState(
    categories[0],
  );
  const [manufacturer, setManufacturer] =
    useState("");
  const [applicationType, setApplicationType] =
    useState("");
  const [stockUnit, setStockUnit] = useState(
    stockUnits[0],
  );

  const [error, setError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const trimmedName = name.trim();

    if (!clinicId) {
      setError("Selecione uma clínica.");
      return;
    }

    if (!trimmedName) {
      setError(
        "Informe o nome do produto ou insumo.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: insertError } =
        await supabase
          .from("products")
          .insert({
            clinic_id: clinicId,
            name: trimmedName,
            category,
            manufacturer:
              manufacturer.trim() || null,
            application_type:
              applicationType || null,
            stock_unit: stockUnit,
          });

      if (insertError) {
        throw insertError;
      }

      setName("");
      setManufacturer("");
      setApplicationType("");
      setCategory(categories[0]);
      setStockUnit(stockUnits[0]);

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível cadastrar o item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
    >
      {clinics.length > 1 && (
        <label className="block text-sm font-medium">
          Clínica
          <select
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            onChange={(event) =>
              setClinicId(event.target.value)
            }
            value={clinicId}
          >
            {clinics.map((clinic) => (
              <option
                key={clinic.id}
                value={clinic.id}
              >
                {clinic.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block text-sm font-medium">
        Produto ou insumo
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={160}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Ex.: Cânula 22G"
          required
          type="text"
          value={name}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Categoria
          <select
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            onChange={(event) =>
              setCategory(event.target.value)
            }
            value={category}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Unidade de estoque
          <select
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            onChange={(event) =>
              setStockUnit(event.target.value)
            }
            value={stockUnit}
          >
            {stockUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium">
        Fabricante
        <input
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={160}
          onChange={(event) =>
            setManufacturer(event.target.value)
          }
          placeholder="Opcional"
          type="text"
          value={manufacturer}
        />
      </label>

      <label className="block text-sm font-medium">
        Tipo de aplicação / uso
        <select
          className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          onChange={(event) =>
            setApplicationType(
              event.target.value,
            )
          }
          value={applicationType}
        >
          <option value="">
            Não informado
          </option>

          {applicationTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
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
        {isSubmitting
          ? "Cadastrando..."
          : "Cadastrar produto / insumo"}
      </button>
    </form>
  );
}