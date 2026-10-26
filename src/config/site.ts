// App identity and health center details. Values starting with "PLACEHOLDER" show as "To be announced".
export const SITE = {
  name: "Taysan MaternaCare",
  fullTitle: "Maternal Care Monitoring System with SMS Reminder",
  location: "Barangay Taysan, Legazpi City",
  healthCenter: {
    address: "Brgy. 56 Taysan, Legazpi City",
    // Shown in the visitor's language. \u00a0 keeps the time range on one line.
    clinicHours: {
      en: "Mon–Fri, 8:00\u00a0AM\u00a0–\u00a03:00\u00a0PM",
      fil: "Lunes–Biyernes, 8:00\u00a0AM\u00a0–\u00a03:00\u00a0PM",
    },
    // PLACEHOLDER: replace with the real number (open item in docs/PLAN.md).
    contactNumber: "PLACEHOLDER: contact number",
  },
} as const;
