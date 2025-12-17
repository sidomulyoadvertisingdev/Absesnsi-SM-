"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari backend
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://192.168.1.100:8000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil profil");

        const data = await res.json();
        setUser(data.data);
      } catch (e) {
        console.error(e);
        setUser(null);
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  // Logout function
  const logout = async () => {
    const token = localStorage.getItem("token") || "";

    try {
      await fetch("http://192.168.1.100:8000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error("Logout error:", e);
    }

    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f2537] text-white p-5 pb-24">

      <h1 className="text-xl font-semibold mb-4">Profil Pengguna</h1>

      {/* Card */}
      <div className="bg-[#113447] rounded-xl p-5 shadow-lg">
        {loading ? (
          <p className="text-gray-300">Memuat profil...</p>
        ) : user ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#ff8b50] flex items-center justify-center text-xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-300 text-sm">{user.email}</p>
                {user.phone && (
                  <p className="text-gray-300 text-sm">{user.phone}</p>
                )}
              </div>
            </div>

            {/* Informasi tambahan */}
            <div className="border-t border-gray-600 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">User ID</span>
                <span>{user.id}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full mt-5 bg-red-600 hover:bg-red-700 py-3 rounded-lg text-white font-semibold transition"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-yellow-400">Gagal mengambil data profil.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
