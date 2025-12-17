"use client";

import { useEffect, useState } from "react";
import SummaryCard from "@/components/SummaryCard";
import BottomNav from "@/components/BottomNav";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    hadir: 0,
    terlambat: 0,
    izin: 0,
  });

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const BASE_API = process.env.NEXT_PUBLIC_API_URL;

      if (!BASE_API) {
        console.error("NEXT_PUBLIC_API_URL is undefined");
        setLoading(false);
        return;
      }

      const apiUrl = `${BASE_API}/absensi/dashboard/stats`;

      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          credentials: "include", // Sanctum
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          console.error("Dashboard fetch error:", res.status);
          setLoading(false);
          return;
        }

        const json = await res.json();

        setSummary({
          hadir: json?.attendance?.month?.hadir ?? 0,
          terlambat: json?.attendance?.month?.terlambat ?? 0,
          izin: json?.attendance?.month?.izin ?? 0,
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="px-5 py-8 relative text-white">
      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm shadow-lg"
      >
        <span className="material-icons text-sm">logout</span>
        Logout
      </button>

      {/* HEADER */}
      <h1 className="text-xl font-semibold tracking-wide">
        Dashboard Absensi
      </h1>
      <p className="text-gray-300 text-sm mt-1">
        Selamat datang kembali 👋
      </p>

      {/* SUMMARY */}
      <div className="flex items-center gap-2 mt-6 mb-2">
        <span className="material-icons text-orange-400 text-lg">
          insights
        </span>
        <span className="text-white">Ringkasan Bulan Ini</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Hadir" value={loading ? "-" : summary.hadir} />
        <SummaryCard label="Terlambat" value={loading ? "-" : summary.terlambat} />
        <SummaryCard label="Izin" value={loading ? "-" : summary.izin} />
      </div>

      {/* AKSI CEPAT */}
      <div className="flex items-center gap-2 mt-8">
        <span className="material-icons text-orange-400 text-lg">
          flash_on
        </span>
        <span className="text-white">Aksi Cepat</span>
      </div>

      {/* ✅ AKSI CEPAT (FINAL) */}
      <div className="grid grid-cols-2 gap-4 mt-3">
        {/* ABSEN */}
        <a
          href="/absensi"
          className="bg-[#2a4d6f] p-4 rounded-xl text-center hover:bg-[#31597f] transition shadow-md"
        >
          <span className="material-icons text-[#FF7F50] text-3xl">
            how_to_reg
          </span>
          <p className="mt-2 text-sm font-medium">
            Absen
          </p>
        </a>

        {/* PELANGGARAN */}
        <a
          href="/pelanggaran"
          className="bg-[#2a4d6f] p-4 rounded-xl text-center hover:bg-[#31597f] transition shadow-md"
        >
          <span className="material-icons text-[#FF7F50] text-3xl">
            warning
          </span>
          <p className="mt-2 text-sm font-medium">
            Pelanggaran
          </p>
        </a>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}
