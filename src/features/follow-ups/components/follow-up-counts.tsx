import { CallIcon, CheckCircleIcon, ClockIcon, ReminderIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addDays } from "@/lib/utils/pregnancy";
import { OVER_A_WEEK_DAYS } from "../constants";
import { followUpsHref, NO_FOLLOW_UP_FILTERS } from "../paths";
import type { FollowUpHubCounts } from "../types";

// The four counts above the Follow-ups page, each opening the list behind
// it: still to follow up, not contacted yet, missed over a week ago (the one
// that turns rose: marking everything urgent would hide what is), and sorted
// out this week (the Closed tab).
export function FollowUpCounts({ t, counts, today }: { t: Dictionary; counts: FollowUpHubCounts; today: string }) {
  const h = t.followUps.hub;
  return (
    <CountCards
      label={h.label}
      cards={[
        { key: "open", label: h.open, count: counts.open, href: followUpsHref(NO_FOLLOW_UP_FILTERS), icon: CallIcon },
        { key: "notContacted", label: h.notContacted, count: counts.notContacted, href: followUpsHref(NO_FOLLOW_UP_FILTERS, { tried: "no" }), icon: ReminderIcon },
        {
          key: "overWeek",
          label: h.overWeek,
          count: counts.overWeek,
          href: followUpsHref(NO_FOLLOW_UP_FILTERS, { to: addDays(today, -(OVER_A_WEEK_DAYS + 1))! }),
          icon: ClockIcon,
          alert: counts.overWeek > 0,
        },
        { key: "sorted", label: h.sortedThisWeek, count: counts.sortedThisWeek, href: followUpsHref(NO_FOLLOW_UP_FILTERS, { tab: "closed" }), icon: CheckCircleIcon },
      ]}
    />
  );
}
