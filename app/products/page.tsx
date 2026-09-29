import Link from "next/link";

import { ProductForm } from "@/components/products/ProductForm";
import { DemoModeNotice } from "@/components/DemoModeNotice";
import { demoClinic, demoProducts } from "@/lib/demo-data";
import { isLocalDemoMode } from "@/lib/development";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  if (isLocalDemoMode()) {
    return (
      <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
        <div className="mx-auto max-w-7xl">
          <header className="border-b border-[#A8786A]/40 pb-6">
            <h1 className="text-3xl font-semibold">Produtos e insumos</h1>
            <p className="mt-3 text-sm leading-6 text-[#6d6d62]">
              Catálogo clínico com rastreabilidade de lotes e estoque.
            </p>
          </header>
          <div className="mt-6"><DemoModeNotice /></div>
          <div className="mb-4 text-sm text-[#6d6d62]">{demoClinic.name} · {demoProducts.length} itens no catálogo</div>
          <div className="grid gap-4 lg:grid-cols-2">
            {demoProducts.map((product) => (
              <article className="flex flex-col rounded-2xl border border-[#cfc7ba] bg-white/65 p-5" key={product.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">{product.category}</p>
                    <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
                  </div>
                  <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs">{product.active ? "Ativo" : "Inativo"}</span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs uppercase text-[#6d6d62]">Fabricante</dt><dd className="mt-1 font-medium">{product.manufacturer}</dd></div>
                  <div><dt className="text-xs uppercase text-[#6d6d62]">Aplicação</dt><dd className="mt-1 font-medium">{product.application_type}</dd></div>
                  <div><dt className="text-xs uppercase text-[#6d6d62]">Unidade</dt><dd className="mt-1 font-medium">{product.stock_unit}</dd></div>
                  <div><dt className="text-xs uppercase text-[#6d6d62]">Lotes</dt><dd className="mt-1 font-medium">{product.lots.length}</dd></div>
                </dl>
                <Link className="mt-5 rounded-xl border border-[#A8786A] px-4 py-3 text-center text-sm font-semibold text-[#A8786A] hover:bg-[#A8786A]/10" href={`/products/${product.id}`}>Ver produto, lotes e preços</Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name")
    .order("name");

  const clinicPermissions = await Promise.all(
    (clinics ?? []).map(async (clinic) => {
      const { data: canManage } = await supabase.rpc(
        "has_clinic_permission",
        {
          target_clinic_id: clinic.id,
          required_permission: "inventory.adjust",
        },
      );

      return {
        ...clinic,
        canManage: Boolean(canManage),
      };
    }),
  );

  const manageableClinics = clinicPermissions
    .filter((clinic) => clinic.canManage)
    .map(({ id, name }) => ({
      id,
      name,
    }));

  const { data: products, error: productsError } =
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
          active,
          created_at
        `,
      )
      .order("name");

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#A8786A]/40 pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Produtos e insumos</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d6d62]">
                Catálogo interno para rastreabilidade de produtos,
                materiais e insumos utilizados nos procedimentos.
              </p>
            </div>

          </div>
        </header>

        <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-[#cfc7ba] bg-white/65 p-6 shadow-sm">
            <div className="border-b border-[#cfc7ba] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8786A]">
                Cadastro interno
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Novo produto ou insumo
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6d6d62]">
                Cadastre a identificação principal do item.
                Lotes, fabricação, validade e formação interna
                de preço são gerenciados separadamente.
              </p>
            </div>

            <div className="mt-6">
              {user && manageableClinics.length > 0 ? (
                <ProductForm clinics={manageableClinics} />
              ) : (
                <p className="rounded-2xl border border-[#cfc7ba] bg-white/60 p-4 text-sm leading-6 text-[#6d6d62]">
                  Seu perfil não possui permissão para cadastrar
                  produtos ou insumos.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[#cfc7ba] bg-white/65 p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#cfc7ba] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8786A]">
                  Catálogo
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Itens cadastrados
                </h2>

                <p className="mt-2 text-sm text-[#6d6d62]">
                  Selecione um item para gerenciar seus lotes
                  e informações comerciais internas.
                </p>
              </div>

              <span className="rounded-full border border-[#cfc7ba] bg-white/70 px-3 py-1 text-sm text-[#6d6d62]">
                {products?.length ?? 0} item(ns)
              </span>
            </div>

            {productsError ? (
              <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Não foi possível consultar os produtos autorizados.
              </p>
            ) : products && products.length > 0 ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {products.map((product) => (
                  <article
                    className="flex flex-col rounded-2xl border border-[#cfc7ba] bg-white/75 p-5"
                    key={product.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#A8786A]">
                          {product.category}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {product.name}
                        </h3>
                      </div>

                      <span className="rounded-full border border-[#cfc7ba] px-3 py-1 text-xs font-medium text-[#6d6d62]">
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <dl className="mt-5 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#6d6d62]">
                          Fabricante
                        </dt>

                        <dd className="mt-1 font-medium">
                          {product.manufacturer ?? "Não informado"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#6d6d62]">
                          Tipo de aplicação / uso
                        </dt>

                        <dd className="mt-1 font-medium">
                          {product.application_type ??
                            "Não informado"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#6d6d62]">
                          Unidade de estoque
                        </dt>

                        <dd className="mt-1 font-medium">
                          {product.stock_unit}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-auto pt-6">
                      <div className="border-t border-[#cfc7ba] pt-4">
                        <p className="mb-4 text-xs leading-5 text-[#6d6d62]">
                          Gerencie lotes, fabricação, validade,
                          quantidade comprada e formação interna
                          do valor sugerido.
                        </p>

                        <Link
                          className="flex w-full items-center justify-center rounded-xl border border-[#A8786A] px-4 py-3 text-sm font-semibold text-[#A8786A] transition hover:bg-[#A8786A]/10"
                          href={`/products/${product.id}`}
                        >
                          Gerenciar lotes e preços
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#cfc7ba] p-8 text-center">
                <p className="text-sm font-medium">
                  Nenhum produto ou insumo cadastrado.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#6d6d62]">
                  Utilize o formulário ao lado para iniciar
                  o catálogo interno.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
