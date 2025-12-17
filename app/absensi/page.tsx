"use client";

import { useEffect, useState, useRef } from "react";
import BottomNav from "@/components/BottomNav";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [shift, setShift] = useState(null);
  const [loadingShift, setLoadingShift] = useState(true);

  // Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photoData, setPhotoData] = useState(null);

  // === AUTO FULL BODY DETECT ===
const detectIntervalRef = useRef(null);
const autoCapturedRef = useRef(false);
const [frameOk, setFrameOk] = useState(false);


  // Location
  const [coords, setCoords] = useState(null);
  const [addressLabel, setAddressLabel] = useState("Mengambil lokasi...");
  const [watchId, setWatchId] = useState(null);

  // Action
  const [currentAction, setCurrentAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  /* ============================
     HYDRATION FIX
  ============================ */
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [mounted]);

  /* ============================
     LOAD WORK SCHEDULE
  ============================ */
  useEffect(() => {
    if (!mounted) return;

    const loadSchedule = async () => {
      setLoadingShift(true);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://192.168.1.100:8000/api/me/work-schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        setShift(json.data ?? null);
      } catch (e) {
        console.error("Jadwal error:", e);
      }
      setLoadingShift(false);
    };

    loadSchedule();
  }, [mounted]);

  /* ============================
     CAMERA + REALTIME GPS
  ============================ */
  const openCameraAndLocation = async () => { if (videoRef.current) {
  videoRef.current.onloadedmetadata = () => {
    startAutoDetect();
  };
}

    // CAMERA
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      alert("Tidak dapat mengakses kamera.");
    }

    // REALTIME GPS
    if ("geolocation" in navigator) {
      const id = navigator.geolocation.watchPosition(
        (p) => {
          setCoords({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
          });

          setAddressLabel(`Lokasi akurat (±${Math.round(p.coords.accuracy)}m)`);
        },
        () => {
          setAddressLabel("Lokasi tidak diizinkan");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      setWatchId(id);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);

    clearInterval(detectIntervalRef.current);
setFrameOk(false);


    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoData(canvas.toDataURL("image/jpeg", 0.85));

    stopCamera();
  };


  const startAutoDetect = () => {
  autoCapturedRef.current = false;
  clearInterval(detectIntervalRef.current);

  detectIntervalRef.current = setInterval(() => {
    if (!videoRef.current || autoCapturedRef.current) return;
    if (videoRef.current.readyState !== 4) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // FRAME AREA (FULL BODY)
    const fw = canvas.width * 0.6;
    const fh = canvas.height * 0.85;
    const fx = (canvas.width - fw) / 2;
    const fy = (canvas.height - fh) / 2;

    // DETEKSI ATAS & BAWAH BADAN
    const top = ctx.getImageData(fx, fy, fw, 5).data;
    const bottom = ctx.getImageData(fx, fy + fh - 5, fw, 5).data;

    let hit = 0;
    for (let i = 0; i < top.length; i += 4) {
      if (
        top[i] + top[i + 1] + top[i + 2] < 650 &&
        bottom[i] + bottom[i + 1] + bottom[i + 2] < 650
      ) {
        hit++;
      }
    }

    if (hit > 40) {
      setFrameOk(true);
      autoCapturedRef.current = true;
      capturePhoto(); // AUTO FOTO
    } else {
      setFrameOk(false);
    }
  }, 700);
};

  const handleAction = async (type) => {
    setCurrentAction(type);
    setPhotoData(null);
    setCoords(null);
    setAddressLabel("Mengambil lokasi...");

    await openCameraAndLocation();

    document.getElementById("camera-panel")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ============================
     SUBMIT ABSENSI (FIXED 404)
  ============================ */
  const submitAttendance = async () => {
    if (!currentAction) return alert("Pilih aksi dulu.");
    if (!photoData) return alert("Ambil foto dulu.");
    if (!coords) return alert("Lokasi belum tersedia.");

    let endpoint = "";

    if (currentAction === "checkin") endpoint = "attendance/check-in";
    if (currentAction === "checkout") endpoint = "attendance/check-out";
    if (currentAction === "break_start") endpoint = "attendance/break-start";
    if (currentAction === "break_end") endpoint = "attendance/break-end";

    if (!endpoint) return alert("Aksi tidak dikenali.");

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch(`http://192.168.1.100:8000/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy: coords.accuracy,
          photo: photoData,
          notes,
          shift,
        }),
      });

      const json = await res.json();
      alert(json.message || "Absensi berhasil");

      setCurrentAction(null);
      setPhotoData(null);
      setCoords(null);
    } catch {
      alert("Gagal menyimpan absensi.");
    }

    stopCamera();
    setSubmitting(false);
  };

  /* ============================
     TIME FORMATTER
  ============================ */
  const fmtTime = (d) =>
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (!mounted)
    return (
      <div className="min-h-screen bg-[#0b3146] text-white flex items-center justify-center">
        Memuat...
      </div>
    );

  /* ============================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-[#0b3146] text-white flex flex-col">
      <div className="p-4 max-w-[420px] mx-auto">
        
        <button onClick={() => history.back()} className="mb-3 text-sm px-3 py-1 bg-[#0f3b55] rounded">
          ← Kembali
        </button>

        {/* CLOCK CARD */}
        <div className="bg-[#113447] rounded-xl p-6 shadow-lg space-y-4">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-[#ff8b50]">{fmtTime(now)}</div>
            <div className="text-sm text-gray-300">
              {now.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* SHIFT CARD */}
          {loadingShift ? (
            <div className="text-gray-300 text-center">Memuat jadwal...</div>
          ) : shift ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f3b55] p-3 rounded-lg shadow">
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <span className="material-icons text-lg">schedule</span>
                  Jam Kerja
                </div>
                <div className="text-xl font-bold mt-1 text-white">
                  {shift.start_time} — {shift.end_time}
                </div>
              </div>

              <div className="bg-[#0f3b55] p-3 rounded-lg shadow">
                <div className="flex items-center gap-2 text-yellow-300 text-sm">
                  <span className="material-icons text-lg">restaurant</span>
                  Istirahat
                </div>
                <div className="text-xl font-bold mt-1 text-white">
                  {shift.break_start ?? "-"} — {shift.break_end ?? "-"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-yellow-300 text-center">Jadwal kerja belum diatur admin.</div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            ["checkin", "login", "Check-in"],
            ["checkout", "logout", "Check-out"],
            ["break_start", "free_breakfast", "Mulai Istirahat"],
            ["break_end", "restaurant", "Selesai Istirahat"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => handleAction(key)}
              className={`flex items-center gap-2 justify-center py-3 rounded-lg ${
                currentAction === key ? "bg-[#ff8b50]" : "bg-[#164a5f]"
              }`}
            >
              <span className="material-icons text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* CAMERA PANEL */}
        <div id="camera-panel" className="mt-6 bg-[#0f3b55] p-4 rounded-lg">
          <div className="text-sm text-gray-200 mb-2">Foto Selfie</div>

          <div className="relative w-full h-56 bg-[#0b1f2a] rounded overflow-hidden">
  {!photoData ? (
    <>
      {/* VIDEO CAMERA */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* FRAME DETEKSI FULL BADAN */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[60%] h-[85%] border-2 rounded-lg transition-colors duration-300 ${
            frameOk ? "border-green-500" : "border-yellow-400"
          }`}
        />
      </div>
    </>
  ) : (
    <img src={photoData} className="w-full h-full object-cover" />
  )}
</div>


          {!photoData ? (
            <div className="mt-3 flex gap-2">
              <button onClick={capturePhoto} className="flex-1 py-2 rounded bg-green-600 text-white">
                Ambil Foto
              </button>
              <button onClick={stopCamera} className="py-2 px-3 rounded bg-gray-600 text-white">
                Tutup Kamera
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button onClick={() => setPhotoData(null)} className="flex-1 py-2 rounded bg-yellow-500">
                Foto Ulang
              </button>
              <button onClick={() => setPhotoData(null)} className="py-2 px-3 rounded bg-gray-600 text-white">
                Hapus
              </button>
            </div>
          )}

          {/* GPS CARD */}
          <div className="mt-4 text-sm">
            <div className="mb-2">Lokasi GPS Realtime</div>
            <div className="bg-[#07242f] p-3 rounded">
              <div className="text-xs text-gray-300">Koordinat</div>
              <div className="font-medium">
                {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "-"}
              </div>
              <div className="text-xs mt-1 text-gray-400">{addressLabel}</div>
            </div>
          </div>

          {/* NOTES */}
          <div className="mt-4">
            <label className="text-sm">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full p-3 rounded bg-[#07242f] text-white"
              placeholder="Tambahkan catatan..."
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={submitAttendance}
              disabled={submitting}
              className="flex-1 py-3 rounded bg-[#ff8b50] disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : `Simpan Absensi (${currentAction ?? "-"})`}
            </button>

            <button
              onClick={() => {
                setCurrentAction(null);
                setPhotoData(null);
                stopCamera();
              }}
              className="py-3 px-4 rounded bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Note: Foto & lokasi realtime akan disertakan sebagai bukti absensi.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
