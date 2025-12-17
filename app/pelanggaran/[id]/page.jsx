"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function DetailPelanggaranPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch(
        `http://192.168.1.100:8000/api/violations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      setData(json.data || null);
    } catch (err) {
      console.error("Error load detail pelanggaran:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b3146] text-white flex flex-col">
      <div className="max-w-[420px] mx-auto p-4 w-full">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm px-3 py-1 bg-[#0f3b55] rounded"
        >
          ← Kembali
        </button>

        {/* LOADING */}
        {loading ? (
          <div className="text-gray-300">Memuat detail...</div>
        ) : !data ? (
          <div className="text-red-300">Data pelanggaran tidak ditemukan.</div>
        ) : (
          <div className="bg-[#113447] p-5 rounded-xl shadow-lg space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-red-300">
                  {data.type}
                </h1>
                <div className="text-xs text-gray-300 mt-1">
                  {new Date(data.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* STATUS */}
              {data.status && (
                <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300">
                  {data.status}
                </span>
              )}
            </div>

            {/* DESKRIPSI */}
            <div>
              <div className="text-sm text-gray-300 mb-1">
                Deskripsi Pelanggaran
              </div>
              <div className="text-gray-100 leading-relaxed">
                {data.description}
              </div>
            </div>

            {/* FOTO BUKTI */}
            {data.photo && (
              <div>
                <div className="text-sm text-gray-300 mb-2">
                  Bukti Pelanggaran
                </div>
                <img
                  src={`http://192.168.1.100:8000/storage/${data.photo}`}
                  alt="Bukti pelanggaran"
                  className="w-full rounded-lg border border-white/10"
                />
              </div>
            )}

            {/* HRD */}
            {data.hrd_name && (
              <div className="pt-3 border-t border-white/10 text-sm text-gray-300">
                Ditandatangani oleh HRD:
                <span className="ml-1 text-white font-medium">
                  {data.hrd_name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
