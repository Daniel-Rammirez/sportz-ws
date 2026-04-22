import { motion } from "framer-motion";
import type { Commentary } from "../types";

interface Props {
  entry: Commentary;
  index: number;
}

const eventStyles: Record<string, { color: string; label: string }> = {
  goal: { color: "#00ff87", label: "GOAL" },
  "yellow-card": { color: "#ffb800", label: "YELLOW" },
  "yellow card": { color: "#ffb800", label: "YELLOW" },
  "red-card": { color: "#ff4444", label: "RED" },
  "red card": { color: "#ff4444", label: "RED" },
  substitution: { color: "#00b4d8", label: "SUB" },
  sub: { color: "#00b4d8", label: "SUB" },
  wicket: { color: "#ff6b6b", label: "WICKET" },
  boundary: { color: "#00ff87", label: "BOUNDARY" },
  six: { color: "#ffd700", label: "SIX" },
  four: { color: "#00ff87", label: "FOUR" },
  foul: { color: "#ffb800", label: "FOUL" },
  penalty: { color: "#ff4444", label: "PEN" },
  corner: { color: "#00b4d8", label: "CORNER" },
  offside: { color: "#ffb800", label: "OFFSIDE" },
  "free-kick": { color: "#00b4d8", label: "FK" },
  "free kick": { color: "#00b4d8", label: "FK" },
  try: { color: "#00ff87", label: "TRY" },
  conversion: { color: "#00b4d8", label: "CONV" },
  "half-time": { color: "#8b949e", label: "HT" },
  "full-time": { color: "#8b949e", label: "FT" },
  kickoff: { color: "#8b949e", label: "KO" },
  "kick-off": { color: "#8b949e", label: "KO" },
};

export default function CommentaryEntry({ entry, index }: Props) {
  const event = entry.eventType
    ? eventStyles[entry.eventType.toLowerCase()]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index < 15 ? index * 0.03 : 0 }}
      className="group flex gap-3 sm:gap-4"
    >
      {/* Minute badge */}
      <div className="w-12 flex-shrink-0 pt-3 text-right sm:w-14">
        <span className="font-mono text-sm font-bold tabular-nums text-sportz-text-secondary">
          {entry.minute}&apos;
          {entry.sequence != null && (
            <span className="text-[10px] text-sportz-text-secondary/40">
              .{entry.sequence}
            </span>
          )}
        </span>
      </div>

      {/* Timeline connector */}
      <div className="flex flex-shrink-0 flex-col items-center">
        <div
          className="mt-[18px] h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: event ? event.color : "#21262d",
            boxShadow: event ? `0 0 6px ${event.color}40` : "none",
          }}
        />
        <div className="mt-1 w-px flex-1 bg-sportz-border/40" />
      </div>

      {/* Content card */}
      <div className="min-w-0 flex-1 pb-3 pt-2">
        <div className="rounded-lg border border-sportz-border bg-sportz-surface p-4 transition-colors group-hover:border-sportz-border/80">
          {/* Event type + Period */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {event && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                style={{
                  backgroundColor: `${event.color}12`,
                  color: event.color,
                  border: `1px solid ${event.color}25`,
                }}
              >
                {event.label}
              </span>
            )}
            {entry.period && (
              <span className="text-[11px] uppercase tracking-wider text-sportz-text-secondary/70">
                {entry.period}
              </span>
            )}
          </div>

          {/* Actor + Team */}
          {(entry.actor || entry.team) && (
            <div className="mb-1.5 flex items-center gap-2">
              {entry.actor && (
                <span className="font-display text-sm font-semibold text-sportz-text">
                  {entry.actor}
                </span>
              )}
              {entry.team && (
                <span className="text-xs text-sportz-text-secondary">
                  ({entry.team})
                </span>
              )}
            </div>
          )}

          {/* Message */}
          <p className="text-sm leading-relaxed text-sportz-text/85">
            {entry.message}
          </p>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-sportz-elevated px-2 py-0.5 text-[10px] font-medium text-sportz-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
