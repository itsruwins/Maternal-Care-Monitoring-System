import { Suspense } from "react";
import { RegisterMotherScreen } from "@/features/mothers/components/register-mother-screen";

export default function RegisterMotherPage() {
  return (
    <Suspense fallback={<div aria-hidden className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white/60" />}>
      <RegisterMotherScreen />
    </Suspense>
  );
}
