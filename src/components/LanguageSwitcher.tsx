"use client";

import { useTranslation } from "react-i18next";

function changeLanguage(i18n: { changeLanguage: (lng: string) => void }, lng: string) {
  i18n.changeLanguage(lng);
  localStorage.setItem("language", lng);
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi");

  return (
    <div className={`flex items-center rounded-full border border-gray-200 bg-white overflow-hidden text-sm ${className}`}>
      <button
        onClick={() => changeLanguage(i18n, "vi")}
        className={`px-3 py-1.5 font-semibold transition-colors ${
          isVi
            ? "bg-indigo-600 text-white"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        VI
      </button>
      <button
        onClick={() => changeLanguage(i18n, "en")}
        className={`px-3 py-1.5 font-semibold transition-colors ${
          !isVi
            ? "bg-indigo-600 text-white"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        EN
      </button>
    </div>
  );
}
