import { notFound } from "next/navigation";

import { DemoModeNotice } from "@/components/DemoModeNotice";
import { AnatomicalDiagramPreview } from "@/components/patients/AnatomicalDiagramPreview";
import { isLocalDemoMode } from "@/lib/development";

export default function AnatomicalDiagramsDemoPage() {
  if (!isLocalDemoMode()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#EDE7DC] px-6 py-10 text-[#3f4433]">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#A8786A]/40 pb-6">
          <div>
            <h1 className="text-3xl font-semibold">Prancha de análise facial</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d6d62]">
              A própria imagem enviada, preservada sem redesenho, agora serve
              de fundo para as marcações. No prontuário, o desenho é salvo como
              parte do registro clínico imutável.
            </p>
          </div>
        </header>

        <div className="mt-6">
          <DemoModeNotice />
        </div>

        <section className="mt-6 rounded-2xl border border-[#cfc7ba] bg-white/60 p-4 sm:p-6">
          <AnatomicalDiagramPreview />
        </section>
      </div>
    </main>
  );
}
