import { redirect } from "next/navigation";

// The admin tools live under /admin/...; the admin's home is the staff home.
export default function AdminIndexPage() {
  redirect("/admin/accounts");
}
