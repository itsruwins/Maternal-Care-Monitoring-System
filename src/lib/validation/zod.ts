import { z } from "zod";

// The app's Content Security Policy has no 'unsafe-eval' (Phase 9). Zod 4
// otherwise probes `new Function` to speed up parsing, which the browser
// reports as a CSP violation. Import `z` from here, not from "zod", so this
// setting is always applied before any schema is used.
z.config({ jitless: true });

export { z };
