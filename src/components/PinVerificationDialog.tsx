"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "react-i18next";

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinVerificationDialog({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}: PinVerificationDialogProps) {
  const { verifyPin } = useAuthStore();
  const { t } = useTranslation('common');

  const resolvedTitle = title || t('pin.title');
  const resolvedDescription = description || t('pin.subtitle');
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    } else {
      setPin(["", "", "", ""]);
      setError(null);
      setIsVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const fullPin = newPin.join("");
      verifyPinCode(fullPin);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);

    if (!/^\d+$/.test(pastedData)) return;

    const newPin = pastedData
      .split("")
      .concat(["", "", "", ""])
      .slice(0, 4);
    setPin(newPin);

    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs[nextIndex].current?.focus();

    if (pastedData.length === 4) {
      verifyPinCode(pastedData);
    }
  };

  const verifyPinCode = async (pinCode: string) => {
    setIsVerifying(true);

    try {
      const verified = await verifyPin(pinCode);
      if (verified) {
        onSuccess();
        // Don't call onClose here - let onSuccess handle cleanup
      } else {
        setError(t('pin.incorrectPin'));
        setPin(["", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } catch {
      setError(t('pin.incorrectPin'));
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{resolvedTitle}</h2>
              <p className="text-gray-600">{resolvedDescription}</p>
            </div>

            {/* PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                    error
                      ? "border-red-500 bg-red-50 text-red-600"
                      : digit
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                        : "border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:bg-indigo-50"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-red-600 mb-4"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {isVerifying && (
              <div className="text-center text-gray-600">
                <div className="inline-block animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
                <p className="text-sm">{t('pin.verifying')}</p>
              </div>
            )}

            {/* Hint */}
            {!error && !isVerifying && (
              <p className="text-center text-sm text-gray-500">
                {t('pin.enterPin')}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
