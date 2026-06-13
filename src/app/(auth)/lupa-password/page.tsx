"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { showSuccess, showError } from "@/lib/swal";
import AuthCard from "@/components/AuthCard";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (error) {
      showError("Gagal Mengirim", error.message);
    } else {
      showSuccess(
        "Tautan Dikirim",
        "Jika email terdaftar, tautan reset kata sandi telah dikirim. Silakan periksa kotak masuk atau spam email Anda."
      );
      setEmail("");
    }
  }

  return (
    <AuthCard>
      <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lupa Kata Sandi</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Masukkan email terdaftar Anda untuk mendapatkan tautan atur ulang kata sandi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email Terdaftar
          </label>
          <div className="relative mt-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              ✉️
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              placeholder="email@rsudsofifi.go.id"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all duration-200 hover:bg-brand-700 hover:shadow-brand-700/20 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Mengirim...</span>
            </div>
          ) : (
            "Kirim Tautan Reset"
          )}
        </button>

        <p className="text-center text-sm font-medium">
          <Link href="/login" className="text-brand-600 hover:text-brand-700 hover:underline">
            Kembali ke login
          </Link>
        </p>
      </form>
      </div>
    </AuthCard>
  );
}
