export function timeToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h * 60 + mm;
}

export function isNowBetween(start: string, end: string, nowMinutes?: number) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return false;
  const now =
    nowMinutes ??
    (() => {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    })();
  return now >= s && now < e; // inclusive start, exclusive end
}

/** Janela de atendimento em qualquer dos formatos que a API ja devolveu. */
interface AvailabilityWindowLike {
  day: number | string;
  start?: string;
  end?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
}

export function isServiceAvailableNow(
  service: { availabilities?: AvailabilityWindowLike[] } | null | undefined,
  nowMinutes?: number,
) {
  if (!service || !Array.isArray(service.availabilities)) return false;
  const today = new Date().getDay();
  return service.availabilities.some((a) => {
    const day = Number(a.day);
    if (Number.isNaN(day)) return false;
    if (day !== today) return false;
    const start = a.start || a.start_time || a.startTime;
    const end = a.end || a.end_time || a.endTime;
    if (!start || !end) return false;
    return isNowBetween(start, end, nowMinutes);
  });
}
