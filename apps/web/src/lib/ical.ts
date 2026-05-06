interface ICalEvent {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toICalDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildICalendar({
  calName,
  events,
}: {
  calName: string;
  events: ICalEvent[];
}): string {
  const now = toICalDate(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zello Conecta//PT-BR//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calName)}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.uid}@zelloconecta.com.br`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${toICalDate(ev.start)}`);
    lines.push(`DTEND:${toICalDate(ev.end)}`);
    lines.push(`SUMMARY:${escapeText(ev.summary)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
