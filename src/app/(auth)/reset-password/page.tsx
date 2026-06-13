"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showSuccess, showError } from "@/lib/swal";
import AuthCard from "@/components/AuthCard";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (pw.length < 6) {
      showError("Sandi Terlalu Pendek", "Kata sandi minimal terdiri dari 6 karakter.");
      return;
    }
    if (pw !== pw2) {
      showError("Sandi Tidak Cocok", "Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);

    if (error) {
      const errMsg = error.message.toLowerCase().includes("session")
        ? "Sesi reset tidak valid atau telah kedaluwarsa. Silakan minta tautan baru."
        : error.message;
      showError("Gagal Mengubah Sandi", errMsg);
      return;
    }

    showSuccess("Sandi Diperbarui", "Kata sandi Anda berhasil diperbarui. Mengalihkan ke dashboard...");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <AuthCard>
      <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kata Sandi Baru</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Buat kata sandi baru yang kuat dan mudah Anda ingat.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Kata Sandi Baru
          </label>
          <div className="relative mt-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              🔒
            </span>
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPw ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative mt-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              🔒
            </span>
            <input
              type={showPw2 ? "text" : "password"}
              required
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw2(!showPw2)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPw2 ? "👁️" : "👁️‍🗨️"}
            </button>
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
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan Kata Sandi"
          )}
        </button>
      </form>
      </div>
    </AuthCard>
  );
}
