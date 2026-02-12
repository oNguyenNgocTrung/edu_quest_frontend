"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ParentModeButtonProps {
  onClick: () => void;
}

export function ParentModeButton({ onClick }: ParentModeButtonProps) {
  const { t } = useTranslation('common');

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-4 z-50">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative"
        style={{
          width: "44px",
          height: "44px",
        }}
      >
        {/* Visible 32px button */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg flex items-center justify-center transition-all group-hover:shadow-md"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#F9FAFB",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Shield
            className="transition-colors group-hover:text-indigo-600"
            style={{
              width: "16px",
              height: "16px",
              color: "#9CA3AF",
            }}
          />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div
            className="px-3 py-1.5 rounded-lg shadow-md"
            style={{
              backgroundColor: "#F3F4F6",
              color: "#4B5563",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {t('parentAccess')}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
