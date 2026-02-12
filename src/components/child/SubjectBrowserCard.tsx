"use client";

import { motion } from "framer-motion";
import { Lock, Star, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  Landmark,
  Atom,
  Music,
  Palette,
} from "lucide-react";
import type { Subject } from "@/types";

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

const gradientMap: Record<string, string> = {
  "#7C3AED": "from-purple-500 to-purple-600",
  "#10B981": "from-green-500 to-emerald-600",
  "#F59E0B": "from-amber-500 to-orange-600",
  "#3B82F6": "from-blue-500 to-indigo-600",
  "#EC4899": "from-pink-500 to-rose-600",
  "#8B5CF6": "from-violet-500 to-purple-600",
  "#14B8A6": "from-teal-500 to-teal-600",
  "#F97316": "from-orange-500 to-orange-600",
};

interface SubjectBrowserCardProps {
  subject: Subject;
  onClick: () => void;
  index: number;
}

export function SubjectBrowserCard({
  subject,
  onClick,
  index,
}: SubjectBrowserCardProps) {
  const { t } = useTranslation('child');
  const Icon = iconMap[subject.icon_name] || BookOpen;
  const mastery = subject.enrollment?.mastery_level ?? 0;
  const level = subject.enrollment?.current_level ?? 1;
  const totalXP = subject.enrollment?.total_xp ?? 0;
  const completedNodes = subject.enrollment?.completed_nodes_count ?? 0;
  const totalNodes = subject.skill_nodes_count;
  const isUnlocked = !!subject.enrollment || completedNodes > 0 || mastery > 0 || index < 4;
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  const gradient = gradientMap[subject.display_color] || "from-purple-500 to-purple-600";

  // Determine level label
  const levelLabel = `Level ${level}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.button
        whileHover={isUnlocked ? { scale: 1.02, y: -4 } : {}}
        whileTap={isUnlocked ? { scale: 0.98 } : {}}
        onClick={() => isUnlocked && onClick()}
        disabled={!isUnlocked}
        className={`relative w-full bg-white rounded-3xl shadow-lg overflow-hidden transition-all text-left ${
          isUnlocked ? "hover:shadow-xl" : "opacity-60"
        }`}
      >
        {/* Locked Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-sm font-bold text-gray-600">
                Complete more to unlock
              </p>
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg shrink-0`}
            >
              <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-800">
                {subject.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{levelLabel}</p>

              {/* Stars Display */}
              {totalXP > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-yellow-600">
                    {completedNodes * 3}
                  </span>
                </div>
              )}
            </div>

            {/* XP Badge */}
            {totalXP > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-full px-3 py-1 shrink-0">
                <p className="text-xs font-bold text-yellow-700">
                  {totalXP} XP
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-600">
                {completedNodes}/{totalNodes} {t('subjectBrowser.decks', { count: totalNodes })}
              </span>
              <span
                className="font-bold"
                style={{ color: subject.display_color }}
              >
                {progress}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${subject.display_color}, ${subject.display_color}dd)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
              />
            </div>
          </div>

          {/* Continue / Start Button */}
          {isUnlocked && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {progress > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      In Progress
                    </span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      Start Learning
                    </span>
                  </>
                )}
              </div>
              <div
                className="px-4 py-2 rounded-full text-white text-sm font-bold shadow-md"
                style={{ backgroundColor: subject.display_color }}
              >
                {progress > 0 ? t('subjectBrowser.explore') : t('subjectBrowser.explore')}
              </div>
            </div>
          )}
        </div>

        {/* Decorative Elements for Active Subjects */}
        {isUnlocked && progress > 0 && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{
                  top: `${20 + i * 15}%`,
                  right: `${10 + i * 5}%`,
                  fontSize: "12px",
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                ✨
              </motion.div>
            ))}
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
