"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParentModeButton } from "@/components/child/ParentModeButton";
import { PinVerificationDialog } from "@/components/PinVerificationDialog";

export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {children}
      <ParentModeButton onClick={() => setIsPinDialogOpen(true)} />
      <PinVerificationDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={() => router.push("/parent/dashboard")}
      />
    </>
  );
}
