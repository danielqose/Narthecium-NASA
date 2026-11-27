export function BodyFigure({ model, title }) {
  const heart = (1 - model.cardio * 0.85).toFixed(3);
  const face = (1 + model.fluid * 0.16).toFixed(3);
  const boneOp = Math.max(0.22, 0.95 - model.bone * 0.85).toFixed(3);
  const immune = Math.max(0.12, 1 - model.immune * 0.9).toFixed(3);
  const dash = model.bone > 0.2 ? `${(2.1 - model.bone).toFixed(2)} ${(1.1 + model.bone * 2.6).toFixed(2)}` : 'none';
  const dose = Math.min(0.28, model.doseVis * 0.28);

  return (
    <svg viewBox="0 0 160 420" role="img" aria-label={title}>
      <ellipse cx="80" cy="176" rx="34" ry="58" fill="oklch(0.58 0.14 27)" opacity={dose} />
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round">
        <path d="M80 18c-16 1-28 14-28 32 0 14 7 25 16 31l-8 16c-18 6-30 22-31 44l-6 46c-2 14 8 18 16 14l10-42 4 36-6 54c-8 36-2 78 6 112h14l6-64 8 64h12l8-64 6 64h14c8-34 14-76 6-112l-6-54 4-36 10 42c8 4 18 0 16-14l-6-46c-1-22-13-38-31-44l-8-16c9-6 16-17 16-31 0-18-12-31-28-32z" />
        <g opacity={boneOp} strokeDasharray={dash}>
          <g transform={`translate(80 50) scale(${face} 1) translate(-80 -50)`}>
            <ellipse cx="80" cy="50" rx="18" ry="22" />
            <path d="M68 48h6M86 48h6" />
          </g>
          <path d="M80 96v148" />
          <path d="M62 124c12 7 24 7 36 0M58 140c14 9 30 9 44 0M60 156c12 8 28 8 40 0M64 172c10 6 22 6 32 0M68 188c8 5 16 5 24 0" />
          <path d="M62 244c10 14 26 14 36 0" />
          <path d="M66 252l-10 96M94 252l10 96M46 156v48M114 156v48" />
        </g>
        <g transform={`translate(74 158) scale(${heart}) translate(-74 -158)`} opacity="0.95">
          <path d="M74 146c-6-8-16-6-18 2-2 10 8 18 18 26 10-8 20-16 18-26-2-8-12-10-18-2z" />
        </g>
        <path d="M64 132c-6 12-4 26 2 36M96 132c6 12 4 26-2 36" opacity="0.7" />
        <g fill="currentColor" stroke="none" opacity={immune}>
          <circle cx="80" cy="104" r="2.1" />
          <circle cx="50" cy="154" r="2.1" />
          <circle cx="110" cy="154" r="2.1" />
          <circle cx="70" cy="236" r="1.8" />
          <circle cx="90" cy="236" r="1.8" />
        </g>
      </g>
    </svg>
  );
}
