export const demoClinic = {
  id: "demo-clinic-cassia",
  name: "Clínica Cássia Estética",
  slug: "cassia-estetica",
};

export const demoPatients = [
  {
    id: "demo-patient-ana-silva",
    clinic_id: demoClinic.id,
    full_name: "Ana Beatriz Silva",
    preferred_name: "Ana",
    birth_date: "1992-04-18",
    email: "ana.silva@example.test",
    phone: "(11) 99900-0101",
    status: "active",
    created_at: "2026-08-12T13:30:00.000Z",
    updated_at: "2026-09-20T15:10:00.000Z",
  },
  {
    id: "demo-patient-mariana-costa",
    clinic_id: demoClinic.id,
    full_name: "Mariana Costa Oliveira",
    preferred_name: "Mari",
    birth_date: "1987-11-02",
    email: "mariana.oliveira@example.test",
    phone: "(11) 99900-0102",
    status: "active",
    created_at: "2026-07-03T10:00:00.000Z",
    updated_at: "2026-09-18T14:25:00.000Z",
  },
  {
    id: "demo-patient-julia-mendes",
    clinic_id: demoClinic.id,
    full_name: "Júlia Mendes Rocha",
    preferred_name: null,
    birth_date: "1995-06-27",
    email: "julia.rocha@example.test",
    phone: "(11) 99900-0103",
    status: "active",
    created_at: "2026-09-01T09:15:00.000Z",
    updated_at: "2026-09-24T11:40:00.000Z",
  },
];

export const demoProducts = [
  {
    id: "demo-product-hidratante",
    clinic_id: demoClinic.id,
    name: "Sérum Hidratante Ácido Hialurônico",
    category: "Skincare",
    manufacturer: "DermaLab (fictício)",
    application_type: "Uso tópico profissional",
    stock_unit: "ml",
    active: true,
    created_at: "2026-08-05T12:00:00.000Z",
    lots: [
      {
        id: "demo-lot-hidratante-01",
        batch_number: "DEMO-HI-2608",
        manufacture_date: "2026-06-01",
        expiry_date: "2027-06-01",
        purchase_quantity: 500,
        created_at: "2026-08-05T12:10:00.000Z",
        purchase_total_cost: 420,
        purchase_unit_cost: 0.84,
        base_multiplier: 2.1,
        value_added_percent: 12,
        suggested_unit_value: 1.98,
      },
      {
        id: "demo-lot-hidratante-02",
        batch_number: "DEMO-HI-2609",
        manufacture_date: "2026-07-15",
        expiry_date: "2027-07-15",
        purchase_quantity: 300,
        created_at: "2026-09-02T10:30:00.000Z",
        purchase_total_cost: 279,
        purchase_unit_cost: 0.93,
        base_multiplier: 2.1,
        value_added_percent: 10,
        suggested_unit_value: 2.15,
      },
    ],
  },
  {
    id: "demo-product-mascara",
    clinic_id: demoClinic.id,
    name: "Máscara Calmante de Camomila",
    category: "Máscaras",
    manufacturer: "Botânica Clínica (fictício)",
    application_type: "Uso tópico profissional",
    stock_unit: "g",
    active: true,
    created_at: "2026-08-17T13:00:00.000Z",
    lots: [
      {
        id: "demo-lot-mascara-01",
        batch_number: "DEMO-MC-2607",
        manufacture_date: "2026-05-20",
        expiry_date: "2027-05-20",
        purchase_quantity: 1000,
        created_at: "2026-08-17T13:15:00.000Z",
        purchase_total_cost: 310,
        purchase_unit_cost: 0.31,
        base_multiplier: 1.8,
        value_added_percent: 15,
        suggested_unit_value: 0.64,
      },
    ],
  },
  {
    id: "demo-product-protetor",
    clinic_id: demoClinic.id,
    name: "Protetor Solar Facial FPS 50",
    category: "Proteção solar",
    manufacturer: "Sol & Pele (fictício)",
    application_type: "Uso tópico profissional",
    stock_unit: "ml",
    active: false,
    created_at: "2026-06-22T09:00:00.000Z",
    lots: [],
  },
];

export const demoEncounters = [
  {
    id: "demo-encounter-ana-02",
    patient_id: "demo-patient-ana-silva",
    status: "completed",
    started_at: "2026-09-20T14:00:00.000Z",
    completed_at: "2026-09-20T14:50:00.000Z",
    administrative_notes: "Retorno de acompanhamento (dado fictício).",
    professional_name: "Camila Martins (perfil demonstrativo)",
  },
  {
    id: "demo-encounter-ana-01",
    patient_id: "demo-patient-ana-silva",
    status: "completed",
    started_at: "2026-08-12T13:30:00.000Z",
    completed_at: "2026-08-12T14:20:00.000Z",
    administrative_notes: "Primeira avaliação (dado fictício).",
    professional_name: "Camila Martins (perfil demonstrativo)",
  },
  {
    id: "demo-encounter-mariana-01",
    patient_id: "demo-patient-mariana-costa",
    status: "completed",
    started_at: "2026-09-18T13:30:00.000Z",
    completed_at: "2026-09-18T14:15:00.000Z",
    administrative_notes: "Acompanhamento de rotina (dado fictício).",
    professional_name: "Camila Martins (perfil demonstrativo)",
  },
  {
    id: "demo-encounter-julia-01",
    patient_id: "demo-patient-julia-mendes",
    status: "in_progress",
    started_at: "2026-09-24T11:00:00.000Z",
    completed_at: null,
    administrative_notes: "Avaliação inicial demonstrativa.",
    professional_name: "Camila Martins (perfil demonstrativo)",
  },
];

export const demoClinicalNotes = [
  {
    id: "demo-note-ana-02",
    patient_id: "demo-patient-ana-silva",
    encounter_id: "demo-encounter-ana-02",
    author_name: "Camila Martins",
    note_text:
      "Paciente relata boa adaptação à rotina de cuidados. Pele íntegra, sem queixas no período. Reforçadas orientações gerais de fotoproteção. Registro inteiramente fictício para demonstração.",
    status: "finalized",
    finalized_at: "2026-09-20T14:50:00.000Z",
    created_at: "2026-09-20T14:10:00.000Z",
    procedure_summary: "Higienização e hidratação facial demonstrativa.",
    products: ["Sérum Hidratante Ácido Hialurônico", "Máscara Calmante de Camomila"],
    region: "Face",
    observations: "Sem intercorrências no exemplo demonstrativo.",
  },
  {
    id: "demo-note-ana-01",
    patient_id: "demo-patient-ana-silva",
    encounter_id: "demo-encounter-ana-01",
    author_name: "Camila Martins",
    note_text:
      "Avaliação inicial demonstrativa. Paciente fictícia apresenta pele mista e relata sensibilidade sazonal. Objetivo: acompanhamento de hidratação e rotina domiciliar.",
    status: "finalized",
    finalized_at: "2026-08-12T14:20:00.000Z",
    created_at: "2026-08-12T13:50:00.000Z",
    procedure_summary: "Avaliação e higienização facial demonstrativa.",
    products: ["Sérum Hidratante Ácido Hialurônico"],
    region: "Face",
    observations: "Sem intercorrências no exemplo demonstrativo.",
  },
  {
    id: "demo-note-mariana-01",
    patient_id: "demo-patient-mariana-costa",
    encounter_id: "demo-encounter-mariana-01",
    author_name: "Camila Martins",
    note_text:
      "Retorno demonstrativo. Paciente fictícia relata conforto com a rotina de cuidados. Mantido acompanhamento e registro de evolução.",
    status: "finalized",
    finalized_at: "2026-09-18T14:15:00.000Z",
    created_at: "2026-09-18T13:55:00.000Z",
    procedure_summary: "Hidratação facial demonstrativa.",
    products: ["Máscara Calmante de Camomila"],
    region: "Face",
    observations: "Sem intercorrências no exemplo demonstrativo.",
  },
  {
    id: "demo-note-julia-01",
    patient_id: "demo-patient-julia-mendes",
    encounter_id: "demo-encounter-julia-01",
    author_name: "Camila Martins",
    note_text:
      "Rascunho de avaliação inicial fictícia. Anamnese demonstrativa em andamento; confirmar objetivos e sensibilidade da pele no retorno.",
    status: "draft",
    finalized_at: null,
    created_at: "2026-09-24T11:20:00.000Z",
    procedure_summary: "Avaliação inicial, sem procedimento registrado.",
    products: [],
    region: "Não aplicável",
    observations: "Rascunho demonstrativo.",
  },
];

export function getDemoPatient(patientId: string) {
  return demoPatients.find((patient) => patient.id === patientId) ?? null;
}

export function getDemoProduct(productId: string) {
  return demoProducts.find((product) => product.id === productId) ?? null;
}

export function getDemoPatientActivity(patientId: string) {
  return {
    encounters: demoEncounters.filter((encounter) => encounter.patient_id === patientId),
    notes: demoClinicalNotes.filter((note) => note.patient_id === patientId),
  };
}
