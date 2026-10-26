"use server";

import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/auth/roles";
import { placeholderEmail } from "@/lib/auth/placeholder-email";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterInput } from "../schemas";
import type { RegisterResult } from "../types";

// Mother self sign-up. Validates again on the server, then creates the login.
// The database trigger (migration 0004) creates user_account + mother +
// pregnancy in the same step, or fails the whole sign-up.
export async function registerMother(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email || placeholderEmail(data.username),
    password: data.password,
    options: {
      data: {
        registration: "mother_self_signup",
        username: data.username,
        first_name: data.firstName,
        middle_name: data.middleName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        purok_sitio: data.purok,
        street_address: data.street,
        contact_number: data.contactNumber,
        emergency_contact_name: data.emergencyName,
        emergency_contact_no: data.emergencyNumber,
        gravida: data.gravida,
        para: data.para,
        lmp_date: data.lmp,
        expected_delivery_date: data.edd,
      },
    },
  });

  if (error) {
    // Email already used: a real email belongs to someone else, or a
    // placeholder email means the username itself is taken.
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return data.email
        ? { ok: false, error: "emailTaken", field: "email" }
        : { ok: false, error: "usernameTaken", field: "username" };
    }
    // The trigger rejected it: most often the username was taken a moment ago.
    const { data: available } = await supabase.rpc("is_username_available", {
      p_username: data.username,
    });
    if (available === false) return { ok: false, error: "usernameTaken", field: "username" };
    return { ok: false, error: "generic" };
  }

  redirect(ROLE_HOME.MOTHER);
}
