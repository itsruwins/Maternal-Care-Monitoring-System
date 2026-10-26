import Image from "next/image";
import { SITE } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SiteFooter({ t }: { t: Dictionary }) {
  const f = t.landing.footer;

  return (
    <footer className="border-t border-line bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Image src="/brand/seal-96.png" alt="" width={48} height={48} className="size-12 rounded-full" />
          <div>
            <p className="font-bold">{SITE.name}</p>
            <p className="mt-1 max-w-[42ch] text-sm leading-5 text-ink-soft">
              {SITE.fullTitle}, {SITE.location}
            </p>
          </div>
        </div>
        <div className="flex max-w-[48ch] flex-col gap-2 text-sm leading-5 text-ink-soft md:text-right">
          <p>{f.privacy}</p>
          <p>{f.staff}</p>
          <p>{f.photos}</p>
        </div>
      </div>
    </footer>
  );
}
