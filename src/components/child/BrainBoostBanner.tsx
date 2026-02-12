"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BrainBoostBannerProps {
  cardsDue: number;
  onReviewClick: () => void;
  onDismiss?: () => void;
}

export function BrainBoostBanner({
  cardsDue,
  onReviewClick,
  onDismiss,
}: BrainBoostBannerProps) {
  const { t } = useTranslation('child');
  const [isDismissed, setIsDismissed] = useState(false);

  const shouldShow = cardsDue >= 5 && !isDismissed;

  useEffect(() => {
    const dismissedTime = localStorage.getItem("brainBoostDismissed");
    if (dismissedTime) {
      const fourHours = 4 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < fourHours) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem("brainBoostDismissed");
      }
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem("brainBoostDismissed", Date.now().toString());
    onDismiss?.();
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onReviewClick}
          className="relative cursor-pointer overflow-hidden"
          style={{
            height: "56px",
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
            borderRadius: "12px",
            border: "1.5px solid rgba(251, 146, 60, 0.2)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            style={{ width: "50%" }}
          />

          <div className="relative z-10 h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                animate={{ rotate: [-8, 8, -8], y: [0, -2, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ fontSize: "32px", lineHeight: 1, flexShrink: 0 }}
              >
                🧠
              </motion.div>
              <div className="flex flex-col gap-0.5">
                <h3
                  className="font-bold leading-tight"
                  style={{ fontSize: "14px", color: "#EA580C" }}
                >
                  {cardsDue} {t('brainBoost.cardsReady')}
                </h3>
                <p
                  className="font-medium leading-tight"
                  style={{ fontSize: "12px", color: "#9CA3AF" }}
                >
                  Keep your streak strong 🔥
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onReviewClick();
              }}
              className="flex items-center justify-center px-3 cursor-pointer"
              style={{
                height: "36px",
                background: "linear-gradient(135deg, #7C3AED, #9333EA)",
                borderRadius: "999px",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
                minWidth: "88px",
              }}
            >
              <span
                className="font-bold text-white whitespace-nowrap"
                style={{ fontSize: "13px" }}
              >
                Review Now
              </span>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDismiss}
            className="absolute top-1 right-1 rounded-full flex items-center justify-center"
            style={{ width: "24px", height: "24px" }}
          >
            <X className="text-gray-400 hover:text-gray-600" style={{ width: "16px", height: "16px" }} />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
