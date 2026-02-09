"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Subject, SkillNode } from "@/types";
import { ArrowLeft, Lock, Star, Swords, BookOpen } from "lucide-react";

export default function LearnPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/subjects/${subjectId}`);
      return {
        subject: data.subject.attributes as Subject,
        skillNodes: data.skill_nodes.map(
          (n: { attributes: SkillNode }) => n.attributes
        ) as SkillNode[],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data) return null;

  const { subject, skillNodes } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div
        className="px-4 py-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${subject.display_color}, ${subject.display_color}dd)`,
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold">{subject.name}</h1>
        <p className="text-white/80 text-sm mt-1">{subject.description}</p>
      </div>

      {/* Skill Tree */}
      <div className="max-w-lg mx-auto p-4">
        <div className="space-y-4">
          {skillNodes.map((node, index) => {
            const isLocked = node.unlocked === false;
            const stars = node.best_stars || 0;
            const isBoss = node.node_type === "boss";

            return (
              <div key={node.id} className="flex items-center gap-4">
                {/* Connector line */}
                <div className="flex flex-col items-center w-8">
                  {index > 0 && (
                    <div
                      className={`w-0.5 h-4 ${
                        isLocked ? "bg-gray-200" : "bg-indigo-300"
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLocked
                        ? "bg-gray-200 text-gray-400"
                        : isBoss
                        ? "bg-red-100 text-red-500"
                        : stars > 0
                        ? "bg-green-100 text-green-500"
                        : "bg-indigo-100 text-indigo-500"
                    }`}
                  >
                    {isLocked ? (
                      <Lock size={14} />
                    ) : isBoss ? (
                      <Swords size={14} />
                    ) : (
                      <BookOpen size={14} />
                    )}
                  </div>
                  {index < skillNodes.length - 1 && (
                    <div
                      className={`w-0.5 h-4 ${
                        isLocked ? "bg-gray-200" : "bg-indigo-300"
                      }`}
                    />
                  )}
                </div>

                {/* Node card */}
                <button
                  disabled={isLocked}
                  onClick={() => {
                    // For now just navigate; real version would start a session
                    if (!isLocked) {
                      router.push(`/child/session/${node.id}?subject=${subjectId}`);
                    }
                  }}
                  className={`flex-1 bg-white rounded-xl p-4 shadow-sm transition ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-semibold ${
                          isBoss ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {node.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        +{node.xp_reward} XP
                        {isBoss && " (Boss Level!)"}
                      </p>
                    </div>
                    {!isLocked && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: node.max_stars }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < stars
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
