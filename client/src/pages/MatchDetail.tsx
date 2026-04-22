import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { Commentary } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import { fetchMatches, fetchCommentary } from "../lib/api";
import CommentaryEntry from "../components/CommentaryEntry";

const statusStyles = {
  live: {
    label: "LIVE",
    class: "bg-sportz-live/10 text-sportz-live border border-sportz-live/30",
  },
  scheduled: {
    label: "SCHEDULED",
    class:
      "bg-sportz-scheduled/10 text-sportz-scheduled border border-sportz-scheduled/30",
  },
  finished: {
    label: "FINISHED",
    class:
      "bg-sportz-finished/10 text-sportz-finished border border-sportz-finished/30",
  },
};

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { send, subscribe, isConnected } = useWebSocket();

  // Fetch match data from the matches list
  const { data: match } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const matches = await fetchMatches();
      return matches.find((m) => m.id === id) ?? null;
    },
    enabled: !!id,
  });

  // Fetch existing commentary
  const { data: initialCommentary, isLoading: commentaryLoading } = useQuery({
    queryKey: ["commentary", id],
    queryFn: () => fetchCommentary(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialCommentary) {
      setCommentary(initialCommentary);
    }
  }, [initialCommentary]);

  // Subscribe to live updates via WebSocket
  useEffect(() => {
    if (!id || !isConnected) return;

    send({ type: "Match Subscription", matchId: id });

    const unsubCommentary = subscribe(
      "Commentary",
      (message: Record<string, unknown>) => {
        const entry = message.data as Commentary;
        if (entry.matchId === id) {
          setCommentary((prev) => [entry, ...prev]);
          queryClient.invalidateQueries({ queryKey: ["commentary", id] });
        }
      },
    );

    const unsubScore = subscribe("Score Update", () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    });

    return () => {
      send({ type: "Match Unsubscribe", matchId: id });
      unsubCommentary();
      unsubScore();
    };
  }, [id, send, subscribe, queryClient, isConnected]);

  const scrollToTop = useCallback(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (feedRef.current) {
      setShowScrollBtn(feedRef.current.scrollTop > 200);
    }
  }, []);

  if (match === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-sportz-text-secondary">Match not found</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-sportz-live hover:underline"
        >
          &larr; Back to matches
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-sportz-text-secondary transition-colors hover:text-sportz-text"
      >
        &larr; All Matches
      </Link>

      {/* Match Header */}
      {match && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative mb-8 overflow-hidden rounded-xl border border-sportz-border bg-sportz-surface p-6 sm:p-8">
            {/* Background gradient for live matches */}
            {match.status === "live" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sportz-live/[0.04] via-transparent to-transparent" />
            )}

            <div className="relative">
              {/* Sport + Status */}
              <div className="mb-6 flex items-center justify-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sportz-text-secondary">
                  {match.sport}
                </span>
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${statusStyles[match.status].class}`}
                >
                  {match.status === "live" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-sportz-live animate-pulse-dot" />
                  )}
                  {statusStyles[match.status].label}
                </div>
              </div>

              {/* Scoreboard */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12">
                <div className="min-w-0 flex-1 text-right">
                  <h2 className="truncate font-display text-xl font-bold text-sportz-text sm:text-2xl md:text-3xl">
                    {match.homeTeam}
                  </h2>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-sportz-text-secondary">
                    Home
                  </span>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                  <span className="font-score text-5xl font-bold tabular-nums text-sportz-text sm:text-6xl">
                    {match.homeScore}
                  </span>
                  <span className="text-xl font-light text-sportz-text-secondary/40">
                    :
                  </span>
                  <span className="font-score text-5xl font-bold tabular-nums text-sportz-text sm:text-6xl">
                    {match.awayScore}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-xl font-bold text-sportz-text sm:text-2xl md:text-3xl">
                    {match.awayTeam}
                  </h2>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-sportz-text-secondary">
                    Away
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Commentary Section */}
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-display text-xl font-bold tracking-wide text-sportz-text">
            COMMENTARY
          </h3>
          {match?.status === "live" && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse-dot" />
              <span className="text-[11px] font-bold tracking-wider text-red-400">
                LIVE
              </span>
            </div>
          )}
          <span className="font-mono text-[11px] text-sportz-text-secondary/50">
            {commentary.length} entries
          </span>
        </div>

        {/* Feed */}
        <div
          ref={feedRef}
          onScroll={handleScroll}
          className="relative max-h-[600px] overflow-y-auto pr-2"
        >
          {commentaryLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border border-sportz-border bg-sportz-surface"
                />
              ))}
            </div>
          ) : commentary.length === 0 ? (
            <div className="rounded-lg border border-sportz-border bg-sportz-surface/50 py-16 text-center">
              <p className="text-sportz-text-secondary">No commentary yet</p>
              <p className="mt-1 text-sm text-sportz-text-secondary/50">
                {match?.status === "live"
                  ? "Commentary will appear here in real time"
                  : "Commentary will be available when the match is live"}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-0">
                {commentary.map((entry, i) => (
                  <CommentaryEntry key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Scroll to latest */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={scrollToTop}
              className="absolute -top-1 right-0 rounded-full bg-sportz-live px-3 py-1.5 text-[11px] font-bold text-sportz-bg shadow-lg transition-colors hover:bg-sportz-live/90"
            >
              &uarr; Latest
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
