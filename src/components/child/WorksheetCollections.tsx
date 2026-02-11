"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Star,
  Clock,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Sparkles,
  FileText,
} from "lucide-react";
import type { PracticeItem, TodayPracticeResponse } from "@/types";

interface WorksheetCollectionsProps {
  practiceData: TodayPracticeResponse;
}

function DeckCard({
  item,
  variant,
  onStart,
}: {
  item: PracticeItem;
  variant: "practice" | "review" | "completed";
  onStart: (deckId: string, sessionId?: string | null) => void;
}) {
  const bgStyles = {
    practice:
      "bg-gradient-to-br from-orange-50 to-purple-50 border border-orange-200",
    review: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200",
    completed:
      "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200",
  };

  const buttonStyles = {
    practice: "bg-purple-600 hover:bg-purple-700",
    review: "bg-blue-600 hover:bg-blue-700",
    completed: "bg-green-600 hover:bg-green-700",
  };

  const buttonLabel = {
    practice:
      item.status === "in_progress" ? "Continue" : "Start",
    review: "Review",
    completed: "Redo",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className={`rounded-2xl p-4 ${bgStyles[variant]} transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            variant === "practice"
              ? "bg-purple-100"
              : variant === "review"
                ? "bg-blue-100"
                : "bg-green-100"
          }`}
        >
          <FileText
            className={`w-5 h-5 ${
              variant === "practice"
                ? "text-purple-600"
                : variant === "review"
                  ? "text-blue-600"
                  : "text-green-600"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 text-sm truncate">
            {item.deck_name}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.subject_name && (
              <span className="text-xs px-2 py-0.5 bg-white/80 rounded-full text-gray-600 font-medium">
                {item.subject_name}
              </span>
            )}
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {item.questions_count} questions
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />~{item.estimated_minutes} min
            </span>
          </div>

          {/* Stars & XP for completed */}
          {variant === "completed" && item.best_stars > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= item.best_stars
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 fill-gray-300"
                    }`}
                  />
                ))}
              </div>
              {item.xp_reward > 0 && (
                <span className="text-xs font-bold text-green-600">
                  +{item.xp_reward} XP
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onStart(item.deck_id, item.in_progress_session_id)}
          className={`px-3 py-1.5 rounded-full text-white text-xs font-bold shrink-0 transition-colors ${buttonStyles[variant]}`}
        >
          {buttonLabel[variant]}
        </button>
      </div>
    </motion.div>
  );
}

function CollapsibleGroup({
  title,
  icon: Icon,
  iconColor,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 px-1"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <span className="text-sm font-bold text-gray-700">{title}</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: iconColor }}
          >
            {count}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WorksheetCollections({
  practiceData,
}: WorksheetCollectionsProps) {
  const router = useRouter();

  const readyItems = practiceData.today_practice.filter(
    (p) => p.status === "new" || p.status === "in_progress"
  );
  const reviewItems = practiceData.review_due;
  const completedItems = practiceData.completed;
  const totalCount =
    readyItems.length + reviewItems.length + completedItems.length;

  const handleStart = (deckId: string, sessionId?: string | null) => {
    if (sessionId) {
      router.push(`/child/session/${sessionId}`);
    } else {
      router.push(`/child/session/new?deckId=${deckId}`);
    }
  };

  if (totalCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-800">My Worksheets</h2>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-bold text-gray-700 mb-1">No worksheets yet!</h3>
          <p className="text-sm text-gray-500">
            Ask your parent to upload one.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-800">My Worksheets</h2>
        <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
          {totalCount}
        </span>
      </div>

      {/* Ready to Practice */}
      <CollapsibleGroup
        title="Ready to Practice"
        icon={Sparkles}
        iconColor="#9333EA"
        count={readyItems.length}
      >
        {readyItems.map((item) => (
          <DeckCard
            key={item.deck_id}
            item={item}
            variant="practice"
            onStart={handleStart}
          />
        ))}
      </CollapsibleGroup>

      {/* Review Due */}
      <CollapsibleGroup
        title="Review Due"
        icon={RefreshCw}
        iconColor="#3B82F6"
        count={reviewItems.length}
      >
        {reviewItems.map((item) => (
          <DeckCard
            key={item.deck_id}
            item={item}
            variant="review"
            onStart={handleStart}
          />
        ))}
      </CollapsibleGroup>

      {/* Completed */}
      <CollapsibleGroup
        title="Completed"
        icon={CheckCircle}
        iconColor="#10B981"
        count={completedItems.length}
        defaultOpen={false}
      >
        {completedItems.map((item) => (
          <DeckCard
            key={item.deck_id}
            item={item}
            variant="completed"
            onStart={handleStart}
          />
        ))}
      </CollapsibleGroup>
    </motion.div>
  );
}
