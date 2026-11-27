# Architecture

Narthecium runs entirely in the browser. A Mars-transit demo that needs a server before it can think would miss the point of the distance hazard. The rules engine is pure JavaScript, so the same file is tested in Node and used by the React UI.

## Pipeline

1. `missionSeries` builds 180 days for four crew and the habitat. Noise is seeded, so day 40 is always the solar event, Voss’s sleep slide always starts on day 98, and cabin CO₂ always starts climbing on day 120. Switching ISS / lunar / transit / surface changes dose, gravity unload, and link delay. It does not rewrite a person’s random days.
2. A check-in can replace that day’s blood pressure, glucose, temperature, mood, and reaction time. Sleep, heart rate, cabin sensors, and dose stay simulated.
3. `cusum` learns days 1–14 as that person’s baseline, then accumulates a one-sided shift. An alert is a held drift (“falling for 9 days”), not a population cutoff.
4. Attribution compares the last week with the other three crew and with habitat sensors. Shared body change plus a moved sensor is the cabin. One person alone is personal. The solar event is tagged as outside the vehicle.
5. Five rings roll those detectors up: radiation, isolation, gravity, closed environment, distance.
6. One ordered list picks the headline. Severe blood pressure and the CDC symptom list outrank everything. Then the solar event, then a cabin-linked drift, then a personal drift, then Brother’s Eye if the curve has not crossed yet.
7. Protocol cards and the escalation step are looked up from that headline. A local model may only rephrase the finished object. If Ollama is not on `127.0.0.1:11434`, the rules text remains.

## Twin

`projectBody` is separate from the daily noise. It applies an illustrative 1.1% per month bone figure in full microgravity, scaled by the environment’s gravity unload, cut when “resistive exercise” is on, plus a heart index, an immune dim, and a summed simulated dose. The right body always has the three countermeasures off. The drawing exaggerates the gap. The percents are the figures. Nothing in that function is a scan.

## UI

React renders one instrument: crew and environment, a mission-day scrubber, the twin, the current card, the rings, and one chart. Body, check-in, ground note, and briefing are separate sections of the same state. Check-ins and logged actions live in `localStorage`.

## What is deliberately absent

No invented spaceflight clinical thresholds. The only absolute blood-pressure categories are the CDC table that cites ACC/AHA, and only the severe row changes escalation by itself. No hardware feed. No claim that a language model is running unless a local model actually answers.
