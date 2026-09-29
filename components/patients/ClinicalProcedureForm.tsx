"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AnatomicalDiagramEditor,
  DiagramStroke,
  DiagramType,
} from "@/components/patients/AnatomicalDiagramEditor";
import { createClient } from "@/lib/supabase/client";

type ClinicalProcedureFormProps = {
  clinicId: string;
  patientId: string;
  encounterId: string;
  clinicalNoteId: string;
};

const diagramOptions: Array<{
  type: DiagramType;
  label: string;
}> = [
  {
    type: "face_board_v2",
    label: "Prancha facial completa — 4 vistas",
  },
  {
    type: "face_front_v2",
    label: "Face — vistas frontais",
  },
  {
    type: "face_left_v2",
    label: "Face — perfil esquerdo da paciente",
  },
  {
    type: "face_right_v2",
    label: "Face — perfil direito da paciente",
  },
  {
    type: "body_front",
    label: "Corpo — frontal",
  },
  {
    type: "body_left",
    label: "Corpo — perfil esquerdo",
  },
  {
    type: "body_right",
    label: "Corpo — perfil direito",
  },
  {
    type: "body_back",
    label: "Corpo — costas",
  },
];

function emptyDiagramValues(): Record<
  DiagramType,
  DiagramStroke[]
> {
  return {
    face_board_v1: [],
    face_board_v2: [],
    face_front: [],
    face_front_v2: [],
    face_left: [],
    face_left_v2: [],
    face_right: [],
    face_right_v2: [],
    body_front: [],
    body_left: [],
    body_right: [],
    body_back: [],
  };
}

function currentLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ClinicalProcedureForm({
  clinicId,
  patientId,
  encounterId,
  clinicalNoteId,
}: ClinicalProcedureFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [procedureName, setProcedureName] =
    useState("");

  const [procedureDate, setProcedureDate] =
    useState(currentLocalDate);

  const [productUsed, setProductUsed] =
    useState("");

  const [batchNumber, setBatchNumber] =
    useState("");

  const [complications, setComplications] =
    useState("");

  const [notes, setNotes] = useState("");

  const [
    selectedDiagramTypes,
    setSelectedDiagramTypes,
  ] = useState<DiagramType[]>([]);

  const [diagramValues, setDiagramValues] =
    useState<Record<
      DiagramType,
      DiagramStroke[]
    >>(emptyDiagramValues);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function toggleDiagram(
    diagramType: DiagramType,
  ) {
    setSelectedDiagramTypes(
      (currentTypes) => {
        if (
          currentTypes.includes(diagramType)
        ) {
          return currentTypes.filter(
            (type) =>
              type !== diagramType,
          );
        }

        return [
          ...currentTypes,
          diagramType,
        ];
      },
    );
  }

  function updateDiagram(
    diagramType: DiagramType,
    strokes: DiagramStroke[],
  ) {
    setDiagramValues(
      (currentValues) => ({
        ...currentValues,
        [diagramType]: strokes,
      }),
    );
  }

  function resetForm() {
    setProcedureName("");
    setProcedureDate(currentLocalDate());
    setProductUsed("");
    setBatchNumber("");
    setComplications("");
    setNotes("");
    setSelectedDiagramTypes([]);
    setDiagramValues(
      emptyDiagramValues(),
    );
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const trimmedProcedureName =
      procedureName.trim();

    if (!trimmedProcedureName) {
      setError(
        "Informe o nome do procedimento.",
      );
      return;
    }

    if (!procedureDate) {
      setError(
        "Informe a data do procedimento.",
      );
      return;
    }

    if (
      selectedDiagramTypes.length === 0
    ) {
      setError(
        "Selecione pelo menos uma vista anatômica.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase =
        createClient();

      const diagrams =
        selectedDiagramTypes.map(
          (diagramType) => ({
            diagram_type:
              diagramType,
            diagram_markup:
              diagramValues[
                diagramType
              ],
          }),
        );

      const {
        data: procedureId,
        error: procedureError,
      } = await supabase.rpc(
        "create_clinical_note_procedure",
        {
          p_clinic_id: clinicId,
          p_patient_id: patientId,
          p_encounter_id:
            encounterId,
          p_clinical_note_id:
            clinicalNoteId,
          p_procedure_name:
            trimmedProcedureName,
          p_procedure_date:
            procedureDate,
          p_product_used:
            productUsed.trim() ||
            null,
          p_batch_number:
            batchNumber.trim() ||
            null,
          p_complications:
            complications.trim() ||
            null,
          p_notes:
            notes.trim() || null,
          p_diagrams: diagrams,
        },
      );

      if (procedureError) {
        throw procedureError;
      }

      if (!procedureId) {
        throw new Error(
          "O procedimento não foi criado.",
        );
      }

      resetForm();
      setIsOpen(false);

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível criar o procedimento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        className="rounded-xl bg-[#A8786A] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        onClick={() =>
          setIsOpen(true)
        }
        type="button"
      >
        Adicionar procedimento
      </button>
    );
  }

  return (
    <form
      className="mt-4 rounded-2xl border border-[#cfc7ba] bg-white/80 p-5"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Novo procedimento
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
            Registre o procedimento e
            marque diretamente nas vistas
            anatômicas correspondentes.
          </p>
        </div>

        <button
          className="text-sm font-medium text-[#A8786A] hover:underline"
          disabled={isSubmitting}
          onClick={() => {
            resetForm();
            setIsOpen(false);
          }}
          type="button"
        >
          Cancelar
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-[#3f4433]">
          Procedimento
          <input
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            maxLength={160}
            onChange={(event) =>
              setProcedureName(
                event.target.value,
              )
            }
            required
            type="text"
            value={procedureName}
          />
        </label>

        <label className="block text-sm font-medium text-[#3f4433]">
          Data do procedimento
          <input
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            onChange={(event) =>
              setProcedureDate(
                event.target.value,
              )
            }
            required
            type="date"
            value={procedureDate}
          />
        </label>

        <label className="block text-sm font-medium text-[#3f4433]">
          Produto utilizado
          <input
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            maxLength={200}
            onChange={(event) =>
              setProductUsed(
                event.target.value,
              )
            }
            placeholder="Opcional"
            type="text"
            value={productUsed}
          />
        </label>

        <label className="block text-sm font-medium text-[#3f4433]">
          Lote de fabricação
          <input
            className="mt-2 w-full rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
            maxLength={120}
            onChange={(event) =>
              setBatchNumber(
                event.target.value,
              )
            }
            placeholder="Opcional"
            type="text"
            value={batchNumber}
          />
        </label>
      </div>

      <label className="mt-5 block text-sm font-medium text-[#3f4433]">
        Intercorrências / complicações
        <textarea
          className="mt-2 min-h-40 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={4000}
          onChange={(event) =>
            setComplications(
              event.target.value,
            )
          }
          placeholder="Registre intercorrências, complicações ou deixe em branco quando não houver."
          value={complications}
        />
      </label>

      <label className="mt-5 block text-sm font-medium text-[#3f4433]">
        Observações
        <textarea
          className="mt-2 min-h-72 w-full resize-y rounded-xl border border-[#cfc7ba] bg-white px-4 py-3 outline-none transition focus:border-[#A8786A] focus:ring-2 focus:ring-[#A8786A]/20"
          maxLength={8000}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="Espaço amplo para observações detalhadas do procedimento."
          value={notes}
        />
      </label>

      <section className="mt-8">
        <div>
          <h4 className="font-semibold">
            Desenhos anatômicos
          </h4>

          <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
            Selecione todas as vistas
            utilizadas neste procedimento.
            Cada vista possui marcações
            independentes e editáveis.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {diagramOptions.map(
            (option) => {
              const selected =
                selectedDiagramTypes.includes(
                  option.type,
                );

              return (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#cfc7ba] bg-white p-3 text-sm"
                  key={option.type}
                >
                  <input
                    checked={selected}
                    onChange={() =>
                      toggleDiagram(
                        option.type,
                      )
                    }
                    type="checkbox"
                  />

                  <span>
                    {option.label}
                  </span>
                </label>
              );
            },
          )}
        </div>

        {selectedDiagramTypes.length >
        0 ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {selectedDiagramTypes.map(
              (diagramType) => (
                <AnatomicalDiagramEditor
                  diagramType={
                    diagramType
                  }
                  key={diagramType}
                  onChange={(strokes) =>
                    updateDiagram(
                      diagramType,
                      strokes,
                    )
                  }
                  value={
                    diagramValues[
                      diagramType
                    ]
                  }
                />
              ),
            )}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-[#cfc7ba] bg-white/50 p-3 text-xs text-[#6d6d62]">
            Nenhuma vista anatômica
            selecionada.
          </p>
        )}
      </section>

      {error && (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        className="mt-6 w-full rounded-xl bg-[#3f4433] px-4 py-3 text-sm font-semibold text-[#EDE7DC] transition hover:bg-[#32372a] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? "Salvando procedimento..."
          : "Salvar procedimento"}
      </button>
    </form>
  );
}
