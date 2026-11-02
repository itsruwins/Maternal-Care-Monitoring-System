import type { Dictionary } from "@/i18n/get-dictionary";

// Paper only, after the report: "Prepared by" over the staff member's name and
// position, and a blank "Noted by" to sign.
export function PrintFooter({ t, preparer }: { t: Dictionary; preparer: { name: string; position: string | null } }) {
  const p = t.reports.print;
  return (
    <footer data-print-keep className="mt-10 hidden grid-cols-2 gap-12 text-sm print:grid">
      <div>
        <p>{p.preparedBy}</p>
        <div className="mt-10 border-t border-ink pt-1">
          <p className="font-semibold">{preparer.name}</p>
          {preparer.position && <p>{preparer.position}</p>}
        </div>
      </div>
      <div>
        <p>{p.notedBy}</p>
        <div className="mt-10 border-t border-ink pt-1">
          <p aria-hidden>&nbsp;</p>
          <p>{p.nameAndPosition}</p>
        </div>
      </div>
    </footer>
  );
}
