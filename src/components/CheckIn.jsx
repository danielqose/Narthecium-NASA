import { useEffect, useRef, useState } from 'react';
import { CREW, PEER_SIGN_DEFS, streakEnding } from '../lib/engine.js';

const EMPTY_FLAGS = () =>
  Object.fromEntries(CREW.map((member) => [member.id, Object.fromEntries(PEER_SIGN_DEFS.map(([key]) => [key, false]))]));

export function CheckIn({ snap, store, onSave }) {
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
    setForm(blank(snap, store.checkins?.[`${crewId}:${day}`]));
    setError('');
    setConfirm(store.checkins?.[`${crewId}:${day}`]?.complete ? 'Already saved for this mission day. Saving again replaces it.' : '');
    setPhase(store.checkins?.[`${crewId}:${day}`]?.reaction ? 'done' : 'idle');
  }, [crewId, day]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function begin() {
    clearTimeout(timer.current);
    setPhase('wait');
    const wait = 700 + Math.random() * 1800;
    timer.current = setTimeout(() => {
      started.current = performance.now();
      setPhase('go');
    }, wait);
  }

  function pressGame() {
    if (phase === 'idle' || phase === 'done' || phase === 'foul') {
      begin();
      return;
    }
    if (phase === 'wait') {
      clearTimeout(timer.current);
      setPhase('foul');
      return;
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - started.current);
      setForm((current) => ({ ...current, reaction: ms }));
      setPhase('done');
    }
  }

  function toggleFlag(otherId, key) {
    setForm((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [otherId]: { ...current.flags[otherId], [key]: !current.flags[otherId][key] },
      },
    }));
  }

  function save(event) {
    event.preventDefault();
    const sbp = Number(form.sbp);
    const dbp = Number(form.dbp);
    const glucose = Number(form.glucose);
    const temp = Number(form.temp);
    const mood = Number(form.mood);
    if (![sbp, dbp, glucose, temp, mood].every(Number.isFinite)) {
      setError('Enter blood pressure, glucose, temperature, and mood as numbers.');
      setConfirm('');
      return;
    }
    if (sbp < 70 || sbp > 230 || dbp < 40 || dbp > 150 || dbp >= sbp) {
      setError('Those blood pressure numbers look mistyped. Check the cuff and enter them again.');
      setConfirm('');
      return;
    }
    if (glucose < 40 || glucose > 400) {
      setError('Glucose has to sit between 40 and 400 mg/dL to be stored here.');
      setConfirm('');
      return;
    }
    if (temp < 34 || temp > 42) {
      setError('Temperature has to sit between 34 and 42 °C to be stored here.');
      setConfirm('');
      return;
    }
    if (!Number.isFinite(form.reaction)) {
      setError('Run the reaction test, or it does not count as a finished check-in.');
      setConfirm('');
      return;
    }
    const entry = {
      sbp,
      dbp,
      glucose,
      temp,
      mood,
      reaction: form.reaction,
      skin: form.skin,
      severeSymptoms: form.severeSymptoms,
      note: form.note.trim(),
      flags: form.flags,
      complete: true,
    };
    onSave(entry);
    setError('');
    setConfirm('Saved. The rings are using these numbers for this mission day.');
  }

  const others = CREW.filter((member) => member.id !== crewId);
  const streak = streakEnding(store, crewId, saved?.complete ? day : day - 1);
  const gameLabel = {
    idle: form.reaction ? `Retest · last ${form.reaction} ms` : 'Start the reaction test',
    wait: 'Wait for the mark',
    go: 'Now',
    done: form.reaction ? `${form.reaction} ms · tap to retest` : 'Tap to start',
    foul: 'Too early. Tap to try again',
  }[phase];

  return (
    <form className="panel" onSubmit={save}>
      <h2>One minute, {snap.crew.name}</h2>
      <p>
        Hand-entered: blood pressure, glucose, temperature, mood, reaction time, and what you saw in the others. Heart rate, sleep, cabin air, and dose stay on the simulator unless a later build wires a sensor. Readiness is {snap.readiness}. Streak into this day is {streak}. The goal is one finished check-in.
      </p>
      <div className="grid-2">
        <label className="field">
          <span>Systolic mmHg</span>
          <input inputMode="numeric" value={form.sbp} onChange={(event) => setForm({ ...form, sbp: event.target.value })} />
        </label>
        <label className="field">
          <span>Diastolic mmHg</span>
          <input inputMode="numeric" value={form.dbp} onChange={(event) => setForm({ ...form, dbp: event.target.value })} />
        </label>
        <label className="field">
          <span>Glucose mg/dL</span>
          <input inputMode="decimal" value={form.glucose} onChange={(event) => setForm({ ...form, glucose: event.target.value })} />
        </label>
        <label className="field">
          <span>Temperature °C</span>
          <input inputMode="decimal" value={form.temp} onChange={(event) => setForm({ ...form, temp: event.target.value })} />
        </label>
      </div>
      <label className="field" style={{ marginTop: 12 }}>
        <span>Mood, 1 low to 10 steady · {form.mood}</span>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={form.mood}
          onChange={(event) => setForm({ ...form, mood: Number(event.target.value) })}
        />
      </label>
      <button className="game" type="button" data-phase={phase} onClick={pressGame}>
        {gameLabel}
      </button>
      <label className="switches">
        <span>
          <input type="checkbox" checked={form.skin} onChange={(event) => setForm({ ...form, skin: event.target.checked })} /> Visible rash, cold sore, or swollen gland
        </span>
      </label>
      <label className="switches">
        <span>
          <input
            type="checkbox"
            checked={form.severeSymptoms}
            onChange={(event) => setForm({ ...form, severeSymptoms: event.target.checked })}
          />{' '}
          Chest pain, shortness of breath, back pain, numbness, weakness, vision change, or trouble speaking
        </span>
      </label>
      <h3>Brother’s Eye</h3>
      <p className="fine">Ten seconds. Tap only a sign you actually saw today. You do not rate yourself. Simulated crewmates may still flag Voss later in the mission. Those flags are labeled simulated.</p>
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
                    onChange={() => toggleFlag(member.id, key)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <label className="field" style={{ marginTop: 12 }}>
        <span>Note for the ground report</span>
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} maxLength={400} />
      </label>
      {error ? <p className="error">{error}</p> : null}
      {confirm ? <p className="confirm">{confirm}</p> : null}
      <div className="actions">
        <button className="btn" type="submit">
          Save check-in
        </button>
      </div>
    </form>
  );
}

function blank(snap, saved) {
  if (saved) {
    return {
      sbp: saved.sbp,
      dbp: saved.dbp,
      glucose: saved.glucose,
      temp: saved.temp,
      mood: saved.mood,
      reaction: saved.reaction ?? null,
      skin: Boolean(saved.skin),
      severeSymptoms: Boolean(saved.severeSymptoms),
      note: saved.note || '',
      flags: saved.flags || EMPTY_FLAGS(),
    };
  }
  return {
    sbp: Math.round(snap.today.sbp),
    dbp: Math.round(snap.today.dbp),
    glucose: Math.round(snap.today.glucose),
    temp: snap.today.temp.toFixed(1),
    mood: Math.round(snap.today.mood * 2) / 2,
    reaction: null,
    skin: false,
    severeSymptoms: false,
    note: '',
    flags: EMPTY_FLAGS(),
  };
}
