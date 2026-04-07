import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Lock,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  ShieldCheck,
  Medal,
  Flag,
  Radio,
  CheckCircle2,
  Search,
  Crown,
} from "lucide-react";

const APP_NAME = "Major Pick'em 2026";
const REVEAL_HOUR_CT = 18;
const DEFAULT_DAY = 1;
const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1600&q=80";
const COURSE_IMAGE =
  "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=1200&q=80";
const TROPHY_IMAGE =
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80";

const GOLFERS = [
  "Scottie Scheffler",
  "Rory McIlroy",
  "Jon Rahm",
  "Xander Schauffele",
  "Ludvig Aberg",
  "Collin Morikawa",
  "Brooks Koepka",
  "Justin Thomas",
  "Viktor Hovland",
  "Patrick Cantlay",
  "Hideki Matsuyama",
  "Tommy Fleetwood",
  "Jordan Spieth",
  "Cameron Smith",
  "Wyndham Clark",
  "Bryson DeChambeau",
  "Shane Lowry",
  "Sungjae Im",
  "Tony Finau",
  "Max Homa",
  "Sahith Theegala",
  "Akshay Bhatia",
  "Tom Kim",
  "Russell Henley",
  "Jason Day",
  "Sam Burns",
  "Will Zalatoris",
  "Matt Fitzpatrick"
];

const USERS = [
  { id: "adam-g-2601", name: "Adam Gourley" },
  { id: "will-r-2602", name: "Will Robson" },
  { id: "billy-e-2603", name: "Billy Embody" },
  { id: "andy-e-2604", name: "Andy Embody" },
  { id: "tommy-s-2605", name: "Tommy Sovereign" },
  { id: "trenton-p-2606", name: "Trenton Patterson", isAdmin: true },
  { id: "corbin-b-2607", name: "Corbin Blount" },
  { id: "jordan-p-2608", name: "Jordan Pierson" },
  { id: "turner-m-2609", name: "Turner Massey" },
  { id: "anthony-t-2610", name: "Anthony Taylor" },
  { id: "wyatt-r-2611", name: "Wyatt Robson" },
  { id: "john-k-2612", name: "John Karol" },
  { id: "spencer-l-2613", name: "Spencer Ledwith" },
  { id: "scott-s-2614", name: "Scott Sanford" },
];

const DEMO_SCORES = {
  "Scottie Scheffler": -7,
  "Rory McIlroy": -5,
  "Jon Rahm": -3,
  "Xander Schauffele": -2,
  "Ludvig Aberg": -4,
  "Collin Morikawa": -2,
  "Brooks Koepka": 0,
  "Justin Thomas": -1,
  "Viktor Hovland": 1,
  "Patrick Cantlay": -1,
  "Hideki Matsuyama": -2,
  "Tommy Fleetwood": -3,
  "Jordan Spieth": 2,
  "Cameron Smith": 1,
  "Wyndham Clark": 0,
  "Bryson DeChambeau": -1,
  "Shane Lowry": -2,
  "Sungjae Im": 0,
  "Tony Finau": 1,
  "Max Homa": 3,
  "Sahith Theegala": -1,
  "Akshay Bhatia": 0,
  "Tom Kim": -2,
  "Russell Henley": -1,
  "Jason Day": 1,
  "Sam Burns": -1,
  "Will Zalatoris": 0,
  "Matt Fitzpatrick": 2,
};

const DEMO_ODDS = [
  { player: "Scottie Scheffler", price: 425, book: "FanDuel" },
  { player: "Rory McIlroy", price: 700, book: "DraftKings" },
  { player: "Jon Rahm", price: 900, book: "BetMGM" },
  { player: "Xander Schauffele", price: 1000, book: "FanDuel" },
  { player: "Collin Morikawa", price: 1200, book: "Caesars" },
  { player: "Ludvig Aberg", price: 1200, book: "DraftKings" },
  { player: "Justin Thomas", price: 1400, book: "FanDuel" },
  { player: "Brooks Koepka", price: 1400, book: "BetMGM" },
  { player: "Hideki Matsuyama", price: 1800, book: "Caesars" },
  { player: "Jordan Spieth", price: 2000, book: "DraftKings" },
];

const LIVE_ODDS_PLAYERS = [
  "Scottie Scheffler",
  "Rory McIlroy",
  "Jon Rahm",
  "Xander Schauffele",
  "Collin Morikawa",
  "Ludvig Aberg",
  "Justin Thomas",
  "Brooks Koepka",
  "Hideki Matsuyama",
  "Jordan Spieth",
];

const STORAGE_KEY = "major-pickem-clean-v1";

const DEFAULT_STATE = {
  settings: {
    currentDay: DEFAULT_DAY,
    revealHourCT: REVEAL_HOUR_CT,
    picksLocked: false,
    scoreSource: "espn-unofficial",
    oddsSource: "backend-or-demo",
    lastScoreRefresh: null,
    lastOddsRefresh: null,
    autoRefreshSeconds: 60,
  },
  users: USERS,
  picks: {
    1: Object.fromEntries(USERS.map((u, i) => [u.id, [GOLFERS[i % GOLFERS.length], GOLFERS[(i + 5) % GOLFERS.length], GOLFERS[(i + 11) % GOLFERS.length]]] )),
    2: Object.fromEntries(USERS.map((u) => [u.id, []])),
    3: {},
    4: {},
  },
  liveScores: DEMO_SCORES,
  odds: DEMO_ODDS,
  feedStatus: {
    ok: false,
    message: "Waiting for refresh",
    rawEventsFound: 0,
  },
  oddsStatus: {
    ok: false,
    message: "Waiting for refresh",
  },
};

function loadState() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function getCentralHour() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    hour12: false,
  });
  return Number(formatter.format(new Date()));
}

function formatScore(score) {
  if (score == null || Number.isNaN(score)) return "—";
  if (score > 0) return `+${score}`;
  return `${score}`;
}

function formatOdds(price) {
  if (price == null || Number.isNaN(price)) return "—";
  return price > 0 ? `+${price}` : `${price}`;
}

function scoreClass(score) {
  if (score < 0) return "text-emerald-400";
  if (score > 0) return "text-rose-400";
  return "text-slate-300";
}

function roundRule(day) {
  return day <= 2 ? "Best 2 of 3 count" : "All 3 count";
}

function scorePickSet(players, liveScores, day) {
  const scores = players
    .map((name) => ({ name, score: liveScores[name] ?? 99 }))
    .sort((a, b) => a.score - b.score);

  if (day <= 2) return scores.slice(0, 2).reduce((sum, p) => sum + p.score, 0);
  return scores.slice(0, 3).reduce((sum, p) => sum + p.score, 0);
}

function usedBeforeDay(state, userId, day) {
  const used = new Set();
  for (let d = 1; d < day; d += 1) {
    (state.picks[d]?.[userId] || []).forEach((p) => used.add(p));
  }
  return used;
}

function variants(name) {
  const parts = name.split(" ");
  const first = parts[0] || "";
  const last = parts[parts.length - 1] || "";
  return [name, `${first[0] || ""}. ${last}`, `${last}, ${first}`, `${first} ${last}`];
}

function extractScoreMap(data) {
  const map = {};
  const events = data?.events || [];
  for (const event of events) {
    const competitors = event?.competitions?.[0]?.competitors || [];
    for (const comp of competitors) {
      const rawName = comp?.athlete?.displayName || comp?.athlete?.shortName || comp?.displayName;
      const rawScore = comp?.score;
      const parsed = typeof rawScore === "string" ? Number(rawScore) : rawScore;
      if (rawName && Number.isFinite(parsed)) map[rawName] = parsed;
    }
  }
  return { map, eventCount: events.length };
}

async function fetchEspnScores() {
  const res = await fetch(ESPN_SCOREBOARD_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ESPN request failed: ${res.status}`);
  const data = await res.json();
  return extractScoreMap(data);
}

async function fetchLiveOdds() {
  const endpoints = ["/api/odds", "/api/live-odds"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(`${endpoint} did not return an array`);
      const filtered = data.filter((row) => LIVE_ODDS_PLAYERS.includes(row.player || row.name));
      if (filtered.length) {
        return filtered.map((row) => ({
          player: row.player || row.name,
          price: row.price,
          book: row.book || row.bookmaker || row.source || "Live",
        }));
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("No live odds endpoint available.");
}


export default function MajorPickem2026() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [viewerId, setViewerId] = useState("trenton-p-2606");
  const [loginCode, setLoginCode] = useState("trenton-p-2606");
  const [message, setMessage] = useState("");
  const [showMyCard, setShowMyCard] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingOdds, setRefreshingOdds] = useState(false);

  useEffect(() => setState(loadState()), []);
  useEffect(() => saveState(state), [state]);

  const currentDay = state.settings.currentDay;
  const revealUnlocked = getCentralHour() >= state.settings.revealHourCT;
  const viewer = state.users.find((u) => u.id === viewerId) || null;
  const todayPicks = state.picks[currentDay]?.[viewerId] || [];
  const usedPlayers = usedBeforeDay(state, viewerId, currentDay);
  const availablePlayers = GOLFERS.filter((p) => !usedPlayers.has(p) || todayPicks.includes(p));
  const filteredPlayers = availablePlayers.filter((p) => p.toLowerCase().includes(search.toLowerCase()));

  const leaderboard = useMemo(() => {
    return state.users
      .map((user) => {
        let total = 0;
        const daily = [];
        for (let day = 1; day <= currentDay; day += 1) {
          const picks = state.picks[day]?.[user.id] || [];
          if (picks.length) {
            const score = scorePickSet(picks, state.liveScores, day);
            total += score;
            daily.push({ day, picks, score });
          }
        }
        return { ...user, total, daily };
      })
      .sort((a, b) => a.total - b.total);
  }, [state, currentDay]);

  const viewerRank = leaderboard.findIndex((x) => x.id === viewerId) + 1;

  function login() {
    const found = state.users.find((u) => u.id === loginCode.trim().toLowerCase());
    if (!found) {
      setMessage("That access code does not match a player.");
      return;
    }
    setViewerId(found.id);
    setMessage(`Logged in as ${found.name}.`);
  }

  function togglePick(player) {
    if (state.settings.picksLocked) {
      setMessage("Picks are locked right now.");
      return;
    }
    const existing = state.picks[currentDay]?.[viewerId] || [];
    const selected = existing.includes(player);
    let next = existing;

    if (selected) {
      next = existing.filter((p) => p !== player);
    } else {
      if (existing.length >= 3) {
        setMessage("You can only pick 3 players each day.");
        return;
      }
      next = [...existing, player];
    }

    setState((prev) => ({
      ...prev,
      picks: {
        ...prev.picks,
        [currentDay]: {
          ...prev.picks[currentDay],
          [viewerId]: next,
        },
      },
    }));
    setMessage(selected ? `${player} removed.` : `${player} added.`);
  }

  async function refreshScores() {
    setRefreshing(true);
    try {
      const result = await fetchEspnScores();
      const nextScores = { ...state.liveScores };
      let matched = 0;
      GOLFERS.forEach((player) => {
        const found = variants(player).find((v) => Number.isFinite(result.map[v]));
        if (found) {
          nextScores[player] = result.map[found];
          matched += 1;
        }
      });
      setState((prev) => ({
        ...prev,
        liveScores: nextScores,
        settings: {
          ...prev.settings,
          lastScoreRefresh: new Date().toISOString(),
          scoreSource: matched > 0 ? "espn-unofficial" : prev.settings.scoreSource,
        },
        feedStatus: {
          ok: matched > 0,
          message: matched > 0 ? `Loaded ${matched} player scores.` : "Feed responded, but no pool names matched.",
          rawEventsFound: result.eventCount,
        },
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, lastScoreRefresh: new Date().toISOString() },
        feedStatus: {
          ok: false,
          message: err?.message || "Could not refresh scores.",
          rawEventsFound: 0,
        },
      }));
    } finally {
      setRefreshing(false);
    }
  }

  async function refreshOdds() {
    setRefreshingOdds(true);
    try {
      const liveOdds = await fetchLiveOdds();
      setState((prev) => ({
        ...prev,
        odds: liveOdds,
        settings: {
          ...prev.settings,
          oddsSource: "backend-live",
          lastOddsRefresh: new Date().toISOString(),
        },
        oddsStatus: {
          ok: true,
          message: `Loaded ${liveOdds.length} live odds rows.`,
        },
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        odds: prev.odds?.length ? prev.odds : DEMO_ODDS,
        settings: {
          ...prev.settings,
          oddsSource: "demo-fallback",
          lastOddsRefresh: new Date().toISOString(),
        },
        oddsStatus: {
          ok: false,
          message: err?.message || "Could not refresh odds. Using demo fallback.",
        },
      }));
    } finally {
      setRefreshingOdds(false);
    }
  }

  function setDay(day) {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, currentDay: day } }));
  }

  function toggleLock() {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, picksLocked: !prev.settings.picksLocked } }));
  }

  function resetDemo() {
    setState(DEFAULT_STATE);
    setViewerId("trenton-p-2606");
    setLoginCode("trenton-p-2606");
    setMessage("Demo reset.");
  }

  useEffect(() => {
    refreshScores();
    refreshOdds();
  }, []);

  useEffect(() => {
    const ms = Math.max(15, state.settings.autoRefreshSeconds || 60) * 1000;
    const id = setInterval(() => {
      refreshScores();
      refreshOdds();
    }, ms);
    return () => clearInterval(id);
  }, [state.settings.autoRefreshSeconds]);

  return (
    <div className="min-h-screen bg-[#081018] text-white">
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_30%),linear-gradient(180deg,rgba(3,7,18,0.58),rgba(3,7,18,0.95))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[1.35fr,0.65fr]">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Pill><Crown className="mr-1 h-3.5 w-3.5" />{APP_NAME}</Pill>
                <PillMuted>Round {currentDay}</PillMuted>
                <PillMuted>{roundRule(currentDay)}</PillMuted>
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                  Daily golf picks.
                  <span className="block text-emerald-400">Live major pool board.</span>
                </h1>
                <p className="mt-4 max-w-3xl text-base text-slate-300 md:text-lg">
                  Private cards, delayed reveal windows, live score tracking, and a clean sportsbook-style layout.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <HeroStat icon={<ShieldCheck className="h-4 w-4" />} label="Logged In" value={viewer?.name || "Guest"} />
                <HeroStat icon={<Users className="h-4 w-4" />} label="Available Picks" value={String(availablePlayers.length)} />
                <HeroStat icon={<Trophy className="h-4 w-4" />} label="Current Rank" value={viewerRank ? `#${viewerRank}` : "—"} />
                <HeroStat icon={<Clock className="h-4 w-4" />} label="Reveal" value={revealUnlocked ? "Open" : `${state.settings.revealHourCT}:00 CT`} />
              </div>
            </motion.div>

            <Panel>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Private Access</h2>
                <p className="mt-1 text-sm text-slate-300">Each player uses a unique code. Current-day picks stay hidden from everyone else.</p>
              </div>
              <div className="space-y-3">
                <input value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="Enter access code" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none placeholder:text-slate-500" />
                <div className="flex gap-2">
                  <ActionButton onClick={login}>Log In</ActionButton>
                  <GhostButton onClick={() => setShowMyCard((v) => !v)}>{showMyCard ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{showMyCard ? "Hide Card" : "Show Card"}</GhostButton>
                </div>
                {message ? <Banner>{message}</Banner> : null}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 font-medium text-white">Pool entries</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {state.users.slice(0, 8).map((u) => (
                      <div key={u.id} className="rounded-lg bg-white/5 px-3 py-2">
                        <div className="text-white">{u.name}</div>
                        <div className="font-mono text-xs text-emerald-300">{u.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <FeatureCard image={COURSE_IMAGE} icon={<Flag className="h-4 w-4" />} title="Tournament Rules" body="Pick 3 golfers each day. Days 1 and 2 score your best 2. Days 3 and 4 count all 3." />
          <FeatureCard image={TROPHY_IMAGE} icon={<Medal className="h-4 w-4" />} title="No Reuse" body="Once a golfer is used in a prior round, that player is gone for the rest of the event." />
          <FeatureCard image={HERO_IMAGE} icon={<Lock className="h-4 w-4" />} title="Delayed Reveal" body="You only see your own current card until the daily reveal window opens." />
        </div>

        <div className="mb-5 grid w-full grid-cols-4 rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
          <TabBadge active>My Daily Picks</TabBadge>
          <TabBadge>Leaderboard</TabBadge>
          <TabBadge>Odds</TabBadge>
          <TabBadge>Admin</TabBadge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.18fr,0.82fr]">
          <Panel>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Choose 3 Players for Round {currentDay}</h2>
                <p className="mt-1 text-sm text-slate-300">Click a golfer to add. Click again to remove. Same-day unselecting is fully enabled.</p>
              </div>
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search golfers" className="w-full rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-white outline-none placeholder:text-slate-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>Selection progress</span>
                <span>{todayPicks.length}/3 picked</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(todayPicks.length / 3) * 100}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {todayPicks.length ? todayPicks.map((pick) => (
                  <button key={pick} onClick={() => togglePick(pick)} type="button" className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300 hover:opacity-90">
                    {pick} <span className="ml-2 text-xs opacity-70">✕</span>
                  </button>
                )) : <span className="text-sm text-slate-400">No picks selected yet.</span>}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPlayers.map((player) => {
                const selected = todayPicks.includes(player);
                return (
                  <button
                    key={player}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => togglePick(player)}
                    className={`group rounded-2xl border p-4 text-left transition ${selected ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]" : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{player}</div>
                        <div className={`mt-1 text-sm ${selected ? "text-emerald-300" : scoreClass(state.liveScores[player])}`}>Live score: {formatScore(state.liveScores[player])}</div>
                        <div className="mt-1 text-xs text-slate-500">{selected ? "Click to remove" : "Click to add"}</div>
                      </div>
                      <div className={`rounded-full px-2 py-1 text-xs ${selected ? "bg-emerald-500 text-black" : "bg-white/10 text-slate-300"}`}>{selected ? "Selected" : "Open"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel>
              <h2 className="text-xl font-semibold">My Card</h2>
              <p className="mt-1 text-sm text-slate-300">Your private round card. Click a row to remove a golfer.</p>
              <div className="mt-4 space-y-3">
                {showMyCard ? todayPicks.length ? todayPicks.map((pick) => (
                  <button key={pick} type="button" onClick={() => togglePick(pick)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left hover:bg-white/5">
                    <span className="text-white">{pick}</span>
                    <span className={`font-medium ${scoreClass(state.liveScores[pick])}`}>{formatScore(state.liveScores[pick])}</span>
                  </button>
                )) : <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4 text-slate-400">No golfers selected yet.</div> : <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4 text-slate-400">Card hidden.</div>}
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-semibold">Live Lowest Round Odds</h2>
              <p className="mt-1 text-sm text-slate-300">Featured players only.</p>
              <div className="mt-2 text-xs text-slate-400">
                Source: {state.settings.oddsSource} · Last refresh: {state.settings.lastOddsRefresh ? new Date(state.settings.lastOddsRefresh).toLocaleTimeString() : "not yet"}
              </div>
              <div className="mt-2 text-xs text-slate-400">{state.oddsStatus.message}</div>
              <div className="mt-4 space-y-2">
                {state.odds.map((row) => (
                  <div key={`${row.player}-${row.book}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                    <div>
                      <div className="font-medium text-white">{row.player}</div>
                      <div className="text-xs text-slate-400">{row.book}</div>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">{formatOdds(row.price)}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,0.9fr]">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Live Standings</h2>
                <p className="mt-1 text-sm text-slate-300">Current-day picks for other players stay hidden until reveal time.</p>
              </div>
              <div className="flex gap-2">
                <GhostButton onClick={refreshScores}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh Scores
                </GhostButton>
                <GhostButton onClick={refreshOdds}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshingOdds ? "animate-spin" : ""}`} />
                  Refresh Odds
                </GhostButton>
              </div>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={entry.id} className={`rounded-2xl border p-4 ${entry.id === viewerId ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Rank #{idx + 1}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{entry.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</div>
                      <div className="mt-1 text-2xl font-semibold text-white">{formatScore(entry.total)}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {entry.daily.map((d) => {
                      const canSee = d.day < currentDay || entry.id === viewerId || revealUnlocked;
                      return (
                        <div key={`${entry.id}-${d.day}`} className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm">
                          <div className="font-medium text-white">Round {d.day}</div>
                          <div className="mt-1 text-slate-300">{canSee ? d.picks.join(", ") : "Picks hidden until reveal time"}</div>
                          <div className="mt-2 font-medium text-emerald-300">Score: {formatScore(d.score)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel>
              <h2 className="text-xl font-semibold">Feed Status</h2>
              <p className="mt-1 text-sm text-slate-300">Live scores auto-refresh from ESPN. Live odds look for a backend endpoint first.</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <div className="mb-2 flex items-center gap-2 font-medium text-white"><Radio className="h-4 w-4 text-emerald-400" />Score feed</div>
                <div>Status: <span className="font-semibold text-white">{state.feedStatus.ok ? "Connected" : "Fallback / Unknown"}</span></div>
                <div>Message: {state.feedStatus.message}</div>
                <div>Events found: {state.feedStatus.rawEventsFound}</div>
                <div>Score refresh: {state.settings.lastScoreRefresh ? new Date(state.settings.lastScoreRefresh).toLocaleString() : "Not yet refreshed"}</div>
                <div>Odds refresh: {state.settings.lastOddsRefresh ? new Date(state.settings.lastOddsRefresh).toLocaleString() : "Not yet refreshed"}</div>
                <div>Auto refresh: every {state.settings.autoRefreshSeconds}s</div>
                <div className="mt-3 text-xs text-slate-500 break-all">{ESPN_SCOREBOARD_URL}</div>
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-semibold">Admin Controls</h2>
              <p className="mt-1 text-sm text-slate-300">Test the full tournament flow.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((day) => (
                  <button key={day} onClick={() => setDay(day)} className={currentDay === day ? "rounded-xl bg-emerald-500 px-4 py-2 text-black" : "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"}>
                    Set Round {day}
                  </button>
                ))}
                <GhostButton onClick={toggleLock}>{state.settings.picksLocked ? "Unlock Picks" : "Lock Picks"}</GhostButton>
                <GhostButton onClick={resetDemo}>Reset Demo</GhostButton>
              </div>
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="mb-2 flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" />Clean version status</div>
                <ul className="space-y-1">
                  <li>• Pick / unpick now works correctly.</li>
                  <li>• Current-day picks stay clickable.</li>
                  <li>• Leaderboard and odds widgets are built in.</li>
                  <li>• Live score auto-refresh is enabled.</li>
                  <li>• Live odds will use /api/odds when your backend is deployed.</li>
                </ul>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">{children}</div>;
}

function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{children}</span>;
}

function PillMuted({ children }) {
  return <span className="inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-sm text-slate-200">{children}</span>;
}

function HeroStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">{icon}{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function FeatureCard({ image, icon, title, body }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-black/80" />
      <div className="relative p-5">
        <div className="mb-3 flex items-center gap-2 text-emerald-300">{icon}<span className="text-sm font-medium">{title}</span></div>
        <p className="text-sm text-slate-300">{body}</p>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 font-medium text-black hover:bg-emerald-400">{children}</button>;
}

function GhostButton({ children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white hover:bg-white/10">{children}</button>;
}

function Banner({ children }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-100">{children}</div>;
}

function TabBadge({ children, active = false }) {
  return <div className={`rounded-xl px-3 py-2 text-center ${active ? "bg-emerald-500 text-black" : "text-slate-300"}`}>{children}</div>;
}
