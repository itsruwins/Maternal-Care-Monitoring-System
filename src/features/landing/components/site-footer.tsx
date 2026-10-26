import Image from "next/image";
import { SITE } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="px-4 pb-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-ink-label/30 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Image src="/brand/seal-96.png" alt="" width={48} height={48} className="size-12 rounded-full" />
          <div>
            <p className="font-bold">{SITE.name}</p>
            <p className="mt-1 max-w-[42ch] text-sm text-ink-label">
              {SITE.fullTitle}, {SITE.location}
            </p>
          </div>
        </div>
        <div className="max-w-[46ch] text-sm text-ink-label sm:text-right">
          <p>{t.landing.footer.privacy}</p>
          <p className="mt-2">{t.landing.footer.photos}</p>
        </div>
      </div>
    </footer>
  );
}
