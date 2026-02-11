"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Subject, SkillNode } from "@/types";
import {
  ArrowLeft,
  Lock,
  Star,
  Check,
  Trophy,
  Flag,
  Home,
  BookOpen,
  Gift,
  Award,
  User,
  Search,
  Flame,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/child/BottomNav";
import { Mascot } from "@/components/Mascot";
import { useAuthStore } from "@/stores/auth-store";

// ─── Helpers ──────────────────────────────────────────────────────

function getNodeStatus(
  node: SkillNode
): "completed" | "current" | "locked" | "boss" {
  if (node.node_type === "boss") return "boss";
  if (!node.unlocked) return "locked";
  if ((node.best_stars ?? 0) > 0) return "completed";
  return "current";
}

function getNodePosition(index: number): "left" | "center" | "right" {
  const pattern: ("left" | "right" | "left" | "right" | "center")[] = [
    "left",
    "right",
    "left",
    "right",
    "center",
  ];
  return pattern[index % pattern.length];
}

function getNodeTranslate(position: "left" | "center" | "right") {
  if (position === "left") return "translateX(-50px)";
  if (position === "right") return "translateX(50px)";
  return "translateX(0px)";
}

const decorativeEmojis = ["💎", "⭐", "☁️"];

const sidebarNavItems = [
  { path: "/child/home", icon: Home, label: "Home" },
  { path: "/child/learn", icon: BookOpen, label: "Learn" },
  { path: "/child/rewards", icon: Gift, label: "Rewards" },
  { path: "/child/leaderboard", icon: Award, label: "Ranks" },
  { path: "/child/profile", icon: User, label: "Profile" },
];

// ─── Desktop Path Corridor ───────────────────────────────────────

function DesktopPathNode({
  node,
  index,
  prevPosition,
  onNavigate,
}: {
  node: SkillNode;
  index: number;
  prevPosition: "left" | "center" | "right";
  onNavigate: (nodeId: string, subjectId: string) => void;
}) {
  const status = getNodeStatus(node);
  const position = getNodePosition(index);
  const showPath = index > 0;
  const stars = node.best_stars ?? 0;

  return (
    <div>
      {/* Connecting Path */}
      {showPath && (
        <div className="relative mb-4" style={{ height: "140px" }}>
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient
                id={`desktop-gradient-completed-${index}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="1" />
              </linearGradient>
              <linearGradient
                id={`desktop-gradient-upcoming-${index}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.4" />
              </linearGradient>
              <filter id={`desktop-shadow-${index}`}>
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="4"
                  floodColor="#7C3AED"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>
            <path
              d={`M 360 0 Q ${prevPosition === "left" ? "220" : "500"} 70, 360 140`}
              stroke={
                status === "locked"
                  ? `url(#desktop-gradient-upcoming-${index})`
                  : `url(#desktop-gradient-completed-${index})`
              }
              strokeWidth={status === "locked" ? "6" : "10"}
              strokeDasharray={status === "locked" ? "16 12" : "0"}
              strokeLinecap="round"
              fill="none"
              filter={
                status === "locked" ? "" : `url(#desktop-shadow-${index})`
              }
            />
          </svg>

          {/* Direction Arrow Chevrons */}
          {[25, 50, 75].map((percent) => (
            <motion.div
              key={percent}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${percent}%` }}
              animate={{
                y: [0, 4, 0],
                opacity: status === "current" ? [0.5, 0.8, 0.5] : 0.4,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: percent * 0.01,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5L7 9L11 5"
                  stroke={status === "locked" ? "#9CA3AF" : "#7C3AED"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={status === "locked" ? 0.3 : 0.6}
                />
              </svg>
            </motion.div>
          ))}

          {/* Glowing Pulse at Transition Point */}
          {status === "current" && (
            <motion.div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0.3, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}

          {/* Checkpoint Flag */}
          {index === 3 && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <Flag className="w-11 h-11 text-purple-600 fill-purple-200 drop-shadow-lg" />
            </motion.div>
          )}
        </div>
      )}

      {/* Skill Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 * index, type: "spring" }}
        className="relative flex items-center mb-6"
        style={{
          justifyContent:
            position === "left"
              ? "flex-start"
              : position === "right"
                ? "flex-end"
                : "center",
          paddingLeft: position === "left" ? "80px" : "0",
          paddingRight: position === "right" ? "80px" : "0",
        }}
      >
        {/* Node Label - Right side */}
        {position === "right" && (
          <div className="mr-6 text-right" style={{ width: "160px" }}>
            <p className="text-base font-bold text-gray-800 mb-1">
              {node.title}
            </p>
            {status === "current" && (
              <p className="text-sm font-semibold text-purple-600">~5 min</p>
            )}
            {status === "locked" && (
              <p className="text-xs text-gray-500">Complete previous</p>
            )}
          </div>
        )}

        {/* Boss Crown */}
        {status === "boss" && (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg"
          >
            👑
          </motion.div>
        )}

        {/* Node Circle Container */}
        <div className="relative group">
          <motion.button
            onClick={() => {
              if (status === "current" || status === "completed") {
                onNavigate(node.id, "");
              }
            }}
            disabled={status === "locked"}
            whileHover={
              status !== "locked"
                ? { y: -4, transition: { duration: 0.2, ease: "easeOut" } }
                : {}
            }
            className={`relative ${status !== "locked" ? "cursor-pointer" : "cursor-not-allowed"}`}
            style={{
              width: status === "boss" ? "96px" : "72px",
              height: status === "boss" ? "96px" : "72px",
              transition: "all 0.2s ease",
            }}
            title={
              status === "completed"
                ? "Review this lesson"
                : status === "current"
                  ? "Continue learning"
                  : status === "locked"
                    ? "Complete previous lesson to unlock"
                    : node.title
            }
          >
            {/* Completed Node */}
            {status === "completed" && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 group-hover:shadow-2xl transition-shadow duration-200"
                  style={{ padding: "3px" }}
                >
                  <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center shadow-xl">
                    <Check
                      className="w-9 h-9 text-white"
                      strokeWidth={3.5}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 blur-xl group-hover:opacity-40 transition-opacity duration-200" />
              </>
            )}

            {/* Current Node */}
            {status === "current" && (
              <>
                <div className="absolute inset-0 rounded-full bg-purple-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow duration-200">
                  <Star className="w-9 h-9 text-white fill-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0) 70%)",
                  }}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </>
            )}

            {/* Locked Node */}
            {status === "locked" && (
              <div
                className="absolute inset-0 rounded-full bg-gray-300 flex items-center justify-center"
                style={{ opacity: 0.4 }}
              >
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
            )}

            {/* Boss Node */}
            {status === "boss" && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-200">
                  <Trophy className="w-12 h-12 text-white fill-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 blur-2xl group-hover:opacity-50 transition-opacity duration-200" />
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm font-black px-4 py-1 rounded-full shadow-lg">
                  BOSS
                </div>
              </>
            )}
          </motion.button>

          {/* Hover Buttons */}
          {status === "current" && (
            <button
              onClick={() => onNavigate(node.id, "")}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100 duration-200"
            >
              Continue
            </button>
          )}
          {status === "completed" && (
            <button
              onClick={() => onNavigate(node.id, "")}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl hover:bg-green-700 transition-all opacity-0 group-hover:opacity-100 duration-200"
            >
              Review
            </button>
          )}

          {/* Stars Display Below Node */}
          {status === "completed" && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 flex gap-1"
              style={{ marginTop: "16px" }}
            >
              {[1, 2, 3].map((s) => (
                <div key={s} className="relative">
                  <Star
                    className={`w-6 h-6 ${
                      s <= stars
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 fill-gray-300"
                    }`}
                  />
                  {s <= stars && (
                    <div className="absolute inset-0 w-6 h-6 bg-yellow-400 opacity-40 blur-md" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Node Label - Left side */}
        {position === "left" && (
          <div className="ml-6 text-left" style={{ width: "160px" }}>
            <p className="text-base font-bold text-gray-800 mb-1">
              {node.title}
            </p>
            {status === "current" && (
              <p className="text-sm font-semibold text-purple-600">~5 min</p>
            )}
            {status === "locked" && (
              <p className="text-xs text-gray-500">Complete previous</p>
            )}
          </div>
        )}

        {/* Center Position Label */}
        {position === "center" && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center"
            style={{
              top: status === "boss" ? "120px" : "100px",
              width: "180px",
            }}
          >
            <p className="text-lg font-bold text-gray-800">{node.title}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────

export default function LearnSubjectPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { currentChildProfile } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/subjects/${subjectId}`);
      return {
        subject: data.subject.attributes as Subject,
        skillNodes: data.skill_nodes.map(
          (n: { attributes: SkillNode }) => n.attributes
        ) as SkillNode[],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!data) return null;

  const { subject, skillNodes } = data;
  const completedCount = skillNodes.filter(
    (n) => (n.best_stars ?? 0) > 0
  ).length;
  const totalCount = skillNodes.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const totalXP = skillNodes
    .filter((n) => (n.best_stars ?? 0) > 0)
    .reduce((sum, n) => sum + n.xp_reward, 0);

  const handleNodeNavigate = (nodeId: string) => {
    router.push(`/child/session/${nodeId}?subject=${subjectId}`);
  };

  const getMascotMessage = () => {
    if (completedCount === 0) return "Ready to learn? Let's go! 🚀";
    if (completedCount >= totalCount * 0.8)
      return "Almost at the challenge! 💪";
    if (completedCount >= totalCount / 2)
      return "You're halfway there! Keep it up!";
    return "Great progress! Keep learning! ⭐";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 pb-24 lg:pb-0">
      {/* ═══ DESKTOP HEADER ═══ */}
      <div className="hidden lg:block bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black text-gray-800">EduQuest</span>
          </div>

          <div className="hidden xl:block flex-1 max-w-xs mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
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
                {currentChildProfile?.level ?? 1} lvl
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/child/rewards")}
              className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full cursor-pointer hover:shadow-md transition-all"
            >
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-700">
                {currentChildProfile?.coins ?? 0}
              </span>
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

      {/* ═══ DESKTOP LAYOUT ═══ */}
      <div className="hidden lg:flex">
        {/* Left Sidebar */}
        <div className="w-60 bg-white/80 backdrop-blur-sm border-r border-gray-200 fixed left-0 top-16 bottom-0 z-10">
          <div className="p-4 flex flex-col h-full overflow-y-auto">
            {/* Subject Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🔢</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{subject.name}</p>
                  <p className="text-xs text-gray-600">
                    Level {subject.enrollment?.current_level ?? 1}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">
                    {completedCount}/{totalCount} lessons
                  </p>
                  <p className="text-xs font-bold text-purple-600">
                    {Math.round(progressPercent)}%
                  </p>
                </div>
              </div>

              {/* XP Badge */}
              <div className="flex items-center gap-2 mt-3">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-gray-800">
                  {totalXP} XP
                </span>
              </div>
            </div>

            {/* Mini-Map */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
              <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Path Overview
              </h3>
              <div className="relative flex flex-col items-center justify-between py-2 gap-2">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2" />
                {skillNodes.map((node) => {
                  const status = getNodeStatus(node);
                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        if (status === "current" || status === "completed") {
                          handleNodeNavigate(node.id);
                        }
                      }}
                      className="relative z-10 group"
                      title={node.title}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          status === "completed"
                            ? "bg-green-500 border-yellow-400"
                            : status === "current"
                              ? "bg-purple-600 border-purple-400 animate-pulse"
                              : status === "boss"
                                ? "bg-orange-500 border-orange-400"
                                : "bg-transparent border-gray-300"
                        }`}
                      />
                      {status === "current" && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                          <span className="text-xs font-bold text-purple-600">
                            ← You
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/child/learn" &&
                  pathname?.startsWith("/child/learn");
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
                <span className="text-3xl">🦉</span>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Keep going!
                  </h4>
                  <p className="text-xs text-purple-100">
                    You&apos;re doing great! 🚀
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-60 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {subject.name} — Level{" "}
              {subject.enrollment?.current_level ?? 1}
            </h1>
            <p className="text-sm text-gray-500">Continue your journey</p>
          </div>

          {/* Path Corridor */}
          <div className="mx-auto" style={{ maxWidth: "720px" }}>
            <div
              className="relative rounded-3xl p-12 shadow-sm"
              style={{
                backgroundColor: "rgba(245, 243, 255, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Background Math Symbols */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[
                  {
                    symbol: "+",
                    size: "40px",
                    left: "6%",
                    top: "12%",
                    opacity: 0.05,
                  },
                  {
                    symbol: "×",
                    size: "32px",
                    left: "88%",
                    top: "18%",
                    opacity: 0.06,
                  },
                  {
                    symbol: "÷",
                    size: "28px",
                    left: "10%",
                    top: "50%",
                    opacity: 0.04,
                  },
                  {
                    symbol: "=",
                    size: "36px",
                    left: "90%",
                    top: "55%",
                    opacity: 0.06,
                  },
                  {
                    symbol: "1",
                    size: "24px",
                    left: "4%",
                    top: "80%",
                    opacity: 0.05,
                  },
                  {
                    symbol: "+",
                    size: "38px",
                    left: "85%",
                    top: "85%",
                    opacity: 0.05,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="absolute font-bold text-purple-600"
                    style={{
                      fontSize: item.size,
                      opacity: item.opacity,
                      left: item.left,
                      top: item.top,
                    }}
                    animate={{
                      y: [0, -12, 0],
                      rotate: [0, 6, 0],
                    }}
                    transition={{
                      duration: 5 + i * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {item.symbol}
                  </motion.div>
                ))}
              </div>

              {/* Mascot Welcome */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="relative mb-16 flex justify-center"
                >
                  <div className="w-24 h-24">
                    <Mascot
                      mood="waving"
                      size="xl"
                      showSpeechBubble={false}
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute left-32 top-2 bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-xl z-10 border-2 border-purple-200"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <p className="text-base font-bold text-gray-800">
                      {getMascotMessage()}
                    </p>
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l-2 border-t-2 border-purple-200 transform rotate-45" />
                  </motion.div>
                </motion.div>

                {/* Skill Nodes */}
                {skillNodes.map((node, index) => {
                  const prevPosition =
                    index > 0 ? getNodePosition(index - 1) : "center";
                  return (
                    <DesktopPathNode
                      key={node.id}
                      node={node}
                      index={index}
                      prevPosition={prevPosition}
                      onNavigate={handleNodeNavigate}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE LAYOUT (unchanged) ═══ */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="h-24 px-4 flex items-center max-w-2xl mx-auto">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors mr-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-800">
                {subject.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Level {subject.enrollment?.current_level ?? 1}
              </p>

              <div className="mt-2 mx-auto" style={{ width: "140px" }}>
                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {completedCount}/{totalCount} complete
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border-2 border-yellow-200 ml-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-700">
                {totalXP}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Path Content */}
        <div className="relative pb-16 pt-8">
          {/* Floating Subject Symbols Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {["+", "×", "÷", "=", "+", "×", "÷", "="].map((symbol, i) => (
              <motion.div
                key={i}
                className="absolute text-6xl font-bold text-purple-400"
                style={{
                  opacity: 0.08,
                  left: `${(i % 4) * 25 + 10}%`,
                  top: `${Math.floor(i / 4) * 40 + 15}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>

          {/* Path Container */}
          <div className="relative mx-auto" style={{ width: "260px" }}>
            {/* Mascot Welcome */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative mb-12 flex justify-center"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🦉</span>
                </div>

                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute left-20 top-0 bg-white px-4 py-2 rounded-2xl rounded-tl-sm shadow-lg"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <p className="text-sm font-bold text-gray-800">
                    Let&apos;s go! 🚀
                  </p>
                  <div className="absolute -left-1 top-2 w-3 h-3 bg-white transform rotate-45" />
                </motion.div>
              </div>
            </motion.div>

            {/* Skill Nodes */}
            <AnimatePresence>
              {skillNodes.map((node, index) => {
                const status = getNodeStatus(node);
                const position = getNodePosition(index);
                const prevPosition =
                  index > 0 ? getNodePosition(index - 1) : position;
                const showPath = index > 0;
                const stars = node.best_stars ?? 0;
                const isBoss = status === "boss";

                return (
                  <div key={node.id}>
                    {/* Connecting Path */}
                    {showPath && (
                      <div className="relative h-24 mb-2">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          style={{ overflow: "visible" }}
                        >
                          <defs>
                            <linearGradient
                              id={`gradient-${index}`}
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#7C3AED"
                                stopOpacity="0.6"
                              />
                              <stop
                                offset="100%"
                                stopColor="#7C3AED"
                                stopOpacity="0.8"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 130 0 Q ${prevPosition === "left" ? "80" : "180"} 50, 130 100`}
                            stroke={
                              status === "locked"
                                ? "#D1D5DB"
                                : `url(#gradient-${index})`
                            }
                            strokeWidth="14"
                            strokeDasharray={
                              status === "locked" ? "8 6" : "0"
                            }
                            strokeLinecap="round"
                            fill="none"
                            opacity={status === "locked" ? 0.4 : 1}
                          />
                        </svg>

                        {/* Checkpoint Flag */}
                        {index === 3 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 1.2, type: "spring" }}
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          >
                            <Flag className="w-8 h-8 text-purple-500 fill-purple-200" />
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Skill Node */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 * index, type: "spring" }}
                      className="relative flex flex-col items-center mb-2"
                      style={{
                        transform: getNodeTranslate(position),
                      }}
                    >
                      {/* Boss Crown */}
                      {isBoss && (
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-6 text-2xl"
                        >
                          👑
                        </motion.div>
                      )}

                      {/* Node Circle */}
                      <button
                        onClick={() => {
                          if (
                            status === "current" ||
                            status === "completed"
                          ) {
                            router.push(
                              `/child/session/${node.id}?subject=${subjectId}`
                            );
                          }
                        }}
                        disabled={status === "locked"}
                        className="relative group"
                        style={{
                          width: isBoss ? "80px" : "68px",
                          height: isBoss ? "80px" : "68px",
                        }}
                      >
                        {status === "completed" && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-0.5">
                              <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <Check
                                  className="w-8 h-8 text-white"
                                  strokeWidth={3}
                                />
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 blur-lg" />
                          </>
                        )}

                        {status === "current" && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                              <Star className="w-8 h-8 text-white fill-white" />
                            </div>
                            <motion.div
                              className="absolute inset-0 rounded-full bg-purple-400 blur-lg"
                              animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            />
                          </>
                        )}

                        {status === "locked" && (
                          <div
                            className="absolute inset-0 rounded-full bg-gray-300 flex items-center justify-center"
                            style={{ opacity: 0.5 }}
                          >
                            <Lock className="w-7 h-7 text-gray-500" />
                          </div>
                        )}

                        {status === "boss" && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-xl">
                              <Trophy className="w-10 h-10 text-white fill-white" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 blur-lg" />
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                              BOSS
                            </div>
                          </>
                        )}
                      </button>

                      {/* Continue Label */}
                      {status === "current" && (
                        <motion.p
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-xs font-bold text-purple-600 mt-1"
                        >
                          Continue
                        </motion.p>
                      )}

                      {/* Node Title */}
                      <p
                        className="text-sm font-bold text-gray-800 mt-2 text-center px-2"
                        style={{ maxWidth: "120px" }}
                      >
                        {node.title}
                      </p>

                      {/* Stars Display */}
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: node.max_stars }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              status === "completed" && i < stars
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* XP Badge */}
                      {status === "completed" && (
                        <p className="text-xs text-green-600 font-bold mt-1">
                          +{node.xp_reward} XP
                        </p>
                      )}
                    </motion.div>

                    {/* Decorative Elements */}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{
                          scale: 1,
                          ...(index === 0
                            ? { rotate: [0, 10, 0] }
                            : index === 1
                              ? { y: [0, -10, 0] }
                              : { x: [0, 5, 0] }),
                        }}
                        transition={{
                          delay: 0.8 + index * 0.2,
                          duration: 2 + index,
                          repeat: Infinity,
                        }}
                        className={`absolute text-2xl ${
                          index % 2 === 0 ? "right-4" : "left-4"
                        }`}
                        style={{
                          top: `${160 + index * 160}px`,
                        }}
                      >
                        {decorativeEmojis[index]}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Mascot Peeking at End */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              className="absolute -right-16 text-4xl"
              style={{ bottom: "80px" }}
            >
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦉
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
