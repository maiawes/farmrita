-- Add the immutable original four-view facial board as a persisted diagram type.
-- Legacy individual face diagram types remain accepted for existing records.

alter table public.clinical_note_procedure_diagrams
  drop constraint if exists clinical_note_procedure_diagrams_diagram_type_check;

alter table public.clinical_note_procedure_diagrams
  add constraint clinical_note_procedure_diagrams_diagram_type_check
  check (
    diagram_type in (
      'face_board_v1',
      'face_front',
      'face_left',
      'face_right',
      'body_front',
      'body_left',
      'body_right',
      'body_back'
    )
  );
