# NASA Space Apps submission copy

Project name: Narthecium

Team: Apothecaries

## Summary

Narthecium is a health instrument for crews far from Earth. It learns each astronaut’s first 14 days and flags slow drift, in a sentence, across radiation, isolation, gravity, the closed cabin, and distance from Earth. It separates a cabin problem from a personal one by comparing crewmates and habitat sensors. A twin shows one mission day with countermeasures kept and with them dropped. Rules decide the alert and the next step. A local model may only rephrase that decision. It keeps working when a reply takes minutes, and it writes a one-page note for the flight surgeon. It is monitoring and education, not a diagnosis.

## Project details

Functionality: A seeded 180-day simulation drives four crew members and the habitat. CUSUM on each person’s baseline feeds five hazard rings, an escalation ladder, and protocol cards. Cause attribution compares crewmates with cabin sensors. A clickable body explains what each system does, which hazards touch it, what to report, and why the exam matters. The twin projects an illustrative effect of exercise, sleep, and shelter. A one-minute check-in records blood pressure, glucose, temperature, mood, a reaction-time test, and Brother’s Eye peer taps, with a streak and a readiness index. A ground note summarizes the day. Environment modes change link delay and the gravity and dose assumptions: ISS, lunar habitat, Mars transit, Mars surface.

Benefits: The crew gets an early sentence (“sleep efficiency has been falling for 9 days”), a reason to treat it as personal or as the cabin, and steps to take while a reply is still in transit.

Impact: It is a concrete picture of medical autonomy on Moon and Mars missions, where distance makes waiting for Earth a decision of its own.

Technologies: React, Vite, SVG, IBM Plex (bundled through Fontsource), a seeded simulator, and an optional local Ollama model that cannot change alerts. No server is required.

Creativity: Personal baselines instead of population cutoffs, cabin-versus-person attribution, Brother’s Eye, and the twin as a what-if of the same body.

Factors considered: All five hazards, the six core indicators, communication delay, a rules-over-model split, and a hard line between monitoring and diagnosis. Projection numbers are labeled illustrative. The mission is simulated, so the rings are not clinical evidence.

## SI disclosure

Select the options for code and for text. This project’s interface, simulation, and wording were written with AI assistance in Cursor. No images were generated. Do not add NASA logos. The team name is inspired by a science-fiction apothecary; no Games Workshop artwork or official text is used. “Narthecium” is used as the historical word for a medical case.

## NASA resources actually read

- Human Research Program: https://www.nasa.gov/hrp/
- Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- ARCHeR: https://www.nasa.gov/reference/archer/
- Immune Biomarkers: https://www.nasa.gov/reference/immune-biomarkers/
- Artemis II Standard Measures: https://www.nasa.gov/reference/artemis-ii-standard-measures/

## Other resources actually read

- CSA, Monitoring radiation for astronaut health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA, Why do we conduct science experiments in space?: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
- CDC, About High Blood Pressure: https://www.cdc.gov/high-blood-pressure/about/index.html
- IBM Plex via Fontsource (OFL): https://github.com/ibm/plex

## Demo

A 24-second silent video is saved at `public/demo.mp4` (under the 30-second limit). It shows Mars transit, day 40 solar event, day 121 cabin air, day 102 sleep drift, then Treatments. There is also a 7-slide deck at `public/demo.html`.

Seven slides, if the video link cannot be hosted. Open `demo.html` from the published site (arrow keys or Next). Slides:

1. Title. Narthecium, Team Apothecaries.
2. Slow change is easy to miss when Earth is minutes away.
3. Personal baseline, five hazard rings, one sentence.
4. Cabin versus personal. Day 105 sleep. Day 121 cabin CO₂.
5. Labs, neurology (how you feel), treatments (the rules).
6. Day 40 solar event, day 96 crew notice, day 105, day 121.
7. Monitoring, not a diagnosis. Link back to the instrument.

## Project link

https://narthecium-spaceapps.web.app

## Project demonstration

https://narthecium-spaceapps.web.app/demo.mp4

The video is 24 seconds. No password.

## Terms

Read the three term pages linked on the form yourself, then tick them. Do not tick them on the strength of this file.
