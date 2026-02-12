"use client";

import { useState, useEffect, use, useCallback } from "react";
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
  Plus,
  Save,
  X,
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const toggleExpanded = (key: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateQuestion = useCallback(
    (index: number, updates: Partial<WorksheetExtractedQuestion>) => {
      setQuestions((prev) =>
        prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
      );
      setHasUnsavedChanges(true);
    },
    []
  );

  const addQuestion = (newQ: WorksheetExtractedQuestion) => {
    setQuestions((prev) => [...prev, newQ]);
    setHasUnsavedChanges(true);
    setShowAddQuestion(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/worksheets/${id}`, {
        extracted_questions: questions,
      });
    },
    onSuccess: () => {
      toast.success("Changes saved!");
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      // Save current questions first, then approve
      await apiClient.patch(`/worksheets/${id}`, {
        extracted_questions: questions,
      });
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

  const isApproved = worksheet?.status === "approved";

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
          questions.reduce((sum, q) => sum + (q.confidence || 0), 0) /
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
                onClick={() => router.push("/parent/worksheets")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 text-sm"
              >
                <ArrowLeft size={16} />
                Worksheets
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
                {isApproved
                  ? "This worksheet has been approved"
                  : "Verify AI-extracted questions before adding to practice"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && !isApproved && (
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
              {!isApproved && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => approveMutation.mutate()}
                  disabled={
                    approveMutation.isPending || questions.length === 0
                  }
                  className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Check className="w-5 h-5" />
                  Approve All
                </motion.button>
              )}
            </div>
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
                Questions
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

        {/* Add Question Button */}
        {!isApproved && (
          <button
            onClick={() => setShowAddQuestion(true)}
            className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        )}

        {/* Add Question Form */}
        {showAddQuestion && <AddQuestionForm
          nextNumber={questions.length + 1}
          onAdd={addQuestion}
          onCancel={() => setShowAddQuestion(false)}
        />}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.id ?? `q-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
                question.needs_review ? "border-amber-300" : "border-green-200"
              }`}
            >
              {editingIndex === index ? (
                <EditQuestionForm
                  question={question}
                  index={index}
                  onSave={(updates) => {
                    updateQuestion(index, updates);
                    setEditingIndex(null);
                  }}
                  onCancel={() => setEditingIndex(null)}
                />
              ) : (
                <>
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-lg font-bold text-gray-400"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        Q{question.number || index + 1}
                      </span>
                      {question.needs_review ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                      {question.confidence < 90 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          Confidence: {question.confidence}%
                        </span>
                      )}
                    </div>

                    {!isApproved && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingIndex(index)}
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
                          onClick={() => deleteQuestion(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="mb-4">
                    <p className="text-base font-semibold text-gray-800 mb-3">
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
                            <span className="text-sm font-medium">
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
                        <p className="text-sm font-semibold text-green-800">
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
                          <span className="text-sm font-medium">
                            True{" "}
                            {question.correct_answer === "True" && "✓"}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg border-2 ${
                            question.correct_answer === "False"
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            False{" "}
                            {question.correct_answer === "False" && "✓"}
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
                          onClick={() => toggleExpanded(`q-${index}`)}
                          className="w-full flex items-center justify-between hover:bg-purple-50 rounded-lg p-2 transition-colors"
                        >
                          <span className="text-sm font-semibold text-purple-600">
                            +{question.similar_exercises.length} similar
                            exercises generated by AI
                          </span>
                          {expandedQuestions.has(`q-${index}`) ? (
                            <ChevronUp className="w-4 h-4 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-600" />
                          )}
                        </button>

                        {expandedQuestions.has(`q-${index}`) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-3 space-y-2"
                          >
                            {question.similar_exercises.map(
                              (exercise, num) => (
                                <div
                                  key={num}
                                  className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                                >
                                  <p className="text-sm text-gray-700">
                                    {exercise.text}
                                  </p>
                                </div>
                              )
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        {questions.length > 0 && !isApproved && (
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
              No questions found in this worksheet.
            </p>
            {!isApproved && (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Add a question manually
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditQuestionForm({
  question,
  index,
  onSave,
  onCancel,
}: {
  question: WorksheetExtractedQuestion;
  index: number;
  onSave: (updates: Partial<WorksheetExtractedQuestion>) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question.text);
  const [type, setType] = useState(question.type);
  const [options, setOptions] = useState(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState(
    question.correct_answer || ""
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">
          Edit Question {question.number || index + 1}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onSave({
                text,
                type,
                options,
                correct_answer: correctAnswer,
                needs_review: false,
              })
            }
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Check size={14} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Type
        </label>
        <select
          value={type}
          onChange={(e) => {
            const newType = e.target.value as typeof type;
            setType(newType);
            if (newType === "true-false") {
              setOptions(["True", "False"]);
              setCorrectAnswer("True");
            } else if (newType === "fill-blank") {
              setOptions([]);
            } else if (newType === "mcq" && options.length < 2) {
              setOptions(["", "", "", ""]);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="fill-blank">Fill in the Blank</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {type === "mcq" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options (click to select correct answer)
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(opt)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    correctAnswer === opt
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {correctAnswer === opt && <Check size={12} />}
                </button>
                <span className="text-sm text-gray-500 w-6">
                  {String.fromCharCode(65 + i)}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const wasCorrect = correctAnswer === opt;
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                    if (wasCorrect) setCorrectAnswer(e.target.value);
                  }}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "true-false" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer
          </label>
          <div className="flex gap-3">
            {["True", "False"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCorrectAnswer(val)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  correctAnswer === val
                    ? val === "True"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {type === "fill-blank" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}

function AddQuestionForm({
  nextNumber,
  onAdd,
  onCancel,
}: {
  nextNumber: number;
  onAdd: (question: WorksheetExtractedQuestion) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"mcq" | "fill-blank" | "true-false">("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleAdd = () => {
    const newQ: WorksheetExtractedQuestion = {
      id: Date.now(),
      number: nextNumber,
      text,
      type,
      options: type === "mcq" ? options : type === "true-false" ? ["True", "False"] : [correctAnswer],
      correct_answer: correctAnswer,
      confidence: 100,
      needs_review: false,
      similar_exercises: [],
    };
    onAdd(newQ);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-md border-2 border-indigo-200 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Add New Question</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as typeof type;
              setType(newType);
              setCorrectAnswer("");
              if (newType === "mcq") setOptions(["", "", "", ""]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="mcq">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="fill-blank">Fill in the Blank</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        {type === "mcq" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options (click circle for correct answer)
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(opt)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      correctAnswer === opt && opt !== ""
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {correctAnswer === opt && opt !== "" && (
                      <Check size={12} />
                    )}
                  </button>
                  <span className="text-sm text-gray-500 w-6">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const wasCorrect = correctAnswer === opt;
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                      if (wasCorrect) setCorrectAnswer(e.target.value);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "true-false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div className="flex gap-3">
              {["True", "False"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCorrectAnswer(val)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    correctAnswer === val
                      ? val === "True"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === "fill-blank" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleAdd}
          disabled={!text || !correctAnswer}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Add Question
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
