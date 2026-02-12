"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Shield, Delete } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PinSetupStepProps {
  stepLabel: string;
  onComplete: () => void;
}

export function PinSetupStep({ stepLabel, onComplete }: PinSetupStepProps) {
  const { t } = useTranslation('onboarding');
  const setPin = useAuthStore((s) => s.setPin);
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPIN, setFirstPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentPIN = step === 1 ? firstPIN : confirmPIN;

  const handlePinMatch = useCallback(async () => {
    setSubmitting(true);
    try {
      await setPin(firstPIN);
      toast.success("PIN created successfully!");
      setTimeout(() => onComplete(), 400);
    } catch {
      toast.error("Failed to set PIN. Please try again.");
      setFirstPIN("");
      setConfirmPIN("");
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  }, [firstPIN, setPin, onComplete]);

  useEffect(() => {
    if (step === 1 && firstPIN.length === 4) {
      setTimeout(() => setStep(2), 300);
    }

    if (step === 2 && confirmPIN.length === 4) {
      if (firstPIN === confirmPIN) {
        handlePinMatch();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setConfirmPIN("");
          setError(false);
        }, 600);
      }
    }
  }, [firstPIN, confirmPIN, step, handlePinMatch]);

  const handleKeyPress = (num: string) => {
    if (submitting) return;
    if (step === 1 && firstPIN.length < 4) {
      setFirstPIN(firstPIN + num);
    } else if (step === 2 && confirmPIN.length < 4) {
      setConfirmPIN(confirmPIN + num);
    }
  };

  const handleBackspace = () => {
    if (submitting) return;
    if (step === 1) {
      setFirstPIN(firstPIN.slice(0, -1));
    } else {
      setConfirmPIN(confirmPIN.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Step label */}
      <p className="text-sm text-gray-400 mb-6">{stepLabel}</p>

      {/* PIN sub-step progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <motion.div
            key={s}
            className="rounded-full"
            style={{
              width: s === step ? "24px" : "8px",
              height: "8px",
              background: s === step ? "#7C3AED" : "#E5E7EB",
            }}
            animate={{ width: s === step ? "24px" : "8px" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Shield Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-8 flex items-center justify-center w-16 h-16 rounded-full"
        style={{ background: "#F5F3FF" }}
      >
        <Shield className="w-8 h-8" style={{ color: "#7C3AED" }} />
      </motion.div>

      {/* Heading */}
      <h3 className="mb-2 text-xl font-bold text-gray-800 font-[Nunito]">
        {step === 1 ? t('pin.title') : t('pin.confirmPin')}
      </h3>

      <p className="mb-12 max-w-sm text-sm text-gray-500 text-center leading-relaxed">
        {step === 1
          ? t('pin.subtitle')
          : t('pin.confirmPin')}
      </p>

      {/* PIN Dots */}
      <motion.div
        className="flex items-center gap-6 mb-12"
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-center"
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: error
                ? "2px solid #EF4444"
                : currentPIN.length > index
                  ? "none"
                  : "2px solid #E5E7EB",
              background:
                currentPIN.length > index
                  ? error
                    ? "#EF4444"
                    : "#7C3AED"
                  : "transparent",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-sm text-red-500 text-center"
        >
          PINs don&apos;t match. Please try again.
        </motion.p>
      )}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKeyPress(num.toString())}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              fontSize: "24px",
              fontWeight: 600,
              color: "#1F2937",
            }}
          >
            {num}
          </motion.button>
        ))}

        {/* Blank */}
        <div style={{ width: "72px", height: "72px" }} />

        {/* Zero */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyPress("0")}
          className="flex items-center justify-center cursor-pointer"
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            fontSize: "24px",
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          0
        </motion.button>

        {/* Backspace */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackspace}
          disabled={currentPIN.length === 0}
          className="flex items-center justify-center"
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            cursor: currentPIN.length === 0 ? "not-allowed" : "pointer",
            opacity: currentPIN.length === 0 ? 0.5 : 1,
          }}
        >
          <Delete className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>
    </div>
  );
}
