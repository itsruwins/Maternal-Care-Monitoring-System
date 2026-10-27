import { notFound } from "next/navigation";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { getAccount } from "../queries/get-account";
import { AccountDetailView } from "./account-detail-view";

// /admin/accounts/[userId]: who it is, login & security actions, and the staff
// profile editor (mothers are managed in Phase 3). Reads the session.
export async function AccountDetailScreen({ params }: { params: Promise<{ userId: string }> }) {
  const me = await requireRole(["ADMIN"]);
  const { userId } = await params;
  const account = await getAccount(userId);
  if (!account) notFound();
  const { t, locale } = await getServerI18n();
  return <AccountDetailView t={t} locale={locale} account={account} isSelf={account.userId === me.id} />;
}
