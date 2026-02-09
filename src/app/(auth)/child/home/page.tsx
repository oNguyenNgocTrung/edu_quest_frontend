"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import type { Subject } from "@/types";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  Landmark,
  Atom,
  Music,
  Palette,
  Flame,
  Star,
  Coins,
  Trophy,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  calculator: Calculator,
  flask: FlaskConical,
  "book-open": BookOpen,
  globe: Globe,
  landmark: Landmark,
  atom: Atom,
  music: Music,
  palette: Palette,
};

export default function ChildHomePage() {
  const {
    currentChildProfile,
    childProfiles,
    selectChildProfile,
    clearChildProfile,
    fetchChildProfiles,
    logout,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchChildProfiles();
  }, [fetchChildProfiles]);

  const { data: subjects } = useQuery({
    queryKey: ["subjects", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/subjects");
      return data.data.map(
        (item: { attributes: Subject }) => item.attributes
      ) as Subject[];
    },
    enabled: !!currentChildProfile,
  });

  // Profile selector if no child profile selected
  if (!currentChildProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Who&apos;s learning today?
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Select a profile to get started
          </p>

          <div className="grid grid-cols-2 gap-4">
            {childProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => selectChildProfile(profile)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  {profile.avatar === "fox"
                    ? "🦊"
                    : profile.avatar === "owl"
                    ? "🦉"
                    : "👤"}
                </div>
                <h3 className="font-semibold text-gray-800">{profile.name}</h3>
                <p className="text-sm text-gray-500">Level {profile.level}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => logout()}
            className="mt-8 w-full py-3 text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const profile = currentChildProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={clearChildProfile}
              className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg"
            >
              {profile.avatar === "fox" ? "🦊" : profile.avatar === "owl" ? "🦉" : "👤"}
            </button>
            <div>
              <h2 className="font-semibold text-gray-800">{profile.name}</h2>
              <p className="text-xs text-gray-500">Level {profile.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Flame size={18} />
              <span className="text-sm font-semibold">12</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Coins size={18} />
              <span className="text-sm font-semibold">{profile.coins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* XP Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="text-indigo-500" size={20} />
              <span className="font-semibold text-gray-800">
                {profile.total_xp} XP
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {profile.xp_for_next_level} XP to next level
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((profile.total_xp % 100) / 100) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Daily Quest */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Daily Quest</h3>
              <p className="text-sm opacity-90">Complete 3 lessons today</p>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={20} />
              <span className="font-bold">2/3</span>
            </div>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-3">
            <div className="bg-white h-2 rounded-full w-2/3 transition-all" />
          </div>
        </div>

        {/* Subjects */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Your Subjects</h3>
          <div className="grid grid-cols-2 gap-3">
            {subjects?.map((subject) => {
              const Icon = iconMap[subject.icon_name] || BookOpen;
              return (
                <button
                  key={subject.id}
                  onClick={() => router.push(`/child/learn/${subject.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${subject.display_color}20` }}
                  >
                    <Icon
                      size={24}
                      style={{ color: subject.display_color }}
                    />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {subject.name}
                  </h4>
                  {subject.enrollment && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${subject.enrollment.mastery_level}%`,
                            backgroundColor: subject.display_color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {subject.enrollment.mastery_level}% mastery
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
