"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Check,
  AlertTriangle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import type { Worksheet, WorksheetExtractedQuestion } from "@/types";

export default function ReviewQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [questions, setQuestions] = useState<WorksheetExtractedQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorksheet = async () => {
      try {
        const { data } = await apiClient.get(`/worksheets/${id}`);
        const ws: Worksheet = data.data?.attributes || data;
        setWorksheet(ws);
        setQuestions(ws.extracted_questions || []);
      } catch {
        toast.error("Failed to load worksheet");
      } finally {
        setLoading(false);
      }
    };
    fetchWorksheet();
  }, [id]);

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const deleteQuestion = (questionId: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/worksheets/${id}/approve`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Approved! ${data.questions_created || questions.length} questions added to practice.`
      );
      router.push("/parent/dashboard");
    },
    onError: () => {
      toast.error("Failed to approve worksheet");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const verifiedCount = questions.filter((q) => !q.needs_review).length;
  const needsReviewCount = questions.filter((q) => q.needs_review).length;
  const overallConfidence =
    questions.length > 0
      ? Math.round(
          questions.reduce((sum, q) => sum + q.confidence, 0) /
            questions.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push("/parent/dashboard")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 text-sm"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
              <h1
                className="text-2xl font-black text-gray-800"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Review Questions
              </h1>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Verify AI-extracted questions before adding to practice
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || questions.length === 0}
              className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              <Check className="w-5 h-5" />
              Approve All
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-gray-800"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {worksheet?.title || "Worksheet"} —{" "}
              {worksheet?.chapter || "Review"}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {worksheet?.school_date
                  ? new Date(worksheet.school_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )
                  : new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p
                className="text-2xl font-black text-purple-600"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {questions.length}
              </p>
              <p
                className="text-xs text-purple-700 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Questions Extracted
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p
                className="text-2xl font-black text-green-600"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {overallConfidence}%
              </p>
              <p
                className="text-xs text-green-700 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AI Confidence
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p
                className="text-2xl font-black text-blue-600"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {verifiedCount}
              </p>
              <p
                className="text-xs text-blue-700 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Auto-Verified
              </p>
            </div>

            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p
                className="text-2xl font-black text-amber-600"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {needsReviewCount}
              </p>
              <p
                className="text-xs text-amber-700 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Needs Review
              </p>
            </div>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
                question.needs_review ? "border-amber-300" : "border-green-200"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg font-bold text-gray-400"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    Q{question.number}
                  </span>
                  {question.needs_review ? (
                    <span
                      className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Needs Review
                    </span>
                  ) : (
                    <span
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {question.confidence < 90 && (
                    <span
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Confidence: {question.confidence}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit question"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete question"
                    onClick={() => deleteQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-4">
                <p
                  className="text-base font-semibold text-gray-800 mb-3"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {question.text}
                </p>

                {/* MCQ Options */}
                {question.type === "mcq" && question.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          option === question.correct_answer
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {String.fromCharCode(65 + idx)}) {option}
                          {option === question.correct_answer && " ✓"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fill-in-the-blank */}
                {question.type === "fill-blank" && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p
                      className="text-sm font-semibold text-green-800"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Correct Answer: {question.correct_answer}
                    </p>
                  </div>
                )}

                {/* True/False */}
                {question.type === "true-false" && (
                  <div className="flex gap-2">
                    <div
                      className={`px-4 py-2 rounded-lg border-2 ${
                        question.correct_answer === "True"
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        True {question.correct_answer === "True" && "✓"}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg border-2 ${
                        question.correct_answer === "False"
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        False {question.correct_answer === "False" && "✓"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Similar Exercises Preview */}
              {question.similar_exercises &&
                question.similar_exercises.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleExpanded(String(question.id))}
                      className="w-full flex items-center justify-between hover:bg-purple-50 rounded-lg p-2 transition-colors"
                    >
                      <span
                        className="text-sm font-semibold text-purple-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        +{question.similar_exercises.length} similar exercises
                        generated by AI
                      </span>
                      {expandedQuestions.has(String(question.id)) ? (
                        <ChevronUp className="w-4 h-4 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-purple-600" />
                      )}
                    </button>

                    {expandedQuestions.has(String(question.id)) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-3 space-y-2"
                      >
                        {question.similar_exercises.map((exercise, num) => (
                          <div
                            key={num}
                            className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <p
                                className="text-sm text-gray-700"
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {exercise.text}
                              </p>
                              <div className="flex gap-1">
                                <button className="p-1 hover:bg-white rounded transition-colors">
                                  <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                                </button>
                                <button className="p-1 hover:bg-white rounded transition-colors">
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              <Check className="w-6 h-6" />
              {approveMutation.isPending
                ? "Approving..."
                : `Approve & Add to Practice (${questions.length} questions)`}
            </motion.button>
          </motion.div>
        )}

        {/* Empty state */}
        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No questions were extracted from this worksheet.
            </p>
            <button
              onClick={() => router.push("/parent/worksheets/upload")}
              className="text-purple-600 font-semibold hover:text-purple-700"
            >
              Try uploading again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
