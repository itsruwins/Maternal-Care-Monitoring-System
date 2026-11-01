// SMS text rules: plain characters only (GSM-7), at most 2 texts long.
// A plain text holds 160 characters; split in two, each part holds 153.

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
// These take two characters' room each.
const GSM_EXTENDED = "^{}\\[~]|€\f";

const ONE_TEXT = 160;
const PART = 153;
export const MAX_PARTS = 2;

export type TextCheck = { ok: true; parts: number } | { ok: false; reason: "too_long" | "bad_characters" };

/** Whether a text can be sent as plain SMS, and in how many parts. */
export function checkSmsText(text: string): TextCheck {
  let length = 0;
  for (const char of text) {
    if (GSM_BASIC.includes(char)) length += 1;
    else if (GSM_EXTENDED.includes(char)) length += 2;
    else return { ok: false, reason: "bad_characters" };
  }
  const parts = length <= ONE_TEXT ? 1 : Math.ceil(length / PART);
  return parts <= MAX_PARTS ? { ok: true, parts } : { ok: false, reason: "too_long" };
}

/** "09171234567" → "+639171234567"; null for anything else. */
export function toInternational(mobile: string): string | null {
  return /^09\d{9}$/.test(mobile) ? `+63${mobile.slice(1)}` : null;
}
