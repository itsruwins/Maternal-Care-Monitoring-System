import { EmailIcon, LanguageIcon, LockIcon, PhoneIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";

const ICONS: { icon: Icon; tone: "mint" | "blush" | "beige" | "cream" }[] = [
  { icon: EmailIcon, tone: "mint" },
  { icon: PhoneIcon, tone: "blush" },
  { icon: LanguageIcon, tone: "beige" },
  { icon: LockIcon, tone: "mint" },
];

// Four plain facts right under the hero: what makes joining easy.
export function QuickFacts({ t }: { t: Dictionary }) {
  return (
    <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-5 px-4 py-12 min-[480px]:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-16">
      {t.landing.facts.map((fact, i) => (
        <li key={fact.title} className="flex items-start gap-3.5">
          <IconCircle icon={ICONS[i].icon} tone={ICONS[i].tone} weight="duotone" />
          <span className="flex flex-col pt-0.5">
            <span className="text-base leading-6 font-semibold">{fact.title}</span>
            <span className="text-sm leading-5 text-ink-soft">{fact.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
