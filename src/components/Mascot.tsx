"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface MascotProps {
  mood?: "waving" | "pointing" | "celebrating" | "encouraging" | "excited";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  showSpeechBubble?: boolean;
  message?: string;
}

export function Mascot({
  mood = "waving",
  size = "md",
  animate = true,
  showSpeechBubble = false,
  message,
}: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(showSpeechBubble);

  useEffect(() => {
    if (!animate) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [animate]);

  useEffect(() => {
    setIsBubbleVisible(showSpeechBubble);
    if (showSpeechBubble) {
      const timer = setTimeout(() => setIsBubbleVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSpeechBubble]);

  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  const messages: Record<string, string> = {
    waving: "Hey there! Ready to learn?",
    pointing: "Let's complete your Daily Quest!",
    celebrating: "Amazing! You did it!",
    encouraging: "You're so close to leveling up!",
    excited: "You're about to level up! Keep going!",
  };

  const currentMessage = message || messages[mood];

  const mascotVariants = {
    waving: {
      y: [0, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
    pointing: {
      x: [0, 3, 0],
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    celebrating: {
      rotate: [0, -8, 8, -8, 0],
      scale: [1, 1.1, 1.05, 1.1, 1],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.5 },
    },
    encouraging: {
      y: [0, -4, 0, -4, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    excited: {
      y: [0, -8, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const },
    },
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap"
          >
            <div
              className="bg-white rounded-2xl px-4 py-2 shadow-lg"
              style={{ border: "2px solid #7C3AED" }}
            >
              <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>
                {currentMessage}
              </p>
            </div>
            <div
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #7C3AED",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`${sizeMap[size]} relative flex items-center justify-center`}
        variants={mascotVariants}
        animate={animate ? mood : undefined}
      >
        {mood === "celebrating" && animate && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: "50%", top: "50%", fontSize: "16px" }}
                animate={{
                  x: Math.cos((i * 45 * Math.PI) / 180) * 40,
                  y: Math.sin((i * 45 * Math.PI) / 180) * 40,
                  opacity: [1, 0],
                  scale: [0, 1],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                {["🎉", "⭐", "✨", "🌟"][i % 4]}
              </motion.div>
            ))}
          </>
        )}

        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Body */}
          <ellipse cx="50" cy="55" rx="32" ry="35" fill="#7C3AED" />
          {/* Belly */}
          <ellipse cx="50" cy="62" rx="22" ry="25" fill="#C4B5FD" />

          {/* Wings */}
          {mood === "waving" ? (
            <>
              <ellipse cx="22" cy="55" rx="12" ry="20" fill="#6D28D9" />
              <motion.ellipse
                cx="78"
                cy="55"
                rx="12"
                ry="20"
                fill="#6D28D9"
                animate={{ cy: [55, 45, 55], rx: [12, 15, 12] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          ) : mood === "excited" ? (
            <>
              <motion.ellipse
                cx="22"
                cy="45"
                rx="12"
                ry="20"
                fill="#6D28D9"
                animate={{ cy: [45, 40, 45], ry: [20, 22, 20] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.ellipse
                cx="78"
                cy="45"
                rx="12"
                ry="20"
                fill="#6D28D9"
                animate={{ cy: [45, 40, 45], ry: [20, 22, 20] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1,
                }}
              />
            </>
          ) : (
            <>
              <ellipse cx="22" cy="55" rx="12" ry="20" fill="#6D28D9" />
              <ellipse cx="78" cy="55" rx="12" ry="20" fill="#6D28D9" />
            </>
          )}

          {/* Eyes background */}
          <circle cx="40" cy="45" r="14" fill="white" />
          <circle cx="60" cy="45" r="14" fill="white" />

          {/* Pupils */}
          {isBlinking ? (
            <>
              <line x1="30" y1="45" x2="50" y2="45" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="45" x2="70" y2="45" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood === "celebrating" ? (
            <>
              <path d="M 32 47 Q 40 42 48 47" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 52 47 Q 60 42 68 47" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : mood === "excited" || mood === "pointing" ? (
            <>
              <circle cx="40" cy="45" r="8" fill="#1F2937" />
              <circle cx="60" cy="45" r="8" fill="#1F2937" />
              <circle cx="42" cy="43" r="3" fill="white" />
              <circle cx="62" cy="43" r="3" fill="white" />
            </>
          ) : (
            <>
              <circle cx="40" cy="45" r="6" fill="#1F2937" />
              <circle cx="60" cy="45" r="6" fill="#1F2937" />
              <circle cx="42" cy="43" r="2.5" fill="white" />
              <circle cx="62" cy="43" r="2.5" fill="white" />
            </>
          )}

          {/* Beak */}
          <path d="M 50 50 L 45 57 L 55 57 Z" fill="#FB923C" />
          {/* Feet */}
          <ellipse cx="42" cy="88" rx="6" ry="4" fill="#FB923C" />
          <ellipse cx="58" cy="88" rx="6" ry="4" fill="#FB923C" />
          {/* Ear tufts */}
          <path d="M 32 28 Q 28 22 30 18" stroke="#6D28D9" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 68 28 Q 72 22 70 18" stroke="#6D28D9" strokeWidth="3" fill="none" strokeLinecap="round" />

          {mood === "celebrating" && (
            <>
              <path d="M 50 15 L 35 32 L 65 32 Z" fill="#EC4899" />
              <circle cx="50" cy="15" r="4" fill="#FB923C" />
              <line x1="35" y1="32" x2="65" y2="32" stroke="#FBBF24" strokeWidth="2" />
            </>
          )}
        </svg>

        {mood === "celebrating" && (
          <>
            <motion.div
              className="absolute -top-2 -right-2 text-xl"
              animate={{ y: [-10, -20], opacity: [1, 0], scale: [1, 1.3] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute -top-1 -left-2 text-xl"
              animate={{ y: [-10, -20], opacity: [1, 0], scale: [1, 1.3] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.7 }}
            >
              ✨
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
