export const LADDER = [
  { level: 0, name: 'Self-care', detail: 'Do the steps on the card. Keep the rest of the day.' },
  { level: 1, name: 'Retest', detail: 'Repeat the measurement the card names, then read the ring again.' },
  { level: 2, name: 'Queue the surgeon', detail: 'Send the note now. Start the steps before any reply can arrive.' },
  { level: 3, name: 'Urgent contact', detail: 'A crewmate stays with you. Use the link for this, and keep the steps going while it runs.' },
];

export const PROTOCOLS = {
  baseline: {
    steps: [
      'Live in the first 14 days the way you mean to live the mission. This window becomes the personal baseline.',
      'Finish the daily check-in so blood pressure, glucose, temperature, mood, and reaction time are real entries, not only the simulator.',
    ],
    source: 'The baseline window is a design of this demo. Artemis II Standard Measures collects a standardized set before, during, and after flight so later change has something to be compared with.',
  },
  nominal: {
    steps: ['No extra action. The next useful thing is today’s one-minute check-in, if it is still open.'],
    source: 'A quiet detector is an outcome. NASA’s Human Research Program studies hazards that change slowly, which is why a day with nothing to report still gets recorded.',
  },
  spe: {
    steps: [
      'Move into the best-shielded part of the vehicle and stay there.',
      'Note the time you went in. Watch the radiation ring rather than guessing when it is over.',
      'Queue a note to the flight surgeon. Do not wait for the reply before you shelter.',
      'When the dose rate falls back and the ring leaves Act, log the time you came out.',
    ],
    source: 'Illustrative drill, not a flight rule. NASA HRP calls space radiation invisible and one of the hardest hazards to picture. The Canadian Space Agency’s 2026 note on astronaut radiation monitoring describes continuous instruments, including neutron detectors, as the way exposure is actually measured.',
  },
  sleep: {
    steps: [
      'Protect the next sleep block. Dim lights and drop non-urgent work in the hour before it.',
      'Write down caffeine and whether exercise ran late, in the check-in note.',
      'After that sleep block, repeat mood and the reaction-time test.',
      'If Brother’s Eye has a flag next to your name, talk to that crewmate today.',
    ],
    source: 'Illustrative card. NASA HRP lists inadequate sleep and irregular schedules as a behavioral risk, and isolation as a hazard of its own. ARCHeR measures sleep, activity, and behavior with actigraphy and surveys on Artemis. This demo does not collect actigraphy.',
  },
  peer: {
    steps: [
      'Ask the crewmate who flagged you what they saw. Keep it to the sign they tapped.',
      'Do today’s check-in if you have not. Mood and the reaction test are the useful pair.',
      'If two people saw the same thing again tomorrow, queue a short note even if the curves are still quiet.',
    ],
    source: 'Illustrative. NASA HRP describes behavioral change, teamwork, and sleep as risks that show up between people, not only on a sensor. Brother’s Eye is a structured way to record that. It is not a psychological test.',
  },
  co2: {
    steps: [
      'Treat this as the cabin until a person-only signal says otherwise.',
      'With the duty engineer, check ventilation and the CO₂ trace.',
      'Repeat the reaction-time test in about two hours.',
      'If the crew still feels slow and CO₂ is still rising, queue the surgeon and keep the log.',
    ],
    source: 'Illustrative. NASA HRP’s closed-environment hazard includes temperature, pressure, lighting, noise, and the air the crew has to live in. The reaction-time link in this demo is a simulation, not a measured CO₂ limit.',
  },
  'personal-drift': {
    steps: [
      'Repeat the measurement that moved. One odd reading is not a trend. The card fired because the slide held.',
      'Compare notes with one crewmate. If they feel the same, suspect the cabin and open the environment ring.',
      'If it is only you, adjust the matching countermeasure (sleep block or exercise) and look again tomorrow.',
    ],
    source: 'Illustrative. Alerts here come from a personal baseline and a change detector, not from a spaceflight clinical cutoff.',
  },
  skin: {
    steps: [
      'Tell one crewmate what you see and where.',
      'Check temperature again tomorrow morning.',
      'If it spreads, hurts, or you feel ill, queue the surgeon. This checkbox is not a lab result.',
    ],
    source: 'NASA’s Immune Biomarkers study, starting with Artemis II, looks at immune cells, stress hormones, and dormant viruses using blood and saliva, including dry saliva blots in space. This demo does not collect samples. Skin and cold-sore changes are only a prompt to look, because earlier NASA work has seen viruses such as the one that causes shingles reactivate in flight.',
  },
  'bp-severe': {
    steps: [
      'Stop exercise. Sit or lie down.',
      'Repeat blood pressure in 10 minutes with the cuff at heart level.',
      'If it is still in the severe row, this stays an urgent contact.',
      'While the link runs, stay seated and have a crewmate stay with you. Write down any new symptoms.',
    ],
    source: 'The severe row is the CDC table (higher than 180 systolic and/or higher than 120 diastolic), which CDC attributes to ACC/AHA categories. CDC says that without the listed symptoms you contact a clinician. This is not a spaceflight diagnosis and not a medication order.',
  },
  'bp-emergency': {
    steps: [
      'Sit or lie down. A crewmate stays.',
      'Open urgent contact now.',
      'Repeat the blood pressure if you can do it without standing. Read the symptoms aloud and write them in the note.',
      'Do not wait out the link delay before you sit down and call.',
    ],
    source: 'CDC, citing ACC/AHA: higher than 180 systolic and/or higher than 120 diastolic with chest pain, shortness of breath, back pain, numbness, weakness, vision change, or trouble speaking is the emergency row. On Earth that page says to call emergency services. In this setting the matched action is urgent contact plus a crewmate present. This app cannot treat it.',
  },
  symptoms: {
    steps: [
      'Stop what you are doing. Sit or lie down. A crewmate stays.',
      'Open urgent contact and say the symptom in plain words.',
      'Repeat a full set of check-in numbers if you can do it seated.',
    ],
    source: 'The symptom list is the one CDC prints beside the severe blood-pressure row. Logging a symptom does not identify the cause. The escalation is there so a dangerous feeling is not smoothed away by an otherwise quiet baseline.',
  },
};

export const SYSTEMS = [
  {
    id: 'heart',
    name: 'Heart and vessels',
    watches: 'Resting heart rate, blood pressure, the rise in heart rate when you stand.',
    function:
      'The heart and vessels move blood against gravity on Earth. Take gravity away, or change it, and the same plumbing runs under a different load.',
    why: 'NASA’s risk list includes cardiovascular adaptations and a loss of cardiorespiratory fitness. The exam matters because those changes can sit quietly in a resting number for weeks. Narthecium compares the number with your own first 14 days. A category from a terrestrial blood-pressure table is shown beside it and labeled as terrestrial.',
    hazards: [
      'Gravity fields change circulation and the stand-up response.',
      'Closed environments and workload change heart rate from one day to the next, which is why a single spike is not the alert.',
      'Distance from Earth means a worrying reading has to be handled before a reply arrives.',
    ],
    symptoms: [
      'Dizziness when you stand for a task you used to do easily.',
      'Chest pain, shortness of breath, numbness, weakness, vision change, or trouble speaking. Those are urgent. They come from the CDC symptom list, not from a new rule.',
    ],
    prevention:
      'HRP notes that crews already exercise to limit losses in heart, muscle, and bone performance. The exercise switch on the twin only changes an illustrative drawing. It is not a prescription.',
  },
  {
    id: 'bone',
    name: 'Bone and muscle',
    watches: 'The twin’s bone figure, grip in the simulator, activity minutes, body mass.',
    function:
      'Bone and muscle stay dense because daily load tells them to. In microgravity that load disappears. On the Moon and Mars it comes back only in part.',
    why: 'NASA lists spaceflight-induced bone changes, and reduced musculoskeletal fitness, as risks. Bones can become more brittle, and the loss is slow enough that a person does not feel a percent a month. The drawing exists so the slow change has a shape. The percent beside it is an illustrative rate, not a DEXA scan.',
    hazards: [
      'Gravity fields are the main driver in this model. Full unload on ISS and in Mars transit. Partial unload on the Moon and Mars.',
      'Radiation is drawn on the same body because the hazards stack. The bone math itself is the gravity term.',
    ],
    symptoms: [
      'No early ache is guaranteed. Pain is a late and unreliable signal, which is the reason for a picture.',
      'A real break, sudden pain, or inability to bear load is urgent contact, not a ring color.',
    ],
    prevention:
      'The Human Research Program points to exercise, diet, and in some cases medication as lines of study for preserving bone. This demo only toggles “resistive exercise kept” as a scenario. It does not invent a dose of exercise or a drug.',
  },
  {
    id: 'brain',
    name: 'Brain, sleep, and mood',
    watches: 'Sleep hours, sleep efficiency, mood, reaction time, Brother’s Eye.',
    function:
      'Sleep, mood, and attention are how a small crew stays a crew. They are also easy to explain away one night at a time.',
    why: 'HRP lists inadequate sleep, behavioral change, and psychiatric risk under isolation, confinement, radiation, and distance. ARCHeR is built to measure well-being, activity, sleep, and interactions on Artemis with actigraphy and surveys. The check-in here is a stand-in for that daily look, not the study itself.',
    hazards: [
      'Isolation and confinement. The habitat is small and the social world is three other people.',
      'Distance from Earth. A bad week cannot be handed to a specialist the same hour.',
      'A closed cabin can imitate a mood problem. That is why attribution looks at the other crew and the CO₂ sensor before it says “personal”.',
    ],
    symptoms: [
      'A shorter fuse, withdrawing from meals, clumsy hands, low energy. Those are the Brother’s Eye taps.',
      'Thoughts of self-harm are not a ring. They are a reason to wake a crewmate and open urgent contact.',
    ],
    prevention:
      'Keep the sleep block, light the evening down, and let someone else see you. The card is illustrative. It is not therapy and not a diagnosis.',
  },
  {
    id: 'immune',
    name: 'Immune system',
    watches: 'Temperature, a visible skin note, and the immune glow on the twin.',
    function:
      'The immune system keeps dormant viruses quiet and answers new infections. Spaceflight stress can change that balance.',
    why: 'HRP lists altered immune responses: inactive viruses can wake up and cause rashes and other symptoms. The Immune Biomarkers study on Artemis II takes blood and saliva, including dry saliva blots during the mission, to watch cells, stress hormones, and viruses. This demo does not pretend to run that assay. It explains why a skin change and a temperature drift are worth saying out loud.',
    hazards: [
      'Radiation and isolation both sit on the immune risk in NASA’s own framing.',
      'A closed habitat is also a microbial habitat. HRP lists host-microorganism interactions as a separate risk.',
    ],
    symptoms: [
      'Cold sores, rash, swollen glands, feverish feeling.',
      'Feeling suddenly ill, confused, or short of breath is urgent contact, not a watch ring.',
    ],
    prevention:
      'The study’s purpose is future countermeasures. None are prescribed here. Log what you can see, tell a crewmate, and recheck temperature the next morning.',
  },
  {
    id: 'eyes',
    name: 'Eyes and vision',
    watches: 'No eye sensor in this demo. The panel is here so a vision change has a place to be reported.',
    function:
      'The eye and the optic nerve sit in a pressure environment that shifts when fluid shifts toward the head.',
    why: 'NASA lists Spaceflight Associated Neuro-ocular Syndrome: the structure of the eyes and brain can change in flight, and the long-term consequences are still under study. An exam matters because the crew is the sensor until a real imager is in the loop. Narthecium will not invent an eye diagnosis from heart rate.',
    hazards: [
      'Gravity fields and the headward fluid shift.',
      'Distance from Earth, because a vision change on a cruise cannot wait for a clinic visit to be written down.',
    ],
    symptoms: [
      'New blur, a blind spot, a headache with vision change, or trouble speaking. Vision change with the CDC emergency symptoms is urgent contact.',
    ],
    prevention:
      'Report a change the day it appears, to a crewmate and in the queued note. Illustrative advice only. No exercise claim on this page is a treatment for SANS.',
  },
  {
    id: 'lungs',
    name: 'Lungs and the cabin air',
    watches: 'Cabin CO₂, oxygen saturation in the simulator, reaction time.',
    function:
      'The lungs are the exchange between the body and a room that is also a machine. On a long mission that room is the whole atmosphere.',
    why: 'HRP’s hostile and closed environment hazard is habitability: temperature, pressure, light, noise, microbes, and the air. The risk list also includes hypoxia when operational choices lower oxygen. Reaction time is used here as a crew-performance hint that can be shared. If everyone slows while CO₂ rises, the finding says cabin. If only one person slows, it does not.',
    hazards: [
      'Closed environment. CO₂ in this mission is a scripted creep starting on day 120.',
      'Distance. Fixing a fan may be a crew job long before the ground confirms it.',
    ],
    symptoms: [
      'Headache, air hunger, or the whole crew feeling slow and irritable.',
      'One person short of breath with chest pain is the urgent symptom list, not a CO₂ chart.',
    ],
    prevention:
      'Check the ventilation path and repeat the reaction test. The steps are an illustrative cabin drill. This demo does not set a real spacecraft CO₂ limit.',
  },
];

export const SOURCES = [
  {
    name: 'NASA Human Research Program',
    href: 'https://www.nasa.gov/hrp/',
    used: 'Why the instrument exists: protecting health and performance on Moon and Mars missions.',
  },
  {
    name: 'Risks of Human Spaceflight',
    href: 'https://www.nasa.gov/hrp/risks/',
    used: 'Body-map risks: immune, cardiovascular, bone and fitness, SANS, sleep, behavior, nutrition, hypoxia.',
  },
  {
    name: '5 Hazards of Human Spaceflight',
    href: 'https://www.nasa.gov/hrp/hazards/',
    used: 'The five rings: radiation, isolation, distance, gravity, closed environment.',
  },
  {
    name: 'ARCHeR',
    href: 'https://www.nasa.gov/reference/archer/',
    used: 'Why sleep, activity, and behavior are a daily measure on Artemis.',
  },
  {
    name: 'Immune Biomarkers',
    href: 'https://www.nasa.gov/reference/immune-biomarkers/',
    used: 'Why a skin note is not a lab, and what the real study collects.',
  },
  {
    name: 'Artemis II Standard Measures',
    href: 'https://www.nasa.gov/reference/artemis-ii-standard-measures/',
    used: 'Why a repeated core set, before and during a mission, is the right shape for a check-in.',
  },
  {
    name: 'CSA — Monitoring radiation for astronaut health',
    href: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp',
    used: 'Radiation is measured with dedicated instruments. The ring is a stand-in, not a dosimeter.',
  },
  {
    name: 'CSA — Why do we conduct science experiments in space?',
    href: 'https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp',
    used: 'Longer trips add weightlessness, radiation, isolation, communication delay, and less help from Earth.',
  },
  {
    name: 'CDC — About High Blood Pressure',
    href: 'https://www.cdc.gov/high-blood-pressure/about/index.html',
    used: 'The only absolute blood-pressure categories in the app, including the severe row and its symptom list.',
  },
];

export function rulesExplanation(finding, delayLabel) {
  const step = LADDER.find((item) => item.level === finding.escalation);
  const wait =
    delayLabel.startsWith('1 sec') || delayLabel.startsWith('2 sec') || delayLabel.startsWith('3 sec')
      ? `The link is short (${delayLabel}). You can still do the steps before you talk to the ground.`
      : `A reply takes ${delayLabel}. The steps are what you do during that wait.`;
  return `${finding.sentence} ${finding.attribution} The rules set this to ${step.name}: ${step.detail} ${wait} This text is the rules engine speaking in sentences. It is not medical advice.`;
}
