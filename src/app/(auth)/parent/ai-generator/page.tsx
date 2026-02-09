"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { AiGenerationJob, GeneratedCard } from "@/types";
import { ArrowLeft, Sparkles, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIGeneratorPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [contentType, setContentType] = useState("Flashcards");
  const [subject, setSubject] = useState("Auto-detect");
  const [difficulty, setDifficulty] = useState("Auto-adjust");
  const [job, setJob] = useState<AiGenerationJob | null>(null);
  const [cards, setCards] = useState<GeneratedCard[]>([]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/ai_generation_jobs", {
        input_text: inputText,
        content_type: contentType,
        subject_name: subject,
        difficulty,
      });
      return data;
    },
    onSuccess: (data) => {
      setJob(data.data?.attributes || data);
      // Poll for completion
      pollJob(data.data?.attributes?.id || data.id);
    },
    onError: () => {
      toast.error("Failed to start generation");
    },
  });

  const pollJob = async (jobId: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const { data } = await apiClient.get(`/ai_generation_jobs/${jobId}`);
        const jobData = data.data?.attributes || data;
        setJob(jobData);
        if (jobData.status === "completed" && jobData.generated_cards) {
          setCards(jobData.generated_cards);
          return;
        }
        if (jobData.status === "failed") {
          toast.error(jobData.error_message || "Generation failed");
          return;
        }
      } catch {
        break;
      }
    }
  };

  const handleApprove = (cardId: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, approved: true } : c))
    );
  };

  const handleReject = (cardId: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, approved: false } : c))
    );
  };

  const approveAll = useMutation({
    mutationFn: async () => {
      if (!job) return;
      const approved = cards.filter((c) => c.approved === true);
      await apiClient.post(`/ai_generation_jobs/${job.id}/approve_cards`, {
        card_ids: approved.map((c) => c.id),
      });
    },
    onSuccess: () => {
      toast.success("Cards saved to deck!");
      setJob(null);
      setCards([]);
      setInputText("");
    },
  });

  const approvedCount = cards.filter((c) => c.approved === true).length;
  const isGenerating = generateMutation.isPending || job?.status === "processing" || job?.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={24} />
            AI Content Generator
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option>Flashcards</option>
                <option>Multiple Choice Quiz</option>
                <option>True/False Quiz</option>
                <option>Mixed Exam</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option>Auto-detect</option>
                <option>Math</option>
                <option>Science</option>
                <option>Language</option>
                <option>History</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option>Auto-adjust</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Paste your learning content
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder="Paste text from a textbook, article, or lesson notes. The AI will generate flashcards or quiz questions from it..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <button
            disabled={!inputText.trim() || isGenerating}
            onClick={() => generateMutation.mutate()}
            className="mt-3 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate with AI
              </>
            )}
          </button>
        </div>

        {/* Generated cards */}
        {cards.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                Generated Cards ({cards.length})
              </h3>
              <span className="text-sm text-green-600 font-medium">
                {approvedCount} approved
              </span>
            </div>

            {cards.map((card) => (
              <div
                key={card.id}
                className={`bg-white rounded-xl p-4 shadow-sm border-2 transition ${
                  card.approved === true
                    ? "border-green-300"
                    : card.approved === false
                    ? "border-red-200 opacity-50"
                    : "border-transparent"
                }`}
              >
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Front</p>
                  <p className="text-gray-800 font-medium">{card.front}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Back</p>
                  <p className="text-gray-600">{card.back}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(card.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition ${
                      card.approved === true
                        ? "bg-green-500 text-white"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(card.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition ${
                      card.approved === false
                        ? "bg-red-500 text-white"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {approvedCount > 0 && (
              <button
                onClick={() => approveAll.mutate()}
                disabled={approveAll.isPending}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Save {approvedCount} Approved Cards to Deck
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
