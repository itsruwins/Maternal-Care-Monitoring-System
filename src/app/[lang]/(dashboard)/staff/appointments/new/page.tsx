import { Suspense } from "react";
import { BookAppointmentScreen } from "@/features/appointments/components/book-appointment-screen";

export default function BookAppointmentPage({ searchParams }: PageProps<"/[lang]/staff/appointments/new">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <BookAppointmentScreen searchParams={searchParams} />
    </Suspense>
  );
}
