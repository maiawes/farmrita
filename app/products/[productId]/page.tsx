import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductLotForm } from "@/components/products/ProductLotForm";
import { DemoModeNotice } from "@/components/DemoModeNotice";
import { demoClinic, getDemoProduct } from "@/lib/demo-data";
import { isLocalDemoMode } from "@/lib/development";
import { createClient } from "@/lib/supabase/server";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00`),
  );
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { productId } = await params;

  if (isLocalDemoMode()) {
    const product = getDemoProduct(productId);
    if (!product) notFound();

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    const formatDate = (value: string | null) => value
      ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`))
      : "Não informada";

    return (
      <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-4 border-b border-[#A8786A]/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A8786A]">{demoClinic.name} · {product.category}</p>
              <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
              <p className="mt-2 text-sm text-[#6d6d62]">{product.manufacturer} · {product.active ? "Ativo" : "Inativo"}</p>
            </div>
            <Link className="text-sm font-medium text-[#A8786A] hover:underline" href="/products">Voltar ao catálogo</Link>
          </header>
          <div className="mt-6"><DemoModeNotice /></div>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Categoria", product.category],
              ["Fabricante", product.manufacturer ?? "Não informado"],
              ["Aplicação / uso", product.application_type ?? "Não informado"],
              ["Unidade de estoque", product.stock_unit],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5" key={label}>
                <p className="text-xs uppercase tracking-wide text-[#6d6d62]">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl border border-[#cfc7ba] bg-white/65 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#cfc7ba] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8786A]">Rastreabilidade e precificação</p>
                <h2 className="mt-2 text-xl font-semibold">Lotes cadastrados</h2>
              </div>
              <span className="text-sm text-[#6d6d62]">{product.lots.length} lote(s)</span>
            </div>
            {product.lots.length ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {product.lots.map((lot) => (
                  <article className="rounded-2xl border border-[#cfc7ba] bg-white/75 p-5" key={lot.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-xs uppercase tracking-wide text-[#A8786A]">Lote demonstrativo</p><h3 className="mt-1 text-lg font-semibold">{lot.batch_number}</h3></div>
                      <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs">{lot.purchase_quantity} {product.stock_unit}</span>
                    </div>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Fabricação</dt><dd className="mt-1 text-sm font-medium">{formatDate(lot.manufacture_date)}</dd></div>
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Validade</dt><dd className="mt-1 text-sm font-medium">{formatDate(lot.expiry_date)}</dd></div>
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Custo total de compra</dt><dd className="mt-1 text-sm font-medium">{formatCurrency(lot.purchase_total_cost)}</dd></div>
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Custo por unidade</dt><dd className="mt-1 text-sm font-medium">{formatCurrency(lot.purchase_unit_cost)}</dd></div>
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Multiplicador-base</dt><dd className="mt-1 text-sm font-medium">{lot.base_multiplier.toFixed(2)}</dd></div>
                      <div><dt className="text-xs uppercase text-[#6d6d62]">Valor agregado</dt><dd className="mt-1 text-sm font-medium">{lot.value_added_percent.toFixed(2)}%</dd></div>
                    </dl>
                    <div className="mt-5 rounded-xl bg-[#f8f4ed] p-4">
                      <p className="text-xs uppercase tracking-wide text-[#A8786A]">Valor sugerido por {product.stock_unit}</p>
                      <p className="mt-1 text-2xl font-semibold">{formatCurrency(lot.suggested_unit_value)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-[#cfc7ba] p-6 text-sm text-[#6d6d62]">Este item demonstrativo ainda não possui lotes cadastrados.</p>
            )}
          </section>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: product, error: productError } =
    await supabase
      .from("products")
      .select(
        `
          id,
          clinic_id,
          name,
          category,
          manufacturer,
          application_type,
          stock_unit,
          active
        `,
      )
      .eq("id", productId)
      .maybeSingle();

  if (productError || !product) {
    notFound();
  }

  const [
    { data: canReceive },
    { data: canManagePricing },
    { data: canReadPricing },
  ] = await Promise.all([
    supabase.rpc("has_clinic_permission", {
      target_clinic_id: product.clinic_id,
      required_permission: "inventory.receive",
    }),
    supabase.rpc("has_clinic_permission", {
      target_clinic_id: product.clinic_id,
      required_permission: "pricing.manage",
    }),
    supabase.rpc("has_clinic_permission", {
      target_clinic_id: product.clinic_id,
      required_permission: "pricing.read",
    }),
  ]);

  const { data: lots } = await supabase
    .from("product_lots")
    .select(
      `
        id,
        batch_number,
        manufacture_date,
        expiry_date,
        purchase_quantity,
        created_at
      `,
    )
    .eq("product_id", product.id)
    .order("created_at", {
      ascending: false,
    });

  const lotIds =
    lots?.map((lot) => lot.id) ?? [];

  const pricingRows =
    canReadPricing && lotIds.length > 0
      ? (
          await supabase
            .from("product_lot_pricing")
            .select(
              `
                lot_id,
                purchase_total_cost,
                purchase_unit_cost,
                base_multiplier,
                value_added_percent,
                suggested_unit_value
              `,
            )
            .in("lot_id", lotIds)
        ).data ?? []
      : [];

  const canCreateLot =
    Boolean(canReceive) &&
    Boolean(canManagePricing);

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#A8786A]/40 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A8786A]">
                Produtos e insumos
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {product.name}
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
                {product.category}
                {product.manufacturer
                  ? ` · ${product.manufacturer}`
                  : ""}
              </p>
            </div>

            <Link
              className="text-sm font-medium text-[#A8786A] hover:underline"
              href="/products"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5">
            <p className="text-xs uppercase tracking-wide text-[#6d6d62]">
              Categoria
            </p>

            <p className="mt-2 font-semibold">
              {product.category}
            </p>
          </div>

          <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5">
            <p className="text-xs uppercase tracking-wide text-[#6d6d62]">
              Fabricante
            </p>

            <p className="mt-2 font-semibold">
              {product.manufacturer ??
                "Não informado"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5">
            <p className="text-xs uppercase tracking-wide text-[#6d6d62]">
              Aplicação / uso
            </p>

            <p className="mt-2 font-semibold">
              {product.application_type ??
                "Não informado"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#cfc7ba] bg-white/65 p-5">
            <p className="text-xs uppercase tracking-wide text-[#6d6d62]">
              Unidade
            </p>

            <p className="mt-2 font-semibold">
              {product.stock_unit}
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[440px_1fr]">
          <section className="rounded-3xl border border-[#cfc7ba] bg-white/65 p-6 shadow-sm">
            <div className="border-b border-[#cfc7ba] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8786A]">
                Entrada de estoque
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Novo lote
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
                Rastreabilidade, validade e formação
                interna de preço do lote.
              </p>
            </div>

            <div className="mt-6">
              {canCreateLot ? (
                <ProductLotForm
                  clinicId={product.clinic_id}
                  productId={product.id}
                  stockUnit={product.stock_unit}
                />
              ) : (
                <p className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-4 text-sm leading-6 text-[#6d6d62]">
                  Seu perfil não possui todas as
                  permissões necessárias para cadastrar
                  lote e preço interno.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[#cfc7ba] bg-white/65 p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4 border-b border-[#cfc7ba] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8786A]">
                  Rastreabilidade
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Lotes cadastrados
                </h2>
              </div>

              <span className="text-sm text-[#6d6d62]">
                {lots?.length ?? 0}
              </span>
            </div>

            {lots && lots.length > 0 ? (
              <div className="mt-6 space-y-4">
                {lots.map((lot) => {
                  const pricing =
                    pricingRows.find(
                      (row) =>
                        row.lot_id === lot.id,
                    );

                  return (
                    <article
                      className="rounded-2xl border border-[#cfc7ba] bg-white/75 p-5"
                      key={lot.id}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">
                            Lote
                          </p>

                          <h3 className="mt-1 text-lg font-semibold">
                            {lot.batch_number}
                          </h3>
                        </div>

                        <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs text-[#6d6d62]">
                          {lot.purchase_quantity}{" "}
                          {product.stock_unit}
                        </span>
                      </div>

                      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[#6d6d62]">
                            Fabricação
                          </dt>

                          <dd className="mt-1 text-sm font-medium">
                            {formatDate(
                              lot.manufacture_date,
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[#6d6d62]">
                            Validade
                          </dt>

                          <dd className="mt-1 text-sm font-medium">
                            {formatDate(
                              lot.expiry_date,
                            )}
                          </dd>
                        </div>
                      </dl>

                      {pricing && (
                        <div className="mt-5 rounded-2xl border border-[#A8786A]/25 bg-[#f8f4ed] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8786A]">
                            Área administrativa
                          </p>

                          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs text-[#6d6d62]">
                                Custo da compra
                              </dt>

                              <dd className="mt-1 font-medium">
                                {formatCurrency(
                                  pricing.purchase_total_cost,
                                )}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-[#6d6d62]">
                                Custo unitário
                              </dt>

                              <dd className="mt-1 font-medium">
                                {formatCurrency(
                                  pricing.purchase_unit_cost,
                                )}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-[#6d6d62]">
                                Multiplicador
                              </dt>

                              <dd className="mt-1 font-medium">
                                {Number(
                                  pricing.base_multiplier,
                                ).toFixed(2)}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-[#6d6d62]">
                                Valor agregado
                              </dt>

                              <dd className="mt-1 font-medium">
                                {Number(
                                  pricing.value_added_percent,
                                ).toFixed(2)}
                                %
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-4 border-t border-[#cfc7ba] pt-4">
                            <p className="text-xs uppercase tracking-wide text-[#A8786A]">
                              Valor sugerido por{" "}
                              {product.stock_unit}
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                              {formatCurrency(
                                pricing.suggested_unit_value,
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#6d6d62]">
                Nenhum lote cadastrado para este item.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
