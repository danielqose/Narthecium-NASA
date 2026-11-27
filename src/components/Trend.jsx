const MARKS = [40, 96, 102, 121];

export function Trend({ chart, day }) {
  const values = chart.values;
  if (!values?.length) return null;
  const width = 680;
  const height = 168;
  const pad = 18;
  const min = Math.min(...values, chart.mean);
  const max = Math.max(...values, chart.mean);
  const span = max - min || 1;
  const x = (index) => pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
  const y = (value) => height - pad - ((value - min) / span) * (height - pad * 2);
  const line = (series) =>
    series.map((value, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
  const last = values[values.length - 1];
  const shown = chart.percent ? `${Math.round(last * 100)}%` : `${chart.unit === '°C' || chart.id === 'temp' ? last.toFixed(1) : Math.round(last)} ${chart.unit}`;

  return (
    <div className="chart-block">
      <h3>
        {chart.label} · day {day}
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chart.label} from day 1 to day ${day}. Latest ${shown}.`}>
        {MARKS.filter((mark) => mark <= day).map((mark) => (
          <line key={mark} className="event" x1={x(mark - 1)} x2={x(mark - 1)} y1={pad} y2={height - pad} />
        ))}
        <line className="base" x1={pad} x2={width - pad} y1={y(chart.mean)} y2={y(chart.mean)} />
        <path className="raw" d={line(values)} />
        <path className="trend" d={line(chart.trend)} />
      </svg>
      <p className="chart-caption">
        Pale line, each day. Solid line, smoothed. Dashed brass line, the mean of days 1–14. Vertical marks are the solar event, the crew notice, the sleep detector, and the cabin creep, once those days have arrived.
      </p>
    </div>
  );
}
