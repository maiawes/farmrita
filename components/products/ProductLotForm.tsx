"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ProductLotFormProps = {
  clinicId: string;
  productId: string;
  stockUnit: string;
};

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ProductLotForm({
  clinicId,
  productId,
  stockUnit,
}: ProductLotFormProps) {
  const router = useRouter();

  const [batchNumber, setBatchNumber] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [purchaseQuantity, setPurchaseQuantity] =
    useState("1");

  const [purchaseTotalCost, setPurchaseTotalCost] =
    useState("");

  const [baseMultiplier, setBaseMultiplier] =
    useState("1.50");

  const [valueAddedPercent, setValueAddedPercent] =
    useState("45");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => {
    const quantity = parseNumber(purchaseQuantity);
    const totalCost = parseNumber(purchaseTotalCost);
    const multiplier = parseNumber(baseMultiplier);
    const valueAdded = parseNumber(valueAddedPercent);

    if (
      quantity <= 0 ||
      totalCost <= 0 ||
      multiplier < 1 ||
      valueAdded < 0
    ) {
      return null;
    }

    const unitCost = totalCost / quantity;

    const commercialBase =
      unitCost * multiplier;

    const suggestedValue =
      commercialBase *
      (1 + valueAdded / 100);

    return {
      unitCost,
      commercialBase,
      suggestedValue,
    };
  }, [
    purchaseQuantity,
    purchaseTotalCost,
    baseMultiplier,
    valueAddedPercent,
  ]);

  function resetForm() {
    setBatchNumber("");
    setManufactureDate("");
    setExpiryDate("");
    setPurchaseQuantity("1");
    setPurchaseTotalCost("");
    setBaseMultiplier("1.50");
    setValueAddedPercent("45");
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const quantity = parseNumber(purchaseQuantity);
    const totalCost = parseNumber(purchaseTotalCost);
    const multiplier = parseNumber(baseMultiplier);
    const valueAdded = parseNumber(valueAddedPercent);

    if (!batchNumber.trim()) {
      setError("Informe o número do lote.");
      return;
    }

    if (quantity <= 0) {
      setError(
        "A quantidade comprada deve ser maior que zero.",
      );
      return;
    }

    if (totalCost <= 0) {
      setError(
        "O custo total da compra deve ser maior que zero.",
      );
      return;
    }

    if (multiplier < 1 || multiplier > 10) {
      setError(
        "O multiplicador interno deve ficar entre 1 e 10.",
      );
      return;
    }

    if (valueAdded < 0 || valueAdded > 100) {
      setError(
        "O percentual agregado deve ficar entre 0% e 100%.",
      );
      return;
    }

    if (
      manufactureDate &&
      expiryDate &&
      expiryDate < manufactureDate
    ) {
      setError(
        "A validade não pode ser anterior à fabricação.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: lotId,
        error: lotError,
      } = await supabase.rpc(
        "create_product_lot_with_pricing",
        {
          p_clinic_id: clinicId,
          p_product_id: productId,
          p_batch_number: batchNumber.trim(),
          p_manufacture_date:
            manufactureDate || null,
          p_expiry_date:
            expiryDate || null,
          p_purchase_quantity: quantity,
          p_purchase_total_cost: totalCost,
          p_base_multiplier: multiplier,
          p_value_added_percent: valueAdded,
        },
      );

      if (lotError) {
        throw lotError;
      }

      if (!lotId) {
        throw new Error(
          "O lote não foi criado.",
        );
      }

      resetForm();
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível cadastrar o lote.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <section className="rounded-2xl border border-[#cfc7ba] bg-white/70 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A8786A]">
            Identificação do lote
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Rastreabilidade
          </h3>
        </div>

        <label className="mt-5 block text-sm font-medium">
          Número do lote
          <input
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            maxLength={120}
            onChange={(event) =>
              setBatchNumber(event.target.value)
            }
            required
            type="text"
            value={batchNumber}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Data de fabricação
            <input
              className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
              onChange={(event) =>
                setManufactureDate(
                  event.target.value,
                )
              }
              type="date"
              value={manufactureDate}
            />
          </label>

          <label className="block text-sm font-medium">
            Data de validade
            <input
              className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
              onChange={(event) =>
                setExpiryDate(
                  event.target.value,
                )
              }
              type="date"
              value={expiryDate}
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-medium">
          Quantidade comprada
          <div className="mt-2 flex overflow-hidden rounded-xl border border-[#cfc7ba] bg-white">
            <input
              className="min-w-0 flex-1 px-4 py-3 outline-none"
              min="0.0001"
              onChange={(event) =>
                setPurchaseQuantity(
                  event.target.value,
                )
              }
              required
              step="0.0001"
              type="number"
              value={purchaseQuantity}
            />

            <span className="flex items-center border-l border-[#cfc7ba] bg-[#f7f3ec] px-4 text-sm text-[#6d6d62]">
              {stockUnit}
            </span>
          </div>
        </label>
      </section>

      <section className="rounded-2xl border border-[#cfc7ba] bg-white/70 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A8786A]">
            Área administrativa
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Formação interna de preço
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#6d6d62]">
            Estes valores são internos e não serão
            exibidos na ficha do paciente.
          </p>
        </div>

        <label className="mt-5 block text-sm font-medium">
          Custo total da compra
          <div className="mt-2 flex overflow-hidden rounded-xl border border-[#cfc7ba] bg-white">
            <span className="flex items-center border-r border-[#cfc7ba] bg-[#f7f3ec] px-4 text-sm text-[#6d6d62]">
              R$
            </span>

            <input
              className="min-w-0 flex-1 px-4 py-3 outline-none"
              min="0.01"
              onChange={(event) =>
                setPurchaseTotalCost(
                  event.target.value,
                )
              }
              placeholder="0,00"
              required
              step="0.01"
              type="number"
              value={purchaseTotalCost}
            />
          </div>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Multiplicador-base
            <input
              className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
              min="1"
              onChange={(event) =>
                setBaseMultiplier(
                  event.target.value,
                )
              }
              step="0.01"
              type="number"
              value={baseMultiplier}
            />
          </label>

          <label className="block text-sm font-medium">
            Valor agregado
            <div className="mt-2 flex overflow-hidden rounded-xl border border-[#cfc7ba] bg-white">
              <input
                className="min-w-0 flex-1 px-4 py-3 outline-none"
                max="100"
                min="0"
                onChange={(event) =>
                  setValueAddedPercent(
                    event.target.value,
                  )
                }
                step="0.01"
                type="number"
                value={valueAddedPercent}
              />

              <span className="flex items-center border-l border-[#cfc7ba] bg-[#f7f3ec] px-4 text-sm text-[#6d6d62]">
                %
              </span>
            </div>
          </label>
        </div>

        {preview && (
          <div className="mt-6 rounded-2xl border border-[#A8786A]/30 bg-[#f8f4ed] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A8786A]">
              Prévia automática
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#6d6d62]">
                  Custo unitário
                </dt>
                <dd className="font-medium">
                  {formatCurrency(
                    preview.unitCost,
                  )}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[#6d6d62]">
                  Base comercial
                </dt>
                <dd className="font-medium">
                  {formatCurrency(
                    preview.commercialBase,
                  )}
                </dd>
              </div>

              <div className="border-t border-[#cfc7ba] pt-3">
                <div className="flex items-end justify-between gap-4">
                  <dt>
                    <span className="block text-xs uppercase tracking-wide text-[#A8786A]">
                      Valor sugerido
                    </span>
                    <span className="mt-1 block text-xs text-[#6d6d62]">
                      por {stockUnit}
                    </span>
                  </dt>

                  <dd className="text-xl font-semibold">
                    {formatCurrency(
                      preview.suggestedValue,
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        )}
      </section>

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
          ? "Salvando lote..."
          : "Cadastrar lote"}
      </button>
    </form>
  );
}