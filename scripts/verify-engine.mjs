import { assess, findStoryMarks, bpCategory } from '../src/lib/engine.js';

const empty = { checkins: {}, actions: [] };
const marks = findStoryMarks('transit');
console.log('marks', marks);

function line(day) {
  const snap = assess('transit', day, 'voss', empty, { withHistory: false });
  console.log(
    day,
    snap.finding.id,
    snap.finding.level,
    snap.finding.protocolId,
    '|',
    snap.rings.map((r) => `${r.id.slice(0, 3)}:${r.level}`).join(' '),
  );
}

for (const d of [10, 39, 40, 41, 50, 90, 96, 97, 100, 105, 110, 119, 125, 130, 140]) {
  line(d);
}

const sleep = assess('transit', 105, 'voss', empty, { withHistory: false });
const other = assess('transit', 105, 'sato', empty, { withHistory: false });
console.log('voss105', sleep.finding.sentence);
console.log('voss105 attr', sleep.finding.attribution);
console.log('sato105', other.finding.id, other.finding.title);

const cabin = assess('transit', 130, 'voss', empty, { withHistory: false });
console.log('voss130', cabin.finding.id, cabin.finding.attribution);

const crisis = assess(
  'transit',
  60,
  'voss',
  { checkins: { 'voss:60': { sbp: 188, dbp: 110, severeSymptoms: true, complete: true } }, actions: [] },
  { withHistory: false },
);
console.log('crisis', crisis.finding.id, crisis.bpCategory, bpCategory(188, 110));

const iss = assess('iss', 160, 'voss', empty, { withHistory: false });
console.log('iss delay', iss.delayLabel, 'distance', iss.rings.find((r) => r.id === 'distance').level);

let failed = 0;
function expect(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  }
}

const d40 = assess('transit', 40, 'voss', empty, { withHistory: false });
const d50 = assess('transit', 50, 'voss', empty, { withHistory: false });
const d97 = assess('transit', 97, 'voss', empty, { withHistory: false });
expect(d40.finding.id === 'spe', 'day 40 should be the solar event');
expect(d40.rings.find((r) => r.id === 'radiation').level === 'act', 'radiation ring acts on day 40');
expect(d50.finding.id !== 'spe', 'solar event should not still be the headline on day 50');
expect(d50.rings.find((r) => r.id === 'radiation').level === 'nominal', 'radiation ring quiets after the event');
expect(d97.finding.id === 'peer', `day 97 should be crew notice, got ${d97.finding.id}`);
expect(sleep.finding.id.startsWith('sleep'), `day 105 should be sleep drift, got ${sleep.finding.id}`);
expect(sleep.finding.attribution.includes('personal') || sleep.finding.attribution.includes('looks personal'), 'sleep should be personal');
expect(!other.finding.id.startsWith('sleep'), 'Sato should not have the sleep finding');
expect(cabin.finding.protocolId === 'co2' || cabin.finding.id.startsWith('reaction'), `day 130 should be cabin, got ${cabin.finding.id}`);
expect(cabin.finding.attribution.toLowerCase().includes('cabin') || cabin.finding.attribution.toLowerCase().includes('co₂') || cabin.finding.attribution.toLowerCase().includes('co2'), 'day 130 attribution should name the cabin');
expect(crisis.finding.level === 'urgent', 'severe BP is urgent');
expect(marks.some((m) => m.label === 'Sleep drift'), 'story mark for sleep');
expect(marks.some((m) => m.label === 'Cabin air'), 'story mark for cabin');

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('all checks passed');
