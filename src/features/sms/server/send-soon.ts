import "server-only";
import { after } from "next/server";
import { runSender } from "./run-sender";

/**
 * Sends the texts due now (a staff answer or visit change just queued) once
 * the response is out, instead of waiting for the 5-minute run. It takes texts
 * the same way the schedule does, so a text is never sent twice; if anything
 * goes wrong, the text stays queued for the next run.
 */
export function sendSoon() {
  after(() => runSender({ checkStatus: false }).catch((error) => console.error("Instant SMS send failed", error)));
}
