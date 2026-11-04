import { cn } from "@/lib/utils/cn";

/** First and last initials of a name ("Ana Marie Bautista" → "AB"). */
export function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// Her initials on a blush circle (the mother tint): 40px in lists, 64px on her record.
export function MotherInitials({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-blush font-bold text-rose-deep",
        size === "lg" ? "size-14 text-lg tracking-[0.02em] sm:size-16 sm:text-xl" : "size-10 text-sm",
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
