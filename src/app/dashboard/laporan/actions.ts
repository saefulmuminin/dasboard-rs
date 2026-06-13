"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// RLS memastikan user hanya bisa mengubah/hapus data unit-nya sendiri.
export async function submitLaporan(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("reports").update({ status: "submitted" }).eq("id", id);
  revalidatePath("/dashboard/laporan");
}

export async function hapusLaporan(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("reports").delete().eq("id", id);
  revalidatePath("/dashboard/laporan");
}
