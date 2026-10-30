"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RebookOffer } from "@/features/follow-ups/components/follow-up-dialogs";
import type { FollowUpItem } from "@/features/follow-ups/types";
import { useDictionary } from "@/i18n/dictionary-provider";

// Development only: the "Book a new appointment?" step, open on load
// (it normally follows a saved follow-up).
export function PreviewOffer({ item }: { item: FollowUpItem }) {
  const { t } = useDictionary();
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-lg">
        <RebookOffer item={item} onSkip={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
