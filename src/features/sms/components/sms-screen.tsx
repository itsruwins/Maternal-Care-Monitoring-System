import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { getSendingPanel } from "../queries/sending-panel";
import type { SendingPanel } from "../types";
import { SendCard } from "./send-card";

// /admin/sms. Reads the session: render inside <Suspense>.
export async function SmsScreen() {
  await requireRole(["ADMIN"]);
  const [{ t }, panel] = await Promise.all([getServerI18n(), getSendingPanel()]);
  return <SmsView t={t} panel={panel} />;
}

// The page layout, without data loading (also used by the dev preview).
// Step 4 adds the counts, filters and the list of texts below the card.
export function SmsView({ t, panel }: { t: Dictionary; panel: SendingPanel }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{t.sms.title}</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">{t.sms.intro}</p>
      </div>
      <div className="max-w-2xl">
        <SendCard phoneOnline={panel.phoneOnline} phoneStatusAt={panel.phoneStatusAt} limitReachedAt={panel.limitReachedAt} />
      </div>
    </div>
  );
}
