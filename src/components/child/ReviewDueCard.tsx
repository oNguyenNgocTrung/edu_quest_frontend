"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PracticeItem } from "@/types";

interface ReviewDueCardProps {
  items: PracticeItem[];
  onStartReview: (deckId: string, sessionId?: string | null) => void;
}

export function ReviewDueCard({ items, onStartReview }: ReviewDueCardProps) {
  const { t } = useTranslation('child');

  if (items.length === 0) return null;

  const totalQuestions = items.reduce((sum, item) => sum + item.questions_count, 0);
  const firstItem = items[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-md mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3
              className="text-lg font-black text-blue-900"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t('reviewDue.title')}
            </h3>
          </div>
          <p
            className="text-sm text-blue-700"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {t('reviewDue.cardsToReview', { count: totalQuestions })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-blue-600">{totalQuestions}</div>
        </div>
      </div>

      {/* Worksheet chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <div
            key={item.deck_id}
            className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full"
          >
            <span
              className="text-sm font-semibold text-gray-700"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {item.deck_name}:
            </span>
            <span
              className="text-sm font-black text-blue-600"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {item.best_stars}/3 ★
            </span>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartReview(firstItem.deck_id, firstItem.in_progress_session_id)}
        className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {t('reviewDue.startReview')}
      </motion.button>
    </motion.div>
  );
}
