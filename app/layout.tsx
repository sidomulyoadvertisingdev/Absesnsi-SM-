import "./globals.css";

export const metadata = {
  title: "Workshop App",
  description: "Aplikasi Absensi Karyawan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="bg-[#0f2537] text-white">
      <head>
        {/* Material Icons */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body className="min-h-screen flex justify-center bg-[#0f2537] text-white">
        {/* Mobile Wrapper */}
        <div className="mobile-wrapper w-full max-w-[420px] min-h-screen px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
