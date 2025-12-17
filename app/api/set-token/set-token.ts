import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const response = NextResponse.json({ success: true });

  // Set cookie menggunakan server → middleware bisa membaca!
  response.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
  });

  return response;
}
