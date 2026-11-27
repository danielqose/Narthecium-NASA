import { SYSTEMS } from '../data/content.js';
import { HoloBody } from './HoloBody.jsx';

export function Anatomy({ model, systemId, onPick }) {
  const system = SYSTEMS.find((item) => item.id === systemId) || SYSTEMS[0];
  return (
    <div className="anatomy">
      <div>
        <HoloBody model={model} selected={system.id} onSelect={onPick} title={`${system.name}. Select a system from the list.`} />
        <p className="fine">The figure uses the “switches on” projection for this mission day. Pick a system. The list is the control. The drawing is the map.</p>
      </div>
      <article className="prose">
        <div className="sys-list">
          {SYSTEMS.map((item) => (
            <button key={item.id} className="text-btn" type="button" aria-pressed={item.id === system.id} onClick={() => onPick(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <h2>{system.name}</h2>
        <p>{system.function}</p>
        <h3>Why this exam matters</h3>
        <p>{system.why}</p>
        <h3>What the instrument watches</h3>
        <p>{system.watches}</p>
        <h3>Hazards that touch it</h3>
        <ul>
          {system.hazards.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>What to say out loud</h3>
        <ul>
          {system.symptoms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>Countermeasures, as far as this demo goes</h3>
        <p>{system.prevention}</p>
      </article>
    </div>
  );
}
