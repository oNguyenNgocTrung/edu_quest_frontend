"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Question, LearningSession, SubmitAnswerResponse } from "@/types";
import { X, Heart, Star, ArrowRight, Trophy, Lightbulb, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mascot } from "@/components/Mascot";

const LETTER_PREFIX = ["A", "B", "C", "D", "E", "F"];

export default function SessionPage() {
  const { t } = useTranslation('child');
  const { sessionId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();

  const [sessionOverride, setSessionOverride] = useState<LearningSession | null>(null);
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<SubmitAnswerResponse | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const isCreatingRef = useRef(false);

  // Create a new session from deckId or skillNodeId
  useEffect(() => {
    if (sessionId !== "new" || isCreatingRef.current || !currentChildProfile) return;
    const deckId = searchParams.get("deckId");
    const skillNodeId = searchParams.get("skillNodeId");
    if (!deckId && !skillNodeId) return;

    isCreatingRef.current = true;
    const payload: Record<string, string> = {};
    if (deckId) payload.deck_id = deckId;
    if (skillNodeId) payload.skill_node_id = skillNodeId;

    apiClient
      .post("/learning_sessions", payload)
      .then(({ data }) => {
        const newSession = data.session.attributes as LearningSession;
        const newQuestions = data.questions.map(
          (q: { attributes: Question }) => q.attributes
        ) as Question[];
        setSessionOverride(newSession);
        setQuestionsData(newQuestions);
        router.replace(`/child/session/${newSession.id}`);
      })
      .catch(() => {
        router.push("/child/home");
      });
  }, [sessionId, searchParams, currentChildProfile, router]);

  // Fetch existing session (for resuming)
  const { data: sessionData } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/learning_sessions/${sessionId}`);
      return data;
    },
    enabled: !!currentChildProfile && sessionId !== "new" && !sessionOverride,
  });

  const session = useMemo(() => {
    if (sessionOverride) return sessionOverride;
    if (sessionData) return sessionData.data.attributes as LearningSession;
    return null;
  }, [sessionOverride, sessionData]);

  const questions = useMemo(() => {
    if (questionsData.length > 0) return questionsData;
    if (sessionData?.questions) {
      return sessionData.questions.map(
        (q: { attributes: Question }) => q.attributes
      ) as Question[];
    }
    return [] as Question[];
  }, [questionsData, sessionData]);

  // Extract answered question IDs from fetched session data (for resume)
  const answeredQuestionIds = useMemo(() => {
    const ids = new Set<string>();
    if (!sessionData?.data?.relationships?.session_answers?.data) return ids;
    const answerRefs = sessionData.data.relationships.session_answers.data as { id: string }[];
    const included = (sessionData.included || []) as { id: string; type: string; attributes: { question_id: string } }[];
    for (const item of included) {
      if (item.type === "session_answer" && answerRefs.some((a) => a.id === item.id)) {
        ids.add(item.attributes.question_id);
      }
    }
    return ids;
  }, [sessionData]);

  // Determine the starting question index for resumed sessions
  const resumeIndex = useMemo(() => {
    if (answeredQuestionIds.size === 0 || questions.length === 0) return 0;
    const idx = questions.findIndex((q) => !answeredQuestionIds.has(q.id));
    return idx === -1 ? questions.length : idx; // all answered → past the end
  }, [answeredQuestionIds, questions]);

  // Check if a fetched session is already finished
  const isSessionAlreadyDone = useMemo(() => {
    if (!sessionData) return false;
    const status = (sessionData.data.attributes as LearningSession).status;
    if (status === "completed" || status === "failed") return true;
    // All questions answered but session still in_progress
    if (answeredQuestionIds.size > 0 && questions.length > 0 && resumeIndex >= questions.length) return true;
    return false;
  }, [sessionData, answeredQuestionIds, questions, resumeIndex]);

  // Effective question index: when resuming, start from the first unanswered question
  const effectiveIndex = Math.max(currentIndex, resumeIndex);

  const submitAnswer = useMutation({
    mutationFn: async ({
      questionId,
      selectedIndex,
      answerText,
    }: {
      questionId: string;
      selectedIndex?: number;
      answerText?: string;
    }) => {
      const { data } = await apiClient.post(
        `/learning_sessions/${session?.id}/submit_answer`,
        {
          question_id: questionId,
          selected_option_index: selectedIndex,
          answer_text: answerText,
        }
      );
      return data as SubmitAnswerResponse;
    },
    onSuccess: (data) => {
      setFeedback(data);
      if (data.is_correct) {
        setEarnedXP((prev) => prev + data.xp_earned);
        setLastXPGain(data.xp_earned);
        setShowXPPopup(true);
        setTimeout(() => setShowXPPopup(false), 1500);
      }
      setSessionOverride((prev) => {
        const base = prev ?? session;
        return base
          ? {
              ...base,
              lives_remaining: data.lives_remaining,
              status: data.session_status as LearningSession["status"],
              correct_count: data.is_correct
                ? base.correct_count + 1
                : base.correct_count,
            }
          : null;
      });
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
      setSessionOverride(data.session.attributes);
      setShowCompletion(true);
    },
  });

  const handleSelectAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
  }, []);

  const handleSubmit = () => {
    if (!session) return;
    const question = questions[effectiveIndex];

    if (question.question_type === "fill_blank") {
      if (!fillBlankAnswer.trim()) return;
      submitAnswer.mutate({
        questionId: question.id,
        answerText: fillBlankAnswer,
      });
    } else {
      if (selectedAnswer === null) return;
      submitAnswer.mutate({
        questionId: question.id,
        selectedIndex: selectedAnswer,
      });
    }
  };

  const handleSkip = () => {
    if (!session) return;
    const question = questions[effectiveIndex];
    // Skip = submit wrong answer, costs a life
    if (question.question_type === "fill_blank") {
      submitAnswer.mutate({
        questionId: question.id,
        answerText: "__skipped__",
      });
    } else {
      // Send an impossible index
      const wrongIndex = question.options.findIndex(
        (_, i) => i !== question.correct_answer_index
      );
      submitAnswer.mutate({
        questionId: question.id,
        selectedIndex: wrongIndex >= 0 ? wrongIndex : 0,
      });
    }
  };

  const handleNext = () => {
    if (!session) return;
    if (session.lives_remaining <= 0 || effectiveIndex >= questions.length - 1) {
      completeSession.mutate();
    } else {
      setCurrentIndex(effectiveIndex + 1);
      setSelectedAnswer(null);
      setFillBlankAnswer("");
      setFeedback(null);
      setShowHint(false);
    }
  };

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-pink-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (showCompletion || isSessionAlreadyDone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Mascot mood="celebrating" size="lg" showSpeechBubble={false} />
          </motion.div>

          <h2 className="text-3xl font-black text-gray-800 mt-6 mb-2">
            {session.status === "completed" ? t('session.awesomeJob') : t('session.gameOver')}
          </h2>
          <p className="text-gray-600 mb-6">{t('session.completedLesson')}</p>

          {/* Stars */}
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

          {/* XP Panel */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-4xl font-black text-purple-600">
                +{earnedXP}
              </span>
              <span className="text-gray-600">XP</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div>
                {t('session.correctCount', { correct: session.correct_count, total: session.total_questions })}
              </div>
              <div>-</div>
              <div>{t('session.livesLeft', { lives: session.lives_remaining })}</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/child/home")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg"
          >
            {t('session.continue')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const question = questions[effectiveIndex];
  const progress = ((effectiveIndex + 1) / questions.length) * 100;
  const isWorksheetSession = questions.some((q) => q.is_ai_generated !== undefined);

  const canSubmit =
    question.question_type === "fill_blank"
      ? fillBlankAnswer.trim().length > 0
      : selectedAnswer !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
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

            {/* Source badge */}
            {isWorksheetSession && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                {question.is_ai_generated ? t('session.practiceProblem') : t('session.fromWorksheet')}
              </span>
            )}

            <div className="flex items-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < session.lives_remaining
                      ? "text-red-500 fill-red-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {t('session.questionOf', { current: effectiveIndex + 1, total: questions.length })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mascot Helper */}
            <div className="flex items-start gap-4 mb-8">
              <Mascot
                mood={
                  feedback
                    ? feedback.is_correct
                      ? "celebrating"
                      : "waving"
                    : "waving"
                }
                size="md"
                showSpeechBubble={false}
              />
              <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-md">
                <p className="text-gray-700">
                  {feedback
                    ? feedback.is_correct
                      ? t('session.correct')
                      : t('session.incorrect')
                    : question.question_type === "fill_blank"
                      ? t('session.fillBlankHint')
                      : t('session.thinkItThrough')}
                </p>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
              {question.image_url && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={question.image_url}
                    alt={t('session.questionImage')}
                    className="max-h-64 rounded-2xl border-2 border-gray-100 object-contain"
                  />
                </div>
              )}
              <h2 className="text-2xl font-black text-gray-800 text-center mb-8">
                {question.question_text}
              </h2>

              {/* Answer area based on question type */}
              {question.question_type === "fill_blank" ? (
                /* Fill in the blank */
                <div>
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !feedback && canSubmit) {
                        handleSubmit();
                      }
                    }}
                    disabled={!!feedback}
                    placeholder={t('session.typeAnswer')}
                    className={`w-full p-5 rounded-2xl font-bold text-lg text-center transition-all border-2 outline-none ${
                      feedback
                        ? feedback.is_correct
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-red-50 border-red-500 text-red-700"
                        : "bg-gray-50 border-purple-300 focus:border-purple-500 text-gray-800"
                    }`}
                  />
                  {feedback && !feedback.is_correct && feedback.correct_answer && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mt-3 text-sm text-gray-600"
                    >
                      {t('session.correctAnswer')}{" "}
                      <span className="font-bold text-green-600">{feedback.correct_answer}</span>
                    </motion.p>
                  )}
                </div>
              ) : question.question_type === "true_false" ? (
                /* True / False */
                <div className="grid grid-cols-2 gap-4">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectAnswer =
                      feedback && index === feedback.correct_answer_index;
                    const isWrongSelected =
                      feedback && isSelected && !feedback.is_correct;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => !feedback && handleSelectAnswer(index)}
                        disabled={!!feedback}
                        whileHover={!feedback ? { scale: 1.05 } : {}}
                        whileTap={!feedback ? { scale: 0.95 } : {}}
                        className={`p-6 rounded-2xl font-black text-xl transition-all ${
                          isCorrectAnswer
                            ? "bg-green-500 text-white shadow-lg"
                            : isWrongSelected
                              ? "bg-red-500 text-white shadow-lg"
                              : isSelected
                                ? "bg-purple-100 border-2 border-purple-500 text-purple-700"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">{option === "True" ? "✓" : "✗"}</span>
                          <span>{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* MCQ (default) */
                (() => {
                  const allShort = question.options.every((o) => o.length <= 20);
                  const useGrid = allShort && (question.options.length === 2 || question.options.length === 4);

                  return (
                    <div className={useGrid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                      {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectAnswer =
                          feedback && index === feedback.correct_answer_index;
                        const isWrongSelected =
                          feedback && isSelected && !feedback.is_correct;

                        return (
                          <motion.button
                            key={index}
                            onClick={() => !feedback && handleSelectAnswer(index)}
                            disabled={!!feedback}
                            whileHover={!feedback ? { scale: 1.02 } : {}}
                            whileTap={!feedback ? { scale: 0.98 } : {}}
                            className={`w-full ${useGrid ? "p-4" : "p-5"} rounded-2xl font-bold text-lg transition-all ${
                              isCorrectAnswer
                                ? "bg-green-500 text-white shadow-lg"
                                : isWrongSelected
                                  ? "bg-red-500 text-white shadow-lg"
                                  : isSelected
                                    ? "bg-purple-100 border-2 border-purple-500 text-purple-700"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-transparent"
                            }`}
                          >
                            <div className={`flex items-center ${useGrid ? "justify-center gap-2" : "justify-between"}`}>
                              <div className={`flex items-center ${useGrid ? "gap-2" : "gap-3"}`}>
                                <span
                                  className={`${useGrid ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm"} rounded-full flex items-center justify-center font-bold ${
                                    isCorrectAnswer
                                      ? "bg-white/30 text-white"
                                      : isWrongSelected
                                        ? "bg-white/30 text-white"
                                        : isSelected
                                          ? "bg-purple-500 text-white"
                                          : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {LETTER_PREFIX[index]}
                                </span>
                                <span>{option}</span>
                              </div>
                              {!useGrid && isCorrectAnswer && <span className="text-2xl">✓</span>}
                              {!useGrid && isWrongSelected && <span className="text-2xl">✗</span>}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Hint Panel */}
            <AnimatePresence>
              {showHint && question.explanation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">{t('session.hint')}</span>
                    </div>
                    <p className="text-sm text-amber-700">{question.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback with explanation */}
            {feedback && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`mb-4 p-4 rounded-xl ${
                  feedback.is_correct
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{feedback.is_correct ? "✅" : "❌"}</span>
                  <span className={`font-bold ${feedback.is_correct ? "text-green-700" : "text-red-700"}`}>
                    {feedback.is_correct ? t('session.correctLabel') : t('session.incorrectLabel')}
                  </span>
                </div>
                {!feedback.is_correct && feedback.correct_answer && question.question_type !== "fill_blank" && (
                  <p className="text-sm text-gray-600 mb-1">
                    Correct answer: <span className="font-bold text-green-600">{feedback.correct_answer}</span>
                  </p>
                )}
                {feedback.explanation && (
                  <p className="text-sm text-gray-600">{feedback.explanation}</p>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <div>
              {!feedback ? (
                <div className="flex gap-3">
                  {/* Skip button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSkip}
                    disabled={submitAnswer.isPending}
                    className="px-6 py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-300 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <SkipForward size={18} />
                    {t('session.skip')}
                  </motion.button>

                  {/* Hint button */}
                  {question.explanation && !showHint && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHint(true)}
                      className="px-6 py-4 bg-amber-100 text-amber-700 rounded-2xl font-bold hover:bg-amber-200 transition flex items-center gap-2"
                    >
                      <Lightbulb size={18} />
                      {t('session.hint')}
                    </motion.button>
                  )}

                  {/* Submit button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!canSubmit || submitAnswer.isPending}
                    onClick={handleSubmit}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    {submitAnswer.isPending ? t('session.checking') : t('session.checkAnswer')}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  {session.lives_remaining <= 0 ||
                  effectiveIndex >= questions.length - 1
                    ? t('session.seeResults')
                    : t('session.nextQuestion')}
                  <ArrowRight size={18} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* XP Popup */}
      <AnimatePresence>
        {showXPPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-3xl shadow-2xl z-50"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <span className="text-3xl font-black">+{lastXPGain} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
