import type { Match } from "../src/db/schema";
import { MATCH_STATUS, MatchStatus } from "../src/validation/matches";

export function getMatchStatus(
  startTime: Date,
  endTime: Date | null,
  now = new Date(),
): MatchStatus {
  if (now < startTime) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (endTime && now >= endTime) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(
  match: Match,
  updateStatus: (status: MatchStatus) => Promise<void>,
): Promise<MatchStatus> {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);

  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }

  return match.status;
}
