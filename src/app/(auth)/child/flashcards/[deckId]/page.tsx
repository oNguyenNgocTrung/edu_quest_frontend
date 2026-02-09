"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Flashcard } from "@/types";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const difficultyColors = {
  again: "bg-red-500 hover:bg-red-600",
  hard: "bg-orange-500 hover:bg-orange-600",
  good: "bg-green-500 hover:bg-green-600",
  easy: "bg-blue-500 hover:bg-blue-600",
};

const difficultyLabels = {
  again: "<1m",
  hard: "10m",
  good: "1d",
  easy: "4d",
};

type Difficulty = "again" | "hard" | "good" | "easy";

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
        // All cards reviewed
        setCurrentIndex(flashcards.length);
      }
    },
    [flashcards, currentIndex, reviewMutation]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No flashcards in this deck</p>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 font-medium"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Review Complete!
          </h2>
          <p className="text-gray-500 mb-6">
            You reviewed {reviewed} cards with a best streak of {streak}
          </p>
          <button
            onClick={() => router.push("/child/home")}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <div className="flex items-center gap-1 text-orange-500">
            <span className="text-sm font-semibold">🔥 {streak}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${showAnswer}`}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => !showAnswer && setShowAnswer(true)}
            className={`bg-white rounded-2xl shadow-lg p-8 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer ${
              !showAnswer ? "hover:shadow-xl" : ""
            }`}
          >
            {!showAnswer ? (
              <>
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
                  Question
                </p>
                <p className="text-xl font-semibold text-gray-800">
                  {card.front_text}
                </p>
                <p className="text-sm text-gray-400 mt-6 flex items-center gap-1">
                  <RotateCcw size={14} /> Tap to reveal answer
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
                  Answer
                </p>
                <p className="text-xl font-semibold text-gray-800">
                  {card.back_text}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Difficulty buttons */}
        {showAnswer && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6"
          >
            <p className="text-center text-sm text-gray-500 mb-3">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(
                Object.entries(difficultyColors) as [Difficulty, string][]
              ).map(([key, colorClass]) => (
                <button
                  key={key}
                  onClick={() => handleRate(key)}
                  className={`${colorClass} text-white rounded-xl py-3 px-2 text-center transition`}
                >
                  <span className="block text-sm font-semibold capitalize">
                    {key}
                  </span>
                  <span className="block text-xs opacity-80">
                    {difficultyLabels[key]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
