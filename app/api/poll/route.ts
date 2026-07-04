import { NextRequest, NextResponse } from "next/server";

type PollChoice = "Messi" | "Ronaldo";

const defaultPollVotes: Record<PollChoice, number> = {
  Messi: 5,
  Ronaldo: 8
};

const pollKeys: Record<PollChoice, string> = {
  Messi: "goat-debate:poll:messi",
  Ronaldo: "goat-debate:poll:ronaldo"
};

const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const dynamic = "force-dynamic";

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  if (!redisUrl || !redisToken) {
    throw new Error("Poll storage is not configured.");
  }

  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Poll storage request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { result: T; error?: string };
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

async function ensurePollSeeded() {
  await Promise.all([
    redisCommand<string | null>(["SET", pollKeys.Messi, defaultPollVotes.Messi, "NX"]),
    redisCommand<string | null>(["SET", pollKeys.Ronaldo, defaultPollVotes.Ronaldo, "NX"])
  ]);
}

async function readVotes(): Promise<Record<PollChoice, number>> {
  await ensurePollSeeded();

  const [messi, ronaldo] = await redisCommand<Array<string | number | null>>([
    "MGET",
    pollKeys.Messi,
    pollKeys.Ronaldo
  ]);

  return {
    Messi: Number(messi ?? defaultPollVotes.Messi),
    Ronaldo: Number(ronaldo ?? defaultPollVotes.Ronaldo)
  };
}

function json(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET() {
  try {
    return json({ votes: await readVotes(), storage: "global" });
  } catch (error) {
    return json(
      {
        votes: defaultPollVotes,
        storage: "unconfigured",
        error: error instanceof Error ? error.message : "Poll storage unavailable."
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { choice?: unknown };
    const choice = body.choice;

    if (choice !== "Messi" && choice !== "Ronaldo") {
      return json({ error: "Invalid poll choice." }, { status: 400 });
    }

    await ensurePollSeeded();
    await redisCommand<number>(["INCR", pollKeys[choice]]);

    return json({ votes: await readVotes(), storage: "global" });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unable to cast vote." },
      { status: 500 }
    );
  }
}
