"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, EyeSlashIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { setPurokShown } from "../actions/save-purok";
import type { Purok } from "../types";

// Hide a shown purok, or show a hidden one again. Both are easy to undo, so
// there is no confirmation step.
export function PurokVisibilityButton({ purok }: { purok: Purok }) {
  const { t } = useDictionary();
  const p = t.puroks;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hiding = purok.isActive;
  const ToggleIcon = hiding ? EyeSlashIcon : EyeIcon;

  const toggle = () =>
    startTransition(async () => {
      const result = await setPurokShown(purok.id, !hiding);
      if (!result.ok) {
        toast.error(p.errors.generic);
        return;
      }
      toast.success(format(hiding ? p.hiddenToast : p.shownToast, { name: purok.name }));
      router.refresh();
    });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-busy={pending}
      aria-label={format(hiding ? p.hideName : p.showName, { name: purok.name })}
    >
      {pending ? <SpinnerIcon className="animate-spin" aria-hidden /> : <ToggleIcon weight="bold" aria-hidden />}
      {hiding ? p.hide : p.show}
    </Button>
  );
}
