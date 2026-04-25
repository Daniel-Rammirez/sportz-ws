#!/usr/bin/env tsx
/**
 * Simulates a live match: creates a match then posts commentary every 5 seconds.
 * Usage: tsx scripts/simulate-match.ts [base-url]
 * Default base URL: http://localhost:3000
 */

const BASE_URL = process.argv[2] ?? "http://localhost:3000";

const HOME_TEAM = "FC Barcelona";
const AWAY_TEAM = "Real Madrid";
const SPORT = "football";

type CommentaryEvent = {
  minute: number;
  sequence?: number;
  period: string;
  eventType?: string;
  actor?: string;
  team?: string;
  message: string;
  tags?: string[];
};

const events: CommentaryEvent[] = [
  { minute: 1, period: "1H", message: "Kick off! The match is underway." },
  {
    minute: 5,
    period: "1H",
    eventType: "shot",
    actor: "Lewandowski",
    team: HOME_TEAM,
    message: "Lewandowski drives forward and fires wide of the post.",
    tags: ["shot", "wide"],
  },
  {
    minute: 12,
    period: "1H",
    eventType: "foul",
    actor: "Valverde",
    team: AWAY_TEAM,
    message: "Valverde brings down Pedri in the middle of the park. Free kick.",
    tags: ["foul"],
  },
  {
    minute: 18,
    period: "1H",
    eventType: "goal",
    actor: "Yamal",
    team: HOME_TEAM,
    message: "GOAL! Yamal cuts inside and curls it into the top corner!",
    tags: ["goal"],
  },
  {
    minute: 24,
    period: "1H",
    eventType: "shot",
    actor: "Vinicius Jr",
    team: AWAY_TEAM,
    message: "Vinicius Jr with a powerful strike — straight at the keeper.",
    tags: ["shot", "saved"],
  },
  {
    minute: 33,
    period: "1H",
    eventType: "yellow_card",
    actor: "Bellingham",
    team: AWAY_TEAM,
    message: "Bellingham receives a yellow card for a late challenge.",
    tags: ["yellow_card"],
  },
  {
    minute: 41,
    period: "1H",
    eventType: "goal",
    actor: "Mbappé",
    team: AWAY_TEAM,
    message: "GOAL! Mbappé equalises with a clinical finish from the penalty spot.",
    tags: ["goal", "penalty"],
  },
  {
    minute: 45,
    period: "1H",
    message: "Three minutes of added time signalled.",
  },
  { minute: 48, period: "1H", message: "Half time. 1-1 after an exciting first half." },
  { minute: 46, period: "2H", message: "Second half underway!" },
  {
    minute: 54,
    period: "2H",
    eventType: "substitution",
    actor: "Ferran Torres",
    team: HOME_TEAM,
    message: "Ferran Torres comes on for Raphinha.",
    tags: ["substitution"],
  },
  {
    minute: 61,
    period: "2H",
    eventType: "goal",
    actor: "Lewandowski",
    team: HOME_TEAM,
    message: "GOAL! Lewandowski heads home from a corner. Barcelona lead!",
    tags: ["goal", "header"],
  },
  {
    minute: 67,
    period: "2H",
    eventType: "shot",
    actor: "Rodrygo",
    team: AWAY_TEAM,
    message: "Rodrygo's effort clips the crossbar. So close for Madrid!",
    tags: ["shot", "post"],
  },
  {
    minute: 74,
    period: "2H",
    eventType: "foul",
    actor: "Eric Garcia",
    team: HOME_TEAM,
    message: "Eric Garcia fouls Mbappé just outside the box. Dangerous free kick.",
    tags: ["foul"],
  },
  {
    minute: 76,
    period: "2H",
    eventType: "yellow_card",
    actor: "Eric Garcia",
    team: HOME_TEAM,
    message: "Eric Garcia is booked for the foul.",
    tags: ["yellow_card"],
  },
  {
    minute: 83,
    period: "2H",
    eventType: "shot",
    actor: "Lewandowski",
    team: HOME_TEAM,
    message: "Lewandowski almost gets his hat-trick but the keeper tips it over.",
    tags: ["shot", "saved"],
  },
  {
    minute: 90,
    period: "2H",
    message: "Four minutes of added time. Barcelona protecting their lead.",
  },
  {
    minute: 94,
    period: "2H",
    message: "Full time! FC Barcelona win El Clásico 2-1!",
    tags: ["full_time"],
  },
];

async function createMatch(): Promise<string> {
  const now = new Date();
  const startTime = new Date(now.getTime() - 5 * 60 * 1000); // started 5 min ago
  const endTime = new Date(now.getTime() + 90 * 60 * 1000);  // ends in 90 min

  const res = await fetch(`${BASE_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sport: SPORT,
      homeTeam: HOME_TEAM,
      awayTeam: AWAY_TEAM,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create match (${res.status}): ${body}`);
  }

  const { data } = (await res.json()) as { data: { id: string } };
  return data.id;
}

async function postCommentary(matchId: string, event: CommentaryEvent): Promise<void> {
  const res = await fetch(`${BASE_URL}/matches/${matchId}/commentary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`  Failed to post commentary (${res.status}): ${body}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Connecting to ${BASE_URL}\n`);

  console.log("Creating match...");
  const matchId = await createMatch();
  console.log(`Match created: ${matchId}`);
  console.log(`View at: ${BASE_URL}/matches/${matchId}/commentary\n`);

  console.log("Starting commentary simulation (every 5 s)...\n");

  for (const [index, event] of events.entries()) {
    const label = `[${(event.eventType ?? "commentary").toUpperCase()}]`;
    console.log(`${String(event.minute).padStart(2, "0")}' ${label} ${event.message}`);
    await postCommentary(matchId, { ...event, sequence: index + 1, eventType: event.eventType ?? "commentary" });
    await sleep(5000);
  }

  console.log("\nFinishing match...");
  const res = await fetch(`${BASE_URL}/matches/${matchId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "finished" }),
  });

  if (res.ok) {
    console.log("Match status set to finished.");
  } else {
    console.error(`Failed to finish match (${res.status}): ${await res.text()}`);
  }

  console.log("\nSimulation complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
