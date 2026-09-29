-- Versioned facial plates keep finalized records on their original artwork.
-- These image-backed types are local until the migration is intentionally applied.

alter table public.clinical_note_procedure_diagrams
  drop constraint if exists clinical_note_procedure_diagrams_diagram_type_check;

alter table public.clinical_note_procedure_diagrams
  add constraint clinical_note_procedure_diagrams_diagram_type_check
  check (
    diagram_type in (
      'face_board_v1',
      'face_board_v2',
      'face_front',
      'face_front_v2',
      'face_left',
      'face_left_v2',
      'face_right',
      'face_right_v2',
      'body_front',
      'body_left',
      'body_right',
      'body_back'
    )
  );
