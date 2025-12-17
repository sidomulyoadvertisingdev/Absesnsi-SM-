export async function logoutUser() {
  const token = localStorage.getItem("token") || "";

  try {
    // Kirim request logout ke backend
    await fetch("http://192.168.1.100:8000/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn("Logout error:", err);
  }

  // Hapus token
  localStorage.removeItem("token");
}
