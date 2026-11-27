import { useEffect, useRef, useState } from 'react';
import { CREW, PEER_SIGN_DEFS } from '../lib/engine.js';

const VALENCE = [
  { t: 0, word: 'Very unpleasant', mood: 2 },
  { t: 0.25, word: 'Unpleasant', mood: 3.8 },
  { t: 0.5, word: 'Neutral', mood: 6.2 },
  { t: 0.75, word: 'Pleasant', mood: 8 },
  { t: 1, word: 'Very pleasant', mood: 9.4 },
];

const EMOTIONS = {
  low: ['Anxious', 'Drained', 'Irritated', 'Lonely', 'Overwhelmed', 'Sad', 'Stressed', 'Worried'],
  mid: ['Calm', 'Content', 'Drained', 'Focused', 'Irritated', 'Tired', 'Stressed', 'Okay'],
  high: ['Calm', 'Content', 'Focused', 'Grateful', 'Hopeful', 'Peaceful', 'Proud', 'Relieved'],
};

const IMPACTS = ['Sleep', 'Exercise', 'Crew', 'Cabin', 'Workload', 'Food', 'Earth link', 'Health', 'Isolation'];

function nearestValence(mood) {
  return VALENCE.reduce((best, item) => (Math.abs(item.mood - mood) < Math.abs(best.mood - mood) ? item : best));
}

function emotionSet(mood) {
  if (mood < 4.8) return EMOTIONS.low;
  if (mood > 7.2) return EMOTIONS.high;
  return EMOTIONS.mid;
}

export function LogDay({ snap, store, onSave }) {
  const crewId = snap.crew.id;
  const day = snap.day;
  const saved = store.checkins?.[`${crewId}:${day}`];
  const [form, setForm] = useState(() => blank(snap, saved));
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phase, setPhase] = useState(saved?.reaction ? 'done' : 'idle');
  const timer = useRef(0);
  const started = useRef(0);

  useEffect(() => {
    const existing = store.checkins?.[`${crewId}:${day}`];
    setForm(blank(snap, existing));
    setError('');
    setConfirm(existing?.complete ? 'Saved numbers are already in today’s evaluation. Saving again replaces them.' : '');
    setPhase(existing?.reaction ? 'done' : 'idle');
  }, [crewId, day]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const valence = nearestValence(form.mood);
  const words = emotionSet(form.mood);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleList(key, word) {
    setForm((current) => {
      const list = current[key].includes(word) ? current[key].filter((item) => item !== word) : [...current[key], word];
      return { ...current, [key]: list };
    });
  }

  function begin() {
    clearTimeout(timer.current);
    setPhase('wait');
    timer.current = setTimeout(() => {
      started.current = performance.now();
      setPhase('go');
    }, 700 + Math.random() * 1600);
  }

  function pressGame() {
    if (phase === 'wait') {
      clearTimeout(timer.current);
      setPhase('foul');
      return;
    }
    if (phase === 'go') {
      setField('reaction', Math.round(performance.now() - started.current));
      setPhase('done');
      return;
    }
    begin();
  }

  function save(event) {
    event.preventDefault();
    const numbers = {
      sbp: Number(form.sbp),
      dbp: Number(form.dbp),
      hr: Number(form.hr),
      glucose: Number(form.glucose),
      temp: Number(form.temp),
      spo2: Number(form.spo2),
      sleepH: Number(form.sleepH),
      sleepEff: Number(form.sleepEff) / 100,
      activity: Number(form.activity),
      weight: Number(form.weight),
      grip: Number(form.grip),
      hydration: Number(form.hydration),
    };
    const required = ['sbp', 'dbp', 'hr', 'glucose', 'temp', 'sleepH'];
    if (required.some((key) => !Number.isFinite(numbers[key])) || !Number.isFinite(form.mood)) {
      setError('Blood pressure, heart rate, glucose, temperature, sleep, and the mood slider are required before this day can be evaluated.');
      setConfirm('');
      return;
    }
    if (numbers.sbp < 70 || numbers.sbp > 230 || numbers.dbp < 40 || numbers.dbp > 150 || numbers.dbp >= numbers.sbp) {
      setError('Those blood pressure numbers look mistyped. Check the cuff and enter them again.');
      setConfirm('');
      return;
    }
    if (numbers.hr < 30 || numbers.hr > 220) {
      setError('Heart rate has to sit between 30 and 220 bpm to be stored.');
      setConfirm('');
      return;
    }
    if (numbers.glucose < 40 || numbers.glucose > 400) {
      setError('Glucose has to sit between 40 and 400 mg/dL.');
      setConfirm('');
      return;
    }
    if (numbers.temp < 34 || numbers.temp > 42) {
      setError('Temperature has to sit between 34 and 42 °C.');
      setConfirm('');
      return;
    }
    if (numbers.sleepH < 0 || numbers.sleepH > 14) {
      setError('Sleep hours have to sit between 0 and 14.');
      setConfirm('');
      return;
    }
    const entry = {
      ...numbers,
      mood: form.mood,
      valence: valence.word,
      emotions: form.emotions.filter((word) => words.includes(word)),
      impacts: form.impacts,
      skin: form.skin,
      severeSymptoms: form.severeSymptoms,
      note: form.note.trim(),
      flags: form.flags,
      complete: true,
    };
    if (!Number.isFinite(form.reaction)) delete entry.reaction;
    else entry.reaction = form.reaction;
    if (!Number.isFinite(numbers.hydration)) delete entry.hydration;
    onSave(entry);
    setError('');
    setConfirm('Saved. The rings and the finding are now using these numbers for this mission day.');
  }

  const others = CREW.filter((member) => member.id !== crewId);
  const gameLabel = {
    idle: form.reaction ? `Retest · last ${form.reaction} ms` : 'Start reaction test',
    wait: 'Wait for the mark',
    go: 'Now',
    done: form.reaction ? `${form.reaction} ms · tap to retest` : 'Tap to start',
    foul: 'Too early. Tap to try again',
  }[phase];

  return (
    <form className="log" onSubmit={save}>
      <header className="log-head">
        <div>
          <h2>Log day {day}</h2>
          <p>Type what you measured. Saving replaces the simulator for those fields and reruns the evaluation against {snap.crew.name}’s own baseline.</p>
        </div>
        <button className="btn" type="submit">
          Evaluate this day
        </button>
      </header>

      <section className="log-grid" aria-label="Measured values">
        <Field label="Systolic" unit="mmHg" value={form.sbp} onChange={(value) => setField('sbp', value)} />
        <Field label="Diastolic" unit="mmHg" value={form.dbp} onChange={(value) => setField('dbp', value)} />
        <Field label="Heart rate" unit="bpm" value={form.hr} onChange={(value) => setField('hr', value)} />
        <Field label="Glucose" unit="mg/dL" value={form.glucose} onChange={(value) => setField('glucose', value)} />
        <Field label="Temperature" unit="°C" value={form.temp} onChange={(value) => setField('temp', value)} />
        <Field label="Oxygen sat." unit="%" value={form.spo2} onChange={(value) => setField('spo2', value)} />
        <Field label="Sleep" unit="hours" value={form.sleepH} onChange={(value) => setField('sleepH', value)} />
        <Field label="Sleep quality" unit="%" value={form.sleepEff} onChange={(value) => setField('sleepEff', value)} />
        <Field label="Activity" unit="min" value={form.activity} onChange={(value) => setField('activity', value)} />
        <Field label="Body mass" unit="kg" value={form.weight} onChange={(value) => setField('weight', value)} />
        <Field label="Grip" unit="kg" value={form.grip} onChange={(value) => setField('grip', value)} />
        <Field label="Hydration" unit="ml" value={form.hydration} onChange={(value) => setField('hydration', value)} />
      </section>

      <section className="mood" aria-labelledby="mood-title">
        <h3 id="mood-title">State of mind</h3>
        <p>Same shape as a daily mood log: place the mark, name the feeling, then name what drove it. The mark is the number the drift engine uses.</p>
        <div className="valence">
          <div className="valence-word" data-low={form.mood < 4.8 ? 'true' : 'false'}>
            {valence.word}
          </div>
          <input
            type="range"
            min="2"
            max="9.4"
            step="0.2"
            value={form.mood}
            aria-valuetext={valence.word}
            aria-label="Mood from very unpleasant to very pleasant"
            onChange={(event) => setField('mood', Number(event.target.value))}
          />
          <div className="valence-scale">
            <span>Very unpleasant</span>
            <span>Neutral</span>
            <span>Very pleasant</span>
          </div>
        </div>
        <h3>What best describes this feeling?</h3>
        <div className="chips">
          {words.map((word) => (
            <button
              key={word}
              type="button"
              className="chip"
              aria-pressed={form.emotions.includes(word)}
              onClick={() => toggleList('emotions', word)}
            >
              {word}
            </button>
          ))}
        </div>
        <h3>What’s having the biggest impact?</h3>
        <div className="chips">
          {IMPACTS.map((word) => (
            <button
              key={word}
              type="button"
              className="chip"
              aria-pressed={form.impacts.includes(word)}
              onClick={() => toggleList('impacts', word)}
            >
              {word}
            </button>
          ))}
        </div>
      </section>

      <section className="log-side">
        <button className="game" type="button" data-phase={phase} onClick={pressGame}>
          {gameLabel}
        </button>
        <label className="check">
          <input type="checkbox" checked={form.skin} onChange={(event) => setField('skin', event.target.checked)} />
          Visible rash, cold sore, or swollen gland
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.severeSymptoms}
            onChange={(event) => setField('severeSymptoms', event.target.checked)}
          />
          Chest pain, shortness of breath, back pain, numbness, weakness, vision change, or trouble speaking
        </label>
        <details>
          <summary>Brother’s Eye — what you saw in the others</summary>
          <table className="peers">
            <thead>
              <tr>
                <th>Crewmate</th>
                {PEER_SIGN_DEFS.map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {others.map((member) => (
                <tr key={member.id}>
                  <th scope="row">{member.name}</th>
                  {PEER_SIGN_DEFS.map(([key, label]) => (
                    <td key={key}>
                      <input
                        type="checkbox"
                        aria-label={`${member.name}, ${label}`}
                        checked={Boolean(form.flags?.[member.id]?.[key])}
                        onChange={() => {
                          setForm((current) => ({
                            ...current,
                            flags: {
                              ...current.flags,
                              [member.id]: { ...current.flags[member.id], [key]: !current.flags[member.id]?.[key] },
                            },
                          }));
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <label className="field">
          <span>Note for the ground report</span>
          <textarea value={form.note} maxLength={400} onChange={(event) => setField('note', event.target.value)} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {confirm ? <p className="confirm">{confirm}</p> : null}
      </section>
    </form>
  );
}

function Field({ label, unit, value, onChange }) {
  return (
    <label className="field">
      <span>
        {label} <em>{unit}</em>
      </span>
      <input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function blank(snap, saved) {
  const flags = Object.fromEntries(
    CREW.map((member) => [member.id, Object.fromEntries(PEER_SIGN_DEFS.map(([key]) => [key, false]))]),
  );
  if (saved) {
    return {
      sbp: saved.sbp,
      dbp: saved.dbp,
      hr: saved.hr ?? Math.round(snap.today.hr),
      glucose: saved.glucose,
      temp: saved.temp,
      spo2: saved.spo2 ?? Math.round(snap.today.spo2),
      sleepH: saved.sleepH ?? snap.today.sleepH.toFixed(1),
      sleepEff: saved.sleepEff != null ? Math.round(saved.sleepEff * 100) : Math.round(snap.today.sleepEff * 100),
      activity: saved.activity ?? Math.round(snap.today.activity),
      weight: saved.weight ?? snap.today.weight.toFixed(1),
      grip: saved.grip ?? snap.today.grip.toFixed(1),
      hydration: saved.hydration ?? '',
      mood: saved.mood,
      emotions: saved.emotions || [],
      impacts: saved.impacts || [],
      reaction: saved.reaction ?? null,
      skin: Boolean(saved.skin),
      severeSymptoms: Boolean(saved.severeSymptoms),
      note: saved.note || '',
      flags: saved.flags || flags,
    };
  }
  return {
    sbp: Math.round(snap.today.sbp),
    dbp: Math.round(snap.today.dbp),
    hr: Math.round(snap.today.hr),
    glucose: Math.round(snap.today.glucose),
    temp: snap.today.temp.toFixed(1),
    spo2: Math.round(snap.today.spo2),
    sleepH: snap.today.sleepH.toFixed(1),
    sleepEff: Math.round(snap.today.sleepEff * 100),
    activity: Math.round(snap.today.activity),
    weight: snap.today.weight.toFixed(1),
    grip: snap.today.grip.toFixed(1),
    hydration: '',
    mood: Math.round(snap.today.mood * 5) / 5,
    emotions: [],
    impacts: [],
    reaction: null,
    skin: false,
    severeSymptoms: false,
    note: '',
    flags,
  };
}
