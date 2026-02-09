"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Gift,
  Settings,
  Users,
  LogOut,
} from "lucide-react";

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
    label: "Child Profiles",
    icon: Users,
    href: "/child/home",
    color: "bg-blue-100 text-blue-600",
    description: "Switch to child view",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/parent/settings",
    color: "bg-gray-100 text-gray-600",
    description: "Account settings",
  },
];

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout, childProfiles } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Parent Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
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

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {childProfiles.length}
            </p>
            <p className="text-xs text-gray-500">Profiles</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">
              {childProfiles.reduce((sum, p) => sum + p.total_xp, 0)}
            </p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-600">
              {childProfiles.reduce((sum, p) => sum + p.coins, 0)}
            </p>
            <p className="text-xs text-gray-500">Total Coins</p>
          </div>
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition text-left"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.color}`}
              >
                <item.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-800">{item.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
