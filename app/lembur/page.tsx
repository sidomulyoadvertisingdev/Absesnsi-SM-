"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";

type OvertimeStatus = "none" | "pending" | "approved" | "finished";

export default function OvertimePage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  /* ================= STATE ================= */
  const [status, setStatus] = useState<OvertimeStatus>("none");
  const [overtimeId, setOvertimeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // CAMERA
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    if (!API) return;

    try {
      const res = await fetch(`${API}/overtime/today`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const json = await res.json();

      if (!json.data) {
        setStatus("none");
        return;
      }

      setStatus(json.data.status);
      setOvertimeId(json.data.id);
    } catch (e) {
      console.error(e);
    }
  };

  /* ================= CAMERA ================= */
  const openCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    setStream(s);
    setCameraOpen(true);
    if (videoRef.current) videoRef.current.srcObject = s;
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  };

  /* ================= ACTIONS ================= */
  const startOvertime = async () => {
    if (!photo) return alert("Ambil foto terlebih dahulu");

    setLoading(true);
    const res = await fetch(`${API}/overtime/start`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return alert(json.message);
    setStatus("pending");
    setPhoto(null);
  };

  const finishOvertime = async () => {
    if (!photo || !overtimeId) return alert("Foto wajib diambil");

    setLoading(true);
    const res = await fetch(`${API}/overtime/finish`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: overtimeId, photo }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return alert(json.message);
    setStatus("finished");
    setPhoto(null);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0b3146] text-white flex flex-col">
      <div className="p-5 max-w-[450px] mx-auto w-full">

        <h2 className="text-xl font-bold mb-4">Lembur</h2>

        {/* STATUS INFO */}
        <div className="mb-4 text-sm">
          Status:
          <span className="ml-2 font-semibold">
            {status === "none" && "Belum lembur"}
            {status === "pending" && "Menunggu ACC Admin"}
            {status === "approved" && "Disetujui - Sedang Lembur"}
            {status === "finished" && "Lembur Selesai"}
          </span>
        </div>

        {/* CAMERA */}
        {(status === "none" || status === "approved") && (
          <div className="bg-[#113447] p-4 rounded mb-4">
            {cameraOpen && (
              <video ref={videoRef} autoPlay className="w-full h-64 rounded" />
            )}

            {!cameraOpen && photo && (
              <img src={photo} className="w-full h-64 rounded" />
            )}

            <canvas ref={canvasRef} className="hidden" />

            {!photo && !cameraOpen && (
              <button onClick={openCamera} className="w-full bg-blue-500 py-2 rounded">
                Buka Kamera
              </button>
            )}

            {cameraOpen && (
              <button onClick={takePhoto} className="w-full bg-green-500 py-2 rounded">
                Ambil Foto
              </button>
            )}
          </div>
        )}

        {/* ACTION BUTTON */}
        {status === "none" && (
          <button
            onClick={startOvertime}
            disabled={loading}
            className="w-full bg-[#ff8b50] py-3 rounded"
          >
            Mulai Lembur
          </button>
        )}

        {status === "pending" && (
          <div className="text-center text-yellow-400">
            Menunggu persetujuan admin...
          </div>
        )}

        {status === "approved" && (
          <button
            onClick={finishOvertime}
            disabled={loading}
            className="w-full bg-red-500 py-3 rounded"
          >
            Checkout Lembur
          </button>
        )}

        {status === "finished" && (
          <div className="text-center text-green-400">
            Lembur hari ini telah selesai ✅
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
