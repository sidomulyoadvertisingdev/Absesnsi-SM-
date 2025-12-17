"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0f2f4a] text-white">

      {/* BACKGROUND CURVE */}
      <div className="absolute -top-40 -left-40 w-[150%] h-[70%] bg-[#294e6b] rounded-[50%]" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-20 pb-10">

        {/* HEADER TEXT */}
        <div className="mt-10">
          <p className="text-sm tracking-wide opacity-90">
            employee system
          </p>

          <h1 className="text-3xl font-bold mt-1">
            SM Advertising
          </h1>
        </div>

        {/* SPACER */}
        <div className="flex-grow" />

        {/* BUTTONS */}
        <div className="space-y-4">
          {/* LOGIN */}
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 rounded-lg bg-[#ff9b42] text-white font-semibold shadow-lg active:scale-95 transition"
          >
            Login
          </button>

          {/* SIGN UP */}
          <button
            onClick={() => router.push("/register")}
            className="w-full py-4 rounded-lg border border-[#ff9b42] text-[#ff9b42] font-semibold active:scale-95 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
