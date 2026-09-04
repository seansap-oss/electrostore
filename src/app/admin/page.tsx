import { redirect } from "next/navigation";
import { getSession, isStaffRole } from "@/lib/auth";
import AdminLogin from "./AdminLogin";

export const metadata = { title: "Admin Sign In" };

export default async function AdminRoot({ searchParams }: { searchParams: { next?: string } }) {
  const s = await getSession();
  if (s && isStaffRole(s.role)) redirect(searchParams.next || "/admin/dashboard");
  return <AdminLogin next={searchParams.next} />;
}
