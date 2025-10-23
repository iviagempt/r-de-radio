import Hls from "hls.js";
// ...

hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
  // data.details: LevelDetails
  const details = data.details as any;
  const frags = details?.fragments as Array<{ start: number; duration: number }>;

  if (Array.isArray(frags) && frags.length > 0) {
    const first = frags[0];
    const last = frags[frags.length - 1];
    const start = typeof first.start === "number" ? first.start : 0;
    const end = typeof last.start === "number" && typeof last.duration === "number"
      ? last.start + last.duration
      : 0;
    const dur = Math.max(0, end - start);
    setWindowSec(dur || null);
  } else {
    setWindowSec(null);
  }
});
