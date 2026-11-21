// App identity and health center details. Values starting with "PLACEHOLDER" show as "To be announced".
export const SITE = {
  name: "Taysan MaternaCare",
  fullTitle: "Maternal Care Monitoring System with SMS Reminder",
  location: "Barangay Taysan, Legazpi City",
  healthCenter: {
    address: "Brgy. 56 Taysan, Legazpi City",
    // Shown in the visitor's language. \u00a0 and \u2060 (after the dash) keep
    // the time range on one line.
    clinicHours: {
      en: "Mon–Fri, 8:00\u00a0AM\u00a0–\u2060\u00a03:00\u00a0PM",
      fil: "Lunes–Biyernes, 8:00\u00a0AM\u00a0–\u2060\u00a03:00\u00a0PM",
    },
    //   keeps the number on one line.
    contactNumber: "0927 168 3301",
  },
} as const;

/** True for a value that hasn't been provided yet (shown as "To be announced"). */
export const isPlaceholder = (value: string) => value.startsWith("PLACEHOLDER");
