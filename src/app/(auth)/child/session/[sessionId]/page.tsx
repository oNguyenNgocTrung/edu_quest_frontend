"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Question, LearningSession, SubmitAnswerResponse } from "@/types";
import { Heart, Star, ArrowRight, Trophy, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();

  const [session, setSession] = useState<LearningSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<SubmitAnswerResponse | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Create session if sessionId is a skill_node_id (start new session)
  const { data: sessionData } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      // Try to create a new session using this as a skill node ID
      // We need to find a deck for this node. For now, use the first available quiz deck.
      const { data } = await apiClient.get("/decks");
      const quizDeck = data.data.find(
        (d: { attributes: { deck_type: string } }) =>
          d.attributes.deck_type === "quiz"
      );
      if (!quizDeck) throw new Error("No quiz deck found");

      const response = await apiClient.post("/learning_sessions", {
        deck_id: quizDeck.attributes.id,
        skill_node_id: sessionId,
      });
      return response.data;
    },
    enabled: !!currentChildProfile,
  });

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData.session.attributes);
      setQuestions(
        sessionData.questions.map(
          (q: { attributes: Question }) => q.attributes
        )
      );
    }
  }, [sessionData]);

  const submitAnswer = useMutation({
    mutationFn: async ({
      questionId,
      selectedIndex,
    }: {
      questionId: string;
      selectedIndex: number;
    }) => {
      const { data } = await apiClient.post(
        `/learning_sessions/${session?.id}/submit_answer`,
        {
          question_id: questionId,
          selected_option_index: selectedIndex,
        }
      );
      return data as SubmitAnswerResponse;
    },
    onSuccess: (data) => {
      setFeedback(data);
      if (data.is_correct) {
        setEarnedXP((prev) => prev + data.xp_earned);
      }
      setSession((prev) =>
        prev
          ? {
              ...prev,
              lives_remaining: data.lives_remaining,
              correct_count: data.is_correct
                ? prev.correct_count + 1
                : prev.correct_count,
            }
          : null
      );
    },
  });

  const completeSession = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(
        `/learning_sessions/${session?.id}/complete`
      );
      return data;
    },
    onSuccess: (data) => {
      setSession(data.session.attributes);
      setShowCompletion(true);
    },
  });

  const handleSelectAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
  }, []);

  const handleSubmit = () => {
    if (selectedAnswer === null || !session) return;
    const question = questions[currentIndex];
    submitAnswer.mutate({
      questionId: question.id,
      selectedIndex: selectedAnswer,
    });
  };

  const handleNext = () => {
    if (!session) return;
    if (session.lives_remaining <= 0 || currentIndex >= questions.length - 1) {
      completeSession.mutate();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    }
  };

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">
            {session.stars_earned >= 3
              ? "🏆"
              : session.stars_earned >= 1
              ? "⭐"
              : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {session.status === "completed" ? "Quest Complete!" : "Game Over"}
          </h2>
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={32}
                className={
                  i < session.stars_earned
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                }
              />
            ))}
          </div>
          <div className="space-y-2 mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-indigo-600">
                +{earnedXP} XP
              </span>{" "}
              earned
            </p>
            <p className="text-gray-600">
              {session.correct_count}/{session.total_questions} correct
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/child/home")}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Progress bar + lives */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={20}
                className={
                  i < session.lives_remaining
                    ? "fill-red-500 text-red-500"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
        </div>

        {/* XP counter */}
        <div className="text-right mb-4">
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-semibold">
            <Trophy size={14} />
            {earnedXP} XP
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white rounded-2xl p-6 shadow-md mb-6"
          >
            <p className="text-xs text-gray-400 mb-2">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-bold text-gray-800">
              {question.question_text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            let className =
              "w-full p-4 rounded-xl border-2 text-left font-medium transition ";
            if (feedback) {
              if (index === feedback.correct_answer_index) {
                className += "border-green-500 bg-green-50 text-green-700";
              } else if (
                index === selectedAnswer &&
                !feedback.is_correct
              ) {
                className += "border-red-500 bg-red-50 text-red-700";
              } else {
                className += "border-gray-100 bg-gray-50 text-gray-400";
              }
            } else if (index === selectedAnswer) {
              className += "border-indigo-500 bg-indigo-50 text-indigo-700";
            } else {
              className +=
                "border-gray-100 bg-white text-gray-700 hover:border-indigo-200";
            }

            return (
              <button
                key={index}
                disabled={!!feedback}
                onClick={() => handleSelectAnswer(index)}
                className={className}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mt-4 p-4 rounded-xl ${
              feedback.is_correct
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-semibold ${
                feedback.is_correct ? "text-green-700" : "text-red-700"
              }`}
            >
              {feedback.is_correct ? "Correct! 🎉" : "Not quite! 😅"}
            </p>
            {feedback.explanation && (
              <p className="text-sm text-gray-600 mt-1">
                {feedback.explanation}
              </p>
            )}
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="mt-6">
          {!feedback ? (
            <button
              disabled={selectedAnswer === null || submitAnswer.isPending}
              onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitAnswer.isPending ? "Checking..." : "Submit Answer"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {session.lives_remaining <= 0 ||
              currentIndex >= questions.length - 1
                ? "See Results"
                : "Next Question"}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
