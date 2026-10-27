import "server-only";
import { mustChangePassword } from "@/lib/auth/password-flag";
import { isPlaceholderEmail } from "@/lib/auth/placeholder-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { MotherRecord, PregnancyRecord } from "../types";

// One mother with her pregnancies (current first, then newest past ones) and
// her login, if she has one. Her record is read as the logged-in staff member
// (RLS); the login details need the secret key, so the caller must have checked
// the staff role.
export async function getMother(motherId: number): Promise<MotherRecord | null> {
  const supabase = await createClient();
  const [{ data: mother }, { data: pregnancies }] = await Promise.all([
    supabase
      .from("mother")
      .select(
        "mother_id, user_id, first_name, middle_name, last_name, date_of_birth, contact_number, purok_id, street_address, emergency_contact_name, emergency_contact_no, registration_date, purok:purok_id(name), registrar:registered_by(first_name, last_name)",
      )
      .eq("mother_id", motherId)
      .maybeSingle(),
    supabase
      .from("pregnancy")
      .select("pregnancy_id, gravida, para, lmp_date, expected_delivery_date, pregnancy_status, outcome, outcome_date, registration_date, remarks")
      .eq("mother_id", motherId),
  ]);
  if (!mother) return null;

  let login: MotherRecord["login"] = null;
  if (mother.user_id) {
    const admin = createAdminClient();
    const [{ data: account }, { data: auth }] = await Promise.all([
      admin.from("user_account").select("username, account_status, last_login_at").eq("user_id", mother.user_id).maybeSingle(),
      admin.auth.admin.getUserById(mother.user_id),
    ]);
    if (account) {
      const email = auth.user?.email ?? null;
      login = {
        userId: mother.user_id,
        username: account.username,
        status: account.account_status,
        lastLoginAt: account.last_login_at,
        mustChangePassword: mustChangePassword(auth.user?.app_metadata),
        email: email && !isPlaceholderEmail(email) ? email : null,
      };
    }
  }

  const records: PregnancyRecord[] = (pregnancies ?? []).map((row) => ({
    id: row.pregnancy_id,
    gravida: row.gravida,
    para: row.para,
    lmp: row.lmp_date,
    edd: row.expected_delivery_date,
    status: row.pregnancy_status,
    outcome: row.outcome,
    outcomeDate: row.outcome_date,
    registrationDate: row.registration_date,
    remarks: row.remarks,
  }));
  const current = records.find((p) => p.status === "ACTIVE") ?? null;
  const past = records
    .filter((p) => p.status !== "ACTIVE")
    .sort((a, b) => (b.outcomeDate ?? b.registrationDate).localeCompare(a.outcomeDate ?? a.registrationDate));

  const registrar = mother.registrar;
  return {
    id: mother.mother_id,
    firstName: mother.first_name,
    middleName: mother.middle_name ?? "",
    lastName: mother.last_name,
    dateOfBirth: mother.date_of_birth,
    contactNumber: mother.contact_number,
    purokId: mother.purok_id,
    purokName: mother.purok?.name ?? null,
    street: mother.street_address,
    emergencyName: mother.emergency_contact_name,
    emergencyNumber: mother.emergency_contact_no,
    registrationDate: mother.registration_date,
    registeredBy: registrar ? `${registrar.first_name} ${registrar.last_name}`.trim() : null,
    selfSignup: mother.user_id !== null && registrar === null,
    current,
    past,
    login,
  };
}
