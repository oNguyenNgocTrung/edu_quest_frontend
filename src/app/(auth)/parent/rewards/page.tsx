"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Reward } from "@/types";
import { ArrowLeft, Plus, Gift, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ParentRewardsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    icon: "🎁",
    cost_coins: 100,
  });

  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data } = await apiClient.get("/rewards");
      return data.data.map(
        (item: { attributes: Reward }) => item.attributes
      ) as Reward[];
    },
  });

  const createReward = useMutation({
    mutationFn: async (params: typeof newReward) => {
      await apiClient.post("/rewards", params);
    },
    onSuccess: () => {
      toast.success("Reward created!");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      setShowCreate(false);
      setNewReward({ name: "", icon: "🎁", cost_coins: 100 });
    },
  });

  const deleteReward = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/rewards/${id}`);
    },
    onSuccess: () => {
      toast.success("Reward removed");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const emojiOptions = ["🎮", "🍦", "🌳", "🎬", "📚", "🎁", "🍕", "🦁", "⚽", "🎨"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
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
            <Gift className="text-amber-500" size={24} />
            Manage Rewards
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create rewards your child can redeem with coins
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:border-amber-300 hover:text-amber-500 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Reward
        </button>

        {showCreate && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex gap-2 flex-wrap">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewReward((r) => ({ ...r, icon: emoji }))}
                  className={`text-2xl p-2 rounded-lg ${
                    newReward.icon === emoji
                      ? "bg-amber-100 ring-2 ring-amber-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Reward name (e.g., Ice Cream Treat)"
              value={newReward.name}
              onChange={(e) =>
                setNewReward((r) => ({ ...r, name: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div>
              <label className="text-sm text-gray-500">Cost (coins)</label>
              <input
                type="number"
                value={newReward.cost_coins}
                onChange={(e) =>
                  setNewReward((r) => ({
                    ...r,
                    cost_coins: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => createReward.mutate(newReward)}
                disabled={!newReward.name || createReward.isPending}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Create Reward
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

        <div className="space-y-3">
          {rewards?.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
            >
              <span className="text-3xl">{reward.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                <p className="text-sm text-amber-600 font-medium">
                  {reward.cost_coins} coins
                </p>
              </div>
              <button
                onClick={() => deleteReward.mutate(reward.id)}
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
