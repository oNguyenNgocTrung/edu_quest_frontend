"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ChildProfileModal } from "@/components/parent/ChildProfileModal";
import type { ChildProfile } from "@/types";

const avatarEmojis: Record<string, string> = {
  fox: "\u{1F98A}",
  owl: "\u{1F989}",
  panda: "\u{1F43C}",
  rabbit: "\u{1F430}",
  cat: "\u{1F431}",
  dog: "\u{1F436}",
};

interface ChildSelectorProps {
  profiles: ChildProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ChildSelector({
  profiles,
  selectedId,
  onSelect,
}: ChildSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const getEmoji = (profile: ChildProfile) => {
    // First try matching from the avatars lib (emoji stored directly)
    if (profile.avatar && profile.avatar.length > 2) {
      return profile.avatar;
    }
    // Fallback to legacy key-based lookup
    return avatarEmojis[profile.avatar || ""] || "\u{1F9D2}";
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {profiles.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              child.id === selectedId
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="text-xl">{getEmoji(child)}</span>
            <span>{child.name}</span>
          </button>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-500 transition-all"
          title="Add child"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddModal && (
        <ChildProfileModal
          profile={null}
          onClose={() => setShowAddModal(false)}
          onSaved={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
