"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function PelanggaranPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch("http://192.168.1.100:8000/api/violations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error("Error load pelanggaran:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b3146] text-white flex flex-col">
      <div className="max-w-[420px] mx-auto p-4 w-full">

        {/* HEADER */}
        <h1 className="text-xl font-semibold mb-4">
          Daftar Pelanggaran
        </h1>

        {/* CONTENT */}
        {loading ? (
          <div className="text-gray-300">Memuat data...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-400 text-center">
            Tidak ada pelanggaran dari HRD.
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((v) => (
              <Link
                key={v.id}
                href={`/pelanggaran/${v.id}`}
                className="block bg-[#113447] p-4 rounded-xl shadow hover:bg-[#164a5f] transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    {/* Jenis */}
                    <div className="font-semibold text-red-300">
                      {v.type}
                    </div>

                    {/* Tanggal */}
                    <div className="text-xs text-gray-300 mt-1">
                      {new Date(v.created_at).toLocaleDateString("id-ID")}
                    </div>

                    {/* Deskripsi singkat */}
                    <div className="text-sm text-gray-200 mt-1 line-clamp-2">
                      {v.description}
                    </div>
                  </div>

                  <span className="material-icons text-gray-300">
                    chevron_right
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
