"use client";

import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export type DiagramType =
  | "face_board_v1"
  | "face_board_v2"
  | "face_front"
  | "face_front_v2"
  | "face_left"
  | "face_left_v2"
  | "face_right"
  | "face_right_v2"
  | "body_front"
  | "body_left"
  | "body_right"
  | "body_back";

export type DiagramPoint = {
  x: number;
  y: number;
  pressure: number;
};

export type DiagramStroke = {
  id: string;
  /** O campo é opcional para manter compatibilidade com marcações já salvas. */
  tool?: "pen" | "entry_point";
  points: DiagramPoint[];
};

type AnatomicalDiagramEditorProps = {
  diagramType: DiagramType;
  value: DiagramStroke[];
  onChange: (strokes: DiagramStroke[]) => void;
  disabled?: boolean;
};

const diagramLabels: Record<DiagramType, string> = {
  face_board_v1: "Prancha facial completa — modelo anterior",
  face_board_v2: "Prancha facial completa — 4 vistas",
  face_front: "Face — frontal — modelo anterior",
  face_front_v2: "Face — vistas frontais",
  face_left: "Face — perfil esquerdo da paciente",
  face_left_v2: "Face — perfil esquerdo da paciente",
  face_right: "Face — perfil direito da paciente",
  face_right_v2: "Face — perfil direito da paciente",
  body_front: "Corpo — frontal",
  body_left: "Corpo — perfil esquerdo",
  body_right: "Corpo — perfil direito",
  body_back: "Corpo — costas",
};

const diagramCanvas: Record<DiagramType, { width: number; height: number }> = {
  face_board_v1: { width: 650, height: 778 },
  face_board_v2: { width: 1254, height: 1254 },
  face_front: { width: 1000, height: 1000 },
  face_front_v2: { width: 1086, height: 1448 },
  face_left: { width: 1000, height: 1000 },
  face_left_v2: { width: 1086, height: 1448 },
  face_right: { width: 1000, height: 1000 },
  face_right_v2: { width: 1222, height: 1287 },
  body_front: { width: 1000, height: 1000 },
  body_left: { width: 1000, height: 1000 },
  body_right: { width: 1000, height: 1000 },
  body_back: { width: 1000, height: 1000 },
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(Math.max(value, minimum), maximum);
}

function FaceFrontTemplate() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <FaceProportionGuides />

      <g
        fill="none"
        stroke="#68665f"
        strokeWidth="3.2"
        vectorEffect="non-scaling-stroke"
      >
        {/* Silhouette and hair framing the face */}
        <path d="M299 416 C274 330 276 232 327 164 C368 110 430 82 500 82 C570 82 632 110 673 164 C724 232 726 330 701 416 C695 497 715 584 743 680 C705 753 645 805 584 829 L416 829 C355 805 295 753 257 680 C285 584 305 497 299 416Z" />
        <path d="M309 352 C299 276 322 195 376 151 C415 119 456 105 500 105 C544 105 585 119 624 151 C678 195 701 276 691 352" />
        <path d="M311 342 C327 280 362 231 409 194 C437 172 464 153 500 142 C536 153 563 172 591 194 C638 231 673 280 689 342" />
        <path d="M319 316 C297 383 302 489 322 572 C335 627 357 675 383 709" />
        <path d="M681 316 C703 383 698 489 678 572 C665 627 643 675 617 709" />

        {/* Face contour, ears and neck */}
        <path d="M326 310 C329 264 366 227 412 207 C441 194 470 184 500 183 C530 184 559 194 588 207 C634 227 671 264 674 310 C679 359 690 404 690 448 C690 509 671 568 642 615 C609 669 558 706 500 711 C442 706 391 669 358 615 C329 568 310 509 310 448 C310 404 321 359 326 310Z" />
        <path d="M314 369 C282 347 255 368 253 409 C251 450 268 486 301 493" />
        <path d="M686 369 C718 347 745 368 747 409 C749 450 732 486 699 493" />
        <path d="M274 407 C285 388 295 389 304 408 M726 407 C715 388 705 389 696 408" strokeWidth="2.2" />
        <path d="M425 672 C423 727 408 778 375 827 M575 672 C577 727 592 778 625 827" />
        <path d="M375 827 C328 839 289 869 263 914 M625 827 C672 839 711 869 737 914" />
        <path d="M263 914 C345 891 421 884 500 884 C579 884 655 891 737 914" />

        {/* Brows and eyes */}
        <path d="M348 351 C377 326 420 317 459 335 C469 340 478 346 484 352" />
        <path d="M516 352 C522 346 531 340 541 335 C580 317 623 326 652 351" />
        <path d="M355 379 C383 355 423 352 459 370 C468 375 475 382 480 388 C451 409 415 414 385 402 C372 397 362 389 355 379Z" />
        <path d="M520 388 C525 382 532 375 541 370 C577 352 617 355 645 379 C638 389 628 397 615 402 C585 414 549 409 520 388Z" />
        <path d="M365 381 C394 365 432 366 466 386 M534 386 C568 366 606 365 635 381" strokeWidth="1.8" />
        <path d="M395 384 C413 374 437 376 452 390 C437 403 413 405 395 394 C391 392 391 388 395 384Z" fill="#d8d1c7" strokeWidth="1.8" />
        <path d="M548 390 C563 376 587 374 605 384 C609 388 609 392 605 394 C587 405 563 403 548 390Z" fill="#d8d1c7" strokeWidth="1.8" />
        <path d="M422 379 C431 379 438 385 438 391 C438 397 431 402 422 402 C413 402 406 397 406 391 C406 385 413 379 422 379Z" fill="#68665f" strokeWidth="1.3" />
        <path d="M578 379 C587 379 594 385 594 391 C594 397 587 402 578 402 C569 402 562 397 562 391 C562 385 569 379 578 379Z" fill="#68665f" strokeWidth="1.3" />
        <path d="M422 382 C426 382 429 385 429 389 C429 393 426 396 422 396 C418 396 415 393 415 389 C415 385 418 382 422 382Z" fill="#f8f5ef" stroke="none" />
        <path d="M578 382 C582 382 585 385 585 389 C585 393 582 396 578 396 C574 396 571 393 571 389 C571 385 574 382 578 382Z" fill="#f8f5ef" stroke="none" />
        <path d="M362 374 C369 366 376 362 384 359 M638 374 C631 366 624 362 616 359" strokeWidth="1.7" />
        <path d="M354 415 C377 426 399 430 421 428 M646 415 C623 426 601 430 579 428" stroke="#aaa39a" strokeWidth="1.7" />

        {/* Nose, nostrils and natural facial planes */}
        <path d="M486 397 C481 433 473 465 463 492 C458 505 465 515 480 518" />
        <path d="M514 397 C519 433 527 465 537 492 C542 505 535 515 520 518" />
        <path d="M463 492 C475 482 487 478 500 478 C513 478 525 482 537 492" stroke="#aaa39a" strokeWidth="1.8" />
        <path d="M465 506 C475 520 488 526 500 526 C512 526 525 520 535 506" />
        <path d="M470 511 C480 505 489 504 500 505 C511 504 520 505 530 511" strokeWidth="1.7" />
        <path d="M479 530 C481 546 480 557 476 568 M521 530 C519 546 520 557 524 568" stroke="#aaa39a" strokeWidth="1.7" />

        {/* Lips, philtrum and chin */}
        <path d="M449 590 C466 581 480 578 490 583 C495 586 498 589 500 590 C502 589 505 586 510 583 C520 578 534 581 551 590 C539 601 527 607 514 609 C507 610 503 608 500 606 C497 608 493 610 486 609 C473 607 461 601 449 590Z" />
        <path d="M455 591 C478 594 488 596 500 596 C512 596 522 594 545 591" strokeWidth="1.6" />
        <path d="M461 620 C483 630 517 630 539 620" stroke="#aaa39a" strokeWidth="1.8" />
        <path d="M459 646 C482 657 518 657 541 646" stroke="#aaa39a" strokeWidth="1.8" />
        <path d="M461 680 C483 690 517 690 539 680" stroke="#aaa39a" strokeWidth="1.8" />

        {/* Fine hair and neck details */}
        <path d="M343 221 C365 178 403 145 450 127 M657 221 C635 178 597 145 550 127" stroke="#aaa39a" strokeWidth="1.8" />
        <path d="M337 539 C346 606 375 661 415 697 M663 539 C654 606 625 661 585 697" stroke="#aaa39a" strokeWidth="1.8" />
        <path d="M443 754 C461 766 480 772 500 772 C520 772 539 766 557 754" stroke="#aaa39a" strokeWidth="1.8" />
      </g>
    </g>
  );
}

function FaceProportionGuides({ profile = false }: { profile?: boolean }) {
  const horizontalGuides = profile
    ? [292, 382, 470, 535]
    : [300, 390, 490, 590];

  return (
    <g
      fill="none"
      pointerEvents="none"
      stroke="#c83e37"
      strokeOpacity="0.56"
      strokeWidth="2.2"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M205 165 H795 M205 300 H795 M205 435 H795 M205 570 H795 M205 705 H795" strokeOpacity="0.32" />
      <path d="M300 125 V790 M400 125 V790 M500 125 V790 M600 125 V790 M700 125 V790" strokeOpacity="0.32" />
      {horizontalGuides.map((y) => (
        <path d={`M225 ${y} H775`} key={y} />
      ))}
      {!profile && <path d="M500 145 V790" strokeDasharray="8 12" strokeOpacity="0.5" />}
      <path
        d={
          profile
            ? "M260 400 C248 280 285 175 365 125 C430 86 520 95 590 145 C660 195 690 278 680 370 C670 440 640 515 615 570"
            : "M300 355 C310 225 375 125 455 98 C485 87 515 87 545 98 C625 125 690 225 700 355"
        }
        stroke="#1453b8"
        strokeOpacity="0.95"
        strokeWidth="4"
      />
    </g>
  );
}

function FaceLeftTemplate() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M600 120 C460 115 355 215 350 360 C345 505 410 610 525 675" />
      <path d="M600 120 C650 180 665 250 650 315" />
      <path d="M650 315 C700 350 710 385 650 410" />
      <path d="M650 410 C675 440 665 465 625 470" />
      <path d="M625 470 C650 495 640 520 605 525" />
      <path d="M605 525 C590 590 565 635 525 675" />
      <path d="M500 315 C545 290 585 300 610 330" />
      <path d="M505 350 C540 365 570 365 595 345" />
      <path d="M525 675 C505 730 500 765 510 815" />
      <path d="M600 630 C630 700 650 755 655 815" />
    </g>
  );
}

function FaceRightTemplate() {
  return <g transform="translate(1000 0) scale(-1 1)"><FaceLeftTemplate /></g>;
}

function BodyFrontTemplate() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      vectorEffect="non-scaling-stroke"
    >
      <circle cx="500" cy="120" r="68" />

      <path d="M465 188 L450 235" />
      <path d="M535 188 L550 235" />

      <path d="M450 235 C390 245 350 275 325 320" />
      <path d="M550 235 C610 245 650 275 675 320" />

      <path d="M325 320 C300 405 280 485 260 575" />
      <path d="M675 320 C700 405 720 485 740 575" />

      <path d="M260 575 L240 700" />
      <path d="M740 575 L760 700" />

      <path d="M450 235 C430 350 425 455 450 555" />
      <path d="M550 235 C570 350 575 455 550 555" />

      <path d="M450 555 C430 620 415 700 405 820" />
      <path d="M550 555 C570 620 585 700 595 820" />

      <path d="M405 820 L390 935" />
      <path d="M595 820 L610 935" />

      <path d="M450 555 C470 575 530 575 550 555" />

      <path
        d="M500 235 L500 555"
        strokeDasharray="10 12"
      />

      <path d="M445 390 C475 410 525 410 555 390" />
    </g>
  );
}

function BodyBackTemplate() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      vectorEffect="non-scaling-stroke"
    >
      <circle cx="500" cy="120" r="68" />

      <path d="M465 188 L450 235" />
      <path d="M535 188 L550 235" />

      <path d="M450 235 C390 245 350 275 325 320" />
      <path d="M550 235 C610 245 650 275 675 320" />

      <path d="M325 320 C300 405 280 485 260 575" />
      <path d="M675 320 C700 405 720 485 740 575" />

      <path d="M260 575 L240 700" />
      <path d="M740 575 L760 700" />

      <path d="M450 235 C430 350 425 455 450 555" />
      <path d="M550 235 C570 350 575 455 550 555" />

      <path d="M450 555 C430 620 415 700 405 820" />
      <path d="M550 555 C570 620 585 700 595 820" />

      <path d="M405 820 L390 935" />
      <path d="M595 820 L610 935" />

      <path d="M450 555 C470 575 530 575 550 555" />

      <path d="M500 235 L500 555" />
      <path d="M435 320 C465 350 485 365 500 370" />
      <path d="M565 320 C535 350 515 365 500 370" />
      <path d="M455 535 C475 515 525 515 545 535" />
    </g>
  );
}

function BodyLeftTemplate() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      vectorEffect="non-scaling-stroke"
    >
      <circle cx="500" cy="120" r="68" />

      <path d="M515 188 C510 210 505 225 500 245" />

      <path d="M500 245 C545 260 575 295 585 350" />
      <path d="M585 350 C595 420 590 480 575 535" />

      <path d="M575 535 C600 585 610 630 605 675" />
      <path d="M605 675 C595 735 585 790 580 850" />
      <path d="M580 850 L575 940" />

      <path d="M500 245 C460 270 440 315 445 370" />
      <path d="M445 370 C450 430 460 485 455 535" />

      <path d="M455 535 C435 590 430 640 440 690" />
      <path d="M440 690 C450 755 455 815 455 875" />
      <path d="M455 875 L450 940" />

      <path d="M555 300 C610 330 635 390 620 455" />
      <path d="M620 455 C610 500 600 535 585 565" />

      <path d="M480 245 C470 335 470 430 475 535" />
    </g>
  );
}

function BodyRightTemplate() {
  return (
    <g transform="translate(1000 0) scale(-1 1)">
      <BodyLeftTemplate />
    </g>
  );
}

function DiagramTemplate({
  diagramType,
}: {
  diagramType: DiagramType;
}) {
  if (diagramType === "face_board_v1") {
    return (
      <image
        height="778"
        href="/images/facial-analysis-reference.png"
        preserveAspectRatio="none"
        width="650"
      />
    );
  }

  if (diagramType === "face_board_v2") {
    return (
      <image
        height="1254"
        href="/images/facial-analysis-board.png"
        preserveAspectRatio="none"
        width="1254"
      />
    );
  }

  if (diagramType === "face_front") return <FaceFrontTemplate />;

  if (diagramType === "face_front_v2") {
    return (
      <image
        height="1448"
        href="/images/facial-front-views.png"
        preserveAspectRatio="none"
        width="1086"
      />
    );
  }

  if (diagramType === "face_left") return <FaceLeftTemplate />;

  if (diagramType === "face_left_v2") {
    return (
      <image
        height="1448"
        href="/images/facial-profile-views.png"
        preserveAspectRatio="none"
        width="1086"
      />
    );
  }

  if (diagramType === "face_right") return <FaceRightTemplate />;

  if (diagramType === "face_right_v2") {
    return (
      <image
        height="1287"
        href="/images/facial-profile-right.png"
        preserveAspectRatio="none"
        width="1222"
      />
    );
  }

  if (diagramType === "body_front") {
    return <BodyFrontTemplate />;
  }

  if (diagramType === "body_left") {
    return <BodyLeftTemplate />;
  }

  if (diagramType === "body_right") {
    return <BodyRightTemplate />;
  }

  return <BodyBackTemplate />;
}

export function AnatomicalDiagramEditor({
  diagramType,
  value,
  onChange,
  disabled = false,
}: AnatomicalDiagramEditorProps) {
  const canvas = diagramCanvas[diagramType];
  const aspectClass =
    diagramType === "face_board_v1"
      ? "aspect-[650/778]"
      : diagramType === "face_board_v2"
        ? "aspect-square"
        : diagramType === "face_front_v2" || diagramType === "face_left_v2"
          ? "aspect-[1086/1448]"
          : diagramType === "face_right_v2"
            ? "aspect-[1222/1287]"
            : "aspect-square";
  const svgRef = useRef<SVGSVGElement>(null);
  const strokesRef = useRef<DiagramStroke[]>(value);
  const activeStrokeIdRef = useRef<string | null>(null);
  const [activeTool, setActiveTool] = useState<"pen" | "entry_point">("pen");

  useEffect(() => {
    strokesRef.current = value;
  }, [value]);

  function commit(nextStrokes: DiagramStroke[]) {
    strokesRef.current = nextStrokes;
    onChange(nextStrokes);
  }

  function getPoint(
    event: ReactPointerEvent<SVGSVGElement>,
  ): DiagramPoint | null {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return null;
    }

    return {
      x: clamp(
        ((event.clientX - rect.left) / rect.width) * 1000,
        0,
        1000,
      ),
      y: clamp(
        ((event.clientY - rect.top) / rect.height) * 1000,
        0,
        1000,
      ),
      pressure:
        event.pressure > 0
          ? event.pressure
          : 0.5,
    };
  }

  function handlePointerDown(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (disabled) {
      return;
    }

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    const point = getPoint(event);

    if (!point) {
      return;
    }

    event.preventDefault();

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    const stroke: DiagramStroke = {
      id: crypto.randomUUID(),
      tool: activeTool,
      points: [point],
    };

    activeStrokeIdRef.current = activeTool === "pen" ? stroke.id : null;

    commit([
      ...strokesRef.current,
      stroke,
    ]);

    if (activeTool === "entry_point") {
      return;
    }
  }

  function handlePointerMove(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    const activeStrokeId =
      activeStrokeIdRef.current;

    if (!activeStrokeId || disabled) {
      return;
    }

    const point = getPoint(event);

    if (!point) {
      return;
    }

    event.preventDefault();

    const nextStrokes =
      strokesRef.current.map((stroke) =>
        stroke.id === activeStrokeId
          ? {
              ...stroke,
              points: [
                ...stroke.points,
                point,
              ],
            }
          : stroke,
      );

    commit(nextStrokes);
  }

  function stopDrawing(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    activeStrokeIdRef.current = null;
  }

  function handleUndo() {
    if (
      disabled ||
      strokesRef.current.length === 0
    ) {
      return;
    }

    commit(
      strokesRef.current.slice(0, -1),
    );
  }

  function handleClear() {
    if (
      disabled ||
      strokesRef.current.length === 0
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja remover todas as marcações deste desenho?",
    );

    if (!confirmed) {
      return;
    }

    commit([]);
  }

  return (
    <div className="rounded-2xl border border-[#cfc7ba] bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold">
            {diagramLabels[diagramType]}
          </h4>

          <p className="mt-1 text-xs leading-5 text-[#6d6d62]">
            Use mouse, toque ou caneta. As marcações
            ficam vinculadas exatamente a esta vista
            anatômica.
          </p>
          {(diagramType === "face_left_v2" || diagramType === "face_right_v2") && (
            <p className="mt-1 text-xs leading-5 text-[#795344]">
              Confirme se a orientação desta ilustração corresponde ao lado anatômico tratado antes de registrar.
            </p>
          )}
        </div>

        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            <div aria-label="Ferramenta de marcação" className="flex rounded-lg border border-[#cfc7ba] bg-white p-1" role="group">
              <button
                aria-pressed={activeTool === "pen"}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${activeTool === "pen" ? "bg-[#3f4433] text-white" : "text-[#55564e] hover:bg-[#f2eee6]"}`}
                onClick={() => setActiveTool("pen")}
                type="button"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path d="m4 20 4.5-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <path d="m14.8 6.7 3 3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Caneta
              </button>
              <button
                aria-pressed={activeTool === "entry_point"}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${activeTool === "entry_point" ? "bg-[#3f4433] text-white" : "text-[#55564e] hover:bg-[#f2eee6]"}`}
                onClick={() => setActiveTool("entry_point")}
                type="button"
              >
                <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-current">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                Ponto de entrada
              </button>
            </div>

            <button
              className="rounded-lg border border-[#cfc7ba] px-3 py-2 text-xs font-medium disabled:opacity-40"
              disabled={value.length === 0}
              onClick={handleUndo}
              type="button"
            >
              Desfazer
            </button>

            <button
              className="rounded-lg border border-[#A8786A] px-3 py-2 text-xs font-medium text-[#A8786A] disabled:opacity-40"
              disabled={value.length === 0}
              onClick={handleClear}
              type="button"
            >
              Limpar desenho
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#cfc7ba] bg-[#faf8f4]">
        <svg
          aria-label={
            diagramLabels[diagramType]
          }
          className={`${aspectClass} w-full touch-none select-none text-[#68665f]`}
          onPointerCancel={stopDrawing}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          ref={svgRef}
          role="img"
          viewBox={
            `0 0 ${canvas.width} ${canvas.height}`
          }
        >
          <rect
            fill="#faf8f4"
            height={canvas.height}
            width={canvas.width}
            x="0"
            y="0"
          />

          <DiagramTemplate
            diagramType={diagramType}
          />

          <g
            transform={
              `scale(${canvas.width / 1000} ${canvas.height / 1000})`
            }
          >
            {value.map((stroke) => {
            if (stroke.tool === "entry_point") {
              const [point] = stroke.points;
              if (!point) return null;

              return (
                <g key={stroke.id} pointerEvents="none">
                  <circle cx={point.x} cy={point.y} fill="#fff" r="11" />
                  <circle cx={point.x} cy={point.y} fill="#b83f35" r="7" stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <circle cx={point.x} cy={point.y} fill="#fff" r="2" />
                </g>
              );
            }

            const averagePressure =
              stroke.points.reduce(
                (total, point) =>
                  total + point.pressure,
                0,
              ) /
              Math.max(
                stroke.points.length,
                1,
              );

            const strokeWidth =
              3 + averagePressure * 5;

            if (
              stroke.points.length === 1
            ) {
              const [point] =
                stroke.points;

              return (
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill="#A8786A"
                  key={stroke.id}
                  r={strokeWidth / 2}
                />
              );
            }

            return (
              <polyline
                fill="none"
                key={stroke.id}
                points={stroke.points
                  .map(
                    (point) =>
                      `${point.x},${point.y}`,
                  )
                  .join(" ")}
                stroke="#A8786A"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
