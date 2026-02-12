"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import type { ChildProfile } from "@/types";

const avatarEmojis: Record<string, string> = {
  fox: "🦊",
  owl: "🦉",
  panda: "🐼",
  rabbit: "🐰",
  cat: "🐱",
  dog: "🐶",
};

function getAvatarEmoji(avatar: string | null): string {
  if (!avatar) return "🧒";
  return avatarEmojis[avatar] || avatar;
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { childProfiles, selectChildProfile } = useAuthStore();

  const handleSwitchToChild = (profile: ChildProfile) => {
    selectChildProfile(profile);
    router.push("/child/home");
  };

  if (childProfiles.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 lg:bottom-auto lg:top-4 z-50 flex items-center gap-2">
        {childProfiles.map((profile) => (
          <motion.button
            key={profile.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwitchToChild(profile)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shadow-md transition-all bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
          >
            <span className="text-lg">{getAvatarEmoji(profile.avatar)}</span>
            <span className="text-sm">{profile.name}</span>
          </motion.button>
        ))}
      </div>
    </>
  );
}
