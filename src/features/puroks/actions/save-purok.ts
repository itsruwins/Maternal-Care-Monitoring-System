"use server";

import { updateTag } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { PUROKS_CACHE_TAG } from "@/lib/puroks/types";
import { createClient } from "@/lib/supabase/server";
import { isId, isIdOrNull } from "@/lib/validation/ids";
import { purokSchema } from "../schemas";
import type { PurokFormState } from "../types";

// Admin adds (id = null, placed at the end of the list) or renames a purok.
export async function savePurok(id: number | null, _previous: PurokFormState, formData: FormData): Promise<PurokFormState> {
  await requireRole(["ADMIN"]);
  if (!isIdOrNull(id)) return { error: "generic" };

  const parsed = purokSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) {
    return { fieldErrors: { name: parsed.error.issues[0].message as "required" | "tooLong" } };
  }
  const name = parsed.data.name.replace(/\s+/g, " ");

  const supabase = await createClient();
  let error;
  if (id === null) {
    const { data: last } = await supabase
      .from("purok")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    ({ error } = await supabase.from("purok").insert({ name, sort_order: (last?.sort_order ?? 0) + 1 }));
  } else {
    ({ error } = await supabase.from("purok").update({ name }).eq("purok_id", id));
  }

  if (error) {
    return error.code === "23505" ? { fieldErrors: { name: "nameTaken" } } : { error: "generic" };
  }
  updateTag(PUROKS_CACHE_TAG);
  return { ok: true };
}

// Hide a purok (it can't be chosen anymore; mothers in it keep it) or show it again.
export async function setPurokShown(id: number, shown: boolean): Promise<{ ok: boolean }> {
  await requireRole(["ADMIN"]);
  if (!isId(id) || typeof shown !== "boolean") return { ok: false };
  const supabase = await createClient();
  const { data, error } = await supabase.from("purok").update({ is_active: shown }).eq("purok_id", id).select("purok_id");
  if (error || !data?.length) return { ok: false };
  updateTag(PUROKS_CACHE_TAG);
  return { ok: true };
}
