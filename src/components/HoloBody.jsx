import { BODY_OUTLINE } from './bodyOutline.js';

const PARTS = [
  { id: 'brain', label: 'Brain' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'heart', label: 'Heart' },
  { id: 'lungs', label: 'Lungs' },
  { id: 'bone', label: 'Bone' },
  { id: 'immune', label: 'Immune' },
];

export function HoloBody({ model, selected, onSelect, title }) {
  const heart = (1 - model.cardio * 0.45).toFixed(3);
  const face = (1 + model.fluid * 0.12).toFixed(3);
  const boneOp = Math.max(0.35, 1 - model.bone * 0.65).toFixed(3);
  const immune = Math.max(0.25, 1 - model.immune * 0.7).toFixed(3);
  const dash = model.bone > 0.22 ? '3 2.4' : 'none';
  const hot = (id) => (selected === id ? 1 : 0.55);

  return (
    <svg viewBox="68 55 192 456" role="img" aria-label={title} className="holo-svg">
      <g className="reticle" fill="none">
        <circle cx="166" cy="270" r="150" />
        <circle cx="166" cy="270" r="108" strokeDasharray="2 6" />
        <path d="M166 70v400M78 250h176" />
      </g>
      <g className="flesh" fill="none" stroke="var(--cyan)">
        {BODY_OUTLINE.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      <g className="skeleton" fill="none" stroke="var(--cyan)" opacity={boneOp} strokeDasharray={dash} onClick={() => onSelect?.('bone')}>
        <path d="M166 118v168" />
        <path d="M148 142c12 6 24 6 36 0M144 156c14 8 30 8 44 0M148 170c12 6 24 6 36 0M150 184c10 6 22 6 32 0M154 198c8 4 16 4 24 0" />
        <path d="M150 248c10 14 22 14 32 0" />
        <path d="M148 262l-8 78M184 262l8 78" />
        <path d="M140 128h52" />
      </g>
      <g className="organ" opacity={hot('lungs')} stroke="var(--cyan)" fill="var(--cyan)" fillOpacity="0.08" onClick={() => onSelect?.('lungs')}>
        <path d="M158 148c-16 4-22 22-16 48 4 16 14 22 22 12 4-8 2-28-6-60z" />
        <path d="M174 148c16 4 22 22 16 48-4 16-14 22-22 12-4-8-2-28 6-60z" />
      </g>
      <g
        className="organ"
        opacity={hot('heart')}
        transform={`translate(176 178) scale(${heart}) translate(-176 -178)`}
        onClick={() => onSelect?.('heart')}
      >
        <path
          d="M176 164c-8-12-22-8-22 8 0 18 22 34 22 34s22-16 22-34c0-16-14-20-22-8z"
          fill="var(--heart)"
          fillOpacity="0.28"
          stroke="var(--heart)"
        />
      </g>
      <g
        className="organ"
        opacity={hot('brain')}
        transform={`translate(166 82) scale(${face} 1) translate(-166 -82)`}
        stroke="var(--cyan)"
        fill="none"
        onClick={() => onSelect?.('brain')}
      >
        <path d="M150 78c2-14 30-16 34 0 6 10 2 22-8 26-10 4-22 2-26-6-4-8-2-14 0-20z" />
        <path d="M158 74c6 4 14 4 20-2M156 84c8 3 16 2 22-4" />
      </g>
      <g className="organ" opacity={hot('eyes')} fill="none" stroke="var(--cyan)" onClick={() => onSelect?.('eyes')}>
        <ellipse cx="156" cy="95" rx="7" ry="3.2" />
        <ellipse cx="176" cy="95" rx="7" ry="3.2" />
        <circle cx="157" cy="95" r="1.3" fill="var(--cyan)" stroke="none" />
        <circle cx="175" cy="95" r="1.3" fill="var(--cyan)" stroke="none" />
      </g>
      <g className="organ" fill="var(--cyan)" stroke="none" opacity={immune} onClick={() => onSelect?.('immune')}>
        <circle cx="166" cy="124" r="2.2" />
        <circle cx="142" cy="150" r="2.2" />
        <circle cx="190" cy="150" r="2.2" />
        <circle cx="156" cy="268" r="2" />
        <circle cx="176" cy="268" r="2" />
      </g>
      <line className="scan" x1="78" x2="254" y1="70" y2="70" />
    </svg>
  );
}

export const HOLO_PARTS = PARTS;
