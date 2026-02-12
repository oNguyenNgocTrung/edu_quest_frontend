"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation('parent');
  const { user, setPin, logout } = useAuthStore();
  const [pin, setPinValue] = useState("");
  const [showPinForm, setShowPinForm] = useState(false);

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error(t('settings.pinMustBe4Digits'));
      return;
    }
    try {
      await setPin(pin);
      toast.success(t('settings.pinUpdated'));
      setShowPinForm(false);
      setPinValue("");
    } catch {
      toast.error(t('settings.pinError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            {t('settings.dashboard')}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Account info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">{t('settings.account')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('settings.name')}</span>
              <span className="text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('settings.email')}</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* PIN settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" />
              {t('settings.pin')}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                user?.has_pin
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {user?.has_pin ? t('settings.pinSet') : t('settings.pinNotSet')}
            </span>
          </div>

          {showPinForm ? (
            <div className="space-y-3">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) =>
                  setPinValue(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder={t('settings.enterPin')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-2xl"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSetPin}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  {t('settings.savePin')}
                </button>
                <button
                  onClick={() => {
                    setShowPinForm(false);
                    setPinValue("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
                >
                  {t('settings.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPinForm(true)}
              className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition"
            >
              {user?.has_pin ? t('settings.changePin') : t('settings.setPin')}
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          {t('settings.signOut')}
        </button>
      </div>
    </div>
  );
}
