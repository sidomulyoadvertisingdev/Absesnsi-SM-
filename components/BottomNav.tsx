"use client";

import { usePathname } from "next/navigation";

const menu = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Riwayat", href: "/absensi/riwayat", icon: "history" },
  { label: "Lembur", href: "/lembur", icon: "timer" },
  { label: "Profil", href: "/profil", icon: "person" },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[420px] w-full bg-[#1b3a57] border-t border-[#2b4a63] py-2 flex justify-around">
      {menu.map((m) => (
        <a
          key={m.href}
          href={m.href}
          className={`flex flex-col items-center text-xs transition ${
            path === m.href
              ? "text-orange-400"
              : "text-gray-300 hover:text-orange-300"
          }`}
        >
          <span className="material-icons text-lg">{m.icon}</span>
          {m.label}
        </a>
      ))}
    </div>
  );
}
