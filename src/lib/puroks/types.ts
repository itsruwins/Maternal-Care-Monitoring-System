// A purok people can choose (sign-up, profiles, registering a mother, filters).
export type PurokOption = { id: number; name: string };

// Cache tag for the shown-purok list; admin changes expire it right away.
export const PUROKS_CACHE_TAG = "puroks";
