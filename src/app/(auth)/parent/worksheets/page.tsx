"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import type { Worksheet } from "@/types";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const statusConfig: Record<
  string,
  { labelKey: string; color: string; icon: typeof CheckCircle }
> = {
  approved: {
    labelKey: "worksheets.approved",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  extracted: {
    labelKey: "worksheets.readyForReview",
    color: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
  },
  processing: {
    labelKey: "worksheets.processing",
    color: "bg-purple-100 text-purple-700",
    icon: Loader2,
  },
  pending: {
    labelKey: "worksheets.pending",
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
  },
  failed: {
    labelKey: "worksheets.failed",
    color: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
};

export default function WorksheetsListPage() {
  const router = useRouter();
  const { t } = useTranslation("parent");

  const { data: worksheets, isLoading } = useQuery({
    queryKey: ["worksheets"],
    queryFn: async () => {
      const { data } = await apiClient.get("/worksheets");
      return (
        (data.data?.map(
          (w: { id: string; attributes: Omit<Worksheet, "id"> }) => ({
            ...w.attributes,
            id: w.id,
          })
        ) as Worksheet[]) || []
      );
    },
  });

  const handleClick = (ws: Worksheet) => {
    if (ws.status === "extracted" || ws.status === "approved") {
      router.push(`/parent/worksheets/${ws.id}/review`);
    } else if (
      ws.status === "pending" ||
      ws.status === "processing" ||
      ws.status === "failed"
    ) {
      router.push(`/parent/worksheets/${ws.id}/processing`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            {t("worksheets.dashboard")}
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{t("worksheets.title")}</h1>
            <button
              onClick={() => router.push("/parent/worksheets/upload")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <Plus size={18} />
              {t("worksheets.upload")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : worksheets && worksheets.length > 0 ? (
          <div className="space-y-3">
            {worksheets.map((ws, index) => {
              const config = statusConfig[ws.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <motion.button
                  key={ws.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleClick(ws)}
                  className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition text-left flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {ws.title || t("worksheets.untitled")}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        <StatusIcon size={12} />
                        {t(config.labelKey)}
                      </span>
                      {ws.questions_count > 0 && (
                        <span className="text-xs text-gray-400">
                          {t("worksheets.questionsCount", { count: ws.questions_count })}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(ws.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{t("worksheets.noWorksheets")}</p>
            <p className="text-sm text-gray-400 mb-6">
              {t("worksheets.uploadFirst")}
            </p>
            <button
              onClick={() => router.push("/parent/worksheets/upload")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              {t("worksheets.uploadWorksheet")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
