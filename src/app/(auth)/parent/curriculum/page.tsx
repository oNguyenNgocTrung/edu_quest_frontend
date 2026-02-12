"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  CurriculumSubject,
  CurriculumSkillNode,
  AvailableDeck,
} from "@/types";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Trophy,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

const subjectIcons: Record<string, string> = {
  math: "🔢",
  science: "🔬",
  english: "📖",
  history: "🏛️",
  geography: "🌍",
  art: "🎨",
  music: "🎵",
  book: "📚",
};

function getSubjectIcon(iconName: string | null): string {
  if (!iconName) return "📚";
  return subjectIcons[iconName.toLowerCase()] || "📚";
}

export default function CurriculumPage() {
  const router = useRouter();
  const { t } = useTranslation("parent");
  const queryClient = useQueryClient();
  const { childProfiles } = useAuthStore();

  const [selectedChildId, setSelectedChildId] = useState<string>(
    childProfiles[0]?.id || ""
  );
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    null
  );
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNode, setNewNode] = useState({
    title: "",
    node_type: "lesson" as "lesson" | "boss",
    deck_id: "",
  });

  const selectedChild = childProfiles.find((c) => c.id === selectedChildId);

  // Fetch subjects with enrollment status
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["curriculum_subjects", selectedChildId],
    queryFn: async () => {
      const { data } = await apiClient.get("/curriculum/subjects", {
        params: { child_profile_id: selectedChildId },
      });
      return data as CurriculumSubject[];
    },
    enabled: !!selectedChildId,
  });

  // Fetch skill nodes for expanded subject
  const { data: skillNodes } = useQuery({
    queryKey: ["curriculum_skill_nodes", expandedSubjectId, selectedChildId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/curriculum/subjects/${expandedSubjectId}/skill_nodes`,
        { params: { child_profile_id: selectedChildId } }
      );
      return data as CurriculumSkillNode[];
    },
    enabled: !!expandedSubjectId,
  });

  // Fetch available decks (all user decks, optionally filtered by subject)
  const { data: availableDecks } = useQuery({
    queryKey: ["curriculum_decks", expandedSubjectId],
    queryFn: async () => {
      const { data } = await apiClient.get("/curriculum/available_decks");
      return data as AvailableDeck[];
    },
    enabled: !!expandedSubjectId,
  });

  // Decks matching this subject + decks with no subject
  const subjectDecks = availableDecks?.filter(
    (d) => !d.subject_id || d.subject_id === expandedSubjectId
  );

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async ({
      subjectId,
      enroll,
    }: {
      subjectId: string;
      enroll: boolean;
    }) => {
      if (enroll) {
        await apiClient.post(`/curriculum/subjects/${subjectId}/enroll`, {
          child_profile_id: selectedChildId,
        });
      } else {
        await apiClient.delete(`/curriculum/subjects/${subjectId}/unenroll`, {
          data: { child_profile_id: selectedChildId },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum_subjects", selectedChildId],
      });
      toast.success(t("curriculum.updated"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Assign deck mutation
  const assignDeckMutation = useMutation({
    mutationFn: async ({
      nodeId,
      deckId,
    }: {
      nodeId: string;
      deckId: string | null;
    }) => {
      await apiClient.patch(`/curriculum/skill_nodes/${nodeId}/assign_deck`, {
        deck_id: deckId,
      });
    },
    onSuccess: () => {
      toast.success(t("curriculum.deckAssigned"));
      queryClient.invalidateQueries({
        queryKey: [
          "curriculum_skill_nodes",
          expandedSubjectId,
          selectedChildId,
        ],
      });
    },
  });

  // Create custom skill node
  const createNodeMutation = useMutation({
    mutationFn: async (params: {
      title: string;
      node_type: string;
      deck_id?: string;
    }) => {
      await apiClient.post(
        `/curriculum/subjects/${expandedSubjectId}/skill_nodes`,
        params
      );
    },
    onSuccess: () => {
      toast.success(t("curriculum.nodeCreated"));
      queryClient.invalidateQueries({
        queryKey: [
          "curriculum_skill_nodes",
          expandedSubjectId,
          selectedChildId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["curriculum_subjects", selectedChildId],
      });
      setShowAddNode(false);
      setNewNode({ title: "", node_type: "lesson", deck_id: "" });
    },
  });

  // Delete custom skill node
  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      await apiClient.delete(`/curriculum/skill_nodes/${nodeId}`);
    },
    onSuccess: () => {
      toast.success(t("curriculum.nodeDeleted"));
      queryClient.invalidateQueries({
        queryKey: [
          "curriculum_skill_nodes",
          expandedSubjectId,
          selectedChildId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["curriculum_subjects", selectedChildId],
      });
    },
  });

  // Reorder skill nodes
  const reorderMutation = useMutation({
    mutationFn: async (nodeIds: string[]) => {
      await apiClient.patch("/curriculum/skill_nodes/reorder", {
        subject_id: expandedSubjectId,
        node_ids: nodeIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "curriculum_skill_nodes",
          expandedSubjectId,
          selectedChildId,
        ],
      });
    },
  });

  const moveNode = (index: number, direction: "up" | "down") => {
    if (!skillNodes) return;
    const newOrder = [...skillNodes];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
    reorderMutation.mutate(newOrder.map((n) => n.id));
  };

  const toggleExpand = (subjectId: string) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
    setShowAddNode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            {t("curriculum.dashboard")}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("curriculum.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("curriculum.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Child profile selector */}
        {childProfiles.length > 1 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("curriculum.selectChild")}
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value);
                setExpandedSubjectId(null);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              {childProfiles.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Single child display */}
        {childProfiles.length === 1 && selectedChild && (
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-2xl">
              {selectedChild.avatar === "fox"
                ? "🦊"
                : selectedChild.avatar === "owl"
                  ? "🦉"
                  : "🧒"}
            </span>
            <div>
              <p className="font-semibold text-gray-800">
                {selectedChild.name}
              </p>
              <p className="text-xs text-gray-500">
                {t("curriculum.managingFor", { name: selectedChild.name })}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {subjectsLoading && (
          <div className="text-center py-12 text-gray-400">
            {t("common.loading")}
          </div>
        )}

        {/* Subject cards */}
        {subjects?.map((subject) => {
          const isExpanded = expandedSubjectId === subject.id;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Subject header row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition"
                onClick={() => toggleExpand(subject.id)}
              >
                {/* Subject icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${subject.display_color}20` }}
                >
                  {getSubjectIcon(subject.icon_name)}
                </div>

                {/* Subject info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-[15px]">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {subject.skill_nodes_count}{" "}
                    {t("curriculum.lessons").toLowerCase()}
                    {subject.enrollment &&
                      ` · ${subject.enrollment.mastery_level}% ${t("curriculum.mastery")}`}
                  </p>
                  {subject.enrollment &&
                    subject.enrollment.mastery_level > 0 && (
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${subject.enrollment.mastery_level}%`,
                            backgroundColor:
                              subject.display_color || "#6366F1",
                          }}
                        />
                      </div>
                    )}
                </div>

                {/* Toggle switch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    enrollMutation.mutate({
                      subjectId: subject.id,
                      enroll: !subject.is_enrolled,
                    });
                  }}
                  disabled={enrollMutation.isPending}
                  className="flex-shrink-0 focus:outline-none"
                  aria-label={
                    subject.is_enrolled
                      ? t("curriculum.unenroll")
                      : t("curriculum.enroll")
                  }
                >
                  <div
                    className="relative rounded-full transition-colors duration-200"
                    style={{
                      width: 44,
                      height: 24,
                      backgroundColor: subject.is_enrolled
                        ? "#22C55E"
                        : "#D1D5DB",
                    }}
                  >
                    <div
                      className="absolute top-[2px] rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{
                        width: 20,
                        height: 20,
                        transform: subject.is_enrolled
                          ? "translateX(22px)"
                          : "translateX(2px)",
                      }}
                    />
                  </div>
                </button>

                {/* Expand chevron */}
                <div className="text-gray-400 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
              </div>

              {/* Expanded skill nodes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-4 py-3 space-y-1.5">
                      {skillNodes?.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">
                          {t("curriculum.noNodes")}
                        </p>
                      )}

                      {skillNodes?.map((node, idx) => (
                        <div
                          key={node.id}
                          className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100/80 transition group"
                        >
                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveNode(idx, "up")}
                              disabled={idx === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => moveNode(idx, "down")}
                              disabled={idx === skillNodes.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>

                          {/* Node icon */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              node.node_type === "boss"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-indigo-100 text-indigo-600"
                            }`}
                          >
                            {node.node_type === "boss" ? (
                              <Trophy size={14} />
                            ) : (
                              <BookOpen size={14} />
                            )}
                          </div>

                          {/* Node info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {node.title}
                              </span>
                              {node.is_custom && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full leading-tight flex-shrink-0">
                                  {t("curriculum.custom")}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {node.node_type === "boss"
                                ? t("curriculum.bossNode")
                                : t("curriculum.lessonNode")}
                              {node.best_stars !== undefined &&
                                node.best_stars > 0 &&
                                ` · ${"★".repeat(node.best_stars)}`}
                            </span>
                          </div>

                          {/* Deck selector */}
                          <select
                            value={node.deck_id || ""}
                            onChange={(e) =>
                              assignDeckMutation.mutate({
                                nodeId: node.id,
                                deckId: e.target.value || null,
                              })
                            }
                            disabled={assignDeckMutation.isPending}
                            className={`text-xs border rounded-lg px-2 py-1.5 bg-white max-w-[150px] truncate focus:ring-2 focus:ring-indigo-500 outline-none ${
                              node.deck_id
                                ? "border-indigo-200 text-indigo-700"
                                : "border-gray-200 text-gray-400"
                            }`}
                          >
                            <option value="">
                              {t("curriculum.noDeck")}
                            </option>
                            {subjectDecks?.map((deck) => (
                              <option key={deck.id} value={deck.id}>
                                {deck.name} ({deck.questions_count}q)
                              </option>
                            ))}
                          </select>

                          {/* Delete custom node */}
                          {node.is_custom && (
                            <button
                              onClick={() =>
                                deleteNodeMutation.mutate(node.id)
                              }
                              className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add lesson */}
                      {!showAddNode ? (
                        <button
                          onClick={() => setShowAddNode(true)}
                          className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-1.5 text-sm mt-1"
                        >
                          <Plus size={15} />
                          {t("curriculum.addLesson")}
                        </button>
                      ) : (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 space-y-2 mt-1">
                          <input
                            type="text"
                            placeholder={t("curriculum.lessonTitle")}
                            value={newNode.title}
                            onChange={(e) =>
                              setNewNode((n) => ({
                                ...n,
                                title: e.target.value,
                              }))
                            }
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                          />
                          <div className="flex gap-2">
                            <select
                              value={newNode.node_type}
                              onChange={(e) =>
                                setNewNode((n) => ({
                                  ...n,
                                  node_type: e.target.value as
                                    | "lesson"
                                    | "boss",
                                }))
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-900 bg-white"
                            >
                              <option value="lesson">
                                {t("curriculum.lessonNode")}
                              </option>
                              <option value="boss">
                                {t("curriculum.bossNode")}
                              </option>
                            </select>
                            <select
                              value={newNode.deck_id}
                              onChange={(e) =>
                                setNewNode((n) => ({
                                  ...n,
                                  deck_id: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-900 bg-white"
                            >
                              <option value="">
                                {t("curriculum.noDeck")}
                              </option>
                              {subjectDecks?.map((deck) => (
                                <option key={deck.id} value={deck.id}>
                                  {deck.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const params: {
                                  title: string;
                                  node_type: string;
                                  deck_id?: string;
                                } = {
                                  title: newNode.title,
                                  node_type: newNode.node_type,
                                };
                                if (newNode.deck_id)
                                  params.deck_id = newNode.deck_id;
                                createNodeMutation.mutate(params);
                              }}
                              disabled={
                                !newNode.title || createNodeMutation.isPending
                              }
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
                            >
                              {createNodeMutation.isPending
                                ? "..."
                                : t("curriculum.create")}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddNode(false);
                                setNewNode({
                                  title: "",
                                  node_type: "lesson",
                                  deck_id: "",
                                });
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                            >
                              {t("curriculum.cancel")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
