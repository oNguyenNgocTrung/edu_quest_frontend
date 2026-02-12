"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { avatars } from "@/lib/avatars";
import { AvatarSelector } from "./AvatarSelector";
import { toast } from "sonner";

interface CreateChildStepProps {
  stepLabel: string;
  onComplete: () => void;
}

const ageRanges = ["4-6", "7-9", "10-12", "13-15"];

export function CreateChildStep({
  stepLabel,
  onComplete,
}: CreateChildStepProps) {
  const createChildProfile = useAuthStore((s) => s.createChildProfile);
  const selectChildProfile = useAuthStore((s) => s.selectChildProfile);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("7-9");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAvatarData = avatar
    ? avatars.find((a) => a.emoji === avatar)
    : null;

  const handleCreate = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!avatar) {
      setError("Please select an avatar");
      return;
    }

    setLoading(true);
    try {
      const profile = await createChildProfile({
        name: name.trim(),
        age_range: ageRange,
        avatar,
      });
      selectChildProfile(profile);
      toast.success(`${profile.name}'s profile created!`);
      onComplete();
    } catch {
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Step label */}
      <p className="text-sm text-gray-400 mb-6">{stepLabel}</p>

      {/* Owl Illustration */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="flex justify-center mb-8"
      >
        <svg width="150" height="150" viewBox="0 0 150 150">
          {/* Parent Owl */}
          <ellipse cx="50" cy="70" rx="28" ry="30" fill="#7C3AED" />
          <ellipse cx="50" cy="76" rx="18" ry="20" fill="#C4B5FD" />
          <circle cx="42" cy="65" r="8" fill="white" />
          <circle cx="58" cy="65" r="8" fill="white" />
          <circle cx="42" cy="65" r="4" fill="#1F2937" />
          <circle cx="58" cy="65" r="4" fill="#1F2937" />
          <path d="M 50 68 L 46 73 L 54 73 Z" fill="#FB923C" />

          {/* Child Owl */}
          <ellipse cx="100" cy="75" rx="22" ry="24" fill="#EC4899" />
          <ellipse cx="100" cy="80" rx="14" ry="16" fill="#FBCFE8" />
          <circle cx="94" cy="70" r="6" fill="white" />
          <circle cx="106" cy="70" r="6" fill="white" />
          <circle cx="94" cy="70" r="3" fill="#1F2937" />
          <circle cx="106" cy="70" r="3" fill="#1F2937" />
          <path d="M 100 73 L 97 77 L 103 77 Z" fill="#FB923C" />

          {/* Heart between them */}
          <motion.text
            x="75"
            y="50"
            textAnchor="middle"
            style={{ fontSize: "24px" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            &#x1F49C;
          </motion.text>
        </svg>
      </motion.div>

      {/* Header */}
      <h3 className="mb-2 text-xl font-bold text-gray-800 font-[Nunito]">
        Add Your First Learner
      </h3>
      <p className="text-sm text-gray-500 mb-8">
        Let&apos;s set up a profile for your child
      </p>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-6 bg-white rounded-3xl"
        style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}
      >
        {/* Avatar Selector Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="relative cursor-pointer transition-all duration-200"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "2px dashed #D1D5DB",
              background: selectedAvatarData
                ? selectedAvatarData.bgColor
                : "#F9FAFB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: avatar ? "48px" : "24px",
            }}
          >
            {avatar || <Plus className="w-8 h-8 text-gray-400" />}
          </button>
          <p className="mt-2 text-sm font-medium text-purple-600">
            {avatar ? "Change Avatar" : "Tap to select avatar"}
          </p>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Child&apos;s Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl text-base text-gray-800 bg-white outline-none focus:border-purple-600 transition-colors"
          />
        </div>

        {/* Age Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Age Range
          </label>
          <div className="flex gap-2">
            {ageRanges.map((range) => (
              <button
                key={range}
                onClick={() => setAgeRange(range)}
                className="flex-1 h-12 rounded-2xl text-sm cursor-pointer transition-all duration-200"
                style={{
                  border: `2px solid ${ageRange === range ? "#7C3AED" : "#E5E7EB"}`,
                  background: ageRange === range ? "#F5F3FF" : "#FFFFFF",
                  color: ageRange === range ? "#7C3AED" : "#6B7280",
                  fontWeight: ageRange === range ? 600 : 500,
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-400"
          >
            <p className="text-sm text-red-500">{error}</p>
          </motion.div>
        )}

        {/* Create Button */}
        <motion.button
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          onClick={handleCreate}
          disabled={loading}
          className="relative overflow-hidden w-full h-14 rounded-3xl font-semibold text-base text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: loading
              ? "#9CA3AF"
              : "linear-gradient(135deg, #7C3AED, #6D28D9)",
            boxShadow: loading
              ? "none"
              : "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          {!loading && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            />
          )}
          <span className="relative z-10">
            {loading ? "Creating..." : "Create Profile"}
          </span>
        </motion.button>
      </motion.div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          selectedAvatar={avatar}
          onSelect={setAvatar}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  );
}
