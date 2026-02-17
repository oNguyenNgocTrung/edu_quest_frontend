"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { CoinRewardSetting } from "@/types";
import {
  ArrowLeft,
  Coins,
  Trophy,
  Target,
  Flame,
  Sword,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Users,
  Sliders,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  lessons: Target,
  quests: Trophy,
  streaks: Flame,
  bosses: Sword,
};

const categoryColors: Record<string, string> = {
  lessons: "bg-blue-100 text-blue-600",
  quests: "bg-purple-100 text-purple-600",
  streaks: "bg-orange-100 text-orange-600",
  bosses: "bg-red-100 text-red-600",
};

export default function CoinRewardsPage() {
  const router = useRouter();
  const { t } = useTranslation("parent");
  const queryClient = useQueryClient();
  const { childProfiles } = useAuthStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["lessons", "quests", "streaks", "bosses"])
  );
  const [editedSettings, setEditedSettings] = useState<
    Record<string, { coin_amount: number; enabled: boolean }>
  >({});
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childOverrides, setChildOverrides] = useState<{
    level_multiplier: number;
    action_overrides: Record<string, number>;
  }>({ level_multiplier: 1.0, action_overrides: {} });
  const [showChildSettings, setShowChildSettings] = useState(false);

  // Fetch coin reward settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["coin_reward_settings"],
    queryFn: async () => {
      const { data } = await apiClient.get("/coin_reward_settings");
      return data.data as CoinRewardSetting[];
    },
  });

  // Batch update mutation
  const updateSettings = useMutation({
    mutationFn: async (
      updates: Array<{ action_key: string; coin_amount: number; enabled: boolean }>
    ) => {
      await apiClient.patch("/coin_reward_settings/batch_update", {
        settings: updates,
      });
    },
    onSuccess: () => {
      toast.success(t("coinRewards.settingsSaved"));
      queryClient.invalidateQueries({ queryKey: ["coin_reward_settings"] });
      setEditedSettings({});
    },
    onError: () => {
      toast.error(t("coinRewards.saveError"));
    },
  });

  // Reset single setting mutation
  const resetSetting = useMutation({
    mutationFn: async (actionKey: string) => {
      await apiClient.delete(`/coin_reward_settings/${actionKey}`);
    },
    onSuccess: () => {
      toast.success(t("coinRewards.resetToDefault"));
      queryClient.invalidateQueries({ queryKey: ["coin_reward_settings"] });
    },
  });

  // Update child overrides mutation
  const updateChildOverrides = useMutation({
    mutationFn: async ({
      childId,
      overrides,
    }: {
      childId: string;
      overrides: { level_multiplier?: number; action_overrides?: Record<string, number> };
    }) => {
      await apiClient.patch(`/child_profiles/${childId}/coin_reward_overrides`, overrides);
    },
    onSuccess: () => {
      toast.success(t("coinRewards.childOverridesSaved"));
    },
    onError: () => {
      toast.error(t("coinRewards.saveError"));
    },
  });

  // Group settings by category
  const settingsByCategory = useMemo(() => {
    if (!settings) return {};
    return settings.reduce(
      (acc, setting) => {
        const category = setting.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(setting);
        return acc;
      },
      {} as Record<string, CoinRewardSetting[]>
    );
  }, [settings]);

  // Check if there are unsaved changes
  const hasChanges = Object.keys(editedSettings).length > 0;

  // Get current value for a setting (edited or original)
  const getCurrentValue = (setting: CoinRewardSetting) => {
    if (editedSettings[setting.action_key]) {
      return editedSettings[setting.action_key];
    }
    return { coin_amount: setting.coin_amount, enabled: setting.enabled };
  };

  // Handle value change
  const handleValueChange = (
    actionKey: string,
    field: "coin_amount" | "enabled",
    value: number | boolean
  ) => {
    const setting = settings?.find((s) => s.action_key === actionKey);
    if (!setting) return;

    const current = getCurrentValue(setting);
    setEditedSettings((prev) => ({
      ...prev,
      [actionKey]: {
        ...current,
        [field]: value,
      },
    }));
  };

  // Save all changes
  const handleSave = () => {
    const updates = Object.entries(editedSettings).map(([action_key, values]) => ({
      action_key,
      ...values,
    }));
    updateSettings.mutate(updates);
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Load child overrides when child is selected
  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    const child = childProfiles.find((p) => p.id === childId);
    if (child) {
      // Reset to default values when switching children
      // The resolved values are computed on the server based on settings + overrides
      setChildOverrides({
        level_multiplier: 1.0,
        action_overrides: {},
      });
    }
  };

  // Save child overrides
  const handleSaveChildOverrides = () => {
    if (!selectedChildId) return;
    updateChildOverrides.mutate({
      childId: selectedChildId,
      overrides: childOverrides,
    });
  };

  const categoryOrder = ["lessons", "quests", "streaks", "bosses"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                  {t("coinRewards.title")}
                </h1>
                <p className="text-sm text-gray-500">{t("coinRewards.subtitle")}</p>
              </div>
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateSettings.isPending
                  ? t("coinRewards.saving")
                  : t("coinRewards.saveChanges")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {t("coinRewards.howItWorks")}
              </h3>
              <p className="text-sm text-gray-600">{t("coinRewards.description")}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Settings */}
        <div className="space-y-4 mb-8">
          {isLoading ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="animate-pulse text-gray-400">
                {t("coinRewards.loading")}
              </div>
            </div>
          ) : (
            categoryOrder.map((category) => {
              const categorySettings = settingsByCategory[category] || [];
              if (categorySettings.length === 0) return null;

              const CategoryIcon = categoryIcons[category] || Coins;
              const isExpanded = expandedCategories.has(category);

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[category]}`}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {t(`coinRewards.categories.${category}`)}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {categorySettings.length}{" "}
                          {categorySettings.length === 1
                            ? t("coinRewards.action")
                            : t("coinRewards.actions")}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Category Settings */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {categorySettings.map((setting) => {
                        const current = getCurrentValue(setting);
                        const isModified = !!editedSettings[setting.action_key];

                        return (
                          <div
                            key={setting.action_key}
                            className={`p-4 border-b border-gray-50 last:border-0 ${
                              isModified ? "bg-indigo-50/50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-800">
                                    {t(
                                      `coinRewards.actions.${setting.action_key}`,
                                      setting.description
                                    )}
                                  </h4>
                                  {setting.is_customized && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                                      {t("coinRewards.customized")}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {t("coinRewards.defaultCoins", {
                                    count: setting.default_coins,
                                  })}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Coin Amount Input */}
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-amber-500" />
                                  <input
                                    type="number"
                                    min={0}
                                    max={9999}
                                    value={current.coin_amount}
                                    onChange={(e) =>
                                      handleValueChange(
                                        setting.action_key,
                                        "coin_amount",
                                        Math.max(0, parseInt(e.target.value) || 0)
                                      )
                                    }
                                    disabled={!current.enabled}
                                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                                  />
                                </div>

                                {/* Enable/Disable Toggle */}
                                <button
                                  onClick={() =>
                                    handleValueChange(
                                      setting.action_key,
                                      "enabled",
                                      !current.enabled
                                    )
                                  }
                                  className={`relative w-12 h-6 rounded-full transition-colors ${
                                    current.enabled ? "bg-green-500" : "bg-gray-300"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                      current.enabled
                                        ? "translate-x-6"
                                        : "translate-x-0.5"
                                    }`}
                                  />
                                </button>

                                {/* Reset Button */}
                                {setting.is_customized && (
                                  <button
                                    onClick={() => resetSetting.mutate(setting.action_key)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={t("coinRewards.resetToDefault")}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Per-Child Overrides Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => setShowChildSettings(!showChildSettings)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">
                  {t("coinRewards.perChildSettings")}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("coinRewards.perChildDescription")}
                </p>
              </div>
            </div>
            {showChildSettings ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showChildSettings && (
            <div className="border-t border-gray-100 p-4">
              {/* Child Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("coinRewards.selectChild")}
                </label>
                <select
                  value={selectedChildId || ""}
                  onChange={(e) => handleChildSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t("coinRewards.chooseChild")}</option>
                  {childProfiles.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedChildId && (
                <>
                  {/* Level Multiplier */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {t("coinRewards.levelMultiplier")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0.1}
                          max={10}
                          step={0.1}
                          value={childOverrides.level_multiplier}
                          onChange={(e) =>
                            setChildOverrides((prev) => ({
                              ...prev,
                              level_multiplier: parseFloat(e.target.value) || 1.0,
                            }))
                          }
                          className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center font-medium"
                        />
                        <span className="text-sm text-gray-500">x</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t("coinRewards.multiplierExplanation")}
                    </p>
                  </div>

                  {/* Save Child Overrides */}
                  <button
                    onClick={handleSaveChildOverrides}
                    disabled={updateChildOverrides.isPending}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateChildOverrides.isPending
                      ? t("coinRewards.saving")
                      : t("coinRewards.saveChildSettings")}
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <h3 className="font-bold text-blue-900 mb-3">{t("coinRewards.tips")}</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>&bull; {t("coinRewards.tip1")}</li>
            <li>&bull; {t("coinRewards.tip2")}</li>
            <li>&bull; {t("coinRewards.tip3")}</li>
            <li>&bull; {t("coinRewards.tip4")}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
