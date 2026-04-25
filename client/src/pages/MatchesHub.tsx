import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Match, MatchStatus } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import { fetchMatches } from "../lib/api";
import MatchCard from "../components/MatchCard";

type Filter = "all" | MatchStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "live", label: "LIVE" },
  { value: "scheduled", label: "UPCOMING" },
  { value: "finished", label: "FINISHED" },
];

const statusOrder: Record<MatchStatus, number> = {
  live: 0,
  scheduled: 1,
  finished: 2,
};

export default function MatchesHub() {
  const [filter, setFilter] = useState<Filter>("all");
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const {
    data: matches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(),
  });

  const handleNewMatch = useCallback(
    (message: Record<string, unknown>) => {
      const match = message.data as Match;
      queryClient.setQueryData<Match[]>(["matches"], (prev) =>
        prev ? [match, ...prev] : [match],
      );
    },
    [queryClient],
  );

  useEffect(() => {
    const { unsubscribe } = subscribe("Match Created", handleNewMatch);

    return unsubscribe;
  }, [subscribe, handleNewMatch]);

  useEffect(() => {
    const { unsubscribe } = subscribe("Score Update", () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    });

    return unsubscribe;
  }, [subscribe, queryClient]);

  const filteredMatches =
    filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const sortedMatches = [...filteredMatches].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );

  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-6 flex items-end gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-sportz-text sm:text-4xl">
            MATCHES
          </h1>
          {liveCount > 0 && (
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sportz-live animate-pulse-dot" />
              <span className="font-mono text-sm font-bold text-sportz-live">
                {liveCount} LIVE
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg border border-sportz-border bg-sportz-surface p-1 w-fit">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-4 py-2 text-[11px] font-bold tracking-wider transition-all duration-200 ${
                filter === f.value
                  ? "bg-sportz-elevated text-sportz-text shadow-sm"
                  : "text-sportz-text-secondary hover:text-sportz-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-sportz-border bg-sportz-surface"
            />
          ))}
        </div>
      ) : isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <p className="text-lg text-red-400">Failed to load matches</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["matches"] })
            }
            className="mt-4 rounded-lg bg-sportz-elevated px-4 py-2 text-sm font-semibold text-sportz-text transition-colors hover:bg-sportz-border"
          >
            Retry
          </button>
        </motion.div>
      ) : sortedMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <p className="text-lg text-sportz-text-secondary">No matches found</p>
          <p className="mt-2 text-sm text-sportz-text-secondary/50">
            {filter !== "all"
              ? "Try a different filter"
              : "Matches will appear here when created"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedMatches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
