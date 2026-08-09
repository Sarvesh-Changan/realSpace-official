"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("__Host-next-auth.csrf-token");
  redirect("/admin/login");
}
