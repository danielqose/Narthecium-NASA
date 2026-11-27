import { useEffect, useState } from 'react';

const VALENCE = [
  { word: 'Very unpleasant', mood: 2 },
  { word: 'Unpleasant', mood: 3.8 },
  { word: 'Neutral', mood: 6.2 },
  { word: 'Pleasant', mood: 8 },
  { word: 'Very pleasant', mood: 9.4 },
];

const EMOTIONS = {
  low: ['Anxious', 'Drained', 'Irritated', 'Lonely', 'Overwhelmed', 'Sad', 'Stressed', 'Worried'],
  mid: ['Calm', 'Content', 'Drained', 'Focused', 'Irritated', 'Tired', 'Stressed', 'Okay'],
  high: ['Calm', 'Content', 'Focused', 'Grateful', 'Hopeful', 'Peaceful', 'Proud', 'Relieved'],
};

const IMPACTS = ['Sleep', 'Exercise', 'Crew', 'Cabin', 'Workload', 'Food', 'Earth link', 'Health', 'Isolation'];

function nearest(mood) {
  return VALENCE.reduce((best, item) => (Math.abs(item.mood - mood) < Math.abs(best.mood - mood) ? item : best));
}

function wordsFor(mood) {
  if (mood < 4.8) return EMOTIONS.low;
  if (mood > 7.2) return EMOTIONS.high;
  return EMOTIONS.mid;
}

export function FeelPage({ snap, store, onSave }) {
  const saved = store.checkins?.[`${snap.crew.id}:${snap.day}`];
  const [mood, setMood] = useState(saved?.mood ?? snap.today.mood);
  const [emotions, setEmotions] = useState(saved?.emotions || []);
  const [impacts, setImpacts] = useState(saved?.impacts || []);
  const [energy, setEnergy] = useState(saved?.energy ?? 3);
  const [focus, setFocus] = useState(saved?.focus ?? 3);
  const [appetite, setAppetite] = useState(saved?.appetite ?? 3);
  const [skin, setSkin] = useState(Boolean(saved?.skin));
  const [severe, setSevere] = useState(Boolean(saved?.severeSymptoms));
  const [note, setNote] = useState(saved?.note || '');

  useEffect(() => {
    const entry = store.checkins?.[`${snap.crew.id}:${snap.day}`];
    setMood(entry?.mood ?? snap.today.mood);
    setEmotions(entry?.emotions || []);
    setImpacts(entry?.impacts || []);
    setEnergy(entry?.energy ?? 3);
    setFocus(entry?.focus ?? 3);
    setAppetite(entry?.appetite ?? 3);
    setSkin(Boolean(entry?.skin));
    setSevere(Boolean(entry?.severeSymptoms));
    setNote(entry?.note || '');
  }, [snap.crew.id, snap.day]);

  const valence = nearest(mood);
  const words = wordsFor(mood);

  function toggle(list, setList, word) {
    setList(list.includes(word) ? list.filter((item) => item !== word) : [...list, word]);
  }

  function save(event) {
    event.preventDefault();
    onSave({
      mood,
      valence: valence.word,
      emotions: emotions.filter((word) => words.includes(word)),
      impacts,
      energy,
      focus,
      appetite,
      skin,
      severeSymptoms: severe,
      note: note.trim(),
    });
  }

  return (
    <form className="page" onSubmit={save}>
      <header className="page-head">
        <div>
          <p className="kicker">Day {snap.day} · {snap.crew.name}</p>
          <h2>How you are</h2>
          <p>This is the daily check on you, not a diagnosis. The mark feeds your own baseline. The words tell the rest of the crew what to take seriously.</p>
        </div>
        <button className="btn" type="submit">Save and open suggestions</button>
      </header>

      <section className="glass feel-hero">
        <p className="valence-word" data-low={mood < 4.8 ? 'true' : 'false'}>{valence.word}</p>
        <input
          type="range"
          min="2"
          max="9.4"
          step="0.2"
          value={mood}
          aria-label="Mood from very unpleasant to very pleasant"
          aria-valuetext={valence.word}
          onChange={(event) => setMood(Number(event.target.value))}
        />
        <div className="valence-scale">
          <span>Very unpleasant</span>
          <span>Neutral</span>
          <span>Very pleasant</span>
        </div>
      </section>

      <section className="glass">
        <h3>What best describes this feeling?</h3>
        <div className="chips">
          {words.map((word) => (
            <button key={word} type="button" className="chip" aria-pressed={emotions.includes(word)} onClick={() => toggle(emotions, setEmotions, word)}>
              {word}
            </button>
          ))}
        </div>
        <h3>What’s having the biggest impact?</h3>
        <div className="chips">
          {IMPACTS.map((word) => (
            <button key={word} type="button" className="chip" aria-pressed={impacts.includes(word)} onClick={() => toggle(impacts, setImpacts, word)}>
              {word}
            </button>
          ))}
        </div>
      </section>

      <section className="glass scale-grid">
        <Scale label="Energy" value={energy} onChange={setEnergy} low="Spent" high="Ready" />
        <Scale label="Focus" value={focus} onChange={setFocus} low="Scattered" high="Sharp" />
        <Scale label="Appetite" value={appetite} onChange={setAppetite} low="Off" high="Normal" />
      </section>

      <section className="glass">
        <label className="check">
          <input type="checkbox" checked={skin} onChange={(event) => setSkin(event.target.checked)} />
          Visible rash, cold sore, or swollen gland
        </label>
        <label className="check">
          <input type="checkbox" checked={severe} onChange={(event) => setSevere(event.target.checked)} />
          Chest pain, shortness of breath, back pain, numbness, weakness, vision change, or trouble speaking
        </label>
        <label className="field">
          <span>Anything the surgeon should read</span>
          <textarea value={note} maxLength={400} onChange={(event) => setNote(event.target.value)} />
        </label>
      </section>
    </form>
  );
}

function Scale({ label, value, onChange, low, high }) {
  return (
    <label className="field">
      <span>{label} <em>{value} / 5</em></span>
      <input type="range" min="1" max="5" step="1" value={value} aria-label={label} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="valence-scale"><span>{low}</span><span>{high}</span></span>
    </label>
  );
}
