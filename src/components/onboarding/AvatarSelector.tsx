"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import { avatars } from "@/lib/avatars";

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

export function AvatarSelector({
  selectedAvatar,
  onSelect,
  onClose,
}: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState<
    "characters" | "animals" | "robots"
  >("characters");
  const [tempSelected, setTempSelected] = useState(selectedAvatar);

  const filteredAvatars = avatars.filter((a) => a.category === activeTab);
  const selectedAvatarData = avatars.find((a) => a.emoji === tempSelected);

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-white"
          style={{
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "80vh",
            overflow: "hidden",
          }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 font-[Nunito]">
              Choose an Avatar
            </h3>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 flex gap-6 border-b border-gray-100">
            {(["characters", "animals", "robots"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative pb-2 capitalize text-sm border-none bg-transparent cursor-pointer"
                style={{
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "#7C3AED" : "#6B7280",
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="avatarTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-sm"
                    style={{ background: "#7C3AED" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Avatar Grid */}
          <div
            className="px-6 py-6 overflow-y-auto"
            style={{ maxHeight: "350px" }}
          >
            <div className="grid grid-cols-4 gap-4 justify-items-center">
              {filteredAvatars.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTempSelected(avatar.emoji)}
                  className="relative flex items-center justify-center text-4xl cursor-pointer"
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: avatar.bgColor,
                    border:
                      tempSelected === avatar.emoji
                        ? "3px solid #7C3AED"
                        : "2px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  {avatar.emoji}
                  {tempSelected === avatar.emoji && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full"
                      style={{
                        background: "#7C3AED",
                        border: "2px solid white",
                      }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          {selectedAvatarData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-4 border-t border-gray-100 bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "100px",
                    height: "100px",
                    background: selectedAvatarData.bgColor,
                    fontSize: "60px",
                  }}
                >
                  {selectedAvatarData.emoji}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800 font-[Nunito]">
                    Looking great!
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAvatarData.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Select Button */}
          <div className="px-6 py-4 border-t border-gray-100">
            <motion.button
              whileHover={tempSelected ? { scale: 1.02 } : {}}
              whileTap={tempSelected ? { scale: 0.98 } : {}}
              onClick={handleConfirm}
              disabled={!tempSelected}
              className="w-full h-14 rounded-3xl font-semibold text-base text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: tempSelected
                  ? "linear-gradient(135deg, #7C3AED, #6D28D9)"
                  : "#9CA3AF",
                boxShadow: tempSelected
                  ? "0 4px 12px rgba(124, 58, 237, 0.3)"
                  : "none",
              }}
            >
              Select Avatar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
