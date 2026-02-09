"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Reward } from "@/types";
import { ArrowLeft, Coins, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RewardShopPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentChildProfile } = useAuthStore();
  const [redeemedItem, setRedeemedItem] = useState<string | null>(null);

  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data } = await apiClient.get("/rewards");
      return data.data.map(
        (item: { attributes: Reward }) => item.attributes
      ) as Reward[];
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { data } = await apiClient.post(`/rewards/${rewardId}/redeem`);
      return data;
    },
    onSuccess: (_, rewardId) => {
      const reward = rewards?.find((r) => r.id === rewardId);
      setRedeemedItem(reward?.name || "Reward");
      toast.success(`Redeemed: ${reward?.name}!`);
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => {
      toast.error("Not enough coins or reward unavailable");
    },
  });

  const coins = currentChildProfile?.coins || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-6 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag size={24} />
              Reward Shop
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Spend your hard-earned coins!
            </p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <Coins size={20} />
            <span className="text-xl font-bold">{coins}</span>
          </div>
        </div>
      </div>

      {/* Coin earning tips */}
      <div className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Earn More Coins</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-amber-500">🎯</span> Daily Quest: 50 coins
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-amber-500">⭐</span> Perfect Score: 30 coins
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-amber-500">🔥</span> 7-Day Streak: 100 coins
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-amber-500">⚔️</span> Beat Boss: 200 coins
            </div>
          </div>
        </div>

        {/* Rewards grid */}
        <h3 className="font-bold text-gray-800 mb-3">Available Rewards</h3>
        <div className="grid grid-cols-2 gap-3">
          {rewards?.map((reward) => {
            const canAfford = coins >= reward.cost_coins;
            return (
              <motion.div
                key={reward.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-white rounded-2xl p-4 shadow-sm ${
                  !reward.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="text-4xl text-center mb-2">{reward.icon}</div>
                <h4 className="font-semibold text-gray-800 text-sm text-center">
                  {reward.name}
                </h4>
                <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                  <Coins size={14} />
                  <span className="text-sm font-bold">{reward.cost_coins}</span>
                </div>
                <button
                  disabled={!canAfford || !reward.is_active || redeemMutation.isPending}
                  onClick={() => redeemMutation.mutate(reward.id)}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-semibold transition ${
                    canAfford && reward.is_active
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!reward.is_active
                    ? "Locked"
                    : canAfford
                    ? "Redeem"
                    : "Need more coins"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Redeemed toast feedback */}
        {redeemedItem && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-4 left-4 right-4 bg-green-500 text-white rounded-xl p-4 text-center font-semibold shadow-lg"
            onClick={() => setRedeemedItem(null)}
          >
            🎉 You redeemed: {redeemedItem}!
          </motion.div>
        )}
      </div>
    </div>
  );
}
