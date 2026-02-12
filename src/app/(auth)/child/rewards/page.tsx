"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Reward, RewardRedemption } from "@/types";
import { ArrowLeft, Coins, Sparkles, Clock, CheckCircle, XCircle, ShoppingBag, Package } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/child/BottomNav";

type Tab = "shop" | "myStuff";

export default function RewardShopPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentChildProfile } = useAuthStore();
  const { t } = useTranslation("child");
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [showConfetti, setShowConfetti] = useState(false);
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

  const { data: myRedemptions } = useQuery({
    queryKey: ["my_redemptions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reward_redemptions/mine");
      return data.data.map(
        (item: { attributes: RewardRedemption }) => item.attributes
      ) as RewardRedemption[];
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
      setShowConfetti(true);
      toast.success(t("rewards.redeemSuccess", { name: reward?.name }));
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["my_redemptions"] });
      setTimeout(() => {
        setShowConfetti(false);
        setRedeemedItem(null);
      }, 3000);
    },
    onError: () => {
      toast.error(t("rewards.redeemError"));
    },
  });

  const coins = currentChildProfile?.coins || 0;

  const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      bg: "bg-yellow-100 text-yellow-700",
      text: t("rewards.pending"),
    },
    approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: "bg-green-100 text-green-700",
      text: t("rewards.approved"),
    },
    denied: {
      icon: <XCircle className="w-4 h-4" />,
      bg: "bg-red-100 text-red-700",
      text: t("rewards.denied"),
    },
    claimed: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: "bg-blue-100 text-blue-700",
      text: t("rewards.claimed"),
    },
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-black text-gray-800">
                {t("rewards.title")}
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg">
              <Coins className="w-5 h-5 text-white" />
              <span className="font-black text-white text-lg">{coins}</span>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex mt-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "shop"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {t("rewards.shop")}
            </button>
            <button
              onClick={() => setActiveTab("myStuff")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "myStuff"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Package className="w-4 h-4" />
              {t("rewards.myStuff")}
              {myRedemptions && myRedemptions.length > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {myRedemptions.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "shop" ? (
          <>
            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 mb-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-black">
                  {t("rewards.spendCoins")}
                </h2>
              </div>
              <p className="text-white/90">{t("rewards.spendCoinsDesc")}</p>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {rewards?.map((reward, index) => {
                const canAfford = coins >= reward.cost_coins;
                const isLocked = !reward.is_active;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div
                      className={`bg-white rounded-2xl p-5 shadow-lg transition-all ${
                        isLocked ? "opacity-50" : ""
                      }`}
                    >
                      <div className="text-6xl mb-3 text-center">
                        {reward.icon}
                      </div>

                      <h3 className="font-bold text-gray-800 text-center mb-3 min-h-[40px] text-sm">
                        {reward.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                          <Coins className="w-4 h-4" />
                          <span>{reward.cost_coins}</span>
                        </div>

                        <motion.button
                          whileHover={
                            canAfford && !isLocked ? { scale: 1.05 } : {}
                          }
                          whileTap={
                            canAfford && !isLocked ? { scale: 0.95 } : {}
                          }
                          disabled={
                            !canAfford || isLocked || redeemMutation.isPending
                          }
                          onClick={() => redeemMutation.mutate(reward.id)}
                          className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${
                            isLocked
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : canAfford
                                ? "bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-md hover:shadow-lg"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isLocked
                            ? t("rewards.locked")
                            : canAfford
                              ? t("rewards.redeem")
                              : t("rewards.needMore")}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Earn More Coins Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-blue-100 rounded-2xl p-5"
            >
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t("rewards.earnMoreCoins")}
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  {t("rewards.dailyQuests")}{" "}
                  <span className="font-bold">
                    {t("rewards.dailyQuestsCoins")}
                  </span>
                </li>
                <li>
                  {t("rewards.perfectScore")}{" "}
                  <span className="font-bold">
                    {t("rewards.perfectScoreCoins")}
                  </span>
                </li>
                <li>
                  {t("rewards.sevenDayStreak")}{" "}
                  <span className="font-bold">
                    {t("rewards.sevenDayStreakCoins")}
                  </span>
                </li>
                <li>
                  {t("rewards.beatBoss")}{" "}
                  <span className="font-bold">
                    {t("rewards.beatBossCoins")}
                  </span>
                </li>
              </ul>
            </motion.div>
          </>
        ) : (
          /* My Stuff Tab */
          <div className="space-y-3">
            {myRedemptions && myRedemptions.length > 0 ? (
              myRedemptions.map((redemption, index) => {
                const config = statusConfig[redemption.status];
                return (
                  <motion.div
                    key={redemption.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                  >
                    <div className="text-4xl">{redemption.reward_icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">
                        {redemption.reward_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{redemption.reward_cost}</span>
                        <span>&middot;</span>
                        <span>{formatDate(redemption.created_at)}</span>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${config.bg}`}
                    >
                      {config.icon}
                      {config.text}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-gray-500 mb-4">
                  {t("rewards.noRedemptions")}
                </p>
                <button
                  onClick={() => setActiveTab("shop")}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                >
                  {t("rewards.goToShop")}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Confetti Celebration Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {t("rewards.redeemed")}
              </h2>
              <p className="text-gray-600">
                {t("rewards.youGot")}{" "}
                <span className="font-bold text-purple-600">
                  {redeemedItem}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("rewards.checkWithParent")}
              </p>
            </motion.div>

            {/* Confetti particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                }}
                animate={{
                  x:
                    Math.cos((i * 18 * Math.PI) / 180) *
                    (150 + ((i * 17) % 100)),
                  y:
                    Math.sin((i * 18 * Math.PI) / 180) *
                    (150 + ((i * 13) % 100)),
                  scale: 1,
                  rotate: (i * 47) % 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: ((i * 3) % 5) * 0.04,
                }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: [
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                    "#10b981",
                  ][i % 4],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
