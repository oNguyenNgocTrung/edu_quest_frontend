"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ArrowLeft, Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  total_xp: number;
  level: number;
  rank: number;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const { data: entries } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/leaderboard");
      return data as LeaderboardEntry[];
    },
  });

  const medalColors = ["text-amber-400", "text-gray-400", "text-orange-400"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={24} />
          Family Leaderboard
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        {entries?.map((entry, index) => (
          <div
            key={entry.id}
            className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 ${
              index === 0 ? "ring-2 ring-amber-400" : ""
            }`}
          >
            <div className="w-10 text-center">
              {index < 3 ? (
                <Medal size={24} className={medalColors[index]} />
              ) : (
                <span className="text-gray-400 font-bold">#{index + 1}</span>
              )}
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
              {entry.avatar === "fox"
                ? "🦊"
                : entry.avatar === "owl"
                ? "🦉"
                : "👤"}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{entry.name}</h3>
              <p className="text-sm text-gray-500">Level {entry.level}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">{entry.total_xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
