"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setPin, logout } = useAuthStore();
  const [pin, setPinValue] = useState("");
  const [showPinForm, setShowPinForm] = useState(false);

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    try {
      await setPin(pin);
      toast.success("PIN updated successfully");
      setShowPinForm(false);
      setPinValue("");
    } catch {
      toast.error("Failed to set PIN");
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
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Account info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* PIN settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" />
              Parental PIN
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                user?.has_pin
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {user?.has_pin ? "Set" : "Not set"}
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
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-2xl"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSetPin}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  Save PIN
                </button>
                <button
                  onClick={() => {
                    setShowPinForm(false);
                    setPinValue("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPinForm(true)}
              className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition"
            >
              {user?.has_pin ? "Change PIN" : "Set PIN"}
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
          Sign Out
        </button>
      </div>
    </div>
  );
}
