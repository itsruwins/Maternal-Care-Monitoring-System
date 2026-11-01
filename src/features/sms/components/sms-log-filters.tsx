import { UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { FiltersDisclosure } from "@/features/mothers/components/filters-disclosure";
import type { Dictionary } from "@/i18n/get-dictionary";
import { SMS_LOG_PATH } from "../paths";
import type { SmsLogFilters, SmsLogStatus, SmsLogType } from "../types";

const STATUSES: SmsLogStatus[] = ["waiting", "sent", "delivered", "failed", "skipped"];
const TYPES: SmsLogType[] = ["reminder", "missed", "answer"];

// Search + status + type + date range. A plain GET form: the filters live in
// the address, so they survive a refresh and the count tiles can set them.
export function SmsLogFiltersForm({ t, filters }: { t: Dictionary; filters: SmsLogFilters }) {
  const l = t.sms.log;
  const s = l.search;
  const extraFilters = [filters.status, filters.type, filters.from, filters.to].filter(Boolean).length;
  const hasFilters = Boolean(filters.q) || extraFilters > 0;

  return (
    <form method="get" action={SMS_LOG_PATH} className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 sm:p-5 xl:grid-cols-4 xl:items-end">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="sms-q">{s.label}</Label>
        <InputIcon icon={UserIcon}>
          <Input id="sms-q" name="q" defaultValue={filters.q} placeholder={s.placeholder} className="pl-11" />
        </InputIcon>
      </div>
      <FiltersDisclosure label={s.filters} active={extraFilters}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sms-status">{s.status}</Label>
          <NativeSelect id="sms-status" name="status" defaultValue={filters.status}>
            <option value="">{s.anyStatus}</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {l.statusFilter[status]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sms-type">{s.type}</Label>
          <NativeSelect id="sms-type" name="type" defaultValue={filters.type}>
            <option value="">{s.anyType}</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {l.typeFilter[type]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sms-from">{s.from}</Label>
          <Input id="sms-from" name="from" type="date" defaultValue={filters.from} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sms-to">{s.to}</Label>
          <Input id="sms-to" name="to" type="date" defaultValue={filters.to} />
        </div>
      </FiltersDisclosure>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" className="h-12 flex-1 xl:flex-none xl:px-8">
          {s.submit}
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" className="h-12">
            <a href={SMS_LOG_PATH}>{s.clear}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
