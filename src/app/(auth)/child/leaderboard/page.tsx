"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Trophy, Medal, Crown } from "lucide-react";
import { BottomNav } from "@/components/child/BottomNav";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  total_xp: number;
  level: number;
  rank: number;
}

const avatarMap: Record<string, string> = {
  fox: "🦊",
  owl: "🦉",
  panda: "🐼",
  lion: "🦁",
  rabbit: "🐰",
  frog: "🐸",
};

function getRankColor(rank: number) {
  switch (rank) {
    case 1:
      return "from-yellow-400 to-orange-500";
    case 2:
      return "from-gray-300 to-gray-400";
    case 3:
      return "from-orange-400 to-yellow-600";
    default:
      return "from-purple-400 to-pink-500";
  }
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();
  const [timeframe, setTimeframe] = useState<"week" | "alltime">("week");

  const { data: entries } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/leaderboard");
      return data as LeaderboardEntry[];
    },
  });

  const topThree = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];
  const currentUserId = currentChildProfile?.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-black text-gray-800">Leaderboard</h1>
          </div>

          {/* Time Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe("week")}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                timeframe === "week"
                  ? "bg-white text-purple-600 shadow-md"
                  : "text-gray-600"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe("alltime")}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                timeframe === "alltime"
                  ? "bg-white text-purple-600 shadow-md"
                  : "text-gray-600"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  {avatarMap[topThree[1].avatar] ?? "👤"}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xs">2</span>
                </div>
              </div>
              <p className="font-bold text-gray-800 text-sm">{topThree[1].name}</p>
              <p className="text-xs text-gray-500">{topThree[1].total_xp} XP</p>
              <div className="w-20 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl mt-2 flex items-center justify-center">
                <Medal className="w-8 h-8 text-gray-500" />
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mb-2"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl shadow-xl">
                  {avatarMap[topThree[0].avatar] ?? "👤"}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <p className="font-black text-gray-800">{topThree[0].name}</p>
              <p className="text-sm text-gray-600">{topThree[0].total_xp} XP</p>
              <div className="w-24 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-t-2xl mt-2 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  {avatarMap[topThree[2].avatar] ?? "👤"}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-orange-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xs">3</span>
                </div>
              </div>
              <p className="font-bold text-gray-800 text-sm">{topThree[2].name}</p>
              <p className="text-xs text-gray-500">{topThree[2].total_xp} XP</p>
              <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-t-2xl mt-2 flex items-center justify-center">
                <Medal className="w-8 h-8 text-orange-600" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Rest of Rankings */}
        <div className="space-y-3">
          {rest.map((player, index) => {
            const isCurrentUser = player.id === currentUserId;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 ${
                  isCurrentUser ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(player.rank)} flex items-center justify-center text-white font-black`}
                >
                  {player.rank}
                </div>

                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {avatarMap[player.avatar] ?? "👤"}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-gray-800">
                    {player.name}{" "}
                    {isCurrentUser && (
                      <span className="text-purple-500">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{player.total_xp} XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Motivation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white"
        >
          <Trophy className="w-10 h-10 mb-3" />
          <h3 className="text-lg font-black mb-2">Keep Climbing!</h3>
          <p className="text-white/90 text-sm">
            Complete more lessons to climb the rankings!
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
