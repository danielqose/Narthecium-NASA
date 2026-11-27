import { HoloStage } from './HoloStage.jsx';

const LEVEL_WORD = {
  nominal: 'Nominal',
  watch: 'Watch',
  act: 'Act',
  urgent: 'Urgent',
};

const CALLOUTS = [
  { id: 'brain', label: 'Brain', signal: 'sleepEff', side: 'left', top: '18%' },
  { id: 'lungs', label: 'Lungs', signal: 'spo2', side: 'left', top: '46%' },
  { id: 'bone', label: 'Bone', signal: 'grip', side: 'left', top: '72%' },
  { id: 'heart', label: 'Heart', signal: 'hr', side: 'right', top: '30%' },
  { id: 'immune', label: 'Immune', signal: 'temp', side: 'right', top: '52%' },
  { id: 'eyes', label: 'Eyes', signal: 'activity', side: 'right', top: '74%' },
];

export function Diagnostics({
  snap,
  sparks,
  pin,
  setPin,
  setView,
  layer,
  setLayer,
  plan,
  setPlan,
  twins,
  boneGap,
  systemId,
  setSystemId,
}) {
  const entry = snap.today;
  return (
    <div className="diag-grid">
      <div className="diag-col">
        <section className="dash-card profile">
          <div className="who">
            <span className="avatar" aria-hidden="true">{snap.crew.name.slice(0, 1)}</span>
            <div>
              <p className="eyebrow">Crew</p>
              <h2>{snap.crew.name}</h2>
              <p>{snap.crew.duty}{snap.crew.you ? ' · you' : ''} · day {snap.day}</p>
            </div>
          </div>
          <div className="tiles">
            <Tile label="Weight" value={text(snap, 'weight')} onClick={() => setPin('weight')} />
            <Tile label="Sleep" value={text(snap, 'sleepH')} onClick={() => setPin('sleepH')} />
            <Tile label="Mood" value={text(snap, 'mood')} onClick={() => setPin('mood')} />
            <Tile label="Glucose" value={text(snap, 'glucose')} onClick={() => setPin('glucose')} />
          </div>
          <p className="mini-links">
            <button type="button" onClick={() => setView('feel')}>How you feel</button>
            <button type="button" onClick={() => setView('body')}>Anatomy note</button>
          </p>
        </section>

        <section className="dash-card">
          <h2>Vital signs</h2>
          <div className="vital-stack">
            <Vital label="Heart rate" value={text(snap, 'hr')} note="Heart-rate trace, not an ECG" spark={sparks.hr} pressed={pin === 'hr'} onClick={() => setPin('hr')} />
            <Vital label="Blood pressure" value={text(snap, 'sbp')} note={snap.bpLabel} spark={sparks.sbp} pressed={pin === 'sbp'} onClick={() => setPin('sbp')} />
            <Vital label="Temperature" value={text(snap, 'temp')} note="Personal baseline" spark={sparks.temp} pressed={pin === 'temp'} onClick={() => setPin('temp')} />
            <Vital label="Oxygen" value={text(snap, 'spo2')} note="Saturation" spark={sparks.spo2} pressed={pin === 'spo2'} onClick={() => setPin('spo2')} />
          </div>
        </section>
      </div>

      <section className="dash-card holo-card" aria-label="Body hologram">
        <header className="stage-head">
          <h2>Body</h2>
          <span>{entry ? snap.env.name : ''}</span>
        </header>
        <HoloStage layer={layer} selected={systemId} />
        {CALLOUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`callout ${item.side}`}
            style={{ top: item.top }}
            aria-pressed={systemId === item.id}
            onClick={() => {
              setSystemId(item.id);
              setPin(item.signal);
            }}
          >
            {item.label}
          </button>
        ))}
        <footer className="stage-bar">
          <div className="layer-bar" role="group" aria-label="Body layer">
            {[
              ['skeleton', 'Solid'],
              ['full', 'Wire'],
              ['organs', 'Quiet'],
            ].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={layer === id} onClick={() => setLayer(id)}>{label}</button>
            ))}
          </div>
          <div className="switches">
            <label><input type="checkbox" checked={plan.exercise} onChange={(event) => setPlan((current) => ({ ...current, exercise: event.target.checked }))} /> Exercise</label>
            <label><input type="checkbox" checked={plan.sleep} onChange={(event) => setPlan((current) => ({ ...current, sleep: event.target.checked }))} /> Sleep</label>
            <label><input type="checkbox" checked={plan.shelter} onChange={(event) => setPlan((current) => ({ ...current, shelter: event.target.checked }))} /> Shelter</label>
          </div>
          <p>Bone {twins.kept.boneLoss.toFixed(1)}% kept, {twins.neglected.boneLoss.toFixed(1)}% if dropped. Not a scan.</p>
        </footer>
      </section>

      <div className="diag-col">
        <section className="dash-card" data-level={snap.finding.level}>
          <p className="eyebrow">{LEVEL_WORD[snap.finding.level]} · needs review</p>
          <h2>{snap.finding.title}</h2>
          <p className="finding-copy">{snap.finding.sentence}</p>
          <p className="finding-copy">{snap.finding.attribution}</p>
          <p className="finding-copy">This is a monitoring rule, not a diagnosis.</p>
          <button className="btn" type="button" onClick={() => setView('suggestions')}>Open the steps</button>
        </section>

        <section className="dash-card">
          <h2>Against your baseline</h2>
          <ul className="drift">
            {snap.readings.slice(0, 6).map((reading) => (
              <li key={reading.id}>
                <button type="button" onClick={() => setPin(reading.id)}>
                  <span>{reading.label}</span>
                  <b style={{ width: `${Math.min(100, Math.abs(reading.z || 0) * 16)}%` }} data-shift={shift(reading.z)} />
                  <em>{reading.z == null ? '—' : `${reading.z > 0 ? '+' : ''}${reading.z.toFixed(1)}σ`}</em>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="dash-card screen-panel">
          <h2>Readiness</h2>
          <div className="screen-row">
            <Gauge value={snap.readiness} />
            <p className="finding-copy">Day {snap.day} of 180. Link {snap.delayLabel}. Gap {boneGap.toFixed(1)} illustrative bone points.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function text(snap, id) {
  return snap.readings.find((item) => item.id === id)?.text || '—';
}

function shift(z) {
  if (z == null || Math.abs(z) < 1.4) return 'nominal';
  if (Math.abs(z) < 2.4) return 'watch';
  return 'act';
}

function Tile({ label, value, onClick }) {
  return (
    <button type="button" className="tile" onClick={onClick}>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function Vital({ label, value, note, spark, pressed, onClick }) {
  return (
    <button type="button" className="vital-block" aria-pressed={pressed} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      <Spark values={spark} />
      <em>{note}</em>
    </button>
  );
}

function Spark({ values }) {
  if (!values?.length) return null;
  const width = 220;
  const height = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width;
    const y = height - 4 - ((value - min) / span) * (height - 8);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg className="ecg" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Gauge({ value }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg className="gauge" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r={r} />
      <circle cx="36" cy="36" r={r} strokeDasharray={`${dash} ${c}`} transform="rotate(-90 36 36)" />
      <text x="36" y="40">{value}</text>
    </svg>
  );
}
