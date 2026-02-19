"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParentModeButton } from "@/components/child/ParentModeButton";
import { PinVerificationDialog } from "@/components/PinVerificationDialog";
import { useAuthStore } from "@/stores/auth-store";

export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const router = useRouter();
  const { clearChildProfile } = useAuthStore();

  const handlePinSuccess = () => {
    clearChildProfile();
    setIsPinDialogOpen(false);
    // Mark parent access as verified so parent layout doesn't ask again
    sessionStorage.setItem("parent_access_verified", "true");
    router.push("/parent/dashboard");
  };

  return (
    <>
      {children}
      <ParentModeButton onClick={() => setIsPinDialogOpen(true)} />
      <PinVerificationDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </>
  );
}
