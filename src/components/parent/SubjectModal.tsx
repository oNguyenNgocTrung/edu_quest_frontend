"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { SUBJECT_ICONS, SUBJECT_COLORS } from "@/lib/subject-icons";
import type { CurriculumSubject } from "@/types";

interface SubjectModalProps {
  subject?: CurriculumSubject | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SubjectModal({ subject, onClose, onSaved }: SubjectModalProps) {
  const { t } = useTranslation("parent");
  const isEditing = !!subject;

  const [name, setName] = useState(subject?.name || "");
  const [iconName, setIconName] = useState(
    subject?.icon_name || SUBJECT_ICONS[0].key
  );
  const [displayColor, setDisplayColor] = useState(
    subject?.display_color || SUBJECT_COLORS[0].value
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("curriculum.subjectNameRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        icon_name: iconName,
        display_color: displayColor,
      };

      if (isEditing && subject) {
        await apiClient.patch(`/curriculum/subjects/${subject.id}`, payload);
        toast.success(t("curriculum.subjectUpdated"));
      } else {
        await apiClient.post("/curriculum/subjects", payload);
        toast.success(t("curriculum.subjectCreated"));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(
        isEditing
          ? t("curriculum.updateSubjectError")
          : t("curriculum.createSubjectError")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 font-[Nunito]">
            {isEditing
              ? t("curriculum.editSubject")
              : t("curriculum.createSubject")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("curriculum.subjectName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("curriculum.subjectNamePlaceholder")}
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("curriculum.selectIcon")}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {SUBJECT_ICONS.map((icon) => (
                <button
                  key={icon.key}
                  type="button"
                  onClick={() => setIconName(icon.key)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    iconName === icon.key
                      ? "ring-2 ring-indigo-500 bg-indigo-50 scale-110"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("curriculum.selectColor")}
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setDisplayColor(color.value)}
                  className={`w-9 h-9 rounded-full transition-all ${
                    displayColor === color.value
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${displayColor}20` }}
            >
              {SUBJECT_ICONS.find((i) => i.key === iconName)?.emoji || "📚"}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {name || t("curriculum.subjectNamePlaceholder")}
              </p>
              <p className="text-xs text-gray-400">
                {t("curriculum.custom")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            {t("curriculum.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("common.loading")}
              </>
            ) : isEditing ? (
              t("common.save")
            ) : (
              t("curriculum.create")
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
