"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentChildProfile, childProfiles, selectChildProfile } =
    useAuthStore();

  const handleBackToChild = () => {
    if (!currentChildProfile && childProfiles.length > 0) {
      selectChildProfile(childProfiles[0]);
    }
    router.push("/child/home");
  };

  return (
    <>
      {children}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBackToChild}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Child Mode</span>
      </motion.button>
    </>
  );
}
