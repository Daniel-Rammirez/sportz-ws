export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  startTime: string;
  endTime: string | null;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface Commentary {
  id: string;
  matchId: string;
  minute: number;
  sequence?: number;
  period?: string;
  eventType?: string;
  actor?: string;
  team?: string;
  message: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  createdAt: string;
}

export interface WSMessage {
  type: string;
  data?: unknown;
  message?: string;
}

export type MessageType =
  | "Match Created"
  | "Score Update"
  | "Commentary"
  | "Match Subscription"
  | "Match Unsubscribe"
  | "Welcome";
