"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://192.168.1.100:8000/api/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_or_phone: emailOrPhone,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json?.message || "Gagal login");
        setLoading(false);
        return;
      }

      const token = json.token;
      if (!token) {
        alert("Token tidak diterima dari server");
        setLoading(false);
        return;
      }

      // simpan token
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f2537] flex justify-center">
      {/* MOBILE WRAPPER */}
      <div className="w-full max-w-[420px] min-h-screen flex flex-col relative overflow-hidden">

        {/* HERO IMAGE */}
        <div className="relative h-[38%] w-full">
          <Image
            src="/images/login-hero.jpg"
            alt="Login Hero"
            fill
            priority
            className="object-cover"
          />
          {/* CURVE OVERLAY */}
          <div className="absolute bottom-0 w-full h-24 bg-[#143b56] rounded-t-[120px]" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-[#143b56] px-6 pt-6 pb-10">
          {/* TITLE */}
          <h1 className="text-2xl font-bold text-center text-white">
            Welcome Back
          </h1>
          <p className="text-center text-sm text-gray-300 mt-1">
            Login to your account
          </p>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-8 bg-[#1a4764] rounded-2xl px-5 py-6 shadow-xl"
          >
            {/* USERNAME */}
            <label className="text-sm text-gray-300">Username</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="mt-1 w-full rounded-md px-3 py-2 bg-gray-100 text-black focus:outline-none"
            />

            {/* PASSWORD */}
            <label className="text-sm text-gray-300 mt-4 block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md px-3 py-2 bg-gray-100 text-black focus:outline-none pr-10"
              />
              <span className="absolute right-3 top-3 text-gray-500 material-icons text-lg">
                visibility_off
              </span>
            </div>

            {/* OPTIONS */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="accent-orange-400" />
                Remember me
              </label>
              <span className="text-orange-400 cursor-pointer">
                Forgot Password
              </span>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="mt-6 w-full py-3 rounded-md bg-[#ff9b43] text-white font-semibold tracking-wide hover:opacity-90 transition"
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            {/* FOOTER */}
            <p className="text-center text-sm text-gray-300 mt-5">
              Don’t have account?{" "}
              <span className="text-white font-semibold cursor-pointer">
                Sign Up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
