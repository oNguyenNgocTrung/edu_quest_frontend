"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import type { Subject, DailyQuest, Streak } from "@/types";
import { Flame, Star, Coins, Trophy, LogOut, ChevronRight, Zap } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { BrainBoostBanner } from "@/components/child/BrainBoostBanner";
import { YourSubjects } from "@/components/child/YourSubjects";
import { BottomNav } from "@/components/child/BottomNav";

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
  const [showConfetti, setShowConfetti] = useState(false);

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

  const { data: dailyQuest } = useQuery({
    queryKey: ["daily_quest", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/daily_quest");
      return data as DailyQuest;
    },
    enabled: !!currentChildProfile,
  });

  const { data: streak } = useQuery({
    queryKey: ["streak", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/streak");
      return data as Streak;
    },
    enabled: !!currentChildProfile,
  });

  // Profile selector if no child profile selected
  if (!currentChildProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 p-6">
        <div className="max-w-md mx-auto pt-12">
          <h1 className="text-2xl font-black text-center text-gray-800 mb-2">
            Who&apos;s learning today?
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Select a profile to get started
          </p>

          <div className="grid grid-cols-2 gap-4">
            {childProfiles.map((profile) => (
              <motion.button
                key={profile.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectChildProfile(profile)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center"
              >
                <div className="w-20 h-20 mx-auto mb-3">
                  <Mascot
                    mood="waving"
                    size="sm"
                    showSpeechBubble={false}
                  />
                </div>
                <h3 className="font-bold text-gray-800">{profile.name}</h3>
                <p className="text-sm text-gray-500">Level {profile.level}</p>
              </motion.button>
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
  const streakDays = streak?.current_length ?? 0;
  const questProgress = dailyQuest?.progress_count ?? 0;
  const questTotal = dailyQuest?.required_count ?? 3;
  const isQuestComplete = questProgress >= questTotal;

  const currentXP = profile.total_xp % 100;
  const levelUpXP = 100;
  const xpProgress = (currentXP / levelUpXP) * 100;
  const isCloseToLevelUp = xpProgress >= 75;

  const getMascotMood = (): "waving" | "pointing" | "celebrating" | "excited" => {
    if (isQuestComplete) return "celebrating";
    if (isCloseToLevelUp) return "excited";
    if (questProgress < questTotal) return "pointing";
    return "waving";
  };

  // Streak milestone
  const getMilestone = (days: number) => {
    if (days >= 30) return { color: "#FCD34D", ringColor: "#F59E0B" };
    if (days >= 14) return { color: "#E5E7EB", ringColor: "#9CA3AF" };
    if (days >= 7) return { color: "#FED7AA", ringColor: "#FB923C" };
    return null;
  };
  const milestone = getMilestone(streakDays);

  const handleStreakTap = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Hardcoded cards due for now (would come from API)
  const cardsDue = 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 pb-24">
      {/* Header Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Streak Badge */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={handleStreakTap}
            className="relative cursor-pointer"
          >
            {/* Fire particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: "50%",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: `rgba(251, 146, 60, ${0.8 - i * 0.1})`,
                  }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.8 - i * 0.1, 0, 0.8 - i * 0.1],
                    scale: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Confetti burst */}
            {showConfetti && (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: "8px",
                      height: "8px",
                      borderRadius: i % 3 === 0 ? "50%" : "2px",
                      background: ["#FCD34D", "#FB923C", "#F97316", "#FBBF24", "#FDE68A"][i % 5],
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: Math.cos((i * 18 * Math.PI) / 180) * (60 + Math.random() * 40),
                      y: Math.sin((i * 18 * Math.PI) / 180) * (60 + Math.random() * 40),
                      opacity: 0,
                      scale: [0, 1.5, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                ))}
              </>
            )}

            {/* Milestone ring */}
            {milestone && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `3px solid ${milestone.ringColor}`,
                  boxShadow: `0 0 12px ${milestone.color}`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Badge */}
            <div
              className="relative rounded-full p-[2px]"
              style={{ background: "linear-gradient(135deg, #FEF3C7, #FCD34D)" }}
            >
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 0.95, 1.1, 1],
                      rotate: [-3, 3, -2, 2, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flame className="text-orange-500" style={{ width: "28px", height: "28px" }} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div
                      className="w-3 h-4 rounded-full"
                      style={{ background: "radial-gradient(circle, #FBBF24, transparent 70%)" }}
                    />
                  </motion.div>
                </div>
                <div className="relative">
                  <span className="relative font-bold" style={{ color: "#F97316", fontSize: "18px" }}>
                    {streakDays}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  day{streakDays !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Coins */}
          <motion.div
            className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-full"
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/child/rewards")}
          >
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-700">{profile.coins}</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Greeting with Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Mascot mood={getMascotMood()} size="lg" showSpeechBubble={true} />
          <div>
            <h1 className="text-2xl font-black text-gray-800">
              Hey {profile.name}! 👋
            </h1>
            <p className="text-gray-600">Ready to learn today?</p>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Level {profile.level}</p>
                <p className="font-bold text-gray-800">
                  {currentXP} / {levelUpXP} XP
                </p>
              </div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Daily Quest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 relative"
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.4), transparent 70%)",
              filter: "blur(20px)",
            }}
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/child/learn")}
            className="w-full rounded-3xl shadow-xl relative overflow-hidden"
            style={{
              background: "linear-gradient(to right, #F97316, #EC4899)",
              height: "120px",
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
              style={{ width: "50%" }}
            />

            {/* Completion confetti */}
            {isQuestComplete && (
              <>
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background:
                        i % 3 === 0 ? "#FBBF24" : i % 3 === 1 ? "#FCD34D" : "#FDE68A",
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: Math.cos((i * 30 * Math.PI) / 180) * 80,
                      y: Math.sin((i * 30 * Math.PI) / 180) * 80,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-6">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
              />
              <div className="relative z-20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white" style={{ fontSize: "20px" }}>
                    Daily Quest
                  </h3>
                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#FDE68A",
                        }}
                        animate={{
                          x: [0, Math.cos((i * 90 * Math.PI) / 180) * 20, 0],
                          y: [0, Math.sin((i * 90 * Math.PI) / 180) * 20, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white text-left mb-3" style={{ fontSize: "14px" }}>
                  Complete {questTotal} lessons to earn bonus XP!
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ height: "10px", backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#FBBF24" }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(questProgress / questTotal) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="font-bold text-white" style={{ fontSize: "14px" }}>
                    {questProgress}/{questTotal}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Brain Boost Banner */}
        <BrainBoostBanner
          cardsDue={cardsDue}
          onReviewClick={() => router.push("/child/flashcards/review")}
        />

        {/* Subjects */}
        {subjects && (
          <YourSubjects
            subjects={subjects}
            onSubjectClick={(subjectId) => router.push(`/child/learn/${subjectId}`)}
          />
        )}

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <Zap className="text-gray-500" style={{ width: "14px", height: "14px" }} />
            <h3
              className="font-bold tracking-wider uppercase"
              style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.05em" }}
            >
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Brain Boost Card */}
            <motion.button
              whileHover={{ scale: cardsDue > 0 ? 1.03 : 1 }}
              whileTap={{ scale: cardsDue > 0 ? 0.97 : 1 }}
              onClick={() => cardsDue > 0 && router.push("/child/flashcards/review")}
              className="relative overflow-hidden"
              style={{
                height: "88px",
                background:
                  cardsDue > 0
                    ? "linear-gradient(135deg, #8B5CF6, #7C3AED)"
                    : "linear-gradient(135deg, #10B981, #059669)",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                cursor: cardsDue > 0 ? "pointer" : "default",
              }}
            >
              {cardsDue > 0 && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                    width: "100%",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    ease: "easeInOut",
                  }}
                />
              )}
              <div className="relative z-10 h-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={
                      cardsDue > 0
                        ? { y: [0, -3, 0], rotate: [-3, 3, -3] }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: cardsDue > 0 ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    style={{ fontSize: "40px", lineHeight: 1 }}
                  >
                    {cardsDue > 0 ? "🧠" : "🎉"}
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <h3
                      className="font-bold text-white text-left leading-tight"
                      style={{ fontSize: "15px" }}
                    >
                      {cardsDue > 0 ? "Brain Boost!" : "All Done!"}
                    </h3>
                    <p
                      className="text-left font-medium"
                      style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      {cardsDue > 0 ? `${cardsDue} cards ready` : "All caught up!"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "rgba(255, 255, 255, 0.6)",
                    flexShrink: 0,
                  }}
                />
              </div>
            </motion.button>

            {/* Achievements Card */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/child/profile")}
              className="relative overflow-hidden"
              style={{
                height: "88px",
                background: "linear-gradient(135deg, #EC4899, #A855F7)",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "16px",
              }}
            >
              <motion.div
                className="absolute"
                style={{ left: "26px", top: "10px", fontSize: "10px" }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
              <div className="relative z-10 h-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Trophy
                      className="fill-yellow-400"
                      style={{
                        width: "40px",
                        height: "40px",
                        color: "#FBBF24",
                        strokeWidth: 2,
                      }}
                    />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <h3
                      className="font-bold text-white text-left leading-tight"
                      style={{ fontSize: "15px" }}
                    >
                      Achievements
                    </h3>
                    <p
                      className="text-left font-medium"
                      style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      View your trophies
                    </p>
                  </div>
                </div>
                <ChevronRight
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "rgba(255, 255, 255, 0.6)",
                    flexShrink: 0,
                  }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
