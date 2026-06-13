"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function setStatus(id: number, status: "approved" | "rejected") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // RLS memastikan hanya role 'mutu' yang boleh.
  await supabase
    .from("reports")
    .update({ status, reviewed_by: user?.id ?? null })
    .eq("id", id);
  revalidatePath("/dashboard/verifikasi");
}

export async function approveLaporan(formData: FormData) {
  await setStatus(Number(formData.get("id")), "approved");
}

export async function rejectLaporan(formData: FormData) {
  await setStatus(Number(formData.get("id")), "rejected");
}
