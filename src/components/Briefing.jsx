export function Briefing({ onJump }) {
  return (
    <ol className="brief">
      <li>
        <h2>Narthecium</h2>
        <p>Team Apothecaries. A health instrument for a crew that cannot hand the problem to a hospital.</p>
        <p>It learns one astronaut’s own first 14 days, then watches for a slow slide across the five hazards of human spaceflight.</p>
      </li>
      <li>
        <h2>The wrong yardstick</h2>
        <p>Bone loss, immune change, and a drop in mood do not announce themselves. A heart rate that is ordinary for a population can be a warning for one person.</p>
        <p>On a long mission the crew has to notice. People are bad at noticing slow change in themselves. Crewmates often see it first. Earth may be twenty minutes away, each way.</p>
      </li>
      <li>
        <h2>What you act on</h2>
        <p>Five rings: radiation, isolation, gravity, the closed cabin, and distance from Earth. A finding in a sentence, not a pile of thresholds. A card that says what to do while the link runs.</p>
        <p>The rules decide the alert. A local model is allowed only to rephrase them, and it wears a label when it does.</p>
      </li>
      <li>
        <h2>Drift, then cause</h2>
        <p>A change detector watches each signal against that person’s baseline. The sentence sounds like “sleep efficiency has been falling for 9 days.”</p>
        <p>Then it asks a second question. Did the cabin sensor move, and did other people move with it? If yes, the cause is the room. If only one person moved, the cause is personal. That split is the part crews actually argue about.</p>
      </li>
      <li>
        <h2>Two bodies, one day</h2>
        <p>The twin shows the same mission day twice. Left, with exercise, sleep, and shelter as switched. Right, with all three abandoned. The drawing is exaggerated so the slow gap is visible. The percents are labeled illustrative.</p>
        <button className="btn" type="button" onClick={() => onJump(102)}>
          Open day 102 on the instrument
        </button>
      </li>
      <li>
        <h2>Three days in the simulation</h2>
        <ol>
          <li>Day 40. A solar particle event. The radiation ring goes to Act and the shelter card opens.</li>
          <li>Day 96. Two crewmates flag Voss before the curve has crossed. A few days later the detector says sleep efficiency has been falling for 9 days, and only Voss moved.</li>
          <li>Day 121. Cabin CO₂ climbs. The finding names the air, not an illness.</li>
        </ol>
      </li>
      <li>
        <h2>What it is not</h2>
        <p>Not a diagnosis. Not a medical device. Not a substitute for a flight surgeon. A quiet day is still worth logging. A severe feeling is not smoothed away by an otherwise quiet baseline.</p>
        <p>The point of the work is autonomy when the reply cannot arrive in time: see the drift, know whether it is the cabin or you, and do the next honest step.</p>
      </li>
    </ol>
  );
}
