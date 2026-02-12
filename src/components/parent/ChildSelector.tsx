"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { resolveAvatar } from "@/lib/avatars";
import { ChildProfileModal } from "@/components/parent/ChildProfileModal";
import type { ChildProfile } from "@/types";

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

  return (
    <>
      <div className="flex items-center gap-2">
        {profiles.map((child) => {
          const { emoji } = resolveAvatar(child.avatar);
          return (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                child.id === selectedId
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span>{child.name}</span>
            </button>
          );
        })}
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
