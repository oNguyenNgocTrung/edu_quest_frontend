"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, Lock, Check, Sparkles, Star, Trophy } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMascotCustomization, usePurchaseItem, useEquipItem } from "@/hooks/use-mascot-customization";
import { Mascot } from "@/components/Mascot";
import { BottomNav } from "@/components/child/BottomNav";
import type { CustomizationCategory, MascotItem } from "@/types";

const CATEGORY_TABS: { id: CustomizationCategory; label: string; icon: string }[] = [
  { id: "colors", label: "Colors", icon: "🎨" },
  { id: "accessories", label: "Accessories", icon: "👒" },
  { id: "backgrounds", label: "Backgrounds", icon: "🖼️" },
  { id: "effects", label: "Effects", icon: "✨" },
];

const ITEM_EMOJIS: Record<string, string> = {
  // Colors
  purple: "🟣",
  blue: "🔵",
  green: "🟢",
  pink: "🌸",
  gold: "✨",
  rainbow: "🌈",
  // Accessories
  none: "👤",
  glasses: "🕶️",
  hat: "🎩",
  crown: "👑",
  bow: "🎀",
  wizard: "🧙",
  superhero: "🦸",
  // Backgrounds
  default: "⬜",
  stars: "🌟",
  forest: "🌲",
  ocean: "🌊",
  space: "🚀",
  // Effects
  sparkles: "✨",
  hearts: "💕",
  fire: "🔥",
  magic: "🪄",
};

function getBackgroundGradient(backgroundId: string): string {
  switch (backgroundId) {
    case "bg-stars":
      return "from-indigo-900 via-purple-900 to-pink-900";
    case "bg-forest":
      return "from-green-800 via-green-600 to-teal-500";
    case "bg-ocean":
      return "from-blue-600 via-cyan-500 to-teal-400";
    case "bg-space":
      return "from-gray-900 via-purple-900 to-black";
    case "bg-rainbow":
      return "from-red-400 via-yellow-400 to-pink-400";
    default:
      return "from-purple-100 to-pink-100";
  }
}

export default function CustomizePage() {
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<CustomizationCategory>("colors");

  const { data: customization, isLoading, error } = useMascotCustomization();
  const purchaseMutation = usePurchaseItem();
  const equipMutation = useEquipItem();

  useEffect(() => {
    if (!currentChildProfile) {
      router.push("/child/home");
    }
  }, [currentChildProfile, router]);

  if (!currentChildProfile) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading customizations...</p>
        </div>
      </div>
    );
  }

  if (error || !customization) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load customizations</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = customization.available_items.filter(
    (item) => item.category === selectedCategory
  );

  const coins = customization.coins;
  const level = customization.level;
  const equipped = customization.equipped;

  const handlePurchase = async (item: MascotItem) => {
    if (purchaseMutation.isPending) return;
    try {
      await purchaseMutation.mutateAsync(item.id);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const handleEquip = async (item: MascotItem) => {
    if (equipMutation.isPending) return;
    try {
      await equipMutation.mutateAsync(item.id);
    } catch (err) {
      console.error("Equip failed:", err);
    }
  };

  const getItemEmoji = (preview: string): string => {
    return ITEM_EMOJIS[preview] || "❓";
  };

  const isItemEquipped = (itemId: string): boolean => {
    return Object.values(equipped).includes(itemId);
  };

  const equippedAccessoryItem = customization.available_items.find(
    (item) => item.id === equipped.accessory
  );
  const equippedColorItem = customization.available_items.find(
    (item) => item.id === equipped.color
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black">Customize Mascot</h1>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="font-bold">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Mascot Preview */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-gradient-to-br ${getBackgroundGradient(equipped.background)} rounded-3xl p-8 mb-6 relative overflow-hidden shadow-xl`}
        >
          {/* Background effects for starry night */}
          {equipped.background === "bg-stars" && (
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${(i * 17) % 100}%`,
                    top: `${(i * 23) % 100}%`,
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          )}

          <div className="relative flex flex-col items-center">
            {/* Accessory badge */}
            {equipped.accessory !== "acc-none" && equippedAccessoryItem && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-4 text-5xl"
              >
                {getItemEmoji(equippedAccessoryItem.preview)}
              </motion.div>
            )}

            {/* Mascot */}
            <div className="relative">
              <Mascot mood="celebrating" size="lg" />

              {/* Effect overlay */}
              {equipped.effect !== "effect-none" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {equipped.effect === "effect-sparkles" && (
                    <>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl"
                          style={{
                            left: `${50 + Math.cos((i * Math.PI) / 4) * 60}%`,
                            top: `${50 + Math.sin((i * Math.PI) / 4) * 60}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </>
                  )}
                  {equipped.effect === "effect-hearts" && (
                    <>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-xl"
                          style={{ left: "50%", top: "50%" }}
                          animate={{
                            y: [-20, -80],
                            x: [0, (i - 3) * 20],
                            opacity: [1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        >
                          💕
                        </motion.div>
                      ))}
                    </>
                  )}
                  {equipped.effect === "effect-fire" && (
                    <motion.div
                      className="absolute bottom-0 text-4xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      🔥
                    </motion.div>
                  )}
                  {equipped.effect === "effect-stars" && (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${20 + i * 10}%`,
                          }}
                          animate={{
                            rotate: 360,
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        >
                          ⭐
                        </motion.div>
                      ))}
                    </>
                  )}
                  {equipped.effect === "effect-magic" && (
                    <motion.div
                      className="absolute text-4xl"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🪄
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Color indicator */}
            {equippedColorItem && (
              <div className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-2xl">{getItemEmoji(equippedColorItem.preview)}</span>
                <span className="text-sm font-bold text-white">{equippedColorItem.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORY_TABS.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item, index) => {
            const isLocked = !item.unlocked;
            const isEquippedItem = isItemEquipped(item.id);
            const canAfford = coins >= item.cost;
            const isPending = purchaseMutation.isPending || equipMutation.isPending;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: item.owned || item.cost === 0 ? 1.05 : 1 }}
                className={`relative bg-white rounded-2xl p-4 shadow-md ${
                  isLocked ? "opacity-50" : ""
                } ${isEquippedItem ? "ring-4 ring-purple-500" : ""}`}
              >
                {/* Equipped Badge */}
                {isEquippedItem && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Lock Badge */}
                {isLocked && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Item Preview */}
                <div className="text-5xl mb-3 text-center">{getItemEmoji(item.preview)}</div>

                {/* Item Name */}
                <h3 className="font-bold text-gray-800 text-center mb-2 text-sm">{item.name}</h3>

                {/* Action Button */}
                {item.owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    disabled={isEquippedItem || isPending}
                    className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                      isEquippedItem
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {isEquippedItem ? "Equipped" : "Equip"}
                  </button>
                ) : isLocked ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                      <Lock className="w-3 h-3" />
                      <span>Level {item.required_level}</span>
                    </div>
                  </div>
                ) : item.cost === 0 ? (
                  <button
                    onClick={() => handleEquip(item)}
                    disabled={isPending}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
                  >
                    Free
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || isPending}
                    className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                      canAfford
                        ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>{item.cost}</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Earn More Coins!</h3>
              <p className="text-sm text-purple-700">
                Complete lessons, maintain your streak, and achieve milestones to earn coins for
                more customizations. Level up to unlock exclusive items!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-800">Level {level}</span>
            </div>
            <p className="text-xs text-gray-500">Keep learning to unlock more!</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-gray-800">
                {customization.owned_items.length}/{customization.available_items.length}
              </span>
            </div>
            <p className="text-xs text-gray-500">Items collected</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
