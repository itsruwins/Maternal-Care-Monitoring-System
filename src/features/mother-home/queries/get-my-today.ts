import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { MyToday } from "../types";

// The logged-in mother's name and pregnancies, read with her own session
// (RLS: only her own records).
export async function getMyToday(user: CurrentUser): Promise<MyToday> {
  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("mother_id, first_name").eq("user_id", user.id).maybeSingle();
  if (!mother) return { firstName: user.username, current: null, past: [] };

  const { data: pregnancies } = await supabase
    .from("pregnancy")
    .select("pregnancy_id, pregnancy_status, lmp_date, expected_delivery_date, outcome, outcome_date, registration_date")
    .eq("mother_id", mother.mother_id);
  const rows = pregnancies ?? [];
  const active = rows.find((row) => row.pregnancy_status === "ACTIVE");

  return {
    firstName: mother.first_name,
    current: active ? { lmp: active.lmp_date, edd: active.expected_delivery_date } : null,
    past: rows
      .filter((row) => row.pregnancy_status !== "ACTIVE")
      .sort((a, b) => (b.outcome_date ?? b.registration_date).localeCompare(a.outcome_date ?? a.registration_date))
      .map((row) => ({ id: row.pregnancy_id, outcome: row.outcome, outcomeDate: row.outcome_date })),
  };
}
