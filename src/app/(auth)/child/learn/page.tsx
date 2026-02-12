"use client";

import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import type { Subject, TodayPracticeResponse } from "@/types";
import {
  Star,
  Trophy,
  Search,
  Home,
  BookOpen,
  Gift,
  Award,
  User,
  Flame,
  Coins,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Mascot } from "@/components/Mascot";
import { BottomNav } from "@/components/child/BottomNav";
import { SubjectBrowserCard } from "@/components/child/SubjectBrowserCard";
import { WorksheetCollections } from "@/components/child/WorksheetCollections";

const sidebarNavItems = [
  { path: "/child/home", icon: Home, label: "Home" },
  { path: "/child/learn", icon: BookOpen, label: "Learn" },
  { path: "/child/rewards", icon: Gift, label: "Rewards" },
  { path: "/child/leaderboard", icon: Award, label: "Ranks" },
  { path: "/child/profile", icon: User, label: "Profile" },
];

export default function LearnBrowserPage() {
  const { t } = useTranslation('child');
  const { currentChildProfile } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/subjects");
      return data.data.map(
        (item: { attributes: Subject }) => item.attributes
      ) as Subject[];
    },
    enabled: !!currentChildProfile,
  });

  const { data: practiceData } = useQuery({
    queryKey: ["today_practice", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/today_practice");
      return data as TodayPracticeResponse;
    },
    enabled: !!currentChildProfile,
  });

  if (!currentChildProfile) return null;

  const profile = currentChildProfile;

  // Calculate totals from subjects
  const totalXP = subjects?.reduce(
    (sum, s) => sum + (s.enrollment?.total_xp ?? 0),
    0
  ) ?? 0;
  const totalStars = subjects?.reduce(
    (sum, s) => sum + (s.enrollment?.completed_nodes_count ?? 0) * 3,
    0
  ) ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 pb-24 lg:pb-0">
      {/* ═══ DESKTOP HEADER ═══ */}
      <div className="hidden lg:block bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black text-gray-800">LearnNest</span>
          </div>

          <div className="hidden xl:block flex-1 max-w-xs mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('learn.searchSubjects')}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full cursor-pointer hover:shadow-md transition-all"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-700">
                {profile.level} lvl
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/child/rewards")}
              className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full cursor-pointer hover:shadow-md transition-all"
            >
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-700">{profile.coins}</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/child/profile")}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <span className="text-lg">👧</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-60 bg-white/80 backdrop-blur-sm border-r border-gray-200 z-10">
        <div className="p-4 flex flex-col h-full">
          {/* Stats Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Mascot mood="excited" size="md" showSpeechBubble={false} />
              <div>
                <p className="font-bold text-gray-800">{t('home.yourProgress')}</p>
                <p className="text-xs text-gray-600">{t('home.keepItUp')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t('home.totalXp')}</p>
                <p className="text-lg font-bold text-gray-800">{totalXP}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Trophy className="w-5 h-5 text-purple-500 fill-purple-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t('home.starsEarned')}</p>
                <p className="text-lg font-bold text-gray-800">{totalStars}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.path)}
                  className={`w-full h-12 flex items-center gap-3 px-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? "fill-white" : ""}`}
                  />
                  <span className="font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Encouragement Card */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">
                  {t('home.unlockMore')}
                </h4>
                <p className="text-xs text-purple-100">
                  {t('home.completeLessonsToUnlock')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ MOBILE HEADER ═══ */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black text-gray-800">
              {t('learn.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('learn.subtitle')}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('home.totalXp')}</p>
                <p className="text-lg font-bold text-gray-800">{totalXP}</p>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('home.starsEarned')}</p>
                <p className="text-lg font-bold text-gray-800">{totalStars}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="lg:ml-60">
        {/* Mobile Layout */}
        <div className="lg:hidden max-w-4xl mx-auto px-4 py-8 pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects?.map((subject, index) => (
              <SubjectBrowserCard
                key={subject.id}
                subject={subject}
                index={index}
                onClick={() => router.push(`/child/learn/${subject.id}`)}
              />
            ))}
          </div>

          {/* Motivational Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl text-white text-center"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">
              {t('learn.keepUpGreatWork')}
            </h3>
            <p className="text-sm opacity-90">
              {t('learn.completeLessonsToUnlock')}
            </p>
          </motion.div>

          {/* Worksheet Collections */}
          {practiceData && <WorksheetCollections practiceData={practiceData} />}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-6xl mx-auto px-8 py-8">
          {/* Desktop Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-lg mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-800 mb-2">
                  {t('learn.title')}
                </h1>
                <p className="text-gray-600">
                  {t('learn.chooseSubject')}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('home.totalXp')}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalXP}
                    </p>
                  </div>
                </div>

                <div className="w-px h-14 bg-gray-200" />

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Trophy className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('home.starsEarned')}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalStars}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Subjects Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {subjects?.map((subject, index) => (
              <SubjectBrowserCard
                key={subject.id}
                subject={subject}
                index={index}
                onClick={() => router.push(`/child/learn/${subject.id}`)}
              />
            ))}
          </div>

          {/* Desktop Motivational Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-6xl">🎯</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {t('learn.keepUpGreatWork')}
                  </h3>
                  <p className="text-base opacity-90">
                    {t('learn.completeLessonsToUnlock')}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/child/rewards")}
                className="px-6 py-3 bg-white text-purple-600 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {t('learn.viewAllRewards')}
              </motion.button>
            </div>
          </motion.div>

          {/* Worksheet Collections - Desktop */}
          {practiceData && <WorksheetCollections practiceData={practiceData} />}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
}
