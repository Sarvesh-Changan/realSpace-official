import { redirect } from "next/navigation";

export default async function NewPricingOptionPage() {
  redirect("/admin/pricing");
}

