import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Match } from "../types";

interface MatchCardProps {
  match: Match;
  index: number;
}

const statusConfig = {
  live: {
    label: "LIVE",
    dotClass: "bg-sportz-live animate-pulse-dot",
    badgeClass:
      "bg-sportz-live/10 text-sportz-live border border-sportz-live/30",
    accentClass: "before:bg-sportz-live before:shadow-[0_0_8px_rgba(0,255,135,0.5)]",
    glowClass: "animate-glow-pulse",
  },
  scheduled: {
    label: "UPCOMING",
    dotClass: "bg-sportz-scheduled",
    badgeClass:
      "bg-sportz-scheduled/10 text-sportz-scheduled border border-sportz-scheduled/30",
    accentClass: "before:bg-sportz-scheduled",
    glowClass: "",
  },
  finished: {
    label: "FINISHED",
    dotClass: "bg-sportz-finished",
    badgeClass:
      "bg-sportz-finished/10 text-sportz-finished border border-sportz-finished/30",
    accentClass: "before:bg-sportz-finished",
    glowClass: "opacity-60",
  },
};

function formatMatchTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MatchCard({ match, index }: MatchCardProps) {
  const config = statusConfig[match.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link to={`/match/${match.id}`} className="block">
        <div
          className={`
            group relative cursor-pointer overflow-hidden rounded-lg border
            border-sportz-border bg-sportz-surface p-5 transition-all duration-300
            before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px]
            before:rounded-l-lg hover:border-sportz-border/80 hover:bg-sportz-elevated
            ${config.accentClass} ${config.glowClass}
          `}
        >
          {/* Top: Sport + Status */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sportz-text-secondary">
              {match.sport}
            </span>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${config.badgeClass}`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
              {config.label}
            </div>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-display text-base font-semibold text-sportz-text transition-colors group-hover:text-white sm:text-lg">
                {match.homeTeam}
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2 px-2">
              <span className="font-score text-3xl font-bold tabular-nums text-sportz-text sm:text-4xl">
                {match.homeScore}
              </span>
              <span className="text-sm font-bold text-sportz-text-secondary/50">
                :
              </span>
              <span className="font-score text-3xl font-bold tabular-nums text-sportz-text sm:text-4xl">
                {match.awayScore}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold text-sportz-text transition-colors group-hover:text-white sm:text-lg">
                {match.awayTeam}
              </p>
            </div>
          </div>

          {/* Bottom: Time + CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[11px] text-sportz-text-secondary">
              {formatMatchTime(match.startTime)}
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-sportz-live opacity-0 transition-opacity group-hover:opacity-100">
              VIEW MATCH &rarr;
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
