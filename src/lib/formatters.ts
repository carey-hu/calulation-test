export const msToMMSS = (ms: number): string => {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = (totalSec % 60).toFixed(1);
  return `${m}:${s.length < 4 ? '0' + s : s}`;
};

export const formatTime = (ts: number): string => {
  const date = new Date(ts);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes();
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return `${m}/${d} ${pad(h)}:${pad(min)}`;
};
