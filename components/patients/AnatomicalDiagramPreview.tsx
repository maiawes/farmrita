"use client";

import { useState } from "react";

import {
  AnatomicalDiagramEditor,
  DiagramStroke,
  DiagramType,
} from "@/components/patients/AnatomicalDiagramEditor";

const facialViews: Array<{ type: DiagramType; label: string }> = [
  { type: "face_board_v2", label: "Prancha completa" },
  { type: "face_front_v2", label: "Vistas frontais" },
  { type: "face_left_v2", label: "Perfil esquerdo" },
  { type: "face_right_v2", label: "Perfil direito" },
];

export function AnatomicalDiagramPreview() {
  const [diagramType, setDiagramType] = useState<DiagramType>("face_board_v2");
  const [strokesByView, setStrokesByView] = useState<Partial<Record<DiagramType, DiagramStroke[]>>>({});

  return (
    <div className="mx-auto w-full max-w-[680px]">
      <div aria-label="Vista da prancha facial" className="mb-4 flex flex-wrap gap-2" role="group">
        {facialViews.map((view) => (
          <button
            aria-pressed={diagramType === view.type}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${diagramType === view.type ? "border-[#3f4433] bg-[#3f4433] text-white" : "border-[#cfc7ba] bg-white/70 text-[#3f4433] hover:bg-white"}`}
            key={view.type}
            onClick={() => setDiagramType(view.type)}
            type="button"
          >
            {view.label}
          </button>
        ))}
      </div>
      <AnatomicalDiagramEditor
        diagramType={diagramType}
        onChange={(strokes) => setStrokesByView((current) => ({ ...current, [diagramType]: strokes }))}
        value={strokesByView[diagramType] ?? []}
      />
      <p className="mt-3 text-center text-xs text-[#6d6d62]">
        A prévia permite testar as marcações; por ser demonstração, elas não
        são persistidas.
      </p>
    </div>
  );
}
