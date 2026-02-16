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
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/api-client";
import type { Worksheet, WorksheetExtractedQuestion } from "@/types";
import FileImportModal, {
  type ImportedFlashcard,
} from "@/components/parent/FileImportModal";

export default function ReviewQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation("parent");
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [questions, setQuestions] = useState<WorksheetExtractedQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
        toast.error(t("worksheetReview.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchWorksheet();
  }, [id, t]);

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

  const handleBulkImport = (
    imported: ImportedFlashcard[] | WorksheetExtractedQuestion[]
  ) => {
    const typedQuestions = imported as WorksheetExtractedQuestion[];
    setQuestions((prev) => {
      const startNumber = prev.length + 1;
      const numbered = typedQuestions.map((q, i) => ({
        ...q,
        id: Date.now() + i,
        number: startNumber + i,
      }));
      return [...prev, ...numbered];
    });
    setHasUnsavedChanges(true);
    setShowImportModal(false);
    toast.success(t("worksheetReview.questionsImported", { count: typedQuestions.length }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/worksheets/${id}`, {
        extracted_questions: questions,
      });
    },
    onSuccess: () => {
      toast.success(t("worksheetReview.changesSaved"));
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error(t("worksheetReview.saveError"));
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
        t("worksheetReview.approvedSuccess", { count: data.questions_created || questions.length })
      );
      router.push("/parent/dashboard");
    },
    onError: () => {
      toast.error(t("worksheetReview.approveError"));
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("worksheetReview.loadingQuestions")}</p>
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
                {t("worksheetReview.worksheets")}
              </button>
              <h1
                className="text-2xl font-black text-gray-800"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("worksheetReview.title")}
              </h1>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
{t("worksheetReview.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t("worksheetReview.save")}
                </button>
              )}
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
                {t("worksheetReview.approveAll")}
              </motion.button>
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
                {t("worksheetReview.questions")}
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
                {t("worksheetReview.aiConfidence")}
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
                {t("worksheetReview.autoVerified")}
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
                {t("worksheetReview.needsReview")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add / Import buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setShowAddQuestion(true)}
            className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("worksheetReview.addQuestion")}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="py-3 px-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {t("worksheetReview.importFile")}
          </button>
        </div>

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
                          {t("worksheetReview.needsReview")}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {t("worksheetReview.verified")}
                        </span>
                      )}
                      {question.confidence < 90 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          {t("worksheetReview.confidence")}: {question.confidence}%
                        </span>
                      )}
                    </div>

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
                                ? "bg-green-50 border-green-400"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              option === question.correct_answer
                                ? "text-green-800"
                                : "text-gray-700"
                            }`}>
                              {String.fromCharCode(65 + idx)}) {option}
                              {option === question.correct_answer && " ✓"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill-in-the-blank */}
                    {question.type === "fill-blank" && (
                      <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
                        <p className="text-sm font-bold text-green-900">
                          {t("worksheetReview.correctAnswerText", { answer: question.correct_answer })}
                        </p>
                      </div>
                    )}

                    {/* True/False */}
                    {question.type === "true-false" && (
                      <div className="flex gap-2">
                        <div
                          className={`px-4 py-2 rounded-lg border-2 ${
                            question.correct_answer === "True"
                              ? "bg-green-50 border-green-400"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className={`text-sm font-medium ${
                            question.correct_answer === "True" ? "text-green-800" : "text-gray-700"
                          }`}>
                            True{" "}
                            {question.correct_answer === "True" && "✓"}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg border-2 ${
                            question.correct_answer === "False"
                              ? "bg-green-50 border-green-400"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className={`text-sm font-medium ${
                            question.correct_answer === "False" ? "text-green-800" : "text-gray-700"
                          }`}>
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
                            {t("worksheetReview.similarExercises", { count: question.similar_exercises.length })}
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
                ? t("worksheetReview.approving")
                : t("worksheetReview.approveCount", { count: questions.length })}
            </motion.button>
          </motion.div>
        )}

        {/* Empty state */}
        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {t("worksheetReview.noQuestions")}
            </p>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="text-purple-600 font-semibold hover:text-purple-700"
            >
              {t("worksheetReview.addManually")}
            </button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <FileImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importType="worksheet_questions"
        onImport={handleBulkImport}
      />
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
  const { t } = useTranslation("parent");
  const [text, setText] = useState(question.text);
  const [type, setType] = useState(question.type);
  const [options, setOptions] = useState(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer || "");
  const [explanation, setExplanation] = useState(question.explanation || "");
  const [xpValue, setXpValue] = useState(question.xp_value ?? 10);
  const [imageUrl, setImageUrl] = useState(question.image_url || "");
  const [imageBlobId, setImageBlobId] = useState(question.image_blob_id || "");
  const [imageUploading, setImageUploading] = useState(false);

  // Get correct answer index for MCQ
  const correctIdx = type === "mcq" ? options.findIndex(opt => opt === correctAnswer) : -1;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">
        {t("worksheetReview.editQuestionNumber", { number: question.number || index + 1 })}
      </h4>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("worksheetReview.questionTextLabel")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={2}
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("worksheetReview.questionImage")}
        </label>
        {imageUrl ? (
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt=""
              className="max-h-48 rounded-lg border border-gray-200 object-contain"
            />
            <button
              type="button"
              onClick={() => { setImageUrl(""); setImageBlobId(""); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-gray-50 transition w-fit">
            {imageUploading ? (
              <Loader2 size={16} className="animate-spin text-indigo-500" />
            ) : (
              <ImageIcon size={16} className="text-gray-400" />
            )}
            <span className="text-sm text-gray-500">
              {imageUploading ? t("worksheetReview.uploading") : t("worksheetReview.uploadImage")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageUploading(true);
                try {
                  const { url, blob_id } = await uploadImage(file);
                  setImageUrl(url);
                  setImageBlobId(blob_id);
                } catch {
                  toast.error(t("worksheetReview.uploadFailed"));
                }
                setImageUploading(false);
              }}
            />
          </label>
        )}
      </div>

      {/* MCQ Options */}
      {type === "mcq" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("worksheetReview.optionsLabel")}
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(options[i])}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    correctIdx === i
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {correctIdx === i && <Check size={14} />}
                </button>
                <span className="text-sm font-medium text-gray-500 w-6">
                  {String.fromCharCode(65 + i)}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const wasCorrect = correctIdx === i;
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                    if (wasCorrect) setCorrectAnswer(e.target.value);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* True/False Options */}
      {type === "true-false" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("worksheetReview.correctAnswerLabel")}
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

      {/* Fill-in-the-blank Answer */}
      {type === "fill-blank" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("worksheetReview.correctAnswerLabel")}
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Explanation & XP Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("worksheetReview.explanation")}
          </label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder={t("worksheetReview.explanationPlaceholder")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("worksheetReview.xpValue")}
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={xpValue}
            onChange={(e) => setXpValue(Number(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Buttons at bottom */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() =>
            onSave({
              text,
              type,
              options,
              correct_answer: correctAnswer,
              explanation: explanation || undefined,
              xp_value: xpValue,
              image_url: imageUrl || undefined,
              image_blob_id: imageBlobId || undefined,
              needs_review: false,
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          <Check size={16} />
          {t("worksheetReview.save")}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          {t("worksheetReview.cancel")}
        </button>
      </div>
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
  const { t } = useTranslation("parent");
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
        <h3 className="font-bold text-gray-800">{t("worksheetReview.addNewQuestion")}</h3>
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
            {t("worksheetReview.questionType")}
          </label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as typeof type;
              setType(newType);
              setCorrectAnswer("");
              if (newType === "mcq") setOptions(["", "", "", ""]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="mcq">{t("worksheetReview.multipleChoice")}</option>
            <option value="true-false">{t("worksheetReview.trueFalse")}</option>
            <option value="fill-blank">{t("worksheetReview.fillBlank")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("worksheetReview.questionTextLabel")}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("worksheetReview.enterQuestion")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        {type === "mcq" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("worksheetReview.optionsCircleLabel")}
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
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "true-false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("worksheetReview.correctAnswerLabel")}
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
              {t("worksheetReview.correctAnswerLabel")}
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={t("worksheetReview.enterCorrectAnswer")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          {t("worksheetReview.addQuestion")}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          {t("worksheetReview.cancel")}
        </button>
      </div>
    </motion.div>
  );
}
