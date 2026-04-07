"use client";

import React, { useMemo, useState } from "react";

const GOLFERS = [
  "Scottie Scheffler",
  "Rory McIlroy",
  "Jon Rahm",
  "Xander Schauffele",
  "Ludvig Aberg",
  "Collin Morikawa",
  "Brooks Koepka",
  "Justin Thomas"
];

const USERS = [
  { id: "trenton-p-2606", name: "Trenton Patterson" },
  { id: "adam-g-2601", name: "Adam Gourley" },
  { id: "will-r-2602", name: "Will Robson" }
];

const SCORES: Record<string, number> = {
  "Scottie Scheffler": -7,
  "Rory McIlroy": -5,
  "Jon Rahm": -3,
  "Xander Schauffele": -2,
  "Ludvig Aberg": -4,
  "Collin Morikawa": -2,
  "Brooks Koepka": 0,
  "Justin Thomas": -1
};

export default function Page() {
  const [picks, setPicks] = useState<string[]>([]);

  function togglePick(player: string) {
    if (picks.includes(player)) {
      setPicks(picks.filter((p) => p !== player));
      return;
    }
    if (picks.length >= 3) return;
    setPicks([...picks, player]);
  }

  const leaderboard = useMemo(() => {
    return USERS.map((u) => ({
      ...u,
      score: picks.reduce((sum, p) => sum + (SCORES[p] ?? 0), 0)
    })).sort((a, b) => a.score - b.score);
  }, [picks]);

  return (
    <div style={{ minHeight: "100vh", background: "#081018", color: "white", padding: 24 }}>
      <h1>Major Pick&apos;em 2026</h1>

      <h2>My Picks ({picks.length}/3)</h2>
      <div style={{ marginBottom: 20 }}>
        {picks.map((p) => (
          <button
            key={p}
            onClick={() => togglePick(p)}
            style={{ marginRight: 8, marginBottom: 8 }}
          >
            {p} ✕
          </button>
        ))}
      </div>

      <h2>Select Golfers</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 600 }}>
        {GOLFERS.map((player) => (
          <button
            key={player}
            onClick={() => togglePick(player)}
            style={{
              padding: 10,
              textAlign: "left",
              background: picks.includes(player) ? "green" : "#1f2937",
              color: "white",
              border: "none",
              borderRadius: 8
            }}
          >
            {player} ({SCORES[player] ?? 0})
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: 30 }}>Leaderboard</h2>
      {leaderboard.map((u, i) => (
        <div key={u.id}>
          #{i + 1} {u.name} — {u.score}
        </div>
      ))}
    </div>
  );
}
