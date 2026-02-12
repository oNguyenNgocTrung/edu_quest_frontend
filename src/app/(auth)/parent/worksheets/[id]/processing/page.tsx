"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import type { Worksheet, WorksheetProcessingStep } from "@/types";
import { useTranslation } from "react-i18next";

export default function ProcessingStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation("parent");
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const calculateProgress = useCallback((steps: WorksheetProcessingStep[]) => {
    if (!steps || steps.length === 0) return 0;
    const totalSteps = steps.length;
    const completedSteps = steps.filter(
      (s) => s.status === "completed"
    ).length;
    const inProgressStep = steps.find((s) => s.status === "in-progress");
    const inProgressContribution = inProgressStep
      ? (inProgressStep.progress || 0) / 100
      : 0;
    return Math.round(
      ((completedSteps + inProgressContribution) / totalSteps) * 100
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;
        try {
          const { data } = await apiClient.get(`/worksheets/${id}`);
          const ws: Worksheet = data.data?.attributes || data;
          if (cancelled) return;
          setWorksheet(ws);
          setOverallProgress(calculateProgress(ws.processing_steps));

          if (ws.status === "extracted") {
            toast.success(t("worksheetProcessing.extractionSuccess"));
            router.push(`/parent/worksheets/${id}/review`);
            return;
          }
          if (ws.status === "failed") {
            toast.error(t("worksheetProcessing.processingFailed", { error: ws.error_message || t("worksheetProcessing.unknownError") }));
            return;
          }
          if (ws.status === "approved") {
            router.push("/parent/dashboard");
            return;
          }
        } catch {
          if (!cancelled) toast.error(t("worksheetProcessing.failed"));
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [id, router, calculateProgress, t]);

  const steps: WorksheetProcessingStep[] = worksheet?.processing_steps || [
    { id: "1", label: "Image uploaded", status: "pending", progress: 0 },
    { id: "2", label: "Preprocessing image", status: "pending", progress: 0 },
    { id: "3", label: "Extracting questions", status: "pending", progress: 0 },
    {
      id: "4",
      label: "Generating similar exercises",
      status: "pending",
      progress: 0,
    },
    { id: "5", label: "Quality check", status: "pending", progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 text-sm"
          >
            <ArrowLeft size={16} />
            {t("worksheetProcessing.dashboard")}
          </button>
          <h1
            className="text-2xl font-black text-gray-800"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {t("worksheetProcessing.title")}
          </h1>
          <p
            className="text-sm text-gray-600 mt-1"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {t("worksheetProcessing.analyzing")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Worksheet Preview */}
        {worksheet?.image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-white rounded-3xl p-6 shadow-lg"
          >
            <h3
              className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {t("worksheetProcessing.uploadedWorksheet")}
            </h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={worksheet.image_url}
              alt="Worksheet"
              className="w-full max-h-96 object-contain rounded-xl border-2 border-gray-200"
            />
            <div className="mt-3 text-center">
              <p
                className="text-xs text-gray-500"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {t("worksheetProcessing.pageInfo")}
              </p>
            </div>
          </motion.div>
        )}

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-lg font-bold text-gray-800"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("worksheetProcessing.overallProgress")}
            </h3>
            <span
              className="text-2xl font-black text-purple-600"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {overallProgress}%
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Processing Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-8"
        >
          <h3
            className="text-lg font-bold text-gray-800 mb-6"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {t("worksheetProcessing.processingSteps")}
          </h3>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Status Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === "completed"
                      ? "bg-green-100"
                      : step.status === "in-progress"
                        ? "bg-purple-100"
                        : "bg-gray-100"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : step.status === "in-progress" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-6 h-6 text-purple-600" />
                    </motion.div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Step Label and Progress */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className={`text-sm font-semibold ${
                        step.status === "completed"
                          ? "text-green-700"
                          : step.status === "in-progress"
                            ? "text-purple-700"
                            : "text-gray-500"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {step.label}
                    </p>
                    {step.status === "in-progress" &&
                      step.progress !== undefined && (
                        <span
                          className="text-xs font-bold text-purple-600"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {step.progress}%
                        </span>
                      )}
                  </div>

                  {/* Progress Bar for In-Progress Steps */}
                  {step.status === "in-progress" &&
                    step.progress !== undefined && (
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${step.progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tip Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4
                className="text-base font-bold text-blue-900 mb-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("worksheetProcessing.whatsHappening")}
              </h4>
              <p
                className="text-sm text-blue-700 leading-relaxed mb-3"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {t("worksheetProcessing.whatsHappeningDesc")}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-blue-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 30, ease: "linear" }}
                  />
                </div>
                <span
                  className="text-xs font-semibold text-blue-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("worksheetProcessing.estimatedTime")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancel Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {t("worksheetProcessing.cancelProcessing")}
          </button>
        </div>

        {/* Error state */}
        {worksheet?.status === "failed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-700 font-medium">
              {t("worksheetProcessing.processingFailed", { error: worksheet.error_message || t("worksheetProcessing.unknownError") })}
            </p>
            <button
              onClick={() => router.push("/parent/worksheets/upload")}
              className="mt-2 text-sm text-red-600 font-semibold hover:text-red-700"
            >
              {t("worksheetProcessing.retry")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
