"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Flashcard } from "@/types";
import { X, Flame, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "again" | "hard" | "good" | "easy";

const difficultyConfig: {
  key: Difficulty;
  color: string;
  label: string;
  time: string;
}[] = [
  { key: "again", color: "bg-red-500 hover:bg-red-600", label: "Again", time: "<1m" },
  { key: "hard", color: "bg-orange-500 hover:bg-orange-600", label: "Hard", time: "10m" },
  { key: "good", color: "bg-green-500 hover:bg-green-600", label: "Good", time: "1d" },
  { key: "easy", color: "bg-blue-500 hover:bg-blue-600", label: "Easy", time: "4d" },
];

export default function FlashcardReviewPage() {
  const { deckId } = useParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [reviewed, setReviewed] = useState(0);

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decks/${deckId}/flashcards`);
      return data.data.map(
        (item: { attributes: Flashcard }) => item.attributes
      ) as Flashcard[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      flashcardId,
      difficulty,
    }: {
      flashcardId: string;
      difficulty: Difficulty;
    }) => {
      await apiClient.post("/card_reviews", {
        flashcard_id: flashcardId,
        difficulty_rating: difficulty,
      });
    },
  });

  const handleRate = useCallback(
    (difficulty: Difficulty) => {
      if (!flashcards) return;
      const card = flashcards[currentIndex];

      reviewMutation.mutate({ flashcardId: card.id, difficulty });

      if (difficulty === "good" || difficulty === "easy") {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      setReviewed((r) => r + 1);
      setShowAnswer(false);

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCurrentIndex(flashcards.length);
      }
    },
    [flashcards, currentIndex, reviewMutation]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-blue-50 p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No flashcards in this deck</p>
          <button
            onClick={() => router.back()}
            className="text-teal-600 font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (currentIndex >= flashcards.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-blue-50 p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Review Complete!
          </h2>
          <p className="text-gray-500 mb-6">
            You reviewed {reviewed} cards with a best streak of {streak}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/child/home")}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-2xl font-bold shadow-lg"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const cardsRemaining = flashcards.length - currentIndex;
  const progress = (currentIndex / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push("/child/home")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-orange-700 text-sm">
                  {streak}x
                </span>
              </div>
              <span className="text-sm font-bold text-gray-600">
                {cardsRemaining} cards left
              </span>
            </div>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !showAnswer && setShowAnswer(true)}
            >
              {!showAnswer ? (
                <div className="text-center">
                  <div className="mb-6">
                    <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                      Question
                    </p>
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 mb-8">
                    {card.front_text}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAnswer(true);
                    }}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg"
                  >
                    Show Answer
                  </motion.button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✓</span>
                    </div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                      Answer
                    </p>
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 mb-12">
                    {card.back_text}
                  </h2>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Rating Buttons */}
      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-sm text-gray-600 mb-3">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {difficultyConfig.map((d) => (
                <motion.button
                  key={d.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRate(d.key)}
                  className={`${d.color} text-white font-bold py-4 px-3 rounded-xl`}
                >
                  <div className="text-xs mb-1">{d.label}</div>
                  <div className="text-lg">{d.time}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
