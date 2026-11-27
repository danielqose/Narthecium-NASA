import { useState } from 'react';
import { LADDER, PROTOCOLS, rulesExplanation } from '../data/content.js';

const LEVEL_WORD = {
  nominal: 'Nominal',
  watch: 'Watch',
  act: 'Act',
  urgent: 'Urgent',
};

const SYSTEM = `You explain a decision that a rules engine already made for a deep-space health demo.
You do not diagnose. You do not change the escalation. You do not invent numbers, doses, limits, or causes.
Use only the facts in the user message. Short sentences. Plain words.
End with this exact sentence: This is an explanation of the instrument, not medical advice.`;

async function askOllama(facts) {
  const tags = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1800) });
  if (!tags.ok) throw new Error('tags');
  const listed = await tags.json();
  const model = listed.models?.[0]?.name;
  if (!model) throw new Error('empty');
  const chat = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: facts },
      ],
    }),
  });
  if (!chat.ok) throw new Error('chat');
  const data = await chat.json();
  const text = data.message?.content?.trim();
  if (!text) throw new Error('empty reply');
  return { model, text };
}

export function Finding({ snap, store, onLog }) {
  const finding = snap.finding;
  const protocol = PROTOCOLS[finding.protocolId] || PROTOCOLS.nominal;
  const rules = rulesExplanation(finding, snap.delayLabel);
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState('idle');
  const dayActions = (store.actions || []).filter((item) => item.crewId === snap.crew.id && item.day === snap.day);

  async function rephrase() {
    setAiState('loading');
    setAi(null);
    const facts = [
      `Crew ${snap.crew.name}, ${snap.env.name}, day ${snap.day}.`,
      `Level: ${finding.level}. Escalation step: ${finding.escalation}.`,
      finding.sentence,
      finding.attribution,
      `Link: ${snap.delayLabel}.`,
      'Protocol steps:',
      ...protocol.steps.map((step, index) => `${index + 1}. ${step}`),
    ].join('\n');
    try {
      const result = await askOllama(facts);
      setAi(result);
      setAiState('ready');
    } catch {
      setAiState('offline');
    }
  }

  const primary =
    finding.escalation >= 3
      ? { type: 'urgent', label: 'Open urgent contact' }
      : finding.escalation === 2
        ? { type: 'queue', label: 'Queue the surgeon' }
        : { type: 'did', label: 'Log that I did this' };

  const secondary =
    finding.escalation >= 2 ? { type: 'did', label: 'Log that I did the steps' } : null;

  return (
    <section className="finding" aria-labelledby="finding-title" data-level={finding.level}>
      <p className="level-row">
        <i className="lamp" aria-hidden="true" />
        {LEVEL_WORD[finding.level]}
      </p>
      <h2 id="finding-title">{finding.title}</h2>
      <p>{finding.sentence}</p>
      <p>{finding.attribution}</p>
      <ol className="steps">
        {protocol.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <ol className="ladder" aria-label="Escalation">
        {LADDER.map((step) => (
          <li key={step.name} data-on={String(step.level === finding.escalation)} data-level={finding.level}>
            {step.level === finding.escalation ? `Now · ${step.name}` : step.name}
          </li>
        ))}
      </ol>
      <div className="actions">
        <button className="btn" type="button" onClick={() => onLog(primary.type, primary.label)}>
          {primary.label}
        </button>
        {secondary ? (
          <button className="btn secondary" type="button" onClick={() => onLog(secondary.type, secondary.label)}>
            {secondary.label}
          </button>
        ) : null}
        <button className="btn secondary" type="button" onClick={rephrase} disabled={aiState === 'loading'}>
          {aiState === 'loading' ? 'Asking the local model…' : 'Rephrase with the local model'}
        </button>
      </div>
      <details className="source">
        <summary>How the rules said it</summary>
        <p>{rules}</p>
      </details>
      {aiState === 'offline' ? (
        <p className="source">No local model answered on this machine. The paragraph above is the rules engine, and it still stands.</p>
      ) : null}
      {ai ? (
        <p>
          <span className="tagline">AI explanation, not medical advice · {ai.model}</span>
          <br />
          {ai.text}
        </p>
      ) : null}
      {dayActions.length ? (
        <ul className="logged">
          {dayActions.map((item, index) => (
            <li key={`${item.type}-${index}`}>
              Logged: {item.text}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
