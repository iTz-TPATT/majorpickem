"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, RefreshCw } from "lucide-react";

const GOLFERS = [
  "Scottie Scheffler","Rory McIlroy","Jon Rahm","Xander Schauffele",
  "Ludvig Aberg","Collin Morikawa","Brooks Koepka","Justin Thomas",
  "Viktor Hovland","Patrick Cantlay","Hideki Matsuyama","Tommy Fleetwood",
  "Jordan Spieth","Cameron Smith","Wyndham Clark","Bryson DeChambeau"
];

const USERS = [
  { id: "trenton-p-2606", name: "Trenton Patterson" },
  { id: "adam-g", name: "Adam Gourley" },
  { id: "will-r", name: "Will Robson" }
];

const DEMO_SCORES: Record<string, number> = {
  "Scottie Scheffler": -7,
  "Rory McIlroy": -5,
  "Jon Rahm": -3,
  "Xander Schauffele": -2
};

export default function Page() {
  const [viewerId, setViewerId] = useState("trenton-p-2606");
  const [picks, setPicks] = useState<string[]>([]);
  const [scores, setScores] = useState(DEMO_SCORES);

  function togglePick(player: string) {
    if (picks.includes(player)) {
      setPicks(picks.filter(p => p !== player));
    } else {
      if (picks.length >= 3) return;
      setPicks([...picks, player]);
    }
  }

  const leaderboard = useMemo(() => {
    return USERS.map(u => ({
      ...u,
      score: (picks || []).reduce((sum, p) => sum + (scores[p] || 0), 0)
    })).sort((a, b) => a.score - b.score);
  }, [picks, scores]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#081018", minHeight: "100vh", color: "white" }}>
      
      <h1>🏌️ Major Pick'em 2026</h1>

      <h2>My Picks</h2>
      <div style={{ marginBottom: 20 }}>
        {picks.map(p => (
          <button key={p} onClick={() => togglePick(p)} style={{ margin: 5 }}>
            {p} ❌
          </button>
        ))}
      </div>

      <h2>Select Players</h2>
      <div>
        {GOLFERS.map(player => (
          <button
            key={player}
            onClick={() => togglePick(player)}
            style={{
              margin: 5,
              background: picks.includes(player) ? "green" : "#333",
              color: "white"
            }}
          >
            {player}
          </button>
        ))}
      </div>

      <h2>Leaderboard</h2>
      {leaderboard.map((u, i) => (
        <div key={u.id}>
          #{i + 1} {u.name} — {u.score}
        </div>
      ))}

    </div>
  );
}
