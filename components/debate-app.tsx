"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  BarChart3,
  Download,
  Moon,
  Search,
  Share2,
  SlidersHorizontal,
  Sun,
  Trophy
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  controversies,
  coreMetrics,
  expandedMetrics,
  goatCategories,
  headToHead,
  lastUpdated,
  navItems,
  sources,
  timeline,
  trophies
} from "@/data/goat-data";

const filters = [
  "Overall",
  "Club only",
  "International only",
  "Prime years",
  "Age 35+",
  "Champions League",
  "World Cup",
  "Knockout games",
  "League only",
  "Cup competitions"
];

const statChart = [
  { name: "Career goals", Messi: 850, Ronaldo: 930 },
  { name: "Assists", Messi: 370, Ronaldo: 255 },
  { name: "UCL goals", Messi: 129, Ronaldo: 140 },
  { name: "World Cup goals", Messi: 13, Ronaldo: 8 },
  { name: "Ballon d'Or", Messi: 8, Ronaldo: 5 },
  { name: "Golden Shoes", Messi: 6, Ronaldo: 4 }
];

const radar = [
  { category: "Scoring", Messi: 9.5, Ronaldo: 10 },
  { category: "Creation", Messi: 10, Ronaldo: 8 },
  { category: "Dribbling", Messi: 10, Ronaldo: 8.5 },
  { category: "Aerial", Messi: 7, Ronaldo: 10 },
  { category: "Big games", Messi: 9.5, Ronaldo: 10 },
  { category: "Longevity", Messi: 9.5, Ronaldo: 10 }
];

type PollChoice = "Messi" | "Ronaldo";

const defaultPollVotes: Record<PollChoice, number> = {
  Messi: 5,
  Ronaldo: 8
};

const pollChoiceStorageKey = "goat-debate-community-poll-choice";

function readStoredPollChoice(): PollChoice | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(pollChoiceStorageKey);
  return stored === "Messi" || stored === "Ronaldo" ? stored : null;
}

function Section({
  id,
  eyebrow,
  title,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
          <h2 className="max-w-4xl font-display text-3xl font-bold text-balance sm:text-5xl">{title}</h2>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-300/50 bg-white/45 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
      {children}
    </span>
  );
}

export function DebateApp() {
  const [dark, setDark] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState<PollChoice | null>(null);
  const [votes, setVotes] = useState<Record<PollChoice, number>>(defaultPollVotes);
  const [hasLoadedPoll, setHasLoadedPoll] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const totalVotes = Math.max(votes.Messi + votes.Ronaldo, 1);
  const messiPercentage = Math.round((votes.Messi / totalVotes) * 100);
  const ronaldoPercentage = 100 - messiPercentage;
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(goatCategories.map(([name]) => [name, 5]))
  );
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 140]);

  useEffect(() => {
    const storedChoice = readStoredPollChoice();

    setSelectedPlayer(storedChoice);
    setHasVoted(Boolean(storedChoice));

    fetch("/api/poll", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          votes?: Record<PollChoice, number>;
          storage?: "global" | "unconfigured";
          error?: string;
        };

        if (payload.votes) {
          setVotes(payload.votes);
        }

        if (!response.ok || payload.storage !== "global") {
          setPollError(payload.error ?? "Live community poll storage is not configured.");
        }
      })
      .catch(() => {
        setPollError("Live community poll is temporarily unavailable.");
      })
      .finally(() => {
        setHasLoadedPoll(true);
      });
  }, []);

  const castPollVote = async () => {
    if (!selectedPlayer || hasVoted || isVoting) return;

    setIsVoting(true);
    setPollError(null);

    try {
      const response = await fetch("/api/poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ choice: selectedPlayer })
      });

      const payload = (await response.json()) as {
        votes?: Record<PollChoice, number>;
        error?: string;
      };

      if (!response.ok || !payload.votes) {
        throw new Error(payload.error ?? "Unable to cast vote.");
      }

      setVotes(payload.votes);
      window.localStorage.setItem(pollChoiceStorageKey, selectedPlayer);
      setHasVoted(true);
    } catch (error) {
      setPollError(error instanceof Error ? error.message : "Unable to cast vote.");
    } finally {
      setIsVoting(false);
    }
  };


  const filteredMetrics = useMemo(() => {
    const all = [...coreMetrics, ...expandedMetrics];
    return all.filter((metric) =>
      `${metric.label} ${metric.scope} ${metric.messi} ${metric.ronaldo}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const weighted = useMemo(() => {
    return goatCategories.reduce(
      (acc, [name, messi, ronaldo]) => {
        const w = weights[name] ?? 5;
        acc.messi += Number(messi) * w;
        acc.ronaldo += Number(ronaldo) * w;
        acc.total += 10 * w;
        return acc;
      },
      { messi: 0, ronaldo: 0, total: 0 }
    );
  }, [weights]);

  return (
    <main className={dark ? "dark" : ""}>
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(214,177,93,.20),transparent_26rem),radial-gradient(circle_at_83%_8%,rgba(14,165,233,.16),transparent_28rem),linear-gradient(135deg,#f8fafc_0%,#eef7f1_45%,#f8fafc_100%)] text-ink transition-colors dark:bg-[radial-gradient(circle_at_20%_10%,rgba(214,177,93,.18),transparent_28rem),radial-gradient(circle_at_86%_12%,rgba(56,189,248,.13),transparent_28rem),linear-gradient(135deg,#060913_0%,#0b201a_48%,#090d18_100%)] dark:text-chalk">
        <div className="fixed inset-0 -z-10 pitch-grid opacity-70" aria-hidden="true" />
        <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/10 bg-white/72 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/68">
          <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary">
            <a href="#home" className="mr-auto flex items-center gap-2 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-gold dark:bg-chalk dark:text-ink">
                10
              </span>
              <span className="hidden sm:inline">The GOAT Debate</span>
            </a>
            <div className="no-scrollbar hidden max-w-3xl gap-1 overflow-x-auto lg:flex">
              {navItems.slice(0, 9).map(([id, label]) => (
                <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-900/10 dark:text-slate-200 dark:hover:bg-white/10">
                  {label}
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-300/60 bg-white/60 dark:border-white/15 dark:bg-white/10"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>

        <section id="home" className="relative min-h-screen px-4 pt-28 sm:px-6 lg:px-8">
          <motion.div style={{ y: heroY }} className="absolute inset-0 -z-10 opacity-80">
            <div className="absolute left-0 top-20 h-[70vh] w-1/2 bg-gradient-to-br from-sky-400/30 via-emerald-400/10 to-transparent" />
            <div className="absolute right-0 top-20 h-[70vh] w-1/2 bg-gradient-to-bl from-rose-500/25 via-gold/20 to-transparent" />
          </motion.div>
          <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div className="z-10">
              <Pill>Neutral • Sourced • Interactive</Pill>
              <h1 className="mt-6 font-display text-4xl font-black leading-tight text-balance text-slate-950 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Messi vs Ronaldo
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-sky-300 to-rose-300">
                  The Greatest Football Rivalry in History
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-200 sm:text-lg sm:leading-8">
                A rigorous comparison of Lionel Messi and Cristiano Ronaldo across statistics, trophies,
                records, tactical roles, international careers, controversies, and cultural impact, without
                declaring a simplistic winner.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#career" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-bold text-white shadow-glow dark:bg-chalk dark:text-ink">
                  Begin the Debate <ArrowDown className="transition group-hover:translate-y-1" size={18} />
                </a>
                <a href="#sources" className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/55 px-6 py-4 text-sm font-bold dark:border-white/15 dark:bg-white/10">
                  View sources
                </a>
              </div>
            </div>
            <div className="relative h-[560px]">
              <div className="absolute inset-y-4 left-0 w-[55%] overflow-hidden rounded-l-[2rem] border border-white/20 bg-slate-900 shadow-panel">
                <Image
                  src="https://i.guim.co.uk/img/static/sys-images/Sport/Pix/pictures/2015/4/14/1429004726107/Lionel-Messi-009.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&precrop=40:21,offset-x50,offset-y0&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctYWdlLTIwMTUucG5n&s=e972bcbd12b7f37ce5d8f8ec888089f9"
                  alt="Lionel Messi with Argentina"
                  fill
                  priority
                  className="object-cover object-center opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-6 left-6 font-display text-4xl font-bold text-white">Messi</span>
              </div>
              <div className="absolute inset-y-4 right-0 w-[55%] overflow-hidden rounded-r-[2rem] border border-white/20 bg-slate-900 shadow-panel">
                <Image
                  src="https://i0.wp.com/sportytell.com/wp-content/uploads/2018/11/Ronaldo-Champions-league-Manchester-United.jpg?zoom=1.25&w=680&ssl=1"
                  alt="Cristiano Ronaldo playing for Manchester United"
                  fill
                  priority
                  className="object-cover object-center opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-6 right-6 font-display text-4xl font-bold text-white">Ronaldo</span>
              </div>
              <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/20 text-2xl font-black text-white backdrop-blur-xl">
                VS
              </div>
            </div>
          </div>
        </section>
<section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
  <div className="glass rounded-3xl border border-white/20 p-8 shadow-panel">

    <div className="text-center">
      <span className="rounded-full bg-gold/20 px-4 py-2 text-sm font-bold text-gold">
        COMMUNITY POLL
      </span>

      <h2 className="mt-5 font-display text-4xl font-black">
        Before You Read...
      </h2>

      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Who do you personally believe is the greatest footballer of all time?
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2">

      <button
        disabled={hasVoted}
        onClick={() => setSelectedPlayer("Messi")}
        className={`rounded-2xl border p-6 text-left transition-all duration-300 ${
          selectedPlayer === "Messi"
            ? "border-sky-400 bg-sky-500/15 scale-105"
            : "border-white/20 hover:scale-105 hover:border-sky-300"
        }`}
      >
        <div className="text-2xl font-black">🇦🇷 Lionel Messi</div>
        <div className="mt-2 text-sm opacity-70">
          8 Ballons d'Or • World Cup Winner
        </div>
      </button>

      <button
        disabled={hasVoted}
        onClick={() => setSelectedPlayer("Ronaldo")}
        className={`rounded-2xl border p-6 text-left transition-all duration-300 ${
          selectedPlayer === "Ronaldo"
            ? "border-rose-400 bg-rose-500/15 scale-105"
            : "border-white/20 hover:scale-105 hover:border-rose-300"
        }`}
      >
        <div className="text-2xl font-black">🇵🇹 Cristiano Ronaldo</div>
        <div className="mt-2 text-sm opacity-70">
          5 Ballons d'Or • UCL All-Time Top Scorer
        </div>
      </button>

    </div>

    <div className="mt-8 text-center">

      <button
        disabled={!hasLoadedPoll || !selectedPlayer || hasVoted || isVoting}
        onClick={castPollVote}
        className="rounded-full bg-gold px-10 py-4 text-lg font-bold text-ink transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {hasVoted ? "✓ Thanks for voting!" : isVoting ? "Casting vote..." : "Cast Vote"}
      </button>

      {hasVoted && selectedPlayer ? (
        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Your vote for {selectedPlayer} has been counted in the live community poll.
        </p>
      ) : null}

      {pollError ? (
        <p className="mt-4 text-sm font-semibold text-rose-500">
          {pollError}
        </p>
      ) : null}

    </div>

    <div className="mt-12">

      <div className="mb-6 flex justify-between font-bold">
        <span>🇦🇷 Messi</span>
        <span>{messiPercentage}%</span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-700"
          style={{ width: `${messiPercentage}%` }}
        />
      </div>

      <div className="mt-8 mb-6 flex justify-between font-bold">
        <span>🇵🇹 Ronaldo</span>
        <span>{ronaldoPercentage}%</span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-rose-500 transition-all duration-700"
          style={{ width: `${ronaldoPercentage}%` }}
        />
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        {hasLoadedPoll ? totalVotes.toLocaleString() : "Loading"} football fans have voted.
      </p>

    </div>

  </div>
</section>
        <Section id="career" eyebrow="Reference model" title="The debate changes when the filter changes.">
          <div className="glass rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    activeFilter === filter ? "bg-gold text-ink" : "bg-white/50 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">
              Active lens: <strong>{activeFilter}</strong>. The production data model keeps scope, provider,
              and update time attached to every statistic. Where providers disagree, the interface labels the
              value as a reconciliation item rather than converting uncertainty into false precision.
            </p>
          </div>
        </Section>

        <Section id="statistics" eyebrow="Statistics" title="Every major category, with scope before conclusion.">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-300/50 bg-white/50 p-3 dark:border-white/15 dark:bg-white/10">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search goals, assists, penalties, dribbles, pressing..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              aria-label="Search statistics"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="overflow-hidden rounded-2xl glass">
              <div className="max-h-[760px] overflow-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="sticky top-0 bg-white/85 backdrop-blur dark:bg-slate-950/85">
                    <tr>
                      {["Statistic", "Messi", "Ronaldo", "Scope", "Sources / update"].map((head) => (
                        <th key={head} className="border-b border-slate-200/70 px-4 py-4 font-bold dark:border-white/10">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMetrics.map((metric) => (
                      <tr key={`${metric.label}-${metric.scope}`} className="border-b border-slate-200/60 dark:border-white/10">
                        <td className="px-4 py-4 font-bold">{metric.label}</td>
                        <td className="px-4 py-4">{metric.messi}</td>
                        <td className="px-4 py-4">{metric.ronaldo}</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{metric.scope}{metric.caveat ? ` ${metric.caveat}` : ""}</td>
                        <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {metric.sourceIds.join(", ")} | {metric.updated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2 font-bold"><BarChart3 size={18} /> Snapshot chart</div>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statChart} layout="vertical" margin={{ left: 18, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={108} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Messi" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="Ronaldo" fill="#d6b15d" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Section>

        <Section id="trophies" eyebrow="Trophies" title="Team trophies and individual awards reward different kinds of dominance.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trophies.map(([name, messi, ronaldo, note]) => (
              <div key={String(name)} className="glass rounded-2xl p-5">
                <Trophy className="mb-4 text-gold" aria-hidden="true" />
                <h3 className="text-lg font-bold">{name}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-sky-400/15 p-4"><p className="text-xs uppercase">Messi</p><p className="text-3xl font-black">{messi}</p></div>
                  <div className="rounded-xl bg-gold/20 p-4"><p className="text-xs uppercase">Ronaldo</p><p className="text-3xl font-black">{ronaldo}</p></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="records" eyebrow="Records" title="Records are strongest when the definition is visible.">
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              "Ronaldo is the UEFA Champions League's all-time leading scorer and one of the competition's defining knockout players.",
              "Messi owns the Ballon d'Or record and one of the most complete single-club statistical peaks in European football.",
              "Ronaldo is the leading men's international goalscorer in official senior football, a record that may be extended while active.",
              "Messi holds the World Cup appearance record and became the central figure of Argentina's 2022 title run.",
              "Both hold records that are vulnerable only to another generational outlier with similar longevity, health, role security, and penalty/set-piece volume."
            ].map((item) => (
              <div key={item} className="glass rounded-2xl p-6 text-lg leading-8">{item}</div>
            ))}
          </div>
        </Section>

        <Section id="style" eyebrow="Tactical analysis" title="Different routes to historic impact.">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="glass rounded-2xl p-6">
              <h3 className="font-display text-3xl font-bold">Lionel Messi</h3>
              <p className="mt-4 leading-8 text-slate-700 dark:text-slate-200">
                Messi evolved from right-sided dribbler to false nine, then to a deeper playmaking forward.
                His strongest case is total on-ball control: elite finishing, line-breaking carries, final-third
                passing, tempo control, and decision-making under pressure. Weaknesses are mostly role and age
                related: lower aerial impact, reduced pressing volume, and defensive transition responsibility
                in late-career systems.
              </p>
            </article>
            <article className="glass rounded-2xl p-6">
              <h3 className="font-display text-3xl font-bold">Cristiano Ronaldo</h3>
              <p className="mt-4 leading-8 text-slate-700 dark:text-slate-200">
                Ronaldo evolved from touchline winger to explosive inside forward, then penalty-box striker.
                His strongest case is repeatable goalscoring across contexts: movement, aerial dominance,
                two-footed finishing, shot volume, conditioning, and Champions League knockout output. Weaknesses
                include less connective playmaking than Messi, lower late-career defensive involvement, and team
                structures that increasingly needed to service his penalty-box strengths.
              </p>
            </article>
          </div>
          <div className="mt-6 glass rounded-2xl p-6">
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <Radar name="Messi" dataKey="Messi" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.24} />
                  <Radar name="Ronaldo" dataKey="Ronaldo" stroke="#d6b15d" fill="#d6b15d" fillOpacity={0.24} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {[
          ["international", "International Career", "Messi's arc runs from early final defeats to Copa America, Finalissima, and World Cup completion. Ronaldo's arc transformed Portugal from dangerous outsider into a nation with the Euro 2016 and Nations League era."],
          ["club", "Club Career", "Messi's club case is built around Barcelona's golden age, PSG adaptation, and Inter Miami's commercial-sporting phase. Ronaldo's club case spans Sporting, Manchester United, Real Madrid, Juventus, and Al Nassr."],
          ["big-games", "Big Game Performances", "Ronaldo's Champions League knockout scoring is a central pillar of his argument. Messi's Champions League finals, Clasicos, and 2022 World Cup knockout run are central to his."],
          ["world-cup", "World Cup", "Messi leads the direct World Cup comparison by title, Golden Ball awards, appearances, goals, and knockout narrative. Ronaldo's five-tournament scoring record and Portugal influence remain historically rare."],
          ["champions-league", "Champions League", "Ronaldo leads goals, appearances, and titles. Messi's efficiency, creation, and Barcelona peak keep the competition from being a one-category argument."]
        ].map(([id, title, copy]) => (
          <Section key={id} id={id} eyebrow={title} title={title}>
            <div className="glass rounded-2xl p-6 text-lg leading-8 text-slate-700 dark:text-slate-200">{copy}</div>
          </Section>
        ))}

        <Section id="head-to-head" eyebrow="Direct meetings" title="Head-to-head belongs to teams as much as individuals.">
          <div className="grid gap-4">
            {headToHead.map(([year, fixture, competition, note]) => (
              <div key={`${year}-${fixture}`} className="glass grid gap-2 rounded-2xl p-5 md:grid-cols-[90px_1fr_1fr_2fr]">
                <strong>{year}</strong><span>{fixture}</span><span className="text-gold">{competition}</span><span className="text-slate-700 dark:text-slate-200">{note}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="awards" eyebrow="Awards" title="Awards measure excellence, voting mood, and the story of a season.">
          <div className="glass rounded-2xl p-6 leading-8 text-slate-700 dark:text-slate-200">
            Messi leads the Ballon d'Or count 8-5 and European Golden Shoes 6-4. Ronaldo's award case is reinforced
            by Champions League-era dominance, FIFA awards, UEFA recognition, and record-setting scoring seasons.
            Award totals should be read alongside voting criteria, team success, calendar-year timing, injuries,
            and tournament cycles.
          </div>
        </Section>

        <Section id="controversies" eyebrow="Controversies" title="Neutral coverage separates fact, allegation, opinion, rumor, and disputed claims.">
          <div className="grid gap-5 lg:grid-cols-2">
            {controversies.map((item) => (
              <article key={item.title} className="glass rounded-2xl p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Pill>{item.player}</Pill>
                  <Pill>{item.status}</Pill>
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{item.summary}</p>
                <p className="mt-3 leading-7"><strong>Both sides:</strong> {item.balanced}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"><strong>Common misconception:</strong> {item.misconception}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-gold">Sources: {item.sources.join(", ")}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="timeline" eyebrow="Timeline" title="A rivalry built over decades, leagues, tournaments, and reinventions.">
          <div className="relative border-l border-gold/50 pl-6">
            {timeline.map(([year, event]) => (
              <motion.div key={`${year}-${event}`} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mb-6 glass rounded-2xl p-5">
                <span className="text-sm font-black text-gold">{year}</span>
                <p className="mt-2 text-lg">{event}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section id="analysis" eyebrow="GOAT Analysis" title="Adjust the weights and watch the model change.">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {goatCategories.map(([name, messi, ronaldo, note]) => (
                <div key={name} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold">{name}</h3>
                    <span className="text-sm">Messi {messi} | Ronaldo {ronaldo}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{note}</p>
                  <label className="mt-4 flex items-center gap-3 text-sm">
                    <SlidersHorizontal size={16} /> Weight
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={weights[name]}
                      onChange={(event) => setWeights((current) => ({ ...current, [name]: Number(event.target.value) }))}
                      className="w-full accent-gold"
                    />
                    <span className="w-6 text-right">{weights[name]}</span>
                  </label>
                </div>
              ))}
            </div>
            <aside className="glass sticky top-24 h-fit rounded-2xl p-6">
              <h3 className="font-display text-2xl font-bold">Your model</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-sky-400/15 p-4"><p className="text-xs">Messi</p><p className="text-3xl font-black">{Math.round((weighted.messi / weighted.total) * 1000) / 10}</p></div>
                <div className="rounded-xl bg-gold/20 p-4"><p className="text-xs">Ronaldo</p><p className="text-3xl font-black">{Math.round((weighted.ronaldo / weighted.total) * 1000) / 10}</p></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This is not a verdict engine. It reveals which values drive a user's conclusion.
              </p>
              <div className="mt-5 flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white dark:bg-chalk dark:text-ink" type="button" onClick={() => window.print()}>
                  <Download size={16} /> PDF
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 px-4 py-3 text-sm font-bold dark:border-white/15" type="button" onClick={() => navigator.share?.({ title: document.title, url: location.href })}>
                  <Share2 size={16} /> Share
                </button>
              </div>
            </aside>
          </div>
        </Section>

        <Section id="sources" eyebrow="Sources" title="Every serious claim should be traceable.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 transition hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{source.credibility}</p>
                <h3 className="mt-2 text-lg font-bold">{source.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{source.note}</p>
              </a>
            ))}
          </div>
        </Section>

        <Section id="verdict" eyebrow="Final Verdict" title="The strongest conclusion is gratitude, not tribal certainty.">
          <div className="glass rounded-3xl p-8 sm:p-12">
            <p className="font-display text-3xl leading-tight text-balance sm:text-5xl">
              For nearly two decades, football fans witnessed something that may never happen again. Two players
              continuously pushed each other to unimaginable heights, redefining excellence and inspiring billions
              around the world. Statistics will always be debated. Awards will always be compared. Fans will always
              disagree. But regardless of who anyone believes is the greatest, the true winners were those fortunate
              enough to watch both Lionel Messi and Cristiano Ronaldo share the same era. Rivalries end. Careers end.
              Legends retire. Appreciate greatness while you still can.
            </p>
          </div>
        </Section>
      </div>
    </main>
  );
}
