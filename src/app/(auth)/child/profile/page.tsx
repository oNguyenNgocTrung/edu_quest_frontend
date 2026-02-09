"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Star, Coins, Flame, Award, Settings } from "lucide-react";

export default function ChildProfilePage() {
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();

  if (!currentChildProfile) {
    router.push("/child/home");
    return null;
  }

  const profile = currentChildProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-8 text-white text-center">
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 text-white/80 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-4xl">
          {profile.avatar === "fox"
            ? "🦊"
            : profile.avatar === "owl"
            ? "🦉"
            : "👤"}
        </div>
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-white/80">Level {profile.level} Explorer</p>
      </div>

      <div className="max-w-lg mx-auto p-4 -mt-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <Star className="text-indigo-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">
              {profile.total_xp}
            </p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <Coins className="text-amber-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">{profile.coins}</p>
            <p className="text-xs text-gray-500">Coins</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <Flame className="text-orange-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <Award className="text-green-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">
              {profile.level}
            </p>
            <p className="text-xs text-gray-500">Level</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Level Progress</span>
            <span className="text-indigo-600 font-medium">
              {profile.xp_for_next_level} XP to Level {profile.level + 1}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  ((profile.total_xp % 100) / 100) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/child/rewards")}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <Coins className="text-amber-500" size={20} />
            <span className="font-medium text-gray-800">Reward Shop</span>
          </button>
          <button
            onClick={() => router.push("/child/leaderboard")}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <Award className="text-purple-500" size={20} />
            <span className="font-medium text-gray-800">Leaderboard</span>
          </button>
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <Settings className="text-gray-500" size={20} />
            <span className="font-medium text-gray-800">Parent Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
