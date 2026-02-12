"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import type { Reward, RewardRedemption } from "@/types";
import { ArrowLeft, Plus, Trash2, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ParentRewardsPage() {
  const router = useRouter();
  const { t } = useTranslation("parent");
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

  const { data: redemptions } = useQuery({
    queryKey: ["reward_redemptions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reward_redemptions");
      return data.data.map(
        (item: { attributes: RewardRedemption }) => item.attributes
      ) as RewardRedemption[];
    },
  });

  const createReward = useMutation({
    mutationFn: async (params: typeof newReward) => {
      await apiClient.post("/rewards", params);
    },
    onSuccess: () => {
      toast.success(t("rewards.rewardCreated"));
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
      toast.success(t("rewards.rewardRemoved"));
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/reward_redemptions/${id}/approve`);
    },
    onSuccess: () => {
      toast.success(t("rewards.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["reward_redemptions"] });
    },
  });

  const denyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/reward_redemptions/${id}/deny`);
    },
    onSuccess: () => {
      toast.success(t("rewards.denySuccess"));
      queryClient.invalidateQueries({ queryKey: ["reward_redemptions"] });
    },
  });

  const pendingRedemptions = redemptions?.filter((r) => r.status === "pending") || [];
  const nonPendingRedemptions = redemptions?.filter((r) => r.status !== "pending") || [];
  const activeRewardsCount = rewards?.filter((r) => r.is_active).length || 0;

  const emojiOptions = ["🎮", "🍦", "🌳", "🎬", "📚", "🎁", "🍕", "🦁", "⚽", "🎨"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/parent/dashboard")}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {t("rewards.title")}
                </h1>
                <p className="text-sm text-gray-500">
                  {t("rewards.subtitle")}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              {t("rewards.addReward")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            {pendingRedemptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("rewards.pendingRequests")}
                  </h2>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingRedemptions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{redemption.reward_icon}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {redemption.reward_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("rewards.requestedBy")}{" "}
                            <span className="font-semibold">
                              {redemption.child_name}
                            </span>{" "}
                            &middot; {new Date(redemption.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t("rewards.coins", { count: redemption.reward_cost })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate(redemption.id)}
                            disabled={approveMutation.isPending}
                            className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => denyMutation.mutate(redemption.id)}
                            disabled={denyMutation.isPending}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* All Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {t("rewards.allRewards")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards?.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-2 rounded-xl p-4 ${
                      reward.is_active
                        ? "border-gray-200 bg-white"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{reward.icon}</div>
                      <button
                        onClick={() => deleteReward.mutate(reward.id)}
                        className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </button>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-1">
                      {reward.name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {t("rewards.coins", { count: reward.cost_coins })}
                    </span>
                  </motion.div>
                ))}
              </div>

              {(!rewards || rewards.length === 0) && (
                <p className="text-gray-400 text-center py-8">
                  {t("rewards.noRewards")}
                </p>
              )}
            </motion.div>

            {/* Add Reward Form */}
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {t("rewards.addNewReward")}
                  </h3>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          setNewReward((r) => ({ ...r, icon: emoji }))
                        }
                        className={`text-2xl p-2 rounded-lg ${
                          newReward.icon === emoji
                            ? "bg-indigo-100 ring-2 ring-indigo-400"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rewards.rewardName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("rewards.rewardNamePlaceholder")}
                        value={newReward.name}
                        onChange={(e) =>
                          setNewReward((r) => ({ ...r, name: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rewards.cost")}
                      </label>
                      <input
                        type="number"
                        value={newReward.cost_coins}
                        onChange={(e) =>
                          setNewReward((r) => ({
                            ...r,
                            cost_coins: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreate(false)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                      {t("rewards.cancel")}
                    </button>
                    <button
                      onClick={() => createReward.mutate(newReward)}
                      disabled={!newReward.name || createReward.isPending}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {t("rewards.createReward")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4">
                {t("rewards.stats")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {t("rewards.activeRewards")}
                  </span>
                  <span className="font-bold text-gray-800">
                    {activeRewardsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {t("rewards.totalRedemptions")}
                  </span>
                  <span className="font-bold text-gray-800">
                    {redemptions?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {t("rewards.pendingRequests")}
                  </span>
                  <span className="font-bold text-orange-600">
                    {pendingRedemptions.length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4">
                {t("rewards.recentHistory")}
              </h3>
              <div className="space-y-3">
                {nonPendingRedemptions.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.reward_icon} {item.reward_name}
                      </p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t(`rewards.${item.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.child_name} &middot;{" "}
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
                {nonPendingRedemptions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center">
                    {t("rewards.noPendingRequests")}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
            >
              <h3 className="font-bold text-blue-900 mb-3">
                {t("rewards.tips")}
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>&bull; {t("rewards.tip1")}</li>
                <li>&bull; {t("rewards.tip2")}</li>
                <li>&bull; {t("rewards.tip3")}</li>
                <li>&bull; {t("rewards.tip4")}</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
