"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Gift,
  Settings,
  LogOut,
  Camera,
  FileText,
  ChevronRight,
  Target,
  Clock,
  Flame,
  AlertCircle,
  Plus,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Worksheet, DashboardSummary, MasteryDataPoint } from "@/types";
import { ChildSelector } from "@/components/parent/ChildSelector";
import { StatCard } from "@/components/parent/StatCard";
import { ActivityHeatmap } from "@/components/parent/ActivityHeatmap";

const menuItems = [
  {
    label: "Content Creator",
    icon: BookOpen,
    href: "/parent/content",
    color: "bg-indigo-100 text-indigo-600",
    description: "Create flashcards and quizzes",
  },
  {
    label: "AI Generator",
    icon: Sparkles,
    href: "/parent/ai-generator",
    color: "bg-purple-100 text-purple-600",
    description: "Generate content with AI",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/parent/analytics",
    color: "bg-green-100 text-green-600",
    description: "Track learning progress",
  },
  {
    label: "Rewards",
    icon: Gift,
    href: "/parent/rewards",
    color: "bg-amber-100 text-amber-600",
    description: "Manage reward shop",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/parent/settings",
    color: "bg-gray-100 text-gray-600",
    description: "Account settings",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  processing: "bg-purple-100 text-purple-600",
  extracted: "bg-amber-100 text-amber-600",
  approved: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout, childProfiles, selectChildProfile } = useAuthStore();

  const defaultChildId = useMemo(() => {
    if (childProfiles.length === 0) return "";
    const saved = typeof window !== "undefined" ? localStorage.getItem("child_profile_id") : null;
    const found = childProfiles.find((p) => p.id === saved);
    const defaultProfile = found || childProfiles[0];
    // Ensure localStorage is set for apiClient header
    if (!found && defaultProfile && typeof window !== "undefined") {
      localStorage.setItem("child_profile_id", defaultProfile.id);
    }
    return defaultProfile.id;
  }, [childProfiles]);

  const [selectedChildId, setSelectedChildId] = useState<string>("");

  // Use user-selected child or fall back to default
  const resolvedChildId = selectedChildId || defaultChildId;

  const handleChildSelect = (id: string) => {
    setSelectedChildId(id);
    const profile = childProfiles.find((p) => p.id === id);
    if (profile) {
      selectChildProfile(profile);
    }
  };

  const selectedChild = childProfiles.find((p) => p.id === resolvedChildId);

  const { data: summary } = useQuery({
    queryKey: ["dashboard_summary", resolvedChildId],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/dashboard_summary");
      return data as DashboardSummary;
    },
    enabled: !!resolvedChildId,
  });

  const { data: mastery } = useQuery({
    queryKey: ["mastery_progress", resolvedChildId],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/mastery_progress");
      return data as MasteryDataPoint[];
    },
    enabled: !!resolvedChildId,
  });

  const { data: performance } = useQuery({
    queryKey: ["analytics", "performance", resolvedChildId],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/performance?days=7");
      return data as { date: string; score: number; time: number }[];
    },
    enabled: !!resolvedChildId,
  });

  const { data: worksheets } = useQuery({
    queryKey: ["worksheets"],
    queryFn: async () => {
      const { data } = await apiClient.get("/worksheets");
      return (
        (data.data?.map(
          (w: { id: string; attributes: Omit<Worksheet, "id"> }) => ({
            ...w.attributes,
            id: w.id,
          })
        ) as Worksheet[]) || []
      );
    },
  });

  const recentWorksheets = worksheets?.slice(0, 5) || [];
  const cardsDue = mastery?.find((m) => m.category === "New")?.count || 0;

  const stats = [
    {
      label: "Accuracy",
      value: `${summary?.accuracy ?? 0}%`,
      change:
        summary && summary.accuracy_change !== 0
          ? `${summary.accuracy_change > 0 ? "+" : ""}${summary.accuracy_change}%`
          : undefined,
      trend:
        summary && summary.accuracy_change > 0
          ? ("up" as const)
          : summary && summary.accuracy_change < 0
            ? ("down" as const)
            : undefined,
      icon: Target,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Time Today",
      value: `${summary?.daily_avg_minutes ?? 0} min`,
      icon: Clock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Cards Due",
      value: `${cardsDue}`,
      icon: BarChart3,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      label: "Streak",
      value: `${summary?.streak_days ?? 0} days`,
      change:
        summary && summary.streak_days > 0
          ? summary.streak_days === summary.streak_longest
            ? "Record!"
            : `${summary.streak_days}d`
          : undefined,
      trend:
        summary && summary.streak_days > 0 ? ("up" as const) : undefined,
      icon: Flame,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Parent Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {childProfiles.length > 0 && (
                <ChildSelector
                  profiles={childProfiles}
                  selectedId={resolvedChildId}
                  onSelect={handleChildSelect}
                />
              )}
              <button
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Upload Worksheet CTA */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push("/parent/worksheets/upload")}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition text-left flex items-center gap-4 mb-6"
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Camera size={28} />
          </div>
          <div className="flex-1">
            <h3
              className="font-bold text-lg"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Upload Worksheet
            </h3>
            <p className="text-sm text-white/80 mt-0.5">
              Snap a photo and AI creates practice exercises
            </p>
          </div>
          <ChevronRight size={20} className="text-white/60" />
        </motion.button>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
              value={stat.value}
              label={stat.label}
              change={stat.change}
              trend={stat.trend}
              index={index}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Heatmap */}
            <ActivityHeatmap
              performanceData={performance}
              streakDays={summary?.streak_days}
            />

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Activity
                </h2>
                <button
                  onClick={() => router.push("/parent/analytics")}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </button>
              </div>

              {summary?.recent_activity && summary.recent_activity.length > 0 ? (
                <div className="space-y-3">
                  {summary.recent_activity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: activity.subject_color }}
                      >
                        <span className="text-white font-bold">
                          {activity.subject_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {activity.lesson_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.subject_name} &bull;{" "}
                          {formatTimeAgo(activity.completed_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {activity.score}%
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">
                  No recent activity for {selectedChild?.name || "this child"}
                </p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <button
                onClick={() => router.push("/parent/content")}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left"
              >
                <Plus className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Create Content</h3>
                <p className="text-sm text-white/80">
                  Add flashcards or quizzes
                </p>
              </button>

              <button
                onClick={() => router.push("/parent/ai-generator")}
                className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left"
              >
                <Sparkles className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">AI Generator</h3>
                <p className="text-sm text-white/80">Generate with AI</p>
              </button>
            </motion.div>

            {/* Recent Worksheets */}
            {recentWorksheets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800">
                    Recent Worksheets
                  </h2>
                  <button
                    onClick={() => router.push("/parent/worksheets")}
                    className="text-sm text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    View all
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentWorksheets.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        if (ws.status === "extracted" || ws.status === "approved") {
                          router.push(`/parent/worksheets/${ws.id}/review`);
                        } else if (
                          ws.status === "pending" ||
                          ws.status === "processing" ||
                          ws.status === "failed"
                        ) {
                          router.push(`/parent/worksheets/${ws.id}/processing`);
                        }
                      }}
                      className="flex-shrink-0 w-44 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-left border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-purple-500" />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[ws.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {ws.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {ws.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {ws.questions_count} questions
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Menu grid (mobile) */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition text-left border border-gray-100"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.color}`}
                  >
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-800">
                  Notifications
                </h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {selectedChild?.name || "Your child"} completed a new lesson
                  </p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Weekly progress report is ready
                  </p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Quick Links
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/parent/analytics")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  View Analytics
                </button>
                <button
                  onClick={() => router.push("/parent/rewards")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Gift className="w-4 h-4 text-amber-500" />
                  Manage Rewards
                </button>
                <button
                  onClick={() => router.push("/parent/settings")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </button>
              </div>
            </motion.div>

            {/* Desktop Menu Grid */}
            <div className="hidden lg:block space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-left border border-gray-100 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}
                  >
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
