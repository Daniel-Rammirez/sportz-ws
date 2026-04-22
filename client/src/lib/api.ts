import type { Match, Commentary } from "../types";

export async function fetchMatches(limit = 100): Promise<Match[]> {
  const res = await fetch(`/matches?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const json = await res.json();
  return json.data;
}

export async function fetchCommentary(
  matchId: string,
  limit = 100,
): Promise<Commentary[]> {
  const res = await fetch(`/matches/${matchId}/commentary?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch commentary");
  const json = await res.json();
  return json.data;
}
