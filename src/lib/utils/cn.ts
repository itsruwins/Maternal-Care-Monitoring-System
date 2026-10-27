import { createCn } from "cn/config";

// Merge Tailwind class names, letting later classes win (shadcn's official
// "cn" package). Our own text-size tokens (text-caption, text-title,
// text-display in globals.css) are registered as font sizes; otherwise the
// merger would treat them as text colours and drop them when a colour class
// like text-leaf follows (chips used to render at 16px instead of 12px).
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["caption", "title", "display"] }] } },
});
