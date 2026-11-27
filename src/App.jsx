import { useEffect, useMemo, useState } from 'react';
import { Anatomy } from './components/Anatomy.jsx';
import { Briefing } from './components/Briefing.jsx';
import { FeelPage } from './components/FeelPage.jsx';
import { Diagnostics } from './components/Diagnostics.jsx';
import { LogDay } from './components/LogDay.jsx';
import { Suggestions } from './components/Suggestions.jsx';
import { Trend } from './components/Trend.jsx';
import {
  CREW,
  ENVIRONMENTS,
  MISSION_DAYS,
  assess,
  findStoryMarks,
  projectWithPlan,
  signalTrack,
} from './lib/engine.js';

const STORAGE_KEY = 'narthecium-v1';

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (!parsed || typeof parsed !== 'object') throw new Error('empty');
    return {
      checkins: parsed.checkins || {},
      actions: parsed.actions || [],
      coach: Boolean(parsed.coach),
    };
  } catch {
    return { checkins: {}, actions: [], coach: false };
  }
}

export function App() {
  const [env, setEnv] = useState('transit');
  const [crewId, setCrewId] = useState('voss');
  const [day, setDay] = useState(105);
  const [liveDay, setLiveDay] = useState(105);
  const [view, setView] = useState('watch');
  const [systemId, setSystemId] = useState('heart');
  const [layer, setLayer] = useState('skeleton');
  const [plan, setPlan] = useState({ exercise: true, sleep: true, shelter: true });
  const [store, setStore] = useState(loadStore);
  const [playing, setPlaying] = useState(false);
  const [pin, setPin] = useState(null);
  const [live, setLive] = useState('');

  const marks = useMemo(() => findStoryMarks(env), [env]);
  const snap = useMemo(() => assess(env, day, crewId, store), [env, day, crewId, store]);
  const twins = useMemo(() => projectWithPlan(env, day, plan), [env, day, plan]);
  const chart = useMemo(() => {
    if (!pin) return snap.chart;
    return signalTrack(env, crewId, pin, day, store);
  }, [pin, snap, env, crewId, day, store]);
  const sparks = useMemo(() => {
    const take = (id) => signalTrack(env, crewId, id, day, store).values.slice(-28);
    return { hr: take('hr'), spo2: take('spo2'), temp: take('temp'), sbp: take('sbp') };
  }, [env, crewId, day, store]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => {
      setDay((current) => {
        if (current >= MISSION_DAYS) {
          setPlaying(false);
          return MISSION_DAYS;
        }
        return current + 1;
      });
    }, 280);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    setLive(`Day ${liveDay}. ${snap.finding.title}. ${snap.finding.sentence}`);
  }, [liveDay]);

  useEffect(() => {
    function onKey(event) {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === '1') setView('watch');
      if (event.key === '2') setView('feel');
      if (event.key === '3') setView('suggestions');
      if (event.key === '4') setView('checkin');
      if (event.key === 'ArrowRight') {
        setDay((current) => Math.min(MISSION_DAYS, current + 1));
        setLiveDay((current) => Math.min(MISSION_DAYS, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setDay((current) => Math.max(1, current - 1));
        setLiveDay((current) => Math.max(1, current - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function jump(next) {
    setPlaying(false);
    setDay(next);
    setLiveDay(next);
    setView('watch');
    setPin(null);
  }

  function logAction(type, label) {
    const action = {
      day,
      crewId,
      type,
      text: `${label}. ${snap.finding.title}.`,
      closed: false,
    };
    setStore((current) => ({ ...current, actions: [...current.actions, action] }));
  }

  function saveCheckin(entry) {
    const key = `${crewId}:${day}`;
    setStore((current) => ({
      ...current,
      checkins: { ...current.checkins, [key]: entry },
      actions: entry.note
        ? [...current.actions, { day, crewId, type: 'note', text: entry.note, closed: false }]
        : current.actions,
    }));
    setView('suggestions');
  }

  function saveFeel(partial) {
    const key = `${crewId}:${day}`;
    setStore((current) => {
      const prev = current.checkins?.[key] || {};
      const entry = { ...prev, ...partial, complete: true };
      const note = partial.note && partial.note !== prev.note
        ? [...current.actions, { day, crewId, type: 'note', text: partial.note, closed: false }]
        : current.actions;
      return { ...current, checkins: { ...current.checkins, [key]: entry }, actions: note };
    });
    setView('suggestions');
  }

  const checked = Boolean(store.checkins?.[`${crewId}:${day}`]?.complete);
  const boneGap = twins.neglected.boneLoss - twins.kept.boneLoss;

  return (
    <>
      <a className="skip" href="#main">
        Skip to the instrument
      </a>
      <div className="shell diag">
        <header className="diag-top">
          <div className="diag-brand">
            <span className="plus" aria-hidden="true">+</span>
            <div>
              <p>Crew health instrument</p>
              <h1>Narthecium</h1>
            </div>
          </div>
          <label className="diag-chip">
            <span>Subject</span>
            <select
              value={crewId}
              aria-label="Crew"
              onChange={(event) => {
                setCrewId(event.target.value);
                setPin(null);
              }}
            >
              {CREW.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.duty}{member.you ? ' · you' : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="diag-chip">
            <span>Real-time</span>
            <div className="segmented" role="group" aria-label="Environment">
              {Object.values(ENVIRONMENTS).map((item) => (
                <button key={item.id} type="button" aria-pressed={env === item.id} onClick={() => setEnv(item.id)}>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="diag-chip status">
            <span>Link</span>
            <strong>{snap.delayLabel}</strong>
            <em>Day {day}</em>
          </div>
        </header>

        <div className="acq">
          <p>Day {day} of {MISSION_DAYS}</p>
          <input
            type="range"
            min="1"
            max={MISSION_DAYS}
            value={day}
            aria-label="Mission day"
            onChange={(event) => setDay(Number(event.target.value))}
            onPointerUp={(event) => setLiveDay(Number(event.target.value))}
            onKeyUp={(event) => setLiveDay(Number(event.target.value))}
          />
          <ul className="marks">
            {marks.map((mark) => (
              <li key={mark.label}>
                <button className="text-btn" type="button" onClick={() => jump(mark.day)}>
                  {mark.day} · {mark.label}
                </button>
              </li>
            ))}
            <li>
              <button className="text-btn" type="button" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>
                {playing ? 'Pause' : 'Play'}
              </button>
            </li>
          </ul>
        </div>

        <nav className="diag-tabs" aria-label="Sections">
          {[
            ['watch', 'Overview'],
            ['suggestions', 'Treatments'],
            ['checkin', 'Labs'],
            ['feel', 'Neurology'],
            ['chart', 'Reports'],
          ].map(([id, label]) => (
            <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>

        <p className="sr" aria-live="polite">
          {live}
        </p>

        <main id="main">
          {view === 'watch' || view === 'chart' ? (
            <>
              {view === 'watch' ? (
                <Diagnostics
                  snap={snap}
                  sparks={sparks}
                  pin={pin}
                  setPin={setPin}
                  setView={setView}
                  layer={layer}
                  setLayer={setLayer}
                  plan={plan}
                  setPlan={setPlan}
                  twins={twins}
                  boneGap={boneGap}
                  systemId={systemId}
                  setSystemId={setSystemId}
                />
              ) : null}
              <Trend chart={chart} day={day} />
            </>
          ) : null}

          {view === 'feel' ? <FeelPage snap={snap} store={store} onSave={saveFeel} /> : null}
          {view === 'suggestions' ? (
            <Suggestions
              snap={snap}
              store={store}
              onLog={logAction}
              onFeel={() => setView('feel')}
              onMeasure={() => setView('checkin')}
            />
          ) : null}
          {view === 'body' ? <Anatomy model={twins.kept} systemId={systemId} onPick={setSystemId} /> : null}
          {view === 'checkin' ? <LogDay snap={snap} store={store} onSave={saveCheckin} /> : null}
          {view === 'brief' ? <Briefing onJump={jump} /> : null}
        </main>

      </div>
    </>
  );
}
