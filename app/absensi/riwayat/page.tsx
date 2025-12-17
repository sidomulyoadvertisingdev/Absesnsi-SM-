"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

type Attendance = {
  id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
};

export default function RiwayatAbsensiPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Attendance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const BASE_API = process.env.NEXT_PUBLIC_API_URL;

      if (!BASE_API) {
        setError("NEXT_PUBLIC_API_URL tidak diset");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_API}/absensi/attendance/history`,
          {
            method: "GET",
            credentials: "include", // Sanctum
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setItems(json?.data ?? []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="px-5 py-6 pb-24 text-white">
      {/* HEADER */}
      <h1 className="text-xl font-semibold mb-1">
        Riwayat Absensi
      </h1>
      <p className="text-gray-300 text-sm mb-5">
        Catatan kehadiran kamu
      </p>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400 mt-10">
          Memuat data...
        </p>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-red-600/20 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && items.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Belum ada data absensi
        </p>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#1f3f5c] rounded-xl p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                {item.date}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "Hadir"
                    ? "bg-green-600/20 text-green-300"
                    : "bg-yellow-600/20 text-yellow-300"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Check In</p>
                <p>{item.check_in ?? "-"}</p>
              </div>
              <div>
                <p className="text-gray-400">Check Out</p>
                <p>{item.check_out ?? "-"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NAVBAR */}
      <BottomNav />
    </div>
  );
}
