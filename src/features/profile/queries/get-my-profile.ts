import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { isPlaceholderEmail } from "@/lib/auth/placeholder-email";
import { createClient } from "@/lib/supabase/server";
import type { MyProfile } from "../types";

// The logged-in person's own details (staff profile or mother record) and
// recovery email, read with their own session (RLS: own rows only).
export async function getMyProfile(user: CurrentUser): Promise<MyProfile> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const email = auth.user?.email ?? null;
  const realEmail = email && !isPlaceholderEmail(email) ? email : null;

  if (user.role === "MOTHER") {
    const { data } = await supabase
      .from("mother")
      .select("first_name, middle_name, last_name, contact_number, purok_sitio, street_address, emergency_contact_name, emergency_contact_no")
      .eq("user_id", user.id)
      .maybeSingle();
    return {
      username: user.username,
      kind: "mother",
      email: realEmail,
      details: {
        firstName: data?.first_name ?? "",
        middleName: data?.middle_name ?? "",
        lastName: data?.last_name ?? "",
        contactNumber: data?.contact_number ?? "",
        purok: data?.purok_sitio ?? "",
        street: data?.street_address ?? "",
        emergencyName: data?.emergency_contact_name ?? "",
        emergencyNumber: data?.emergency_contact_no ?? "",
      },
    };
  }

  const { data } = await supabase
    .from("health_worker")
    .select("first_name, middle_name, last_name, contact_number, position")
    .eq("user_id", user.id)
    .maybeSingle();
  return {
    username: user.username,
    kind: "staff",
    email: realEmail,
    details: {
      firstName: data?.first_name ?? "",
      middleName: data?.middle_name ?? "",
      lastName: data?.last_name ?? "",
      contactNumber: data?.contact_number ?? "",
      position: data?.position ?? "",
    },
  };
}
