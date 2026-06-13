"use client";

import Swal from "sweetalert2";

export const MySwal = Swal.mixin({
  customClass: {
    confirmButton: "bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 mx-1 transition-colors text-sm",
    cancelButton: "bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 mx-1 transition-colors text-sm",
    popup: "rounded-2xl border border-slate-100 shadow-xl font-sans",
  },
  buttonsStyling: false,
});

export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  Toast.fire({
    icon,
    title
  });
};

export const showConfirm = async (title: string, text: string, confirmText = "Ya, Lanjutkan", cancelText = "Batal") => {
  return MySwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
};

export const showSuccess = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "Selesai",
  });
};

export const showError = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
  });
};
