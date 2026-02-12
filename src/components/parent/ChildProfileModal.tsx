"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { AvatarSelector } from "@/components/onboarding/AvatarSelector";
import { avatars } from "@/lib/avatars";
import type { ChildProfile } from "@/types";

const AGE_RANGES = ["4-6", "7-9", "10-12", "13-15"];

interface ChildProfileModalProps {
  profile?: ChildProfile | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ChildProfileModal({
  profile,
  onClose,
  onSaved,
}: ChildProfileModalProps) {
  const { t } = useTranslation("parent");
  const { createChildProfile, updateChildProfile } = useAuthStore();

  const isEditing = !!profile;

  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar || null);
  const [ageRange, setAgeRange] = useState(profile?.age_range || "7-9");
  const [dailyGoal, setDailyGoal] = useState(
    profile?.daily_goal_minutes || 15
  );
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarData = avatars.find((a) => a.emoji === avatar);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("settings.nameRequired"));
      return;
    }
    if (!avatar) {
      toast.error(t("settings.avatarRequired"));
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        avatar,
        age_range: ageRange,
        daily_goal_minutes: dailyGoal,
      };

      if (isEditing && profile) {
        await updateChildProfile(profile.id, data);
        toast.success(t("settings.profileUpdated"));
      } else {
        await createChildProfile(data);
        toast.success(t("settings.profileCreated"));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(
        isEditing ? t("settings.updateError") : t("settings.createError")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 font-[Nunito]">
            {isEditing ? t("settings.editChild") : t("settings.addChild")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAvatarSelector(true)}
              className="relative flex items-center justify-center rounded-full transition hover:ring-4 hover:ring-purple-100"
              style={{
                width: "80px",
                height: "80px",
                background: avatarData?.bgColor || "#F3F4F6",
                fontSize: avatarData ? "48px" : "32px",
              }}
            >
              {avatarData ? avatarData.emoji : "➕"}
            </button>
            <span className="text-xs text-gray-400">
              {t("settings.tapToSelectAvatar")}
            </span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.childName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.childNamePlaceholder")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.ageRange")}
            </label>
            <div className="flex gap-2">
              {AGE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    ageRange === range
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.dailyGoal")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <span className="text-sm font-semibold text-purple-600 whitespace-nowrap w-20 text-right">
                {t("settings.dailyGoalMinutes", { count: dailyGoal })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            {t("settings.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              t("settings.saveProfile")
            )}
          </button>
        </div>
      </motion.div>

      {showAvatarSelector && (
        <AvatarSelector
          selectedAvatar={avatar}
          onSelect={(emoji) => {
            setAvatar(emoji);
            setShowAvatarSelector(false);
          }}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </>
  );
}
