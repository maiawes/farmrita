type BrandMarkProps = {
  subtitle?: string;
  className?: string;
};

function MortarPestleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      viewBox="0 0 48 48"
      width="34"
    >
      <path
        d="M17 10c2 2.5 3.6 5 4.8 7.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M13 18c2.5 0 5.6-.4 8.3-1.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M10 22h22c0 8.2-4.6 13-11 13S10 30.2 10 22Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M32 20c3 .5 5 2.2 5 5 0 3-2.4 5-5.5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M23 27c1.7-3.5 5.1-5.5 9.6-6"
        stroke="#A8786A"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="25" cy="29" fill="#A8786A" r="1.6" />
    </svg>
  );
}

function FaceIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      viewBox="0 0 48 48"
      width="34"
    >
      <path
        d="M31 8c2.2 1.8 4.2 5.2 4.2 9.6 0 2.8-.8 5.3-.8 7.1 0 1.4.6 2.9 2.1 4.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M31 8c-3.2 1.4-5.8 4.6-7.1 8.8-1 3.4-1 6.8-.6 9.8.4 2.8 1.5 4.9 3.4 6.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M26 34.5c1.5 1.9 3.7 3 6.2 3.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M24.8 22.5c1 .7 2.6.8 3.8.2"
        stroke="#A8786A"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="24.4" cy="28.8" fill="#A8786A" r="1.6" />
    </svg>
  );
}

export function BrandMark({
  subtitle = "CÁSSIA CLINICAL",
  className = "",
}: BrandMarkProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-serif text-5xl italic leading-none tracking-tight text-[#3f4433] sm:text-6xl">
        Cássia
      </h2>

      <svg
        aria-hidden="true"
        className="mx-auto mt-1"
        fill="none"
        height="18"
        viewBox="0 0 220 18"
        width="220"
      >
        <path
          d="M8 11c24-7 59-9 101-8 37 .9 70 3.2 103 8"
          stroke="#A8786A"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>

      <div className="mt-4 flex items-center justify-center gap-4 text-[#EDE7DC]">
        <span className="text-[#A8786A]">
          <MortarPestleIcon />
        </span>

        <div className="min-w-[140px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.45em] text-[#3f4433]">
            {subtitle}
          </p>
        </div>

        <span className="text-[#A8786A]">
          <FaceIcon />
        </span>
      </div>
    </div>
  );
}