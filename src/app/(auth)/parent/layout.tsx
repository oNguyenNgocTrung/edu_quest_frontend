"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "react-i18next";
import { resolveAvatar } from "@/lib/avatars";
import type { ChildProfile } from "@/types";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { childProfiles, selectChildProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSwitchToChild = (profile: ChildProfile) => {
    selectChildProfile(profile);
    setIsOpen(false);
    router.push("/child/home");
  };

  if (childProfiles.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        ref={menuRef}
        className="fixed bottom-20 right-4 lg:bottom-auto lg:top-4 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center rounded-lg shadow-md transition-all bg-white border-2 border-gray-200 hover:border-indigo-400"
          style={{
            width: "44px",
            height: "44px",
          }}
        >
          <Play
            className="transition-colors group-hover:text-indigo-600"
            style={{ width: "18px", height: "18px", color: "#9CA3AF" }}
          />

          {/* Tooltip (hidden when menu open) */}
          {!isOpen && (
            <div className="absolute bottom-14 lg:bottom-auto lg:top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div
                className="px-3 py-1.5 rounded-lg shadow-md"
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#4B5563",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {t("parentLayout.childMode")}
              </div>
            </div>
          )}
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              className="absolute right-0 bottom-14 lg:bottom-auto lg:top-14 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
              style={{ minWidth: "180px" }}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t("parentLayout.playAs")}
                </p>
              </div>
              {childProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSwitchToChild(profile)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                >
                  <span className="text-xl">
                    {resolveAvatar(profile.avatar).emoji}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {profile.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
