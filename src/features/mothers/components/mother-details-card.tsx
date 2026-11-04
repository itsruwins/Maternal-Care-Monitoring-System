"use client";

import { useRef, useState, type ReactNode } from "react";
import { PencilIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { useDictionary } from "@/i18n/dictionary-provider";
import type { PurokOption } from "@/lib/puroks/types";
import type { MotherRecord } from "../types";
import { MotherDetailsForm } from "./mother-details-form";

// Her details: read at a glance (the server-built view), with Edit details
// opening the same card as the form. Save or Cancel brings the view back and
// returns focus to the Edit button.
export function MotherDetailsCard({
  mother,
  puroks,
  today,
  children,
}: {
  mother: MotherRecord;
  puroks: PurokOption[];
  today: string;
  /** The read view. */
  children: ReactNode;
}) {
  const { t } = useDictionary();
  const r = t.mothers.record;
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const open = () => {
    setEditing(true);
    // Into the first field once the form is there.
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("input")?.focus());
  };
  const close = () => {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  };

  return (
    <section aria-labelledby="her-details" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <IconCircle icon={UserIcon} tone="blush" size="sm" />
        <h2 id="her-details" className="flex-1 text-xl font-bold">
          {r.details.title}
        </h2>
        {!editing && (
          <Button ref={editButton} type="button" variant="soft" size="sm" onClick={open}>
            <PencilIcon weight="bold" aria-hidden className="size-4" />
            {r.detailsView.edit}
          </Button>
        )}
      </div>
      {editing ? (
        <div ref={formRef} className="duration-300 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
          <MotherDetailsForm key={mother.id} mother={mother} puroks={puroks} today={today} onSaved={close} onCancel={close} />
        </div>
      ) : (
        children
      )}
    </section>
  );
}
