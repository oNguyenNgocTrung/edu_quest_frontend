"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import type { Deck, Flashcard, Question } from "@/types";
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
} from "lucide-react";
import { toast } from "sonner";

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
      toast.success("Flashcard added!");
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
      toast.success("Flashcard updated!");
      queryClient.invalidateQueries({ queryKey: ["deck", id, "flashcards"] });
      setEditingCard(null);
    },
  });

  const deleteFlashcard = useMutation({
    mutationFn: async (cardId: string) => {
      await apiClient.delete(`/decks/${id}/flashcards/${cardId}`);
    },
    onSuccess: () => {
      toast.success("Flashcard deleted");
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
      toast.success("Question added!");
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
      toast.success("Question updated!");
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      setEditingQuestion(null);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      await apiClient.delete(`/decks/${id}/questions/${questionId}`);
    },
    onSuccess: () => {
      toast.success("Question deleted");
      queryClient.invalidateQueries({ queryKey: ["deck", id, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

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
          <p className="text-gray-500 mb-4">Deck not found</p>
          <button
            onClick={() => router.push("/parent/content")}
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Back to Content
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
            Back to Content
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
                      ? `${deck.flashcards_count} cards`
                      : `${deck.questions_count} questions`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Add button */}
        <button
          onClick={() =>
            isFlashcardDeck ? setShowAddCard(true) : setShowAddQuestion(true)
          }
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add {isFlashcardDeck ? "Flashcard" : "Question"}
        </button>

        {/* Add flashcard form */}
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              New Flashcard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front (Question)
                </label>
                <textarea
                  value={newCard.front_text}
                  onChange={(e) =>
                    setNewCard((c) => ({ ...c, front_text: e.target.value }))
                  }
                  placeholder="Enter question..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back (Answer)
                </label>
                <textarea
                  value={newCard.back_text}
                  onChange={(e) =>
                    setNewCard((c) => ({ ...c, back_text: e.target.value }))
                  }
                  placeholder="Enter answer..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                Save Card
              </button>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setNewCard({ front_text: "", back_text: "" });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
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
            <h3 className="font-semibold text-gray-800 mb-4">New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={newQuestion.question_text}
                  onChange={(e) =>
                    setNewQuestion((q) => ({
                      ...q,
                      question_text: e.target.value,
                    }))
                  }
                  placeholder="Enter question..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
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
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Click the circle to mark the correct answer
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (optional)
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
                  placeholder="Why is this the correct answer?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
                Save Question
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
                Cancel
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
                <p className="text-gray-500">No flashcards yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click &quot;Add Flashcard&quot; to create your first card
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
                <p className="text-gray-500">No questions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click &quot;Add Question&quot; to create your first question
                </p>
              </div>
            )}
          </div>
        )}
      </div>
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
          Edit Card {index + 1}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front (Question)
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Back (Answer)
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
            Save
          </button>
          <button
            onClick={() => {
              setFront(card.front_text);
              setBack(card.back_text);
              onCancelEdit();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
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
                Front
              </span>
              <p className="text-gray-800 mt-1">{card.front_text}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Back
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
          Edit Question {index + 1}
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
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
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
            Save
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
            Cancel
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
