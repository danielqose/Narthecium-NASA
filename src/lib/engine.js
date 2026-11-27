/**
 * Narthecium mission pipeline.
 *
 * simulate → personal baseline (days 1–14) → CUSUM drift
 * → crew/habitat attribution → hazard rings → escalation
 *
 * The rules engine is the only thing that decides alerts.
 * Any language model may only rephrase the object this file returns.
 * Numbers used as drawings are labeled illustrative at the UI.
 */

export const MISSION_DAYS = 180;
export const BASELINE_DAYS = 14;

export const CREW = [
  { id: 'voss', name: 'Voss', duty: 'Scientist', you: true },
  { id: 'okonkwo', name: 'Okonkwo', duty: 'Commander', you: false },
  { id: 'sato', name: 'Sato', duty: 'Engineer', you: false },
  { id: 'rahman', name: 'Rahman', duty: 'Pilot', you: false },
];

export const ENVIRONMENTS = {
  iss: {
    id: 'iss',
    name: 'ISS',
    gUnload: 1,
    dosePerDay: 0.3,
    blurb: 'Low Earth orbit. Microgravity, and a link that is effectively live.',
  },
  lunar: {
    id: 'lunar',
    name: 'Lunar habitat',
    gUnload: 0.42,
    dosePerDay: 0.48,
    blurb: 'One-sixth gravity. The light-time to Earth is a few seconds.',
  },
  transit: {
    id: 'transit',
    name: 'Mars transit',
    gUnload: 1,
    dosePerDay: 0.66,
    blurb: 'Cruise in microgravity. The link stretches toward about twenty minutes each way.',
  },
  surface: {
    id: 'surface',
    name: 'Mars surface',
    gUnload: 0.5,
    dosePerDay: 0.52,
    blurb: 'Three-eighths gravity, inside a closed habitat, still many minutes from Earth.',
  },
};

const BASE = {
  voss: { hr: 58, sbp: 112, dbp: 70, glucose: 88, temp: 36.6, sleepH: 7.3, sleepEff: 0.91, mood: 7.4, spo2: 98, activity: 68, grip: 41, reaction: 242, weight: 72, ortho: 14 },
  okonkwo: { hr: 64, sbp: 118, dbp: 76, glucose: 93, temp: 36.5, sleepH: 7.0, mood: 7.2, sleepEff: 0.89, spo2: 97, activity: 78, grip: 49, reaction: 228, weight: 81, ortho: 16 },
  sato: { hr: 61, sbp: 108, dbp: 68, glucose: 85, temp: 36.7, sleepH: 6.9, mood: 7.6, sleepEff: 0.9, spo2: 98, activity: 64, grip: 35, reaction: 236, weight: 60, ortho: 13 },
  rahman: { hr: 66, sbp: 122, dbp: 78, glucose: 96, temp: 36.4, sleepH: 7.1, mood: 6.9, sleepEff: 0.88, spo2: 97, activity: 74, grip: 46, reaction: 250, weight: 77, ortho: 17 },
};

export const SIGNALS = [
  { id: 'hr', label: 'Resting heart rate', unit: 'bpm', ring: 'gravity', concern: 'high', floor: 1.4, digits: 0 },
  { id: 'sbp', label: 'Systolic pressure', unit: 'mmHg', ring: 'gravity', concern: 'both', floor: 2.2, digits: 0 },
  { id: 'dbp', label: 'Diastolic pressure', unit: 'mmHg', ring: 'gravity', concern: 'both', floor: 1.6, digits: 0 },
  { id: 'glucose', label: 'Blood glucose', unit: 'mg/dL', ring: 'closed', concern: 'both', floor: 4, digits: 0 },
  { id: 'temp', label: 'Temperature', unit: '°C', ring: 'closed', concern: 'both', floor: 0.08, digits: 1 },
  { id: 'sleepH', label: 'Sleep duration', unit: 'h', ring: 'isolation', concern: 'low', floor: 0.22, digits: 1 },
  { id: 'sleepEff', label: 'Sleep efficiency', unit: '%', ring: 'isolation', concern: 'low', floor: 0.012, digits: 0, percent: true },
  { id: 'mood', label: 'Mood', unit: '/10', ring: 'isolation', concern: 'low', floor: 0.28, digits: 1 },
  { id: 'spo2', label: 'Oxygen saturation', unit: '%', ring: 'closed', concern: 'low', floor: 0.35, digits: 0 },
  { id: 'activity', label: 'Activity', unit: 'min', ring: 'isolation', concern: 'low', floor: 6, digits: 0 },
  { id: 'grip', label: 'Grip strength', unit: 'kg', ring: 'gravity', concern: 'low', floor: 1.1, digits: 1 },
  { id: 'reaction', label: 'Reaction time', unit: 'ms', ring: 'closed', concern: 'high', floor: 11, digits: 0 },
  { id: 'weight', label: 'Body mass', unit: 'kg', ring: 'gravity', concern: 'both', floor: 0.25, digits: 1 },
  { id: 'ortho', label: 'Orthostatic rise', unit: 'bpm', ring: 'gravity', concern: 'high', floor: 1.8, digits: 0 },
];

const HABITAT_SIGNALS = [
  { id: 'co2', label: 'Cabin CO₂', unit: 'ppm', concern: 'high', floor: 70 },
  { id: 'cabinTemp', label: 'Cabin temperature', unit: '°C', concern: 'both', floor: 0.25 },
  { id: 'humidity', label: 'Humidity', unit: '%', concern: 'both', floor: 2 },
  { id: 'noise', label: 'Noise', unit: 'dB', concern: 'high', floor: 1.5 },
  { id: 'doseRate', label: 'Dose rate', unit: 'mGy/day', concern: 'high', floor: 0.05 },
];

const signalById = Object.fromEntries(SIGNALS.map((s) => [s.id, s]));

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(-2.2, Math.min(2.2, n));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function sampleStd(values) {
  if (values.length < 2) return 0;
  const m = average(values);
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function delayMinutes(envId, day) {
  if (envId === 'iss') return 0.03;
  if (envId === 'lunar') return 0.045;
  if (envId === 'surface') return 8 + 8 * Math.sin(((day - 1) / 179) * Math.PI);
  return 4 + (18 * (day - 1)) / 179;
}

export function delayText(minutes) {
  if (minutes < 1) {
    const seconds = Math.max(1, Math.round(minutes * 60));
    return `${seconds} sec each way`;
  }
  return `${Math.round(minutes)} min each way`;
}

function personalValue(crewId, signalId, day) {
  const base = BASE[crewId][signalId];
  const spec = signalById[signalId];
  const rng = mulberry32(hash(`${crewId}|${signalId}|${day}`));
  let value = base + gauss(rng) * spec.floor * 0.55;

  if (crewId === 'voss' && day >= 98) {
    const t = day - 97;
    if (signalId === 'sleepH') value -= t * 0.055;
    if (signalId === 'sleepEff') value -= t * 0.006;
    if (signalId === 'mood') value -= t * 0.038;
    if (signalId === 'activity') value -= t * 0.28;
  }

  if (signalId === 'sleepEff') value = clamp(value, 0.45, 0.98);
  if (signalId === 'mood') value = clamp(value, 1, 10);
  if (signalId === 'spo2') value = clamp(value, 94, 100);
  if (signalId === 'sleepH') value = clamp(value, 3.2, 9);
  if (signalId === 'temp') value = clamp(value, 35.8, 37.6);
  return value;
}

function gravityDelta() {
  // Daily grip and heart-rate noise cannot show the 1% per month bone change.
  // That slow effect is the twin projection, not a false alarm on the rings.
  return 0;
}

function habitatValue(id, day) {
  const rng = mulberry32(hash(`habitat|${id}|${day}`));
  if (id === 'co2') {
    let v = 3050 + gauss(rng) * 45;
    if (day >= 120) v += Math.min(3400, (day - 119) * 105);
    return v;
  }
  if (id === 'cabinTemp') return 22.4 + gauss(rng) * 0.15;
  if (id === 'humidity') return 46 + gauss(rng) * 1.2;
  if (id === 'noise') return 54 + gauss(rng) * 0.8;
  if (id === 'doseRate') {
    const spe = day === 40 || day === 41 ? 16 : 0;
    return 0.02 + gauss(rng) * 0.01 + spe;
  }
  return 0;
}

const seriesCache = new Map();

export function missionSeries(envId) {
  if (seriesCache.has(envId)) return seriesCache.get(envId);
  const habitat = {};
  for (const h of HABITAT_SIGNALS) {
    habitat[h.id] = [];
    for (let day = 1; day <= MISSION_DAYS; day += 1) {
      let value = habitatValue(h.id, day);
      if (h.id === 'doseRate') value += ENVIRONMENTS[envId].dosePerDay;
      habitat[h.id].push(value);
    }
  }
  const crew = {};
  for (const member of CREW) {
    crew[member.id] = {};
    for (const spec of SIGNALS) {
      const values = [];
      for (let day = 1; day <= MISSION_DAYS; day += 1) {
        let value = personalValue(member.id, spec.id, day) + gravityDelta(envId, spec.id, day);
        if (spec.id === 'reaction') {
          const co2 = habitat.co2[day - 1];
          if (co2 > 3900) value += (co2 - 3900) * 0.038;
        }
        values.push(value);
      }
      crew[member.id][spec.id] = values;
    }
  }
  const built = { habitat, crew };
  seriesCache.set(envId, built);
  return built;
}

function applyOverrides(values, crewId, signalId, store) {
  const next = values.slice();
  const checkins = store?.checkins || {};
  for (const [key, entry] of Object.entries(checkins)) {
    const [who, dayStr] = key.split(':');
    if (who !== crewId) continue;
    const day = Number(dayStr);
    if (!day || day < 1 || day > next.length) continue;
    if (Number.isFinite(entry[signalId])) next[day - 1] = entry[signalId];
  }
  return next;
}

export function cusum(values, { k = 0.45, h = 5.2, floor = 0.0001, concern = 'both' } = {}) {
  if (values.length <= BASELINE_DAYS) {
    return {
      ready: false,
      active: false,
      warn: false,
      direction: 0,
      run: 0,
      mean: average(values),
      std: 0,
      alarmDay: null,
    };
  }
  const base = values.slice(0, BASELINE_DAYS);
  const mean = average(base);
  const std = Math.max(sampleStd(base), floor);
  let gp = 0;
  let gn = 0;
  let alarmDay = null;
  for (let i = BASELINE_DAYS; i < values.length; i += 1) {
    const z = (values[i] - mean) / std;
    gp = Math.max(0, gp + z - k);
    gn = Math.max(0, gn - z - k);
    const up = concern !== 'low' && gp >= h;
    const down = concern !== 'high' && gn >= h;
    if ((up || down) && alarmDay == null) alarmDay = i + 1;
  }
  const direction = gp >= gn ? 1 : -1;
  const stat = direction > 0 ? gp : gn;
  const sideOk =
    concern === 'both' ||
    (concern === 'high' && direction > 0) ||
    (concern === 'low' && direction < 0);
  const active = sideOk && stat >= h;
  const warn = !active && sideOk && stat >= h * 0.62;
  let run = 0;
  if (active) {
    for (let i = values.length - 1; i >= 0; i -= 1) {
      const z = (values[i] - mean) / std;
      const bad = direction > 0 ? z > 0.35 : z < -0.35;
      if (!bad) break;
      run += 1;
    }
  }
  return { ready: true, active, warn, direction: active ? direction : 0, run, mean, std, alarmDay, gp, gn };
}

export function ewma(values, alpha = 0.18) {
  const out = [];
  let s = values[0] ?? 0;
  for (const v of values) {
    s = alpha * v + (1 - alpha) * s;
    out.push(s);
  }
  return out;
}

export function formatSignal(id, value) {
  const spec = signalById[id];
  if (!spec || !Number.isFinite(value)) return '—';
  if (spec.percent) return `${Math.round(value * 100)}%`;
  const n = spec.digits === 0 ? Math.round(value) : value.toFixed(spec.digits);
  return `${n} ${spec.unit}`.trim();
}

/**
 * Terrestrial categories quoted by the CDC from ACC/AHA.
 * Only the severe row escalates by itself. Everything milder is drift.
 */
export function bpCategory(sbp, dbp) {
  if (sbp > 180 || dbp > 120) return 'severe';
  if (sbp >= 140 || dbp >= 90) return 'stage2';
  if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) return 'stage1';
  if (sbp >= 120 && sbp <= 129 && dbp < 80) return 'elevated';
  if (sbp < 120 && dbp < 80) return 'normal';
  return 'stage2';
}

export const BP_CATEGORY_LABEL = {
  normal: 'Normal on the CDC table',
  elevated: 'Elevated on the CDC table',
  stage1: 'Stage 1 on the CDC table',
  stage2: 'Stage 2 on the CDC table',
  severe: 'Severe range on the CDC table',
};

const PEER_SIGNS = [
  ['energy', 'Low energy'],
  ['irritable', 'Irritable'],
  ['withdrawn', 'Withdrawn'],
  ['clumsy', 'Clumsy'],
  ['appetite', 'Appetite down'],
];

export const PEER_SIGN_DEFS = PEER_SIGNS;

function signList(flags) {
  if (!flags) return [];
  return PEER_SIGNS.filter(([key]) => flags[key]).map(([, label]) => label);
}

export function peerFlagsFor(store, targetId, day) {
  const found = [];
  const checkins = store?.checkins || {};
  for (const [key, entry] of Object.entries(checkins)) {
    const [observer, dayStr] = key.split(':');
    if (Number(dayStr) !== day) continue;
    if (observer === targetId) continue;
    const signs = signList(entry.flags?.[targetId]);
    if (signs.length) {
      const name = CREW.find((c) => c.id === observer)?.name || observer;
      found.push({ from: name, signs, simulated: false });
    }
  }
  if (targetId === 'voss' && day >= 94) {
    found.push({ from: 'Sato', signs: ['Low energy'], simulated: true });
    if (day >= 96) found.push({ from: 'Rahman', signs: ['Withdrawn'], simulated: true });
  }
  return found;
}

function prefix(values, day) {
  return values.slice(0, day);
}

function detectorFor(values, day, spec) {
  return cusum(prefix(values, day), { floor: spec.floor, concern: spec.concern });
}

function recentZ(values, day, floor) {
  if (day <= BASELINE_DAYS + 3) return 0;
  const base = values.slice(0, BASELINE_DAYS);
  const mean = average(base);
  const std = Math.max(sampleStd(base), floor);
  const start = Math.max(BASELINE_DAYS, day - 7);
  const recent = average(values.slice(start, day));
  return (recent - mean) / std;
}

function sameDirectionCount(series, signalId, day, targetId, direction) {
  const spec = signalById[signalId];
  let n = 0;
  for (const member of CREW) {
    if (member.id === targetId) continue;
    const z = recentZ(series.crew[member.id][signalId], day, spec.floor);
    const aligned = direction > 0 ? z > 1.15 : z < -1.15;
    if (aligned) n += 1;
  }
  return n;
}

function habitatMatch(series, day, direction) {
  let best = null;
  for (const spec of HABITAT_SIGNALS) {
    const z = recentZ(series.habitat[spec.id], day, spec.floor);
    const aligned = direction > 0 ? z > 1.6 : z < -1.6;
    if (!aligned) continue;
    if (!best || Math.abs(z) > Math.abs(best.z)) best = { spec, z };
  }
  return best;
}

function attribute(series, signalId, day, crewId, det) {
  const others = sameDirectionCount(series, signalId, day, crewId, det.direction);
  const habitat = habitatMatch(series, day, det.direction);
  if (others >= 2 && habitat) {
    return {
      kind: 'environment',
      text: `This moved with ${habitat.spec.label.toLowerCase()} and with ${others} other crewmates. Treat it as the cabin, not as one person’s illness.`,
      sensor: habitat.spec.label,
    };
  }
  if (others >= 2) {
    return {
      kind: 'shared',
      text: 'Several crewmates are drifting the same way, and no single cabin sensor jumped with them. On this mission that pattern fits the shared gravity load.',
      sensor: null,
    };
  }
  return {
    kind: 'personal',
    text: 'The rest of the crew is steady, and the cabin sensors did not move with this person. This looks personal.',
    sensor: null,
  };
}

function cumulativeDose(series, day, shelter) {
  const rates = series.habitat.doseRate.slice(0, day);
  const shield = shelter ? 0.72 : 1;
  return rates.reduce((s, v) => s + v, 0) * shield;
}

export function projectBody(envId, day, plan, series) {
  const env = ENVIRONMENTS[envId];
  const months = day / 30.44;
  const exercise = plan.exercise ? 0.28 : 1;
  const boneLoss = 1.1 * env.gUnload * exercise * months;
  const cardio = clamp(months * 0.11 * env.gUnload * (plan.exercise ? 0.35 : 1), 0, 1);
  const fluid = clamp(env.gUnload * (0.28 + months * 0.05), 0, 1);
  const dose = cumulativeDose(series, day, plan.shelter);
  const doseVis = clamp(dose / (env.dosePerDay * 180 + 40), 0, 1);
  const immune = clamp(months * 0.12 * (plan.sleep ? 0.62 : 1) + doseVis * 0.45, 0, 1);
  return {
    boneLoss,
    bone: clamp(boneLoss / 7, 0, 1),
    cardio,
    fluid,
    dose,
    doseVis,
    immune,
  };
}

function levelRank(level) {
  return { nominal: 0, watch: 1, act: 2, urgent: 3 }[level] || 0;
}

function worst(levels) {
  return levels.reduce((a, b) => (levelRank(b) > levelRank(a) ? b : a), 'nominal');
}

function ringMagnitude(det) {
  if (!det?.ready) return 0.08;
  const stat = Math.max(det.gp || 0, det.gn || 0);
  return clamp(stat / 8, 0.08, 1);
}

function driftSentence(spec, det) {
  const word = det.direction < 0 ? 'falling' : 'rising';
  const days = Math.max(det.run, 1);
  const dayWord = days === 1 ? 'day' : 'days';
  return `${spec.label} has been ${word} for ${days} ${dayWord} against this person’s own baseline.`;
}

function skinLogged(store, crewId, day) {
  const entry = store?.checkins?.[`${crewId}:${day}`];
  return Boolean(entry?.skin);
}

function symptomsLogged(store, crewId, day) {
  const entry = store?.checkins?.[`${crewId}:${day}`];
  return Boolean(entry?.severeSymptoms);
}

export function assess(envId, day, crewId, store = {}, options = {}) {
  const safeDay = clamp(Math.round(day), 1, MISSION_DAYS);
  const series = missionSeries(envId);
  const env = ENVIRONMENTS[envId];
  const member = CREW.find((c) => c.id === crewId) || CREW[0];
  const withHistory = options.withHistory !== false;

  const detectors = {};
  for (const spec of SIGNALS) {
    const values = applyOverrides(series.crew[member.id][spec.id], member.id, spec.id, store);
    detectors[spec.id] = { spec, values: prefix(values, safeDay), det: detectorFor(values, safeDay, spec) };
  }
  const habitatDet = {};
  for (const spec of HABITAT_SIGNALS) {
    habitatDet[spec.id] = detectorFor(series.habitat[spec.id], safeDay, spec);
  }

  const today = {};
  for (const spec of SIGNALS) today[spec.id] = detectors[spec.id].values.at(-1);
  const co2 = series.habitat.co2[safeDay - 1];
  const doseRate = series.habitat.doseRate[safeDay - 1];
  const speToday = safeDay === 40 || safeDay === 41;

  const peers = peerFlagsFor(store, member.id, safeDay);
  const peerCount = peers.length;

  const bp = bpCategory(today.sbp, today.dbp);
  const symptomatic = symptomsLogged(store, member.id, safeDay);

  const findings = [];

  if (symptomatic && bp !== 'severe') {
    findings.push({
      id: 'symptoms',
      priority: 1,
      level: 'urgent',
      ring: 'gravity',
      signalId: 'hr',
      escalation: 3,
      protocolId: 'symptoms',
      title: 'Urgent symptoms logged',
      sentence:
        'Today’s check-in includes chest pain, shortness of breath, back pain, numbness, weakness, a change in vision, or trouble speaking.',
      attribution:
        'The CDC lists those symptoms beside the severe blood-pressure row and says to call emergency services if they are present. This instrument cannot tell the cause. Treat it as urgent contact, with a crewmate staying close.',
    });
  }

  if (bp === 'severe') {
    findings.push({
      id: 'bp-severe',
      priority: 1,
      level: 'urgent',
      ring: 'gravity',
      signalId: 'sbp',
      escalation: 3,
      protocolId: symptomatic ? 'bp-emergency' : 'bp-severe',
      title: 'Blood pressure is in the severe range',
      sentence: `Today’s reading is ${Math.round(today.sbp)}/${Math.round(today.dbp)} mmHg. On the CDC page that cites the ACC/AHA table, higher than 180 systolic or higher than 120 diastolic is the severe row.`,
      attribution: symptomatic
        ? 'Symptoms were also logged. On Earth the CDC page says to call emergency services for that combination. Here that means urgent contact, and a crewmate stays with you while the link runs.'
        : 'No severe symptoms were logged. The CDC page says that without those symptoms you contact a clinician rather than emergency services. Here that is still an urgent note to the flight surgeon, and you sit down and repeat the reading.',
    });
  }

  if (speToday) {
    findings.push({
      id: 'spe',
      priority: 2,
      level: 'act',
      ring: 'radiation',
      signalId: 'doseRate',
      escalation: 2,
      protocolId: 'spe',
      title: 'Solar particle event',
      sentence: `Dose rate is ${doseRate.toFixed(1)} mGy/day in this simulation, far above the quiet daily rate. Days 40 and 41 are the injected solar particle event.`,
      attribution: 'The spike is outside the vehicle. It is not a change inside one person. Every crew member shares it.',
    });
  }

  const personalOrder = ['sleepEff', 'sleepH', 'mood', 'reaction', 'hr', 'ortho', 'grip', 'temp', 'glucose', 'activity', 'sbp', 'dbp', 'spo2'];
  for (const id of personalOrder) {
    const row = detectors[id];
    if (!row.det.active) continue;
    const attr = attribute(
      {
        crew: series.crew,
        habitat: series.habitat,
      },
      id,
      safeDay,
      member.id,
      row.det,
    );
    const envHit = attr.kind === 'environment';
    findings.push({
      id: `${id}-${attr.kind}`,
      priority: envHit ? 3 : 4,
      level: 'act',
      ring: row.spec.ring,
      signalId: id,
      escalation: envHit ? 1 : peerCount >= 1 ? 2 : 1,
      protocolId: envHit && id === 'reaction' ? 'co2' : id.startsWith('sleep') || id === 'mood' || id === 'activity' ? 'sleep' : envHit ? 'co2' : 'personal-drift',
      title: row.spec.label,
      sentence: driftSentence(row.spec, row.det),
      attribution: attr.text,
    });
  }

  if (habitatDet.co2.active && !findings.some((f) => f.protocolId === 'co2' && f.priority <= 3)) {
    findings.push({
      id: 'co2-habitat',
      priority: 3,
      level: 'act',
      ring: 'closed',
      signalId: 'co2',
      escalation: 1,
      protocolId: 'co2',
      title: 'Cabin CO₂',
      sentence: `Cabin CO₂ has been rising and is now ${Math.round(co2)} ppm in this simulation.`,
      attribution: 'The cabin CO₂ sensor is the thing that moved. If more than one person feels slow, look at the air before you look for an illness.',
    });
  }

  if (peerCount >= 2 && !findings.some((f) => f.priority <= 4 && f.level === 'act' && f.ring === 'isolation')) {
    findings.push({
      id: 'peer',
      priority: 5,
      level: 'watch',
      ring: 'isolation',
      signalId: 'mood',
      escalation: 0,
      protocolId: 'peer',
      title: 'Crewmates noticed first',
      sentence: `${peers.map((p) => p.from).join(' and ')} flagged visible changes. The personal curves have not crossed the detector yet.`,
      attribution: 'Numbers can lag what a crewmate can see. This is a prompt to talk, not a diagnosis.',
    });
  }

  if (skinLogged(store, member.id, safeDay)) {
    findings.push({
      id: 'skin',
      priority: 6,
      level: 'watch',
      ring: 'isolation',
      signalId: 'temp',
      escalation: 0,
      protocolId: 'skin',
      title: 'Visible skin change logged',
      sentence: 'A rash, cold sore, or swollen gland was checked on today’s card.',
      attribution: 'NASA’s Immune Biomarkers study follows stress hormones, cells, and dormant viruses with blood and saliva. This demo does not collect those samples. The checkbox is only a reminder to look and to tell someone.',
    });
  }

  findings.sort((a, b) => a.priority - b.priority || levelRank(b.level) - levelRank(a.level));
  const finding = findings[0] || {
    id: 'nominal',
    priority: 9,
    level: safeDay < BASELINE_DAYS ? 'watch' : 'nominal',
    ring: 'isolation',
    signalId: 'sleepEff',
    escalation: 0,
    protocolId: safeDay < BASELINE_DAYS ? 'baseline' : 'nominal',
    title: safeDay < BASELINE_DAYS ? 'Baseline still forming' : 'No sustained drift',
    sentence:
      safeDay < BASELINE_DAYS
        ? `Day ${safeDay} is inside the first ${BASELINE_DAYS} days. Narthecium is learning this person’s own resting pattern and will not call a drift yet.`
        : 'Nothing has held a slow slide away from this person’s first 14 days. The rings are quiet on purpose.',
    attribution: 'Quiet is a result, not a missing page. Slow hazards are easy to miss, which is why the detector runs every day even when it says nothing.',
  };

  if (peerCount >= 1 && finding.ring === 'isolation' && finding.id !== 'nominal' && finding.id !== 'peer') {
    finding.attribution = `${finding.attribution} Brother’s Eye: ${peers.map((p) => `${p.from} saw ${p.signs.join(', ').toLowerCase()}`).join('; ')}.`;
  }

  const delay = delayMinutes(envId, safeDay);
  const openNotes = (store?.actions || []).filter((a) => a.crewId === member.id && a.type === 'queue' && !a.closed).length;
  const urgentOpen = (store?.actions || []).some((a) => a.crewId === member.id && a.type === 'urgent' && a.day === safeDay);

  function ringFrom(ids, extraLevel = 'nominal') {
    const levels = [extraLevel];
    let mag = 0.08;
    const notes = [];
    for (const id of ids) {
      const row = detectors[id];
      if (!row) continue;
      if (row.det.active) levels.push('act');
      else if (row.det.warn) levels.push('watch');
      mag = Math.max(mag, ringMagnitude(row.det));
      if (row.det.active) notes.push(driftSentence(row.spec, row.det));
    }
    return { level: worst(levels), magnitude: mag, notes };
  }

  const doseBase = average(series.habitat.doseRate.slice(0, BASELINE_DAYS));
  const radiationLevel = doseRate > doseBase * 4 ? 'act' : doseRate > doseBase * 2.2 ? 'watch' : 'nominal';
  const isolation = ringFrom(['sleepEff', 'sleepH', 'mood', 'activity'], peerCount >= 2 ? 'watch' : peerCount === 1 ? 'watch' : 'nominal');
  const gravity = ringFrom(['hr', 'ortho', 'grip', 'sbp', 'dbp'], bp === 'severe' ? 'urgent' : 'nominal');
  const closed = ringFrom(['reaction', 'glucose', 'temp', 'spo2'], habitatDet.co2.active ? 'act' : habitatDet.co2.warn ? 'watch' : 'nominal');

  let distanceLevel = 'nominal';
  if (finding.level === 'urgent' && delay >= 1) distanceLevel = 'urgent';
  else if (delay >= 8 && openNotes > 0) distanceLevel = 'act';
  else if (delay >= 8 || openNotes > 0) distanceLevel = 'watch';

  const rings = [
    {
      id: 'radiation',
      name: 'Radiation',
      level: radiationLevel,
      magnitude: speToday ? 1 : ringMagnitude(habitatDet.doseRate),
      detail: speToday
        ? 'Solar particle event today. Shelter first.'
        : `Dose rate ${doseRate.toFixed(2)} mGy/day. Cumulative ${cumulativeDose(series, safeDay, false).toFixed(1)} mGy, illustrative.`,
    },
    {
      id: 'isolation',
      name: 'Isolation',
      level: isolation.level,
      magnitude: Math.max(isolation.magnitude, peerCount ? 0.45 : 0),
      detail: isolation.notes[0] || (peerCount ? 'A crewmate flagged a visible change.' : 'Sleep, mood, and activity are near this person’s baseline.'),
    },
    {
      id: 'gravity',
      name: 'Gravity',
      level: gravity.level,
      magnitude: gravity.magnitude,
      detail: gravity.notes[0] || 'Heart rate, pressure, grip, and the stand-up rise are near baseline.',
    },
    {
      id: 'closed',
      name: 'Closed environment',
      level: closed.level,
      magnitude: Math.max(closed.magnitude, habitatDet.co2.active ? 0.85 : 0),
      detail: habitatDet.co2.active
        ? `Cabin CO₂ is ${Math.round(co2)} ppm and still climbing in the simulation.`
        : closed.notes[0] || `Cabin CO₂ is ${Math.round(co2)} ppm.`,
    },
    {
      id: 'distance',
      name: 'Distance',
      level: distanceLevel,
      magnitude: clamp(delay / 22, 0.08, 1),
      detail: `${delayText(delay)}. ${openNotes} note${openNotes === 1 ? '' : 's'} waiting on the surgeon.`,
    },
  ];

  const readiness = Math.round(
    rings.reduce((sum, ring) => {
      const score = { nominal: 100, watch: 72, act: 40, urgent: 18 }[ring.level];
      return sum + score;
    }, 0) / rings.length,
  );

  let history = [];
  if (withHistory) {
    let previous = null;
    for (let d = 1; d <= safeDay; d += 1) {
      const snap = assess(envId, d, member.id, store, { withHistory: false });
      const key = snap.finding.id;
      if (key !== previous && key !== 'nominal' && key !== 'baseline') {
        history.push({
          day: d,
          level: snap.finding.level,
          title: snap.finding.title,
          sentence: snap.finding.sentence,
        });
        previous = key;
      }
      if (key === 'nominal' || key === 'baseline') previous = key;
    }
    history = history.slice(-8).reverse();
  }

  const entryToday = store?.checkins?.[`${member.id}:${safeDay}`] || {};
  const readingIds = ['hr', 'glucose', 'temp', 'sleepH', 'sleepEff', 'mood', 'spo2', 'activity', 'reaction', 'grip', 'weight'];
  const readings = readingIds.map((id) => {
    const spec = signalById[id];
    const det = detectors[id].det;
    const value = today[id];
    const z = det.ready && det.std ? (value - det.mean) / det.std : null;
    return {
      id,
      label: spec.label,
      text: formatSignal(id, value),
      logged: Number.isFinite(entryToday[id]),
      z,
    };
  });
  readings.unshift({
    id: 'sbp',
    label: 'Blood pressure',
    text: `${Math.round(today.sbp)}/${Math.round(today.dbp)}`,
    logged: Number.isFinite(entryToday.sbp),
    z: detectors.sbp.det.ready && detectors.sbp.det.std ? (today.sbp - detectors.sbp.det.mean) / detectors.sbp.det.std : null,
    note: BP_CATEGORY_LABEL[bp],
  });

  const chartId = finding.signalId || 'sleepEff';
  const habitatSpec = HABITAT_SIGNALS.find((item) => item.id === chartId);
  const chartValues =
    detectors[chartId]?.values ||
    (habitatSpec ? prefix(series.habitat[chartId], safeDay) : prefix(series.habitat.doseRate, safeDay));

  return {
    day: safeDay,
    env,
    crew: member,
    today,
    co2,
    doseRate,
    speToday,
    bpCategory: bp,
    bpLabel: BP_CATEGORY_LABEL[bp],
    peers,
    delay,
    delayLabel: delayText(delay),
    openNotes,
    urgentOpen,
    rings,
    readings,
    finding,
    findings: findings.slice(0, 4),
    history,
    readiness,
    chart: {
      id: chartId,
      label: signalById[chartId]?.label || habitatSpec?.label || 'Dose rate',
      unit: signalById[chartId]?.unit || habitatSpec?.unit || 'mGy/day',
      percent: Boolean(signalById[chartId]?.percent),
      values: chartValues,
      trend: ewma(chartValues),
      mean: detectors[chartId]?.det.mean ?? average(chartValues.slice(0, Math.min(BASELINE_DAYS, chartValues.length))),
    },
    twin: {
      kept: projectBody(envId, safeDay, { exercise: true, sleep: true, shelter: true }, series),
      neglected: projectBody(envId, safeDay, { exercise: false, sleep: false, shelter: false }, series),
    },
    seriesRef: series,
  };
}

export function projectWithPlan(envId, day, plan) {
  const series = missionSeries(envId);
  return {
    kept: projectBody(envId, day, plan, series),
    neglected: projectBody(envId, day, { exercise: false, sleep: false, shelter: false }, series),
  };
}

export function findStoryMarks(envId = 'transit') {
  const empty = { checkins: {}, actions: [] };
  let sleep = null;
  let peer = null;
  let cabin = null;
  for (let d = 15; d <= MISSION_DAYS; d += 1) {
    const snap = assess(envId, d, 'voss', empty, { withHistory: false });
    if (!peer && snap.finding.id === 'peer') peer = d;
    if (!sleep && snap.finding.id.startsWith('sleep')) sleep = d;
    if (!cabin && (snap.finding.protocolId === 'co2' || snap.finding.id.startsWith('reaction'))) cabin = d;
    if (sleep && cabin && peer) break;
  }
  return [
    { day: 40, label: 'Solar event' },
    peer ? { day: peer, label: 'Crew notices' } : null,
    sleep ? { day: sleep, label: 'Sleep drift' } : null,
    cabin ? { day: cabin, label: 'Cabin air' } : null,
  ].filter(Boolean);
}

export function streakEnding(store, crewId, day) {
  let n = 0;
  for (let d = day; d >= 1; d -= 1) {
    const entry = store?.checkins?.[`${crewId}:${d}`];
    if (!entry?.complete) break;
    n += 1;
  }
  return n;
}

export function buildReport(snap, store, plan) {
  const lines = [];
  const { crew, env, day } = snap;
  lines.push(`NARTHECIUM GROUND NOTE — ${crew.name} — ${env.name} — mission day ${day} of ${MISSION_DAYS}`);
  lines.push('Educational monitoring summary. Not a diagnosis. Not a flight surgeon’s note.');
  lines.push('');
  lines.push(`Link: ${snap.delayLabel}.`);
  lines.push(`Readiness index: ${snap.readiness} (mean of the five hazard rings).`);
  lines.push('');
  lines.push('Rings');
  for (const ring of snap.rings) {
    lines.push(`- ${ring.name}: ${ring.level}. ${ring.detail}`);
  }
  lines.push('');
  lines.push('Primary finding');
  lines.push(`${snap.finding.title} [${snap.finding.level}]`);
  lines.push(snap.finding.sentence);
  lines.push(snap.finding.attribution);
  lines.push('');
  lines.push('Today, from the model or from hand entry');
  lines.push(`Blood pressure ${Math.round(snap.today.sbp)}/${Math.round(snap.today.dbp)} mmHg (${snap.bpLabel}).`);
  lines.push(`Heart rate ${Math.round(snap.today.hr)} bpm. Glucose ${Math.round(snap.today.glucose)} mg/dL. Temperature ${snap.today.temp.toFixed(1)} °C.`);
  lines.push(`Sleep ${snap.today.sleepH.toFixed(1)} h at ${Math.round(snap.today.sleepEff * 100)}% efficiency. Mood ${snap.today.mood.toFixed(1)} / 10.`);
  const logged = store?.checkins?.[`${crew.id}:${day}`];
  if (logged?.complete) {
    lines.push('This day includes hand-entered values. Those replace the simulator for the fields that were saved.');
    if (logged.valence) lines.push(`State of mind: ${logged.valence}.`);
    if (logged.emotions?.length) lines.push(`Feeling words: ${logged.emotions.join(', ')}.`);
    if (logged.impacts?.length) lines.push(`Biggest impact named by the crew member: ${logged.impacts.join(', ')}.`);
    if (Number.isFinite(logged.hydration)) lines.push(`Hydration logged: ${logged.hydration} ml.`);
  }
  lines.push(`Cabin CO₂ ${Math.round(snap.co2)} ppm.`);
  lines.push('');
  if (snap.peers.length) {
    lines.push('Brother’s Eye');
    for (const peer of snap.peers) {
      lines.push(`- ${peer.from}${peer.simulated ? ' (simulated crewmate)' : ''}: ${peer.signs.join(', ')}`);
    }
    lines.push('');
  }
  const actions = (store?.actions || []).filter((a) => a.crewId === crew.id);
  lines.push('Actions already taken in this demo');
  if (!actions.length) lines.push('- None logged.');
  for (const action of actions) {
    lines.push(`- Day ${action.day}: ${action.text}`);
  }
  lines.push('');
  lines.push('Illustrative twin at this day (not a scan)');
  lines.push(`With switches — bone ${planLabel(plan)}: bone loss ${snap.twinKept.boneLoss.toFixed(1)}% drawn, dose ${snap.twinKept.dose.toFixed(1)} mGy.`);
  lines.push(`Countermeasures off: bone loss ${snap.twinOff.boneLoss.toFixed(1)}% drawn, dose ${snap.twinOff.dose.toFixed(1)} mGy.`);
  lines.push('Bone rate used: 1.1% per month in microgravity with no exercise attenuation, scaled by the environment’s gravity unload. Shielding and exercise reductions are scenario knobs. Published spaceflight literature describes roughly 1–1.5% per month in weight-bearing bone; this drawing is not a prediction for a person.');
  lines.push('');
  lines.push('Data: simulated 180-day crew, plus any values typed into the check-in on this browser.');
  return lines.join('\n');
}

function planLabel(plan) {
  const parts = [];
  if (plan.exercise) parts.push('exercise on');
  if (plan.sleep) parts.push('sleep block on');
  if (plan.shelter) parts.push('shelter drills on');
  return parts.length ? parts.join(', ') : 'all off';
}

export const RING_SIGNAL = {
  radiation: 'doseRate',
  isolation: 'sleepEff',
  gravity: 'hr',
  closed: 'co2',
  distance: null,
};

export function signalTrack(envId, crewId, signalId, day, store = {}) {
  const series = missionSeries(envId);
  const safeDay = clamp(Math.round(day), 1, MISSION_DAYS);
  if (signalId === 'co2' || signalId === 'doseRate') {
    const spec = HABITAT_SIGNALS.find((item) => item.id === signalId);
    const values = series.habitat[signalId].slice(0, safeDay);
    const det = cusum(values, { floor: spec.floor, concern: spec.concern });
    return {
      id: signalId,
      label: spec.label,
      unit: spec.unit,
      percent: false,
      values,
      trend: ewma(values),
      mean: Number.isFinite(det.mean) ? det.mean : average(values.slice(0, Math.min(BASELINE_DAYS, values.length))),
    };
  }
  const spec = signalById[signalId];
  const full = applyOverrides(series.crew[crewId][signalId], crewId, signalId, store);
  const values = full.slice(0, safeDay);
  const det = cusum(values, { floor: spec.floor, concern: spec.concern });
  return {
    id: signalId,
    label: spec.label,
    unit: spec.unit,
    percent: Boolean(spec.percent),
    values,
    trend: ewma(values),
    mean: Number.isFinite(det.mean) ? det.mean : average(values.slice(0, Math.min(BASELINE_DAYS, values.length))),
  };
}

export function reportFrom(snap, store, plan) {
  const twins = projectWithPlan(snap.env.id, snap.day, plan);
  return buildReport({ ...snap, twinKept: twins.kept, twinOff: twins.neglected }, store, plan);
}
