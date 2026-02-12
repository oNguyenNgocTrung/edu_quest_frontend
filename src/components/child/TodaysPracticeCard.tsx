"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PracticeItem } from "@/types";

interface TodaysPracticeCardProps {
  practice: PracticeItem;
  onStart: (deckId: string, sessionId?: string | null) => void;
}

export function TodaysPracticeCard({ practice, onStart }: TodaysPracticeCardProps) {
  const { t } = useTranslation('child');
  const isInProgress = practice.status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 text-6xl">📝</div>
          <div className="absolute bottom-4 left-4 text-4xl">✨</div>
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3">
                {t('todaysPractice.title')}
              </span>
              <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                {practice.deck_name}
              </h2>
              <p className="text-purple-100 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                {practice.worksheet_title && `From: ${practice.worksheet_title}`}
                {practice.worksheet_date && ` (${practice.worksheet_date})`}
                {practice.ai_generated_count > 0 && ` + ${practice.ai_generated_count} similar exercises`}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{practice.questions_count} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">~{practice.estimated_minutes} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-white" />
              <span className="text-sm font-semibold">+{practice.xp_reward} XP</span>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(practice.deck_id, practice.in_progress_session_id)}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {isInProgress ? t('todaysPractice.startReview') : t('todaysPractice.startReview')}
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
