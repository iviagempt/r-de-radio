import Hls from "hls.js";

// ...

hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
  // Em hls.js 1.5.x, use fragments para calcular a janela (DVR window)
  const details = data.details as {
    fragments?: Array<{ start: number; duration: number }>;
    live?: boolean;
  };

  const frags = details?.fragments || [];
  if (frags.length > 0) {
    const first = frags[0];
    const last = frags[frags.length - 1];

    const start = typeof first.start === "number" ? first.start : 0;
    const end =
      typeof last.start === "number" && typeof last.duration === "number"
        ? last.start + last.duration
        : 0;

    const dur = Math.max(0, end - start);
    setWindowSec(dur || null);
  } else {
    setWindowSec(null);
  }
});
