import { useEffect, useState } from "react";

interface Props {
  start: string;
  end: string;
  current: string;
  live: string;
  mode: "live" | "historical";
  newEvents: number;
  onSeek: (at: string) => void;
  onLive: () => void;
}
function seconds(value: number) {
  const safe = Math.max(0, Math.round(value));
  return `${String(Math.floor(safe / 3600)).padStart(2, "0")}:${String(Math.floor((safe % 3600) / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}
export function PlaybackControls({
  start,
  end,
  current,
  live,
  mode,
  newEvents,
  onSeek,
  onLive,
}: Props) {
  const startMs = Date.parse(start),
    endMs = Date.parse(end),
    liveMs = Date.parse(live);
  const [playing, setPlaying] = useState(false);
  const currentMs = Date.parse(current);
  const duration = Math.max(1, endMs - startMs);
  const maximum = Math.min(endMs, liveMs);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = Math.min(maximum, Date.parse(current) + 5000);
      onSeek(new Date(next).toISOString());
      if (next >= maximum) setPlaying(false);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [current, maximum, onSeek, playing]);
  return (
    <footer className="ts-atlas-playback">
      <div className="ts-atlas-transport">
        <button
          onClick={() => setPlaying(true)}
          aria-pressed={playing}
          aria-label="Play replay"
        >
          ▶
        </button>
        <button
          onClick={() => setPlaying(false)}
          aria-pressed={!playing}
          aria-label="Pause replay"
        >
          Ⅱ
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            onSeek(start);
          }}
          aria-label="Stop and return to start"
        >
          ■
        </button>
      </div>
      <time>{seconds((currentMs - startMs) / 1000)}</time>
      <input
        aria-label="Workday replay position"
        type="range"
        min={startMs}
        max={maximum}
        value={Math.min(maximum, Math.max(startMs, currentMs))}
        step={1000}
        onChange={(event) =>
          onSeek(new Date(Number(event.currentTarget.value)).toISOString())
        }
      />
      <span>
        Total <b>{seconds(duration / 1000)}</b>
      </span>
      <span>
        Left <b>{seconds((maximum - currentMs) / 1000)}</b>
      </span>
      <button
        className="ts-atlas-live-edge"
        data-live={mode === "live"}
        onClick={onLive}
      >
        ● {mode === "live" ? "Live edge" : `${newEvents || ""} Live`}
      </button>
    </footer>
  );
}
