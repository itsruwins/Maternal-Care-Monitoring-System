"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./pregnancy";

const subscribe = () => () => {};

/** Today's date (YYYY-MM-DD) in the browser; "" while pre-rendering on the server. */
export function useToday(): string {
  return useSyncExternalStore(subscribe, todayISO, () => "");
}
