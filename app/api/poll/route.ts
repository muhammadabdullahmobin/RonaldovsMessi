import { NextRequest, NextResponse } from "next/server";
import net from "node:net";
import tls from "node:tls";

type PollChoice = "Messi" | "Ronaldo";
type RedisValue = string | number | null | RedisValue[];

const defaultPollVotes: Record<PollChoice, number> = {
  Messi: 5,
  Ronaldo: 8
};

const pollKeys: Record<PollChoice, string> = {
  Messi: "goat-debate:poll:messi",
  Ronaldo: "goat-debate:poll:ronaldo"
};

const redisRestUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisRestToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redisSocketUrl = process.env.REDIS_URL ?? process.env.STORAGE_URL;

export const dynamic = "force-dynamic";

function encodeRedisCommand(command: Array<string | number>) {
  const parts = [`*${command.length}`];

  for (const item of command) {
    const value = String(item);
    parts.push(`$${Buffer.byteLength(value)}`, value);
  }

  return `${parts.join("\r\n")}\r\n`;
}

function parseRedisResponse(buffer: Buffer, offset = 0): [RedisValue, number] {
  const prefix = String.fromCharCode(buffer[offset]);
  const lineEnd = buffer.indexOf("\r\n", offset);

  if (lineEnd === -1) {
    throw new Error("Incomplete Redis response.");
  }

  const line = buffer.toString("utf8", offset + 1, lineEnd);
  const next = lineEnd + 2;

  if (prefix === "+") return [line, next];
  if (prefix === ":") return [Number(line), next];
  if (prefix === "-") throw new Error(line);

  if (prefix === "$") {
    const length = Number(line);
    if (length === -1) return [null, next];

    const valueStart = next;
    const valueEnd = valueStart + length;
    return [buffer.toString("utf8", valueStart, valueEnd), valueEnd + 2];
  }

  if (prefix === "*") {
    const length = Number(line);
    if (length === -1) return [null, next];

    const values: RedisValue[] = [];
    let cursor = next;

    for (let index = 0; index < length; index += 1) {
      const [value, nextCursor] = parseRedisResponse(buffer, cursor);
      values.push(value);
      cursor = nextCursor;
    }

    return [values, cursor];
  }

  throw new Error("Unsupported Redis response.");
}

async function redisSocketCommand<T>(command: Array<string | number>): Promise<T> {
  if (!redisSocketUrl) {
    throw new Error("Poll storage is not configured.");
  }

  const url = new URL(redisSocketUrl);
  const port = Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379));
  const host = url.hostname;
  const password = decodeURIComponent(url.password);
  const username = decodeURIComponent(url.username || "default");
  const socket = url.protocol === "rediss:" ? tls.connect({ host, port }) : net.connect({ host, port });
  const commands: Array<Array<string | number>> = password
    ? [["AUTH", username, password], command, ["QUIT"]]
    : [command, ["QUIT"]];
  const resultCommandIndex = password ? 1 : 0;

  return await new Promise<T>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("Poll storage request timed out."));
    }, 5000);

    socket.on("connect", () => {
      socket.write(commands.map(encodeRedisCommand).join(""));
    });
    socket.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    socket.on("error", reject);
    socket.on("end", () => {
      clearTimeout(timeout);

      try {
        const buffer = Buffer.concat(chunks);
        let cursor = 0;
        let result: RedisValue = null;

        for (let index = 0; index < commands.length; index += 1) {
          const [value, nextCursor] = parseRedisResponse(buffer, cursor);
          if (index === resultCommandIndex) {
            result = value;
          }
          cursor = nextCursor;
        }

        resolve(result as T);
      } catch (error) {
        reject(error);
      }
    });
  }).finally(() => socket.destroy());
}

async function redisRestCommand<T>(command: Array<string | number>): Promise<T> {
  if (!redisRestUrl || !redisRestToken) {
    throw new Error("Poll storage is not configured.");
  }

  const response = await fetch(redisRestUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisRestToken}`,
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

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  if (redisRestUrl && redisRestToken) {
    return redisRestCommand<T>(command);
  }

  return redisSocketCommand<T>(command);
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
