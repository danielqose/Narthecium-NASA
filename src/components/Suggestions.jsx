import { LADDER, PROTOCOLS } from '../data/content.js';

const LEVEL_WORD = {
  nominal: 'Nominal',
  watch: 'Watch',
  act: 'Act',
  urgent: 'Urgent',
};

export function Suggestions({ snap, store, onLog, onFeel, onMeasure }) {
  const finding = snap.finding;
  const protocol = PROTOCOLS[finding.protocolId] || PROTOCOLS.nominal;
  const entry = store.checkins?.[`${snap.crew.id}:${snap.day}`];
  const step = LADDER.find((item) => item.level === finding.escalation) || LADDER[0];

  return (
    <article className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Day {snap.day} · {snap.env.name} · {snap.delayLabel}</p>
          <h2>Suggestions for {snap.crew.name}</h2>
          <p>These steps come from the rules for today’s finding. They are what to do while you wait, not a diagnosis and not a treatment order.</p>
        </div>
      </header>

      <section className="glass suggest-lead" data-level={finding.level}>
        <p className="level-row">
          <i className="lamp" aria-hidden="true" />
          {LEVEL_WORD[finding.level]} · {step.name}
        </p>
        <h3>{finding.title}</h3>
        <p>{finding.sentence}</p>
        <p>{finding.attribution}</p>
      </section>

      <ol className="suggest-steps">
        {protocol.steps.map((item, index) => (
          <li key={item} className="glass">
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>

      {entry ? (
        <section className="glass">
          <h3>What you reported</h3>
          <p>
            {entry.valence ? `${entry.valence}. ` : ''}
            {entry.emotions?.length ? `${entry.emotions.join(', ')}. ` : ''}
            {entry.impacts?.length ? `Biggest impact: ${entry.impacts.join(', ')}. ` : ''}
            {entry.energy ? `Energy ${entry.energy}/5, focus ${entry.focus}/5, appetite ${entry.appetite}/5.` : ''}
          </p>
          {entry.note ? <p>{entry.note}</p> : null}
          {entry.severeSymptoms ? <p>You marked a severe symptom. That keeps this on the urgent step. A crewmate should stay with you.</p> : null}
        </section>
      ) : (
        <section className="glass">
          <h3>No personal note yet</h3>
          <p>The suggestion above uses the mission record. Add how you actually feel so the next read includes your words.</p>
          <button className="btn" type="button" onClick={onFeel}>Log how you are</button>
        </section>
      )}

      <div className="actions">
        {finding.escalation >= 3 ? (
          <button className="btn" type="button" onClick={() => onLog('urgent', 'Open urgent contact')}>Open urgent contact</button>
        ) : null}
        {finding.escalation === 2 ? (
          <button className="btn" type="button" onClick={() => onLog('queue', 'Queue the surgeon')}>Queue the surgeon</button>
        ) : null}
        <button className="btn secondary" type="button" onClick={() => onLog('did', 'Log that I did the steps')}>Log that I did the steps</button>
        <button className="btn secondary" type="button" onClick={onMeasure}>Log measurements</button>
      </div>
    </article>
  );
}
