"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Deck } from "@/types";
import { ArrowLeft, Plus, BookOpen, HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ContentCreatorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"flashcards" | "quizzes">("flashcards");
  const [showCreate, setShowCreate] = useState(false);
  const [newDeck, setNewDeck] = useState({
    name: "",
    difficulty: "medium",
    deck_type: "flashcards" as "flashcards" | "quiz",
  });

  const { data: decks } = useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const { data } = await apiClient.get("/decks");
      return data.data.map(
        (item: { attributes: Deck }) => item.attributes
      ) as Deck[];
    },
  });

  const createDeck = useMutation({
    mutationFn: async (params: typeof newDeck) => {
      const { data } = await apiClient.post("/decks", params);
      return data;
    },
    onSuccess: () => {
      toast.success("Deck created!");
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowCreate(false);
      setNewDeck({ name: "", difficulty: "medium", deck_type: "flashcards" });
    },
  });

  const deleteDeck = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/decks/${id}`);
    },
    onSuccess: () => {
      toast.success("Deck deleted");
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const filteredDecks = decks?.filter((d) =>
    activeTab === "flashcards"
      ? d.deck_type === "flashcards"
      : d.deck_type === "quiz" || d.deck_type === "exam"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Content Creator</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "flashcards"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BookOpen size={16} className="inline mr-1" />
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "quizzes"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <HelpCircle size={16} className="inline mr-1" />
            Quizzes
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={() => {
            setNewDeck((d) => ({
              ...d,
              deck_type: activeTab === "flashcards" ? "flashcards" : "quiz",
            }));
            setShowCreate(true);
          }}
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Deck
        </button>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <input
              type="text"
              placeholder="Deck name"
              value={newDeck.name}
              onChange={(e) => setNewDeck((d) => ({ ...d, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newDeck.difficulty}
              onChange={(e) => setNewDeck((d) => ({ ...d, difficulty: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => createDeck.mutate(newDeck)}
                disabled={!newDeck.name || createDeck.isPending}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Decks list */}
        <div className="space-y-3">
          {filteredDecks?.map((deck) => (
            <div
              key={deck.id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{deck.name}</h3>
                <p className="text-sm text-gray-500">
                  {deck.deck_type === "flashcards"
                    ? `${deck.flashcards_count} cards`
                    : `${deck.questions_count} questions`}{" "}
                  · {deck.difficulty}
                </p>
              </div>
              <button
                onClick={() => deleteDeck.mutate(deck.id)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
