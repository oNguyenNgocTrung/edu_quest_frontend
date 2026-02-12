"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import {
  ArrowLeft,
  Star,
  Flame,
  Trophy,
  Target,
  Award,
  Lock,
  Palette,
  LogOut,
} from "lucide-react";
import { BottomNav } from "@/components/child/BottomNav";
import { resolveAvatar } from "@/lib/avatars";

export default function ChildProfilePage() {
  const router = useRouter();
  const { currentChildProfile, logout } = useAuthStore();
  const { t } = useTranslation('child');

  if (!currentChildProfile) {
    router.push("/child/home");
    return null;
  }

  const profile = currentChildProfile;
  const { emoji } = resolveAvatar(profile.avatar);

  // Hardcoded achievements (would come from API)
  const achievements = [
    { id: 1, name: t('profile.achievementNames.firstSteps'), icon: "👣", description: t('profile.achievementNames.firstStepsDesc'), unlocked: true },
    { id: 2, name: t('profile.achievementNames.weekWarrior'), icon: "🔥", description: t('profile.achievementNames.weekWarriorDesc'), unlocked: true },
    { id: 3, name: t('profile.achievementNames.quickLearner'), icon: "⚡", description: t('profile.achievementNames.quickLearnerDesc'), unlocked: true },
    { id: 4, name: t('profile.achievementNames.mathMaster'), icon: "🧮", description: t('profile.achievementNames.mathMasterDesc'), unlocked: true },
    { id: 5, name: t('profile.achievementNames.perfectScore'), icon: "💯", description: t('profile.achievementNames.perfectScoreDesc'), unlocked: true },
    { id: 6, name: t('profile.achievementNames.coinCollector'), icon: "💰", description: t('profile.achievementNames.coinCollectorDesc'), unlocked: true },
    { id: 7, name: t('profile.achievementNames.nightOwl'), icon: "🦉", description: t('profile.achievementNames.nightOwlDesc'), unlocked: true },
    { id: 8, name: t('profile.achievementNames.earlyBird'), icon: "🌅", description: t('profile.achievementNames.earlyBirdDesc'), unlocked: true },
    { id: 9, name: t('profile.achievementNames.bossSlayer'), icon: "⚔️", description: t('profile.achievementNames.bossSlayerDesc'), unlocked: false },
    { id: 10, name: t('profile.achievementNames.monthMaster'), icon: "📅", description: t('profile.achievementNames.monthMasterDesc'), unlocked: false },
    { id: 11, name: t('profile.achievementNames.speedDemon'), icon: "🚀", description: t('profile.achievementNames.speedDemonDesc'), unlocked: false },
    { id: 12, name: t('profile.achievementNames.champion'), icon: "👑", description: t('profile.achievementNames.championDesc'), unlocked: false },
  ];

  const stats = [
    { label: t('profile.totalXp'), value: profile.total_xp.toLocaleString(), icon: Star, color: "text-yellow-500" },
    { label: t('profile.currentStreak'), value: "12 days", icon: Flame, color: "text-orange-500" },
    { label: t('profile.longestStreak'), value: "18 days", icon: Trophy, color: "text-purple-500" },
    { label: t('profile.cardsMastered'), value: "87", icon: Target, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="text-center py-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative inline-block mb-4"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-xl">
                {emoji}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="font-black text-purple-600">{profile.level}</span>
              </div>
            </motion.div>

            <h1 className="text-2xl font-black mb-1">{profile.name}</h1>
            <p className="text-white/90">{t('profile.levelExplorer', { level: profile.level })}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-lg"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
              <p className="text-2xl font-black text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              {t('profile.achievements')}
            </h2>
            <span className="text-sm font-bold text-gray-500">
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                className={`relative bg-white rounded-2xl p-4 shadow-md transition-all ${
                  achievement.unlocked ? "shadow-lg" : "opacity-50"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                      : "bg-gray-200"
                  }`}
                >
                  {achievement.unlocked ? (
                    achievement.icon
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p
                  className={`text-xs font-bold text-center ${
                    achievement.unlocked ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {achievement.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Customize Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-6 text-white cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">{t('profile.customizeMascot')}</h3>
            <Palette className="w-6 h-6" />
          </div>
          <p className="text-white/90 mb-4 text-sm">
            {t('profile.customizeMascotDesc')}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {["🎩", "👑", "🕶️", "🎀", "✨"].map((e, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl border-2 border-white/30"
                >
                  {e}
                </div>
              ))}
            </div>
            <div className="flex-1 text-right">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 font-bold">
                {t('profile.customizeNow')}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Avatar Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg mt-6"
        >
          <h3 className="text-lg font-black text-gray-800 mb-3">{t('profile.yourAvatars')}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {t('profile.unlockAvatarsDesc')}
          </p>

          <div className="grid grid-cols-4 gap-3">
            {["🦊", "🐼", "🦁", "🐸", "🐰", "🦉", "🐯", "🐨"].map(
              (e, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: index < 4 ? 1.1 : 1 }}
                  whileTap={{ scale: index < 4 ? 0.9 : 1 }}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    index === 0
                      ? "bg-gradient-to-br from-purple-100 to-pink-100 ring-2 ring-purple-500"
                      : index < 4
                        ? "bg-gray-100 hover:bg-gray-200"
                        : "bg-gray-100 opacity-50"
                  }`}
                >
                  {index < 4 ? e : "🔒"}
                </motion.button>
              )
            )}
          </div>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/child/leaderboard")}
          className="w-full mt-6 bg-white rounded-2xl p-5 shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">{t('profile.familyLeaderboard')}</p>
              <p className="text-sm text-gray-500">{t('profile.seeRanking')}</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </motion.button>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => logout()}
          className="w-full mt-6 mb-20 bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-md flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-600">{t('profile.logout')}</span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
