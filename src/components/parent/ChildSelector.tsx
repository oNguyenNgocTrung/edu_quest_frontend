"use client";

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
  return (
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
          <span className="text-xl">
            {avatarEmojis[child.avatar || ""] || "\u{1F9D2}"}
          </span>
          <span>{child.name}</span>
        </button>
      ))}
    </div>
  );
}
