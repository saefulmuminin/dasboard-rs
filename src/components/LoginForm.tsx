"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { login, type LoginState } from "@/app/(auth)/login/actions";
import { showError } from "@/lib/swal";

const initial: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.error) {
      showError("Gagal Masuk", state.error);
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Email
        </label>
        <div className="relative mt-1.5">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            placeholder="email@rsudsofifi.go.id"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Kata Sandi
          </label>
          <Link
            href="/lupa-password"
            className="text-xs font-medium text-brand-600 transition hover:text-brand-700 hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-16 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="relative flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition-all duration-200 hover:bg-brand-700 hover:shadow-brand-700/20 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Memproses...</span>
          </div>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
