// The icon keys a service (activity type) can have (migration 0010). Labels
// live in the dictionary (serviceIcons.*); the art is in
// components/shared/service-art.tsx.
export const SERVICE_ICONS = [
  "checkup",
  "vaccine",
  "supplement",
  "lab",
  "education",
  "heartbeat",
  "baby",
  "heart",
  "nutrition",
  "dental",
  "blood",
  "counseling",
] as const;

export type ServiceIconKey = (typeof SERVICE_ICONS)[number];

export function toServiceIcon(value: string | null | undefined): ServiceIconKey {
  return (SERVICE_ICONS as readonly string[]).includes(value ?? "") ? (value as ServiceIconKey) : "checkup";
}
