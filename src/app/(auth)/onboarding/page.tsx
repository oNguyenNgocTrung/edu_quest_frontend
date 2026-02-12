"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { PinSetupStep } from "@/components/onboarding/PinSetupStep";
import { CreateChildStep } from "@/components/onboarding/CreateChildStep";
import { useTranslation } from "react-i18next";

type OnboardingStep = "pin" | "child";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation("onboarding");
  const user = useAuthStore((s) => s.user);
  const childProfiles = useAuthStore((s) => s.childProfiles);
  const fetchChildProfiles = useAuthStore((s) => s.fetchChildProfiles);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchChildProfiles().then(() => setReady(true));
  }, [fetchChildProfiles]);

  const steps = useMemo<OnboardingStep[]>(() => {
    if (!ready) return [];
    const needed: OnboardingStep[] = [];
    if (user && !user.has_pin) needed.push("pin");
    if (childProfiles.length === 0) needed.push("child");
    return needed;
  }, [ready, user, childProfiles]);

  useEffect(() => {
    if (ready && steps.length === 0) {
      router.replace("/child/home");
    }
  }, [ready, steps.length, router]);

  const handleStepComplete = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      router.replace("/child/home");
    }
  }, [currentStepIndex, steps.length, router]);

  if (!ready || steps.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const stepNumber = currentStepIndex + 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-500">
            {t("stepOf", { step: stepNumber, total: totalSteps })}
          </p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#7C3AED" }}
            initial={{ width: 0 }}
            animate={{
              width: `${(stepNumber / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md mx-auto"
        >
          {currentStep === "pin" && (
            <PinSetupStep
              stepLabel={t("stepSecurity", { step: stepNumber, total: totalSteps })}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === "child" && (
            <CreateChildStep
              stepLabel={t("stepChildProfile", { step: stepNumber, total: totalSteps })}
              onComplete={handleStepComplete}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
