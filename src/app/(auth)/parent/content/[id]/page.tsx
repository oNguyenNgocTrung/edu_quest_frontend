"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import type { Deck, Flashcard, Question, WorksheetExtractedQuestion } from "@/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  BookOpen,
  HelpCircle,
  Check,
  Edit3,
  GripVertical,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import FileImportModal, {
  type ImportedFlashcard,
} from "@/components/parent/FileImportModal";

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation("parent");
  const queryClient = useQueryClient();

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newCard, setNewCard] = useState({ front_text: "", back_text: "" });
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer_index: 0,
    explanation: "",
    xp_value: 10,
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<WorksheetExtractedQuestion[]>([]);
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(null);

  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ["deck", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decks/${id}`);
      return { ...data.data.attributes, id: data.data.id } as Deck;
    },
  });

  const { data: flashcards } = useQuery({
    queryKey: ["deck", id, "flashcards"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decks/${id}/flashcards`);
      return data.data.map(
        (item: { id: string; attributes: Omit<Flashcard, "id"> }) => ({
          ...item.attributes,
          id: item.id,
        })
      ) as Flashcard[];
    },
    enabled: deck?.deck_type === "flashcards",
  });

  const { data: questions } = useQuery({
    queryKey: ["deck", id, "questions"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decks/${id}/questions`);
      return data.data.map(
        (item: { id: string; attributes: Omit<Question, "id"> }) => ({
          ...item.attributes,
          id: item.id,
        })
      ) as Question[];
    },
    enabled: deck?.deck_type === "quiz" || deck?.deck_type === "exam",
  });

  const createFlashcard = useMutation({
    mutationFn: async (params: typeof newCard) => {
      const { data } = await apiClient.post(`/decks/${id}/flashcards`, params);
      return data;
    },
    onSuccess: () => {
      toast.success(t("contentDetail.flashcardAdded"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowAddCard(false);
      setNewCard({ front_text: "", back_text: "" });
    },
  });

  const updateFlashcard = useMutation({
    mutationFn: async ({
      cardId,
      params,
    }: {
      cardId: string;
      params: Partial<Flashcard>;
    }) => {
      const { data } = await apiClient.patch(
        `/decks/${id}/flashcards/${cardId}`,
        params
      );
      return data;
    },
    onSuccess: () => {
      toast.success(t("contentDetail.flashcardUpdated"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "flashcards"] });
      setEditingCard(null);
    },
  });

  const deleteFlashcard = useMutation({
    mutationFn: async (cardId: string) => {
      await apiClient.delete(`/decks/${id}/flashcards/${cardId}`);
    },
    onSuccess: () => {
      toast.success(t("contentDetail.flashcardDeleted"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const createQuestion = useMutation({
    mutationFn: async (params: typeof newQuestion) => {
      const { data } = await apiClient.post(`/decks/${id}/questions`, params);
      return data;
    },
    onSuccess: () => {
      toast.success(t("contentDetail.questionAdded"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowAddQuestion(false);
      setNewQuestion({
        question_text: "",
        options: ["", "", "", ""],
        correct_answer_index: 0,
        explanation: "",
        xp_value: 10,
      });
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({
      questionId,
      params,
    }: {
      questionId: string;
      params: Partial<Question>;
    }) => {
      const { data } = await apiClient.patch(
        `/decks/${id}/questions/${questionId}`,
        params
      );
      return data;
    },
    onSuccess: () => {
      toast.success(t("contentDetail.questionUpdated"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      setEditingQuestion(null);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      await apiClient.delete(`/decks/${id}/questions/${questionId}`);
    },
    onSuccess: () => {
      toast.success(t("contentDetail.questionDeleted"));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const batchFlashcards = useMutation({
    mutationFn: async (flashcards: ImportedFlashcard[]) => {
      const { data } = await apiClient.post(`/decks/${id}/flashcards/batch`, {
        flashcards,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      toast.success(t("contentDetail.importedFlashcards", { count: variables.length }));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowImportModal(false);
    },
    onError: () => {
      toast.error(t("contentDetail.importFlashcardsFailed"));
    },
  });

  const confirmImport = useMutation({
    mutationFn: async (qs: WorksheetExtractedQuestion[]) => {
      const converted = qs.map((q) => {
        const base = {
          explanation: q.explanation || undefined,
          xp_value: q.xp_value || 10,
        };
        if (q.type === "true-false") {
          return {
            ...base,
            question_text: q.text,
            question_type: "true_false",
            options: ["True", "False"],
            correct_answer_index: q.correct_answer === "True" ? 0 : 1,
          };
        }
        if (q.type === "fill-blank") {
          return {
            ...base,
            question_text: q.text,
            question_type: "fill_blank",
            options: [q.correct_answer],
            correct_answer_index: 0,
          };
        }
        return {
          ...base,
          question_text: q.text,
          question_type: "mcq",
          options: q.options,
          correct_answer_index: Math.max(q.options.indexOf(q.correct_answer), 0),
        };
      });
      const { data } = await apiClient.post(`/decks/${id}/questions/batch`, {
        questions: converted,
      });
      return data;
    },
    onSuccess: () => {
      toast.success(t("contentDetail.importedQuestions", { count: reviewQuestions.length }));
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setReviewQuestions([]);
      setEditingReviewIndex(null);
    },
    onError: () => {
      toast.error(t("contentDetail.importQuestionsFailed"));
    },
  });

  const handleImport = (
    data: ImportedFlashcard[] | WorksheetExtractedQuestion[]
  ) => {
    if (deck?.deck_type === "flashcards") {
      batchFlashcards.mutate(data as ImportedFlashcard[]);
    } else {
      setReviewQuestions(data as WorksheetExtractedQuestion[]);
      setShowImportModal(false);
    }
  };

  if (deckLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t("contentDetail.deckNotFound")}</p>
          <button
            onClick={() => router.push("/parent/content")}
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            {t("contentDetail.backToContent")}
          </button>
        </div>
      </div>
    );
  }

  const isFlashcardDeck = deck.deck_type === "flashcards";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/parent/content")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            {t("contentDetail.backToContent")}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isFlashcardDeck
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {isFlashcardDeck ? (
                  <BookOpen size={24} />
                ) : (
                  <HelpCircle size={24} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {deck.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 capitalize">
                    {deck.deck_type}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500 capitalize">
                    {deck.difficulty}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {isFlashcardDeck
                      ? t("content.cardsCount", { count: deck.flashcards_count })
                      : t("content.questionsCount", { count: deck.questions_count })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Add / Import buttons */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              isFlashcardDeck ? setShowAddCard(true) : setShowAddQuestion(true)
            }
            className="flex-1 bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {isFlashcardDeck ? t("contentDetail.addFlashcard") : t("contentDetail.addQuestion")}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2 px-6"
          >
            <Upload size={20} />
            {t("contentDetail.importFile")}
          </button>
        </div>

        {/* Review imported questions */}
        {reviewQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-indigo-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {t("contentDetail.reviewImportedQuestions")}
              </h3>
              <button
                onClick={() => {
                  setReviewQuestions([]);
                  setEditingReviewIndex(null);
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X size={14} />
                {t("contentDetail.cancelImport")}
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {reviewQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {editingReviewIndex === index ? (
                    <ReviewEditForm
                      question={q}
                      index={index}
                      onSave={(updates) => {
                        setReviewQuestions((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, ...updates } : item
                          )
                        );
                        setEditingReviewIndex(null);
                      }}
                      onCancel={() => setEditingReviewIndex(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Q{index + 1}
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded capitalize">
                            {q.type.replace("-", " ")}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2">{q.text}</p>

                        {q.type === "mcq" && q.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                  opt === q.correct_answer
                                    ? "bg-green-50 text-green-700 border border-green-200 font-medium"
                                    : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                                {opt === q.correct_answer && (
                                  <Check size={12} className="inline ml-1 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "true-false" && (
                          <div className="flex gap-2">
                            {["True", "False"].map((val) => (
                              <div
                                key={val}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                  q.correct_answer === val
                                    ? "bg-green-50 text-green-700 border border-green-200 font-medium"
                                    : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}
                              >
                                {val}
                                {q.correct_answer === val && (
                                  <Check size={12} className="inline ml-1 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "fill-blank" && (
                          <div className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium inline-block">
                            {q.correct_answer}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            {q.explanation}
                          </p>
                        )}

                        {q.xp_value && (
                          <span className="text-xs text-gray-400 mt-1 inline-block">
                            {q.xp_value} XP
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button
                          onClick={() => setEditingReviewIndex(index)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setReviewQuestions((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => confirmImport.mutate(reviewQuestions)}
                disabled={confirmImport.isPending || reviewQuestions.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {confirmImport.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {t("contentDetail.confirmImport", { count: reviewQuestions.length })}
              </button>
              <button
                onClick={() => {
                  setReviewQuestions([]);
                  setEditingReviewIndex(null);
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                {t("contentDetail.cancelImport")}
              </button>
            </div>
          </motion.div>
        )}

        {/* Add flashcard form */}
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              {t("contentDetail.newFlashcard")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("contentDetail.frontQuestion")}
                </label>
                <textarea
                  value={newCard.front_text}
                  onChange={(e) =>
                    setNewCard((c) => ({ ...c, front_text: e.target.value }))
                  }
                  placeholder={t("contentDetail.enterQuestion")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("contentDetail.backAnswer")}
                </label>
                <textarea
                  value={newCard.back_text}
                  onChange={(e) =>
                    setNewCard((c) => ({ ...c, back_text: e.target.value }))
                  }
                  placeholder={t("contentDetail.enterAnswer")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => createFlashcard.mutate(newCard)}
                disabled={
                  !newCard.front_text ||
                  !newCard.back_text ||
                  createFlashcard.isPending
                }
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
              >
                <Save size={16} />
                {t("contentDetail.saveCard")}
              </button>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setNewCard({ front_text: "", back_text: "" });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                {t("contentDetail.cancel")}
              </button>
            </div>
          </motion.div>
        )}

        {/* Add question form */}
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 mb-4">{t("contentDetail.newQuestion")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("contentDetail.questionText")}
                </label>
                <textarea
                  value={newQuestion.question_text}
                  onChange={(e) =>
                    setNewQuestion((q) => ({
                      ...q,
                      question_text: e.target.value,
                    }))
                  }
                  placeholder={t("contentDetail.enterQuestion")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("contentDetail.answerOptions")}
                </label>
                <div className="space-y-2">
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setNewQuestion((q) => ({
                            ...q,
                            correct_answer_index: i,
                          }))
                        }
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          newQuestion.correct_answer_index === i
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {newQuestion.correct_answer_index === i && (
                          <Check size={14} />
                        )}
                      </button>
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQuestion.options];
                          opts[i] = e.target.value;
                          setNewQuestion((q) => ({ ...q, options: opts }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t("contentDetail.markCorrect")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("contentDetail.explanationOptional")}
                </label>
                <input
                  type="text"
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion((q) => ({
                      ...q,
                      explanation: e.target.value,
                    }))
                  }
                  placeholder={t("contentDetail.explanationPlaceholder")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => createQuestion.mutate(newQuestion)}
                disabled={
                  !newQuestion.question_text ||
                  newQuestion.options.filter((o) => o.trim()).length < 2 ||
                  createQuestion.isPending
                }
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
              >
                <Save size={16} />
                {t("contentDetail.saveQuestion")}
              </button>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestion({
                    question_text: "",
                    options: ["", "", "", ""],
                    correct_answer_index: 0,
                    explanation: "",
                    xp_value: 10,
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                {t("contentDetail.cancel")}
              </button>
            </div>
          </motion.div>
        )}

        {/* Flashcards list */}
        {isFlashcardDeck && (
          <div className="space-y-3">
            {flashcards?.map((card, index) => (
              <FlashcardItem
                key={card.id}
                card={card}
                index={index}
                isEditing={editingCard === card.id}
                onEdit={() => setEditingCard(card.id)}
                onCancelEdit={() => setEditingCard(null)}
                onSave={(params) =>
                  updateFlashcard.mutate({ cardId: card.id, params })
                }
                onDelete={() => deleteFlashcard.mutate(card.id)}
                isSaving={updateFlashcard.isPending}
              />
            ))}
            {flashcards?.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("contentDetail.noFlashcards")}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t("contentDetail.addFlashcardHint")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Questions list */}
        {!isFlashcardDeck && (
          <div className="space-y-3">
            {questions?.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                isEditing={editingQuestion === question.id}
                onEdit={() => setEditingQuestion(question.id)}
                onCancelEdit={() => setEditingQuestion(null)}
                onSave={(params) =>
                  updateQuestion.mutate({
                    questionId: question.id,
                    params,
                  })
                }
                onDelete={() => deleteQuestion.mutate(question.id)}
                isSaving={updateQuestion.isPending}
              />
            ))}
            {questions?.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("contentDetail.noQuestions")}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t("contentDetail.addQuestionHint")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Modal */}
      <FileImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importType={isFlashcardDeck ? "flashcards" : "worksheet_questions"}
        onImport={handleImport}
        isSubmitting={batchFlashcards.isPending}
      />
    </div>
  );
}

function FlashcardItem({
  card,
  index,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isSaving,
}: {
  card: Flashcard;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (params: Partial<Flashcard>) => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  const { t } = useTranslation("parent");
  const [front, setFront] = useState(card.front_text);
  const [back, setBack] = useState(card.back_text);

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 shadow-sm border-2 border-indigo-200"
      >
        <h4 className="font-semibold text-gray-700 mb-4">
          {t("contentDetail.editCard", { number: index + 1 })}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contentDetail.frontQuestion")}
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contentDetail.backAnswer")}
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave({ front_text: front, back_text: back })}
            disabled={!front || !back || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            <Check size={16} />
            {t("contentDetail.save")}
          </button>
          <button
            onClick={() => {
              setFront(card.front_text);
              setBack(card.back_text);
              onCancelEdit();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            {t("contentDetail.cancel")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <GripVertical size={16} className="text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t("contentDetail.front")}
              </span>
              <p className="text-gray-800 mt-1">{card.front_text}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t("contentDetail.back")}
              </span>
              <p className="text-gray-800 mt-1">{card.back_text}</p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function QuestionItem({
  question,
  index,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isSaving,
}: {
  question: Question;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (params: Partial<Question>) => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  const { t } = useTranslation("parent");
  const [text, setText] = useState(question.question_text);
  const [options, setOptions] = useState(question.options || []);
  const [correctIdx, setCorrectIdx] = useState(
    question.correct_answer_index ?? 0
  );
  const [explanation, setExplanation] = useState(question.explanation || "");

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 shadow-sm border-2 border-indigo-200"
      >
        <h4 className="font-semibold text-gray-700 mb-4">
          {t("contentDetail.editQuestion", { number: index + 1 })}
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contentDetail.questionText")}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contentDetail.options")}
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrectIdx(i)}
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
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contentDetail.explanation")}
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() =>
              onSave({
                question_text: text,
                options,
                correct_answer_index: correctIdx,
                explanation,
              })
            }
            disabled={!text || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            <Check size={16} />
            {t("contentDetail.save")}
          </button>
          <button
            onClick={() => {
              setText(question.question_text);
              setOptions(question.options || []);
              setCorrectIdx(question.correct_answer_index ?? 0);
              setExplanation(question.explanation || "");
              onCancelEdit();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            {t("contentDetail.cancel")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <GripVertical size={16} className="text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">
              Q{index + 1}
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded capitalize">
              {question.question_type?.replace("_", " ") || "mcq"}
            </span>
            <span className="text-xs text-gray-400">
              {question.xp_value} XP
            </span>
          </div>
          <p className="text-gray-800 mb-3">{question.question_text}</p>
          <div className="grid grid-cols-2 gap-2">
            {question.options?.map((opt, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-lg text-sm ${
                  i === question.correct_answer_index
                    ? "bg-green-50 text-green-700 border border-green-200 font-medium"
                    : "bg-gray-50 text-gray-600 border border-gray-100"
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
                {i === question.correct_answer_index && (
                  <Check size={14} className="inline ml-1 text-green-500" />
                )}
              </div>
            ))}
          </div>
          {question.explanation && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {question.explanation}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewEditForm({
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          {t("contentDetail.editImportedQuestion", { number: index + 1 })}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onSave({ text, type, options, correct_answer: correctAnswer, explanation: explanation || undefined, xp_value: xpValue })
            }
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Check size={14} />
            {t("contentDetail.save")}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            <X size={14} />
            {t("contentDetail.cancel")}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("contentDetail.questionType")}
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
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="mcq">MCQ</option>
          <option value="true-false">True/False</option>
          <option value="fill-blank">Fill in the Blank</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("contentDetail.questionText")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={2}
        />
      </div>

      {type === "mcq" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("contentDetail.options")}
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(opt)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    correctAnswer === opt
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {correctAnswer === opt && <Check size={10} />}
                </button>
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
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "true-false" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("contentDetail.correctAnswer")}
          </label>
          <div className="flex gap-3">
            {["True", "False"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCorrectAnswer(val)}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
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
            {t("contentDetail.correctAnswer")}
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("contentDetail.explanationOptional")}
          </label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder={t("contentDetail.explanationPlaceholder")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("contentDetail.xpValue")}
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={xpValue}
            onChange={(e) => setXpValue(parseInt(e.target.value, 10) || 10)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
